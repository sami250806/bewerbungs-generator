// app/page.tsx
"use client";
import Link from "next/link";
import { useState, useEffect, FormEvent, useMemo } from "react";

/* ===================== Utilities ===================== */
function dataURLtoUint8Array(dataURL: string): Uint8Array {
  const base64 = dataURL.split(",")[1] || "";
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function getImageSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = dataUrl;
  });
}

const pxToMm = (px: number) => (px * 25.4) / 96;
const fullName = (first = "", last = "") =>
  [first.trim(), last.trim()].filter(Boolean).join(" ").trim();

const parseName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts.slice(0, -1).join(" "), lastName: parts.slice(-1)[0] };
};

/* ===================== Types ===================== */
type LetterStyle =
  | "formal" | "modern" | "friendly" | "concise" | "enthusiastic"
  | "professional" | "casual" | "sales" | "academic" | "persuasive";
type Language = "de" | "en" | "fr" | "es" | "nl" | "ar" | "pt";
type LengthTarget = "short" | "medium" | "long";

type FormState = {
  name: string;
  firstName?: string;
  lastName?: string;
  phone: string;
  email: string;
  linkedin: string;
  jobTitle: string;
  company: string;
  contact: string;
  experience: string;
  skills: string;
  style: LetterStyle;
  language: Language;
  length: LengthTarget;
  header: boolean;
  applicantAddress: string;
  applicantLocation: string;
  companyAddress: string;
  bulletPoints: boolean;
};

/* ===================== i18n ===================== */
const i18n = {
  en: {
    appTitle: "Cover Letter Generator",
    intro:
      "Write a convincing cover letter — choose language & style, review the text, then download as PDF/DOCX.",
    labels: {
      language: "Language",
      style: "Cover letter style",
      length: "Length",
      header: "Include letterhead + addresses",
      bulletPoints: "Use bullet points for experience & skills",
      name: "Name*",
      firstName: "First name*",
      lastName: "Last name*",
      phone: "Phone (optional)",
      email: "Email (optional)",
      linkedin: "LinkedIn (optional)",
      jobTitle: "Desired Position*",
      company: "Company (optional)",
      contact: "Contact person (optional)",
      experience: "Experience (short)*",
      skills: "Skills (comma-separated)*",
      applicantAddress: "Your address (optional)",
      applicantLocation: "City / Location for date (optional)",
      companyAddress: "Company address (optional)",
      photo: "Photo (optional, JPG/PNG)",
      preview: "Your cover letter preview",
      tips: "Tips",
      examples: "Examples",
    },
    placeholders: {
      name: "Jane Doe",
      firstName: "Jane",
      lastName: "Doe",
      phone: "+44 7123 456789",
      email: "jane.doe@mail.com",
      linkedin: "https://www.linkedin.com/in/janedoe",
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
    lengthOptions: { short: "Short", medium: "Medium", long: "Long" },
    buttons: {
      generate: "Generate cover letter",
      generating: "Generating…",
      pdf: "Download PDF",
      docx: "Download DOCX",
      reset: "Reset",
      copy: "Copy",
    },
    counters: { chars: "Characters", words: "Words" },
    fallbackNote: "AI not reachable — showing local draft (English).",
    required: (label: string) => `${label.replace("*", "")} is required.`,
    dateLabel: "Date",
    salHiringTeam: "Hiring Team",
    phoneLabel: "Phone",
  },
  de: {
    appTitle: "Bewerbungs-Generator",
    intro:
      "Schreibe ein überzeugendes Anschreiben — Sprache & Stil wählen, Text prüfen, dann als PDF/DOCX herunterladen.",
    labels: {
      language: "Sprache",
      style: "Stil des Anschreibens",
      length: "Länge",
      header: "Briefkopf + Adressen einfügen",
      bulletPoints: "Stichpunkte für Erfahrung & Skills verwenden",
      name: "Name*",
      firstName: "Vorname*",
      lastName: "Nachname*",
      phone: "Telefon (optional)",
      email: "E-Mail (optional)",
      linkedin: "LinkedIn (optional)",
      jobTitle: "Gewünschte Stelle*",
      company: "Firma (optional)",
      contact: "Ansprechpartner:in (optional)",
      experience: "Erfahrung (kurz)*",
      skills: "Skills (kommagetrennt)*",
      applicantAddress: "Eigene Adresse (optional)",
      applicantLocation: "Ort für Datumszeile (optional)",
      companyAddress: "Firmenadresse (optional)",
      photo: "Foto (optional, JPG/PNG)",
      preview: "Vorschau deines Anschreibens",
      tips: "Tipps",
      examples: "Beispiele",
    },
    placeholders: {
      name: "Max Mustermann",
      firstName: "Max",
      lastName: "Mustermann",
      phone: "+49 1512 3456789",
      email: "max.mustermann@mail.com",
      linkedin: "https://www.linkedin.com/in/maxmustermann",
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
    lengthOptions: { short: "Kurz", medium: "Mittel", long: "Lang" },
    buttons: {
      generate: "Anschreiben generieren",
      generating: "Generiere…",
      pdf: "Als PDF herunterladen",
      docx: "Als DOCX herunterladen",
      reset: "Zurücksetzen",
      copy: "Kopieren",
    },
    counters: { chars: "Zeichen", words: "Wörter" },
    fallbackNote: "KI nicht erreichbar – zeige lokalen Entwurf (Deutsch).",
    required: (label: string) => `${label.replace("*", "")} ist ein Pflichtfeld.`,
    dateLabel: "Datum",
    salHiringTeam: "Recruiting-Team",
    phoneLabel: "Telefon",
  },
  fr: {} as any, es: {} as any, nl: {} as any, ar: {} as any, pt: {} as any,
} as const;

/* ===================== Defaults ===================== */
const DEFAULT_FORM: FormState = {
  name: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  linkedin: "",
  jobTitle: "",
  company: "",
  contact: "",
  experience: "",
  skills: "",
  style: "formal",
  language: "en",
  length: "medium",
  header: false,
  applicantAddress: "",
  applicantLocation: "",
  companyAddress: "",
  bulletPoints: false,
};

/* ===================== Component ===================== */
export default function Home() {
  // Login-Redirect nur als Effekt – keine bedingte Hooks-Ausführung
  useEffect(() => {
    try {
      const ok = localStorage.getItem("access") === "granted";
      const onLogin = typeof window !== "undefined" && window.location.pathname.startsWith("/login");
      if (!ok && !onLogin) window.location.replace("/login");
    } catch {}
  }, []);

  // --- ab hier: alle Hooks laufen immer ---
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  const [touched, setTouched] = useState<Record<keyof FormState, boolean>>({
    name: false, firstName: false, lastName: false,
    phone: false, email: false, linkedin: false,
    jobTitle: false, company: false, contact: false,
    experience: false, skills: false,
    style: false, language: false, length: false,
    header: false, applicantAddress: false, applicantLocation: false,
    companyAddress: false, bulletPoints: false,
  });

  /* LocalStorage load/save */
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bg_form");
      if (saved) {
        const parsed = JSON.parse(saved) || {};
        setForm({
          ...DEFAULT_FORM,
          ...parsed,
          name: parsed.name ?? fullName(parsed.firstName || "", parsed.lastName || ""),
          style: parsed.style ?? "formal",
          language: parsed.language ?? "en",
          length: parsed.length ?? "medium",
          header: !!parsed.header,
          bulletPoints: !!parsed.bulletPoints,
        });
      }
      const savedPhoto = localStorage.getItem("bg_photo");
      if (savedPhoto) setPhotoDataUrl(savedPhoto);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem("bg_form", JSON.stringify(form)); } catch {}
  }, [form]);

  /* Auto-scroll preview */
  useEffect(() => {
    if (!loading && result) {
      document.getElementById("preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading, result]);

  const t = i18n[form.language] as any;

  /* Helpers */
  const onChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const target = e.target as HTMLInputElement;
      const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
      setForm((prev) => ({ ...prev, [field]: value as any }));
    };
  const onBlur = (field: keyof FormState) => () => setTouched((s) => ({ ...s, [field]: true }));
  const isEmpty = (v: string) => v.trim().length === 0;

  const fieldClasses = (value: string, wasTouched: boolean) =>
    [
      "w-full rounded-xl border bg-white/10 px-3 py-2 text-white outline-none transition",
      "focus:ring-2 focus:ring-indigo-300",
      wasTouched && isEmpty(value) ? "border-red-400" : "border-white/20",
      "placeholder:text-white/60",
    ].join(" ");

  const countWords = (txt: string) => (txt.trim() ? txt.trim().split(/\s+/).length : 0);

  const LIMITS = {
    experience: { minWords: 40, maxWords: 180 },
    skills: { minWords: 8, maxWords: 60 },
  } as const;

  const statColor = (w: number, { minWords, maxWords }: { minWords: number; maxWords: number }) => {
    if (!w) return "text-white/70";
    if (w < minWords) return "text-amber-300";
    if (w > maxWords) return "text-amber-300";
    return "text-emerald-300";
  };
  const percentToGoal = (w: number, { minWords, maxWords }: { minWords: number; maxWords: number }) => {
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

  /* Header for local fallback */
  const buildSimpleHeader = (f: FormState, parsed = parseName(f.name)) => {
    const date = new Date().toLocaleDateString(
      f.language === "en" ? "en-GB" : f.language === "ar" ? "ar-EG" : "de-DE",
      { year: "numeric", month: "long", day: "numeric" }
    );
    const dateLabel = i18n[f.language as Language].dateLabel;
    const phoneLabel = i18n[f.language as Language].phoneLabel;

    const contacts = [
      f.phone?.trim() ? `${phoneLabel}: ${f.phone.trim()}` : null,
      f.email?.trim() || null,
      f.linkedin?.trim() || null,
    ].filter(Boolean).join(" · ");

    const lines = [
      fullName(parsed.firstName, parsed.lastName) || "—",
      f.applicantAddress?.trim(),
      f.applicantLocation?.trim(),
      contacts || null,
      "",
      f.company?.trim(),
      f.companyAddress?.trim(),
      "",
      `${dateLabel}: ${date}`,
    ].filter(Boolean) as string[];

    return lines.join("\n");
  };

  const bulletize = (text: string) =>
    text.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean).map((s) => `• ${s}`).join("\n");

  /* Letter builder */
  const buildLetter = (f: FormState) => {
    const parsed = parseName(f.name || fullName(f.firstName, f.lastName));
    const headerBlock = f.header ? buildSimpleHeader(f, parsed) + "\n\n" : "";
    const expRaw = f.experience.trim();
    const skillsRaw = f.skills.split(",").map((s) => s.trim()).filter(Boolean).join(", ");

    const nameStr = fullName(parsed.firstName, parsed.lastName) || "—";
    const companyPart =
      f.company
        ? ` ${
            f.language === "en" ? "at" :
            f.language === "fr" ? "chez" :
            f.language === "es" ? "en" :
            f.language === "nl" ? "bij" :
            f.language === "pt" ? "na" :
            f.language === "ar" ? "في" :
            "bei"
          } ${f.company}`
        : "";

    const useBullets = false;
    const expBlock = useBullets ? (expRaw ? bulletize(expRaw) : "-") : (expRaw || "-");
    const skillsBlock = useBullets ? (skillsRaw ? bulletize(skillsRaw) : "-") : (skillsRaw || "-");

    switch (f.language) {
      case "en": {
        const sal = `Dear ${f.contact?.trim() || i18n.en.salHiringTeam},`;
        const intro = `${sal}\n\nI am excited to apply for the ${f.jobTitle}${companyPart}.`;
        const exp = useBullets
          ? `Key experience:\n${expBlock}`
          : `In my previous roles, I gained the following experience: ${expBlock}`;
        const skl = useBullets
          ? `Core strengths:\n${skillsBlock}`
          : `My core strengths include: ${skillsBlock}`;
        const outro = `I would be happy to discuss how I can support your team.\n\nKind regards\n${nameStr}`;
        return headerBlock + [intro, exp, skl, outro].join("\n\n");
      }
      case "de": {
        const lower = f.contact?.toLowerCase() || "";
        const sal = lower.includes("frau") ? `Sehr geehrte ${f.contact},`
          : lower.includes("herr") ? `Sehr geehrter ${f.contact},`
          : "Sehr geehrte Damen und Herren,";
        const intro = `${sal}\n\nmit großem Interesse bewerbe ich mich für die Position als ${f.jobTitle}${companyPart}.`;
        const exp = useBullets
          ? `Wesentliche Erfahrungen:\n${expBlock}`
          : `In meiner bisherigen Laufbahn konnte ich folgende Erfahrungen sammeln: ${expBlock}`;
        const skl = useBullets
          ? `Stärken:\n${skillsBlock}`
          : `Zu meinen Stärken zählen: ${skillsBlock}`;
        const outro = `Gern erläutere ich Ihnen im Gespräch, wie ich Ihr Team unterstützen kann.\n\nMit freundlichen Grüßen\n${nameStr}`;
        return headerBlock + [intro, exp, skl, outro].join("\n\n");
      }
      default: {
        const sal = `Dear ${f.contact || "Hiring Team"},`;
        const intro = `${sal}\n\nI am excited to apply for the ${f.jobTitle}${companyPart}.`;
        const exp = useBullets ? `Experience:\n${expBlock}` : `Experience: ${expBlock}`;
        const skl = useBullets ? `Skills:\n${skillsBlock}` : `Skills: ${skillsBlock}`;
        const outro = `Kind regards\n${nameStr}`;
        return headerBlock + [intro, exp, skl, outro].join("\n\n");
      }
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await runGenerate();
  };

  const runGenerate = async () => {
    setErrorMsg(null);
    const hasName = (form.name || "").trim().length > 0 || (form.firstName || form.lastName);
    if (!hasName || !form.jobTitle.trim() || !form.experience.trim() || !form.skills.trim()) {
      setTouched((t) => ({ ...t, name: true, jobTitle: true, experience: true, skills: true }));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        body: JSON.stringify({
          ...form,
          ...parseName(form.name || fullName(form.firstName, form.lastName)),
          variation: `seed:${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      setResult(data?.result || "");
      setErrorMsg(data?.source === "fallback" ? i18n[form.language].fallbackNote : null);
    } catch {
      setResult(buildLetter(form));
      setErrorMsg(i18n[form.language].fallbackNote);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(DEFAULT_FORM);
    setResult("");
    setErrorMsg(null);
    setTouched({
      name: false, firstName: false, lastName: false,
      phone: false, email: false, linkedin: false,
      jobTitle: false, company: false, contact: false,
      experience: false, skills: false,
      style: false, language: false, length: false,
      header: false, applicantAddress: false, applicantLocation: false,
      companyAddress: false, bulletPoints: false,
    });
    localStorage.removeItem("bg_form");
    localStorage.removeItem("bg_photo");
    setPhotoDataUrl(null);
  };

  const expWords = useMemo(() => countWords(form.experience), [form.experience]);
  const skillsWords = useMemo(() => countWords(form.skills), [form.skills]);

  /* PDF Export */
  async function exportPDF() {
    if (!result) return;
    const { default: jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4", compress: true });

    const marginL = 20, marginR = 20, marginT = 20, marginB = 20;
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const usableW = pageW - marginL - marginR;

    let cursorY = marginT;

    /* ---------- Header (mit/ohne Foto) ---------- */
    try {
      if (photoDataUrl) {
        let targetWmm = 35, targetHmm = 35;
        try {
          const size = await getImageSize(photoDataUrl);
          if (size.width && size.height) {
            const maxW = pxToMm(size.width);
            const maxH = pxToMm(size.height);
            const ratio = Math.min(targetWmm / maxW, targetHmm / maxH);
            targetWmm = Math.max(18, Math.min(35, maxW * ratio));
            targetHmm = Math.max(18, Math.min(35, maxH * ratio));
          }
        } catch {}

        const photoX = pageW - marginR - targetWmm;
        const photoY = cursorY;

        const format = photoDataUrl.startsWith("data:image/png") ? "PNG" : "JPEG";
        doc.addImage(photoDataUrl, format as any, photoX, photoY, targetWmm, targetHmm);

        const headerX = marginL;
        const textBoxW = usableW - targetWmm - 8;

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(fullName(form.firstName, form.lastName) || "—", headerX, photoY + 5);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const contactLine = [
          form.phone ? `${i18n[form.language].phoneLabel}: ${form.phone}` : null,
          form.email || null,
          form.linkedin || null,
        ].filter(Boolean).join(" · ");

        let y = photoY + 10;
        const blocks = [contactLine, form.applicantAddress || "", form.applicantLocation || ""].filter(Boolean);
        blocks.forEach((ln) => {
          const lines = doc.splitTextToSize(ln, textBoxW);
          lines.forEach((c: string) => {
            doc.text(c, headerX, y);
            y += 5;
          });
        });

        const date = new Date().toLocaleDateString(
          form.language === "en" ? "en-GB" : form.language === "ar" ? "ar-EG" : "de-DE",
          { year: "numeric", month: "long", day: "numeric" }
        );
        const dateLabel = i18n[form.language].dateLabel;
        const companyBlock = [form.company, ...(form.companyAddress ? form.companyAddress.split("\n") : [])]
          .filter(Boolean)
          .join(" · ");
        const footerHeader = [companyBlock, `${dateLabel}: ${date}`].filter(Boolean).join("   |   ");
        doc.text(doc.splitTextToSize(footerHeader, textBoxW), headerX, y);

        cursorY = Math.max(photoY + targetHmm, y) + 10;
      } else {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text(fullName(form.firstName, form.lastName) || "—", marginL, cursorY + 5);

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        const contactLine = [
          form.phone ? `${i18n[form.language].phoneLabel}: ${form.phone}` : null,
          form.email || null,
          form.linkedin || null,
        ].filter(Boolean).join(" · ");
        const lines = [contactLine, form.applicantAddress || "", form.applicantLocation || ""]
          .filter(Boolean).join(" · ");

        let y = cursorY + 10;
        doc.splitTextToSize(lines, usableW).forEach((c: string) => {
          doc.text(c, marginL, y);
          y += 5;
        });
        cursorY = y + 8;
      }
    } catch {
      cursorY = Math.max(cursorY, marginT + 20);
    }

    /* ---------- Body ---------- */
    doc.setFont("times", "normal");
    doc.setFontSize(12);

    const paragraphs = result.trim().split(/\n{2,}/);
    paragraphs.forEach((block, idx) => {
      const lines = doc.splitTextToSize(block, usableW);
      lines.forEach((ln: string) => {
        if (cursorY + 6 > pageH - marginB) {
          doc.addPage();
          cursorY = marginT;
        }
        doc.text(ln, marginL, cursorY);
        cursorY += 6;
      });
      if (idx < paragraphs.length - 1) cursorY += 6;
    });

    doc.save(form.language === "en" ? "CoverLetter.pdf" : "Bewerbung.pdf");
  }

  /* DOCX Export */
  async function exportDOCX() {
    if (!result) return;
    const docx = await import("docx");
    const { Document, Packer, Paragraph, TextRun, Media } = docx as any;

    const doc = new Document();
    const children: any[] = [];

    if (photoDataUrl) {
      try {
        const bytes = dataURLtoUint8Array(photoDataUrl);
        const image = Media.addImage(doc, bytes, 132, 132);
        children.push(new Paragraph(image));
      } catch {}
    }

    const nameRun = new TextRun({
      text: form.name || fullName(form.firstName, form.lastName) || "—",
      bold: true,
    });

    const contactRuns = [
      nameRun,
      form.phone ? new TextRun({ text: `\n${i18n[form.language].phoneLabel}: ${form.phone}` }) : null,
      form.email ? new TextRun({ text: `\n${form.email}` }) : null,
      form.linkedin ? new TextRun({ text: `\n${form.linkedin}` }) : null,
    ].filter(Boolean) as any[];

    children.push(new Paragraph({ children: contactRuns }));
    children.push(new Paragraph({ children: [new TextRun({ text: " " })] }));

    const paragraphs = result.trim().split(/\n{2,}/).map((block: string) => {
      const lines = block.split("\n");
      const runs = lines.map((line, i) => (i === 0 ? new TextRun(line) : new TextRun({ text: line, break: 1 })));
      return new Paragraph({ children: runs });
    });

    children.push(...paragraphs);
    doc.addSection({ properties: {}, children });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = form.language === "en" ? "CoverLetter.docx" : "Bewerbung.docx";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /* ===================== Render ===================== */
  return (
    <>
      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/10 border-b border-yellow-500/30 backdrop-blur px-4 py-2 text-center text-sm text-white">
          <span className="font-medium">Generierung läuft…</span> Bitte warten.
        </div>
      )}

      <div dir={form.language === "ar" ? "rtl" : "ltr"} className="glass-gradient text-slate-900">
        <main className="mx-auto max-w-5xl px-4 py-10">
          <header className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow">
              {t.appTitle}
            </h1>
            <p className="mt-1 text-white/80">{t.intro}</p>
          </header>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 glass-card p-6">
              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Top controls */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="language">
                      {t.labels.language}
                    </label>
                    <select
                      id="language"
                      value={form.language}
                      onChange={onChange("language")}
                      onBlur={onBlur("language")}
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="en">English</option>
                      <option value="de">Deutsch</option>
                      <option value="fr">Français</option>
                      <option value="es">Español</option>
                      <option value="nl">Nederlands</option>
                      <option value="ar">العربية</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="style">
                      {t.labels.style}
                    </label>
                    <select
                      id="style"
                      value={form.style}
                      onChange={onChange("style")}
                      onBlur={onBlur("style")}
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="formal">{t.styleOptions.formal}</option>
                      <option value="modern">{t.styleOptions.modern}</option>
                      <option value="friendly">{t.styleOptions.friendly}</option>
                      <option value="concise">{t.styleOptions.concise}</option>
                      <option value="enthusiastic">{t.styleOptions.enthusiastic}</option>
                      <option value="professional">{t.styleOptions.professional}</option>
                      <option value="casual">{t.styleOptions.casual}</option>
                      <option value="sales">{t.styleOptions.sales}</option>
                      <option value="academic">{t.styleOptions.academic}</option>
                      <option value="persuasive">{t.styleOptions.persuasive}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label className="mb-1 block font-medium text-white" htmlFor="length">
                      {t.labels.length}
                    </label>
                    <select
                      id="length"
                      value={form.length}
                      onChange={onChange("length")}
                      onBlur={onBlur("length")}
                      className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-white outline-none focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="short">{i18n[form.language].lengthOptions.short}</option>
                      <option value="medium">{i18n[form.language].lengthOptions.medium}</option>
                      <option value="long">{i18n[form.language].lengthOptions.long}</option>
                    </select>
                  </div>

                  <div className="hidden" />

                  <label className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-white">
                    <input
                      type="checkbox"
                      checked={form.header}
                      onChange={onChange("header")}
                      onBlur={onBlur("header")}
                      className="h-4 w-4 rounded border-white/30 bg-white/10"
                    />
                    <span className="text-sm">{t.labels.header}</span>
                  </label>
                </div>

                {/* Name + Position */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="name">
                      {t.labels.name}
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
                    {touched.name && isEmpty(form.name) && (
                      <p className="mt-1 text-sm text-red-300">{t.required(t.labels.name)}</p>
                    )}
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="jobTitle">
                      {t.labels.jobTitle}
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
                    {touched.jobTitle && isEmpty(form.jobTitle) && (
                      <p className="mt-1 text-sm text-red-300">{t.required(t.labels.jobTitle)}</p>
                    )}
                  </div>
                </div>

                {/* Company + Contact */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="company">
                      {t.labels.company}
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
                    <label className="mb-1 block font-medium text-white" htmlFor="contact">
                      {t.labels.contact}
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

                {/* Contact details row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="phone">
                      {t.labels.phone}
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={form.phone}
                      onChange={onChange("phone")}
                      onBlur={onBlur("phone")}
                      className={fieldClasses(form.phone, touched.phone)}
                      placeholder={i18n[form.language].placeholders.phone}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="email">
                      {t.labels.email}
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={onChange("email")}
                      onBlur={onBlur("email")}
                      className={fieldClasses(form.email, touched.email)}
                      placeholder={i18n[form.language].placeholders.email}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="linkedin">
                      {t.labels.linkedin}
                    </label>
                    <input
                      id="linkedin"
                      type="url"
                      value={form.linkedin}
                      onChange={onChange("linkedin")}
                      onBlur={onBlur("linkedin")}
                      className={fieldClasses(form.linkedin, touched.linkedin)}
                      placeholder={i18n[form.language].placeholders.linkedin}
                    />
                  </div>
                </div>

                {/* Header addresses (optional) */}
                {form.header && (
                  <div className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-medium text-white" htmlFor="applicantAddress">
                          {t.labels.applicantAddress}
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
                        <label className="mb-1 block font-medium text-white" htmlFor="companyAddress">
                          {t.labels.companyAddress}
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

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block font-medium text-white" htmlFor="applicantLocation">
                          {t.labels.applicantLocation}
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
                  </div>
                )}

                {/* Foto */}
                <div className="rounded-xl border border-white/15 bg-white/5 p-4 backdrop-blur">
                  <div>
                    <label className="mb-1 block font-medium text-white" htmlFor="photo">
                      {t.labels.photo}
                    </label>
                    <input
                      id="photo"
                      type="file"
                      accept="image/png,image/jpeg"
                      className="block w-full text-sm text-white/90 file:mr-3 file:rounded-lg file:border file:border-white/20 file:bg-white/10 file:px-3 file:py-1 file:text-white hover:file:bg-white/20"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) {
                          setPhotoDataUrl(null);
                          localStorage.removeItem("bg_photo");
                          return;
                        }
                        const reader = new FileReader();
                        reader.onload = () => {
                          const dataUrl = String(reader.result || "");
                          setPhotoDataUrl(dataUrl);
                          try { localStorage.setItem("bg_photo", dataUrl); } catch {}
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                    {photoDataUrl && (
                      <div className="mt-2">
                        <img src={photoDataUrl} alt="Preview" className="h-24 w-24 rounded-lg object-cover ring-1 ring-white/20" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <label className="mb-1 block font-medium text-white" htmlFor="experience">
                    {t.labels.experience}
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
                  {touched.experience && isEmpty(form.experience) && (
                    <p className="mt-1 text-sm text-red-300">{t.required(t.labels.experience)}</p>
                  )}

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-white/80">{t.counters.chars}: {form.experience.length}</span>
                    <span className={statColor(expWords, LIMITS.experience)}>
                      {t.counters.words}: {expWords} <span className="opacity-70">(Target 40–180)</span>
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-white/15">
                    <div className={`h-full rounded-full transition-all ${barColor(expWords, LIMITS.experience)}`} style={{ width: `${percentToGoal(expWords, LIMITS.experience)}%` }} />
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className="mb-1 block font-medium text-white" htmlFor="skills">
                    {t.labels.skills}
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
                  {touched.skills && isEmpty(form.skills) && (
                    <p className="mt-1 text-sm text-red-300">{t.required(t.labels.skills)}</p>
                  )}

                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-white/80">{t.counters.chars}: {form.skills.length}</span>
                    <span className={statColor(skillsWords, LIMITS.skills)}>{t.counters.words}: {skillsWords}</span>
                  </div>
                  <div className="mt-1 h-2 w-full rounded-full bg-white/15">
                    <div className={`h-full rounded-full transition-all ${barColor(skillsWords, LIMITS.skills)}`} style={{ width: `${percentToGoal(skillsWords, LIMITS.skills)}%` }} />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`rounded-xl px-4 py-2 font-medium text-white sm:flex-1 ${loading ? "bg-white/30 cursor-wait" : "bg-indigo-600 hover:bg-indigo-500"}`}
                  >
                    {loading ? t.buttons.generating : t.buttons.generate}
                  </button>
                  <button
                    type="button"
                    onClick={exportPDF}
                    disabled={!result}
                    className={`rounded-xl px-4 py-2 font-medium text-white sm:flex-1 ${result ? "bg-green-600 hover:bg-green-500" : "bg-white/30 cursor-not-allowed"}`}
                  >
                    {t.buttons.pdf}
                  </button>
                  <button
                    type="button"
                    onClick={exportDOCX}
                    disabled={!result}
                    className={`rounded-xl px-4 py-2 font-medium text-white sm:flex-1 ${result ? "bg-blue-600 hover:bg-blue-500" : "bg-white/30 cursor-not-allowed"}`}
                  >
                    {t.buttons.docx}
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="rounded-xl border border-white/25 px-4 py-2 font-medium text-white/90 backdrop-blur hover:bg-white/10 sm:flex-1"
                  >
                    {t.buttons.reset}
                  </button>
                </div>
              </form>
            </section>

            {/* Sidebar */}
            <aside className="glass-card p-6">
              <h3 className="mb-3 text-lg font-semibold text-white">{t.labels.tips}</h3>
              <ul className="list-disc space-y-2 pl-5 text-sm text-white/80">
                <li>{form.language === "en" ? "Use measurable results (e.g., time saved, error rate reduced)." : "Nutze messbare Ergebnisse (z. B. Zeitersparnis, Fehlerquote gesenkt)."}</li>
                <li>{form.language === "en" ? "Mirror keywords from the job ad for ATS." : "Übernimm Keywords aus der Stellenausschreibung (ATS)."}</li>
                <li>{form.language === "en" ? "Keep paragraphs short and focused." : "Halte Absätze kurz und fokussiert."}</li>
                <li>{form.language === "en" ? "Prefer active voice (I implemented)." : "Nutze Aktiv statt Passiv (Ich habe umgesetzt)."}</li>
              </ul>

              <h3 className="mb-2 mt-6 text-lg font-semibold text-white">{t.labels.examples}</h3>
              <div className="space-y-2 text-sm text-white/80">
                <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                  <p className="font-medium">Achievement</p>
                  <p>{form.language === "en"
                    ? "Reduced processing time by 35% by streamlining the intake process and automating recurring steps."
                    : "Bearbeitungszeit um 35% reduziert, indem ich den Intake-Prozess verschlankt und wiederkehrende Schritte automatisiert habe."}</p>
                </div>
                <div className="rounded-lg border border-white/15 bg-white/5 p-3">
                  <p className="font-medium">Customer Impact</p>
                  <p>{form.language === "en"
                    ? "Raised CSAT from 4.2 to 4.7 through proactive follow-ups and standardized responses."
                    : "CSAT von 4,2 auf 4,7 gesteigert durch proaktive Follow-ups und standardisierte Antworten."}</p>
                </div>
              </div>
            </aside>
          </div>

          {/* Preview */}
          {result && (
            <section id="preview" className="mt-6 glass-card p-6">
              {photoDataUrl && (
                <div className="mb-4 flex items-center gap-4">
                  <img src={photoDataUrl} alt="Applicant" className="h-24 w-24 rounded-xl object-cover ring-1 ring-white/20" />
                  <div className="text-sm text-white/80">
                    <div className="font-medium">{form.name || "—"}</div>
                    {form.phone && <div>{i18n[form.language].phoneLabel}: {form.phone}</div>}
                    {form.email && <div>{form.email}</div>}
                    {form.linkedin && <div>{form.linkedin}</div>}
                  </div>
                </div>
              )}

              <div className="mb-3 flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold text-white">{t.labels.preview}</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-white/80">
                    {t.counters.words}: {result.trim() ? result.trim().split(/\s+/).length : 0}
                  </span>
                  <button
                    onClick={async () => { await navigator.clipboard.writeText(result); }}
                    className="rounded-lg border border-white/25 px-3 py-1 text-sm text-white hover:bg-white/10"
                    title={t.buttons.copy}
                  >
                    {t.buttons.copy}
                  </button>
                </div>
              </div>

              <pre className="whitespace-pre-wrap leading-relaxed text-white/95">{result}</pre>
            </section>
          )}

          {errorMsg && <p className="mt-3 text-sm text-amber-300">{errorMsg}</p>}

          {/* ===== Footer ===== */}
          <footer className="mt-10 border-t border-white/10 pt-6 text-center">
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm">
              <Link href="/impressum" className="text-white/80 hover:text-white underline-offset-4 hover:underline">
                Impressum
              </Link>
              <span className="text-white/30">•</span>
              <Link href="/datenschutz" className="text-white/80 hover:text-white underline-offset-4 hover:underline">
                Datenschutz
              </Link>
            </div>
            <p className="mt-3 text-xs text-white/50">
              © {new Date().getFullYear()} Bewerbungs-Generator
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}