import dotenv from "dotenv";

dotenv.config();

const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  host: process.env.HOST || "0.0.0.0",
  port: parseNumber(process.env.PORT, 5001),
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  jwtSecret: process.env.JWT_SECRET || "change-this-secret",
  authUsername: process.env.AUTH_USERNAME || "admin",
  authPassword: process.env.AUTH_PASSWORD || "admin123",
  pollInterval: parseNumber(process.env.POLL_INTERVAL, 1000),
  maxProcesses: parseNumber(process.env.MAX_PROCESSES, 250),
  cpuAlertThreshold: parseNumber(process.env.ALERT_CPU_THRESHOLD, 80),
  memoryAlertThreshold: parseNumber(process.env.ALERT_MEMORY_THRESHOLD, 75),
};

