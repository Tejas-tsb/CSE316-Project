import cors from "cors";
import express from "express";
import http from "http";
import morgan from "morgan";
import { Server } from "socket.io";

import { config } from "./config/env.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import { createSystemRoutes } from "./routes/systemRoutes.js";
import { AuthService } from "./services/authService.js";
import { MonitorService } from "./services/monitorService.js";
import { createAuthMiddleware } from "./services/authService.js";

const app = express();

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (config.clientOrigins.includes(origin)) return true;

  return /^https?:\/\/((localhost|127\.0\.0\.1)(:\d+)?|(10|192\.168)\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?|172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}(:\d+)?|[a-zA-Z0-9-]+\.local(:\d+)?)$/.test(
    origin
  );
};

const resolveCorsOrigin = (origin, callback) => {
  if (isOriginAllowed(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error("Origin not allowed by PulseOps CORS policy."));
};

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: resolveCorsOrigin,
    credentials: true,
  },
});

const authService = new AuthService(config);
const monitorService = new MonitorService(config);
monitorService.attachIO(io);

const requireAuth = createAuthMiddleware(authService);

app.use(
  cors({
    origin: resolveCorsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (request, response) => {
  response.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", createAuthRoutes(authService));
app.use("/api/system", requireAuth, createSystemRoutes(monitorService));

io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required."));
    }

    socket.user = authService.verify(token);
    next();
  } catch (error) {
    next(new Error("Invalid token."));
  }
});

io.on("connection", (socket) => {
  socket.emit("metrics:update", monitorService.getSnapshot());
  socket.emit("logs:update", monitorService.getActivityLogs().slice(0, 30));
});

const startServer = async () => {
  await monitorService.initialize();
  monitorService.start();

  server.listen(config.port, config.host, () => {
    console.log(
      `PulseOps API listening on http://${config.host}:${config.port} with origins ${config.clientOrigins.join(
        ", "
      )}`
    );
  });
};

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
