import Link from "next/link";

export const metadata = {
  title: "Impressum | Bewerbungs-Generator",
  description: "Impressum nach § 5 TMG",
};

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 prose prose-neutral dark:prose-invert">
      <h1>Impressum</h1>
      <p>Angaben gemäß § 5 TMG</p>

      <h2>Verantwortlich</h2>
      <p>
        <strong>Name:</strong> [Dein Name]<br />
        <strong>Adresse:</strong> [Straße Hausnr., PLZ Ort]<br />
        <strong>E-Mail:</strong> [deine@email.de]<br />
        <strong>Telefon:</strong> [optional]
      </p>

      <h2>Umsatzsteuer</h2>
      <p>
        [Optional] USt-IdNr.: [falls vorhanden] <br />
        Oder: Kleinunternehmer nach § 19 UStG.
      </p>

      <h2>Haftung für Inhalte</h2>
      <p>
        Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf
        diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG
        sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder
        gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen,
        die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung
        oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
        hiervon unberührt.
      </p>

      <h2>Haftung für Links</h2>
      <p>
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
        keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
        Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
        Anbieter oder Betreiber der Seiten verantwortlich.
      </p>

      <h2>Urheberrecht</h2>
      <p>
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
        unterliegen dem deutschen Urheberrecht. Beiträge Dritter sind als solche
        gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der
        Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
        Zustimmung des jeweiligen Autors bzw. Erstellers.
      </p>

      <h2>Hosting</h2>
      <p>
        Hosting durch <Link href="https://vercel.com" target="_blank">Vercel</Link>.
      </p>

      <p>
        Stand: {new Date().toLocaleDateString("de-DE")}
      </p>
    </main>
  );
}
