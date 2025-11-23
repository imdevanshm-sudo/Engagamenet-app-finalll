import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  useCallback, // Added for performance and function stability
} from "react";

// ---------------- IMPORTANT: YOU SELECTED OPTION 2 ----------------
import { socket } from "./socket"; 

// ---------------- Types ----------------

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
  stickerKey?: string;
  sender: string;
  isCouple?: boolean;
  timestamp?: number;
  type?: "text" | "sticker";
};

type AppState = {
  guestList: any[];
  gallery: MediaItem[];
  chatMessages: ChatMessage[];
  lanterns: Lantern[];
  lanternsCollected: Lantern[];
  announcement: string | null;
  locations: Record<string, { lat: number; lng: number; timestamp: number }>;
  hearts: number;
  currentSong: any | null;
  isPlaying: boolean;
  config: Record<string, any>;
  typingUsers: Set<string>;
  ui: {
    showLanternRelease: boolean;
    restoreAnimations: boolean;
  };
};

// --- PATCHED INTERFACE: Includes all core actions ---
type AppContextAPI = AppState & {
  sendMessage: (
    text?: string,
    stickerKey?: string,
    sender?: string,
    isCouple?: boolean
  ) => void;
  sendLantern: (lantern: Lantern) => void;
  uploadMedia: (item: MediaItem) => void;
  sendRSVP: (name: string) => void;
  // PATCHED: Added missing actions to the interface:
  sendHeart: () => void;
  joinUser: (name: string, role: 'guest' | 'couple' | 'admin') => void;
  
  setTyping: (name: string, isTyping: boolean) => void;
  requestFullSync: () => void;
  saveLanternToCollection: (lanternId: string) => void;
  spotifyEmbedUrl: string;
};

// --------------- Default State ----------------
const defaultState: AppState = {
  guestList: [],
  gallery: [],
  chatMessages: [],
  lanterns: [],
  lanternsCollected: [],
  announcement: null,
  locations: {},
  hearts: 0,
  currentSong: null,
  isPlaying: false,
  config: {},
  typingUsers: new Set(),
  ui: {
    showLanternRelease: false,
    restoreAnimations: true,
  },
};

const AppContext = createContext<AppContextAPI | null>(null);

// ---------------- Normalizers ----------------
const normalizeChat = (raw: any): ChatMessage => {
  const id = raw?.id ?? Date.now().toString();
  const text = raw?.text ?? raw?.message ?? "";
  const stickerKey = raw?.stickerKey;
  const sender = raw?.sender ?? raw?.from ?? "Guest";
  const isCouple = !!raw?.isCouple;

  const timestamp =
    typeof raw?.timestamp === "number"
      ? raw.timestamp
      : raw?.timestamp
      ? new Date(raw.timestamp).getTime()
      : Date.now();

  return {
    id: String(id),
    text: String(text),
    stickerKey,
    sender: String(sender),
    isCouple,
    timestamp,
    type: stickerKey ? "sticker" : "text",
  };
};

const normalizeMedia = (raw: any): MediaItem => ({
  id: String(raw?.id ?? Date.now()),
  url: String(raw?.url ?? raw?.src ?? raw?.data ?? ""),
  caption: raw?.caption ?? raw?.title ?? "",
  timestamp:
    typeof raw?.timestamp === "number"
      ? raw.timestamp
      : raw?.timestamp
      ? new Date(raw.timestamp).getTime()
      : Date.now(),
  sender: raw?.sender ?? "Guest",
});

// ---------------- Provider ----------------

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(defaultState);
  const syncingRef = useRef(false);

  // ---------------- Spotify Embed ----------------
  const spotifyEmbedUrl =
    "https://open.spotify.com/embed/playlist/0FYfrLykh3gtkzmcQg31u2?si=-vZEsPoXS0udqmWiNQYMAQ";

  // -------------- Apply Full Snapshot ----------------
  const applyFullSnapshot = (snap: any) => {
    if (!snap || typeof snap !== "object") return;

    setState((prev) => ({
      ...prev,
      guestList: Array.isArray(snap.guestList) ? snap.guestList : prev.guestList,
      gallery: Array.isArray(snap.gallery)
        ? snap.gallery.map(normalizeMedia)
        : prev.gallery,
      chatMessages: Array.isArray(snap.chatMessages)
        ? snap.chatMessages.map(normalizeChat)
        : prev.chatMessages,
      lanterns: Array.isArray(snap.lanterns) ? snap.lanterns : prev.lanterns,
      announcement:
        snap.announcement ?? snap.adminAnnouncement?.text ?? prev.announcement,
      locations: snap.locations ?? prev.locations,
      hearts: typeof snap.hearts === "number" ? snap.hearts : prev.hearts,
      currentSong: snap.currentSong ?? prev.currentSong,
      isPlaying:
        typeof snap.isPlaying === "boolean" ? snap.isPlaying : prev.isPlaying,
      config: snap.config ?? prev.config,
    }));
  };

  // ---------------- Socket Events ----------------

  useEffect(() => {
    const s = socket;
    if (!s) return;

    s.on("connect", () => {
      s.emit("request_sync");
    });

    s.on("sync_data", (payload) => {
      if (!syncingRef.current) {
        syncingRef.current = true;
        applyFullSnapshot(payload);
        syncingRef.current = false;
      }
    });

    s.on("message", (payload) => {
      try {
        const msg = normalizeChat(payload?.payload ?? payload);
        setState((prev) => ({
          ...prev,
          chatMessages: [...prev.chatMessages, msg],
        }));
      } catch {}
    });

    s.on("gallery_sync", (payload) => {
      try {
        const media = normalizeMedia(payload?.payload ?? payload);
        setState((prev) => ({
          ...prev,
          gallery: [media, ...prev.gallery],
        }));
      } catch {}
    });

    s.on("lantern_added", (payload) => {
      const l = payload?.payload ?? payload;
      if (!l?.id) return;

      setState((prev) => ({
        ...prev,
        lanterns: [...prev.lanterns, l],
      }));

      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          lanterns: prev.lanterns.filter((t) => t.id !== l.id),
        }));
      }, 15000);
    });

    s.on("lantern_landed", (payload) => {
      const l = payload?.payload ?? payload;
      if (!l?.id) return;

      setState((prev) => ({
        ...prev,
        lanternsCollected: [l, ...prev.lanternsCollected],
      }));
    });

    s.on("announcement", (payload) => {
      const text =
        payload?.message ?? payload?.payload?.text ?? String(payload);

      setState((prev) => ({
        ...prev,
        announcement: text,
      }));
    });

    s.on("locations_sync", (payload) => {
      setState((prev) => ({
        ...prev,
        locations: payload?.payload ?? payload,
      }));
    });

    s.on("typing", (payload) => {
      const name = payload?.name;
      const isTyping = payload?.isTyping;

      setState((prev) => {
        const newSet = new Set(prev.typingUsers);
        if (isTyping) newSet.add(name);
        else newSet.delete(name);
        return { ...prev, typingUsers: newSet };
      });
    });

    s.on("heart_update", (payload) => {
      const count = payload?.count;
      if (typeof count === "number") {
        setState((prev) => ({ ...prev, hearts: count }));
      }
    });

    return () => {
      s.off("connect");
      s.off("sync_data");
      s.off("message");
      s.off("gallery_sync");
      s.off("lantern_added");
      s.off("lantern_landed");
      s.off("announcement");
      s.off("locations_sync");
      s.off("typing");
      s.off("heart_update");
    };
  }, []);

  // ---------------- Actions ----------------

  const sendMessage = useCallback((
    text = "",
    stickerKey?: string,
    sender = "Guest",
    isCouple = false
  ) => {
    const msg = normalizeChat({
      text,
      stickerKey,
      sender,
      isCouple,
      id: Date.now().toString(),
      timestamp: Date.now(),
    });

    setState((prev) => ({
      ...prev,
      chatMessages: [...prev.chatMessages, msg],
    }));

    socket.emit("send_message", msg);
  }, []);

  // --- PATCHED: ADDED MISSING sendHeart FUNCTION DEFINITION ---
  const sendHeart = useCallback(() => {
    socket.emit("add_heart"); 
  }, []);
  
  const sendLantern = useCallback((lantern: Lantern) => {
    setState((prev) => ({
      ...prev,
      lanterns: [...prev.lanterns, lantern],
      ui: { ...prev.ui, showLanternRelease: true },
    }));

    socket.emit("release_lantern", lantern);

    setTimeout(() => {
      setState((prev) => ({
        ...prev,
        ui: { ...prev.ui, showLanternRelease: false },
      }));
    }, 3500);
  }, []);

  const uploadMedia = useCallback((item: MediaItem) => {
    const m = normalizeMedia(item);

    setState((prev) => ({
      ...prev,
      gallery: [m, ...prev.gallery],
    }));

    socket.emit("gallery_upload", m);
  }, []);

  const sendRSVP = (name: string) => {
    socket.emit("user_join", { name, role: "guest", joinedAt: Date.now() });
  };
  
  // --- PATCHED: ADDED MISSING joinUser FUNCTION DEFINITION ---
  const joinUser = useCallback((name: string, role: 'guest' | 'couple' | 'admin') => {
    socket.emit("user_join", { name, role, joinedAt: Date.now() });
  }, []);


  const setTyping = (name: string, isTyping: boolean) => {
    socket.emit("typing", { name, isTyping });

    setState((prev) => {
      const newSet = new Set(prev.typingUsers);
      if (isTyping) newSet.add(name);
      else newSet.delete(name);
      return { ...prev, typingUsers: newSet };
    });
  };

  const requestFullSync = () => socket.emit("request_sync");

  const saveLanternToCollection = (lanternId: string) => {
    const found =
      state.lanterns.find((l) => l.id === lanternId) ||
      state.lanternsCollected.find((l) => l.id === lanternId);

    if (!found) return;

    setState((prev) => ({
      ...prev,
      lanternsCollected: [found, ...prev.lanternsCollected],
    }));

    socket.emit("lantern_collect", { id: lanternId });
  };

  // ---------------- Provider Value ----------------

  return (
    <AppContext.Provider
      value={{
        ...state,
        sendMessage,
        sendLantern,
        uploadMedia,
        sendRSVP,
        sendHeart, // PATCHED: Now correctly defined and exposed
        joinUser,   // PATCHED: Now correctly defined and exposed
        setTyping,
        requestFullSync,
        saveLanternToCollection,
        spotifyEmbedUrl,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx)
    throw new Error("useAppData must be used within AppProvider");
  return ctx;
};