// /home/user/engagement-app2/components/CoupleDashboard.tsx
// ---------------------------------------------------------
// COUPLE DASHBOARD — FINAL CONSOLIDATED CODE (patched)
// ---------------------------------------------------------
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Home,
  MessageSquare,
  Heart,
  Music,
  LogOut,
  RefreshCw,
  Users,
  Crown,
  Image as ImageIcon,
  Gift,
  Megaphone,
  Send,
  CheckCircle,
  X,
  SkipBack,
  SkipForward,
  Pause,
  Play,
  Radio
} from "lucide-react";

import { useTheme } from "../ThemeContext";
import { useAppData } from "../AppContext"; // AppContext should be at this path
import LanternApp from "./lantern/App"; // lantern mini-app

// ---------------------------------------------------------
// THEME BASE BACKGROUNDS & STYLES
// (unchanged from your provided version, trimmed for clarity)
// ---------------------------------------------------------
const THEME_BASES: Record<string, string> = {
  royal: "bg-[#4a0404]",
  midnight: "bg-[#020617]",
  sunset: "bg-[#2a0a18]",
  lavender: "bg-[#2e1065]",
  forest: "bg-[#052e16]"
};

const THEME_STYLES: Record<string, any> = {
  royal: {
    text: "text-pink-100",
    mutedText: "text-pink-300",
    accent: "text-pink-400",
    border: "border-pink-500/20",
    headerBg: "bg-passion-900/10",
    navBg: "bg-passion-900/90",
    inputBg: "bg-passion-900/90",
    inputInner: "bg-black/40",
    userBubble: "bg-white text-passion-900",
    otherBubble: "bg-black/40 border border-pink-500/30 text-pink-100",
    button: "bg-pink-600",
    iconActive: "text-pink-500",
    navActive: "bg-pink-600 text-white shadow-lg",
    crownBg: "bg-passion-700",
    crownIcon: "bg-pink-500"
  },
  midnight: {
    text: "text-blue-100",
    mutedText: "text-blue-300",
    accent: "text-blue-400",
    border: "border-blue-500/20",
    headerBg: "bg-slate-900/10",
    navBg: "bg-slate-900/90",
    inputBg: "bg-slate-900/90",
    inputInner: "bg-slate-950/60",
    userBubble: "bg-white text-slate-900",
    otherBubble: "bg-slate-800/60 border border-blue-500/30 text-blue-100",
    button: "bg-blue-600",
    iconActive: "text-blue-500",
    navActive: "bg-blue-600 text-white shadow-lg",
    crownBg: "bg-slate-800",
    crownIcon: "bg-blue-500"
  },
  sunset: {
    text: "text-orange-50",
    mutedText: "text-orange-200",
    accent: "text-orange-400",
    border: "border-orange-500/20",
    headerBg: "bg-[#2a0a18]/10",
    navBg: "bg-[#2a0a18]/90",
    inputBg: "bg-[#2a0a18]/90",
    inputInner: "bg-black/40",
    userBubble: "bg-white text-orange-900",
    otherBubble: "bg-purple-900/40 border border-orange-500/30 text-orange-100",
    button: "bg-orange-600",
    iconActive: "text-orange-500",
    navActive: "bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg",
    crownBg: "bg-[#4a0404]",
    crownIcon: "bg-orange-500"
  },
  lavender: {
    text: "text-purple-100",
    mutedText: "text-purple-300",
    accent: "text-purple-400",
    border: "border-purple-500/20",
    headerBg: "bg-purple-900/10",
    navBg: "bg-purple-900/90",
    inputBg: "bg-purple-900/90",
    inputInner: "bg-black/40",
    userBubble: "bg-white text-purple-900",
    otherBubble: "bg-purple-950/60 border border-purple-500/30 text-purple-100",
    button: "bg-purple-600",
    iconActive: "text-purple-400",
    navActive: "bg-purple-600 text-white shadow-lg",
    crownBg: "bg-purple-950",
    crownIcon: "bg-violet-500"
  },
  forest: {
    text: "text-emerald-100",
    mutedText: "text-emerald-300",
    accent: "text-emerald-400",
    border: "border-emerald-500/20",
    headerBg: "bg-emerald-900/10",
    navBg: "bg-emerald-900/90",
    inputBg: "bg-emerald-900/90",
    inputInner: "bg-black/40",
    userBubble: "bg-white text-emerald-900",
    otherBubble: "bg-emerald-950/60 border border-emerald-500/30 text-emerald-100",
    button: "bg-emerald-600",
    iconActive: "text-emerald-400",
    navActive: "bg-emerald-600 text-white shadow-lg",
    crownBg: "bg-emerald-950",
    crownIcon: "bg-teal-500"
  }
};

// ---------------------------------------------------------
// small visual helpers (Fireflies/Petals/Lights) omitted for brevity
// You can paste the same helpers from your existing file if desired.
// ---------------------------------------------------------

// ---------------------------------------------------------
// MAIN COMPONENT DEFINITION
// ---------------------------------------------------------
const CoupleDashboard: React.FC<{ userName?: string; onLogout?: () => void }> = ({
  userName = "Aman",
  onLogout = () => {}
}) => {
  const { theme } = useTheme();
  const {
    messages,
    gallery,
    lanterns,
    guestList,
    heartCount,
    announcement,
    typingUsers,
    sendMessage,
    setTyping,
    refreshData,
    currentSong,
    updatePlaylistState,
    isPlaying,
    config
  } = useAppData();

  const themeStyles = THEME_STYLES[theme?.gradient ?? "royal"] || THEME_STYLES.royal;

  // local UI state
  const [activeTab, setActiveTab] = useState<string>("home");
  const [chatInput, setChatInput] = useState<string>("");
  const [selectedLantern, setSelectedLantern] = useState<any | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Keep lanterns from guests only for the couple view.
  // We consider the configured coupleName (from config) as the couple identity.
  const coupleName = config?.coupleName ?? "The Couple";
  const guestLanterns = Array.isArray(lanterns) ? lanterns.filter((l: any) => String(l.sender) !== String(coupleName)) : [];

  // When user opens the lantern tab, request a fresh sync to reduce "no sync" issues
  useEffect(() => {
    if (activeTab === "lanterns") {
      try {
        refreshData();
      } catch (e) {
        // ignore
      }
    }
  }, [activeTab, refreshData]);

  // auto-scroll chat
  useEffect(() => {
    const el = chatScrollRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, activeTab]);

  const handleSendMessage = useCallback(
    (text: string) => {
      if (!text || text.trim() === "") return;
      sendMessage(text, undefined, userName, true);
      setChatInput("");
      try {
        setTyping(userName, false);
      } catch {}
    },
    [sendMessage, userName, setTyping]
  );

  const handleClearCache = () => {
    try {
      localStorage.clear();
    } catch {}
    try {
      refreshData();
    } catch {}
    // soft reload to ensure fresh state
    window.location.reload();
  };

  const togglePlay = () => {
    // placeholder: toggle playing state if updatePlaylistState available
    try {
      updatePlaylistState?.(currentSong ?? null, !isPlaying);
    } catch {}
  };

  // nav item click wrapper (fixed previous bug)
  const onNavClick = (id: string) => {
    setActiveTab(id);
  };

  return (
    <div className={`w-full h-full relative overflow-hidden font-serif ${THEME_BASES[theme?.gradient ?? "royal"]} ${themeStyles.text} flex flex-col`}>
      {/* Header */}
      <header className={`flex-shrink-0 p-4 flex justify-between items-center z-20 border-b backdrop-blur-md shadow-lg ${themeStyles.headerBg} ${themeStyles.border}`}>
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full border-2 border-white p-0.5 shadow-glow ${themeStyles.crownBg}`}>
            <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl ${themeStyles.crownIcon}`}>
              <Crown size={20} fill="white" />
            </div>
          </div>

          <div>
            <h1 className="font-romantic text-2xl text-white drop-shadow-md">The Happy Couple</h1>
            <p className={`text-[10px] uppercase tracking-widest ${themeStyles.mutedText}`}>Control Room</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={handleClearCache} className={`p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors ${themeStyles.mutedText}`} title="Reset App">
            <RefreshCw size={18} />
          </button>

          <button onClick={onLogout} className={`p-2 hover:bg-white/5 rounded-lg hover:text-white transition-colors ${themeStyles.mutedText}`}>
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-grow overflow-hidden relative">
        {/* Home */}
        {activeTab === "home" && (
          <div className="h-full overflow-y-auto p-6 animate-fade-in">
            {announcement && (
              <div className={`w-full p-4 rounded-2xl border shadow-lg flex items-start gap-3 mb-6 animate-fade-in-up ${themeStyles.button} ${themeStyles.border}`}>
                <div className="bg-white/20 p-2 rounded-full shrink-0">
                  <Megaphone size={18} className="text-white animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-white/80 tracking-widest mb-1">Latest News</h4>
                  <p className="text-sm text-white font-serif leading-snug">{announcement}</p>
                </div>
              </div>
            )}

            <div className="text-center my-6">
              <Heart size={48} className={`mx-auto mb-4 animate-heartbeat fill-current/50 ${themeStyles.iconActive}`} />
              <h2 className="text-4xl font-romantic text-white mb-2 drop-shadow-md">Welcome, Lovebirds</h2>
              <p className={`text-sm italic ${themeStyles.mutedText}`}>Your love story is unfolding perfectly.</p>
            </div>

            <div className={`p-6 rounded-3xl border border-white/20 flex items-center justify-between mb-8 relative overflow-hidden shadow-glow group ${themeStyles.crownBg}`}>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10">
                <h3 className="text-white font-bold text-lg mb-1">Love Showered</h3>
                <p className={`text-xs uppercase tracking-widest ${themeStyles.mutedText}`}>Hearts Received</p>
              </div>

              <div className="text-5xl font-bold text-white flex items-center gap-2 relative z-10 font-romantic">{heartCount}</div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => onNavClick("guests")} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                <Users size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`} />
                <span className={`text-sm font-bold ${themeStyles.text}`}>Guest List</span>
              </button>

              <button onClick={() => onNavClick("chat")} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                <MessageSquare size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`} />
                <span className={`text-sm font-bold ${themeStyles.text}`}>Read Wishes</span>
              </button>

              <button onClick={() => onNavClick("gallery")} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                <ImageIcon size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`} />
                <span className={`text-sm font-bold ${themeStyles.text}`}>Photo Album</span>
              </button>

              {/* Lanterns tab — replaced the earlier Gift tile */}
              <button onClick={() => onNavClick("lanterns")} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                <Gift size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`} />
                <span className={`text-sm font-bold ${themeStyles.text}`}>Lantern Sky</span>
              </button>
            </div>
          </div>
        )}

        {/* Chat */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full relative">
            <div ref={chatScrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-28 animate-fade-in">
              {messages.map((msg: any, idx: number) => {
                const isCouple = Boolean(msg.isCouple);
                const align = isCouple ? "justify-end" : "justify-start";
                return (
                  <div key={msg.id ?? idx} className={`flex ${align}`}>
                    <div className={`max-w-[80%] p-3 rounded-2xl shadow-md ${isCouple ? `${themeStyles.userBubble} font-bold shadow-glow` : `${themeStyles.otherBubble}`}`}>
                      {!isCouple && <p className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${themeStyles.accent}`}>{msg.sender}</p>}
                      {msg.type === "sticker" && msg.stickerKey ? (
                        <div className="w-20 h-20 flex items-center justify-center">
                          <img src={`/stickers/${msg.stickerKey}.png`} className="w-full h-full object-contain" />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                      )}
                      <p className="text-[9px] opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}

              {typingUsers && typingUsers.size > 0 && (
                <div className="flex justify-start">
                  <div className={`px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-md ${themeStyles.otherBubble}`}>
                    <span className="animate-pulse">
                      {Array.from(typingUsers).slice(0, 2).join(", ")}{typingUsers.size > 2 ? ` + ${typingUsers.size - 2} more` : ""}
                    </span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-150" />
                      <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce delay-300" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={`absolute bottom-0 left-0 right-0 p-4 border-t backdrop-blur-md pb-safe ${themeStyles.inputBg} ${themeStyles.border}`}>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => {
                    setChatInput(e.target.value);
                    try { setTyping(userName, true); } catch {}
                    if (typingTimeoutRef.current) window.clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = window.setTimeout(() => {
                      try { setTyping(userName, false); } catch {}
                    }, 1500);
                  }}
                  placeholder="Send love back..."
                  className={`flex-grow border rounded-full px-5 text-white focus:outline-none focus:border-white/50 ${themeStyles.inputInner} ${themeStyles.border}`}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendMessage(chatInput); }}
                />
                <button onClick={() => handleSendMessage(chatInput)} className={`p-3 rounded-full text-white shadow-lg hover:brightness-110 transform active:scale-95 transition-transform ${themeStyles.button}`}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gallery */}
        {activeTab === "gallery" && (
          <div className="h-full overflow-y-auto p-4 pb-24 animate-fade-in">
            <h2 className="text-2xl font-romantic text-white mb-4">Shared Moments</h2>
            <div className="grid grid-cols-3 gap-3">
              {gallery.map((p: any) => (
                <div key={p.id} className={`relative aspect-square rounded-lg overflow-hidden group bg-black/40 border ${themeStyles.border}`}>
                  <img src={p.url} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <p className="text-white text-xs truncate font-bold">{p.caption}</p>
                    <span className={`text-[9px] ${themeStyles.mutedText}`}>{p.sender}</span>
                  </div>
                </div>
              ))}

              {gallery.length === 0 && (
                <div className={`col-span-3 flex flex-col items-center justify-center py-20 gap-2 ${themeStyles.mutedText}`}>
                  <ImageIcon size={32} className="opacity-50" />
                  <p className="text-sm">Your album is empty.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lanterns — FULLSCREEN mini-app */}
        {activeTab === "lanterns" && (
          // show the dedicated lantern mini-app full screen; it already handles interaction and archive
          <div className="fixed inset-0 z-50">
            <LanternApp />
          </div>
        )}

        {/* Guests */}
        {activeTab === "guests" && (
          <div className="h-full overflow-y-auto p-4 pb-24 animate-fade-in">
            <h2 className="text-2xl font-romantic text-white mb-4">Guest List</h2>
            <div className={`bg-white/5 rounded-2xl border divide-y divide-white/5 overflow-hidden ${themeStyles.border}`}>
              {guestList.map((g: any, i: number) => (
                <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/5 transition">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${g.role === "couple" ? "bg-white text-black" : `bg-white/10 ${themeStyles.text}`}`}>
                    {String(g.name || "").charAt(0)}
                  </div>

                  <div>
                    <h3 className={`font-bold ${themeStyles.text} flex items-center gap-2`}>{g.name}
                      {g.rsvp && <span className="text-green-400 text-[10px] flex items-center gap-1 border border-green-500/30 px-1.5 py-0.5 rounded-full bg-green-500/10" title="RSVP Confirmed"><CheckCircle size={10} /> Attending</span>}
                    </h3>
                    <div className={`text-[10px] uppercase tracking-widest ${themeStyles.mutedText}`}>{g.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Music */}
        {activeTab === "music" && (
          <div className="h-full overflow-y-auto p-6 pb-32 animate-fade-in">
            <h2 className="text-3xl font-romantic text-white mb-6 text-center">Mood Controller</h2>

            <div className={`bg-gradient-to-b from-black/20 to-black/60 p-6 rounded-3xl border shadow-2xl mb-8 flex flex-col items-center relative overflow-hidden group ${themeStyles.border}`}>
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />

              <div className={`w-48 h-48 rounded-full border-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-6 relative ${isPlaying ? "animate-spin-slow" : ""} ${themeStyles.border}`}>
                <img src={currentSong?.cover} className="w-full h-full object-cover rounded-full" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 to-transparent"></div>
                <div className={`absolute w-8 h-8 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white ${themeStyles.crownBg}`} />
              </div>

              <div className="text-center mb-6 relative z-10">
                <h3 className="text-xl font-bold text-white">{currentSong?.title}</h3>
                <p className={`${themeStyles.mutedText} text-sm`}>{currentSong?.artist}</p>
              </div>

              <div className="flex items-center gap-8 relative z-10">
                <button className={`${themeStyles.mutedText} hover:text-white transition-colors`}><SkipBack size={32} /></button>

                <button onClick={togglePlay} className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-glow-lg hover:scale-105 active:scale-95 transition-transform ${themeStyles.button}`}>
                  {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" />}
                </button>

                <button className={`${themeStyles.mutedText} hover:text-white transition-colors`}><SkipForward size={32} /></button>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400 uppercase tracking-widest font-bold bg-black/50 px-3 py-1 rounded-full">
                <Radio size={10} className={isPlaying ? "animate-pulse" : ""} />
                {isPlaying ? "Broadcasting to Guests" : "Paused"}
              </div>
            </div>

            {/* queue placeholder */}
            <div className="space-y-3">
              <h3 className={`text-xs uppercase tracking-widest font-bold mb-2 ml-1 ${themeStyles.accent}`}>Romantic Selection</h3>
              {/* playlist rendering omitted (use your existing playlist logic) */}
              <div className="text-sm text-white/60">No songs in queue.</div>
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className={`flex-shrink-0 p-2 border-t flex justify-around z-20 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.4)] backdrop-blur-lg ${themeStyles.navBg} ${themeStyles.border}`}>
        {[
          { id: "home", icon: Home, label: "Home" },
          { id: "chat", icon: MessageSquare, label: "Chat" },
          { id: "lanterns", icon: Gift, label: "Lanterns" },
          { id: "gallery", icon: ImageIcon, label: "Gallery" },
          { id: "music", icon: Music, label: "Music" }
        ].map((item) => (
          <button key={item.id} onClick={() => onNavClick(item.id)} className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${activeTab === item.id ? themeStyles.navActive : themeStyles.mutedText}`}>
            <item.icon size={20} className={activeTab === item.id ? "animate-pulse" : ""} />
            <span className="text-[8px] uppercase tracking-widest font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default CoupleDashboard;
