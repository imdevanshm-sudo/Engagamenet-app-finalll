import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Increased buffer for images
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  maxHttpBufferSize: 5e7 
});

const PORT = process.env.PORT || 8080;

// --- 🔥 IN-MEMORY STATE (The Truth) ---
let currentState = {
  heartCount: 0,
  messages: [],
  gallery: [],
  guestList: [],
  lanterns: [], // Added Lanterns
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
  console.log('Client connected:', socket.id);

  // 1. Send Full State on Connection
  socket.emit('full_sync', currentState);

  // 2. Requests
  socket.on('request_sync', () => socket.emit('full_sync', currentState));

  // 3. Hearts
  socket.on('send_heart', () => {
      currentState.heartCount++;
      io.emit('heart_update', { count: currentState.heartCount });
  });

  // 4. Chat
  socket.on('message', (msg) => {
    currentState.messages.push(msg);
    if (currentState.messages.length > 100) currentState.messages.shift();
    io.emit('message', { payload: msg });
  });

  socket.on('message_sync', (msgs) => {
      currentState.messages = msgs;
      io.emit('message_sync', { payload: msgs });
  });

  // 5. Gallery
  socket.on('gallery_upload', (item) => {
      currentState.gallery.unshift(item);
      if (currentState.gallery.length > 50) currentState.gallery.pop();
      io.emit('gallery_sync', { payload: currentState.gallery });
  });
  
  socket.on('gallery_sync', (items) => {
      currentState.gallery = items;
      io.emit('gallery_sync', { payload: items });
  });

  // 6. Theme & Config
  socket.on('theme_update', (theme) => {
    currentState.theme = theme;
    io.emit('theme_update', theme); // 🔥 Broadcasts Theme to everyone
  });

  socket.on('config_update', (config) => {
      currentState.config = { ...currentState.config, ...config };
      io.emit('config_sync', { payload: currentState.config });
  });

  // 7. Lanterns (New)
  socket.on('send_lantern', (lantern) => {
      currentState.lanterns.push(lantern);
      // Keep only last 20 lanterns to prevent lag
      if (currentState.lanterns.length > 20) currentState.lanterns.shift();
      io.emit('lantern_added', { payload: lantern });
  });

  // 8. Users & RSVP
  socket.on('user_join', (user) => {
      // Remove existing to update info
      currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
      currentState.guestList.push(user);
      io.emit('user_presence', { payload: user });
  });

  socket.on('send_rsvp', (data) => {
      const user = currentState.guestList.find(g => g.name === data.name);
      if (user) {
          user.rsvp = true;
          io.emit('user_presence', { payload: user });
      }
  });

  socket.on('block_user', (name) => {
      currentState.guestList = currentState.guestList.filter(g => g.name !== name);
      io.emit('block_user', { name });
  });

  // 9. Music & Extras
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
});

// Serve React App
app.use(express.static(path.join(__dirname, 'dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});