import clsx from "clsx";
import { motion } from "framer-motion";

const toneStyles = {
  normal: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  warning: "border-amber-400/30 bg-amber-500/10 text-amber-300",
  critical: "border-rose-400/30 bg-rose-500/10 text-rose-300",
};

function StatCard({ icon: Icon, label, value, helper, tone = "normal", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-panel relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--accent)]/60 to-transparent" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--text-secondary)]">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold text-[var(--text-primary)]">{value}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{helper}</p>
        </div>
        <div className={clsx("rounded-2xl border p-3", toneStyles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

export default StatCard;

