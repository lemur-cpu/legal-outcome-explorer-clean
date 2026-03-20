import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PrecedentIQ — Legal Outcome Explorer",
  description:
    "AI-powered legal analytics platform for exploring case outcomes, precedents, and judicial trends.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
