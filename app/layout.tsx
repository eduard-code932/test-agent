import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "To-Do List",
  description: "Accessible Next.js to-do list app",
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
