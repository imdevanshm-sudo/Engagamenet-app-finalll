
import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Heart, Music, LogOut, Send, Play, Pause, SkipForward, SkipBack, Image as ImageIcon, RefreshCw, Users, Crown, Radio, Megaphone } from 'lucide-react';
import { socket } from '../socket';
import { useTheme, ThemeConfig } from '../ThemeContext';

// --- Types ---
interface Message {
    id: string;
    text?: string;
    sender: string;
    isCouple: boolean;
    timestamp: string;
    type: 'text' | 'sticker';
}

interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
    timestamp: number;
    sender: string;
}

interface GuestEntry {
    name: string;
    role: 'guest' | 'couple' | 'admin';
    joinedAt: number;
}

interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover: string;
    album: string;
    durationStr: string;
}

const THEME_BASES = {
    royal: 'bg-[#4a0404]',
    midnight: 'bg-[#020617]', 
    sunset: 'bg-[#2a0a18]',
    lavender: 'bg-[#2e1065]',
    forest: 'bg-[#052e16]',
};

const Atmosphere = ({ theme }: { theme: ThemeConfig }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000">
            
            {/* --- THEME: MIDNIGHT (Cinematic Cool) --- */}
            {theme.gradient === 'midnight' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0f172a] to-black"></div>
                    <div className="absolute top-1/4 -left-1/2 w-[200%] h-[1px] bg-blue-400/30 blur-md rotate-[-10deg] animate-pulse-slow"></div>
                    <div className="absolute bottom-1/3 -left-1/2 w-[200%] h-[2px] bg-teal-500/20 blur-xl rotate-[5deg] animate-float"></div>
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-800/20 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>
                    <div className="absolute inset-0 opacity-[0.04]" 
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
                    </div>
                    {[...Array(15)].map((_, i) => (
                        <div key={`star-${i}`} 
                             className="absolute rounded-full bg-blue-100 animate-pulse-slow"
                             style={{
                                 top: `${Math.random() * 100}%`,
                                 left: `${Math.random() * 100}%`,
                                 width: `${Math.random() * 2 + 1}px`,
                                 height: `${Math.random() * 2 + 1}px`,
                                 animationDelay: `${Math.random() * 4}s`,
                                 opacity: Math.random() * 0.7 + 0.3
                             }}
                        />
                    ))}
                </>
            )}

            {/* --- THEME: ROYAL (3D Romantic Red) --- */}
            {theme.gradient === 'royal' && (
                <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#be123c_0%,_#881337_40%,_#4c0519_80%,_#000000_100%)]"></div>
                    <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] animate-float mix-blend-screen"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-900/40 rounded-full blur-[120px] animate-float" style={{animationDelay: '-3s', animationDuration: '10s'}}></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-rose-400/10 to-transparent opacity-60 animate-pulse-slow"></div>
                    <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    {[...Array(10)].map((_, i) => (
                        <div key={`gold-${i}`} className="absolute rounded-full bg-amber-400 animate-float"
                             style={{
                                 left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                 width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`,
                                 opacity: Math.random() * 0.5 + 0.2, animationDuration: `${Math.random() * 8 + 12}s`,
                                 boxShadow: '0 0 8px 1px rgba(251, 191, 36, 0.3)'
                             }}></div>
                    ))}
                </>
            )}

            {/* --- THEME: SUNSET (Living Art) --- */}
            {theme.gradient === 'sunset' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#4c1d95] via-[#be185d] to-[#fb923c]"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-20 left-1/4 w-72 h-72 bg-orange-500/30 rounded-full blur-[60px] animate-float"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[400px] bg-pink-600/30 rounded-full blur-[80px] animate-pulse-slow"></div>
                </>
            )}

            {/* --- THEME: LAVENDER (Soft Mist) --- */}
            {theme.gradient === 'lavender' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-violet-950 to-black"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#e879f9_0%,_transparent_50%)] opacity-20"></div>
                    {[...Array(6)].map((_, i) => (
                         <div key={`mist-${i}`} className="absolute bg-purple-400/10 rounded-full blur-[100px] animate-float"
                              style={{
                                  left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                                  width: '400px', height: '400px',
                                  animationDelay: `${i * -2}s`, animationDuration: '15s'
                              }}></div>
                    ))}
                </>
            )}

            {/* --- THEME: FOREST (Enchanted) --- */}
            {theme.gradient === 'forest' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-[#022c22] to-black"></div>
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay"></div>
                </>
            )}

            {theme.effect !== 'none' && (
                <div className="absolute inset-0 z-0">
                     {theme.effect === 'petals' && [...Array(12)].map((_, i) => (
                         <div key={`petal-${i}`} className="absolute bg-rose-300/40 rounded-[100%_0%_100%_0%] animate-float shadow-sm"
                              style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 120}%`,
                                  width: `${Math.random() * 15 + 8}px`,
                                  height: `${Math.random() * 15 + 8}px`,
                                  animationDuration: `${Math.random() * 10 + 15}s`,
                                  animationDelay: `${Math.random() * -5}s`,
                                  transform: `rotate(${Math.random() * 360}deg)`
                              }}></div>
                     ))}
                     {theme.effect === 'dust' && (
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                     )}
                     {theme.effect === 'lights' && (
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 animate-shimmer" style={{ backgroundSize: '200% 200%' }}></div>
                     )}
                     {theme.effect === 'fireflies' && [...Array(25)].map((_, i) => (
                         <div key={`fly-${i}`} className="absolute bg-yellow-300 rounded-full animate-float shadow-[0_0_8px_2px_rgba(253,224,71,0.4)]"
                              style={{
                                  left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                                  width: `${Math.random()*3+1}px`, height: `${Math.random()*3+1}px`,
                                  animationDuration: `${Math.random()*5+5}s`, opacity: Math.random() * 0.8
                              }}></div>
                     ))}
                </div>
            )}
        </div>
    );
};

interface CoupleDashboardProps {
  userName: string;
  onLogout: () => void;
}

const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'gallery' | 'guests' | 'music'>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [heartCount, setHeartCount] = useState(0);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const { theme } = useTheme();
  
  // Music State
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- Persistence Effects ---
  useEffect(() => {
    try {
        localStorage.setItem('wedding_chat_messages', JSON.stringify(messages));
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('wedding_heart_count', heartCount.toString());
  }, [heartCount]);

  // --- Initial Data Load ---
  useEffect(() => {
      // Local Storage Init
      const msgs = localStorage.getItem('wedding_chat_messages');
      if (msgs) setMessages(JSON.parse(msgs));
      
      const hearts = localStorage.getItem('wedding_heart_count');
      if (hearts) setHeartCount(parseInt(hearts));

      // Romantic Playlist
      const pl = [
          { id: '1', title: 'Perfect', artist: 'Ed Sheeran', album: 'Divide', durationStr: '4:23', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/4/45/Divide_cover.png' },
          { id: '2', title: 'All of Me', artist: 'John Legend', album: 'Love in the Future', durationStr: '4:29', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/6/65/John_Legend_-_All_of_Me_%28single%29.jpg' },
          { id: '3', title: 'A Thousand Years', artist: 'Christina Perri', album: 'Twilight', durationStr: '4:45', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/4/42/A_Thousand_Years_%28Christina_Perri_song%29_cover.jpg' },
      ];
      setPlaylist(pl);
      setCurrentSong(pl[0]);

      // Socket Setup
      socket.emit('request_sync');

      const handleFullSync = (state: any) => {
          setMessages(state.messages || []);
          setGallery(state.gallery || []);
          setHeartCount(state.heartCount || 0);
          setGuestList(state.guestList || []);
          if(state.announcement) setAnnouncement(state.announcement);
          if(state.currentSong) {
              setCurrentSong(state.currentSong);
              setIsPlaying(state.isPlaying);
          }
      };

      socket.on('full_sync', handleFullSync);
      socket.on('message', (data) => setMessages(prev => {
          if (prev.some(m => m.id === data.payload.id)) return prev;
          return [...prev, data.payload];
      }));
      socket.on('heart_update', (data) => setHeartCount(data.count));
      socket.on('gallery_sync', (data) => setGallery(data.payload));
      socket.on('user_presence', (data) => setGuestList(prev => [...prev.filter(g => g.name !== data.payload.name), data.payload]));
      socket.on('announcement', (data) => setAnnouncement(data.message));
      
      return () => {
          socket.off('full_sync');
          socket.off('message');
          socket.off('heart_update');
          socket.off('gallery_sync');
          socket.off('user_presence');
          socket.off('announcement');
      };
  }, []);

  useEffect(() => {
      if (activeTab === 'chat' && chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [messages, activeTab]);

  // --- Music Controls with Broadcast ---
  const togglePlay = () => {
      const newState = !isPlaying;
      setIsPlaying(newState);
      socket.emit('playlist_update', { currentSong, isPlaying: newState });
  };

  const playSong = (song: Song) => {
      setCurrentSong(song);
      setIsPlaying(true);
      socket.emit('playlist_update', { currentSong: song, isPlaying: true });
  };

  const handleSendMessage = (text: string) => {
      if (!text.trim()) return;
      const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          text,
          sender: userName,
          isCouple: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
      };
      
      // Optimistic
      setMessages(prev => [...prev, newMessage]);
      socket.emit('message', newMessage);
      setChatInput("");
  };

  const handleClearCache = () => {
    if(confirm("Reset app data and reload?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className={`w-full h-full text-pink-100 font-serif flex flex-col relative overflow-hidden transition-all duration-1000 ${THEME_BASES[theme.gradient] || THEME_BASES.royal}`}>
        
        {/* Background Effects */}
        <Atmosphere theme={theme} />

        {/* Header */}
        <header className="flex-shrink-0 p-4 flex justify-between items-center z-20 border-b border-pink-500/20 bg-passion-900/10 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white p-0.5 bg-passion-700 shadow-glow">
                    <div className="w-full h-full rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        <Crown size={20} fill="white" />
                    </div>
                </div>
                <div>
                    <h1 className="font-romantic text-2xl text-white drop-shadow-md">The Happy Couple</h1>
                    <p className="text-[10px] text-pink-300 uppercase tracking-widest">Control Room</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={handleClearCache} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-pink-300 transition-colors" title="Reset App">
                     <RefreshCw size={18} />
                 </button>
                 <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-lg text-pink-300 hover:text-white transition-colors">
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
                         <div className="w-full bg-gradient-to-r from-passion-600/80 to-pink-600/80 p-4 rounded-2xl border border-pink-400/30 shadow-lg flex items-start gap-3 mb-6 animate-fade-in-up">
                             <div className="bg-white/20 p-2 rounded-full shrink-0">
                                 <Megaphone size={18} className="text-white animate-pulse"/>
                             </div>
                             <div className="text-left">
                                 <h4 className="text-xs font-bold uppercase text-pink-200 tracking-widest mb-1">Latest News</h4>
                                 <p className="text-sm text-white font-serif leading-snug">{announcement}</p>
                             </div>
                         </div>
                     )}

                     <div className="text-center my-6">
                         <Heart size={48} className="text-pink-500 mx-auto mb-4 animate-heartbeat fill-pink-500/50" />
                         <h2 className="text-4xl font-romantic text-pink-100 mb-2 drop-shadow-md">Welcome, Lovebirds</h2>
                         <p className="text-pink-300 text-sm italic">Your love story is unfolding perfectly.</p>
                     </div>
                     
                     {/* Adore Meter Display */}
                     <div className="bg-gradient-to-r from-passion-700 to-pink-600 p-6 rounded-3xl border border-white/20 flex items-center justify-between mb-8 relative overflow-hidden shadow-glow group">
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10">
                              <h3 className="text-white font-bold text-lg mb-1">Love Showered</h3>
                              <p className="text-xs text-pink-100/80 uppercase tracking-widest">Hearts Received</p>
                          </div>
                          <div className="text-5xl font-bold text-white flex items-center gap-2 relative z-10 font-romantic">
                              {heartCount} 
                          </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => setActiveTab('guests')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <Users size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">Guest List</span>
                         </button>
                         <button onClick={() => setActiveTab('chat')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <MessageSquare size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">Read Wishes</span>
                         </button>
                         <button onClick={() => setActiveTab('gallery')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <ImageIcon size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">Photo Album</span>
                         </button>
                         <button onClick={() => setActiveTab('music')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <Music size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">DJ Control</span>
                         </button>
                     </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="flex flex-col h-full relative">
                    <div ref={chatScrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl shadow-md ${msg.sender === userName ? 'bg-white text-passion-900 font-bold' : 'bg-black/40 border border-pink-500/30 text-pink-100'}`}>
                                    {!msg.sender.includes(userName) && <p className="text-[10px] text-pink-400 font-bold mb-1 uppercase tracking-wider">{msg.sender}</p>}
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-passion-900/90 border-t border-pink-500/20 pb-safe">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Send love back..." 
                                className="flex-grow bg-black/30 border border-pink-500/30 rounded-full px-5 text-white focus:outline-none focus:border-pink-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                            />
                            <button onClick={() => handleSendMessage(chatInput)} className="p-3 bg-pink-600 rounded-full text-white shadow-lg hover:bg-pink-500 transform active:scale-95 transition-transform"><Send size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'gallery' && (
                <div className="h-full overflow-y-auto p-4 pb-24">
                     <h2 className="text-2xl font-romantic text-white mb-4">Shared Moments</h2>
                     <div className="grid grid-cols-3 gap-3">
                         {gallery.map(p => (
                             <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group bg-black/40 border border-pink-500/20">
                                 <img src={p.url} className="w-full h-full object-cover" loading="lazy" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <p className="text-white text-xs truncate font-bold">{p.caption}</p>
                                     <span className="text-[9px] text-pink-300">{p.sender}</span>
                                 </div>
                             </div>
                         ))}
                         {gallery.length === 0 && (
                             <div className="col-span-3 flex flex-col items-center justify-center py-20 text-pink-300/50 gap-2">
                                 <ImageIcon size={32} className="opacity-50"/>
                                 <p className="text-sm">Your album is empty.</p>
                             </div>
                         )}
                     </div>
                </div>
            )}

            {activeTab === 'guests' && (
                 <div className="h-full overflow-y-auto p-4 pb-24">
                      <h2 className="text-2xl font-romantic text-white mb-4">Guest List</h2>
                      <div className="bg-white/5 rounded-2xl border border-pink-500/20 divide-y divide-pink-500/10 overflow-hidden">
                          {guestList.map((g, i) => (
                              <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/5">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${g.role === 'couple' ? 'bg-white text-passion-900' : 'bg-passion-800 text-pink-200'}`}>
                                      {g.name.charAt(0)}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-pink-100">{g.name}</h3>
                                      <div className="text-[10px] text-pink-400 uppercase tracking-widest">{g.role}</div>
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
                    <div className="bg-gradient-to-b from-passion-700 to-black/60 p-6 rounded-3xl border border-pink-500/30 shadow-2xl mb-8 flex flex-col items-center relative overflow-hidden group">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                         <div className={`w-48 h-48 rounded-full border-4 border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.4)] mb-6 relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                             <img src={currentSong?.cover} className="w-full h-full object-cover rounded-full" />
                             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 to-transparent"></div>
                             <div className="absolute w-8 h-8 bg-passion-900 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-pink-500"></div>
                         </div>
                         
                         <div className="text-center mb-6 relative z-10">
                             <h3 className="text-xl font-bold text-white">{currentSong?.title}</h3>
                             <p className="text-pink-300 text-sm">{currentSong?.artist}</p>
                         </div>

                         <div className="flex items-center gap-8 relative z-10">
                             <button className="text-pink-400 hover:text-white transition-colors"><SkipBack size={32} /></button>
                             <button 
                                onClick={togglePlay}
                                className="w-20 h-20 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-glow-lg hover:scale-105 transition-transform active:scale-95 hover:bg-pink-500"
                             >
                                 {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                             </button>
                             <button className="text-pink-400 hover:text-white transition-colors"><SkipForward size={32} /></button>
                         </div>
                         <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400 uppercase tracking-widest font-bold bg-black/50 px-3 py-1 rounded-full">
                             <Radio size={10} className={isPlaying ? "animate-pulse" : ""} /> {isPlaying ? "Broadcasting to Guests" : "Paused"}
                         </div>
                    </div>

                    {/* Queue */}
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2 ml-1">Romantic Selection</h3>
                        {playlist.map((song, i) => (
                            <div 
                                key={song.id} 
                                onClick={() => playSong(song)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${currentSong?.id === song.id ? 'bg-white/10 border-pink-500' : 'bg-black/20 border-transparent hover:bg-white/5'}`}
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden">
                                    <img src={song.cover} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className={`font-bold text-sm ${currentSong?.id === song.id ? 'text-pink-200' : 'text-stone-300'}`}>{song.title}</h4>
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
        <nav className="flex-shrink-0 p-2 bg-passion-900/90 border-t border-pink-500/20 flex justify-around z-20 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.4)] backdrop-blur-lg">
             {[
                 { id: 'home', icon: Home, label: 'Home' },
                 { id: 'chat', icon: MessageSquare, label: 'Chat' },
                 { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
                 { id: 'music', icon: Music, label: 'Music' },
             ].map(item => (
                 <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all ${activeTab === item.id ? 'bg-pink-600 text-white -translate-y-1 shadow-lg' : 'text-pink-400/60'}`}
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
