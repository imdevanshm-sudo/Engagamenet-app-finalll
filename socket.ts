import { io } from 'socket.io-client';

const URL = "https://engagamenet-app-finalll.onrender.com";

export const socket = io(URL, {
    autoConnect: true,
    transports: ['websocket', 'polling']
});

// Add these listeners to see what is happening in the console
socket.on("connect", () => {
    console.log("✅ SOCKET CONNECTED! ID:", socket.id);
});

socket.on("connect_error", (err) => {
    console.log("❌ SOCKET CONNECTION FAILED:", err.message);
});