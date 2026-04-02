import { startTransition, useDeferredValue, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Cpu,
  Download,
  LogOut,
  MemoryStick,
  MoonStar,
  RefreshCcw,
  Server,
  SunMedium,
  TimerReset,
  Wifi,
  WifiOff,
} from "lucide-react";

import AlertsPanel from "../components/AlertsPanel";
import CpuHistoryChart from "../components/CpuHistoryChart";
import KillProcessDialog from "../components/KillProcessDialog";
import MemoryOverviewChart from "../components/MemoryOverviewChart";
import ProcessTable from "../components/ProcessTable";
import StatCard from "../components/StatCard";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { apiRequest, createSocket } from "../lib/api";
import { downloadBlob, formatPercent, formatUptime, severityTone } from "../lib/formatters";

function DashboardPage() {
  const { logout, token, user } = useAuth();
  const { accent, accents, setAccent, theme, toggleTheme } = useTheme();

  const [snapshot, setSnapshot] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState("connecting");
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState("cpu");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedProcess, setSelectedProcess] = useState(null);
  const [terminating, setTerminating] = useState(false);
  const [exportBusy, setExportBusy] = useState(false);
  const [banner, setBanner] = useState("");
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useDebouncedValue(searchValue, 220);
  const deferredSearch = useDeferredValue(debouncedSearch.toLowerCase().trim());

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const response = await apiRequest("/api/system/snapshot", { token });
        if (!mounted) return;
        setSnapshot(response.snapshot);
        setAlerts(response.alerts || []);
        setActivityLogs(response.activityLogs || []);
      } catch (error) {
        if (!mounted) return;
        setBanner(error.message);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [token]);

  useEffect(() => {
    const socket = createSocket(token);

    socket.on("connect", () => setConnectionStatus("live"));
    socket.on("disconnect", () => setConnectionStatus("offline"));
    socket.on("connect_error", () => setConnectionStatus("offline"));
    socket.on("metrics:update", (incomingSnapshot) => {
      if (!incomingSnapshot) return;

      startTransition(() => {
        setSnapshot(incomingSnapshot);
        if (incomingSnapshot.alerts) {
          setAlerts(incomingSnapshot.alerts);
        }
      });
    });
    socket.on("alert:new", (incomingAlert) => {
      setAlerts((current) => [incomingAlert, ...current].slice(0, 20));
    });
    socket.on("logs:update", (logs) => {
      setActivityLogs(logs || []);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const processes = useMemo(() => {
    const source = snapshot?.processes || [];

    return source
      .filter((processInfo) => (statusFilter === "All" ? true : processInfo.status === statusFilter))
      .filter((processInfo) => {
        if (!deferredSearch) return true;
        const searchable = `${processInfo.pid} ${processInfo.name} ${processInfo.command}`.toLowerCase();
        return searchable.includes(deferredSearch);
      })
      .slice()
      .sort((left, right) => {
        const direction = sortDirection === "desc" ? -1 : 1;
        if (left[sortKey] === right[sortKey]) return 0;
        return left[sortKey] > right[sortKey] ? direction * -1 : direction;
      });
  }, [deferredSearch, snapshot?.processes, sortDirection, sortKey, statusFilter]);

  const summary = snapshot?.summary;
  const appTitle = import.meta.env.VITE_APP_TITLE || "PulseOps";

  const toggleSort = (nextKey) => {
    if (sortKey === nextKey) {
      setSortDirection((current) => (current === "desc" ? "asc" : "desc"));
      return;
    }

    setSortKey(nextKey);
    setSortDirection("desc");
  };

  const handleExport = async (format) => {
    setExportBusy(true);

    try {
      const blob = await apiRequest(`/api/system/logs/export?format=${format}`, {
        token,
        responseType: "blob",
      });
      downloadBlob(blob, `pulseops-logs.${format}`);
    } catch (error) {
      setBanner(error.message);
    } finally {
      setExportBusy(false);
    }
  };

  const handleTerminate = async () => {
    if (!selectedProcess) return;

    const processToTerminate = selectedProcess;
    setSelectedProcess(null);
    setTerminating(true);
    setBanner("");

    try {
      const response = await apiRequest(`/api/system/processes/${processToTerminate.pid}/kill`, {
        method: "POST",
        token,
      });
      setBanner(response.message);
    } catch (error) {
      setBanner(error.message);
    } finally {
      setTerminating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen overflow-hidden bg-[var(--bg)] pb-10"
    >
      <div className="bg-orb bg-orb-left" />
      <div className="bg-orb bg-orb-right" />

      <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
        <header className="glass-panel mb-6 overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)] to-transparent" />
          <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-2xl">
              <div className="chip mb-5 inline-flex">
                <Activity className="h-4 w-4" />
                Real-time process intelligence
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-[var(--text-primary)] sm:text-5xl">
                {appTitle}
                <span className="block text-[var(--accent)]">Process Command Center</span>
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--text-secondary)]">
                Inspect process pressure, terminate runaway workloads, and watch alerts stream in
                with a smooth, theme-aware DevOps dashboard.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:min-w-[420px]">
              <div className="mini-panel">
                <span className="text-[var(--text-secondary)]">Operator</span>
                <strong>{user?.username}</strong>
              </div>
              <div className="mini-panel">
                <span className="text-[var(--text-secondary)]">Connection</span>
                <strong className="flex items-center gap-2">
                  {connectionStatus === "live" ? (
                    <>
                      <Wifi className="h-4 w-4 text-emerald-300" />
                      Live
                    </>
                  ) : (
                    <>
                      <WifiOff className="h-4 w-4 text-rose-300" />
                      Offline
                    </>
                  )}
                </strong>
              </div>
              <div className="mini-panel">
                <span className="text-[var(--text-secondary)]">Host</span>
                <strong>{summary?.hostname || "Loading..."}</strong>
              </div>
              <div className="mini-panel">
                <span className="text-[var(--text-secondary)]">Platform</span>
                <strong>{summary?.platform || "Loading..."}</strong>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 border-t border-white/8 pt-6 2xl:flex-row 2xl:items-center 2xl:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <button className="button-secondary" onClick={toggleTheme}>
                {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </button>
              <button className="button-secondary" onClick={() => handleExport("csv")} disabled={exportBusy}>
                <Download className="h-4 w-4" />
                Export CSV
              </button>
              <button className="button-secondary" onClick={logout}>
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)]">Accent</span>
              {accents.map((item) => (
                <button
                  key={item.id}
                  className={`accent-swatch ${accent === item.id ? "accent-swatch-active" : ""}`}
                  onClick={() => setAccent(item.id)}
                >
                  <span className={`accent-dot accent-dot-${item.id}`} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </header>

        {banner ? (
          <div className="mb-6 rounded-3xl border border-white/8 bg-white/[0.06] px-5 py-4 text-sm text-[var(--text-primary)] shadow-glass">
            {banner}
          </div>
        ) : null}

        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Cpu}
            label="Overall CPU"
            value={loading ? "..." : formatPercent(summary?.cpu)}
            helper="Updated every second"
            tone={severityTone(summary?.cpu, 80, 90)}
            delay={0}
          />
          <StatCard
            icon={MemoryStick}
            label="Overall Memory"
            value={loading ? "..." : formatPercent(summary?.memory)}
            helper="Active RAM usage"
            tone={severityTone(summary?.memory, 75, 90)}
            delay={0.05}
          />
          <StatCard
            icon={Server}
            label="Total Processes"
            value={loading ? "..." : `${summary?.totalProcesses || 0}`}
            helper="Tracked processes in the current snapshot"
            tone="normal"
            delay={0.1}
          />
          <StatCard
            icon={TimerReset}
            label="System Uptime"
            value={loading ? "..." : formatUptime(summary?.uptimeSeconds || 0)}
            helper="Host runtime since boot"
            tone="normal"
            delay={0.15}
          />
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.85fr_0.8fr]">
          <CpuHistoryChart data={snapshot?.history?.cpu || []} />
          <MemoryOverviewChart summary={summary} />
          <AlertsPanel
            alerts={alerts}
            activityLogs={activityLogs}
            exportBusy={exportBusy}
            onExport={handleExport}
          />
        </section>

        <section className="mt-6">
          <ProcessTable
            processes={processes}
            onSearchChange={setSearchValue}
            onStatusFilterChange={setStatusFilter}
            onTerminate={setSelectedProcess}
            searchValue={searchValue}
            sortKey={sortKey}
            statusFilter={statusFilter}
            toggleSort={toggleSort}
          />
        </section>

        <footer className="mt-6 flex flex-wrap items-center gap-3 text-sm text-[var(--text-secondary)]">
          <div className="chip">
            <RefreshCcw className="h-4 w-4" />
            WebSocket stream
          </div>
          <div className="chip">Alerts at CPU &gt; 80% / Memory &gt; 75%</div>
          <div className="chip">Sorted by {sortKey === "cpu" ? "CPU" : "memory"} usage</div>
        </footer>
      </div>

      <KillProcessDialog
        busy={terminating}
        onConfirm={handleTerminate}
        onOpenChange={(open) => {
          if (!open) setSelectedProcess(null);
        }}
        open={Boolean(selectedProcess)}
        processInfo={selectedProcess}
      />
    </motion.div>
  );
}

export default DashboardPage;
