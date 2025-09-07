/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        // für den blau-lila Kontrast-Hintergrund
        'glass-gradient': 'radial-gradient(1200px 600px at 10% 0%, rgba(99,102,241,0.35), transparent 60%), radial-gradient(1000px 500px at 90% 20%, rgba(168,85,247,0.35), transparent 60%)',
      },
      colors: {
        glass: {
          card: 'rgba(255,255,255,0.08)',
          border: 'rgba(255,255,255,0.18)',
          text: 'rgba(255,255,255,0.92)',
          muted: 'rgba(255,255,255,0.70)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        glass: '0 8px 30px rgba(0,0,0,0.25)',
      },
    },
  },
  plugins: [],
};