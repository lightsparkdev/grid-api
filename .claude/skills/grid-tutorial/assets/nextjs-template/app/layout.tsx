import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grid demo",
  description: "Hands-on Grid API tutorial",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
