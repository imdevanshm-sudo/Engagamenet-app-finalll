
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Increased buffer size to 50MB to handle image uploads via socket
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  maxHttpBufferSize: 5e7 
});

const PORT = process.env.PORT || 8080;

// --- In-Memory State (Single Source of Truth) ---
let currentState = {
  heartCount: 0,
  messages: [],
  gallery: [],
  guestList: [],
  mapMarkers: [], // { name, role, lat, lng, timestamp, id }
  theme: { gradient: 'royal', effect: 'dust' },
  config: { coupleName: "Sneha & Aman", date: "2025-11-26", welcomeMsg: "Join us as we begin our forever.", coupleImage: "" },
  currentSong: null,
  isPlaying: false,
  announcement: null
};

// --- Socket Logic ---
io.on('connection', (socket) => {
  console.log('Client connected');

  // 1. Send Full State on Connection
  socket.emit('full_sync', currentState);

  // 2. Handle Updates
  socket.on('request_sync', () => {
      socket.emit('full_sync', currentState);
  });

  // Increment hearts atomically to handle concurrent clicks
  socket.on('send_heart', () => {
      currentState.heartCount++;
      io.emit('heart_update', { count: currentState.heartCount });
  });

  // Allow admin to force set hearts (e.g. reset)
  socket.on('heart_update', (count) => {
      if (count > currentState.heartCount) {
          currentState.heartCount = count;
          io.emit('heart_update', { count });
      }
  });

  socket.on('message', (msg) => {
    currentState.messages.push(msg);
    // Keep only last 100 messages to save memory
    if (currentState.messages.length > 100) currentState.messages.shift();
    io.emit('message', { payload: msg });
  });
  
  // Admin clearing messages
  socket.on('message_sync', (msgs) => {
      currentState.messages = msgs;
      io.emit('message_sync', { payload: msgs });
  });

  socket.on('gallery_upload', (mediaItem) => {
      currentState.gallery.unshift(mediaItem);
      if (currentState.gallery.length > 50) currentState.gallery.pop();
      io.emit('gallery_sync', { payload: currentState.gallery });
  });
  
  socket.on('gallery_sync', (gallery) => {
      currentState.gallery = gallery;
      io.emit('gallery_sync', { payload: gallery });
  });

  socket.on('theme_update', (theme) => {
    currentState.theme = theme;
    io.emit('theme_sync', { payload: theme });
  });

  socket.on('config_update', (config) => {
      currentState.config = { ...currentState.config, ...config };
      io.emit('config_sync', { payload: currentState.config });
  });
  
  socket.on('announcement', (msg) => {
      currentState.announcement = msg;
      io.emit('announcement', { message: msg });
  });
  
  socket.on('user_join', (user) => {
      // Remove existing entry if re-joining to update timestamp
      currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
      currentState.guestList.push(user);
      io.emit('user_presence', { payload: user });
  });

  socket.on('playlist_update', (data) => {
      currentState.currentSong = data.currentSong;
      currentState.isPlaying = data.isPlaying;
      io.emit('playlist_update', data);
  });
  
  socket.on('block_user', (name) => {
      currentState.guestList = currentState.guestList.filter(g => g.name !== name);
      currentState.mapMarkers = currentState.mapMarkers.filter(m => m.name !== name);
      io.emit('block_user', { name });
      io.emit('location_update', currentState.mapMarkers);
  });

  // --- Map Location Sync ---
  socket.on('location_share', (data) => {
      // Update or add marker for user
      const existingIdx = currentState.mapMarkers.findIndex(m => m.name === data.name);
      if (existingIdx > -1) {
          currentState.mapMarkers[existingIdx] = { ...data, timestamp: Date.now() };
      } else {
          currentState.mapMarkers.push({ ...data, timestamp: Date.now() });
      }
      io.emit('location_update', currentState.mapMarkers);
  });
});

// Serve static files from the React build
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
