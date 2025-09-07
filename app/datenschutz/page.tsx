import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Datenschutzerklärung | Bewerbungs-Generator",
  description: "Datenschutzhinweise gemäß DSGVO.",
};

const formatDate = (d = new Date()) =>
  new Intl.DateTimeFormat("de-DE", { year: "numeric", month: "long", day: "numeric" }).format(d);

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="glass-card p-6">
        <article className="prose prose-slate dark:prose-invert max-w-none">
          <h1>Datenschutzerklärung</h1>

          <p>
            Mit dieser Erklärung informieren wir dich über Art, Umfang und Zwecke der Verarbeitung
            personenbezogener Daten beim Besuch dieser Website.
          </p>

          <h2>1. Verantwortlicher</h2>
          <p>
            <strong>Name:</strong> [Dein Name]<br />
            <strong>Adresse:</strong> [Straße&nbsp;Hausnr., PLZ&nbsp;Ort]<br />
            <strong>E-Mail:</strong> [deine@email.de]<br />
            <strong>Telefon:</strong> [optional]
          </p>

          <h2>2. Hosting</h2>
          <p>
            Diese Website wird bei <Link href="https://vercel.com" target="_blank" rel="noopener">Vercel Inc.</Link> gehostet.
            Beim Aufruf der Seite verarbeitet Vercel u. a. IP-Adresse, Timestamp, User-Agent und
            aufgerufene URL in Server-Logs. Die Verarbeitung erfolgt auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO
            (berechtigtes Interesse an dem sicheren und stabilen Betrieb der Website).
          </p>

          <h2>3. Server-Logfiles</h2>
          <p>
            Wir erheben und speichern automatisch Informationen in sogenannten Server-Logfiles,
            die dein Browser automatisch übermittelt: IP-Adresse (gekürzt/gekürzt speicherbar),
            Datum und Uhrzeit der Anfrage, Referrer-URL, verwendeter Browser/OS. Eine Zusammenführung
            mit anderen Daten erfolgt nicht. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.
          </p>

          <h2>4. Lokal gespeicherte Daten (LocalStorage)</h2>
          <p>
            Die App speichert Formulardaten (z. B. Name, Textfelder, gewählte Optionen) sowie ggf. ein
            Foto temporär im <em>LocalStorage</em> deines Browsers, um deinen Entwurf wiederherzustellen und Export-Funktionen
            (PDF/DOCX) zu ermöglichen. Diese Daten verlassen deinen Browser nicht, es sei denn, du
            exportierst oder sendest sie selbst. Du kannst die Speicherung jederzeit löschen, indem du in der App auf
            „Zurücksetzen“ klickst oder den LocalStorage deines Browsers leerst.
          </p>

          <h2>5. Kontaktaufnahme</h2>
          <p>
            Wenn du uns per E-Mail kontaktierst, verarbeiten wir deine Angaben zur Bearbeitung der Anfrage
            (Art. 6 Abs. 1 lit. b oder lit. f DSGVO). Die Daten werden gelöscht, sobald sie für die
            Bearbeitung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.
          </p>

          <h2>6. Weitergabe von Daten</h2>
          <p>
            Eine Übermittlung an Dritte erfolgt nur, wenn dies zur Vertragserfüllung erforderlich ist,
            wir gesetzlich dazu verpflichtet sind oder du eingewilligt hast.
          </p>

          <h2>7. Deine Rechte</h2>
          <ul>
            <li>Auskunft über deine gespeicherten Daten (Art. 15 DSGVO)</li>
            <li>Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
            <li>Löschung („Recht auf Vergessenwerden“, Art. 17 DSGVO)</li>
            <li>Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
            <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
            <li>Widerspruch gegen Verarbeitung auf Basis berechtigter Interessen (Art. 21 DSGVO)</li>
            <li>Beschwerderecht bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
          </ul>

          <h2>8. Speicherdauer</h2>
          <p>
            Personenbezogene Daten werden gelöscht, sobald der Zweck der Verarbeitung entfällt und keine
            gesetzlichen Aufbewahrungspflichten entgegenstehen. LocalStorage-Daten bleiben in deinem Browser,
            bis du sie selbst entfernst oder die App sie löscht.
          </p>

          <h2>9. Datensicherheit</h2>
          <p>
            Wir treffen angemessene technische und organisatorische Maßnahmen, um deine Daten gegen Verlust,
            Missbrauch und unbefugten Zugriff zu schützen (u. a. TLS-Verschlüsselung).
          </p>

          <h2>10. Externe Links</h2>
          <p>
            Für Inhalte verlinkter externer Websites übernehmen wir keine Haftung. Es gelten die
            Datenschutzhinweise der jeweiligen Anbieter.
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