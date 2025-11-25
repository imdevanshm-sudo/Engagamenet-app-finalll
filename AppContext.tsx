import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { socket } from "./socket";

// --- Types ---
export type Lantern = { id: string; sender: string; message: string; color?: string; timestamp: number; depth?: "near" | "mid" | "far"; xValues?: number; speed?: number; delay?: number; };
export type MediaItem = { id: string; url: string; caption?: string; timestamp?: number; sender?: string; };
export type ChatMessage = { id: string; text?: string; stickerKey?: string | null; sender: string; isCouple?: boolean; timestamp?: number; type?: "text" | "sticker"; };
export type GuestEntry = { name: string; role: 'guest' | 'couple' | 'admin'; joinedAt: number; rsvp?: boolean; };
export type Song = { id: string; title: string; artist: string; url?: string; cover?: string; album?: string; durationStr?: string; };
export type GlobalConfig = { coupleName?: string; date?: string; welcomeMsg?: string; coupleImage?: string; theme?: any; };
export interface Location { id: string; lat: number; lng: number; timestamp: number; }

// --- Context Interface ---
export interface AppContextType {
    messages: ChatMessage[]; gallery: MediaItem[]; guestList: GuestEntry[]; heartCount: number; 
    lanterns: Lantern[]; // Active flying lanterns
    savedLanterns: Lantern[]; // Archive/History of lanterns
    locations: Location[]; config: GlobalConfig; currentSong: Song | null; isPlaying: boolean; announcement: string | null; typingUsers: Set<string>; isConnected: boolean;

    sendMessage: (text: string, stickerKey?: string | null, sender?: string, isCouple?: boolean) => void;
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
    broadcastLocation: (lat: number, lng: number) => void;
    refreshData: () => void;
    spotifyEmbedUrl: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Normalizers ---
const normalizeLantern = (raw: any): Lantern => ({
  id: String(raw.id || Date.now()),
  sender: raw.sender || "Guest",
  message: raw.message || raw.text || "",
  color: raw.color || "royal",
  timestamp: Number(raw.timestamp || Date.now()),
  depth: raw.depth, xValues: raw.xValues, speed: raw.speed, delay: raw.delay
});

// (Other normalizers omitted for brevity but assumed present: normalizeChat, normalizeMedia)
const normalizeChat = (raw: any): ChatMessage => ({ id: String(raw?.id ?? Date.now()), text: String(raw?.text ?? ""), stickerKey: raw?.stickerKey, sender: String(raw?.sender ?? "Guest"), isCouple: !!raw?.isCouple, timestamp: Number(raw?.timestamp ?? Date.now()), type: raw?.stickerKey ? "sticker" : "text" });
const normalizeMedia = (raw: any): MediaItem => ({ id: String(raw?.id ?? Date.now()), url: String(raw?.url ?? ""), caption: raw?.caption, timestamp: Number(raw?.timestamp ?? Date.now()), sender: raw?.sender });


export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);
  const [heartCount, setHeartCount] = useState<number>(0);
  const [lanterns, setLanterns] = useState<Lantern[]>([]);
  const [savedLanterns, setSavedLanterns] = useState<Lantern[]>([]); // ✅ State for Archive
  const [locations, setLocations] = useState<Location[]>([]);
  const [config, setConfig] = useState<GlobalConfig>({});
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [typingUsers, setTypingUsersState] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  const spotifyEmbedUrl = "https://open.spotify.com/embed/playlist/0FYfrLykh3gtkzmcQg31u2?si=-vZEsPoXS0udqmWiNQYMAQ";

  // --- Persistence for Archive ---
  // Load saved lanterns from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wedding_saved_lanterns');
      if (stored) setSavedLanterns(JSON.parse(stored));
    } catch {}
  }, []);

  // Save to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('wedding_saved_lanterns', JSON.stringify(savedLanterns));
    } catch {}
  }, [savedLanterns]);


  // --- Socket Listeners ---
  useEffect(() => {
    const onConnect = () => { setIsConnected(true); socket.emit("request_sync"); };
    const onDisconnect = () => setIsConnected(false);
    
    const handleSync = (data: any) => {
      if (!data) return;
      if (Array.isArray(data.chatMessages)) setMessages(data.chatMessages.map(normalizeChat));
      if (Array.isArray(data.gallery)) setGallery(data.gallery.map(normalizeMedia));
      if (Array.isArray(data.guestList)) setGuestList(data.guestList);
      if (Array.isArray(data.lanterns)) setLanterns(data.lanterns.map(normalizeLantern));
      // If server sends history, merge it
      if (Array.isArray(data.savedLanterns)) {
          setSavedLanterns(prev => {
             const combined = [...prev, ...data.savedLanterns.map(normalizeLantern)];
             const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
             return unique;
          });
      }
      
      if (typeof data.hearts === 'number') setHeartCount(data.hearts);
      if (data.config) setConfig(data.config);
      if (data.currentSong) setCurrentSong(data.currentSong);
      if (typeof data.isPlaying === 'boolean') setIsPlaying(data.isPlaying);
      if (data.announcement) setAnnouncement(data.announcement);
    };

    // Real-time lantern arrival
    const handleReceiveLantern = (l: any) => {
        setLanterns(prev => [...prev, normalizeLantern(l)]);
    };
    
    const handleHeartUpdate = (d: any) => { const count = d?.count ?? d; if (typeof count === 'number') setHeartCount(count); };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("sync_data", handleSync);
    socket.on("receive_lantern", handleReceiveLantern);
    socket.on("add_heart", handleHeartUpdate);

    socket.emit("request_sync");
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("sync_data", handleSync);
      socket.off("receive_lantern", handleReceiveLantern);
      socket.off("add_heart", handleHeartUpdate);
    };
  }, []);

  // --- Actions ---
  const sendMessage = useCallback((text: string, stickerKey?: string|null, sender="Guest", isCouple=false) => { socket.emit("send_message", { text, stickerKey, sender, isCouple, id: Date.now().toString(), timestamp: Date.now() }); }, []);
  const sendHeart = useCallback(() => { setHeartCount(p => p + 1); socket.emit("add_heart"); }, []);
  const uploadMedia = useCallback((item: MediaItem) => socket.emit("gallery_upload", item), []);
  const sendLantern = useCallback((lantern: Lantern) => { setLanterns(p => [...p, lantern]); socket.emit("release_lantern", normalizeLantern(lantern)); }, []);
  
  // ✅ FIX: Save Lantern (Moves from Active -> Saved)
  const saveLantern = useCallback((id: string) => {
      setLanterns(prev => {
          const found = prev.find(l => l.id === id);
          if (found) {
             // Add to saved list
             setSavedLanterns(s => [...s, found]);
          }
          // Remove from active list (stops floating)
          return prev.filter(l => l.id !== id);
      });
      // Optionally tell server we saved it
      socket.emit("lantern_collect", { id });
  }, []);
  
  const sendRSVP = useCallback((name: string) => socket.emit("user_join", { name, role: "guest" }), []);
  const joinUser = useCallback((name: string, role: string) => socket.emit("user_join", { name, role }), []);
  const updateConfig = useCallback((cfg: GlobalConfig) => socket.emit("admin_update_settings", cfg), []);
  const updatePlaylistState = useCallback((song: Song | null, playing: boolean) => socket.emit("playlist_update", { currentSong: song, isPlaying: playing }), []);
  const sendAnnouncement = useCallback((msg: string) => socket.emit("admin_announce", { text: msg }), []);
  const deleteMessage = useCallback((id: string) => socket.emit("delete_message", id), []);
  const deleteMedia = useCallback((id: string) => socket.emit("delete_media", id), []);
  const updateMediaCaption = useCallback((id: string, caption: string) => socket.emit("update_media_caption", { id, caption }), []);
  const blockUser = useCallback((name: string) => socket.emit("block_user", name), []);
  const setTyping = useCallback((user: string, isTyping: boolean) => { socket.emit("typing", { user, isTyping }); setTypingUsersState(p => { const n = new Set(p); isTyping ? n.add(user) : n.delete(user); return n; }); }, []);
  const broadcastLocation = useCallback((lat: number, lng: number) => socket.emit("location_update", { lat, lng }), []);
  const refreshData = useCallback(() => socket.emit("request_sync"), []);

  const value = {
    messages, gallery, guestList, heartCount, lanterns, 
    savedLanterns, // ✅ EXPOSED
    locations: Object.values(locations), config, 
    currentSong, isPlaying, announcement, typingUsers, isConnected,
    sendMessage, sendHeart, uploadMedia, sendLantern, saveLantern, sendRSVP, joinUser, updateConfig, updatePlaylistState, sendAnnouncement, deleteMessage, deleteMedia, updateMediaCaption, blockUser, setTyping, broadcastLocation, refreshData,
    spotifyEmbedUrl
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppData = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
};