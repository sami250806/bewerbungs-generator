// app/login/page.tsx
"use client";

import { FormEvent, useEffect, useState } from "react";

function hasAccessCookie() {
  return document.cookie.split("; ").some((c) => c.startsWith("access=granted"));
}

export default function LoginPage() {
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Nur weiterleiten, wenn das COOKIE bereits existiert
  useEffect(() => {
    if (hasAccessCookie()) {
      window.location.href = "/";
    }
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (pw.trim() === "zahra") {
      // optional: localStorage, aber entscheidend ist das Cookie
      try { localStorage.setItem("access", "granted"); } catch {}

      // Cookie setzen → Middleware lässt rein
      document.cookie = "access=granted; Path=/; Max-Age=2592000; SameSite=Lax";

      window.location.href = "/";
    } else {
      setError("Falsches Passwort.");
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-900 text-white">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-4 p-6 rounded-2xl bg-white/5 border border-white/10"
      >
        <h1 className="text-xl font-semibold">Login</h1>
        <input
          type="password"
          placeholder="Passwort"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 outline-none"
        />
        {error && <p className="text-amber-300 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-500 px-4 py-2 font-medium"
        >
          Einloggen
        </button>
      </form>
    </div>
  );
}