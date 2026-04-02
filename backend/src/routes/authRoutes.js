import { Router } from "express";

import { createAuthMiddleware } from "../services/authService.js";

export const createAuthRoutes = (authService) => {
  const router = Router();
  const requireAuth = createAuthMiddleware(authService);

  router.post("/login", (request, response) => {
    const { username, password } = request.body || {};
    const token = authService.login(username, password);

    if (!token) {
      return response.status(401).json({ message: "Invalid username or password." });
    }

    return response.json({
      token,
      user: {
        username,
        role: "operator",
      },
    });
  });

  router.get("/me", requireAuth, (request, response) => {
    response.json({
      user: {
        username: request.user.username,
        role: request.user.role,
      },
    });
  });

  return router;
};

