import clsx from "clsx";
import { motion } from "framer-motion";
import { AlertTriangle, BellRing, Download, ShieldAlert } from "lucide-react";

const severityStyles = {
  normal: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  critical: "border-rose-400/25 bg-rose-500/10 text-rose-300",
};

function AlertsPanel({ activityLogs, alerts, exportBusy, onExport }) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 18 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-panel h-full"
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="panel-kicker">Notifications</p>
          <h3 className="panel-title">Threshold alerts and operator activity</h3>
        </div>
        <button className="button-secondary" onClick={() => onExport("json")} disabled={exportBusy}>
          <Download className="h-4 w-4" />
          Export
        </button>
      </div>

      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="empty-state">
            <ShieldAlert className="h-5 w-5" />
            <span>No active warnings right now.</span>
          </div>
        ) : (
          alerts.slice(0, 5).map((alert) => (
            <div key={alert.id} className={clsx("alert-card", severityStyles[alert.severity])}>
              <div className="mt-0.5">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">{alert.title}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">{alert.message}</p>
                <p className="mt-2 font-mono text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--text-primary)]">
          <BellRing className="h-4 w-4 text-[var(--accent)]" />
          Activity feed
        </div>
        <div className="space-y-3">
          {activityLogs.length === 0 ? (
            <div className="empty-state">
              <span>No activity captured yet.</span>
            </div>
          ) : (
            activityLogs.slice(0, 8).map((entry, index) => (
              <div
                key={`${entry.timestamp}-${index}`}
                className="rounded-2xl border border-white/8 bg-white/4 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-[var(--text-primary)]">{entry.title}</p>
                  <span className={clsx("chip text-xs", severityStyles[entry.severity])}>
                    {entry.severity}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{entry.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </motion.aside>
  );
}

export default AlertsPanel;

