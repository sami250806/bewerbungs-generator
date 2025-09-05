import "./globals.css";

export const metadata = {
  title: "Bewerbungs-Generator",
  description: "Erstellt Bewerbungsanschreiben mit KI",
};

export default function RootLayout({ children }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}