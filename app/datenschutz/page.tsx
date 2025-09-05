import Link from "next/link";

export const metadata = {
  title: "Datenschutzerklärung | Bewerbungs-Generator",
  description: "Informationen gemäß Art. 13 DSGVO",
};

export default function DatenschutzPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10 prose prose-neutral dark:prose-invert">
      <h1>Datenschutzerklärung</h1>
      <p>Informationen gemäß Art. 12 ff. DSGVO.</p>

      <h2>1. Verantwortlicher</h2>
      <p>
        <strong>Name:</strong> [Dein Name]<br />
        <strong>Adresse:</strong> [Straße Hausnr., PLZ Ort]<br />
        <strong>E-Mail:</strong> [deine@email.de]<br />
        <strong>Telefon:</strong> [optional]
      </p>

      <h2>2. Hosting & Bereitstellung der Website</h2>
      <p>
        Diese Website wird bei <Link href="https://vercel.com" target="_blank">Vercel</Link> gehostet.
        Beim Aufruf der Seite verarbeitet Vercel technisch erforderliche Daten (z.&nbsp;B. IP-Adresse,
        Datum/Uhrzeit, User Agent) in Server-Logs, um den sicheren Betrieb zu gewährleisten.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an stabiler
        und sicherer Bereitstellung).
      </p>

      <h2>3. Zweck der Seite (Textgenerierung)</h2>
      <p>
        Wenn du Inhalte generierst, verarbeiten wir die von dir eingegebenen Daten (z.&nbsp;B.
        Name, Jobtitel, Skills, Erfahrungstexte), um Bewerbungstexte zu erstellen. Die Verarbeitung
        erfolgt zur Vertragserfüllung bzw. vorvertraglichen Maßnahmen (Art. 6 Abs. 1 lit. b DSGVO)
        sowie zur Bereitstellung der Funktionen der Website (Art. 6 Abs. 1 lit. f DSGVO).
      </p>

      <h2>4. Einsatz von OpenAI (Auftragsverarbeitung)</h2>
      <p>
        Zur Generierung der Texte werden deine Eingaben an die Schnittstelle von{" "}
        <Link href="https://openai.com" target="_blank">OpenAI</Link> übermittelt. OpenAI verarbeitet die Daten
        als Auftragsverarbeiter. Dabei kann es zu einer Übermittlung in Drittländer (u.&nbsp;a. USA) kommen.
        Wir achten darauf, nur die zur Generierung erforderlichen Inhalte zu übermitteln.
        Rechtsgrundlage ist Art. 6 Abs. 1 lit. b und f DSGVO. Bitte gib keine besonderen Kategorien
        personenbezogener Daten (z.&nbsp;B. Gesundheitsdaten) ein.
      </p>

      <h2>5. Cookies & lokale Speicherung</h2>
      <p>
        Diese Seite verwendet derzeit keine Tracking-Cookies. Zur Verbesserung der Nutzung kann
        dein Browser lokal Daten speichern (localStorage), z.&nbsp;B. Formularstände. Diese Daten
        verlassen dein Gerät nicht und können von dir jederzeit im Browser gelöscht werden.
      </p>

      <h2>6. Speicherdauer</h2>
      <p>
        Server-Logs werden durch den Hoster entsprechend dessen Löschkonzepten gelöscht.
        Von dir eingegebene Inhalte werden nur solange verarbeitet, wie es für die Textgenerierung
        erforderlich ist. Lokal gespeicherte Formulardaten kannst du jederzeit entfernen.
      </p>

      <h2>7. Empfänger der Daten</h2>
      <ul>
        <li>Hosting: Vercel (USA/EU, siehe oben)</li>
        <li>KI-Textgenerierung: OpenAI (Drittländerübermittlung möglich)</li>
      </ul>

      <h2>8. Drittlandübermittlung</h2>
      <p>
        Bei der Nutzung von OpenAI kann eine Übermittlung in Drittländer (insb. USA) stattfinden.
        Dabei werden geeignete Garantien nach Art. 46 DSGVO angestrebt (z.&nbsp;B. Standardvertragsklauseln).
      </p>

      <h2>9. Deine Rechte</h2>
      <ul>
        <li>Auskunft (Art. 15 DSGVO)</li>
        <li>Berichtigung (Art. 16 DSGVO)</li>
        <li>Löschung (Art. 17 DSGVO)</li>
        <li>Einschränkung (Art. 18 DSGVO)</li>
        <li>Datenübertragbarkeit (Art. 20 DSGVO)</li>
        <li>Widerspruch (Art. 21 DSGVO)</li>
        <li>Widerruf erteilter Einwilligungen (Art. 7 Abs. 3 DSGVO)</li>
      </ul>

      <h2>10. Beschwerderecht</h2>
      <p>
        Du hast das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren.
        Für NRW: <Link href="https://www.ldi.nrw.de/" target="_blank">Landesbeauftragte für Datenschutz und Informationsfreiheit NRW</Link>.
      </p>

      <h2>11. Sicherheit</h2>
      <p>
        Wir treffen technische und organisatorische Maßnahmen, um deine Daten vor Verlust,
        Missbrauch und unberechtigtem Zugriff zu schützen und passen diese fortlaufend an.
      </p>

      <h2>12. Minderjährige</h2>
      <p>
        Das Angebot richtet sich nicht an Kinder unter 16 Jahren.
      </p>

      <p>Stand: {new Date().toLocaleDateString("de-DE")}</p>
    </main>
  );
}
