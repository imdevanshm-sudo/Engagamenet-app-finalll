
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, MessageSquare, Heart, Camera, LogOut, Sparkles, Send, 
  Smile, Upload, Music, Search, User, RefreshCw, X, Image as ImageIcon, Users,
  Crown, Radio, Megaphone
} from 'lucide-react';
import { socket } from '../socket';

// --- Image Resizer for LocalStorage ---
const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 800;
                
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

// --- Types ---
interface Message {
    id: string;
    text?: string;
    stickerKey?: string;
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
    title: string;
    artist: string;
    cover: string;
}

interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset';
    effect: 'dust' | 'petals' | 'lights' | 'none';
}

const THEME_BASES = {
    royal: 'bg-[#4a0404]',
    midnight: 'bg-[#020617]', 
    sunset: 'bg-[#2a0a18]',
};

// --- Assets & Effects ---

const Atmosphere = ({ theme }: { theme: ThemeConfig }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000">
            
            {/* --- THEME: MIDNIGHT (Van Gogh Starry Night) --- */}
            {theme.gradient === 'midnight' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1e1b4b] via-[#0f172a] to-[#000000]"></div>
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-20 animate-[spin_60s_linear_infinite]" 
                         style={{
                             background: 'repeating-conic-gradient(from 0deg, transparent 0deg, transparent 20deg, rgba(100, 149, 237, 0.2) 40deg, transparent 60deg)',
                             filter: 'blur(30px)',
                         }}>
                    </div>
                    <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-10 animate-[spin_45s_linear_infinite_reverse]" 
                         style={{
                             background: 'repeating-conic-gradient(from 180deg, transparent 0deg, transparent 15deg, rgba(255, 215, 0, 0.15) 30deg, transparent 50deg)',
                             filter: 'blur(40px)',
                         }}>
                    </div>
                    <div className="absolute inset-0 opacity-5 mix-blend-overlay pointer-events-none" 
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
                    </div>
                    {[...Array(12)].map((_, i) => (
                        <div key={`star-${i}`} 
                             className="absolute rounded-full bg-[#fcd34d] animate-pulse-slow"
                             style={{
                                 top: `${Math.random() * 80}%`,
                                 left: `${Math.random() * 100}%`,
                                 width: `${Math.random() * 6 + 3}px`,
                                 height: `${Math.random() * 6 + 3}px`,
                                 boxShadow: '0 0 20px 4px rgba(253, 224, 71, 0.5)',
                                 animationDelay: `${Math.random() * 4}s`,
                                 opacity: 0.8
                             }}
                        />
                    ))}
                </>
            )}

            {/* --- THEME: ROYAL (Velvet & Gold) --- */}
            {theme.gradient === 'royal' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-br from-[#500724] via-[#831843] to-[#500724]"></div>
                    <div className="absolute inset-0 opacity-30 mix-blend-screen animate-sway"
                         style={{
                             background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.05) 50%, transparent 60%)',
                             backgroundSize: '200% 200%',
                             filter: 'blur(8px)'
                         }}>
                    </div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.6)_100%)]"></div>
                    {[...Array(15)].map((_, i) => (
                        <div key={`gold-${i}`}
                             className="absolute rounded-full bg-[#fbbf24] animate-float"
                             style={{
                                 left: `${Math.random() * 100}%`,
                                 top: `${Math.random() * 100}%`,
                                 width: `${Math.random() * 2 + 2}px`,
                                 height: `${Math.random() * 2 + 2}px`,
                                 opacity: Math.random() * 0.5 + 0.3,
                                 animationDuration: `${Math.random() * 8 + 12}s`,
                                 boxShadow: '0 0 8px 1px rgba(251, 191, 36, 0.6)'
                             }}>
                        </div>
                    ))}
                </>
            )}

            {/* --- THEME: SUNSET (Living Art) --- */}
            {theme.gradient === 'sunset' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#3b0764] via-[#be185d] to-[#fb923c]"></div>
                    <div className="absolute bottom-[-20%] left-1/2 -translate-x-1/2 w-[80%] h-[50%] bg-[#fbbf24] blur-[120px] opacity-50 rounded-full animate-pulse-slow"></div>
                    {[...Array(6)].map((_, i) => (
                        <div key={`cloud-${i}`}
                             className="absolute rounded-full blur-3xl opacity-20 animate-float"
                             style={{
                                 background: i % 2 === 0 ? '#db2777' : '#fcd34d',
                                 left: `${Math.random() * 100}%`,
                                 top: `${Math.random() * 60}%`,
                                 width: `${Math.random() * 200 + 100}px`,
                                 height: `${Math.random() * 80 + 40}px`,
                                 animationDuration: `${Math.random() * 25 + 30}s`,
                                 animationDelay: `${Math.random() * -15}s`,
                                 transform: `translateX(-50%)`
                             }}>
                        </div>
                    ))}
                </>
            )}

            {theme.effect !== 'none' && (
                <div className="absolute inset-0 z-0">
                     {theme.effect === 'petals' && [...Array(8)].map((_, i) => (
                         <div key={`petal-${i}`} className="absolute bg-pink-200/40 rounded-full animate-float blur-[1px]"
                              style={{
                                  left: `${Math.random() * 100}%`,
                                  top: `${Math.random() * 120}%`,
                                  width: `${Math.random() * 10 + 5}px`,
                                  height: `${Math.random() * 10 + 5}px`,
                                  animationDuration: `${Math.random() * 10 + 15}s`,
                                  animationDelay: `${Math.random() * -5}s`
                              }}></div>
                     ))}
                     {theme.effect === 'dust' && (
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                     )}
                     {theme.effect === 'lights' && (
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60 animate-shimmer" style={{ backgroundSize: '200% 200%' }}></div>
                     )}
                </div>
            )}
        </div>
    );
};

// Stickers
const StickerHeart = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M50,85 L20,55 Q5,40 20,25 Q35,10 50,35 Q65,10 80,25 Q95,40 65,55 Z" fill="#e11d48" stroke="#be123c" strokeWidth="2" /><path d="M30,30 Q25,25 30,20" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.5"/></svg>);
const StickerRings = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><circle cx="35" cy="50" r="20" fill="none" stroke="#fcd34d" strokeWidth="6"/><circle cx="65" cy="50" r="20" fill="none" stroke="#fcd34d" strokeWidth="6"/><circle cx="35" cy="30" r="5" fill="#fff" filter="blur(1px)" opacity="0.8"/><path d="M35,30 L40,25 M30,25 L35,20" stroke="#fff" strokeWidth="2"/></svg>);
const StickerRose = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M50,50 Q30,30 50,10 Q70,30 50,50" fill="#e11d48"/><path d="M50,50 Q40,60 50,70 Q60,60 50,50" fill="#be123c"/><path d="M50,70 Q50,90 45,95" stroke="#166534" strokeWidth="4" fill="none"/><path d="M50,80 Q60,80 65,75" fill="none" stroke="#166534" strokeWidth="3"/><path d="M65,75 Q70,70 60,70 Z" fill="#166534"/></svg>);
const StickerChampagne = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M35,20 L35,60 Q35,80 50,80 Q65,80 65,60 L65,20" fill="#fef3c7" stroke="#fcd34d" strokeWidth="2" opacity="0.8"/><path d="M50,80 L50,95 M40,95 L60,95" stroke="#fcd34d" strokeWidth="4"/><circle cx="40" cy="30" r="2" fill="#fff" opacity="0.6" className="animate-float"/><circle cx="55" cy="40" r="3" fill="#fff" opacity="0.6" className="animate-float" style={{animationDelay:'0.5s'}}/></svg>);
const StickerKiss = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M20,40 Q40,30 50,40 Q60,30 80,40 Q90,50 80,60 Q60,70 50,60 Q40,70 20,60 Q10,50 20,40" fill="#ec4899"/><path d="M25,45 Q50,55 75,45" stroke="#be185d" strokeWidth="2" fill="none"/></svg>);
const StickerCupid = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><line x1="10" y1="90" x2="90" y2="10" stroke="#fcd34d" strokeWidth="3"/><path d="M85,15 L80,25 L70,25 Z" fill="#e11d48"/><path d="M15,85 L20,90 M10,90 L15,95" stroke="#fcd34d" strokeWidth="2"/><path d="M40,60 Q50,50 60,60 L50,70 Z" fill="#e11d48" opacity="0.8"/></svg>);

const STICKER_MAP: Record<string, React.ReactNode> = {
    'heart': <StickerHeart />,
    'rings': <StickerRings />,
    'rose': <StickerRose />,
    'cheers': <StickerChampagne />,
    'kiss': <StickerKiss />,
    'cupid': <StickerCupid />,
};

const AdoreMeter = ({ count, onTrigger }: { count: number, onTrigger: () => void }) => {
    const [scale, setScale] = useState(1);

    const handleClick = () => {
        onTrigger();
        setScale(0.9);
        setTimeout(() => setScale(1), 150);
    };

    return (
        <div className="relative z-50 flex flex-col items-center">
            <div className="absolute inset-0 bg-rose-500/20 blur-3xl rounded-full animate-pulse-slow"></div>
            <button 
                onClick={handleClick}
                className="relative w-24 h-24 rounded-full group transition-transform duration-200 active:scale-90 flex items-center justify-center"
                style={{ transform: `scale(${scale})` }}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-rose-500 to-passion-600 animate-pulse shadow-glow"></div>
                <Heart size={48} fill="white" className="text-white z-10 filter drop-shadow-md" />
            </button>
            <div className="mt-4 bg-black/40 px-4 py-1 rounded-full border border-rose-500/30 text-rose-200 font-bold font-heading">
                {count} Loves Shared
            </div>
        </div>
    );
};

// --- Main Component ---
interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'gallery' | 'guests'>('home');
    const [messages, setMessages] = useState<Message[]>([]);
    const [gallery, setGallery] = useState<MediaItem[]>([]);
    const [guestList, setGuestList] = useState<GuestEntry[]>([]);
    const [heartCount, setHeartCount] = useState(0);
    const [globalConfig, setGlobalConfig] = useState({ coupleName: "Sneha & Aman", date: "Nov 26" });
    const [theme, setTheme] = useState<ThemeConfig>({ gradient: 'royal', effect: 'dust' });
    const [nowPlaying, setNowPlaying] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [announcement, setAnnouncement] = useState<string | null>(null);
    
    const [inputText, setInputText] = useState("");
    const [activeStickerTab, setActiveStickerTab] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // --- Sync Logic ---
    useEffect(() => {
        // Load cached data initially for fast render
        const msgs = localStorage.getItem('wedding_chat_messages');
        if (msgs) setMessages(JSON.parse(msgs));
        
        const hearts = localStorage.getItem('wedding_heart_count');
        if (hearts) setHeartCount(parseInt(hearts));

        const pics = localStorage.getItem('wedding_gallery_media');
        if (pics) setGallery(JSON.parse(pics));

        const savedTheme = localStorage.getItem('wedding_theme_config');
        if (savedTheme) setTheme(JSON.parse(savedTheme));

        // Request fresh state from server
        socket.emit('request_sync');

        // --- Event Handlers ---
        const handleFullSync = (state: any) => {
            setMessages(state.messages || []);
            setGallery(state.gallery || []);
            setHeartCount(state.heartCount || 0);
            setGuestList(state.guestList || []);
            if(state.config) setGlobalConfig(state.config);
            if(state.theme) setTheme(state.theme);
            if(state.announcement) setAnnouncement(state.announcement);
            if(state.currentSong) {
                setNowPlaying(state.currentSong);
                setIsPlaying(state.isPlaying);
            }
        };

        const handleMessage = (data: any) => {
            setMessages(prev => [...prev, data.payload]);
        };

        const handleHeartUpdate = (data: any) => {
            setHeartCount(data.count);
        };

        const handleGallerySync = (data: any) => {
            setGallery(data.payload);
        };

        const handleThemeSync = (data: any) => {
            setTheme(data.payload);
        };

        const handlePlaylistUpdate = (data: any) => {
            setNowPlaying(data.currentSong);
            setIsPlaying(data.isPlaying);
        };

        const handleConfigSync = (data: any) => {
            setGlobalConfig(data.payload);
        };

        const handleUserPresence = (data: any) => {
            setGuestList(prev => {
                if (prev.some(g => g.name === data.payload.name)) return prev;
                return [...prev, data.payload];
            });
        };

        const handleAnnouncement = (data: any) => {
             setAnnouncement(data.message);
        };

        socket.on('full_sync', handleFullSync);
        socket.on('message', handleMessage);
        socket.on('heart_update', handleHeartUpdate);
        socket.on('gallery_sync', handleGallerySync);
        socket.on('theme_sync', handleThemeSync);
        socket.on('playlist_update', handlePlaylistUpdate);
        socket.on('config_sync', handleConfigSync);
        socket.on('user_presence', handleUserPresence);
        socket.on('announcement', handleAnnouncement);

        return () => {
            socket.off('full_sync', handleFullSync);
            socket.off('message', handleMessage);
            socket.off('heart_update', handleHeartUpdate);
            socket.off('gallery_sync', handleGallerySync);
            socket.off('theme_sync', handleThemeSync);
            socket.off('playlist_update', handlePlaylistUpdate);
            socket.off('config_sync', handleConfigSync);
            socket.off('user_presence', handleUserPresence);
            socket.off('announcement', handleAnnouncement);
        };
    }, []);

    useEffect(() => {
        if (activeTab === 'chat' && chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, activeTab]);

    const handleSendMessage = (text: string = "", stickerKey?: string) => {
        if (!text.trim() && !stickerKey) return;
        
        const newMessage: Message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            text,
            stickerKey,
            sender: userName,
            isCouple: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: stickerKey ? 'sticker' : 'text'
        };
        
        // Optimistic update
        // setMessages(prev => [...prev, newMessage]); 
        // Wait for server echo for consistency, or uncomment above for instant local feedback
        
        socket.emit('message', newMessage);
        
        setInputText("");
        setActiveStickerTab(false);
    };

    const handleHeartTrigger = () => {
        const newCount = heartCount + 1;
        setHeartCount(newCount); // Optimistic
        socket.emit('heart_update', newCount);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const base64 = await resizeImage(e.target.files[0]);
                const newPhoto: MediaItem = {
                    id: Date.now().toString(),
                    url: base64,
                    type: 'image',
                    caption: `Love from ${userName}`,
                    timestamp: Date.now(),
                    sender: userName
                };
                socket.emit('gallery_upload', newPhoto);
            } catch (err) {
                console.error(err);
                alert("Upload failed. Please try a smaller image.");
            }
            setIsUploading(false);
        }
    };

    const handleClearCache = () => {
        if(confirm("Refresh the experience?")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    const filteredGuests = guestList.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className={`w-full h-full flex flex-col relative overflow-hidden transition-all duration-1000 ${THEME_BASES[theme.gradient] || THEME_BASES.royal} text-pink-100 font-serif`}>
             
             <Atmosphere theme={theme} />

             {/* Header */}
             <header className="p-4 flex justify-between items-center z-20 border-b border-pink-500/20 bg-passion-900/10 backdrop-blur-md shrink-0 shadow-lg">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-pink-500/20 border border-pink-400 flex items-center justify-center font-bold text-white font-romantic text-xl">
                         {userName.charAt(0)}
                     </div>
                     <div>
                         <h1 className="font-romantic text-2xl text-white leading-none drop-shadow-md">{globalConfig.coupleName}</h1>
                         <p className="text-[10px] text-pink-400 uppercase tracking-widest font-serif">Forever & Always</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={handleClearCache} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-pink-300 transition-colors" title="Refresh">
                         <RefreshCw size={18} />
                     </button>
                     <button onClick={onLogout} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-pink-300 transition-colors">
                         <LogOut size={18} />
                     </button>
                 </div>
             </header>

             {/* Content Area */}
             <main className="flex-grow overflow-hidden relative z-10 flex flex-col">
                 
                 {/* HOME TAB */}
                 {activeTab === 'home' && (
                     <div className="h-full overflow-y-auto p-6 space-y-8 animate-fade-in flex flex-col items-center justify-center text-center">
                         
                         {/* Announcement Banner */}
                         {announcement && (
                             <div className="w-full max-w-sm bg-gradient-to-r from-passion-600/80 to-pink-600/80 p-4 rounded-2xl border border-pink-400/30 shadow-lg flex items-start gap-3 mb-4 animate-fade-in-up">
                                 <div className="bg-white/20 p-2 rounded-full shrink-0">
                                     <Megaphone size={18} className="text-white animate-pulse"/>
                                 </div>
                                 <div className="text-left">
                                     <h4 className="text-xs font-bold uppercase text-pink-200 tracking-widest mb-1">Latest News</h4>
                                     <p className="text-sm text-white font-serif leading-snug">{announcement}</p>
                                 </div>
                             </div>
                         )}

                         {/* Love Welcome */}
                         <div className="bg-white/5 p-8 rounded-3xl border border-pink-500/20 backdrop-blur-sm shadow-glow max-w-sm w-full">
                             <h2 className="text-4xl font-romantic text-pink-200 mb-2 drop-shadow-md">Hello, {userName}</h2>
                             <p className="text-sm text-pink-100/80 italic mb-6">
                                 "The best thing to hold onto in life is each other."
                             </p>
                             
                             {/* Music Sync Widget */}
                             {nowPlaying && isPlaying && (
                                 <div className="mb-6 bg-black/30 p-3 rounded-xl flex items-center gap-3 border border-pink-500/30 animate-fade-in">
                                     <div className="w-10 h-10 rounded-full overflow-hidden border border-pink-400 animate-spin-slow">
                                         <img src={nowPlaying.cover} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="text-left overflow-hidden">
                                         <div className="flex items-center gap-2 text-[10px] text-pink-400 uppercase tracking-widest font-bold">
                                             <Radio size={10} className="animate-pulse" /> Now Serenading
                                         </div>
                                         <div className="text-sm font-bold text-white truncate w-32">{nowPlaying.title}</div>
                                     </div>
                                     <div className="ml-auto">
                                         <Music size={16} className="text-pink-400 animate-bounce" />
                                     </div>
                                 </div>
                             )}

                             {/* Adore Meter */}
                             <div className="py-2">
                                 <AdoreMeter count={heartCount} onTrigger={handleHeartTrigger} />
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                             <button onClick={() => setActiveTab('chat')} className="bg-passion-600 text-white font-bold px-4 py-4 rounded-2xl shadow-lg hover:bg-passion-500 transition-all flex flex-col items-center gap-2 border border-pink-500/30">
                                 <MessageSquare size={24} /> Send Wishes
                             </button>
                             <button onClick={() => setActiveTab('gallery')} className="bg-pink-600 text-white font-bold px-4 py-4 rounded-2xl shadow-lg hover:bg-pink-500 transition-all flex flex-col items-center gap-2 border border-pink-500/30">
                                 <Camera size={24} /> Share Photo
                             </button>
                         </div>
                     </div>
                 )}

                 {/* CHAT TAB */}
                 {activeTab === 'chat' && (
                     <div className="flex flex-col flex-grow h-full overflow-hidden relative">
                         <div ref={chatScrollRef} className="flex-grow overflow-y-auto p-4 space-y-6 pb-4 relative z-0 overscroll-contain mx-0 sm:mx-2">
                             {messages.length === 0 && (
                                 <div className="text-center text-pink-300/50 mt-20">
                                     <Heart size={40} className="mx-auto mb-2 opacity-50"/>
                                     <p className="text-sm italic">Be the first to share some love!</p>
                                 </div>
                             )}
                             {messages.map((msg, i) => {
                                 const isMe = msg.sender === userName;
                                 return (
                                     <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
                                          <div className={`max-w-[85%] relative group`}>
                                              {msg.isCouple && (
                                                  <div className="absolute -top-3 -left-2 bg-gradient-to-r from-passion-500 to-pink-500 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-white/20 z-10">
                                                      <Crown size={10} fill="currentColor" /> Couple
                                                  </div>
                                              )}

                                              <div className={`px-4 py-3 shadow-lg backdrop-blur-sm transition-transform ${
                                                  msg.type === 'sticker' ? 'bg-transparent p-0 shadow-none' :
                                                  isMe ? 
                                                     'bg-gradient-to-br from-pink-500 to-passion-600 text-white rounded-2xl rounded-tr-sm shadow-glow' : 
                                                  msg.isCouple ? 
                                                     'bg-gradient-to-br from-white to-pink-100 text-passion-900 font-bold border border-white/50 rounded-2xl rounded-tl-sm shadow-glow' :
                                                     'bg-black/40 border border-pink-500/30 text-pink-100 rounded-2xl rounded-tl-sm shadow-black/20'
                                              }`}>
                                                  {msg.type === 'sticker' && msg.stickerKey ? (
                                                      <div className="w-28 h-28 drop-shadow-xl transform hover:scale-105 transition-transform">{STICKER_MAP[msg.stickerKey]}</div>
                                                  ) : (
                                                      <p className="text-sm font-serif leading-relaxed">{msg.text}</p>
                                                  )}
                                              </div>
                                              
                                              <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] opacity-60 ${isMe ? 'justify-end text-pink-200' : 'justify-start text-pink-300'}`}>
                                                  {!isMe && <span className="font-bold">{msg.sender}</span>}
                                                  <span>• {msg.timestamp}</span>
                                              </div>
                                          </div>
                                     </div>
                                 )
                             })}
                         </div>

                         {/* Input Area */}
                         <div className="p-3 sm:p-4 relative z-20 bg-passion-900/90 border-t border-pink-500/20 pb-safe backdrop-blur-lg shadow-2xl">
                             <div className="flex items-center gap-2 bg-black/40 rounded-full px-2 py-1.5 border border-pink-500/30 focus-within:border-pink-500 transition-colors shadow-inner">
                                  <button 
                                     onClick={() => setActiveStickerTab(!activeStickerTab)}
                                     className={`p-2 rounded-full transition-colors ${activeStickerTab ? 'bg-pink-500 text-white rotate-12' : 'text-pink-400 hover:text-white'}`}
                                  >
                                      <Smile size={20} />
                                  </button>
                                  <input 
                                     type="text" 
                                     value={inputText}
                                     onChange={(e) => setInputText(e.target.value)}
                                     placeholder="Whisper a wish..."
                                     className="flex-grow bg-transparent border-none text-white placeholder-pink-300/30 focus:ring-0 focus:outline-none h-10 text-sm font-serif"
                                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                                  />
                                  <button 
                                     onClick={() => handleSendMessage(inputText)}
                                     disabled={!inputText.trim()}
                                     className="p-2.5 bg-gradient-to-r from-pink-500 to-passion-500 text-white rounded-full hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform active:scale-95"
                                  >
                                      <Send size={18} />
                                  </button>
                             </div>

                             {/* Sticker Tray */}
                             {activeStickerTab && (
                                 <div className="absolute bottom-full left-0 w-full bg-passion-950 border-t border-pink-500/20 p-4 animate-slide-up z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-2xl">
                                     <div className="flex justify-between items-center mb-3 px-1">
                                         <span className="text-xs text-pink-300 uppercase tracking-widest font-bold flex items-center gap-2"><Heart size={12} fill="currentColor"/> Stickers</span>
                                         <button onClick={() => setActiveStickerTab(false)} className="bg-white/5 p-1 rounded-full hover:bg-white/10"><X size={16} className="text-pink-300"/></button>
                                     </div>
                                     <div className="grid grid-cols-3 gap-4 max-h-48 overflow-y-auto no-scrollbar">
                                         {Object.keys(STICKER_MAP).map(key => (
                                             <button key={key} onClick={() => handleSendMessage('', key)} className="aspect-square p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-pink-500/30">
                                                 {STICKER_MAP[key]}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}

                 {/* GALLERY TAB */}
                 {activeTab === 'gallery' && (
                     <div className="flex-grow overflow-y-auto p-4 pb-24">
                         <div className="flex items-center justify-between mb-4">
                             <h2 className="text-xl font-romantic text-pink-200">Love Memories</h2>
                             <button 
                                onClick={() => fileInputRef.current?.click()} 
                                disabled={isUploading}
                                className="bg-pink-600 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 hover:bg-pink-500 shadow-lg"
                             >
                                 {isUploading ? <RefreshCw className="animate-spin" size={14}/> : <Camera size={14} />}
                                 Add Photo
                             </button>
                             <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handleFileUpload} 
                             />
                         </div>
                         
                         <div className="grid grid-cols-2 gap-3">
                             {gallery.map(p => (
                                 <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group bg-black/40 border border-pink-500/20 animate-fade-in shadow-md">
                                     <img src={p.url} className="w-full h-full object-cover" loading="lazy" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-passion-900/90 via-transparent to-transparent flex flex-col justify-end p-2">
                                         <p className="text-white text-xs truncate font-bold">{p.caption}</p>
                                         <span className="text-[9px] text-pink-300">{(new Date(p.timestamp)).toLocaleDateString()}</span>
                                     </div>
                                 </div>
                             ))}
                             {gallery.length === 0 && (
                                 <div className="col-span-2 flex flex-col items-center justify-center py-20 text-pink-300/50 gap-2 border border-dashed border-pink-500/20 rounded-xl">
                                     <ImageIcon size={32} className="opacity-50"/>
                                     <p className="text-sm">Share a moment of love.</p>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}

                 {/* GUESTS TAB */}
                 {activeTab === 'guests' && (
                     <div className="flex-grow overflow-y-auto p-4 pb-24">
                         <div className="mb-4">
                             <div className="relative">
                                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-300" size={16}/>
                                 <input 
                                    type="text" 
                                    placeholder="Find friends..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-black/30 border border-pink-500/30 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-pink-400 text-white placeholder-pink-300/30 backdrop-blur-sm transition-colors"
                                 />
                             </div>
                         </div>

                         <div className="space-y-3">
                             {filteredGuests.map((guest, idx) => (
                                 <div key={idx} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 animate-slide-up hover:bg-white/10 transition-colors border border-white/5">
                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 ${
                                         guest.role === 'couple' ? 'bg-white text-passion-900 border-white' : 
                                         guest.name === userName ? 'bg-pink-500 text-white border-pink-400' : 'bg-passion-900 text-pink-200 border-pink-500/30'
                                     }`}>
                                         {guest.name.charAt(0)}
                                     </div>
                                     <div className="flex-grow">
                                         <h3 className="font-bold text-pink-100 text-lg font-serif">{guest.name} {guest.name === userName && '(You)'}</h3>
                                         <div className="flex items-center gap-2">
                                             <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                 guest.role === 'couple' ? 'bg-white text-passion-900 font-bold' : 'bg-white/5 border-white/10 text-pink-400'
                                             }`}>
                                                 {guest.role}
                                             </span>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
             </main>
             
             {/* Bottom Navigation */}
             <nav className="flex-shrink-0 p-2 bg-passion-900/90 border-t border-pink-500/20 flex justify-around z-20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.3)] backdrop-blur-lg">
                 {[
                     { id: 'home', icon: Home, label: 'Home' },
                     { id: 'chat', icon: MessageSquare, label: 'Chat' },
                     { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
                     { id: 'guests', icon: Users, label: 'Guests' },
                 ].map(item => (
                     <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === item.id ? 'bg-pink-500 text-white -translate-y-1 shadow-lg shadow-pink-500/30' : 'text-pink-400/60 hover:text-pink-200'}`}
                     >
                         <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : ''} />
                         <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
                     </button>
                 ))}
             </nav>
        </div>
    );
};

export default GuestDashboard;