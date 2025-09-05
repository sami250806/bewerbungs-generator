cat > app/page.tsx <<'TSX'
"use client";
import type React from "react";
import { useState, useEffect, FormEvent, useMemo } from "react";

// =====================
// Types
// =====================
type LetterStyle =
  | "formal"
  | "modern"
  | "friendly"
  | "concise"
  | "enthusiastic"
  | "professional"
  | "casual"
  | "sales"
  | "academic"
  | "persuasive";

type Language = "de" | "en";
type LengthTarget = "short" | "medium" | "long";

type FormState = {
  // Person & Stelle
  name: string;
  jobTitle: string;
  company: string;
  contact: string;

  // Inhalte
  experience: string;
  skills: string;

  // Stil & Sprache
  style: LetterStyle;
  language: Language;
  length: LengthTarget;

  // Optionen
  bullets: boolean;

  // Briefkopf / Adressen
  header: boolean;
  applicantAddress: string;
  applicantLocation: string; // City for date line
  companyAddress: string;
};

// =====================
// i18n
// =====================
const i18n = {
  en: {
    appTitle: "Cover Letter Generator",
    intro:
      "Write a convincing cover letter — choose language & style, review the text, then download as PDF/DOCX.",
    labels: {
      language: "Language",
      name: "Name*",
      jobTitle: "Desired Position*",
      company: "Company (optional)",
      contact: "Contact person (optional)",
      experience: "Experience (short)*",
      skills: "Skills (comma-separated)*",
      style: "Cover letter style",
      length: "Length",
      bullets: "Use bullet points for experience & skills",
      header: "Include letterhead + addresses",
      applicantAddress: "Your address (optional)",
      applicantLocation: "City / Location for date (optional)",
      companyAddress: "Company address (optional)",
      preview: "Your cover letter preview",
      tips: "Tips",
      examples: "Examples",
    },
    placeholders: {
      name: "Jane Doe",
      jobTitle: "e.g., Administrative Assistant",
      company: "e.g., Contoso GmbH",
      contact: "e.g., Ms. Müller",
      experience: "Brief description of your previous experience…",
      skills: "Teamwork, MS Office, Customer Service, …",
      applicantAddress: "Street 1\n12345 City",
      applicantLocation: "London",
      companyAddress: "Company Street 1\n12345 City",
    },
    styleOptions: {
      formal: "Classic / Formal",
      modern: "Modern / Direct",
      friendly: "Friendly",
      concise: "Concise & factual",
      enthusiastic: "Enthusiastic",
      professional: "Professional",
      casual: "Casual",
      sales: "Sales-oriented",
      academic: "Academic",
      persuasive: "Persuasive",
    },
    lengthOptions: {
      short: "Short (~140–200 words)",
      medium: "Medium (~220–300 words)",
      long: "Long (~320–420 words)",
    },
    buttons: {
      generate: "Generate cover letter",
      generating: "Generating…",
      pdf: "Download PDF",
      docx: "Download DOCX",
      reset: "Reset",
      copy: "Copy",
    },
    counters: {
      chars: "Characters",
      words: "Words",
      target: (min: number, max: number) => `Target ${min}–${max}`,
    },
    fallbackNote: "AI not reachable — showing local draft (English).",
    required: (label: string) => `${label.replace("*", "")} is required.`,
    dateLabel: "Date",
    salHiringTeam: "Hiring Team",
  },
  de: {
    appTitle: "Bewerbungs-Generator",
    intro:
      "Schreibe ein überzeugendes Anschreiben — Sprache & Stil wählen, Text prüfen, dann als PDF/DOCX herunterladen.",
    labels: {
      language: "Sprache",
      name: "Name*",
      jobTitle: "Gewünschte Stelle*",
      company: "Firma (optional)",
      contact: "Ansprechpartner:in (optional)",
      experience: "Erfahrung (kurz)*",
      skills: "Skills (kommagetrennt)*",
      style: "Stil des Anschreibens",
      length: "Länge",
      bullets: "Aufzählungen für Erfahrung & Skills verwenden",
      header: "Briefkopf + Adressen einfügen",
      applicantAddress: "Eigene Adresse (optional)",
      applicantLocation: "Ort für Datumszeile (optional)",
      companyAddress: "Firmenadresse (optional)",
      preview: "Vorschau deines Anschreibens",
      tips: "Tipps",
      examples: "Beispiele",
    },
    placeholders: {
      name: "Max Mustermann",
      jobTitle: "z. B. Kaufmännische:r Mitarbeiter:in",
      company: "z. B. Contoso GmbH",
      contact: "z. B. Frau Müller",
      experience: "Kurzbeschreibung deiner bisherigen Erfahrungen…",
      skills: "Teamwork, MS Office, Kundenservice, …",
      applicantAddress: "Musterstraße 1\n12345 Musterstadt",
      applicantLocation: "Berlin",
      companyAddress: "Firmenstraße 1\n12345 Musterstadt",
    },
    styleOptions: {
      formal: "Klassisch / Formal",
      modern: "Modern / Direkt",
      friendly: "Freundlich",
      concise: "Knapp & sachlich",
      enthusiastic: "Enthusiastisch",
      professional: "Professionell",
      casual: "Locker",
      sales: "Vertrieblich",
      academic: "Akademisch",
      persuasive: "Überzeugend",
    },
    lengthOptions: {
      short: "Kurz (~140–200 Wörter)",
      medium: "Mittel (~220–300 Wörter)",
      long: "Lang (~320–420 Wörter)",
    },
    buttons: {
      generate: "Anschreiben generieren",
      generating: "Generiere…",
      pdf: "Als PDF herunterladen",
      docx: "Als DOCX herunterladen",
      reset: "Zurücksetzen",
      copy: "Kopieren",
    },
    counters: {
      chars: "Zeichen",
      words: "Wörter",
      target: (min: number, max: number) => `Ziel ${min}–${max}`,
    },
    fallbackNote: "KI nicht erreichbar – zeige lokalen Entwurf (Deutsch).",
    required: (label: string) => `${label.replace("*", "")} ist ein Pflichtfeld.`,
    dateLabel: "Datum",
    salHiringTeam: "Recruiting-Team",
  },
};

// =====================
// Defaults
// =====================
const DEFAULT_FORM: FormState = {
  name: "",
  jobTitle: "",
  company: "",
  contact: "",
  experience: "",
  skills: "",
  style: "formal",
  language: "en",
  length: "medium",
  bullets: false,
  header: false,
  applicantAddress: "",
  applicantLocation: "",
  companyAddress: "",
};

// =====================
// Component
// =====================
export default function Home() {
  // Core state
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false,
    jobTitle: false,
    company: false,
    contact: false,
    experience: false,
    skills: false,
    style: false,
    language: false,
    length: false,
    bullets: false,
    header: false,
    applicantAddress: false,
    applicantLocation: false,
    companyAddress: false,
  });

  // LocalStorage: load
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bg_form");
      if (saved) {
        const parsed = JSON.parse(saved) || {};
        setForm({
          ...DEFAULT_FORM,
          ...parsed,
          style: (parsed.style ?? "formal") as LetterStyle,
          language: (parsed.language ?? "en") as Language,
          length: (parsed.length ?? "medium") as LengthTarget,
          bullets: !!parsed.bullets,
          header: !!parsed.header,
        });
      }
    } catch {}
  }, []);

  // LocalStorage: save
  useEffect(() => {
    try {
      localStorage.setItem("bg_form", JSON.stringify(form));
    } catch {}
  }, [form]);

  // Auto-scroll zur Vorschau, sobald Text fertig ist
  useEffect(() => {
    if (!loading && result) {
      document.getElementById("preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, result]);

  // Labels
  const t = i18n[form.language];

  // =====================
  // Helpers & UI utils
  // =====================
  const onChange =
    (field: keyof FormState) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement>
        | React.ChangeEvent<HTMLTextAreaElement>
        | React.ChangeEvent<HTMLSelectElement>
    ) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
      setForm((prev) => ({ ...prev, [field]: value as any }));
    };

  const onBlur = (field: keyof FormState) => () => setTouched((s) => ({ ...s, [field]: true }));

  const isEmpty = (v: string) => v.trim().length === 0;

  const fieldClasses = (value: string, wasTouched: boolean) =>
    [
      "w-full rounded-xl border bg-white/5 px-3 py-2 outline-none transition",
      "focus:ring-2 focus:ring-indigo-400",
      wasTouched && isEmpty(value) ? "border-red-500" : "border-white/20",
      "placeholder:text-white/40",
    ].join(" ");

  const errorBelow = (value: string, wasTouched: boolean, label: string) =>
    wasTouched && isEmpty(value) ? (
      <p className="mt-1 text-sm text-red-400">{t.required(label)}</p>
    ) : null;

  // Counters
  const countWords = (txt: string) => (txt.trim() ? txt.trim().split(/\s+/).length : 0);
  const countChars = (txt: string) => txt.length;

  const LIMITS = {
    experience: { minWords: 40, maxWords: 180 },
    skills: { minWords: 8, maxWords: 60 },
  } as const;

  const statColor = (
    w: number,
    { minWords, maxWords }: { minWords: number; maxWords: number }
  ) => {
    if (!w) return "text-white/60";
    if (w < minWords) return "text-amber-300";
    if (w > maxWords) return "text-amber-300";
    return "text-emerald-300";
  };

  const percentToGoal = (
    w: number,
    { minWords, maxWords }: { minWords: number; maxWords: number }
  ) => {
    if (!w) return 0;
    const p = ((w - minWords) / Math.max(1, maxWords - minWords)) * 100;
    return Math.max(0, Math.min(100, Math.round(p)));
  };

  const barColor = (w: number, limits: { minWords: number; maxWords: number }) => {
    if (!w) return "bg-white/20";
    if (w < limits.minWords) return "bg-amber-400";
    if (w > limits.maxWords) return "bg-amber-400";
    return "bg-emerald-400";
  };

  // =====================
  // Header (letterhead)
  // =====================
  const buildSimpleHeader = (f: FormState) => {
    const date = new Date().toLocaleDateString(f.language === "en" ? "en-GB" : "de-DE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const dateLabel = i18n[f.language].dateLabel;
    const lines = [
      f.name,
      f.applicantAddress?.trim(),
      f.applicantLocation?.trim(),
      "",
      f.company?.trim(),
      f.companyAddress?.trim(),
      "",
      `${dateLabel}: ${date}`,
    ].filter(Boolean);

    return lines.join("\n");
  };

  // =====================
  // Local fallback builder
  // =====================
  const buildLetter = (f: FormState) => {
    const expRaw = f.experience.trim();
    const skillsRaw = f.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(", ");

    const bulletsExp = f.bullets && expRaw ? expRaw.split(/\n|\./).map((l) => l.trim()).filter(Boolean) : [];
    const bulletsSkills = f.bullets && skillsRaw ? skillsRaw.split(",").map((s) => s.trim()) : [];

    const addBullets = (items: string[], lang: Language) =>
      items.length ? items.map((it) => `• ${it}`).join("\n") : lang === "en" ? "- (please add)" : "- (bitte ergänzen)";

    const expText = f.bullets && bulletsExp.length ? addBullets(bulletsExp, f.language) : expRaw || (f.language === "en" ? "- (please add)" : "- (bitte ergänzen)");

    const skillsText = f.bullets && bulletsSkills.length ? addBullets(bulletsSkills, f.language) : skillsRaw || (f.language === "en" ? "- (please add)" : "- (bitte ergänzen)");

    const headerBlock = f.header ? buildSimpleHeader(f) + "\n\n" : "";

    if (f.language === "en") {
      const sal = `Dear ${f.contact?.trim() || i18n.en.salHiringTeam},`;
      const introModern = `Hello,\n\nYour ${f.jobTitle}${f.company ? " role at " + f.company : ""} immediately caught my attention — I bring hands-on experience and enjoy taking ownership.`;

      const introFormal = `${sal}\n\nI am excited to apply for the ${f.jobTitle}${f.company ? " at " + f.company : ""}. With my background and motivation, I am confident I can contribute effectively.`;

      const expBlock = `In my previous roles, I gained the following experience:\n${expText}`;
      const skillsBlock = `My core strengths include:\n${skillsText}`;

      const outroFormal = `I would be happy to discuss how I can support your team and add value.\n\nKind regards\n${f.name}`;
      const outroModern = `I work pragmatically, solution-oriented, and communicate clearly — I would love to discuss how I can support your team.\n\nBest regards\n${f.name}`;

      const body = f.style === "modern" ? [introModern, expBlock, skillsBlock, outroModern] : [introFormal, expBlock, skillsBlock, outroFormal];

      if (f.length === "short") body.splice(2, 0, "");
      if (f.length === "long") body.splice(2, 0, "Additionally, I am eager to continuously improve processes and share best practices across teams.");

      return headerBlock + body.filter(Boolean).join("\n\n");
    } else {
      const lower = f.contact?.toLowerCase() || "";
      const sal = lower.includes("frau")
        ? `Sehr geehrte ${f.contact},`
        : lower.includes("herr")
        ? `Sehr geehrter ${f.contact},`
        : "Sehr geehrte Damen und Herren,";

      const introModern = `Guten Tag${f.contact ? ` ${f.contact}` : ""},\n\nIhre Position „${f.jobTitle}“${f.company ? " bei " + f.company : ""} hat sofort mein Interesse geweckt – vor allem, weil ich praktische Erfahrung mitbringe und gern Verantwortung übernehme.`;

      const introFormal = `${sal}\n\nmit großem Interesse bewerbe ich mich für die Position als ${f.jobTitle}${f.company ? " bei " + f.company : ""}. Durch meine Erfahrung und Motivation kann ich wirkungsvoll beitragen.`;

      const expBlock = `In meiner bisherigen Laufbahn konnte ich folgende Erfahrungen sammeln:\n${expText}`;
      const skillsBlock = `Zu meinen Stärken zählen:\n${skillsText}`;

      const outroFormal = `Gern erläutere ich Ihnen im Gespräch, wie ich Ihr Team zielgerichtet unterstütze.\n\nMit freundlichen Grüßen\n${f.name}`;
      const outroModern = `Ich arbeite pragmatisch, lösungsorientiert und kommunikativ – lassen Sie uns gern gemeinsam ausloten, wie ich Ihr Team unterstützen kann.\n\nBeste Grüße\n${f.name}`;

      const body = f.style === "modern" ? [introModern, expBlock, skillsBlock, outroModern] : [introFormal, expBlock, skillsBlock, outroFormal];

      if (f.length === "short") body.splice(2, 0, "");
      if (f.length === "long") body.splice(2, 0, "Darüber hinaus liegt mir daran, Abläufe fortlaufend zu verbessern und Best Practices im Team zu teilen.");

      return headerBlock + body.filter(Boolean).join("\n\n");
    }
  };

  // =====================
  // Submit
  // =====================
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setTouched({
      name: true,
      jobTitle: true,
      company: true,
      contact: true,
      experience: true,
      skills: true,
      style: true,
      language: true,
      length: true,
      bullets: true,
      header: true,
      applicantAddress: true,
      applicantLocation: true,
      companyAddress: true,
    });
    setErrorMsg(null);

    if (isEmpty(form.name) || isEmpty(form.jobTitle) || isEmpty(form.experience) || isEmpty(form.skills)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      if (!data?.result) throw new Error("Empty result");
      setResult(data.result);
    } catch {
      setResult(buildLetter(form));
      setErrorMsg(i18n[form.language].fallbackNote);
    } finally {
      setLoading(false);
    }
  };

  // =====================
  // Reset
  // =====================
  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult("");
    setErrorMsg(null);
    setTouched({
      name: false,
      jobTitle: false,
      company: false,
      contact: false,
      experience: false,
      skills: false,
      style: false,
      language: false,
      length: false,
      bullets: false,
      header: false,
      applicantAddress: false,
      applicantLocation: false,
      companyAddress: false,
    });
    localStorage.removeItem("bg_form");
  };

  // =====================
  // Memoized progress values
  // =====================
  const expWords = useMemo(() => countWords(form.experience), [form.experience]);
  const skillsWords = useMemo(() => countWords(form.skills), [form.skills]);

  // =====================
  // Render
  // =====================
  return (
    <>
      {/* Loading-Bar */}
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/10 border-b border-yellow-500/30 backdrop-blur px-4 py-2 text-center text-sm">
          <span className="font-medium">Generierung läuft…</span> Bitte warten.
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-indigo-900 via-slate-900 to-black text-white">
        <main className="mx-auto max-w-5xl px-4 py-10">
          <header className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">{i18n[form.language].appTitle}</h1>
            <p className="mt-1 text-white/70">{i18n[form.language].intro}</p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Form card */}
            <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Language & Style */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium" htmlFor="language">
                      {i18n[form.language].labels.language}
                    </label>
                    <select
                      id="language"
                      value={form.language}
                      onChange={onChange("language")}
                      onBlur={onBlur("language")}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block font-medium" htmlFor="style">
                      {i18n[form.language].labels.style}
                    </label>
                    <select
                      id="style"
                      value={form.style}
                      onChange={onChange("style")}
                      onBlur={onBlur("style")}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="formal">{i18n[form.language].styleOptions.formal}</option>
                      <option value="modern">{i18n[form.language].styleOptions.modern}</option>
                      <option value="friendly">{i18n[form.language].styleOptions.friendly}</option>
                      <option value="concise">{i18n[form.language].styleOptions.concise}</option>
                      <option value="enthusiastic">{i18n[form.language].styleOptions.enthusiastic}</option>
                      <option value="professional">{i18n[form.language].styleOptions.professional}</option>
                      <option value="casual">{i18n[form.language].styleOptions.casual}</option>
                      <option value="sales">{i18n[form.language].styleOptions.sales}</option>
                      <option value="academic">{i18n[form.language].styleOptions.academic}</option>
                      <option value="persuasive">{i18n[form.language].styleOptions.persuasive}</option>
                    </select>
                  </div>
                </div>

                {/* Length + toggles */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block font-medium" htmlFor="length">
                      {i18n[form.language].labels.length}
                    </label>
                    <select
                      id="length"
                      value={form.length}
                      onChange={onChange("length")}
                      onBlur={onBlur("length")}
                      className="w-full rounded-xl border border-white/20 bg-white/5 px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-400"
                    >
                      <option value="short">{i18n[form.language].lengthOptions.short}</option>
                      <option value="medium">{i18n[form.language].lengthOptions.medium}</option>
                      <option value="long">{i18n[form.language].lengthOptions.long}</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.bullets}
                      onChange={onChange("bullets")}
                      onBlur={onBlur("bullets")}
                      className="h-4 w-4 rounded border-white/30 bg-white/5"
                    />
                    <span>{i18n[form.language].labels.bullets}</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={form.header}
                      onChange={onChange("header")}
                      onBlur={onBlur("header")}
                      className="h-4 w-4 rounded border-white/30 bg-white/5"
                    />
                    <span>{i18n[form.language].labels.header}</span>
                  </label>
                </div>

                {/* Name + Job */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium" htmlFor="name">
                      {i18n[form.language].labels.name}
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={form.name}
                      onChange={onChange("name")}
                      onBlur={onBlur("name")}
                      className={fieldClasses(form.name, touched.name)}
                      placeholder={i18n[form.language].placeholders.name}
                    />
                    {errorBelow(form.name, touched.name, i18n[form.language].labels.name)}
                  </div>
                  <div>
                    <label className="mb-1 block font-medium" htmlFor="jobTitle">
                      {i18n[form.language].labels.jobTitle}
                    </label>
                    <input
                      id="jobTitle"
                      type="text"
                      value={form.jobTitle}
                      onChange={onChange("jobTitle")}
                      onBlur={onBlur("jobTitle")}
                      className={fieldClasses(form.jobTitle, touched.jobTitle)}
                      placeholder={i18n[form.language].placeholders.jobTitle}
                    />
                    {errorBelow(form.jobTitle, touched.jobTitle, i18n[form.language].labels.jobTitle)}
                  </div>
                </div>

                {/* Company + Contact */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium" htmlFor="company">
                      {i18n[form.language].labels.company}
                    </label>
                    <input
                      id="company"
                      type="text"
                      value={form.company}
                      onChange={onChange("company")}
                      onBlur={onBlur("company")}
                      className={fieldClasses(form.company, touched.company)}
                      placeholder={i18n[form.language].placeholders.company}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium" htmlFor="contact">
                      {i18n[form.language].labels.contact}
                    </label>
                    <input
                      id="contact"
                      type="text"
                      value={form.contact}
                      onChange={onChange("contact")}
                      onBlur={onBlur("contact")}
                      className={fieldClasses(form.contact, touched.contact)}
                      placeholder={i18n[form.language].placeholders.contact}
                    />
                  </div>
                </div>

                {/* Header addresses */}
                {form.header && (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-medium" htmlFor="applicantAddress">
                          {i18n[form.language].labels.applicantAddress}
                        </label>
                        <textarea
                          id="applicantAddress"
                          rows={2}
                          value={form.applicantAddress}
                          onChange={onChange("applicantAddress")}
                          onBlur={onBlur("applicantAddress")}
                          className={fieldClasses(form.applicantAddress, touched.applicantAddress)}
                          placeholder={i18n[form.language].placeholders.applicantAddress}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block font-medium" htmlFor="companyAddress">
                          {i18n[form.language].labels.companyAddress}
                        </label>
                        <textarea
                          id="companyAddress"
                          rows={2}
                          value={form.companyAddress}
                          onChange={onChange("companyAddress")}
                          onBlur={onBlur("companyAddress")}
                          className={fieldClasses(form.companyAddress, touched.companyAddress)}
                          placeholder={i18n[form.language].placeholders.companyAddress}
                        />
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="mb-1 block font-medium" htmlFor="applicantLocation">
                        {i18n[form.language].labels.applicantLocation}
                      </label>
                      <input
                        id="applicantLocation"
                        type="text"
                        value={form.applicantLocation}
                        onChange={onChange("applicantLocation")}
                        onBlur={onBlur("applicantLocation")}
                        className={fieldClasses(form.applicantLocation, touched.applicantLocation)}
                        placeholder={i18n[form.language].placeholders.applicantLocation}
                      />
                    </div>
                  </div>
                )}

                {/* Experience */}
                <div>
                  <label className="mb-1 block font-medium" htmlFor="experience">
                    {i18n[form.language].labels.experience}
                  </label>
                  <textarea
                    id="experience"
                    rows={6}
                    value={form.experience}
                    onChange={onChange("experience")}
                    onBlur={onBlur("experience")}
                    className={fieldClasses(form.experience, touched.experience)}
                    placeholder={i18n[form.language].placeholders.experience}
                  />
                  {errorBelow(form.experience, touched.experience, i18n[form.language].labels.experience)}

                  {/* Counters */}
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-white/60">{i18n[form.language].counters.chars}: {countChars(form.experience)}</span>
                    <span className={statColor(expWords, LIMITS.experience)}>
                      {i18n[form.language].counters.words}: {expWords}{" "}
                      <span className="text-white/50">
                        ({i18n[form.language].counters.target(LIMITS.experience.minWords, LIMITS.experience.maxWords)})
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor(expWords, LIMITS.experience)}`}
                      style={{ width: `${percentToGoal(expWords, LIMITS.experience)}%` }}
                    />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="mb-1 block font-medium" htmlFor="skills">
                    {i18n[form.language].labels.skills}
                  </label>
                  <textarea
                    id="skills"
                    rows={4}
                    value={form.skills}
                    onChange={onChange("skills")}
                    onBlur={onBlur("skills")}
                    className={fieldClasses(form.skills, touched.skills)}
                    placeholder={i18n[form.language].placeholders.skills}
                  />
                  {errorBelow(form.skills, touched.skills, i18n[form.language].labels.skills)}

                  {/* Counters */}
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-white/60">{i18n[form.language].counters.chars}: {countChars(form.skills)}</span>
                    <span className={statColor(skillsWords, LIMITS.skills)}>
                      {i18n[form.language].counters.words}: {skillsWords}{" "}
                      <span className="text-white/50">
                        ({i18n[form.language].counters.target(LIMITS.skills.minWords, LIMITS.skills.maxWords)})
                      </span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${barColor(skillsWords, LIMITS.skills)}`}
                      style={{ width: `${percentToGoal(skillsWords, LIMITS.skills)}%` }}
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* Generate */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`rounded-xl px-4 py-2 font-medium text-white sm:flex-1 ${
                      loading ? "bg-white/30 cursor-wait" : "bg-indigo-600 hover:bg-indigo-500"
                    }`}
                  >
                    {loading ? i18n[form.language].buttons.generating : i18n[form.language].buttons.generate}
                  </button>

                  {/* PDF */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!result) return;
                      const { default: jsPDF } = await import("jspdf");
                      const doc = new jsPDF();
                      doc.setFontSize(12);
                      doc.text(result, 20, 20, { maxWidth: 170 });
                      doc.save(form.language === "en" ? "CoverLetter.pdf" : "Bewerbung.pdf");
                    }}
                    disabled={!result}
                    className={`rounded-xl px-4 py-2 font-medium text-white sm:flex-1 ${
                      result ? "bg-green-600 hover:bg-green-500" : "bg-white/30 cursor-not-allowed"
                    }`}
                  >
                    {i18n[form.language].buttons.pdf}
                  </button>

                  {/* DOCX */}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!result) return;
                      const docx = await import("docx");
                      const { Document, Packer, Paragraph, TextRun } = docx as any;

                      const paragraphs = result
                        .trim()
                        .split(/\n{2,}/)
                        .map((block: string) => {
                          const lines = block.split("\n");
                          const runs = lines.map((line, i) => (i === 0 ? new TextRun(line) : new TextRun({ text: line, break: 1 })));
                          return new Paragraph({ children: runs });
                        });

                      const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });

                      const blob = await Packer.toBlob(doc);
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = form.language === "en" ? "CoverLetter.docx" : "Bewerbung.docx";
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(url);
                    }}
                    disabled={!result}
                    className={`rounded-xl px-4 py-2 font-medium text-white sm:flex-1 ${
                      result ? "bg-blue-600 hover:bg-blue-500" : "bg-white/30 cursor-not-allowed"
                    }`}
                  >
                    {i18n[form.language].buttons.docx}
                  </button>

                  {/* Reset */}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-white/20 px-4 py-2 font-medium backdrop-blur hover:bg-white/10 sm:flex-1"
                  >
                    {i18n[form.language].buttons.reset}
                  </button>
                </div>
              </form>
            </section>

            {/* Tips / Examples sidebar */}
            <aside className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
              <h3 className="mb-3 text-lg font-semibold">{i18n[form.language].labels.tips}</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
                <li>{form.language === "en" ? "Use measurable results (e.g., time saved, error rate reduced)." : "Nutze messbare Ergebnisse (z. B. Zeitersparnis, Fehlerquote gesenkt)."}</li>
                <li>{form.language === "en" ? "Mirror keywords from the job ad for ATS." : "Übernimm Keywords aus der Stellenausschreibung (ATS)."}</li>
                <li>{form.language === "en" ? "Keep paragraphs short and focused." : "Halte Absätze kurz und fokussiert."}</li>
                <li>{form.language === "en" ? "Prefer active voice (" : "Nutze Aktiv statt Passiv ("}{form.language === "en" ? "I implemented" : "Ich habe umgesetzt"}{")"}</li>
              </ul>

              <h3 className="mb-2 mt-6 text-lg font-semibold">{i18n[form.language].labels.examples}</h3>
              <div className="space-y-2 text-sm text-white/70">
                <div className="rounded-lg border border-white/10 p-3">
                  <p className="font-medium">Achievement</p>
                  <p>{form.language === "en" ? "Reduced processing time by 35% by streamlining the intake process and automating recurring steps." : "Bearbeitungszeit um 35% reduziert, indem ich den Intake-Prozess verschlankt und wiederkehrende Schritte automatisiert habe."}</p>
                </div>
                <div className="rounded-lg border border-white/10 p-3">
                  <p className="font-medium">Customer Impact</p>
                  <p>{form.language === "en" ? "Raised CSAT from 4.2 to 4.7 through proactive follow-ups and standardized responses." : "CSAT von 4,2 auf 4,7 gesteigert durch proaktive Follow-ups und standardisierte Antworten."}</p>
                </div>
              </div>
            </aside>
          </div>

          {/* Preview */}
          {result && (
            <section id="preview" className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">{i18n[form.language].labels.preview}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/70">
                    {i18n[form.language].counters.words}: {result.trim() ? result.trim().split(/\s+/).length : 0}
                  </span>
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(result); }}
                    className="rounded-lg border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
                    title={i18n[form.language].buttons.copy}
                  >
                    {i18n[form.language].buttons.copy}
                  </button>
                </div>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed text-white/90">{result}</pre>
            </section>
          )}

          {/* Fallback note */}
          {errorMsg && <p className="mt-3 text-sm text-amber-300">{errorMsg}</p>}
        </main>
      </div>
    </>
  );
}
TSX