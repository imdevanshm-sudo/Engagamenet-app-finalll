import { io } from "socket.io-client";

const BACKEND_URL = "https://engagamenet-app-finalll.onrender.com";

console.log("🔌 Connecting to backend:", BACKEND_URL);

export const socket = io(BACKEND_URL, {
  transports: ["websocket"],           // 🚀 Always use WebSocket on Render
  forceNew: false,
  reconnection: true,
  reconnectionDelay: 800,
  reconnectionDelayMax: 2500,
  reconnectionAttempts: Infinity,      // never stop trying
  timeout: 20000,                      // 20s timeout to avoid false disconnects
  autoConnect: true,
});

// --- DEBUG LOGGING ---
socket.on("connect", () => {
  console.log("✅ CONNECTED:", socket.id);
});

socket.on("disconnect", (reason) => {
  console.warn("⚠️ DISCONNECTED:", reason);
});

socket.on("connect_error", (err) => {
  console.error("❌ CONNECT ERROR:", err.message);
  console.error("Details:", err);
});
