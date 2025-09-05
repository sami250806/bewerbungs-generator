import Footer from "./components/Footer";
import "./globals.css";

export const metadata = {
  title: "Bewerbungs-Generator",
  description: "Erstellt Bewerbungsanschreiben mit KI",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Footer />
      </body>
    </html>
  );
}
