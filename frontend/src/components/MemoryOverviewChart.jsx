import { motion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { formatBytes, formatPercent } from "../lib/formatters";

const chartColors = ["var(--accent)", "rgba(148, 163, 184, 0.22)"];

function MemoryTooltip({ active, payload }) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0]?.payload;
  if (!item) {
    return null;
  }

  return (
    <div className="memory-tooltip">
      <p className="memory-tooltip-label">{item.name}</p>
      <p className="memory-tooltip-value">{formatBytes(item.value)}</p>
    </div>
  );
}

function MemoryOverviewChart({ summary }) {
  const used = summary?.memoryBytes?.used || 0;
  const total = summary?.memoryBytes?.total || 1;
  const free = Math.max(total - used, 0);
  const data = [
    { name: "Used", value: used },
    { name: "Free", value: free },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay: 0.08 }}
      className="glass-panel flex h-full flex-col"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="panel-kicker">Memory Footprint</p>
          <h3 className="panel-title">RAM pressure and availability</h3>
        </div>
        <div className="chip">{formatPercent(summary?.memory)}</div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 lg:flex-row lg:items-center">
        <div className="mx-auto h-52 w-full max-w-[208px] lg:mx-0 lg:h-[208px] lg:max-w-[208px] lg:flex-none">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={96}
                stroke="transparent"
                paddingAngle={0}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip content={<MemoryTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4 lg:min-w-0 lg:flex-1">
          <div className="memory-stat">
            <span>Used</span>
            <strong>{formatBytes(used)}</strong>
          </div>
          <div className="memory-stat">
            <span>Free</span>
            <strong>{formatBytes(free)}</strong>
          </div>
          <div className="memory-stat">
            <span>Total</span>
            <strong>{formatBytes(total)}</strong>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default MemoryOverviewChart;
