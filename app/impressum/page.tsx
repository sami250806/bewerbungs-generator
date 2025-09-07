import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Bewerbungs-Generator",
  description: "Impressum nach § 5 TMG.",
};

const formatDate = (d = new Date()) =>
  new Intl.DateTimeFormat("de-DE", { year: "numeric", month: "long", day: "numeric" }).format(d);

export default function ImpressumPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="glass-card p-6">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Impressum</h1>

          <h2>Angaben gemäß § 5 TMG</h2>
          <p>
            <strong>Name:</strong> [Dein Name]<br />
            <strong>Adresse:</strong> [Straße&nbsp;Hausnr., PLZ&nbsp;Ort]<br />
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
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den
            allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet,
            übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen,
            die auf eine rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung
            von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
          </p>

          <h2>Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
            Für diese fremden Inhalte übernehmen wir keine Gewähr. Für die Inhalte der verlinkten Seiten ist stets
            der jeweilige Anbieter oder Betreiber verantwortlich.
          </p>

          <h2>Urheberrecht</h2>
          <p>
            Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen
            Urheberrecht. Beiträge Dritter sind als solche gekennzeichnet. Die Vervielfältigung, Bearbeitung,
            Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>

          <h2>Hosting</h2>
          <p>
            Hosting durch{" "}
            <Link href="https://vercel.com" target="_blank" rel="noopener">
              Vercel
            </Link>.
          </p>

          <p><small>Stand: {formatDate()}</small></p>

          <p>
            <Link href="/" className="no-underline underline-offset-4 hover:underline">← Zurück zur Startseite</Link>
          </p>
        </article>
      </div>
    </main>
  );
}