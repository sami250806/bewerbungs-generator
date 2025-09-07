// app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mt-16">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md shadow-[0_10px_40px_rgba(0,0,0,.25)] px-4 py-3">
          <p className="text-sm text-white/80">
            © {new Date().getFullYear()} Bewerbungs-Generator — Glas-UI.
          </p>
        </div>
      </div>
    </footer>
  );
}