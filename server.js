import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// 🔥 FIX: Explicitly allow CORS for your frontend
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:5173",                  // Local Vite Dev
      "http://localhost:4173",                  // Local Vite Preview
      "https://weengagedgit-95729857-ba728.web.app", // Your Firebase URL
      "https://engagamenet-app-finalll.onrender.com" // Your Render URL
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  maxHttpBufferSize: 5e7, // 50MB for images
  pingTimeout: 60000,     // 60s timeout to prevent disconnects
  transports: ['websocket', 'polling'] // Allow both
});

const PORT = process.env.PORT || 8080;

// --- IN-MEMORY STATE ---
let currentState = {
  heartCount: 0,
  messages: [],
  gallery: [],
  guestList: [],
  lanterns: [],
  locations: {},
  theme: { gradient: 'royal', effect: 'dust' },
  config: { 
    coupleName: "Sneha & Aman", 
    date: "2025-11-26", 
    welcomeMsg: "Join us as we begin our forever.", 
    coupleImage: "" 
  },
  currentSong: null,
  isPlaying: false,
  announcement: null
};

io.on('connection', (socket) => {
  console.log('✅ Client connected:', socket.id);

  // 1. Send Full State Immediately
  socket.emit('full_sync', currentState);

  // 2. Handle Sync Request
  socket.on('request_sync', () => {
      socket.emit('full_sync', currentState);
  });

  // --- User & Map Logic ---
  socket.on('user_join', (user) => {
      console.log(`👤 User joined: ${user.name} (${user.role})`);
      // Remove duplicates based on name
      currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
      currentState.guestList.push(user);
      io.emit('user_presence', { payload: user });
  });

  socket.on('location_update', (data) => {
      if (data.name && data.lat && data.lng) {
          currentState.locations[data.name] = { 
              lat: data.lat, 
              lng: data.lng, 
              timestamp: Date.now() 
          };
          io.emit('locations_sync', currentState.locations);
      }
  });

  socket.on('send_rsvp', (data) => {
      const user = currentState.guestList.find(g => g.name === data.name);
      if (user) {
          user.rsvp = true;
          // Broadcast update
          io.emit('user_presence', { payload: user });
      }
  });

  socket.on('block_user', (name) => {
      currentState.guestList = currentState.guestList.filter(g => g.name !== name);
      delete currentState.locations[name];
      io.emit('block_user', { name });
      io.emit('locations_sync', currentState.locations);
  });

  // --- Interactive Features ---
  socket.on('send_heart', () => {
      currentState.heartCount++;
      io.emit('heart_update', { count: currentState.heartCount });
  });

  socket.on('send_lantern', (lantern) => {
      currentState.lanterns.push(lantern);
      if (currentState.lanterns.length > 20) currentState.lanterns.shift();
      io.emit('lantern_added', { payload: lantern });
  });

  socket.on('message', (msg) => {
      currentState.messages.push(msg);
      if (currentState.messages.length > 100) currentState.messages.shift();
      io.emit('message', { payload: msg });
  });

  socket.on('message_sync', (msgs) => {
      currentState.messages = msgs;
      io.emit('message_sync', { payload: msgs });
  });

  socket.on('gallery_upload', (item) => {
      currentState.gallery.unshift(item);
      if (currentState.gallery.length > 50) currentState.gallery.pop();
      io.emit('gallery_sync', { payload: currentState.gallery });
  });
  
  socket.on('gallery_sync', (items) => {
      currentState.gallery = items;
      io.emit('gallery_sync', { payload: items });
  });

  // --- Config & Theme ---
  socket.on('theme_update', (theme) => {
      console.log("🎨 Theme updated to:", theme.gradient);
      currentState.theme = theme;
      io.emit('theme_update', theme);
  });

  socket.on('config_update', (config) => {
      currentState.config = { ...currentState.config, ...config };
      io.emit('config_sync', { payload: currentState.config });
  });

  socket.on('playlist_update', (data) => {
      currentState.currentSong = data.currentSong;
      currentState.isPlaying = data.isPlaying;
      io.emit('playlist_update', data);
  });

  socket.on('announcement', (msg) => {
      currentState.announcement = msg;
      io.emit('announcement', { message: msg });
  });

  socket.on('typing', (data) => {
      socket.broadcast.emit('typing', data);
  });

  socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
  });
});

// Serve Static Files (If you visit the backend URL directly)
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  // Send index.html for any other requests
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`   - Socket.io allowed origins configured.`);
});