import { Router } from "express";

const safeFilename = (format) => `pulseops-logs-${new Date().toISOString().split("T")[0]}.${format}`;

export const createSystemRoutes = (monitorService) => {
  const router = Router();

  router.get("/snapshot", (request, response) => {
    response.json({
      snapshot: monitorService.getSnapshot(),
      alerts: monitorService.getAlerts().slice(0, 20),
      activityLogs: monitorService.getActivityLogs().slice(0, 30),
    });
  });

  router.post("/processes/:pid/kill", (request, response) => {
    const pid = Number(request.params.pid);

    if (!Number.isInteger(pid) || pid <= 0) {
      return response.status(400).json({ message: "A valid PID is required." });
    }

    try {
      process.kill(pid, "SIGTERM");
      monitorService.registerProcessTermination(pid, request.user.username);
      return response.json({
        message: `Process ${pid} received SIGTERM.`,
      });
    } catch (error) {
      return response.status(500).json({
        message: `Unable to terminate PID ${pid}: ${error.message}`,
      });
    }
  });

  router.get("/logs/export", (request, response) => {
    const format = request.query.format === "csv" ? "csv" : "json";
    const payload = monitorService.exportLogs(format);

    response.setHeader("Content-Disposition", `attachment; filename="${safeFilename(format)}"`);
    response.type(format === "csv" ? "text/csv" : "application/json");
    response.send(payload);
  });

  return router;
};

