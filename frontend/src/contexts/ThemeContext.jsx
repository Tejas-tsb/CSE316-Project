import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

const accents = [
  { id: "cyan", label: "Cyan" },
  { id: "emerald", label: "Emerald" },
  { id: "amber", label: "Amber" },
  { id: "rose", label: "Rose" },
];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("pulseops-theme") || "dark");
  const [accent, setAccent] = useState(() => localStorage.getItem("pulseops-accent") || "cyan");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("pulseops-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.accent = accent;
    localStorage.setItem("pulseops-accent", accent);
  }, [accent]);

  return (
    <ThemeContext.Provider
      value={{
        accent,
        accents,
        setAccent,
        setTheme,
        theme,
        toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }

  return context;
};

