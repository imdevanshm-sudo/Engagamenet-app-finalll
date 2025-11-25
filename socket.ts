import { io } from "socket.io-client";

// ✅ FIX: Point directly to your Render Backend URL
// Do not use localhost or relative paths here.
const BACKEND_URL = "https://engagamenet-app-finalll.onrender.com";

console.log("🔌 Initializing socket connection to:", BACKEND_URL);

export const socket = io(BACKEND_URL, {
  transports: ["websocket", "polling"], // Try WebSocket first, fall back to polling
  withCredentials: true,                // Essential for CORS sessions
  autoConnect: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,       // Keep trying if network drops
});

// --- Debug Listeners ---
socket.on("connect", () => {
  console.log("✅ SOCKET CONNECTED:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("❌ SOCKET ERROR:", err.message);
});