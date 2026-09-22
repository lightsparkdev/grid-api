import Foundation
import AppKit
import PDFKit

guard CommandLine.arguments.count == 2 || CommandLine.arguments.count == 3 else {
  fputs("usage: verify-pdf.swift <pdf> [screenshot.png]\n", stderr)
  exit(2)
}

let path = CommandLine.arguments[1]
guard let document = PDFDocument(url: URL(fileURLWithPath: path)) else {
  fputs("could not open PDF\n", stderr)
  exit(1)
}
guard document.pageCount == 1 else {
  fputs("expected one page, got \(document.pageCount)\n", stderr)
  exit(1)
}

let text = (0..<document.pageCount)
  .compactMap { document.page(at: $0)?.string }
  .joined(separator: "\n")

let variant = ProcessInfo.processInfo.environment["VERIFY_VARIANT"] ?? "consumer"
var required = [
  "September statement",
  "Total fees for period",
  "This account is held at Lead Bank",
]
if variant == "commercial" {
  required.append("Commercial account")
} else {
  required.append("Blue Bottle Coffee · Los Angeles, CA")
  required.append("In case of errors or questions about your electronic transfers")
}

for requiredText in required {
  guard text.contains(requiredText) else {
    fputs("missing PDF text: \(requiredText)\n", stderr)
    exit(1)
  }
}

var forbidden = [
  "aurora-september-statement",
  "grid-statements-demo.vercel.app",
  "127.0.0.1:4003",
  "1/1",
  "456 S Spring St",
  "In Case of Errors or Questions About Your Electronic Transfers",
]
if variant == "commercial" {
  forbidden.append("In case of errors or questions about your electronic transfers")
}

for forbiddenText in forbidden {
  guard !text.contains(forbiddenText) else {
    fputs("forbidden PDF text found: \(forbiddenText)\n", stderr)
    exit(1)
  }
}

let browserDate: NSRegularExpression
do {
  browserDate = try NSRegularExpression(
    pattern: #"\b\d{1,2}/\d{1,2}/\d{2},\s+\d{1,2}:\d{2}\s+[AP]M\b"#
  )
} catch {
  fputs("could not compile browser-date check\n", stderr)
  exit(1)
}
let range = NSRange(text.startIndex..<text.endIndex, in: text)
guard browserDate.firstMatch(in: text, range: range) == nil else {
  fputs("browser date header found in PDF\n", stderr)
  exit(1)
}

if CommandLine.arguments.count == 3 {
  guard
    let page = document.page(at: 0),
    let tiff = page.thumbnail(of: NSSize(width: 1224, height: 1584), for: .mediaBox)
      .tiffRepresentation,
    let bitmap = NSBitmapImageRep(data: tiff),
    let png = bitmap.representation(using: .png, properties: [:])
  else {
    fputs("could not render PDF screenshot\n", stderr)
    exit(1)
  }
  do {
    try png.write(to: URL(fileURLWithPath: CommandLine.arguments[2]))
  } catch {
    fputs("could not write PDF screenshot\n", stderr)
    exit(1)
  }
}

print("pages=1")
print("text-characters=\(text.count)")
print("browser-chrome=none")
