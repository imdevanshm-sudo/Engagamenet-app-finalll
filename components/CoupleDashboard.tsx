import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Home, MessageSquare, Heart, Music, LogOut, RefreshCw, Users, Crown, 
  Image as ImageIcon, Gift, Megaphone, Send, CheckCircle, X, 
  SkipBack, SkipForward, Pause, Play, Radio, Trash2, LayoutGrid, ExternalLink
} from "lucide-react";

import { useTheme } from "../ThemeContext";
import { useAppData } from "../AppContext"; 

// --- CINEMATIC IMPORTS ---
import { IntroGate } from "./lantern/components/IntroGate";
import { Background } from "./lantern/components/Background";
import { ArchiveView } from "./lantern/components/ArchiveView";
import { Lantern } from "./lantern/components/Lantern";
import { AudioController } from "/home/user/engagement-app2/components/lantern/utils/audio.ts";

// ---------------------------------------------------------
// THEME STYLES (Retained)
// ---------------------------------------------------------
const THEME_BASES: Record<string, string> = { 
    royal: "bg-[#4a0404]", midnight: "bg-[#020617]", sunset: "bg-[#2a0a18]", 
    lavender: "bg-[#2e1065]", forest: "bg-[#052e16]" 
};
const THEME_STYLES: Record<string, any> = { 
    royal: { text: "text-pink-100", mutedText: "text-pink-300", accent: "text-pink-400", border: "border-pink-500/20", headerBg: "bg-passion-900/10", navBg: "bg-passion-900/90", inputBg: "bg-passion-900/90", inputInner: "bg-black/40", userBubble: "bg-white text-passion-900", otherBubble: "bg-black/40 border border-pink-500/30 text-pink-100", button: "bg-pink-600", iconActive: "text-pink-500", navActive: "bg-pink-600 text-white shadow-lg", crownBg: "bg-passion-700", crownIcon: "bg-pink-500" },
    midnight: { text: "text-blue-100", mutedText: "text-blue-300", accent: "text-blue-400", border: "border-blue-500/20", headerBg: "bg-slate-900/10", navBg: "bg-slate-900/90", inputBg: "bg-slate-900/90", inputInner: "bg-slate-950/60", userBubble: "bg-white text-slate-900", otherBubble: "bg-slate-800/60 border border-blue-500/30 text-blue-100", button: "bg-blue-600", iconActive: "text-blue-500", navActive: "bg-blue-600 text-white shadow-lg", crownBg: "bg-slate-800", crownIcon: "bg-blue-500" },
    sunset: { text: "text-orange-50", mutedText: "text-orange-200", accent: "text-orange-400", border: "border-orange-500/20", headerBg: "bg-[#2a0a18]/10", navBg: "bg-[#2a0a18]/90", inputBg: "bg-[#2a0a18]/90", inputInner: "bg-black/40", userBubble: "bg-white text-orange-900", otherBubble: "bg-purple-900/40 border border-orange-500/30 text-orange-100", button: "bg-orange-600", iconActive: "text-orange-500", navActive: "bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg", crownBg: "bg-[#4a0404]", crownIcon: "bg-orange-500" },
    lavender: { text: "text-purple-100", mutedText: "text-purple-300", accent: "text-purple-400", border: "border-purple-500/20", headerBg: "bg-purple-900/10", navBg: "bg-purple-900/90", inputBg: "bg-purple-900/90", inputInner: "bg-black/40", userBubble: "bg-white text-purple-900", otherBubble: "bg-purple-950/60 border border-purple-500/30 text-purple-100", button: "bg-purple-600", iconActive: "text-purple-400", navActive: "bg-purple-600 text-white shadow-lg", crownBg: "bg-purple-950", crownIcon: "bg-violet-500" },
    forest: { text: "text-emerald-100", mutedText: "text-emerald-300", accent: "text-emerald-400", border: "border-emerald-500/20", headerBg: "bg-emerald-900/10", navBg: "bg-emerald-900/90", inputBg: "bg-emerald-900/90", inputInner: "bg-black/40", userBubble: "bg-white text-emerald-900", otherBubble: "bg-emerald-950/60 border border-emerald-500/30 text-emerald-100", button: "bg-emerald-600", iconActive: "text-emerald-400", navActive: "bg-emerald-600 text-white shadow-lg", crownBg: "bg-emerald-950", crownIcon: "bg-teal-500" }
};

const Atmosphere = ({ theme }: { theme: any }) => ( <div className="absolute inset-0 pointer-events-none overflow-hidden z-0"><div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" /></div> );

const CoupleDashboard: React.FC<{ userName?: string; onLogout?: () => void }> = ({ userName = "Aman", onLogout = () => {} }) => {
  const { theme, setTheme } = useTheme();
  // ✅ FIX: Use 'any' cast to access savedLanterns if context type isn't updating fast enough
  const { messages, gallery, lanterns, guestList, heartCount, announcement, typingUsers, sendMessage, setTyping, refreshData, currentSong, updatePlaylistState, isPlaying, config, deleteMedia, blockUser, saveLantern, savedLanterns, spotifyEmbedUrl } = useAppData() as any;

  const currentGradient = config?.theme || theme?.gradient || "royal";
  const themeStyles = THEME_STYLES[currentGradient] || THEME_STYLES.royal;
  
  const [activeTab, setActiveTab] = useState<string>("home");
  const [chatInput, setChatInput] = useState<string>("");
  const [hasEntered, setHasEntered] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<AudioController | null>(null);
  const farLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const nearLayerRef = useRef<HTMLDivElement>(null);

  // --- DATA LOGIC ---
  const coupleName = config?.coupleName ?? "The Couple";
  
  // Filter: Only Guest Lanterns
  const isGuest = (l: any) => {
      const s = String(l.sender || "");
      return s !== String(coupleName) && s !== "Aman" && s !== "Sneha";
  };

  // Adapt: Map message to text
  const adaptLantern = (l: any) => ({
      ...l,
      text: l.message || l.text || "A wish for love...",
      depth: l.depth || "mid",
      xValues: l.xValues || Math.random() * 90,
      speed: l.speed || 20,
      delay: l.delay || 0
  });

  const floatingLanterns = useMemo(() => (Array.isArray(lanterns) ? lanterns : []).filter(isGuest).map(adaptLantern), [lanterns]);
  
  // ✅ FIX: Archive combines active + saved
  const archiveLanterns = useMemo(() => {
      const active = Array.isArray(lanterns) ? lanterns : [];
      const saved = Array.isArray(savedLanterns) ? savedLanterns : [];
      const combined = [...active, ...saved];
      const uniqueMap = new Map();
      combined.forEach(item => uniqueMap.set(item.id, item));
      return Array.from(uniqueMap.values()).filter(isGuest).map(adaptLantern);
  }, [lanterns, savedLanterns]);

  // --- EFFECTS ---
  useEffect(() => {
    if (activeTab === "lanterns") { try { refreshData(); } catch (e) {} } 
    else { if (audioRef.current) { try { audioRef.current.stopAll(); } catch {} audioRef.current = null; setHasEntered(false); } }
  }, [activeTab, refreshData]);

  useEffect(() => { if (config?.theme && config.theme !== theme.gradient && setTheme) setTheme({ ...theme, gradient: config.theme }); }, [config, theme, setTheme]);
  useEffect(() => { if (chatScrollRef.current) chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight; }, [messages, activeTab]);

  // --- HANDLERS ---
  const handleSendMessage = useCallback((text: string) => { if (!text || text.trim() === "") return; sendMessage(text, undefined, userName, true); setChatInput(""); try { setTyping(userName, false); } catch {} }, [sendMessage, userName, setTyping]);
  const handleClearCache = () => { try { localStorage.clear(); } catch {} try { refreshData(); } catch {} window.location.reload(); };
  const togglePlay = () => { try { updatePlaylistState?.(currentSong ?? null, !isPlaying); } catch {} };
  const onNavClick = (id: string) => { setActiveTab(id); };
  const handleDeleteMedia = (mediaId: string) => { if (window.confirm("Delete photo?")) deleteMedia(mediaId); };
  const handleDeleteGuest = (guestName: string) => { if (window.confirm(`Remove ${guestName}?`)) blockUser(guestName); };
  const handleSpotifyConnect = () => { if (spotifyEmbedUrl) window.open(spotifyEmbedUrl, '_blank'); };

  const handleStartEntry = () => { audioRef.current = new AudioController(); audioRef.current.init(); audioRef.current.playDoorOpen(); };
  const handleEntryComplete = () => { setHasEntered(true); audioRef.current?.playAmbientWind(); };
  
  const handleLanternClick = (msg: any) => {
    if (showArchive) return;
    setSelectedMessage(msg);
    audioRef.current?.playLanternClick();
  };

  const handleArchiveSelection = (msg: any) => {
    setShowArchive(false);
    setSelectedMessage(msg);
    audioRef.current?.playLanternClick();
  };

  const handleCloseModal = (e?: React.MouseEvent) => { e?.stopPropagation(); setSelectedMessage(null); };
  
  // ✅ FIX: Save lantern on "Release & Save"
  const handleSaveAndClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedMessage?.id) {
          saveLantern(selectedMessage.id); 
      }
      handleCloseModal();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!hasEntered || showArchive || selectedMessage) return;
    const { clientX, clientY, currentTarget } = e;
    const width = currentTarget.clientWidth;
    const height = currentTarget.clientHeight;
    const x = (clientX / width - 0.5) * 2;
    const y = (clientY / height - 0.5) * 2;
    if (farLayerRef.current) farLayerRef.current.style.transform = `translate(${x * -15}px, ${y * -15}px)`;
    if (midLayerRef.current) midLayerRef.current.style.transform = `translate(${x * -35}px, ${y * -35}px)`;
    if (nearLayerRef.current) nearLayerRef.current.style.transform = `translate(${x * -60}px, ${y * -60}px)`;
  };

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------
  return (
    <div className={`w-full h-full relative overflow-hidden font-serif ${THEME_BASES[currentGradient]} ${themeStyles.text} flex flex-col`}>
      {activeTab !== 'lanterns' && <Atmosphere theme={theme} />}
      
      {activeTab !== 'lanterns' && (
      <header className={`flex-shrink-0 p-4 flex justify-between items-center z-20 border-b backdrop-blur-md shadow-lg ${themeStyles.headerBg} ${themeStyles.border}`}>
        <div className="flex items-center gap-3"><div className={`w-12 h-12 rounded-full border-2 border-white p-0.5 shadow-glow ${themeStyles.crownBg}`}><div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-xl ${themeStyles.crownIcon}`}><Crown size={20} fill="white" /></div></div><div><h1 className="font-romantic text-2xl text-white drop-shadow-md">The Happy Couple</h1><p className={`text-[10px] uppercase tracking-widest ${themeStyles.mutedText}`}>Control Room</p></div></div>
        <div className="flex items-center gap-2"><button onClick={handleClearCache} className={`p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors ${themeStyles.mutedText}`}><RefreshCw size={18} /></button><button onClick={onLogout} className={`p-2 hover:bg-white/5 rounded-lg hover:text-white transition-colors ${themeStyles.mutedText}`}><LogOut size={20} /></button></div>
      </header>
      )}

      <div className="flex-grow overflow-hidden relative">
        {/* HOME */}
        {activeTab === "home" && (<div className="h-full overflow-y-auto p-6 animate-fade-in">{announcement && <div className={`w-full p-4 rounded-2xl border shadow-lg flex items-start gap-3 mb-6 animate-fade-in-up ${themeStyles.button} ${themeStyles.border}`}><div className="bg-white/20 p-2 rounded-full shrink-0"><Megaphone size={18} className="text-white animate-pulse" /></div><div><h4 className="text-xs font-bold uppercase text-white/80 tracking-widest mb-1">Latest News</h4><p className="text-sm text-white font-serif leading-snug">{announcement}</p></div></div>}<div className="text-center my-6"><Heart size={48} className={`mx-auto mb-4 animate-heartbeat fill-current/50 ${themeStyles.iconActive}`} /><h2 className="text-4xl font-romantic text-white mb-2 drop-shadow-md">Welcome, Lovebirds</h2></div><div className={`p-6 rounded-3xl border border-white/20 flex items-center justify-between mb-8 relative overflow-hidden shadow-glow group ${themeStyles.crownBg}`}><div className="relative z-10"><h3 className="text-white font-bold text-lg mb-1">Love Showered</h3><p className={`text-xs uppercase tracking-widest ${themeStyles.mutedText}`}>Hearts Received</p></div><div className="text-5xl font-bold text-white flex items-center gap-2 relative z-10 font-romantic">{heartCount}</div></div><div className="grid grid-cols-2 gap-4"><button onClick={() => onNavClick("guests")} className={`p-6 bg-white/5 rounded-2xl border ${themeStyles.border}`}><Users size={32} /><span className="text-sm font-bold">Guest List</span></button><button onClick={() => onNavClick("chat")} className={`p-6 bg-white/5 rounded-2xl border ${themeStyles.border}`}><MessageSquare size={32} /><span className="text-sm font-bold">Read Wishes</span></button><button onClick={() => onNavClick("gallery")} className={`p-6 bg-white/5 rounded-2xl border ${themeStyles.border}`}><ImageIcon size={32} /><span className="text-sm font-bold">Photo Album</span></button><button onClick={() => onNavClick("lanterns")} className={`p-6 bg-white/5 rounded-2xl border ${themeStyles.border}`}><Gift size={32} /><span className="text-sm font-bold">Lantern Sky</span></button></div></div>)}

        {/* CHAT, GALLERY, GUESTS, MUSIC (Abbreviated for conciseness, same logic) */}
        {activeTab === "chat" && <div className="flex flex-col h-full relative"><div ref={chatScrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-28 animate-fade-in">{messages.map((msg, i) => <div key={i} className={`flex ${msg.isCouple?"justify-end":"justify-start"}`}><div className={`max-w-[80%] p-3 rounded-2xl ${msg.isCouple?themeStyles.userBubble:themeStyles.otherBubble}`}><p className="text-sm">{msg.text}</p></div></div>)}</div><div className={`absolute bottom-0 left-0 right-0 p-4 border-t backdrop-blur-md pb-safe ${themeStyles.inputBg} ${themeStyles.border}`}><div className="flex gap-2"><input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} className={`flex-grow border rounded-full px-5 text-white ${themeStyles.inputInner}`} /><button onClick={() => handleSendMessage(chatInput)} className={`p-3 rounded-full ${themeStyles.button}`}><Send size={20} /></button></div></div></div>}
        {activeTab === "gallery" && <div className="h-full overflow-y-auto p-4 pb-24 animate-fade-in"><div className="grid grid-cols-3 gap-3">{gallery.map(p => <div key={p.id} className="aspect-square relative"><img src={p.url} className="object-cover w-full h-full" /><button onClick={() => handleDeleteMedia(p.id)} className="absolute top-1 right-1 bg-red-500 p-1 rounded-full"><Trash2 size={14}/></button></div>)}</div></div>}
        {activeTab === "guests" && <div className="h-full overflow-y-auto p-4 pb-24 animate-fade-in">{guestList.map(g => <div key={g.name} className="p-3 border-b border-white/10 flex justify-between">{g.name} {g.role !== 'couple' && <button onClick={() => handleDeleteGuest(g.name)}><Trash2 size={16}/></button>}</div>)}</div>}
        {activeTab === "music" && <div className="h-full overflow-y-auto p-6 pb-32 animate-fade-in"><div className={`bg-black/20 p-6 rounded-3xl border ${themeStyles.border} mb-6`}><div className="text-center mb-4"><h3 className="text-xl text-white font-bold">{currentSong?.title ?? "Local / Synced"}</h3></div><div className="flex items-center justify-center gap-8"><button onClick={togglePlay}>{isPlaying ? <Pause /> : <Play />}</button></div></div><div className="space-y-4"><div className={`p-4 rounded-2xl border bg-green-900/20 border-green-500/30 flex items-center justify-between`}><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-black"><Music size={20} /></div><div><h3 className="text-white font-bold text-sm">Spotify Sync</h3><p className={`text-xs ${themeStyles.mutedText}`}>Control the vibe</p></div></div><button onClick={handleSpotifyConnect} className="px-4 py-2 bg-green-500 text-black font-bold rounded-full text-xs hover:bg-green-400 transition-colors flex items-center gap-2"><ExternalLink size={14} /> Connect</button></div><div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg"><iframe src={spotifyEmbedUrl} width="100%" height="152" frameBorder="0" allowFullScreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" className="bg-black/50"></iframe></div></div></div>}

        {/* LANTERNS TAB */}
        {activeTab === "lanterns" && (
          <div className="fixed inset-0 z-50 bg-[#0f0518] overflow-hidden">
            {!hasEntered && <IntroGate onStartOpen={handleStartEntry} onEnter={handleEntryComplete} />}
            <div className={`relative w-full h-full transition-opacity duration-[2000ms] ${hasEntered ? 'opacity-100' : 'opacity-0'}`}>
                <Background />
                {!showArchive && !selectedMessage && <button onClick={() => setActiveTab("home")} className="absolute top-6 left-6 z-40 p-3 rounded-full bg-white/10 text-white"><X size={22} /></button>}
                {!selectedMessage && <div className="absolute top-6 right-6 z-40"><button onClick={() => setShowArchive(true)} className="p-3 rounded-full bg-white/10 text-amber-100"><LayoutGrid size={22} /></button></div>}

                {!showArchive && (
                    <main className="w-full h-full relative overflow-hidden" onMouseMove={handleMouseMove}>
                        {/* Pointer events none on container allows clicking lanterns */}
                        <div className="absolute inset-0 top-0 -bottom-[20vh] pointer-events-none" ref={farLayerRef}>
                            {floatingLanterns.filter((m:any) => m.depth === 'far').map((msg:any) => <Lantern key={msg.id} message={msg} onClick={handleLanternClick} />)}
                        </div>
                        <div className="absolute inset-0 top-0 -bottom-[20vh] pointer-events-none" ref={midLayerRef}>
                            {floatingLanterns.filter((m:any) => m.depth === 'mid' || !m.depth).map((msg:any) => <Lantern key={msg.id} message={msg} onClick={handleLanternClick} />)}
                        </div>
                        <div className="absolute inset-0 top-0 -bottom-[20vh] pointer-events-none" ref={nearLayerRef}>
                            {floatingLanterns.filter((m:any) => m.depth === 'near').map((msg:any) => <Lantern key={msg.id} message={msg} onClick={handleLanternClick} />)}
                        </div>
                        {floatingLanterns.length === 0 && hasEntered && <div className="absolute inset-0 flex items-center justify-center text-white/30"><p>No lanterns yet...</p></div>}
                    </main>
                )}

                {/* Detail Modal */}
                {selectedMessage && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal}>
                        <div className="relative flex flex-col items-center pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                            <div className="transform scale-125"><Lantern message={selectedMessage} onClick={() => {}} isRevealed={true} /></div>
                            <div className="mt-12 flex gap-4">
                                <button onClick={handleSaveAndClose} className="px-6 py-2 bg-amber-500 text-black rounded-full">Release & Save</button>
                                <button onClick={handleCloseModal} className="px-6 py-2 bg-white/10 text-white rounded-full">Close</button>
                            </div>
                        </div>
                    </div>
                )}

                {showArchive && <ArchiveView onClose={() => setShowArchive(false)} messages={archiveLanterns} onSelectMessage={handleArchiveSelection} />}
            </div>
          </div>
        )}
      </div>

      {activeTab !== 'lanterns' && (
      <nav className={`flex-shrink-0 grid grid-cols-5 gap-2 p-3 border-t backdrop-blur-xl shadow-top ${themeStyles.navBg} ${themeStyles.border}`}>
        {[{ id: "home", icon: Home }, { id: "chat", icon: MessageSquare }, { id: "lanterns", icon: Gift, label: "Lanterns" }, { id: "gallery", icon: ImageIcon }, { id: "guests", icon: Users }].map(({ id, icon: Icon, label }) => (
          <button key={id} onClick={() => onNavClick(id)} className={`flex flex-col items-center justify-center gap-1.5 p-2 rounded-xl text-xs transition-all ${activeTab === id ? themeStyles.navActive : `${themeStyles.mutedText} hover:bg-white/5`}`}>
            <Icon size={20} />
            <span className="capitalize text-[10px] font-semibold">{label || id}</span>
          </button>
        ))}
      </nav>
      )}
    </div>
  );
};

export default CoupleDashboard;