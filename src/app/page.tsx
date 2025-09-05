"use client";
import { useState, useEffect, FormEvent } from "react";
// ❌ WICHTIG: KEIN statischer Import von "jspdf" hier oben

type FormState = {
  name: string;
  jobTitle: string;
  experience: string;
  skills: string;
};

export default function Home() {
  const [form, setForm] = useState<FormState>({
    name: "",
    jobTitle: "",
    experience: "",
    skills: "",
  });

  // Für „touched“ Felder, damit erst nach Berührung rot markiert wird
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    jobTitle: false,
    experience: false,
    skills: false,
  });

  // LocalStorage laden/speichern
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bg_form");
      if (saved) setForm(JSON.parse(saved));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("bg_form", JSON.stringify(form));
    } catch {}
  }, [form]);

  const onChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const onBlur = (field: keyof FormState) => () =>
    setTouched((t) => ({ ...t, [field]: true }));

  const isEmpty = (v: string) => v.trim().length === 0;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Alle Felder als "berührt" markieren, damit alles korrekt rot wird
    setTouched({
      name: true,
      jobTitle: true,
      experience: true,
      skills: true,
    });

    // Wenn etwas leer ist, nicht absenden
    if (
      isEmpty(form.name) ||
      isEmpty(form.jobTitle) ||
      isEmpty(form.experience) ||
      isEmpty(form.skills)
    ) {
      return;
    }

    // PDF generieren – dynamischer Import nur beim Klick
    (async () => {
      const { default: jsPDF } = await import("jspdf");
      const doc = new jsPDF();
      doc.setFontSize(16);
      doc.text("Bewerbung", 20, 20);
      doc.setFontSize(12);
      doc.text(`Name: ${form.name}`, 20, 35);
      doc.text(`Stelle: ${form.jobTitle}`, 20, 45);
      doc.text("Erfahrung:", 20, 60);
      doc.text(form.experience, 20, 68, { maxWidth: 170 });
      doc.text("Skills:", 20, 100);
      doc.text(form.skills, 20, 108, { maxWidth: 170 });
      doc.save("Bewerbung.pdf");
    })();
  };

  // Hilfsfunktion für Klassen (roter Rand + Meldung)
  const fieldClasses = (value: string, touched: boolean) =>
    [
      "w-full rounded-md border px-3 py-2 outline-none",
      "focus:ring-2 focus:ring-red-400",
      touched && isEmpty(value) ? "border-red-500" : "border-gray-300",
    ].join(" ");

  const errorMsg = (value: string, touched: boolean, label: string) =>
    touched && isEmpty(value) ? (
      <p className="mt-1 text-sm text-red-600">{label} ist ein Pflichtfeld.</p>
    ) : null;

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-semibold">Bewerbungs-Generator</h1>

      {/* HIER ist dein <form> – direkt unter der Überschrift, innerhalb von return(...) */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1 block font-medium" htmlFor="name">
            Name*
          </label>
          <input
            id="name"
            type="text"
            required
            value={form.name}
            onChange={onChange("name")}
            onBlur={onBlur("name")}
            className={fieldClasses(form.name, touched.name)}
            placeholder="Max Mustermann"
          />
          {errorMsg(form.name, touched.name, "Name")}
        </div>

        {/* Jobtitel */}
        <div>
          <label className="mb-1 block font-medium" htmlFor="jobTitle">
            Gewünschte Stelle*
          </label>
          <input
            id="jobTitle"
            type="text"
            required
            value={form.jobTitle}
            onChange={onChange("jobTitle")}
            onBlur={onBlur("jobTitle")}
            className={fieldClasses(form.jobTitle, touched.jobTitle)}
            placeholder="z. B. Kaufmännische:r Mitarbeiter:in"
          />
          {errorMsg(form.jobTitle, touched.jobTitle, "Stelle")}
        </div>

        {/* Erfahrung */}
        <div>
          <label className="mb-1 block font-medium" htmlFor="experience">
            Erfahrung (kurz)*
          </label>
          <textarea
            id="experience"
            required
            value={form.experience}
            onChange={onChange("experience")}
            onBlur={onBlur("experience")}
            className={fieldClasses(form.experience, touched.experience)}
            rows={5}
            placeholder="Kurzbeschreibung deiner bisherigen Erfahrungen…"
          />
          {errorMsg(form.experience, touched.experience, "Erfahrung")}
        </div>

        {/* Skills */}
        <div>
          <label className="mb-1 block font-medium" htmlFor="skills">
            Skills (kommagetrennt)*
          </label>
          <textarea
            id="skills"
            required
            value={form.skills}
            onChange={onChange("skills")}
            onBlur={onBlur("skills")}
            className={fieldClasses(form.skills, touched.skills)}
            rows={3}
            placeholder="Teamwork, MS Office, Kundenservice, …"
          />
          {errorMsg(form.skills, touched.skills, "Skills")}
        </div>

        <button
          type="submit"
          className="mt-2 w-full rounded-md bg-black px-4 py-2 font-medium text-white hover:opacity-90"
        >
          PDF erzeugen
        </button>
      </form>
    </main>
  );
}