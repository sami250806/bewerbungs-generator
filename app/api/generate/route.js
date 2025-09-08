import { NextResponse } from "next/server";
import OpenAI from "openai";

/* ---------- Utils ---------- */
const countWords = (txt = "") => (txt.trim().match(/\S+/g) || []).length;

function takeSingleVersion(raw) {
  if (!raw) return "";
  const parts = raw
    .split(/\n-{3,}\n|^#+\s.*\n|^\s*={3,}\s*$/m)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 1) return raw.trim();
  let best = parts[0];
  for (const p of parts) if (p.length > best.length) best = p;
  return best.trim();
}

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

function headerBlock({
  language,
  firstName,
  lastName,
  company,
  applicantAddress,
  applicantLocation,
  companyAddress,
  phone,
  email,
  linkedin,
}) {
  const name = [firstName && firstName.trim(), lastName && lastName.trim()].filter(Boolean).join(" ");
  const date = new Date().toLocaleDateString(language === "en" ? "en-GB" : "de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dateLabel = language === "en" ? "Date" : "Datum";
  const phoneLabel = language === "en" ? "Phone" : "Telefon";

  const contactLine = [
    phone && phone.trim() ? `${phoneLabel}: ${phone.trim()}` : null,
    email && email.trim() ? email.trim() : null,
    linkedin && linkedin.trim() ? linkedin.trim() : null,
  ].filter(Boolean).join(" · ");

  const composed = [
    name || "—",
    applicantAddress && applicantAddress.trim() ? applicantAddress.trim() : null,
    applicantLocation && applicantLocation.trim() ? applicantLocation.trim() : null,
    contactLine || null,
    "",
    company && company.trim() ? company.trim() : null,
    companyAddress && companyAddress.trim() ? companyAddress.trim() : null,
    "",
    `${dateLabel}: ${date}`,
  ].filter(Boolean);

  return composed.join("\n");
}

/* ---------- Local Fallback ---------- */
function localFallback(data) {
  const {
    language = "en",
    style = "formal",
    firstName = "",
    lastName = "",
    jobTitle = "",
    company = "",
    contact = "",
    experience = "",
    skills = "",
    length = "medium",
    header = false,
    applicantAddress = "",
    applicantLocation = "",
    companyAddress = "",
    phone = "",
    email = "",
    linkedin = "",
  } = data || {};

  const name = [firstName.trim(), lastName.trim()].filter(Boolean).join(" ");
  const lang = language === "de" ? "de" : "en";
  const sal = lang === "de" ? buildGermanSalutation(contact) : buildEnglishSalutation(contact);

  const head = header
    ? headerBlock({
        language: lang,
        firstName,
        lastName,
        company,
        applicantAddress,
        applicantLocation,
        companyAddress,
        phone,
        email,
        linkedin,
      }) + "\n\n"
    : "";

  const exp_en = `In my previous roles, I gained the following experience: ${experience || "- (please add)"}`;
  const exp_de = `In meiner bisherigen Laufbahn konnte ich folgende Erfahrungen sammeln: ${experience || "- (bitte ergänzen)"}`;
  const sk_en  = `My core strengths include: ${skills || "- (please add)"}`;
  const sk_de  = `Zu meinen Stärken zählen: ${skills || "- (bitte ergänzen)"}`;

  const outro_en = `I would be happy to discuss how I can support your team and add value.\n\nKind regards\n${name || "—"}`;
  const outro_de = `Gern erläutere ich Ihnen im Gespräch, wie ich Ihr Team zielgerichtet unterstütze.\n\nMit freundlichen Grüßen\n${name || "—"}`;

  const intro_en = `${sal}\n\nI am excited to apply for the ${jobTitle}${company ? " at " + company : ""}.`;
  const intro_de = `${sal}\n\nmit großem Interesse bewerbe ich mich für die Position als ${jobTitle}${company ? " bei " + company : ""}.`;

  const body = lang === "en" ? [intro_en, exp_en, sk_en, outro_en] : [intro_de, exp_de, sk_de, outro_de];

  const want = length === "short" ? 3 : length === "long" ? 5 : 4;
  const trimmed = body.slice(0, Math.max(2, want));
  return head + trimmed.join("\n\n");
}

/* ---------- Prompt ---------- */
function buildSinglePrompt({ lang, styleInstruction, salutation, headerWanted, form, length, jd, seed }) {
  const {
    firstName, lastName, jobTitle, company, contact, experience, skills,
    applicantLocation, phone, email, linkedin,
  } = form;

  const name = [firstName && firstName.trim(), lastName && lastName.trim()].filter(Boolean).join(" ");
  const jdTrim = (jd || "").slice(0, 1500);
  const jdBlock = jdTrim
    ? lang === "de"
      ? `Spiegele relevante Keywords aus dieser Stellenanzeige (keine Sätze kopieren):\n${jdTrim}`
      : `Mirror relevant keywords from this job description (do not copy sentences):\n${jdTrim}`
    : lang === "de"
      ? "(keine Stellenanzeige übergeben)"
      : "(no job description provided)";

  const paragraphRule =
    length === "short"
      ? (lang === "de" ? "Schreibe 2–3 Absätze." : "Write 2–3 paragraphs.")
      : length === "long"
        ? (lang === "de" ? "Schreibe 4–6 Absätze, bevorzuge 5–6." : "Write 4–6 paragraphs, preferably 5–6.")
        : (lang === "de" ? "Schreibe 3–5 Absätze." : "Write 3–5 paragraphs.");

  const letterheadBlock = headerWanted
    ? lang === "en"
      ? `If 'Letterhead' is requested, add this letterhead at the top:\n${headerWanted}`
      : `Falls 'Briefkopf' angefordert ist, füge oben diesen Briefkopf ein:\n${headerWanted}`
    : lang === "en"
      ? "(no letterhead)"
      : "(kein Briefkopf)";

  const dataBlock =
    lang === "de"
      ? `Daten:
- Name: ${name}
- Zielposition: ${jobTitle}
- Firma: ${company || "(optional)"}
- Ansprechpartner: ${contact || "(optional)"}
- Erfahrung: ${experience}
- Skills: ${skills}
- Ort (für Datum): ${applicantLocation || "(optional)"}
- Telefon: ${phone || "(optional)"}
- E-Mail: ${email || "(optional)"}
- LinkedIn: ${linkedin || "(optional)"}`
      : `Data:
- Name: ${name}
- Target role: ${jobTitle}
- Company: ${company || "(optional)"}
- Contact: ${contact || "(optional)"}
- Experience: ${experience}
- Skills: ${skills}
- City (for date line): ${applicantLocation || "(optional)"}
- Phone: ${phone || "(optional)"}
- Email: ${email || "(optional)"}
- LinkedIn: ${linkedin || "(optional)"};`;

  const noBullets = lang === "de" ? "Keine Aufzählungspunkte verwenden." : "Do not use bullet points.";
  const seedLine = seed ? (lang === "de" ? `Seed: ${seed}` : `Seed: ${seed}`) : "";

  if (lang === "de") {
    return `Schreibe GENAU EIN Bewerbungsanschreiben.
- Stil: ${styleInstruction}
- ${paragraphRule}
- ${noBullets}
- Beginne mit der Anrede: ${salutation}
- ${letterheadBlock}
- Knappe, natürliche Sprache. Konkrete Beispiele und messbare Ergebnisse.
${jdBlock}

${dataBlock}

${seedLine}`.trim();
  }

  return `Write EXACTLY ONE cover letter.
- Style: ${styleInstruction}
- ${paragraphRule}
- ${noBullets}
- Start with salutation: ${salutation}
- ${letterheadBlock}
- Natural, concise language. Use concrete examples and measurable outcomes.
${jdBlock}

${dataBlock}

${seedLine}`.trim();
}

/* ---------- API ---------- */
export async function POST(req) {
  console.log("=== ENTER /api/generate ===");
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("DEBUG API KEY:", apiKey ? "geladen" : "NICHT gefunden");

  try {
    const body = await req.json();
    const {
      firstName = "", lastName = "", phone = "", email = "", linkedin = "",
      jobTitle = "", company = "", contact = "", experience = "", skills = "",
      style = "formal", language = "en", length = "medium", header = false,
      applicantAddress = "", applicantLocation = "", companyAddress = "",
      jd = "", variation,
    } = body || {};

    if (!firstName || !lastName || !jobTitle || !experience || !skills) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const lang = language === "de" ? "de" : "en";
    const styleInstruction = styleHint(style, lang);
    const salutation = lang === "de" ? buildGermanSalutation(contact) : buildEnglishSalutation(contact);

    const headerWanted = header
      ? headerBlock({
          language: lang, firstName, lastName, company,
          applicantAddress, applicantLocation, companyAddress, phone, email, linkedin,
        })
      : "";

    const systemMsg =
      lang === "de"
        ? "Du schreibst professionelle Bewerbungsanschreiben. Schreibe natürlich, präzise und fehlerfrei."
        : "You write professional cover letters. Write naturally, precisely, and without errors.";

    const prompt = buildSinglePrompt({
      lang,
      styleInstruction,
      salutation,
      headerWanted,
      form: { firstName, lastName, jobTitle, company, contact, experience, skills, applicantLocation, phone, email, linkedin },
      length,
      jd,
      seed: variation || `seed:${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    });

    console.log("DEBUG prompt len:", prompt.length);

    // Kein Key → Fallback
    if (!apiKey) {
      const text0 = localFallback({
        language: lang, style, firstName, lastName, jobTitle, company, contact,
        experience, skills, length, header, applicantAddress, applicantLocation,
        companyAddress, phone, email, linkedin,
      });
      const one = takeSingleVersion(text0);
      return NextResponse.json({ result: one, meta: { words: countWords(one) }, source: "fallback" }, { status: 200 });
    }

    // OpenAI Call (SDK v4) + 30s Timeout
    const openai = new OpenAI({ apiKey });
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 30000);

    let resp;
    try {
      resp = await openai.chat.completions.create(
        {
          model: "gpt-4o-mini",
          temperature: 0.85,
          top_p: 0.95,
          presence_penalty: 0.3,
          frequency_penalty: 0.2,
          messages: [
            { role: "system", content: systemMsg },
            { role: "user", content: prompt },
          ],
        },
        { signal: controller.signal }
      );
    } catch (e) {
      console.error("OpenAI request failed", { name: e?.name, status: e?.status, message: e?.message });
      throw e;
    } finally {
      clearTimeout(t);
    }

    // Text extrahieren (robust)
    let text = resp?.choices?.[0]?.message?.content || "";
    if (!text) {
      text = localFallback({
        language: lang, style, firstName, lastName, jobTitle, company, contact,
        experience, skills, length, header, applicantAddress, applicantLocation,
        companyAddress, phone, email, linkedin,
      });
    }
    text = takeSingleVersion(text);

    return NextResponse.json(
      { result: text, meta: { words: countWords(text) }, source: resp ? "openai" : "fallback_missing_text" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Handler error:", { name: err?.name, status: err?.status, message: err?.message });

    // Sichere Rückfallebene
    try {
      const body = await req.json().catch(() => ({}));
      let text = localFallback({
        language: body.language === "de" ? "de" : "en",
        style: body.style || "formal",
        firstName: body.firstName || "",
        lastName: body.lastName || "",
        jobTitle: body.jobTitle || "",
        company: body.company || "",
        contact: body.contact || "",
        experience: body.experience || "",
        skills: body.skills || "",
        length: body.length || "medium",
        header: !!body.header,
        applicantAddress: body.applicantAddress || "",
        applicantLocation: body.applicantLocation || "",
        companyAddress: body.companyAddress || "",
        phone: body.phone || "",
        email: body.email || "",
        linkedin: body.linkedin || "",
      });
      text = takeSingleVersion(text);
      return NextResponse.json({ result: text, meta: { words: countWords(text) }, source: "fallback_error" }, { status: 200 });
    } catch {
      return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
  }
}