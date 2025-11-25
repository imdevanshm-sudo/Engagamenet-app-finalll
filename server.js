// server.js — patched (drop in place of existing server.js)
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import fs from "fs";
import axios from "axios";
import qs from "querystring";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: (o, cb) => cb(null, true),
    methods: ["GET", "POST"],
    credentials: true,
  },
  pingInterval: 20000,
  pingTimeout: 60000,
  allowEIO3: true,
});

const PORT = process.env.PORT || 3001;

/* ---------------------------------------------------
   Central application state (in-memory)
   --------------------------------------------------- */
let currentState = {
  activeSlide: 0,
  gallery: [
    // initial sample items (if you want these to exist, put the files in LOCAL_UPLOADS_DIR)
    { id: "u1", url: "/local_uploads/Screenshot 2025-11-22 at 16.31.44.png", type: "image", caption: "admin-screenshot-1", timestamp: Date.now() - 10000, sender: "system" },
    { id: "u2", url: "/local_uploads/Screenshot 2025-11-22 at 16.43.21.png", type: "image", caption: "admin-screenshot-2", timestamp: Date.now() - 9000, sender: "system" },
  ],
  guestList: [],
  locations: {},
  adminAnnouncement: null,
  chatMessages: [],
  hearts: 0,
  lanterns: [],
  savedLanterns: [],
  quiz: { questions: [], currentQuestionIndex: 0, scores: {}, showResults: false },
  config: {},
  theme: {},
  playlist: { currentSong: null, isPlaying: false, queue: [], spotifyConnected: false, spotifyTokenInfo: null }
};

// Serve the local uploaded screenshots directory under /local_uploads
// Allows override via env var LOCAL_UPLOADS_DIR
const DEFAULT_UPLOADS = path.resolve(process.cwd(), "local_uploads"); // fallback to project/local_uploads
const localUploadsPath = process.env.LOCAL_UPLOADS_DIR || "/mnt/data" || DEFAULT_UPLOADS;

// If the folder doesn't exist, log a warning but continue
try {
  if (!fs.existsSync(localUploadsPath)) {
    console.warn("[server] local uploads path does not exist:", localUploadsPath);
  }
} catch (e) {
  console.warn("[server] could not access local uploads path:", e?.message || e);
}
app.use("/local_uploads", express.static(localUploadsPath, { index: false, redirect: false }));

// provide a tiny favicon fallback to prevent 404 spam in logs
app.get("/favicon.ico", (req, res) => {
  res.status(204).end();
});

/* ---------------------------------------------------
   Helper utilities
   --------------------------------------------------- */
const broadcastState = () => {
  // send canonical snapshot (some clients expect plain object, some { payload })
  io.emit("sync_data", currentState);
};

const safeEmit = (socketOrIo, event, payload) => {
  try {
    socketOrIo.emit(event, payload);
  } catch (err) {
    console.warn("emit failed", event, err?.message || err);
  }
};

let coupleSockets = {}; // { name: socketId }
const COUPLE_NAMES = ["Aman", "Sneha"];

/* ---------------------------------------------------
   Spotify endpoints (unchanged)
   --------------------------------------------------- */
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || "";

app.get("/spotify/auth-url", (req, res) => {
  const scopes = [
    "user-read-playback-state",
    "user-modify-playback-state",
    "streaming",
    "playlist-read-private",
  ].join(" ");
  const url = `https://accounts.spotify.com/authorize?` + qs.stringify({
    response_type: "code",
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
  });
  res.json({ url });
});

app.get("/spotify/callback", async (req, res) => {
  const code = req.query.code?.toString();
  if (!code) return res.status(400).send("missing code");
  try {
    const tokenRes = await axios.post("https://accounts.spotify.com/api/token",
      qs.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: SPOTIFY_REDIRECT_URI,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64"),
        },
      }
    );
    currentState.playlist.spotifyConnected = true;
    currentState.playlist.spotifyTokenInfo = { ...tokenRes.data, obtainedAt: Date.now() };
    broadcastState();
    res.send("<h3>Spotify connected — close this window and return to the app.</h3>");
  } catch (err) {
    console.error("Spotify callback failed", err?.response?.data || err.message);
    res.status(500).send("spotify token exchange failed");
  }
});

/* ---------------------------------------------------
   Socket: all events
   --------------------------------------------------- */
io.on("connection", (socket) => {
  console.log("🔥 Device Connected:", socket.id);

  // Immediately send full server snapshot to the connecting client
  safeEmit(socket, "sync_data", currentState);

  // USER JOIN
  socket.on("user_join", (user) => {
    if (!user || !user.name) return;

    user.socketId = socket.id;

    // Restrict couple role strictly to Aman / Sneha
    if (user.role === "couple") {
      if (COUPLE_NAMES.includes(user.name)) {
        coupleSockets[user.name] = socket.id;
      } else {
        // force downgrade to guest
        user.role = "guest";
      }
    }

    const existingUserIndex = currentState.guestList.findIndex(u => u.name === user.name);
    if (existingUserIndex > -1) {
      currentState.guestList[existingUserIndex] = { ...currentState.guestList[existingUserIndex], ...user };
    } else {
      currentState.guestList.push(user);
    }
    
    broadcastState();
  });


  // TYPING
  socket.on("typing", (payload) => {
    socket.broadcast.emit("typing", payload);
  });

  // CHAT
  socket.on("send_message", (message) => {
    if (!message || !message.id) {
      message = { ...message, id: Date.now().toString() + Math.random().toString(36).slice(2,8) };
    }
    currentState.chatMessages.push(message);
    // Send both wrapper and raw for compatibility
    safeEmit(io, "message", { payload: message });
    safeEmit(io, "message_raw", message);
    broadcastState();
  });

  socket.on("delete_message", (messageId) => {
    currentState.chatMessages = currentState.chatMessages.filter((m) => m.id !== messageId);
    safeEmit(io, "message_deleted", { id: messageId });
    broadcastState();
  });

  // GALLERY
  socket.on("gallery_upload", (item) => {
    if (!item || !item.id) item.id = Date.now().toString();
    currentState.gallery.unshift(item);
    // emit wrapper and raw
    safeEmit(io, "gallery_sync", { payload: item });
    safeEmit(io, "gallery_item", item);
    broadcastState();
  });

  socket.on("delete_media", (mediaId) => {
    currentState.gallery = currentState.gallery.filter((g) => g.id !== mediaId);
    safeEmit(io, "media_deleted", { id: mediaId });
    broadcastState();
  });

  socket.on("update_media_caption", ({ id, caption }) => {
    currentState.gallery = currentState.gallery.map((g) => (g.id === id ? { ...g, caption } : g));
    safeEmit(io, "media_caption_updated", { id, caption });
    broadcastState();
  });

  // HEARTS
  socket.on("add_heart", () => {
    currentState.hearts = (currentState.hearts || 0) + 1;
    safeEmit(io, "heart_update", { count: currentState.hearts });
    broadcastState();
  });

  // ANNOUNCEMENTS
  socket.on("admin_announce", (message) => {
    currentState.adminAnnouncement = { text: message.text, timestamp: Date.now() };
    safeEmit(io, "announcement", { message: message.text });
    broadcastState();
  });

  // ADMIN SETTINGS
  socket.on("admin_update_settings", (newSettings) => {
    currentState.config = { ...currentState.config, ...newSettings };
    safeEmit(io, "config_sync", { payload: currentState.config });
    broadcastState();
  });

  // THEME
  socket.on("theme_update", (theme) => {
    currentState.theme = theme;
    safeEmit(io, "theme_sync", { payload: theme });
    broadcastState();
  });

  // PLAYLIST
  socket.on("playlist_update", ({ currentSong, isPlaying }) => {
    currentState.playlist.currentSong = currentSong || null;
    currentState.playlist.isPlaying = !!isPlaying;
    safeEmit(io, "music_sync", { payload: { currentSong: currentState.playlist.currentSong, isPlaying: currentState.playlist.isPlaying } });
    broadcastState();
  });

  // LOCATION updates
  socket.on("location_update", (data) => {
    if (!data?.name) return;
    currentState.locations[data.name] = { lat: data.lat, lng: data.lng, timestamp: Date.now() };
    safeEmit(io, "locations_sync", { payload: currentState.locations });
    broadcastState();
  });

  // SLIDES
  socket.on("slide_change", (newSlide) => {
    currentState.activeSlide = newSlide;
    safeEmit(io, "slide_changed", newSlide);
    broadcastState();
  });

  // QUIZ
  socket.on("quiz_answer", (data) => {
    const { user, questionId, answer } = data;
    const q = currentState.quiz.questions.find((qq) => qq.id === questionId);
    if (!q) return;
    if (!currentState.quiz.scores[user]) currentState.quiz.scores[user] = { score: 0, name: user };
    if (q.answer === answer) currentState.quiz.scores[user].score++;
    safeEmit(io, "quiz_sync", { payload: currentState.quiz });
    broadcastState();
  });

  // BLOCK
  socket.on("block_user", (name) => {
    currentState.guestList = currentState.guestList.filter((g) => g.name !== name);
    safeEmit(io, "user_blocked", { name });
    broadcastState();
  });

  // REQUEST SYNC
  socket.on("request_sync", () => {
    safeEmit(socket, "sync_data", currentState);
  });

  /* ---------------------------------------------------
     LANTERNS
     --------------------------------------------------- */
  socket.on("release_lantern", (lantern) => {
    if (!lantern || !lantern.id) lantern.id = Date.now().toString();
    lantern.timestamp = Date.now();
    currentState.lanterns.push(lantern);

    // 1) Notify sender immediately
    safeEmit(socket, "receive_lantern", lantern);

    // 2) Notify couple sockets (if any)
    Object.values(coupleSockets).forEach((sid) => {
      safeEmit(io.to(sid), "receive_lantern", lantern);
    });

    // 3) Broadcast active lantern list
    safeEmit(io, "lanterns_sync", { payload: currentState.lanterns });

    // 4) After 30s remove from active and keep in saved list if collected
    setTimeout(() => {
      currentState.lanterns = currentState.lanterns.filter((l) => l.id !== lantern.id);
      safeEmit(io, "lanterns_sync", { payload: currentState.lanterns });
      broadcastState();
    }, 30000);

    broadcastState();
  });

  socket.on("save_lantern", (lanternId) => {
    const lantern = currentState.lanterns.find((l) => l.id === (lanternId?.id ?? lanternId));
    if (!lantern) return;
    if (!currentState.savedLanterns.some((s) => s.id === lantern.id)) {
      currentState.savedLanterns.unshift({ ...lantern, savedAt: Date.now() });
    }
    currentState.lanterns = currentState.lanterns.filter((l) => l.id !== lanternId);
    safeEmit(io, "lanterns_saved_sync", { payload: currentState.savedLanterns });
    safeEmit(io, "lanterns_sync", { payload: currentState.lanterns });
    broadcastState();
  });

  socket.on("request_saved_lanterns", () => {
    safeEmit(socket, "lanterns_saved_sync", { payload: currentState.savedLanterns });
  });

  socket.on("refresh_all_clients", () => {
    broadcastState();
  });

  // DISCONNECT
  socket.on("disconnect", (reason) => {
    Object.keys(coupleSockets).forEach((name) => {
      if (coupleSockets[name] === socket.id) delete coupleSockets[name];
    });
    
    // Also remove from guest list
    currentState.guestList = currentState.guestList.filter(user => user.socketId !== socket.id);
    
    console.log("❌ Device Disconnected:", socket.id, reason);
    broadcastState();
  });
});

/* ---------------------------------------------------
   Express root
   --------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("<h1>Wedding Sync Server — OK</h1>");
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
