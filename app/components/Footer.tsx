import Link from "next/link";
import LogoutLink from "./LogoutLink";

export default function Footer() {
  return (
    <footer className="glass-card mt-10 border-t border-white/20 px-6 py-4 text-center text-sm text-white/70">
      <p className="space-x-1">
        <span>© {new Date().getFullYear()} Bewerbungs-Generator</span>
        <span>·</span>
        <Link href="/impressum" className="underline hover:text-white">Impressum</Link>
        <span>·</span>
        <Link href="/datenschutz" className="underline hover:text-white">Datenschutz</Link>
        <span>·</span>
        <Link href="/login" className="underline hover:text-white">Login</Link>
        <span>·</span>
        <LogoutLink />
      </p>
    </footer>
  );
}