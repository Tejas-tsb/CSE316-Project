import { io } from "socket.io-client";

const resolveBackendBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  const protocol = window.location.protocol === "https:" ? "https:" : "http:";
  const hostname = window.location.hostname || "127.0.0.1";
  return `${protocol}//${hostname}:5001`;
};

const API_URL = resolveBackendBaseUrl();
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API_URL;

export async function apiRequest(path, options = {}) {
  const { token, method = "GET", body, responseType = "json" } = options;
  const headers = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = "Request failed.";
    try {
      const payload = await response.json();
      message = payload.message || message;
    } catch (error) {
      message = response.statusText || message;
    }
    throw new Error(message);
  }

  if (responseType === "blob") {
    return response.blob();
  }

  return response.json();
}

export function createSocket(token) {
  return io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ["websocket", "polling"],
  });
}
