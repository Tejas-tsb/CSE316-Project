import EventEmitter from "events";
import os from "os";
import si from "systeminformation";

import { buildStatusBreakdown, clampPercent, normalizeProcess } from "../utils/processUtils.js";

const HISTORY_LIMIT = 60;
const ALERT_HISTORY_LIMIT = 120;
const LOG_HISTORY_LIMIT = 250;
const ALERT_COOLDOWN_MS = 30_000;

const levelForValue = (value, warningThreshold) => {
  if (value >= warningThreshold + 10) return "critical";
  if (value >= warningThreshold) return "warning";
  return "normal";
};

const toSeriesPoint = (timestamp, value) => ({
  timestamp,
  label: new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }),
  value: clampPercent(value),
});

export class MonitorService extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.io = null;
    this.collecting = false;
    this.intervalHandle = null;
    this.lastAlertTimes = {};
    this.snapshot = null;
    this.history = {
      cpu: [],
      memory: [],
    };
    this.alerts = [];
    this.activityLogs = [];
  }

  attachIO(io) {
    this.io = io;
  }

  async initialize() {
    await this.collectMetrics();
  }

  start() {
    if (this.intervalHandle) return;
    this.intervalHandle = setInterval(() => {
      this.collectMetrics();
    }, this.config.pollInterval);
  }

  stop() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
  }

  getSnapshot() {
    return this.snapshot;
  }

  getAlerts() {
    return this.alerts;
  }

  getActivityLogs() {
    return this.activityLogs;
  }

  registerProcessTermination(pid, actor) {
    this.addLog({
      kind: "action",
      severity: "warning",
      title: "Process Terminated",
      message: `PID ${pid} was terminated by ${actor}.`,
      timestamp: new Date().toISOString(),
    });
  }

  exportLogs(format = "json") {
    const payload = {
      exportedAt: new Date().toISOString(),
      alerts: this.alerts,
      activityLogs: this.activityLogs,
      latestSummary: this.snapshot?.summary || null,
    };

    if (format === "csv") {
      const rows = [
        ["timestamp", "kind", "severity", "title", "message"],
        ...payload.activityLogs.map((entry) => [
          entry.timestamp,
          entry.kind,
          entry.severity,
          entry.title,
          entry.message.replace(/"/g, '""'),
        ]),
      ];

      return rows
        .map((row) =>
          row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
    }

    return JSON.stringify(payload, null, 2);
  }

  async collectMetrics() {
    if (this.collecting) return;

    this.collecting = true;

    try {
      const [currentLoad, memory, processesData, timeData] = await Promise.all([
        si.currentLoad(),
        si.mem(),
        si.processes(),
        si.time(),
      ]);

      const timestamp = new Date().toISOString();
      const usedMemoryBytes = memory.active || memory.used;
      const overallCpu = clampPercent(currentLoad.currentLoad || 0);
      const overallMemory = clampPercent((usedMemoryBytes / memory.total) * 100);

      const processes = processesData.list
        .map((processInfo) => normalizeProcess(processInfo, memory.total))
        .filter((processInfo) => Number.isInteger(processInfo.pid))
        .sort((left, right) => {
          if (right.cpu !== left.cpu) return right.cpu - left.cpu;
          return right.memoryPercent - left.memoryPercent;
        })
        .slice(0, this.config.maxProcesses);

      this.history.cpu = [...this.history.cpu, toSeriesPoint(timestamp, overallCpu)].slice(
        -HISTORY_LIMIT
      );
      this.history.memory = [...this.history.memory, toSeriesPoint(timestamp, overallMemory)].slice(
        -HISTORY_LIMIT
      );

      const summary = {
        cpu: overallCpu,
        memory: overallMemory,
        totalProcesses: processesData.all || processesData.list.length,
        uptimeSeconds: timeData.uptime || os.uptime(),
        loadAverage: os.loadavg(),
        hostname: os.hostname(),
        platform: `${os.platform()} ${os.release()}`,
        memoryBytes: {
          total: memory.total,
          used: usedMemoryBytes,
          free: memory.available,
        },
        statusBreakdown: buildStatusBreakdown(processes),
      };

      const newAlerts = [
        this.buildThresholdAlert("cpu", summary.cpu, this.config.cpuAlertThreshold, timestamp),
        this.buildThresholdAlert(
          "memory",
          summary.memory,
          this.config.memoryAlertThreshold,
          timestamp
        ),
      ].filter(Boolean);

      if (newAlerts.length > 0) {
        newAlerts.forEach((alert) => this.addAlert(alert));
      }

      this.snapshot = {
        timestamp,
        summary,
        history: this.history,
        alerts: this.alerts.slice(0, 20),
        processes,
      };

      this.broadcast("metrics:update", this.snapshot);
    } catch (error) {
      this.addLog({
        kind: "system",
        severity: "critical",
        title: "Monitoring Error",
        message: error.message,
        timestamp: new Date().toISOString(),
      });
    } finally {
      this.collecting = false;
    }
  }

  buildThresholdAlert(metric, value, threshold, timestamp) {
    if (value < threshold) return null;

    const cacheKey = `${metric}:${threshold}`;
    const lastSentAt = this.lastAlertTimes[cacheKey] || 0;
    const now = Date.now();
    if (now - lastSentAt < ALERT_COOLDOWN_MS) {
      return null;
    }

    this.lastAlertTimes[cacheKey] = now;

    const label = metric === "cpu" ? "CPU" : "Memory";

    return {
      id: `${metric}-${timestamp}`,
      kind: "threshold",
      metric,
      severity: levelForValue(value, threshold),
      title: `${label} Threshold Warning`,
      message: `${label} usage reached ${value.toFixed(1)}%, crossing the ${threshold}% threshold.`,
      timestamp,
      value,
      threshold,
    };
  }

  addAlert(alert) {
    this.alerts = [alert, ...this.alerts].slice(0, ALERT_HISTORY_LIMIT);
    this.addLog({
      kind: "alert",
      severity: alert.severity,
      title: alert.title,
      message: alert.message,
      timestamp: alert.timestamp,
    });
    this.broadcast("alert:new", alert);
  }

  addLog(entry) {
    this.activityLogs = [entry, ...this.activityLogs].slice(0, LOG_HISTORY_LIMIT);
    this.broadcast("logs:update", this.activityLogs.slice(0, 30));
  }

  broadcast(event, payload) {
    if (!this.io) return;
    this.io.emit(event, payload);
  }
}
