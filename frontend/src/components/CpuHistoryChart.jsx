import { motion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

function CpuHistoryChart({ data }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="glass-panel flex h-full flex-col"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="panel-kicker">Realtime CPU Load</p>
          <h3 className="panel-title">System usage over the last minute</h3>
        </div>
        <div className="chip">1s cadence</div>
      </div>

      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.45} />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.04} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} minTickGap={28} />
            <YAxis
              tick={{ fill: "var(--text-secondary)", fontSize: 11 }}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(9, 15, 28, 0.92)",
                borderRadius: 16,
                border: "1px solid rgba(148, 163, 184, 0.18)",
                color: "#e5eefb",
              }}
              formatter={(value) => [`${Number(value).toFixed(1)}%`, "CPU"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--accent)"
              strokeWidth={3}
              fill="url(#cpuGradient)"
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}

export default CpuHistoryChart;
