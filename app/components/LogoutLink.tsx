"use client";

export default function LogoutLink() {
  const handleLogout = () => {
    // Cookie löschen
    document.cookie = "access=; Path=/; Max-Age=0; SameSite=Lax";
    // (optional) LocalStorage aufräumen
    try { localStorage.removeItem("access"); } catch {}
    // zur Login-Seite
    window.location.href = "/login";
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="underline hover:text-white"
      title="Abmelden"
    >
      Logout
    </button>
  );
}