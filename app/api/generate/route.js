// src/app/api/generate/route.js
import { NextResponse } from "next/server";
import OpenAI from "openai";

/* ---------- Helpers ---------- */
function buildGermanSalutation(contactRaw) {
  const c = (contactRaw || "").trim();
  if (!c) return "Sehr geehrte Damen und Herren,";
  const low = c.toLowerCase();
  if (low.includes("frau")) return `Sehr geehrte ${c},`;
  if (low.includes("herr")) return `Sehr geehrter ${c},`;
  return `Sehr geehrte Damen und Herren (${c}),`;
}
function buildEnglishSalutation(contactRaw) {
  const c = (contactRaw || "").trim();
  return `Dear ${c || "Hiring Team"},`;
}
function styleHint(style, lang) {
  const map = {
    formal:      { en: "classic, respectful, complete sentences", de: "klassisch, respektvoll, vollständige Sätze" },
    modern:      { en: "modern, direct, clear value focus",        de: "modern, direkt, klarer Nutzenfokus" },
    friendly:    { en: "friendly, warm, yet professional",         de: "freundlich, warm, dennoch professionell" },
    concise:     { en: "concise, factual, short paragraphs",       de: "knapp, sachlich, kurze Absätze" },
    enthusiastic:{ en: "positive, energetic but not exaggerated",  de: "positiv, energiegeladen, aber nicht überzogen" },
    professional:{ en: "precise, quality-focused, reliable tone",  de: "präzise, qualitätsorientiert, verlässlich" },
    casual:      { en: "relaxed, simple language, still polite",   de: "locker, einfache Sprache, dennoch höflich" },
    sales:       { en: "sales-oriented, outcomes & benefits",      de: "vertrieblich, Ergebnisse & Nutzen" },
    academic:    { en: "analytical, structured, formal register",  de: "analytisch, strukturiert, formeller Stil" },
    persuasive:  { en: "persuasive, evidence-backed claims",       de: "überzeugend, mit Belegen/Beispielen" },
  };
  return (map[style] || map.formal)[lang];
}
function headerBlock({ language, name, company, applicantAddress, applicantLocation, companyAddress }) {
  const date = new Date().toLocaleDateString(language === "en" ? "en-GB" : "de-DE", {
    year: "numeric", month: "long", day: "numeric",
  });

  const linesTop = [
    applicantAddress?.trim() ? applicantAddress.trim() : null,
    applicantLocation?.trim() ? applicantLocation.trim() : null,
  ].filter(Boolean);

  const linesCompany = [
    company?.trim() ? company.trim() : null,
    companyAddress?.trim() ? companyAddress.trim() : null,
  ].filter(Boolean);

  const dateLabel = language === "en" ? "Date" : "Datum";
  const composed = [
    name,
    ...linesTop,
    "",
    ...linesCompany,
    "",
    `${dateLabel}: ${date}`,
  ].filter((l) => l !== null);

  return composed.join("\n");
}

/* ---------- Local Fallback (no API key / error) ---------- */
function localFallback(data) {
  const {
    language = "en",
    style = "formal",
    name = "",
    jobTitle = "",
    company = "",
    contact = "",
    experience = "",
    skills = "",
    length = "medium",
    bullets = false,
    header = false,
    applicantAddress = "",
    applicantLocation = "",
    companyAddress = "",
  } = data || {};

  const lang = language === "de" ? "de" : "en";
  const sal = lang === "de" ? buildGermanSalutation(contact) : buildEnglishSalutation(contact);

  const fmtBullets = (arr) => arr.map((s) => (s ? `• ${s}` : "")).filter(Boolean).join("\n");
  const expBullets = experience
    .split(/\n|\./)
    .map((s) => s.trim())
    .filter(Boolean);
  const skillsList = skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const exp =
    bullets
      ? fmtBullets(expBullets)
      : (experience || "").trim();

  const sk =
    bullets
      ? fmtBullets(skillsList)
      : (skills || "").trim();

  const head = header
    ? headerBlock({
        language: lang,
        name,
        company,
        applicantAddress,
        applicantLocation,
        companyAddress,
      }) + "\n\n"
    : "";

  const intro_en = `I am excited to apply for the ${jobTitle}${company ? " at " + company : ""}. With my background and motivation, I am confident I can contribute effectively.`;
  const intro_de = `mit großem Interesse bewerbe ich mich für die Position als ${jobTitle}${company ? " bei " + company : ""}. Durch meine Erfahrung und Motivation kann ich wirkungsvoll beitragen.`;

  const exp_en = `In my previous roles, I gained the following experience:\n${exp || "- (please add)"}`;
  const exp_de = `In meiner bisherigen Laufbahn konnte ich folgende Erfahrungen sammeln:\n${exp || "- (bitte ergänzen)"}`;

  const sk_en = `My core strengths include:\n${sk || "- (please add)"}`;
  const sk_de = `Zu meinen Stärken zählen:\n${sk || "- (bitte ergänzen)"}`;

  const outro_en = `I would be happy to discuss how I can support your team and add value.\n\nKind regards\n${name}`;
  const outro_de = `Gern erläutere ich Ihnen im Gespräch, wie ich Ihr Team zielgerichtet unterstütze.\n\nMit freundlichen Grüßen\n${name}`;

  let blocks =
    lang === "en"
      ? [`${sal}\n\n${intro_en}`, exp_en, sk_en, outro_en]
      : [`${sal}\n\n${intro_de}`, exp_de, sk_de, outro_de];

  // crude length control
  if (length === "short") blocks.splice(2, 0, "");
  if (length === "long")
    blocks.splice(
      2,
      0,
      lang === "en"
        ? "Additionally, I am eager to continuously improve processes and share best practices across teams."
        : "Darüber hinaus liegt mir daran, Abläufe fortlaufend zu verbessern und Best Practices im Team zu teilen."
    );

  return head + blocks.filter(Boolean).join("\n\n");
}

/* ---------- API Route ---------- */
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      name = "",
      jobTitle = "",
      company = "",
      contact = "",
      experience = "",
      skills = "",
      style = "formal",
      language = "en",
      length = "medium",
      bullets = false,
      header = false,
      applicantAddress = "",
      applicantLocation = "",
      companyAddress = "",
    } = body || {};

    // minimal validation
    if (!name || !jobTitle || !experience || !skills) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const lang = language === "de" ? "de" : "en";
    const styleInstruction = styleHint(style, lang);
    const salutation = lang === "de" ? buildGermanSalutation(contact) : buildEnglishSalutation(contact);
    const headerWanted = header
      ? headerBlock({
          language: lang,
          name,
          company,
          applicantAddress,
          applicantLocation,
          companyAddress,
        })
      : "";

    const targetWords =
      length === "short" ? "about 140–200 words"
      : length === "long" ? "about 320–420 words"
      : "about 220–300 words";

    const listInstruction = bullets
      ? (lang === "en"
          ? "Use bullet points for experience and skills sections."
          : "Verwende Aufzählungspunkte für die Bereiche Erfahrung und Skills.")
      : (lang === "en"
          ? "Use coherent paragraphs (no bullet points)."
          : "Verwende zusammenhängende Absätze (keine Aufzählungspunkte).");

    const systemMsg =
      lang === "de"
        ? "Du schreibst professionelle Bewerbungsanschreiben. Schreibe natürlich, präzise und fehlerfrei."
        : "You write professional cover letters. Write naturally, precisely, and without errors.";

    const userMsg =
      lang === "de"
        ? `Erzeuge ein Anschreiben im Stil: ${styleInstruction}.
Ziel-Länge: ${targetWords}.
${listInstruction}

Falls 'Briefkopf' angefordert ist, füge oben Name/Firma/Datum/Adressen als Kopf ein:
${headerWanted || "(kein Briefkopf)"}

Daten:
- Name: ${name}
- Zielposition: ${jobTitle}
- Firma: ${company || "(optional)"}
- Ansprechpartner: ${contact || "(optional)"}
- Erfahrung: ${experience}
- Skills: ${skills}
- Ort (für Datum): ${applicantLocation || "(optional)"}

Form-Ziele:
- Starte mit der Anrede: ${salutation}
- 3–5 kurze Absätze (oder saubere Bullets, wenn angefordert).
- Konkreter Nutzen & Beispiele, keine Floskeln.
- Schließe passend mit Grußformel & Name: ${name}.`
        : `Create a cover letter in the style: ${styleInstruction}.
Target length: ${targetWords}.
${listInstruction}

If 'Letterhead' is requested, add name/company/date/addresses at the top:
${headerWanted || "(no letterhead)"}

Data:
- Name: ${name}
- Target role: ${jobTitle}
- Company: ${company || "(optional)"}
- Contact: ${contact || "(optional)"}
- Experience: ${experience}
- Skills: ${skills}
- City (for date line): ${applicantLocation || "(optional)"}

Form goals:
- Start with salutation: ${salutation}
- 3–5 short paragraphs (or neat bullet points if requested).
- Concrete value & examples, no fluff.
- Close with an adequate sign-off & the name: ${name}.`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      const text = localFallback({
        language: lang,
        style,
        name,
        jobTitle,
        company,
        contact,
        experience,
        skills,
        length,
        bullets,
        header,
        applicantAddress,
        applicantLocation,
        companyAddress,
      });
      return NextResponse.json({ result: text, source: "fallback" }, { status: 200 });
    }

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemMsg },
        { role: "user", content: userMsg },
      ],
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim() ||
      localFallback({
        language: lang,
        style,
        name,
        jobTitle,
        company,
        contact,
        experience,
        skills,
        length,
        bullets,
        header,
        applicantAddress,
        applicantLocation,
        companyAddress,
      });

    return NextResponse.json({ result: text, source: "openai" }, { status: 200 });
  } catch (err) {
    try {
      const body = await req.json().catch(() => ({}));
      const text = localFallback({
        language: body.language === "de" ? "de" : "en",
        style: body.style || "formal",
        name: body.name || "",
        jobTitle: body.jobTitle || "",
        company: body.company || "",
        contact: body.contact || "",
        experience: body.experience || "",
        skills: body.skills || "",
        length: body.length || "medium",
        bullets: !!body.bullets,
        header: !!body.header,
        applicantAddress: body.applicantAddress || "",
        applicantLocation: body.applicantLocation || "",
        companyAddress: body.companyAddress || "",
      });
      return NextResponse.json({ result: text, source: "fallback", error: "openai_failed" }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}