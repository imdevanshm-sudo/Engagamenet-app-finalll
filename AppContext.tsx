
// AppContext.tsx — patched client context
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  ReactNode
} from "react";
import { socket } from "./socket";

/* types omitted for brevity — use the same types you posted earlier (Message, MediaItem, Lantern, etc.) */

export interface Message { id: string; text?: string; stickerKey?: string | null; sender: string; isCouple: boolean; timestamp: number; type: "text" | "sticker"; }
export interface MediaItem { id: string; url: string; type: "image" | "video"; caption?: string; timestamp: number; sender: string; }
export interface GuestEntry { name: string; role: "guest" | "couple" | "admin"; joinedAt: number; rsvp?: boolean; }
export interface Song { id: string; title: string; artist: string; url: string; cover: string; album: string; durationStr: string; }
export interface Lantern {
  id: string;
  sender: string;
  message: string;
  depth?: "near" | "mid" | "far";
  xValues?: number;
  speed?: number;
  delay?: number;
  color?: string;
  timestamp: number;
}
export interface LocationItem { id: string; lat: number; lng: number; timestamp: number; }
export interface GlobalConfig { coupleName: string; date: string; welcomeMsg: string; coupleImage: string; }

export interface AppContextType {
  messages: Message[]; gallery: MediaItem[]; guestList: GuestEntry[]; heartCount: number;
  lanterns: Lantern[]; savedLanterns: Lantern[]; locations: Record<string, LocationItem> | LocationItem[];
  config: GlobalConfig; currentSong: Song | null; isPlaying: boolean; announcement: string | null;
  typingUsers: Set<string>; isConnected: boolean;
  sendMessage: (text: string, stickerKey?: string | null, sender?: string, isCouple?: boolean) => void;
  sendHeart: () => void; uploadMedia: (item: MediaItem) => void; sendLantern: (lantern: Lantern) => void;
  saveLantern: (lanternId: string) => void; sendRSVP:(name:string)=>void; joinUser:(n:string,r:any)=>void;
  updateConfig:(cfg:Partial<GlobalConfig>)=>void; updatePlaylistState:(s:Song|null,p:boolean)=>void;
  sendAnnouncement:(msg:string)=>void; deleteMessage:(id:string)=>void; deleteMedia:(id:string)=>void;
  updateMediaCaption:(id:string,caption:string)=>void; blockUser:(name:string)=>void; setTyping:(user:string,is:boolean)=>void;
  broadcastLocation:(lat:number,lng:number)=>void; refreshData:()=>void;
}

const DEFAULT_CONFIG: GlobalConfig = { coupleName: "The Couple", date: "2025-12-26", welcomeMsg: "Join us as we begin our forever.", coupleImage: "" };

const AppContext = createContext<AppContextType | undefined>(undefined);

const coerceId = (id: unknown) => String(id ?? Date.now().toString());
const now = () => Date.now();

const normalizeIncomingMessage = (raw: any): Message => {
  const id = coerceId(raw?.id ?? raw?.messageId);
  const text = raw?.text ?? raw?.message ?? "";
  const stickerKey = raw?.stickerKey ?? raw?.sticker ?? null;
  const sender = String(raw?.sender ?? raw?.from ?? "Guest");
  const isCouple = Boolean(raw?.isCouple || raw?.role === "couple");
  const timestamp = typeof raw?.timestamp === "number" ? raw.timestamp : (raw?.timestamp ? new Date(raw.timestamp).getTime() : now());
  const type: "text" | "sticker" = stickerKey ? "sticker" : "text";
  return { id, text, stickerKey, sender, isCouple, timestamp, type };
};

const normalizeMediaItem = (raw: any): MediaItem => {
  const id = coerceId(raw?.id ?? raw?.mediaId);
  const url = String(raw?.url ?? raw?.src ?? raw?.data ?? "");
  const type = raw?.type === "video" ? "video" : "image";
  const caption = raw?.caption ?? raw?.title ?? "";
  const timestamp = typeof raw?.timestamp === "number" ? raw.timestamp : (raw?.timestamp ? new Date(raw.timestamp).getTime() : now());
  const sender = String(raw?.sender ?? raw?.uploader ?? "Guest");
  return { id, url, type, caption, timestamp, sender };
};

const normalizeLantern = (raw: any): Lantern => {
  const id = coerceId(raw?.id);
  const sender = String(raw?.sender ?? raw?.from ?? "Guest");
  const message = String(raw?.message ?? raw?.text ?? "");
  const color = raw?.color ?? "royal";
  const depth = raw?.depth ?? raw?.layer ?? "mid";
  const xValues = typeof raw?.xValues === "number" ? raw.xValues : (typeof raw?.x === "number" ? raw.x : Math.floor(Math.random()*80)+10);
  const speed = typeof raw?.speed === "number" ? raw.speed : (typeof raw?.spd === "number" ? raw.spd : 20 + Math.floor(Math.random()*20));
  const delay = typeof raw?.delay === "number" ? raw.delay : 0;
  const timestamp = typeof raw?.timestamp === "number" ? raw.timestamp : (raw?.timestamp ? new Date(raw.timestamp).getTime() : now());
  return { id, sender, message, color, depth, xValues, speed, delay, timestamp };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);
  const [heartCount, setHeartCount] = useState<number>(0);
  const [lanterns, setLanterns] = useState<Lantern[]>([]);
  const [savedLanterns, setSavedLanterns] = useState<Lantern[]>([]);
  const [locations, setLocations] = useState<Record<string, LocationItem> | LocationItem[]>([]);
  const [config, setConfig] = useState<GlobalConfig>(DEFAULT_CONFIG);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isConnected, setIsConnected] = useState<boolean>(socket?.connected ?? false);

  // dedupe helpers
  const addMessageIfNew = useCallback((raw: any) => {
    if (!raw) return;
    const m = normalizeIncomingMessage(raw);
    setMessages(prev => prev.some(x => String(x.id) === m.id) ? prev : [...prev, m]);
  }, []);

  const addGalleryItemIfNew = useCallback((raw: any) => {
    if (!raw) return;
    const it = normalizeMediaItem(raw);
    if (!it.url) return;
    setGallery(prev => prev.some(x => String(x.id) === it.id) ? prev : [it, ...prev]);
  }, []);

  const addLanternIfNew = useCallback((raw: any) => {
    if (!raw) return;
    const ln = normalizeLantern(raw);
    setLanterns(prev => prev.some(x => String(x.id) === ln.id) ? prev : [...prev, ln]);
  }, []);

  // load cached
  useEffect(() => {
    try {
      const storedMsgs = localStorage.getItem("wedding_chat_messages");
      if (storedMsgs) setMessages(JSON.parse(storedMsgs).map((m:any)=> ({...m, timestamp: Number(m.timestamp)||now()})));
    } catch {}
    try { const storedGallery = localStorage.getItem("wedding_gallery_media"); if (storedGallery) setGallery(JSON.parse(storedGallery)); } catch {}
    try { const storedHearts = localStorage.getItem("wedding_heart_count"); if (storedHearts) setHeartCount(Number(storedHearts)||0); } catch {}
    try { const storedCfg = localStorage.getItem("wedding_global_config"); if (storedCfg) setConfig(prev=>({...prev, ...JSON.parse(storedCfg)})); } catch {}
  }, []);

  useEffect(()=>{ try{ localStorage.setItem("wedding_chat_messages", JSON.stringify(messages)); }catch{} },[messages]);
  useEffect(()=>{ try{ localStorage.setItem("wedding_gallery_media", JSON.stringify(gallery)); }catch{} },[gallery]);
  useEffect(()=>{ try{ localStorage.setItem("wedding_heart_count", String(heartCount)); }catch{} },[heartCount]);
  useEffect(()=>{ try{ localStorage.setItem("wedding_global_config", JSON.stringify(config)); }catch{} },[config]);

  // Socket handlers
  useEffect(()=>{
    if(!socket) return;

    const onConnect = () => { setIsConnected(true); try{ socket.emit("request_sync"); }catch{} };
    const onDisconnect = ()=> { setIsConnected(false); };

    const handleFullSync = (payload:any) => {
      if(!payload || typeof payload !== "object") return;
      const msgs = payload.chatMessages ?? payload.messages ?? payload.chat ?? payload.messageList;
      if(Array.isArray(msgs)) setMessages(msgs.map((m:any)=> normalizeIncomingMessage(m)));
      const gal = payload.gallery ?? payload.media ?? payload.galleryItems;
      if(Array.isArray(gal)) setGallery(gal.map((g:any)=> normalizeMediaItem(g)));
      const heartsVal = typeof payload.hearts === "number" ? payload.hearts : (typeof payload.heartCount === "number" ? payload.heartCount : undefined);
      if(typeof heartsVal === "number") setHeartCount(heartsVal);
      if(Array.isArray(payload.guestList)) setGuestList(payload.guestList);
      if(Array.isArray(payload.lanterns)) setLanterns(payload.lanterns.map((l:any)=> normalizeLantern(l)));
      if(Array.isArray(payload.savedLanterns)) setSavedLanterns(payload.savedLanterns.map((l:any)=> normalizeLantern(l)));
      if(payload.locations) setLocations(payload.locations);
      if(payload.config) setConfig(prev=>({...prev, ...payload.config}));
      if(payload.currentSong) setCurrentSong(payload.currentSong);
      if(typeof payload.isPlaying === "boolean") setIsPlaying(payload.isPlaying);
      if(payload.announcement || payload.adminAnnouncement) setAnnouncement(payload.announcement ?? payload.adminAnnouncement?.text ?? null);
      if(payload.theme) setConfig(prev => ({...prev, theme: payload.theme}));
    };

    const wrapPayload = (d:any) => d?.payload ?? d ?? null;

    const handleMessage = (d:any) => { const p = wrapPayload(d); if(p) addMessageIfNew(p); };
    const handleHeartUpdate = (d:any) => { const p = wrapPayload(d); const count = p?.count ?? p?.heartCount ?? p; if(typeof count === "number") setHeartCount(count); };
    const handleGallerySync = (d:any) => { const p = wrapPayload(d); if(Array.isArray(p)) p.forEach(it => addGalleryItemIfNew(it)); else if(p) addGalleryItemIfNew(p); };
    const handleLanternAdded = (d:any) => { const p = wrapPayload(d); if(p) addLanternIfNew(p); };
    const handleLanternsSync = (d:any) => { const p = wrapPayload(d); if(Array.isArray(p)) setLanterns(p.map((l:any)=>normalizeLantern(l))); };
    const handleReceiveLantern = (d:any) => { const p = wrapPayload(d); if(p) addLanternIfNew(p); };
    const handleLanternLanded = (d:any) => { const p = wrapPayload(d); if(!p) return; if(p.lantern) { const ln = normalizeLantern(p.lantern); setSavedLanterns(prev => prev.some(s=>s.id===ln.id)? prev : [ln, ...prev]); setLanterns(prev => prev.filter(x=>x.id!==ln.id)); } if(p.location) { setLocations(prev => Array.isArray(prev) ? ([...prev,p.location]) : ({ ...prev, [p.location.id ?? now()]: p.location })); } };
    const handleLanternsSavedSync = (d:any) => { const p = wrapPayload(d); if(Array.isArray(p)) setSavedLanterns(p.map((l:any)=>normalizeLantern(l))); };
    const handlePlaylist = (d:any) => { const p = wrapPayload(d); if(!p) return; if(p.currentSong) setCurrentSong(p.currentSong); if(typeof p.isPlaying === "boolean") setIsPlaying(p.isPlaying); };
    const handleAnnouncement = (d:any) => { const p = wrapPayload(d); if(!p) return; setAnnouncement(p.message ?? p.text ?? String(p)); };
    const handleTyping = (d:any) => { if(!d) return; setTypingUsers(prev=>{ const s = new Set(prev); if(Array.isArray(d)){ s.clear(); d.forEach((u:any)=>s.add(String(u))); return s; } const user = d.user ?? d.name ?? d.u; const isTyping = d.isTyping ?? d.t ?? false; if(user){ if(isTyping) s.add(String(user)); else s.delete(String(user)); } return s; }); };
    const handleUserPresence = (d:any) => { const p = wrapPayload(d); if(!p || !p.name) return; setGuestList(prev => { const filtered = prev.filter(g => g.name !== p.name); return [...filtered, p]; }); };
    const handleConfigSync = (d:any) => { const p = wrapPayload(d); if(p) setConfig(prev => ({...prev, ...p})); };
    const handleThemeSync = (d:any) => { const p = wrapPayload(d); if(p) setConfig(prev => ({...prev, theme: p})); };
    const handleLocationsSync = (d:any) => { const p = wrapPayload(d); if(p) setLocations(p); };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    socket.on("sync_data", handleFullSync);
    socket.on("full_sync", handleFullSync);

    socket.on("message", handleMessage);
    socket.on("send_message", handleMessage);

    socket.on("heart_update", handleHeartUpdate);

    socket.on("gallery_sync", handleGallerySync);
    socket.on("gallery_item", handleGallerySync);
    socket.on("upload_media", handleGallerySync);

    socket.on("lantern_added", handleLanternAdded);
    socket.on("lanterns_sync", handleLanternsSync);
    socket.on("receive_lantern", handleReceiveLantern);
    socket.on("lantern_landed", handleLanternLanded);
    socket.on("lanterns_saved_sync", handleLanternsSavedSync);

    socket.on("playlist_update", handlePlaylist);
    socket.on("music_sync", handlePlaylist);

    socket.on("announcement", handleAnnouncement);
    socket.on("typing", handleTyping);

    socket.on("user_presence", handleUserPresence);
    socket.on("user_join", handleUserPresence);

    socket.on("config_sync", handleConfigSync);
    socket.on("theme_sync", handleThemeSync);

    socket.on("locations_sync", handleLocationsSync);
    socket.on("location_update", handleLocationsSync);

    // request authoritative state once connected
    try { socket.emit("request_sync"); } catch {}

    // cleanup
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("sync_data", handleFullSync);
      socket.off("full_sync", handleFullSync);

      socket.off("message", handleMessage);
      socket.off("send_message", handleMessage);

      socket.off("heart_update", handleHeartUpdate);

      socket.off("gallery_sync", handleGallerySync);
      socket.off("gallery_item", handleGallerySync);
      socket.off("upload_media", handleGallerySync);

      socket.off("lantern_added", handleLanternAdded);
      socket.off("lanterns_sync", handleLanternsSync);
      socket.off("receive_lantern", handleReceiveLantern);
      socket.off("lantern_landed", handleLanternLanded);
      socket.off("lanterns_saved_sync", handleLanternsSavedSync);

      socket.off("playlist_update", handlePlaylist);
      socket.off("music_sync", handlePlaylist);

      socket.off("announcement", handleAnnouncement);
      socket.off("typing", handleTyping);

      socket.off("user_presence", handleUserPresence);
      socket.off("user_join", handleUserPresence);

      socket.off("config_sync", handleConfigSync);
      socket.off("theme_sync", handleThemeSync);

      socket.off("locations_sync", handleLocationsSync);
      socket.off("location_update", handleLocationsSync);
    };
  }, [addMessageIfNew, addGalleryItemIfNew, addLanternIfNew]);

  /* ----------------------- Actions (emit to server) ----------------------- */

  const sendMessage = useCallback((text:string, stickerKey?:string|null, sender = "Guest", isCouple=false) => {
    const id = `${now()}-${Math.random().toString(36).slice(2,8)}`;
    const payload: Message = { id, text: String(text ?? ""), stickerKey: stickerKey ?? null, sender, isCouple, timestamp: now(), type: stickerKey ? "sticker" : "text" };
    setMessages(prev => prev.some(m=>m.id===payload.id) ? prev : [...prev, payload]);
    try { socket.emit("send_message", payload); socket.emit("message", payload); } catch(e){ console.error("sendMessage emit failed", e); }
  }, []);

  const sendHeart = useCallback(()=>{ setHeartCount(prev=>prev+1); try{ socket.emit("add_heart"); }catch(e){console.error(e);} },[]);

  const uploadMedia = useCallback((item:MediaItem)=> {
    if(!item || !item.url) return;
    const payload = {...item, id: String(item.id ?? now()), timestamp: Number(item.timestamp ?? now())};
    setGallery(prev => prev.some(g=>String(g.id)===payload.id)? prev : [payload, ...prev]);
    try { socket.emit("gallery_upload", payload); } catch(e){ console.error("uploadMedia emit failed", e); }
  },[]);

  const sendLantern = useCallback((lantern: Lantern) => {
    const payload = {
      ...lantern,
      id: String(lantern.id ?? now()),
      timestamp: now()
    };

    // Optimistically add locally
    setLanterns(prev =>
      prev.some(x => String(x.id) === payload.id) ? prev : [...prev, payload]
    );

    try {
      socket.emit("lantern_release", payload);
    } catch (e) {
      console.error("sendLantern emit failed", e);
    }
  }, []);

  const saveLantern = useCallback((lanternId:string)=>{ 
    try{ socket.emit("save_lantern", lanternId); }catch(e){console.error(e);} 
    // Optimistically move lantern to saved history locally:
    setLanterns(prev => {
      const found = prev.find(l => String(l.id) === String(lanternId));
      if (!found) return prev;
      setSavedLanterns(s => s.some(x=>x.id===found.id) ? s : [found, ...s]);
      return prev.filter(l => String(l.id) !== String(lanternId));
    });
  },[]);
  const sendRSVP = useCallback((name:string)=>{ try{ socket.emit("send_rsvp", { name }); }catch(e){console.error(e);} },[]);
  const joinUser = useCallback((name:string, role:any)=>{ try{ socket.emit("user_join", { name, role, joinedAt: Date.now() }); }catch(e){console.error(e);} },[]);
  const updateConfig = useCallback((cfg:Partial<GlobalConfig>)=>{ setConfig(prev=>({...prev, ...cfg})); try{ socket.emit("admin_update_settings", cfg); socket.emit("config_update", cfg); }catch(e){console.error(e);} },[]);
  const updatePlaylistState = useCallback((song:Song|null, playing:boolean)=>{ setCurrentSong(song); setIsPlaying(playing); try{ socket.emit("playlist_update", { currentSong: song, isPlaying: playing }); }catch(e){console.error(e);} },[]);
  const sendAnnouncement = useCallback((msg:string)=>{ setAnnouncement(msg); try{ socket.emit("admin_announce", { text: msg }); socket.emit("send_announcement", { message: msg }); }catch(e){console.error(e);} },[]);
  const deleteMessage = useCallback((id:string)=>{ setMessages(prev=>prev.filter(m=>String(m.id)!==String(id))); try{ socket.emit("delete_message", id); }catch(e){console.error(e);} },[]);
  const deleteMedia = useCallback((id:string)=>{ setGallery(prev=>prev.filter(g=>String(g.id)!==String(id))); try{ socket.emit("delete_media", id); }catch(e){console.error(e);} },[]);
  const updateMediaCaption = useCallback((id:string, caption:string)=>{ setGallery(prev=>prev.map(p=>String(p.id)===String(id)? {...p, caption} : p)); try{ socket.emit("update_media_caption", { id, caption }); }catch(e){console.error(e);} },[]);
  const blockUser = useCallback((name:string)=>{ try{ socket.emit("block_user", { name }); }catch(e){console.error(e);} },[]);
  const setTyping = useCallback((user:string, is:Boolean)=>{ try{ socket.emit("typing", { user, isTyping: is }); }catch(e){console.error(e);} setTypingUsers(prev=>{ const s = new Set(prev); if(is) s.add(user); else s.delete(user); return s; }); },[]);
  const broadcastLocation = useCallback((lat:number,lng:number)=>{ try{ socket.emit("location_update", { lat, lng, name: "guest", timestamp: Date.now() }); }catch(e){console.error(e);} },[]);
  const refreshData = useCallback(()=>{ try{ socket.emit("request_sync"); }catch(e){console.error(e);} },[]);

  const contextValue: AppContextType = {
    messages, gallery, guestList, heartCount, lanterns, savedLanterns, locations,
    config, currentSong, isPlaying, announcement, typingUsers, isConnected,
    sendMessage, sendHeart, uploadMedia, sendLantern, saveLantern, sendRSVP, joinUser,
    updateConfig, updatePlaylistState, sendAnnouncement, deleteMessage, deleteMedia,
    updateMediaCaption, blockUser, setTyping, broadcastLocation, refreshData
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppData = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppData must be used within AppProvider");
  return ctx;
};
