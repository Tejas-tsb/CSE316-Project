import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowDownWideNarrow, Search, Skull, SlidersHorizontal } from "lucide-react";

import { formatPercent, statusTone } from "../lib/formatters";

const toneClasses = {
  normal: "border-emerald-400/25 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-400/25 bg-amber-500/10 text-amber-300",
  critical: "border-rose-400/25 bg-rose-500/10 text-rose-300",
  muted: "border-slate-500/20 bg-slate-500/10 text-slate-300",
};

function SortButton({ active, children, onClick }) {
  return (
    <button className={clsx("filter-chip", active && "filter-chip-active")} onClick={onClick}>
      <ArrowDownWideNarrow className="h-4 w-4" />
      {children}
    </button>
  );
}

function ProcessTable({
  onSearchChange,
  onStatusFilterChange,
  onTerminate,
  processes,
  searchValue,
  sortKey,
  statusFilter,
  toggleSort,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.15 }}
      className="glass-panel"
    >
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="panel-kicker">Process Explorer</p>
          <h3 className="panel-title">Live process table with search, filters, and kill actions</h3>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <label className="search-shell">
            <Search className="h-4 w-4 text-[var(--text-secondary)]" />
            <input
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Search by PID or process name"
            />
          </label>

          <div className="flex items-center gap-2">
            <div className="filter-chip">
              <SlidersHorizontal className="h-4 w-4" />
              <select value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value)}>
                <option value="All">All states</option>
                <option value="Running">Running</option>
                <option value="Sleeping">Sleeping</option>
                <option value="Stopped">Stopped</option>
                <option value="Zombie">Zombie</option>
              </select>
            </div>
            <SortButton active={sortKey === "cpu"} onClick={() => toggleSort("cpu")}>
              CPU
            </SortButton>
            <SortButton active={sortKey === "memoryPercent"} onClick={() => toggleSort("memoryPercent")}>
              Memory
            </SortButton>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/8">
        <div className="max-h-[520px] overflow-auto">
          <table className="min-w-full border-separate border-spacing-0">
            <thead className="sticky top-0 z-10 bg-[var(--surface-strong)]/92 backdrop-blur-xl">
              <tr className="text-left text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">
                <th className="px-5 py-4">PID</th>
                <th className="px-5 py-4">Process</th>
                <th className="px-5 py-4">CPU</th>
                <th className="px-5 py-4">Memory</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {processes.map((processInfo) => (
                  <motion.tr
                    key={processInfo.pid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className={clsx(
                      "border-b border-white/5 text-sm text-[var(--text-primary)]",
                      processInfo.highUsage && "bg-[var(--accent-soft)]"
                    )}
                  >
                    <td className="px-5 py-4 font-mono text-[13px] text-[var(--text-secondary)]">
                      {processInfo.pid}
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium">{processInfo.name}</div>
                      <div className="mt-1 max-w-[26rem] truncate font-mono text-xs text-[var(--text-secondary)]">
                        {processInfo.command}
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono">{formatPercent(processInfo.cpu)}</td>
                    <td className="px-5 py-4 font-mono">{formatPercent(processInfo.memoryPercent)}</td>
                    <td className="px-5 py-4">
                      <span className={clsx("chip text-xs", toneClasses[statusTone(processInfo.status)])}>
                        {processInfo.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button className="button-danger" onClick={() => onTerminate(processInfo)}>
                        <Skull className="h-4 w-4" />
                        Kill
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {processes.length === 0 ? (
          <div className="empty-state rounded-none border-0 border-t border-white/8">
            <span>No processes matched the current filters.</span>
          </div>
        ) : null}
      </div>
    </motion.div>
  );
}

export default ProcessTable;

