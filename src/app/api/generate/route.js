// src/app/api/generate/route.js
import OpenAI from "openai";

export async function POST(req) {
  try {
    const { name, jobTitle, experience, skills } = await req.json();

    const prompt = `
Schreibe ein kurzes Bewerbungsschreiben auf Deutsch (ca. 200–250 Wörter).
Name: ${name}
Stelle: ${jobTitle}
Erfahrung: ${experience}
Stärken & Skills: ${skills}
Sprache: höflich, klar, professionell. Verwende Du/Sie passend, keine Platzhalter.
`;

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Du verfasst professionelle deutsche Bewerbungsschreiben." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
    });

    const text = completion.choices?.[0]?.message?.content ?? "";
    return Response.json({ text });
  } catch (err) {
    console.error("API /generate error:", err);
    const message =
      typeof err?.message === "string" ? err.message : "Unbekannter Fehler bei OpenAI";
    return Response.json({ error: message }, { status: 500 });
  }

}