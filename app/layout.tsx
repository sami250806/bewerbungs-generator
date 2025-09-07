// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bewerbungs-Generator",
  description: "Generate great cover letters and export as PDF/DOCX.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="glass-gradient antialiased flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="glass-card mt-10 border-t border-white/20 px-6 py-4 text-center text-sm text-white/70">
          <p>
            © {new Date().getFullYear()} Bewerbungs-Generator ·{" "}
            <Link href="/impressum" className="underline hover:text-white">
              Impressum
            </Link>{" "}
            ·{" "}
            <Link href="/datenschutz" className="underline hover:text-white">
              Datenschutz
            </Link>{" "}
            ·{" "}
            <Link href="/login.html" className="underline hover:text-white">
              Login
            </Link>
          </p>
        </footer>
      </body>
    </html>
  );
}