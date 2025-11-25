// -------------------------------------------------------------
// AppContext.tsx — FINAL STABLE VERSION
// -------------------------------------------------------------
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";

import { socket } from "../socket"; // <-- FIX THIS PATH IF NEEDED

// -------------------------------------------------------------
// TYPES
// -------------------------------------------------------------
export type Lantern = {
  id: string;
  sender: string;
  message: string;
  color?: string;
  timestamp: number;
};

export type MediaItem = {
  id: string;
  url: string;
  caption?: string;
  timestamp?: number;
  sender?: string;
};

export type ChatMessage = {
  id: string;
  text?: string;
  stickerKey?: string | null;
  sender: string;
  isCouple?: boolean;
  timestamp?: number;
  type?: "text" | "sticker";
};

export type GuestEntry = {
  name: string;
  role: "guest" | "couple" | "admin";
  joinedAt: number;
  rsvp?: boolean;
};

export type Song = {
  id: string;
  title: string;
  artist: string;
  url?: string;
  cover?: string;
  durationStr?: string;
};

export type LocationEntry = {
  name: string;
  lat: number;
  lng: number;
  timestamp: number;
};

export type GlobalConfig = {
  coupleName?: string;
  date?: string;
  welcomeMsg?: string;
  coupleImage?: string;
  theme?: any;
};

// -------------------------------------------------------------
// CONTEXT INTERFACE
// -------------------------------------------------------------
export interface AppContextType {
  messages: ChatMessage[];
  gallery: MediaItem[];
  guestList: GuestEntry[];
  heartCount: number;
  lanterns: Lantern[];
  savedLanterns: Lantern[];

  locations: Record<string, LocationEntry>;
  config: GlobalConfig;

  currentSong: Song | null;
  isPlaying: boolean;
  announcement: string | null;

  typingUsers: Set<string>;
  isConnected: boolean;

  sendMessage: (
    text: string,
    stickerKey?: string | null,
    sender?: string,
    isCouple?: boolean
  ) => void;

  sendHeart: () => void;

  uploadMedia: (item: MediaItem) => void;
  sendLantern: (lantern: Lantern) => void;
  saveLantern: (lanternId: string) => void;
  sendRSVP: (name: string) => void;

  joinUser: (name: string, role: "guest" | "couple" | "admin") => void;

  updateConfig: (cfg: GlobalConfig) => void;
  updatePlaylistState: (song: Song | null, playing: boolean) => void;
  sendAnnouncement: (msg: string) => void;

  deleteMessage: (id: string) => void;
  deleteMedia: (id: string) => void;
  updateMediaCaption: (id: string, caption: string) => void;
  blockUser: (name: string) => void;

  setTyping: (user: string, isTyping: boolean) => void;
  broadcastLocation: (name: string, lat: number, lng: number) => void;

  refreshData: () => void;

  spotifyEmbedUrl: string;
  spotifyLogin: () => void;
}

// -------------------------------------------------------------
// INTERNAL STATE
// -------------------------------------------------------------
type AppState = {
  guestList: GuestEntry[];
  gallery: MediaItem[];
  chatMessages: ChatMessage[];
  lanterns: Lantern[];
  savedLanterns: Lantern[];
  announcement: string | null;
  locations: Record<string, LocationEntry>;
  hearts: number;
  currentSong: Song | null;
  isPlaying: boolean;
  config: GlobalConfig;
  typingUsers: Set<string>;
  isConnected: boolean;
};

const DEFAULT_SPOTIFY_EMBED =
  "https://open.spotify.com/embed/playlist/0FYfrLykh3gtkzmcQg31u2";

const AppContext = createContext<AppContextType | undefined>(undefined);

// -------------------------------------------------------------
// NORMALIZERS
// -------------------------------------------------------------
const normalizeChat = (raw: any): ChatMessage => ({
  id: String(raw?.id ?? Date.now()),
  text: String(raw?.text ?? ""),
  stickerKey: raw?.stickerKey,
  sender: String(raw?.sender ?? "Guest"),
  isCouple: !!raw?.isCouple,
  timestamp: Number(raw?.timestamp ?? Date.now()),
  type: raw?.stickerKey ? "sticker" : "text",
});

const normalizeMedia = (raw: any): MediaItem => ({
  id: String(raw?.id ?? Date.now()),
  url: String(raw?.url ?? ""),
  caption: raw?.caption,
  timestamp: Number(raw?.timestamp ?? Date.now()),
  sender: raw?.sender,
});

const normalizeLantern = (raw: any): Lantern => ({
  id: String(raw?.id ?? Date.now()),
  sender: String(raw?.sender ?? "Guest"),
  message: String(raw?.message ?? raw?.text ?? ""),
  color: raw?.color ?? "royal",
  timestamp: Number(raw?.timestamp ?? Date.now()),
});

const normalizeLocation = (raw: any): LocationEntry => ({
  name: String(raw?.name ?? "unknown"),
  lat: Number(raw?.lat ?? 0),
  lng: Number(raw?.lng ?? 0),
  timestamp: Number(raw?.timestamp ?? Date.now()),
});

// -------------------------------------------------------------
// PROVIDER
// -------------------------------------------------------------
export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);
  const [heartCount, setHeartCount] = useState(0);
  const [lanterns, setLanterns] = useState<Lantern[]>([]);
  const [savedLanterns, setSavedLanterns] = useState<Lantern[]>([]);
  const [locations, setLocations] = useState<Record<string, LocationEntry>>({});
  const [config, setConfig] = useState<GlobalConfig>({});
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [spotifyEmbedUrl, setSpotifyEmbedUrl] = useState(DEFAULT_SPOTIFY_EMBED);

  // -------------------------------------------------------------
  // FULL SNAPSHOT
  // -------------------------------------------------------------
  const applyFullSnapshot = useCallback((snap: any) => {
    if (!snap || typeof snap !== "object") return;

    if (Array.isArray(snap.chatMessages))
      setMessages(snap.chatMessages.map(normalizeChat));

    if (Array.isArray(snap.gallery))
      setGallery(snap.gallery.map(normalizeMedia));

    if (Array.isArray(snap.guestList)) setGuestList(snap.guestList);

    if (Array.isArray(snap.lanterns))
      setLanterns(snap.lanterns.map(normalizeLantern));

    if (typeof snap.hearts === "number") setHeartCount(snap.hearts);

    if (snap.locations) setLocations(snap.locations);

    if (snap.config) setConfig(snap.config);

    if (snap.currentSong) setCurrentSong(snap.currentSong);

    if (typeof snap.isPlaying === "boolean") setIsPlaying(snap.isPlaying);

    if (snap.spotifyEmbedUrl) setSpotifyEmbedUrl(snap.spotifyEmbedUrl);
  }, []);

  // -------------------------------------------------------------
  // SOCKET EVENTS
  // -------------------------------------------------------------
  useEffect(() => {
    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("request_sync");
    });

    socket.on("disconnect", () => setIsConnected(false));

    socket.on("sync_data", applyFullSnapshot);

    socket.on("add_heart", (d) => {
      if (typeof d?.count === "number") setHeartCount(d.count);
    });

    socket.on("receive_lantern", (l) =>
      setLanterns((prev) => [...prev, normalizeLantern(l)])
    );

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("sync_data");
      socket.off("add_heart");
      socket.off("receive_lantern");
    };
  }, [applyFullSnapshot]);

  // -------------------------------------------------------------
  // ACTIONS
  // -------------------------------------------------------------
  const sendMessage = useCallback((text, stickerKey, sender = "Guest", isCouple = false) => {
    socket.emit("send_message", {
      text,
      stickerKey,
      sender,
      isCouple,
      id: Date.now().toString(),
      timestamp: Date.now(),
    });
  }, []);

  const sendHeart = useCallback(() => {
    socket.emit("add_heart");
  }, []);

  const uploadMedia = useCallback((item: MediaItem) => {
    socket.emit("gallery_upload", normalizeMedia(item));
  }, []);

  const sendLantern = useCallback((lantern: Lantern) => {
    socket.emit("release_lantern", normalizeLantern(lantern));
  }, []);

  const saveLantern = useCallback((id: string) => {
    socket.emit("lantern_collect", { id });
  }, []);

  const sendRSVP = useCallback((name: string) => {
    socket.emit("send_rsvp", { name });
  }, []);

  const joinUser = useCallback((name, role) => {
    socket.emit("user_join", { name, role, joinedAt: Date.now() });
  }, []);

  const updateConfig = useCallback((cfg) => {
    socket.emit("admin_update_settings", cfg);
  }, []);

  const updatePlaylistState = useCallback((song, playing) => {
    socket.emit("playlist_update", { currentSong: song, isPlaying: playing });
  }, []);

  const sendAnnouncement = useCallback((msg) => {
    socket.emit("admin_announce", { text: msg });
  }, []);

  const deleteMessage = (id: string) => socket.emit("delete_message", id);
  const deleteMedia = (id: string) => socket.emit("delete_media", id);

  const updateMediaCaption = (id, caption) =>
    socket.emit("update_media_caption", { id, caption });

  const blockUser = (name) => socket.emit("block_user", name);

  const setTyping = (user: string, isTyping: boolean) =>
    socket.emit("typing", { user, isTyping });

  const broadcastLocation = (name: string, lat: number, lng: number) =>
    socket.emit("location_update", { name, lat, lng });

  const refreshData = () => socket.emit("request_sync");

  const spotifyLogin = () => socket.emit("spotify_login");

  // -------------------------------------------------------------
  // PROVIDER VALUE
  // -------------------------------------------------------------
  const value: AppContextType = {
    messages,
    gallery,
    guestList,
    heartCount,
    lanterns,
    savedLanterns,
    locations,
    config,
    currentSong,
    isPlaying,
    announcement,
    typingUsers,
    isConnected,

    sendMessage,
    sendHeart,
    uploadMedia,
    sendLantern,
    saveLantern,
    sendRSVP,
    joinUser,
    updateConfig,
    updatePlaylistState,
    sendAnnouncement,
    deleteMessage,
    deleteMedia,
    updateMediaCaption,
    blockUser,
    setTyping,
    broadcastLocation,
    refreshData,

    spotifyEmbedUrl,
    spotifyLogin,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// -------------------------------------------------------------
// HOOK
// -------------------------------------------------------------
export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
};
