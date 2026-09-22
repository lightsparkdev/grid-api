import Foundation
import PDFKit

guard CommandLine.arguments.count == 2 else {
  fputs("usage: verify-pdf.swift <pdf>\n", stderr)
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

for required in [
  "September statement",
  "Total fees for period",
  "In Case of Errors or Questions About Your Electronic Transfers",
  "This account is held at Lead Bank",
] {
  guard text.contains(required) else {
    fputs("missing PDF text: \(required)\n", stderr)
    exit(1)
  }
}

for forbidden in [
  "aurora-september-statement",
  "grid-statements-demo.vercel.app",
  "127.0.0.1:4003",
  "1/1",
] {
  guard !text.contains(forbidden) else {
    fputs("browser chrome found in PDF: \(forbidden)\n", stderr)
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

print("pages=1")
print("text-characters=\(text.count)")
print("browser-chrome=none")
