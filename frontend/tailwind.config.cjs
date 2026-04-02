/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        glass: "0 20px 60px rgba(15, 23, 42, 0.18)",
      },
      backgroundImage: {
        glow: "radial-gradient(circle at top, rgba(var(--accent-rgb), 0.22), transparent 42%)",
      },
    },
  },
  plugins: [],
};

