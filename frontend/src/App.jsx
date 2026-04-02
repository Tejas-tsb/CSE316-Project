import { AnimatePresence } from "framer-motion";

import { useAuth } from "./contexts/AuthContext";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";

function App() {
  const { token, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] px-6 py-10 text-[var(--text-primary)]">
        <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center">
          <div className="glass-panel flex items-center gap-3 px-6 py-5">
            <div className="h-3 w-3 animate-pulse rounded-full bg-[var(--accent)]" />
            <span className="font-mono text-sm text-[var(--text-secondary)]">
              Initializing PulseOps...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {token ? <DashboardPage key="dashboard" /> : <LoginPage key="login" />}
    </AnimatePresence>
  );
}

export default App;

