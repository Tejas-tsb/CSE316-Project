import jwt from "jsonwebtoken";

export class AuthService {
  constructor(config) {
    this.config = config;
  }

  login(username, password) {
    if (username !== this.config.authUsername || password !== this.config.authPassword) {
      return null;
    }

    return jwt.sign(
      {
        username,
        role: "operator",
      },
      this.config.jwtSecret,
      { expiresIn: "12h" }
    );
  }

  verify(token) {
    return jwt.verify(token, this.config.jwtSecret);
  }
}

export const getTokenFromRequest = (request) => {
  const authorizationHeader = request.headers.authorization || "";
  if (!authorizationHeader.startsWith("Bearer ")) {
    return null;
  }

  return authorizationHeader.slice("Bearer ".length);
};

export const createAuthMiddleware = (authService) => {
  return (request, response, next) => {
    try {
      const token = getTokenFromRequest(request);
      if (!token) {
        return response.status(401).json({ message: "Authentication required." });
      }

      request.user = authService.verify(token);
      next();
    } catch (error) {
      return response.status(401).json({ message: "Invalid or expired token." });
    }
  };
};

