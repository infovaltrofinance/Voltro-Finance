// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Valtro Trust Finance | Banking for the Bold",
  description: "Bank with confidence. Government-protected deposits up to $250,000 per account holder. Open an account in minutes.",
  keywords: "banking, finance, savings account, high interest, Australian bank, FCS protected",
  authors: [{ name: "Valtro Trust Finance" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white">
        {children}
      </body>
    </html>
  );
}