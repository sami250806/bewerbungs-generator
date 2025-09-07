// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bewerbungs-Generator",
  description: "Generate great cover letters and export as PDF/DOCX.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="glass-gradient antialiased min-h-screen">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
} 