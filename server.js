
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
  lanterns: [], // Stores the sky lanterns
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

  socket.on('typing', (data) => {
      socket.broadcast.emit('typing', data);
  });
  
  // Admin clearing messages
  socket.on('message_sync', (msgs) => {
      currentState.messages = msgs;
      io.emit('message_sync', { payload: msgs });
  });

  // Lanterns Logic
  socket.on('send_lantern', (lantern) => {
      currentState.lanterns.push(lantern);
      // Limit stored lanterns
      if (currentState.lanterns.length > 200) currentState.lanterns.shift();
      io.emit('lantern_added', { payload: lantern });
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
  
  // Handle User Join
  socket.on('user_join', (user) => {
      // Check if user already exists to preserve data like RSVP
      const existing = currentState.guestList.find(g => g.name === user.name);
      const newUser = { ...user, rsvp: existing ? existing.rsvp : false };

      currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
      currentState.guestList.push(newUser);
      io.emit('user_presence', { payload: newUser });
  });

  // Handle RSVP
  socket.on('send_rsvp', (data) => {
      const guestIndex = currentState.guestList.findIndex(g => g.name === data.name);
      if (guestIndex !== -1) {
          const updatedGuest = { ...currentState.guestList[guestIndex], rsvp: true };
          currentState.guestList[guestIndex] = updatedGuest;
          io.emit('user_presence', { payload: updatedGuest });
      }
  });

  socket.on('playlist_update', (data) => {
      currentState.currentSong = data.currentSong;
      currentState.isPlaying = data.isPlaying;
      io.emit('playlist_update', data);
  });
  
  socket.on('block_user', (name) => {
      currentState.guestList = currentState.guestList.filter(g => g.name !== name);
      io.emit('block_user', { name });
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
