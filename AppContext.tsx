// AppContext.tsx
import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
    useRef
  } from "react";
  import { socket } from "./src/socket";
  
  // --- Shared Types ---
  export interface Message {
    id: string;
    text?: string;
    stickerKey?: string | null;
    sender: string;
    isCouple: boolean;
    timestamp: string; // human-friendly time (UI uses this)
    type: "text" | "sticker";
  }
  
  export interface MediaItem {
    id: string;
    url: string;
    type: "image" | "video";
    caption?: string;
    timestamp: number;
    sender: string;
  }
  
  export interface GuestEntry {
    name: string;
    role: "guest" | "couple" | "admin";
    joinedAt: number;
    rsvp?: boolean;
  }
  
  export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover: string;
    album: string;
    durationStr: string;
  }
  
  export interface Lantern {
    id: string;
    sender: string;
    message: string;
    color: string;
    timestamp: number;
  }
  
  export interface Location {
    id: string;
    lat: number;
    lng: number;
    timestamp: number;
  }
  
  export interface GlobalConfig {
    coupleName: string;
    date: string;
    welcomeMsg: string;
    coupleImage: string;
  }
  
  // --- Context Interface ---
  interface AppContextType {
    // State
    messages: Message[];
    gallery: MediaItem[];
    guestList: GuestEntry[];
    heartCount: number;
    lanterns: Lantern[];
    locations: Location[];
    config: GlobalConfig;
    currentSong: Song | null;
    isPlaying: boolean;
    announcement: string | null;
    typingUsers: Set<string>;
    isConnected: boolean;
  
    // Actions (kept same as before)
    sendMessage: (
      text: string,
      stickerKey?: string | null,
      sender?: string,
      isCouple?: boolean
    ) => void;
    sendHeart: () => void;
    uploadMedia: (item: MediaItem) => void;
    sendLantern: (lantern: Lantern) => void;
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
    broadcastLocation: (lat: number, lng: number) => void;
    refreshData: () => void;
  }
  
  const AppContext = createContext<AppContextType | undefined>(undefined);
  
  // --- Provider ---
  export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // initial state
    const [messages, setMessages] = useState<Message[]>([]);
    const [gallery, setGallery] = useState<MediaItem[]>([]);
    const [guestList, setGuestList] = useState<GuestEntry[]>([]);
    const [heartCount, setHeartCount] = useState<number>(0);
    const [lanterns, setLanterns] = useState<Lantern[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [config, setConfig] = useState<GlobalConfig>({
      coupleName: "The Couple",
      date: "2025-12-26",
      welcomeMsg: "Join us as we begin our forever.",
      coupleImage: ""
    });
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [announcement, setAnnouncement] = useState<string | null>(null);
    const [typingUsers, setTypingUsersState] = useState<Set<string>>(new Set());
    const [isConnected, setIsConnected] = useState<boolean>(socket.connected);
  
    // refs
    const mountedRef = useRef(true);
    const presenceIntervalRef = useRef<number | null>(null);
  
    // --- persist/load local storage (defensive) ---
    useEffect(() => {
      mountedRef.current = true;
      try {
        const sMsgs = localStorage.getItem("wedding_chat_messages");
        if (sMsgs) setMessages(JSON.parse(sMsgs));
        const sGallery = localStorage.getItem("wedding_gallery_media");
        if (sGallery) setGallery(JSON.parse(sGallery));
        const sHearts = localStorage.getItem("wedding_heart_count");
        if (sHearts) setHeartCount(parseInt(sHearts, 10) || 0);
        const sCfg = localStorage.getItem("wedding_global_config");
        if (sCfg) setConfig(prev => ({ ...prev, ...JSON.parse(sCfg) }));
      } catch (e) {
        console.warn("AppContext: failed to load local storage", e);
      }
      return () => {
        mountedRef.current = false;
      };
    }, []);
  
    useEffect(() => {
      try {
        localStorage.setItem("wedding_chat_messages", JSON.stringify(messages));
      } catch {}
    }, [messages]);
  
    useEffect(() => {
      try {
        localStorage.setItem("wedding_gallery_media", JSON.stringify(gallery));
      } catch {}
    }, [gallery]);
  
    useEffect(() => {
      try {
        localStorage.setItem("wedding_heart_count", String(heartCount));
      } catch {}
    }, [heartCount]);
  
    useEffect(() => {
      try {
        localStorage.setItem("wedding_global_config", JSON.stringify(config));
      } catch {}
    }, [config]);
  
    // --- Helpers: dedupe insertors ---
    const addMessageIfNew = useCallback((incoming: Partial<Message> & { id?: string }) => {
      if (!incoming) return;
      const id = String(incoming.id || incoming.id === 0 ? incoming.id : incoming["id"] || Date.now().toString());
      setMessages(prev => {
        if (prev.some(m => String(m.id) === id)) return prev;
        // normalize message object
        const normalized: Message = {
          id,
          text: incoming.text || "",
          stickerKey: incoming.stickerKey || null,
          sender: incoming.sender || "Anonymous",
          isCouple: Boolean(incoming.isCouple),
          timestamp: incoming.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: incoming.stickerKey ? "sticker" : "text"
        };
        return [...prev, normalized];
      });
    }, []);
  
    const addLanternIfNew = useCallback((incoming: Partial<Lantern> & { id?: string }) => {
      if (!incoming) return;
      const id = String(incoming.id || Date.now().toString());
      setLanterns(prev => {
        if (prev.some(l => String(l.id) === id)) return prev;
        const normalized: Lantern = {
          id,
          sender: incoming.sender || "Guest",
          message: incoming.message || "",
          color: incoming.color || "royal",
          timestamp: incoming.timestamp || Date.now()
        };
        return [...prev, normalized];
      });
    }, []);
  
    const addGalleryItemIfNew = useCallback((item: Partial<MediaItem> & { id?: string }) => {
      if (!item || !item.url) return;
      const id = String(item.id || Date.now().toString());
      setGallery(prev => {
        if (prev.some(p => String(p.id) === id)) return prev;
        const normalized: MediaItem = {
          id,
          url: String(item.url),
          type: (item as any).type || "image",
          caption: item.caption || "",
          timestamp: Number(item.timestamp || Date.now()),
          sender: item.sender || "Anonymous"
        };
        return [normalized, ...prev];
      });
    }, []);
  
    // --- Socket listeners setup (robust)
    useEffect(() => {
      // connection state
      const onConnect = () => {
        setIsConnected(true);
        // announce presence right away
        socket.emit("presence", { connectedAt: Date.now() });
      };
      const onDisconnect = () => setIsConnected(false);
  
      // full sync handler: gracefully merge arrays if present
      const handleFullSync = (state: any) => {
        if (!state) return;
        if (state.messages && Array.isArray(state.messages)) {
          // normalize - replace with server canonical or merge conservatively
          setMessages(state.messages.map((m: any) => ({
            id: String(m.id),
            text: m.text || "",
            stickerKey: m.stickerKey || null,
            sender: m.sender || "Anonymous",
            isCouple: Boolean(m.isCouple),
            timestamp: m.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: m.stickerKey ? "sticker" : "text"
          })));
        }
        if (state.gallery && Array.isArray(state.gallery)) {
          setGallery(state.gallery.map((g: any) => ({
            id: String(g.id),
            url: String(g.url),
            type: g.type || "image",
            caption: g.caption || "",
            timestamp: Number(g.timestamp || Date.now()),
            sender: g.sender || "Anonymous"
          })));
        }
        if (typeof state.heartCount === "number") setHeartCount(state.heartCount);
        if (state.guestList && Array.isArray(state.guestList)) setGuestList(state.guestList);
        if (state.lanterns && Array.isArray(state.lanterns)) setLanterns(state.lanterns);
        if (state.locations && Array.isArray(state.locations)) setLocations(state.locations);
        if (state.config) setConfig(prev => ({ ...prev, ...state.config }));
        if (state.currentSong) setCurrentSong(state.currentSong);
        if (typeof state.isPlaying === "boolean") setIsPlaying(state.isPlaying);
        if (state.announcement) setAnnouncement(state.announcement);
      };
  
      // message events - server may send either raw message or wrapper { payload }
      const handleMessageEvent = (data: any) => {
        const payload = data && data.payload ? data.payload : data;
        addMessageIfNew(payload);
      };
  
      const handleHeartUpdate = (data: any) => {
        // we intentionally do not change heart sync logic deeply (preserving UI contract)
        if (data && typeof data.count === "number") setHeartCount(data.count);
      };
  
      const handleGallerySync = (data: any) => {
        const payload = data && data.payload ? data.payload : data;
        if (Array.isArray(payload)) {
          payload.forEach(item => addGalleryItemIfNew(item));
        } else if (payload) {
          addGalleryItemIfNew(payload);
        }
      };
  
      const handleLanternAdded = (data: any) => {
        const payload = data && data.payload ? data.payload : data;
        addLanternIfNew(payload);
      };
  
      const handleLanternSync = (data: any) => {
        // replace/merge entire lantern list if server sends authoritative list
        if (Array.isArray(data)) {
          setLanterns(data.map((l: any) => ({
            id: String(l.id),
            sender: l.sender || "Guest",
            message: l.message || "",
            color: l.color || "royal",
            timestamp: Number(l.timestamp || Date.now())
          })));
        } else if (data && data.payload && Array.isArray(data.payload)) {
          setLanterns(data.payload);
        }
      };
  
      const handleLanternLanded = (data: any) => {
        // some servers might indicate lantern has "landed" with location
        // e.g. { lantern, location }
        if (!data) return;
        const payload = data.payload || data;
        if (payload.lantern) addLanternIfNew(payload.lantern);
        if (payload.location) {
          setLocations(prev => {
            // avoid dup
            const loc = payload.location;
            if (prev.some(p => String(p.id) === String(loc.id))) return prev;
            return [...prev, loc];
          });
        }
      };
  
      const handleLocationsUpdate = (data: any) => {
        if (Array.isArray(data)) setLocations(data);
        else if (data && Array.isArray(data.payload)) setLocations(data.payload);
      };
  
      const handleUserPresence = (data: any) => {
        const user = data && data.payload ? data.payload : data;
        if (!user || !user.name) return;
        setGuestList(prev => {
          const filtered = prev.filter(g => g.name !== user.name);
          return [...filtered, user];
        });
      };
  
      const handleBlockUser = (data: any) => {
        const payload = data && data.payload ? data.payload : data;
        if (!payload) return;
        setGuestList(prev => prev.filter(g => g.name !== payload.name));
      };
  
      const handleConfigSync = (data: any) => {
        const payload = data && data.payload ? data.payload : data;
        if (payload) setConfig(prev => ({ ...prev, ...payload }));
      };
  
      const handlePlaylistUpdate = (data: any) => {
        // server may send { currentSong, isPlaying } or a wrapper
        const payload = data && data.payload ? data.payload : data;
        if (!payload) return;
        if (payload.currentSong) setCurrentSong(payload.currentSong);
        if (typeof payload.isPlaying === "boolean") setIsPlaying(payload.isPlaying);
      };
  
      const handleAnnouncement = (data: any) => {
        const payload = data && data.payload ? data.payload : data;
        if (!payload) return;
        setAnnouncement(payload.message || payload);
      };
  
      const handleTyping = (data: any) => {
        // server may send { user, isTyping } or full array of typing users
        if (!data) return;
        setTypingUsersState(prev => {
          const newSet = new Set(prev);
          // full list
          if (Array.isArray(data)) {
            newSet.clear();
            data.forEach((u: string) => newSet.add(String(u)));
            return newSet;
          }
          // object with users array
          if (data.users && Array.isArray(data.users)) {
            newSet.clear();
            data.users.forEach((u: string) => newSet.add(String(u)));
            return newSet;
          }
          // single update
          const user = data.user || data.u || data.name;
          const isTyping = data.isTyping !== undefined ? Boolean(data.isTyping) : Boolean(data.t);
          if (user) {
            if (isTyping) newSet.add(String(user));
            else newSet.delete(String(user));
          }
          return newSet;
        });
      };
  
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);
      socket.on("sync_data", handleFullSync);
      socket.on("full_sync", handleFullSync);
      socket.on("message", handleMessageEvent);
      socket.on("send_message", handleMessageEvent);
      socket.on("heart_update", handleHeartUpdate);
      socket.on("gallery_sync", handleGallerySync);
      socket.on("upload_media", handleGallerySync);
      socket.on("lantern_added", handleLanternAdded);
      socket.on("lantern_sync", handleLanternSync);
      socket.on("lantern_landed", handleLanternLanded);
      socket.on("locations_update", handleLocationsUpdate);
      socket.on("user_presence", handleUserPresence);
      socket.on("block_user", handleBlockUser);
      socket.on("config_sync", handleConfigSync);
      socket.on("playlist_update", handlePlaylistUpdate);
      socket.on("announcement", handleAnnouncement);
      socket.on("typing", handleTyping);
  
      // ask server for a sync immediately
      socket.emit("request_sync");
  
      // presence heartbeat every 25 seconds
      try {
        if (presenceIntervalRef.current === null) {
          presenceIntervalRef.current = window.setInterval(() => {
            socket.emit("presence", { ts: Date.now() });
          }, 25000) as unknown as number;
        }
      } catch (e) {
        // ignore in non-browser contexts
      }
  
      return () => {
        // cleanup
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("sync_data", handleFullSync);
        socket.off("full_sync", handleFullSync);
        socket.off("message", handleMessageEvent);
        socket.off("send_message", handleMessageEvent);
        socket.off("heart_update", handleHeartUpdate);
        socket.off("gallery_sync", handleGallerySync);
        socket.off("upload_media", handleGallerySync);
        socket.off("lantern_added", handleLanternAdded);
        socket.off("lantern_sync", handleLanternSync);
        socket.off("lantern_landed", handleLanternLanded);
        socket.off("locations_update", handleLocationsUpdate);
        socket.off("user_presence", handleUserPresence);
        socket.off("block_user", handleBlockUser);
        socket.off("config_sync", handleConfigSync);
        socket.off("playlist_update", handlePlaylistUpdate);
        socket.off("announcement", handleAnnouncement);
        socket.off("typing", handleTyping);
  
        try {
          if (presenceIntervalRef.current !== null) {
            clearInterval(presenceIntervalRef.current);
            presenceIntervalRef.current = null;
          }
        } catch {}
      };
    }, [addMessageIfNew, addGalleryItemIfNew, addLanternIfNew]);
  
    // --- Actions ---
  
    // Message send: normalized, consistent id and shape
    const sendMessage = useCallback(
      (text: string, stickerKey?: string | null, sender: string = "Anonymous", isCouple: boolean = false) => {
        // normalization
        const id = Date.now().toString() + Math.random().toString(36).slice(2, 8);
        const payload: Message = {
          id,
          text: String(text || ""),
          stickerKey: stickerKey || null,
          sender,
          isCouple: Boolean(isCouple),
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          type: stickerKey ? "sticker" : "text"
        };
  
        // optimistic local add (UI benefit) and emit
        setMessages(prev => {
          if (prev.some(m => m.id === payload.id)) return prev;
          return [...prev, payload];
        });
  
        try {
          // emit canonical event
          socket.emit("send_message", payload);
          // also send older name if server listens to 'message' too
          socket.emit("message", payload);
        } catch (e) {
          console.error("sendMessage emit failed:", e);
        }
      },
      []
    );
  
    // HEARTS: intentionally left minimal to preserve UI contract
    const sendHeart = useCallback(() => {
      // optimistic
      setHeartCount(prev => prev + 1);
      try {
        socket.emit("add_heart", {}); // server may increase and broadcast back
      } catch (e) {
        console.error("sendHeart error:", e);
      }
    }, []);
  
    // Gallery upload: robust -- expects a validated MediaItem object
    const uploadMedia = useCallback((item: MediaItem) => {
      // basic validation
      if (!item || !item.url) return;
      const payload = {
        ...item,
        id: String(item.id || Date.now().toString()),
        timestamp: Number(item.timestamp || Date.now())
      };
      // optimistic local insert
      setGallery(prev => {
        if (prev.some(p => String(p.id) === String(payload.id))) return prev;
        return [payload, ...prev];
      });
      try {
        socket.emit("upload_media", payload);
      } catch (e) {
        console.error("uploadMedia emit failed:", e);
      }
    }, []);
  
    // Lanterns
    const sendLantern = useCallback((lantern: Lantern) => {
      // do not mutate original
      const payload = {
        ...lantern,
        id: String(lantern.id || Date.now().toString()),
        timestamp: Number(lantern.timestamp || Date.now())
      };
      try {
        // emit canonical server event
        socket.emit("release_lantern", payload);
        // also emit backup event name if server handles different naming
        socket.emit("lantern_release", payload);
      } catch (e) {
        console.error("sendLantern emit failed:", e);
      }
      // we choose not to add local lantern until server confirms (server will send 'lantern_added')
    }, []);
  
    const sendRSVP = useCallback((name: string) => {
      try {
        socket.emit("send_rsvp", { name });
      } catch (e) {
        console.error("sendRSVP failed:", e);
      }
    }, []);
  
    const joinUser = useCallback((name: string, role: "guest" | "couple" | "admin") => {
      try {
        socket.emit("join_user", { name, role, joinedAt: Date.now() });
      } catch (e) {
        console.error("joinUser failed:", e);
      }
    }, []);
  
    const updateConfig = useCallback((cfg: GlobalConfig) => {
      setConfig(cfg);
      try {
        socket.emit("config_update", cfg);
      } catch (e) {
        console.error("updateConfig failed:", e);
      }
    }, []);
  
    const updatePlaylistState = useCallback((song: Song | null, playing: boolean) => {
      setCurrentSong(song);
      setIsPlaying(playing);
      try {
        socket.emit("playlist_update", { currentSong: song, isPlaying: playing });
      } catch (e) {
        console.error("updatePlaylistState failed:", e);
      }
    }, []);
  
    const sendAnnouncement = useCallback((msg: string) => {
      try {
        socket.emit("send_announcement", { message: msg });
      } catch (e) {
        console.error("sendAnnouncement failed:", e);
      }
    }, []);
  
    const deleteMessage = useCallback((id: string) => {
      setMessages(prev => prev.filter(m => m.id !== id));
      try {
        socket.emit("delete_message", { id });
        // broadcast sync fallback
        socket.emit("message_sync", messages);
      } catch (e) {
        console.error("deleteMessage failed:", e);
      }
    }, [messages]);
  
    const deleteMedia = useCallback((id: string) => {
      setGallery(prev => prev.filter(p => String(p.id) !== String(id)));
      try {
        socket.emit("delete_media", { id });
        socket.emit("gallery_sync", gallery);
      } catch (e) {
        console.error("deleteMedia failed:", e);
      }
    }, [gallery]);
  
    const updateMediaCaption = useCallback((id: string, caption: string) => {
      setGallery(prev => prev.map(p => (String(p.id) === String(id) ? { ...p, caption } : p)));
      try {
        socket.emit("update_media_caption", { id, caption });
        socket.emit("gallery_sync", gallery);
      } catch (e) {
        console.error("updateMediaCaption failed:", e);
      }
    }, [gallery]);
  
    const blockUser = useCallback((name: string) => {
      try {
        socket.emit("block_user", { name });
      } catch (e) {
        console.error("blockUser failed:", e);
      }
    }, []);
  
    const setTyping = useCallback((user: string, isTyping: boolean) => {
      try {
        socket.emit("typing", { user, isTyping });
      } catch (e) {
        console.error("setTyping emit failed:", e);
      }
      // also reflect locally to be responsive
      setTypingUsersState(prev => {
        const s = new Set(prev);
        if (isTyping) s.add(user);
        else s.delete(user);
        return s;
      });
    }, []);
  
    const broadcastLocation = useCallback((lat: number, lng: number) => {
      try {
        const payload = { lat: Number(lat), lng: Number(lng), timestamp: Date.now() };
        socket.emit("update_location", payload);
      } catch (e) {
        console.error("broadcastLocation failed:", e);
      }
    }, []);
  
    const refreshData = useCallback(() => {
      try {
        socket.emit("request_sync");
      } catch (e) {
        console.error("refreshData failed:", e);
      }
    }, []);
  
    // presence ping (emit once on mount)
    useEffect(() => {
      try {
        socket.emit("presence", { ts: Date.now() });
      } catch {}
    }, []);
  
    // --- Provider value (stable API) ---
    const value: AppContextType = {
      messages,
      gallery,
      guestList,
      heartCount,
      lanterns,
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
      refreshData
    };
  
    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
  };
  
  // Hook
  export const useAppData = (): AppContextType => {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error("useAppData must be used within AppProvider");
    return ctx;
  };
  