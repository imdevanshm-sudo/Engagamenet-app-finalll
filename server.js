// server.js — FINAL FULLY UPDATED BUILD (Lanterns + Media + Chat + Themes + Full Sync)
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);

/* ---------------------------------------------------
   STATE
--------------------------------------------------- */
let coupleSockets = {};
const COUPLE_NAMES = ["Aman", "Sneha"];

let currentState = {
  activeSlide: 0,

  gallery: [],               // photos/videos
  chatMessages: [],          // chat
  guestList: [],             // who joined
  hearts: 0,                 // adore meter
  lanterns: [],              // floating lanterns (ephemeral)
  locations: {},             // live guest positions
  adminAnnouncement: null,   // announcement message
  config: {},                // coupleName/date/welcomeMessage/etc
  theme: {},                 // theme settings
  quiz: {
    questions: [],
    currentQuestionIndex: 0,
    scores: {},
    showResults: false,
  }
};

/* ---------------------------------------------------
   SOCKET INIT
--------------------------------------------------- */
const io = new Server(httpServer, {
  cors: {
    origin: (origin, cb) => cb(null, true),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

/* ---------------------------------------------------
   BROADCAST FULL GLOBAL SNAPSHOT
--------------------------------------------------- */
const broadcastState = () => {
  io.emit("sync_data", currentState);
};

/* ---------------------------------------------------
   SOCKET HANDLERS
--------------------------------------------------- */
io.on("connection", (socket) => {
  console.log("🔥 Device Connected:", socket.id);

  // Send full state instantly
  socket.emit("sync_data", currentState);

  /* ------------------------------
      USER JOIN / PRESENCE
  ------------------------------ */
  socket.on("user_join", (user) => {
    if (user?.role === "couple" && COUPLE_NAMES.includes(user.name)) {
      coupleSockets[user.name] = socket.id;
    }

    currentState.guestList = currentState.guestList.filter(g => g.name !== user.name);
    currentState.guestList.push(user);

    io.emit("user_presence", { payload: user });
    broadcastState();
  });

  /* ------------------------------
      CHAT MESSAGE
  ------------------------------ */
  socket.on("send_message", (message) => {
    currentState.chatMessages.push(message);

    io.emit("message", { payload: message });
    broadcastState();
  });

  /* ------------------------------
      TYPING INDICATOR
  ------------------------------ */
  socket.on("typing", (payload) => {
    socket.broadcast.emit("typing", payload);
  });

  /* ------------------------------
      HEARTS
  ------------------------------ */
  socket.on("add_heart", () => {
    currentState.hearts++;
    io.emit("heart_update", { count: currentState.hearts });
    broadcastState();
  });

  /* ------------------------------
      ANNOUNCEMENT
  ------------------------------ */
  socket.on("admin_announce", (msg) => {
    currentState.adminAnnouncement = {
      text: msg?.text ?? "",
      timestamp: Date.now(),
    };

    io.emit("announcement", { message: msg.text });
    broadcastState();
  });

  /* ------------------------------
      ADMIN GLOBAL SETTINGS
  ------------------------------ */
  socket.on("admin_update_settings", (newSettings) => {
    currentState.config = { ...currentState.config, ...newSettings };

    io.emit("config_sync", { payload: currentState.config });
    broadcastState();
  });

  /* ------------------------------
      THEME UPDATE
  ------------------------------ */
  socket.on("theme_update", (theme) => {
    currentState.theme = theme;

    io.emit("theme_sync", theme);
    broadcastState();
  });

  /* ------------------------------
      GALLERY UPLOAD
  ------------------------------ */
  socket.on("gallery_upload", (item) => {
    currentState.gallery.unshift(item); // newest first

    io.emit("gallery_sync", item);
    broadcastState();
  });

  /* ------------------------------
      LANTERN RELEASE — FULL SUPPORT
  ------------------------------ */
  socket.on("release_lantern", (lantern) => {
    if (!lantern?.id) return;

    // Sender sees own lantern
    io.to(socket.id).emit("receive_lantern", lantern);

    // Couple sees lantern
    Object.values(coupleSockets).forEach((sockId) => {
      io.to(sockId).emit("receive_lantern", lantern);
    });

    // Store temporarily
    currentState.lanterns.push(lantern);

    // Auto-clean after 12 seconds
    setTimeout(() => {
      currentState.lanterns = currentState.lanterns.filter(
        (l) => l.id !== lantern.id
      );
      broadcastState();
    }, 12000);
  });

  /* ------------------------------
      LOCATIONS
  ------------------------------ */
  socket.on("location_update", (data) => {
    if (!data?.name) return;

    currentState.locations[data.name] = {
      lat: data.lat,
      lng: data.lng,
      timestamp: Date.now(),
    };

    io.emit("locations_sync", currentState.locations);
  });

  /* ------------------------------
      QUIZ ANSWER
  ------------------------------ */
  socket.on("quiz_answer", (data) => {
    const { user, questionId, answer } = data;

    const question = currentState.quiz.questions.find(q => q.id === questionId);
    if (!question) return;

    if (!currentState.quiz.scores[user])
      currentState.quiz.scores[user] = { score: 0, name: user };

    if (question.answer === answer)
      currentState.quiz.scores[user].score++;

    broadcastState();
  });

  /* ------------------------------
      SLIDE CHANGE
  ------------------------------ */
  socket.on("slide_change", (newSlide) => {
    currentState.activeSlide = newSlide;
    io.emit("slide_changed", newSlide);
    broadcastState();
  });

  /* ------------------------------
      MANUAL SYNC REQUEST
  ------------------------------ */
  socket.on("request_sync", () => {
    socket.emit("sync_data", currentState);
  });

  /* ------------------------------
      DISCONNECT
  ------------------------------ */
  socket.on("disconnect", () => {
    Object.keys(coupleSockets).forEach(name => {
      if (coupleSockets[name] === socket.id)
        delete coupleSockets[name];
    });

    console.log("❌ Device Disconnected:", socket.id);
  });
});

/* ---------------------------------------------------
   EXPRESS ROOT
--------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("<h1>Wedding Sync Server Running ✔</h1>");
});

/* ---------------------------------------------------
   START SERVER
--------------------------------------------------- */
httpServer.listen(PORT, () =>
  console.log(`🚀 Real-time Wedding Server Live at Port ${PORT}`)
);
