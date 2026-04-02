export const formatPercent = (value) => `${Number(value || 0).toFixed(1)}%`;

export const formatBytes = (bytes) => {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(size >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

export const severityTone = (value, warning = 75, critical = 90) => {
  if (value >= critical) return "critical";
  if (value >= warning) return "warning";
  return "normal";
};

export const statusTone = (status) => {
  switch (status) {
    case "Running":
      return "normal";
    case "Sleeping":
      return "muted";
    case "Stopped":
      return "warning";
    case "Zombie":
      return "critical";
    default:
      return "muted";
  }
};

export const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.URL.revokeObjectURL(url);
};

