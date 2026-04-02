import { motion } from "framer-motion";
import { Activity, LockKeyhole, UserRound } from "lucide-react";
import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";

function LoginPage() {
  const appTitle = import.meta.env.VITE_APP_TITLE || "PulseOps";
  const { login } = useAuth();
  const { accent, accents, setAccent, theme, toggleTheme } = useTheme();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      await login(username, password);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen overflow-hidden bg-[var(--bg)] px-6 py-10"
    >
      <div className="bg-orb bg-orb-left" />
      <div className="bg-orb bg-orb-right" />

      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 lg:grid-cols-[1.2fr_0.9fr]">
        <div className="flex flex-col justify-between">
          <div className="max-w-2xl">
            <div className="chip mb-6 inline-flex">
              <Activity className="h-4 w-4" />
              Live observability platform
            </div>
            <h1 className="font-display text-5xl font-semibold tracking-tight text-[var(--text-primary)] lg:text-7xl">
              {appTitle}
              <span className="block text-[var(--accent)]">Process Monitoring Dashboard</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[var(--text-secondary)]">
              Watch CPU, memory, process state transitions, and critical alerts in real time from a
              polished operator console built for DevOps workflows.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {[
              "Live Socket.io telemetry",
              "Secure process controls",
              "Theme-aware glass dashboards",
            ].map((item) => (
              <div key={item} className="glass-panel min-h-0">
                <p className="panel-kicker">Included</p>
                <p className="mt-3 font-display text-xl text-[var(--text-primary)]">{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-panel mx-auto flex w-full max-w-lg flex-col justify-between">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="panel-kicker">Operator Login</p>
              <h2 className="panel-title">Authenticate to open the console</h2>
            </div>
            <button className="button-secondary" onClick={toggleTheme}>
              {theme === "dark" ? "Light" : "Dark"} mode
            </button>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <label className="input-shell">
              <span>Username</span>
              <div className="input-field">
                <UserRound className="h-4 w-4 text-[var(--text-secondary)]" />
                <input value={username} onChange={(event) => setUsername(event.target.value)} />
              </div>
            </label>
            <label className="input-shell">
              <span>Password</span>
              <div className="input-field">
                <LockKeyhole className="h-4 w-4 text-[var(--text-secondary)]" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>
            </label>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <button className="button-primary w-full justify-center" type="submit" disabled={busy}>
              {busy ? "Authenticating..." : "Launch dashboard"}
            </button>
          </form>

          <div className="mt-8 border-t border-white/8 pt-6">
            <p className="mb-3 text-sm font-medium text-[var(--text-primary)]">Theme accent</p>
            <div className="flex flex-wrap gap-3">
              {accents.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`accent-swatch ${accent === item.id ? "accent-swatch-active" : ""}`}
                  onClick={() => setAccent(item.id)}
                >
                  <span className={`accent-dot accent-dot-${item.id}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default LoginPage;

