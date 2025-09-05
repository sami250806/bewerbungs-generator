import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t pt-6 text-center text-sm text-gray-500">
      <div className="space-x-4">
        <Link href="/impressum" className="hover:underline">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:underline">
          Datenschutz
        </Link>
      </div>
      <p className="mt-2">&copy; {new Date().getFullYear()} Bewerbungs-Generator</p>
    </footer>
  );
}
