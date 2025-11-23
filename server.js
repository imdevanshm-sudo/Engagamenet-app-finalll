// server.js — Complete, production-oriented single-file socket server
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import path from "path";
import axios from "axios";
import qs from "querystring";

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    // permissive origin (adjust in prod)
    origin: (o, cb) => cb(null, true),
    methods: ["GET", "POST"],
    credentials: true,
  },
  // reduce disconnect noise on some hosting providers
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
    // initial gallery includes the uploaded screenshot paths (developer-supplied local paths)
    { id: "u1", url: "/local_uploads/Screenshot 2025-11-22 at 16.31.44.png", type: "image", caption: "admin-screenshot-1", timestamp: Date.now() - 10000, sender: "system" },
    { id: "u2", url: "/local_uploads/Screenshot 2025-11-22 at 16.43.21.png", type: "image", caption: "admin-screenshot-2", timestamp: Date.now() - 9000, sender: "system" },
    { id: "u3", url: "/local_uploads/Screenshot 2025-11-22 at 16.43.25.png", type: "image", caption: "admin-screenshot-3", timestamp: Date.now() - 8000, sender: "system" },
    { id: "u4", url: "/local_uploads/Screenshot 2025-11-22 at 16.43.29.png", type: "image", caption: "admin-screenshot-4", timestamp: Date.now() - 7000, sender: "system" },
  ],
  guestList: [],
  locations: {},
  adminAnnouncement: null,
  chatMessages: [],
  hearts: 0,
  lanterns: [],         // active in-flight lanterns (ephemeral)
  savedLanterns: [],    // collected/saved by couple (persistent while server runs)
  quiz: {
    questions: [],
    currentQuestionIndex: 0,
    scores: {},
    showResults: false,
  },
  config: {},
  theme: {},
  playlist: {
    currentSong: null,
    isPlaying: false,
    queue: [],
  }
};

// Serve the local uploaded screenshots directory under /local_uploads
// NOTE: make sure the path exists on the server and contains those files
const localUploadsPath = "/mnt/data"; // developer-provided path root
app.use("/local_uploads", express.static(localUploadsPath, { index: false, redirect: false }));

/* ---------------------------------------------------
   Helper utilities
   --------------------------------------------------- */
const broadcastState = () => {
  io.emit("sync_data", currentState);
};

const safeEmit = (socketOrIo, event, payload) => {
  try {
    socketOrIo.emit(event, payload);
  } catch (err) {
    console.warn("emit failed", event, err?.message);
  }
};

let coupleSockets = {}; // { name: socketId }
const COUPLE_NAMES = ["Aman", "Sneha"];

/* ---------------------------------------------------
   Spotify skeleton endpoints (server-side)
   --------------------------------------------------- */
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";
const SPOTIFY_REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || ""; // e.g. https://yourdomain.com/spotify/callback

// Endpoint: get a Spotify authorization URL (frontend should redirect user to this URL)
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

// Endpoint: callback (Spotify will redirect here with ?code=)
// This implements the authorization code flow server-side and exchanges a token
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
    // tokenRes.data contains access_token, refresh_token, expires_in
    // For security: store tokens in a persistent store (DB) tied to couple account.
    // For now we broadcast that Spotify is connected to couples.
    currentState.playlist.spotifyConnected = true;
    currentState.playlist.spotifyTokenInfo = {
      ...tokenRes.data,
      obtainedAt: Date.now(),
    };
    broadcastState();
    // Redirect or show a success page
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

  // Immediately send full server snapshot
  safeEmit(socket, "sync_data", currentState);

  // USER joins
  socket.on("user_join", (user) => {
    if (!user || !user.name) return;
    // couple tracking
    if (user.role === "couple" && COUPLE_NAMES.includes(user.name)) {
      coupleSockets[user.name] = socket.id;
    }
    // update guestList
    currentState.guestList = currentState.guestList.filter((g) => g.name !== user.name);
    currentState.guestList.push({ ...user, joinedAt: Date.now() });
    // let everyone know presence
    safeEmit(io, "user_presence", { payload: user });
    broadcastState();
  });

  // TYPING
  socket.on("typing", (payload) => {
    // payload: { user, isTyping }
    socket.broadcast.emit("typing", payload);
  });

  // CHAT: send_message (client -> server)
  socket.on("send_message", (message) => {
    if (!message || !message.id) {
      // ensure message has id from client; fallback generate
      message = { ...message, id: Date.now().toString() + Math.random().toString(36).slice(2,8) };
    }
    currentState.chatMessages.push(message);
    // Emit shape expected by clients
    safeEmit(io, "message", { payload: message });
    broadcastState();
  });

  // Admin deletes a message
  socket.on("delete_message", (messageId) => {
    currentState.chatMessages = currentState.chatMessages.filter((m) => m.id !== messageId);
    safeEmit(io, "message_deleted", { id: messageId });
    broadcastState();
  });

  // GALLERY: upload media
  socket.on("gallery_upload", (item) => {
    if (!item || !item.id) item.id = Date.now().toString();
    // newest first
    currentState.gallery.unshift(item);
    // client expects an item payload on gallery_sync
    safeEmit(io, "gallery_sync", item);
    broadcastState();
  });

  // Admin deletes media
  socket.on("delete_media", (mediaId) => {
    currentState.gallery = currentState.gallery.filter((g) => g.id !== mediaId);
    safeEmit(io, "media_deleted", { id: mediaId });
    broadcastState();
  });

  // Update caption
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

  // ANNOUNCEMENTS (Admin)
  socket.on("admin_announce", (message) => {
    currentState.adminAnnouncement = { text: message.text, timestamp: Date.now() };
    safeEmit(io, "announcement", { message: message.text });
    broadcastState();
  });

  // ADMIN SETTINGS (global config)
  socket.on("admin_update_settings", (newSettings) => {
    currentState.config = { ...currentState.config, ...newSettings };
    safeEmit(io, "config_sync", { payload: currentState.config });
    broadcastState();
  });

  // THEME
  socket.on("theme_update", (theme) => {
    currentState.theme = theme;
    safeEmit(io, "theme_sync", theme);
    broadcastState();
  });

  // PLAYLIST / MUSIC control (couple)
  socket.on("playlist_update", ({ currentSong, isPlaying }) => {
    currentState.playlist.currentSong = currentSong || null;
    currentState.playlist.isPlaying = !!isPlaying;
    // emit to everyone in the format frontends expect
    safeEmit(io, "music_sync", { currentSong: currentState.playlist.currentSong, isPlaying: currentState.playlist.isPlaying });
    broadcastState();
  });

  // LOCATION updates
  socket.on("location_update", (data) => {
    if (!data?.name) return;
    currentState.locations[data.name] = { lat: data.lat, lng: data.lng, timestamp: Date.now() };
    safeEmit(io, "locations_sync", currentState.locations);
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

  // BLOCK user (admin)
  socket.on("block_user", (name) => {
    // implement your block logic (e.g. add to blocked list)
    currentState.guestList = currentState.guestList.filter((g) => g.name !== name);
    safeEmit(io, "user_blocked", { name });
    broadcastState();
  });

  // REQUEST SYNC
  socket.on("request_sync", () => {
    safeEmit(socket, "sync_data", currentState);
  });

  /* ---------------------------------------------------
     LANTERNS — main logic
     --------------------------------------------------- */
  // Guest releases a lantern
  socket.on("release_lantern", (lantern) => {
    if (!lantern || !lantern.id) lantern.id = Date.now().toString();
    lantern.timestamp = Date.now();
    currentState.lanterns.push(lantern);

    // 1) Send receive_lantern to SENDER only (so they see the immediate animation)
    safeEmit(socket, "receive_lantern", lantern);

    // 2) Send receive_lantern to couple sockets only (couple view sees lantern arriving)
    Object.values(coupleSockets).forEach((sid) => {
      safeEmit(io.to(sid), "receive_lantern", lantern);
    });

    // 3) Broadcast active lanterns list to everyone for visuals
    safeEmit(io, "lanterns_sync", { payload: currentState.lanterns });

    // 4) Lantern auto-remove after 30s from active list (but savedLanterns remain)
    setTimeout(() => {
      currentState.lanterns = currentState.lanterns.filter((l) => l.id !== lantern.id);
      safeEmit(io, "lanterns_sync", { payload: currentState.lanterns });
      broadcastState();
    }, 30000);

    broadcastState();
  });

  // Couple (or admin) saves/collects a lantern (persist for later reading)
  socket.on("save_lantern", (lanternId) => {
    const lantern = currentState.lanterns.find((l) => l.id === lanternId);
    if (!lantern) return;
    // move to savedLanterns if not already present
    if (!currentState.savedLanterns.some((s) => s.id === lantern.id)) {
      currentState.savedLanterns.unshift({ ...lantern, savedAt: Date.now() });
    }
    // Remove from active lanterns
    currentState.lanterns = currentState.lanterns.filter((l) => l.id !== lanternId);
    // Emit saved lantern list to couple
    safeEmit(io, "lanterns_saved_sync", { payload: currentState.savedLanterns });
    safeEmit(io, "lanterns_sync", { payload: currentState.lanterns });
    broadcastState();
  });

  // couple requests saved lanterns
  socket.on("request_saved_lanterns", () => {
    safeEmit(socket, "lanterns_saved_sync", { payload: currentState.savedLanterns });
  });

  // Refresh / force full reload
  socket.on("refresh_all_clients", () => {
    broadcastState();
  });

  // DISCONNECT
  socket.on("disconnect", (reason) => {
    // remove from coupleSockets if present
    Object.keys(coupleSockets).forEach((name) => {
      if (coupleSockets[name] === socket.id) delete coupleSockets[name];
    });
    console.log("❌ Device Disconnected:", socket.id, reason);
    // Optionally: remove user presence if you track mapping socket->user
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
