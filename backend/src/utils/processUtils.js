const stateLabels = new Map([
  ["running", "Running"],
  ["sleeping", "Sleeping"],
  ["sleep", "Sleeping"],
  ["stopped", "Stopped"],
  ["stop", "Stopped"],
  ["zombie", "Zombie"],
]);

export const normalizeState = (rawState) => {
  if (!rawState) return "Unknown";

  const normalized = String(rawState).trim().toLowerCase();
  for (const [key, label] of stateLabels.entries()) {
    if (normalized.includes(key)) {
      return label;
    }
  }

  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

export const clampPercent = (value) => {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
};

export const normalizeProcess = (processInfo, totalMemory) => {
  const memoryBytes = processInfo.memRss || processInfo.mem_resident || 0;
  const memoryPercent = Number.isFinite(processInfo.mem)
    ? clampPercent(processInfo.mem)
    : clampPercent((memoryBytes / totalMemory) * 100);
  const cpuPercent = clampPercent(processInfo.pcpu ?? processInfo.cpu ?? 0);

  return {
    pid: processInfo.pid,
    name: processInfo.name || processInfo.command || "Unknown Process",
    command: processInfo.command || processInfo.path || processInfo.name || "",
    cpu: cpuPercent,
    memoryPercent,
    memoryBytes,
    status: normalizeState(processInfo.state),
    user: processInfo.user || "system",
    started: processInfo.started || null,
    highUsage: cpuPercent >= 35 || memoryPercent >= 8,
  };
};

export const buildStatusBreakdown = (processes) => {
  return processes.reduce(
    (accumulator, processInfo) => {
      accumulator[processInfo.status] = (accumulator[processInfo.status] || 0) + 1;
      return accumulator;
    },
    { Running: 0, Sleeping: 0, Stopped: 0, Zombie: 0 }
  );
};

