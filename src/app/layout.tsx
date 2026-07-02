import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smile Link Content Studio",
  description:
    "Internal content management system for Smile Link Dental Laboratory.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
