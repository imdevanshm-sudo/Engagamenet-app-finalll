// server.js (UPGRADED FIXED VERSION — NO UI/UX CHANGES)
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);

let coupleSockets = {};
const COUPLE_NAMES = ["Aman", "Sneha"];

const io = new Server(httpServer, {
  cors: {
    origin: (o, cb) => cb(null, true),
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.PORT || 3001;

/* ---------------------------------------------------
   CENTRAL GLOBAL STATE
   --------------------------------------------------- */

let currentState = {
  activeSlide: 0,
  gallery: [],
  guestList: [],
  locations: {},
  adminAnnouncement: null,
  chatMessages: [],
  hearts: 0,
  lanterns: [],
  quiz: {
    questions: [],
    currentQuestionIndex: 0,
    scores: {},
    showResults: false,
  },
  config: {}, // ADDED
  theme: {}, // ADDED
};

/* ---------------------------------------------------
   BROADCAST FULL SNAPSHOT
   --------------------------------------------------- */
const broadcastState = () => {
  io.emit("sync_data", currentState);
};

/* ---------------------------------------------------
   SOCKET.IO
   --------------------------------------------------- */

io.on("connection", (socket) => {
  console.log("🔥 Device Connected:", socket.id);

  // Immediately sync client
  socket.emit("sync_data", currentState);

  /* ---------------------------------------------------
     USER JOIN
     --------------------------------------------------- */
  socket.on("user_join", (user) => {
    if (user?.role === "couple" && COUPLE_NAMES.includes(user.name)) {
      coupleSockets[user.name] = socket.id;
    }

    currentState.guestList = currentState.guestList.filter(
      (g) => g.name !== user.name
    );
    currentState.guestList.push(user);

    io.emit("user_presence", { payload: user });
    broadcastState();
  });

  /* ---------------------------------------------------
     CHAT: SEND MESSAGE
     --------------------------------------------------- */
  socket.on("send_message", (message) => {
    // Store
    currentState.chatMessages.push(message);

    // FIXED: Client expects `message`
    io.emit("message", { payload: message });

    broadcastState();
  });

  /* ---------------------------------------------------
     TYPING INDICATOR
     --------------------------------------------------- */
  socket.on("typing", (payload) => {
    socket.broadcast.emit("typing", payload);
  });

  /* ---------------------------------------------------
     HEARTS
     --------------------------------------------------- */
  socket.on("add_heart", () => {
    currentState.hearts++;
    io.emit("heart_update", { count: currentState.hearts });
    broadcastState();
  });

  /* ---------------------------------------------------
     ANNOUNCEMENT
     --------------------------------------------------- */
  socket.on("admin_announce", (message) => {
    currentState.adminAnnouncement = {
      text: message.text,
      timestamp: Date.now(),
    };
    io.emit("announcement", { message: message.text });
    broadcastState();
  });

  /* ---------------------------------------------------
     ADMIN SETTINGS UPDATE
     --------------------------------------------------- */
  socket.on("admin_update_settings", (newSettings) => {
    currentState.config = { ...currentState.config, ...newSettings };
    io.emit("config_sync", { payload: currentState.config });
    broadcastState();
  });

  /* ---------------------------------------------------
     THEME UPDATE (Admin Theme Tab)
     --------------------------------------------------- */
  socket.on("theme_update", (theme) => {
    currentState.theme = theme;
    io.emit("theme_sync", theme);
    broadcastState();
  });

  /* ---------------------------------------------------
     GALLERY UPLOAD
     --------------------------------------------------- */
  socket.on("gallery_upload", (item) => {
    currentState.gallery.unshift(item); // newest first
    io.emit("gallery_sync", item);
    broadcastState();
  });

  /* ---------------------------------------------------
     LOCATIONS
     --------------------------------------------------- */
  socket.on("location_update", (data) => {
    if (!data?.name) return;

    currentState.locations[data.name] = {
      lat: data.lat,
      lng: data.lng,
      timestamp: Date.now(),
    };

    io.emit("locations_sync", currentState.locations);
  });

  /* ---------------------------------------------------
     QUIZ
     --------------------------------------------------- */
  socket.on("quiz_answer", (data) => {
    const { user, questionId, answer } = data;

    const question = currentState.quiz.questions.find(
      (q) => q.id === questionId
    );
    if (!question) return;

    if (!currentState.quiz.scores[user])
      currentState.quiz.scores[user] = { score: 0, name: user };

    if (question.answer === answer)
      currentState.quiz.scores[user].score++;

    broadcastState();
  });

  /* ---------------------------------------------------
     SLIDES
     --------------------------------------------------- */
  socket.on("slide_change", (newSlide) => {
    currentState.activeSlide = newSlide;
    io.emit("slide_changed", newSlide);
    broadcastState();
  });

  /* ---------------------------------------------------
     RE-SYNC REQUEST
     --------------------------------------------------- */
  socket.on("request_sync", () => {
    socket.emit("sync_data", currentState);
  });

  /* ---------------------------------------------------
     DISCONNECT
     --------------------------------------------------- */
  socket.on("disconnect", () => {
    Object.keys(coupleSockets).forEach((name) => {
      if (coupleSockets[name] === socket.id) delete coupleSockets[name];
    });
    console.log("❌ Device Disconnected:", socket.id);
  });
});

/* ---------------------------------------------------
   EXPRESS ROOT
   --------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("<h1>Wedding Sync Server OK</h1>");
});

httpServer.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
