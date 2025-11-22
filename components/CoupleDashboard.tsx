import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Heart, Music, LogOut, Send, Play, Pause, SkipForward, SkipBack, Image as ImageIcon, RefreshCw, Users, Crown, Radio, Megaphone, Gift, X, CheckCircle } from 'lucide-react';
import { useTheme, ThemeConfig } from '../ThemeContext';
import { useAppData, Lantern, Song } from '../AppContext';

// --- Theme Mappings ---
const THEME_BASES: Record<string, string> = {
    royal: 'bg-[#4a0404]',
    midnight: 'bg-[#020617]', 
    sunset: 'bg-[#2a0a18]',
    lavender: 'bg-[#2e1065]',
    forest: 'bg-[#052e16]',
};

const THEME_STYLES: Record<string, any> = {
    royal: {
        text: 'text-pink-100',
        mutedText: 'text-pink-300',
        accent: 'text-pink-400',
        border: 'border-pink-500/20',
        headerBg: 'bg-passion-900/10',
        navBg: 'bg-passion-900/90',
        inputBg: 'bg-passion-900/90',
        inputInner: 'bg-black/40',
        userBubble: 'bg-white text-passion-900',
        otherBubble: 'bg-black/40 border border-pink-500/30 text-pink-100',
        button: 'bg-pink-600',
        iconActive: 'text-pink-500',
        navActive: 'bg-pink-600 text-white shadow-lg',
        crownBg: 'bg-passion-700',
        crownIcon: 'bg-pink-500'
    },
    midnight: {
        text: 'text-blue-100',
        mutedText: 'text-blue-300',
        accent: 'text-blue-400',
        border: 'border-blue-500/20',
        headerBg: 'bg-slate-900/10',
        navBg: 'bg-slate-900/90',
        inputBg: 'bg-slate-900/90',
        inputInner: 'bg-slate-950/60',
        userBubble: 'bg-white text-slate-900',
        otherBubble: 'bg-slate-800/60 border border-blue-500/30 text-blue-100',
        button: 'bg-blue-600',
        iconActive: 'text-blue-500',
        navActive: 'bg-blue-600 text-white shadow-lg',
        crownBg: 'bg-slate-800',
        crownIcon: 'bg-blue-500'
    },
    sunset: {
        text: 'text-orange-50',
        mutedText: 'text-orange-200',
        accent: 'text-orange-400',
        border: 'border-orange-500/20',
        headerBg: 'bg-[#2a0a18]/10',
        navBg: 'bg-[#2a0a18]/90',
        inputBg: 'bg-[#2a0a18]/90',
        inputInner: 'bg-black/40',
        userBubble: 'bg-white text-orange-900',
        otherBubble: 'bg-purple-900/40 border border-orange-500/30 text-orange-100',
        button: 'bg-orange-600',
        iconActive: 'text-orange-500',
        navActive: 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-lg',
        crownBg: 'bg-[#4a0404]',
        crownIcon: 'bg-orange-500'
    },
    lavender: {
        text: 'text-purple-100',
        mutedText: 'text-purple-300',
        accent: 'text-purple-400',
        border: 'border-purple-500/20',
        headerBg: 'bg-purple-900/10',
        navBg: 'bg-purple-900/90',
        inputBg: 'bg-purple-900/90',
        inputInner: 'bg-black/40',
        userBubble: 'bg-white text-purple-900',
        otherBubble: 'bg-purple-950/60 border border-purple-500/30 text-purple-100',
        button: 'bg-purple-600',
        iconActive: 'text-purple-400',
        navActive: 'bg-purple-600 text-white shadow-lg',
        crownBg: 'bg-purple-950',
        crownIcon: 'bg-violet-500'
    },
    forest: {
        text: 'text-emerald-100',
        mutedText: 'text-emerald-300',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/20',
        headerBg: 'bg-emerald-900/10',
        navBg: 'bg-emerald-900/90',
        inputBg: 'bg-emerald-900/90',
        inputInner: 'bg-black/40',
        userBubble: 'bg-white text-emerald-900',
        otherBubble: 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-100',
        button: 'bg-emerald-600',
        iconActive: 'text-emerald-400',
        navActive: 'bg-emerald-600 text-white shadow-lg',
        crownBg: 'bg-emerald-950',
        crownIcon: 'bg-teal-500'
    }
};

// --- Visual Effects Components ---

const Fireflies = () => {
  // Generate static random positions once
  const [flies] = useState(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 2, // 2-5px
    duration: Math.random() * 10 + 10, // 10-20s
    delay: Math.random() * 5
  })));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {flies.map((f) => (
        <div
          key={f.id}
          className="absolute rounded-full bg-yellow-200 shadow-[0_0_8px_rgba(253,224,71,0.8)] animate-pulse"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: `${f.size}px`,
            height: `${f.size}px`,
            opacity: 0.7,
            // Assumes you have a global float animation, otherwise standard pulse works nicely
            animation: `pulse ${f.duration/5}s infinite ease-in-out alternate`, 
            transform: `translate(${Math.sin(f.id) * 20}px, ${Math.cos(f.id) * 20}px)` // Minor offset
          }}
        />
      ))}
    </div>
  );
};

const Petals = () => {
  const [petals] = useState(() => Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 5,
    duration: Math.random() * 5 + 5
  })));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {petals.map((p) => (
        <div
          key={p.id}
          className="absolute bg-pink-300/40 rounded-tl-xl rounded-br-xl w-3 h-3 animate-bounce"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            animation: `fall ${p.duration}s linear infinite`, // Ensure you have 'fall' keyframes or use standard bounce
            animationDelay: `${p.delay}s`
          }}
        />
      ))}
    </div>
  );
};

const Lights = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden bg-gradient-to-b from-transparent via-transparent to-black/20">
     <div className="absolute top-0 left-1/4 w-px h-32 bg-gradient-to-b from-white/0 via-white/40 to-white/0 opacity-50"></div>
     <div className="absolute top-0 right-1/3 w-px h-48 bg-gradient-to-b from-white/0 via-white/30 to-white/0 opacity-30"></div>
     <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)] animate-pulse"></div>
  </div>
);

// --- 🔥 UPDATED ATMOSPHERE COMPONENT ---
const Atmosphere = ({ theme }: { theme: ThemeConfig }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000">
    
    {/* Base Gradient Overlay */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40 z-0" />

    {/* Effect Layers */}
    {theme.effect === 'dust' && (
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 animate-pulse" />
    )}
    
    {theme.effect === 'fireflies' && <Fireflies />}
    
    {theme.effect === 'petals' && <Petals />}
    
    {theme.effect === 'lights' && <Lights />}

  </div>
);

// Generate deterministic random number from string seed
const getStableRandom = (seed: string) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = Math.sin(hash) * 10000;
    return x - Math.floor(x);
};

// Add visual properties to lantern
const enrichLantern = (lantern: Lantern): Lantern & { left: number, speed: number, delay: number } => {
    const r1 = getStableRandom(lantern.id + 'pos');
    const r2 = getStableRandom(lantern.id + 'spd');
    const r3 = getStableRandom(lantern.id + 'dly');
    
    return {
        ...lantern,
        // Deterministic visual props
        left: Math.floor(r1 * 90), // 0-90%
        speed: 15 + Math.floor(r2 * 20), // 15-35s
        delay: Math.floor(r3 * -20) // -20s to 0s
    } as any;
};

interface CoupleDashboardProps {
  userName: string;
  onLogout: () => void;
}

const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ userName, onLogout }) => {
  // 🔥 SYNC: Using global state instead of local state
  const { 
      messages, heartCount, gallery, guestList, lanterns, announcement, currentSong, isPlaying,
      sendMessage, updatePlaylistState, refreshData
  } = useAppData();

  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'gallery' | 'guests' | 'music' | 'lanterns'>('home');
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  
  // Local Music Queue (Static for now)
  const [playlist] = useState<Song[]>([
      { id: '1', title: 'Perfect', artist: 'Ed Sheeran', album: 'Divide', durationStr: '4:23', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/4/45/Divide_cover.png' },
      { id: '2', title: 'All of Me', artist: 'John Legend', album: 'Love in the Future', durationStr: '4:29', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/6/65/John_Legend_-_All_of_Me_%28single%29.jpg' },
      { id: '3', title: 'A Thousand Years', artist: 'Christina Perri', album: 'Twilight', durationStr: '4:45', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/4/42/A_Thousand_Years_%28Christina_Perri_song%29_cover.jpg' },
  ]);

  const [selectedLantern, setSelectedLantern] = useState<Lantern | null>(null);

  const themeStyles = THEME_STYLES[theme.gradient] || THEME_STYLES.royal;

  // Initialize music if empty
  useEffect(() => {
      refreshData();
      if (!currentSong && playlist.length > 0) {
          // Don't auto-play, just set the first song
          updatePlaylistState(playlist[0], false);
      }
  }, []);

  useEffect(() => {
      if (activeTab === 'chat' && chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [messages, activeTab]);

  const togglePlay = () => {
      // 🔥 SYNC: Broadcast play/pause to everyone
      if (currentSong) {
          updatePlaylistState(currentSong, !isPlaying);
      }
  };

  const playSong = (song: Song) => {
      // 🔥 SYNC: Broadcast new song to everyone
      updatePlaylistState(song, true);
  };

  const handleSendMessage = (text: string) => {
      if (!text.trim()) return;
      // 🔥 SYNC: Broadcast message
      sendMessage(text, undefined, userName, true);
      setChatInput("");
  };

  const handleClearCache = () => {
    if(confirm("Reset app data and reload?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className={`w-full h-full ${themeStyles.text} font-serif flex flex-col relative overflow-hidden transition-all duration-1000 ${THEME_BASES[theme.gradient] || THEME_BASES.royal}`}>
        
        {/* Background Effects */}
        <Atmosphere theme={theme} />

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

        {/* Content Area */}
        <main className="flex-grow overflow-hidden relative z-10">
            {activeTab === 'home' && (
                <div className="h-full overflow-y-auto p-6 animate-fade-in">
                     
                     {/* Announcement Banner */}
                     {announcement && (
                         <div className={`w-full p-4 rounded-2xl border shadow-lg flex items-start gap-3 mb-6 animate-fade-in-up ${themeStyles.button} ${themeStyles.border}`}>
                             <div className="bg-white/20 p-2 rounded-full shrink-0">
                                 <Megaphone size={18} className="text-white animate-pulse"/>
                             </div>
                             <div className="text-left">
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
                     
                     {/* Adore Meter Display */}
                     <div className={`p-6 rounded-3xl border border-white/20 flex items-center justify-between mb-8 relative overflow-hidden shadow-glow group ${themeStyles.crownBg}`}>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10">
                              <h3 className="text-white font-bold text-lg mb-1">Love Showered</h3>
                              <p className={`text-xs uppercase tracking-widest ${themeStyles.mutedText}`}>Hearts Received</p>
                          </div>
                          <div className="text-5xl font-bold text-white flex items-center gap-2 relative z-10 font-romantic">
                              {heartCount} 
                          </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => setActiveTab('guests')} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                             <Users size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`}/>
                             <span className={`text-sm font-bold ${themeStyles.text}`}>Guest List</span>
                         </button>
                         <button onClick={() => setActiveTab('chat')} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                             <MessageSquare size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`}/>
                             <span className={`text-sm font-bold ${themeStyles.text}`}>Read Wishes</span>
                         </button>
                         <button onClick={() => setActiveTab('gallery')} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                             <ImageIcon size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`}/>
                             <span className={`text-sm font-bold ${themeStyles.text}`}>Photo Album</span>
                         </button>
                         <button onClick={() => setActiveTab('lanterns')} className={`p-6 bg-white/5 rounded-2xl border hover:bg-white/10 hover:border-white/50 transition-all flex flex-col items-center gap-3 group ${themeStyles.border}`}>
                             <Gift size={32} className={`group-hover:scale-110 transition-transform ${themeStyles.iconActive}`}/>
                             <span className={`text-sm font-bold ${themeStyles.text}`}>Lantern Sky</span>
                         </button>
                     </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="flex flex-col h-full relative">
                    <div ref={chatScrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl shadow-md ${msg.sender === userName ? `${themeStyles.userBubble} font-bold shadow-glow` : `${themeStyles.otherBubble}`}`}>
                                    {!msg.sender.includes(userName) && <p className={`text-[10px] font-bold mb-1 uppercase tracking-wider ${themeStyles.accent}`}>{msg.sender}</p>}
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 p-4 border-t pb-safe backdrop-blur-md ${themeStyles.inputBg} ${themeStyles.border}`}>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Send love back..." 
                                className={`flex-grow border rounded-full px-5 text-white focus:outline-none focus:border-white/50 ${themeStyles.inputInner} ${themeStyles.border}`}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                            />
                            <button onClick={() => handleSendMessage(chatInput)} className={`p-3 rounded-full text-white shadow-lg hover:brightness-110 transform active:scale-95 transition-transform ${themeStyles.button}`}><Send size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'gallery' && (
                <div className="h-full overflow-y-auto p-4 pb-24">
                     <h2 className="text-2xl font-romantic text-white mb-4">Shared Moments</h2>
                     <div className="grid grid-cols-3 gap-3">
                         {gallery.map(p => (
                             <div key={p.id} className={`relative aspect-square rounded-lg overflow-hidden group bg-black/40 border ${themeStyles.border}`}>
                                 <img src={p.url} className="w-full h-full object-cover" loading="lazy" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <p className="text-white text-xs truncate font-bold">{p.caption}</p>
                                     <span className={`text-[9px] ${themeStyles.mutedText}`}>{p.sender}</span>
                                 </div>
                             </div>
                         ))}
                         {gallery.length === 0 && (
                             <div className={`col-span-3 flex flex-col items-center justify-center py-20 gap-2 ${themeStyles.mutedText}`}>
                                 <ImageIcon size={32} className="opacity-50"/>
                                 <p className="text-sm">Your album is empty.</p>
                             </div>
                         )}
                     </div>
                </div>
            )}

            {/* Lantern Sky Tab */}
            {activeTab === 'lanterns' && (
                <div className="absolute inset-0 bg-slate-950 overflow-hidden z-50">
                    {/* Stars */}
                    <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                    
                    {/* Close Button */}
                    <button onClick={() => setActiveTab('home')} className="absolute top-4 right-4 z-50 p-2 bg-white/10 rounded-full hover:bg-white/20 text-white transition-all">
                        <X size={24} />
                    </button>

                    {lanterns.length === 0 ? (
                        <div className="absolute inset-0 flex items-center justify-center text-white/50 flex-col gap-4">
                            <Gift size={48} className="opacity-30" />
                            <p className="font-serif italic">Waiting for the first lantern to rise...</p>
                        </div>
                    ) : (
                        <div className="absolute inset-0">
                            {lanterns.map((l) => {
                                const enriched = enrichLantern(l);
                                return (
                                <div 
                                    key={l.id}
                                    onClick={() => setSelectedLantern(l)}
                                    className="absolute cursor-pointer hover:scale-125 transition-transform z-20 flex flex-col items-center"
                                    style={{
                                        left: `${enriched.left}%`,
                                        animation: `float-up ${enriched.speed}s linear infinite`,
                                        animationDelay: `${enriched.delay}s`,
                                        top: '100%' // Start below screen (animation moves it up)
                                    }}
                                >
                                    <div className="w-8 h-12 bg-gradient-to-t from-orange-600 to-yellow-200 rounded-t-xl rounded-b-sm shadow-[0_0_20px_rgba(249,115,22,0.8)] opacity-90 animate-pulse"></div>
                                    <div className="w-1 h-10 bg-white/10"></div>
                                </div>
                            )})}
                        </div>
                    )}

                    {/* Lantern Detail Modal */}
                    {selectedLantern && (
                        <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                            <div className="bg-gradient-to-b from-slate-900 to-black border border-orange-500/30 p-8 rounded-2xl max-w-sm w-full relative shadow-[0_0_50px_rgba(249,115,22,0.2)] animate-zoom-in">
                                <button onClick={() => setSelectedLantern(null)} className="absolute top-4 right-4 text-white/50 hover:text-white"><X size={20}/></button>
                                
                                <div className="w-16 h-16 mx-auto bg-orange-500/20 rounded-full flex items-center justify-center mb-4 shadow-glow">
                                    <Gift className="text-orange-400" size={32} />
                                </div>
                                
                                <h3 className="text-center font-romantic text-2xl text-orange-100 mb-2">A Wish from {selectedLantern.sender}</h3>
                                <div className="w-10 h-1 bg-orange-500/50 mx-auto mb-6 rounded-full"></div>
                                
                                <p className="text-center font-serif text-lg text-white leading-relaxed italic">
                                    "{selectedLantern.message}"
                                </p>
                                
                                <div className="mt-8 text-center text-[10px] uppercase tracking-widest text-orange-500/50">
                                    Sent {new Date(selectedLantern.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'guests' && (
                 <div className="h-full overflow-y-auto p-4 pb-24">
                      <h2 className="text-2xl font-romantic text-white mb-4">Guest List</h2>
                      <div className={`bg-white/5 rounded-2xl border divide-y divide-white/5 overflow-hidden ${themeStyles.border}`}>
                          {guestList.map((g, i) => (
                              <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/5">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${g.role === 'couple' ? 'bg-white text-black' : `bg-white/10 ${themeStyles.text}`}`}>
                                      {g.name.charAt(0)}
                                  </div>
                                  <div>
                                      <h3 className={`font-bold ${themeStyles.text} flex items-center gap-2`}>
                                          {g.name}
                                          {g.rsvp && (
                                              <span className="text-green-400 text-[10px] flex items-center gap-1 border border-green-500/30 px-1.5 py-0.5 rounded-full bg-green-500/10" title="RSVP Confirmed">
                                                  <CheckCircle size={10} /> Attending
                                              </span>
                                          )}
                                      </h3>
                                      <div className={`text-[10px] uppercase tracking-widest ${themeStyles.mutedText}`}>{g.role}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                 </div>
            )}

            {activeTab === 'music' && (
                <div className="h-full overflow-y-auto p-6 animate-fade-in pb-32">
                    <h2 className="text-3xl font-romantic text-white mb-6 text-center">Mood Controller</h2>
                    
                    {/* Now Playing Card */}
                    <div className={`bg-gradient-to-b from-black/20 to-black/60 p-6 rounded-3xl border shadow-2xl mb-8 flex flex-col items-center relative overflow-hidden group ${themeStyles.border}`}>
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                         <div className={`w-48 h-48 rounded-full border-4 shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-6 relative ${isPlaying ? 'animate-spin-slow' : ''} ${themeStyles.border}`}>
                             <img src={currentSong?.cover} className="w-full h-full object-cover rounded-full" />
                             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 to-transparent"></div>
                             <div className={`absolute w-8 h-8 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-white ${themeStyles.crownBg}`}></div>
                         </div>
                         
                         <div className="text-center mb-6 relative z-10">
                             <h3 className="text-xl font-bold text-white">{currentSong?.title}</h3>
                             <p className={`text-sm ${themeStyles.mutedText}`}>{currentSong?.artist}</p>
                         </div>

                         <div className="flex items-center gap-8 relative z-10">
                             <button className={`${themeStyles.mutedText} hover:text-white transition-colors`}><SkipBack size={32} /></button>
                             <button 
                                onClick={togglePlay}
                                className={`w-20 h-20 rounded-full text-white flex items-center justify-center shadow-glow-lg hover:scale-105 transition-transform active:scale-95 hover:brightness-110 ${themeStyles.button}`}
                             >
                                 {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                             </button>
                             <button className={`${themeStyles.mutedText} hover:text-white transition-colors`}><SkipForward size={32} /></button>
                         </div>
                         <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400 uppercase tracking-widest font-bold bg-black/50 px-3 py-1 rounded-full">
                             <Radio size={10} className={isPlaying ? "animate-pulse" : ""} /> {isPlaying ? "Broadcasting to Guests" : "Paused"}
                         </div>
                    </div>

                    {/* Queue */}
                    <div className="space-y-3">
                        <h3 className={`text-xs uppercase tracking-widest font-bold mb-2 ml-1 ${themeStyles.accent}`}>Romantic Selection</h3>
                        {playlist.map((song, i) => (
                            <div 
                                key={song.id} 
                                onClick={() => playSong(song)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${currentSong?.id === song.id ? `bg-white/10 ${themeStyles.border}` : 'bg-black/20 border-transparent hover:bg-white/5'}`}
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden">
                                    <img src={song.cover} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className={`font-bold text-sm ${currentSong?.id === song.id ? 'text-white' : 'text-stone-300'}`}>{song.title}</h4>
                                    <p className="text-xs text-stone-500">{song.artist}</p>
                                </div>
                                <div className="text-xs text-stone-500">{song.durationStr}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>

        {/* Navigation */}
        <nav className={`flex-shrink-0 p-2 border-t flex justify-around z-20 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.4)] backdrop-blur-lg ${themeStyles.navBg} ${themeStyles.border}`}>
             {[
                 { id: 'home', icon: Home, label: 'Home' },
                 { id: 'chat', icon: MessageSquare, label: 'Chat' },
                 { id: 'lanterns', icon: Gift, label: 'Gifts' },
                 { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
                 { id: 'music', icon: Music, label: 'Music' },
             ].map(item => (
                 <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${activeTab === item.id ? themeStyles.navActive : `${themeStyles.mutedText}`}`}
                  >
                     <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                     <span className="text-[8px] uppercase tracking-widest font-bold">{item.label}</span>
                 </button>
             ))}
        </nav>
    </div>
  );
};

export default CoupleDashboard;