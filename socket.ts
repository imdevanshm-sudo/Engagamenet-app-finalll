import { io } from 'socket.io-client';

const BACKEND_URL = "https://engagamenet-app-finalll.onrender.com";

console.log("Attempting to connect socket to:", BACKEND_URL);

export const socket = io(BACKEND_URL, {
  // Allow both methods. 'polling' helps establish the initial connection on some networks.
  transports: ['polling', 'websocket'], 
  autoConnect: true,
  reconnection: true,
});

// Debugging listeners
socket.on("connect", () => {
    console.log("✅ SOCKET CONNECTED! ID:", socket.id);
});

socket.on("connect_error", (err) => {
    console.log("❌ CONNECTION FAILED:", err.message);
});