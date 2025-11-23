import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Home, MessageSquare, Heart, Camera, LogOut, Send, 
  Smile, Image as ImageIcon, Users,
  Crown, Radio, Megaphone, Gift, CalendarCheck, RefreshCw, X
} from 'lucide-react';
import { useTheme, ThemeConfig } from '../ThemeContext';
import { useAppData, Lantern } from '../AppContext';

// --- Image Resizer ---
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
        userBubble: 'bg-gradient-to-br from-pink-500 to-passion-600 text-white shadow-glow',
        otherBubble: 'bg-black/40 border border-pink-500/30 text-pink-100',
        stickerBg: 'bg-passion-950',
        button: 'bg-gradient-to-r from-pink-500 to-passion-500',
        iconActive: 'text-pink-500',
        navActive: 'bg-pink-500 text-white shadow-pink-500/30'
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
        userBubble: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]',
        otherBubble: 'bg-slate-800/60 border border-blue-500/30 text-blue-100',
        stickerBg: 'bg-slate-950',
        button: 'bg-gradient-to-r from-blue-500 to-indigo-500',
        iconActive: 'text-blue-500',
        navActive: 'bg-blue-600 text-white shadow-blue-500/30'
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
        userBubble: 'bg-gradient-to-br from-orange-500 to-pink-600 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]',
        otherBubble: 'bg-purple-900/40 border border-orange-500/30 text-orange-100',
        stickerBg: 'bg-[#2a0a18]',
        button: 'bg-gradient-to-r from-orange-500 to-pink-500',
        iconActive: 'text-orange-500',
        navActive: 'bg-gradient-to-r from-orange-500 to-pink-600 text-white shadow-orange-500/30'
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
        userBubble: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)]',
        otherBubble: 'bg-purple-950/60 border border-purple-500/30 text-purple-100',
        stickerBg: 'bg-purple-950',
        button: 'bg-gradient-to-r from-violet-500 to-purple-500',
        iconActive: 'text-purple-400',
        navActive: 'bg-purple-600 text-white shadow-purple-500/30'
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
        userBubble: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]',
        otherBubble: 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-100',
        stickerBg: 'bg-emerald-950',
        button: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        iconActive: 'text-emerald-400',
        navActive: 'bg-emerald-600 text-white shadow-emerald-500/30'
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
    const [isActive, setIsActive] = useState(false);
    const { theme } = useTheme();
    const style = THEME_STYLES[theme.gradient] || THEME_STYLES.royal;

    const handleClick = () => {
        onTrigger();
        setIsActive(true);
        setTimeout(() => setIsActive(false), 150);
    };

    return (
        <div className="relative z-50 flex flex-col items-center group select-none">
            {/* Ambient Background Pulse */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 blur-[60px] rounded-full animate-pulse-slow transition-colors duration-500 opacity-30 ${theme.gradient === 'midnight' ? 'bg-blue-500' : 'bg-rose-500'}`}></div>
            
            <button 
                onClick={handleClick}
                className={`
                    relative w-28 h-28 rounded-full flex items-center justify-center
                    transition-all duration-100 cubic-bezier(0.4, 0, 0.2, 1)
                    ${isActive ? 'scale-95 shadow-inner' : 'scale-100 hover:scale-110 shadow-glow-lg'}
                `}
            >
                <div className={`absolute inset-0 rounded-full overflow-hidden border-2 border-white/20 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] ${style.button}`}>
                     <div className={`
                        absolute inset-0 bg-gradient-to-tr from-transparent via-white/60 to-transparent
                        transition-transform duration-700 ease-in-out transform
                        ${isActive ? 'translate-x-full opacity-100' : '-translate-x-full opacity-0'}
                     `}></div>
                </div>

                {isActive && (
                    <>
                        <div className={`absolute inset-0 rounded-full border-4 animate-ping ${style.border}`}></div>
                        <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" style={{ animationDelay: '0.1s' }}></div>
                    </>
                )}

                <div className={`relative z-10 transition-transform duration-150 ${isActive ? 'scale-150 rotate-6' : 'animate-heartbeat'}`}>
                    <Heart size={52} fill="currentColor" className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                    <Heart size={52} className="absolute inset-0 text-white blur-sm animate-pulse" />
                </div>
            </button>

            <div className={`mt-6 bg-black/40 backdrop-blur-xl px-6 py-2 rounded-full border font-bold font-heading flex items-center gap-3 shadow-xl transform transition-all duration-300 group-hover:scale-105 ${style.border} ${style.text}`}>
                <span className="text-xl tabular-nums tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 drop-shadow-sm">
                    {count.toLocaleString()}
                </span>
                <span className={`text-[10px] uppercase tracking-[0.2em] font-bold ${style.accent}`}>Adore</span>
            </div>
        </div>
    );
};

interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
    // 🔥 SYNC: Using global state instead of local state
    const { 
        messages, gallery, guestList, heartCount, config, currentSong, isPlaying, announcement, typingUsers,
        sendMessage, sendHeart, uploadMedia, sendLantern, sendRSVP, setTyping, refreshData 
    } = useAppData();

    const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'gallery' | 'guests' | 'gift'>('home');
    const { theme } = useTheme();
    const [hasRSVPd, setHasRSVPd] = useState(false);
    
    const [inputText, setInputText] = useState("");
    const [activeStickerTab, setActiveStickerTab] = useState(false);
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Lantern State (Local UI)
    const [lanternMsg, setLanternMsg] = useState("");
    const [releasedLantern, setReleasedLantern] = useState<boolean>(false);

    // Typing Timeout
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const themeStyles = THEME_STYLES[theme.gradient] || THEME_STYLES.royal;

    useEffect(() => {
        refreshData();
        if (localStorage.getItem('wedding_rsvp_confirmed') === 'true') {
            setHasRSVPd(true);
        }
    }, []);
    
    const showRSVP = useMemo(() => {
        if (!config.date) return false;
        const target = new Date(config.date);
        if (isNaN(target.getTime())) return false;
        return new Date() >= target;
    }, [config.date]);

    useEffect(() => {
        if (activeTab === 'chat' && chatScrollRef.current) {
            chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
        }
    }, [messages, activeTab]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputText(val);
        
        // 🔥 SYNC: Broadcast typing status
        if (!typingTimeoutRef.current && val.length > 0) {
             setTyping(userName, true);
        }
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        
        if (val.length > 0) {
            typingTimeoutRef.current = setTimeout(() => {
                setTyping(userName, false);
                typingTimeoutRef.current = null;
            }, 2000);
        } else {
            setTyping(userName, false);
        }
    };

    const handleSendMessage = (text: string = "", stickerKey?: string) => {
        if (!text.trim() && !stickerKey) return;
        
        // 🔥 SYNC: Send message via context
        sendMessage(text, stickerKey, userName, false);
        
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTyping(userName, false);
        typingTimeoutRef.current = null;
        
        setInputText("");
        setActiveStickerTab(false);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setIsUploading(true);
            try {
                const base64 = await resizeImage(e.target.files[0]);
                
                // 🔥 SYNC: Upload media via context
                uploadMedia({
                    id: Date.now().toString(),
                    url: base64,
                    type: 'image',
                    caption: `Love from ${userName}`,
                    timestamp: Date.now(),
                    sender: userName
                });
            } catch (err) {
                console.error(err);
                alert("Upload failed. Please try a smaller image.");
            }
            setIsUploading(false);
        }
    };

    // inside GuestDashboard.tsx (replace existing handleReleaseLantern)
const handleReleaseLantern = () => {
    if (!lanternMsg.trim()) return;

    // Create a structured Lantern payload (compatible with AppContext.normalizeLantern)
    const depthOptions: Array<"near"|"mid"|"far"> = ["near","mid","far"];
    const depth = depthOptions[Math.floor(Math.random()*depthOptions.length)];
    const payload: Lantern = {
        id: Date.now().toString(),
        sender: userName,
        message: lanternMsg.trim(),           // key name 'message' used by context
        color: theme.gradient,
        depth,
        xValues: Math.floor(Math.random() * 80) + 10,
        speed: Math.floor(Math.random() * 25) + 18,
        delay: 0,
        timestamp: Date.now()
    };

    setReleasedLantern(true);
    // send via context - AppContext will optimistically add and emit via socket
    sendLantern(payload);

    setTimeout(() => {
        setReleasedLantern(false);
        setLanternMsg("");
    }, 3200);
};

    const handleRSVP = () => {
        if (!hasRSVPd && confirm("Confirm your presence for the big day?")) {
            setHasRSVPd(true);
            localStorage.setItem('wedding_rsvp_confirmed', 'true');
            // 🔥 SYNC: Send RSVP
            sendRSVP(userName);
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
        <div className={`w-full h-full flex flex-col relative overflow-hidden transition-all duration-1000 ${THEME_BASES[theme.gradient] || THEME_BASES.royal} ${themeStyles.text} font-serif`}>
             <Atmosphere theme={theme} />

             {/* Header */}
             <header className={`p-4 flex justify-between items-center z-20 border-b backdrop-blur-md shrink-0 shadow-lg ${themeStyles.headerBg} ${themeStyles.border}`}>
                 <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-white font-romantic text-xl ${themeStyles.border} ${themeStyles.iconActive}`}>
                         {userName.charAt(0)}
                     </div>
                     <div>
                         <h1 className="font-romantic text-2xl text-white leading-none drop-shadow-md">{config.coupleName}</h1>
                         <p className={`text-[10px] uppercase tracking-widest font-serif ${themeStyles.accent}`}>Forever & Always</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={handleClearCache} className={`p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors ${themeStyles.mutedText}`} title="Refresh">
                         <RefreshCw size={18} />
                     </button>
                     <button onClick={onLogout} className={`p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors ${themeStyles.mutedText}`}>
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
                             <div className={`w-full max-w-sm p-4 rounded-2xl border shadow-lg flex items-start gap-3 mb-4 animate-fade-in-up ${themeStyles.button} ${themeStyles.border}`}>
                                 <div className="bg-white/20 p-2 rounded-full shrink-0">
                                     <Megaphone size={18} className="text-white animate-pulse"/>
                                 </div>
                                 <div className="text-left">
                                     <h4 className="text-xs font-bold uppercase text-white/80 tracking-widest mb-1">Latest News</h4>
                                     <p className="text-sm text-white font-serif leading-snug">{announcement}</p>
                                 </div>
                             </div>
                         )}

                         {/* Love Welcome */}
                         <div className={`bg-white/5 p-8 rounded-3xl border backdrop-blur-sm shadow-glow max-w-sm w-full ${themeStyles.border}`}>
                             <h2 className={`text-4xl font-romantic mb-2 drop-shadow-md text-white`}>Hello, {userName}</h2>
                             <p className={`text-sm italic mb-6 ${themeStyles.mutedText}`}>
                                 "The best thing to hold onto in life is each other."
                             </p>
                             
                             {/* Music Sync Widget */}
                             {currentSong && isPlaying && (
                                 <div className={`mb-6 bg-black/30 p-3 rounded-xl flex items-center gap-3 border animate-fade-in ${themeStyles.border}`}>
                                     <div className={`w-10 h-10 rounded-full overflow-hidden border animate-spin-slow ${themeStyles.border}`}>
                                         <img src={currentSong.cover} className="w-full h-full object-cover" />
                                     </div>
                                     <div className="text-left overflow-hidden">
                                         <div className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold ${themeStyles.accent}`}>
                                             <Radio size={10} className="animate-pulse" /> Now Serenading
                                         </div>
                                         <div className="text-sm font-bold text-white truncate w-32">{currentSong.title}</div>
                                     </div>
                                 </div>
                             )}

                             {/* Adore Meter */}
                             <div className="py-2">
                                 <AdoreMeter count={heartCount} onTrigger={sendHeart} />
                             </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                             <button onClick={() => setActiveTab('chat')} className={`text-white font-bold px-4 py-4 rounded-2xl shadow-lg transition-all flex flex-col items-center gap-2 border border-white/10 ${themeStyles.button}`}>
                                 <MessageSquare size={24} /> Send Wishes
                             </button>
                             <button onClick={() => setActiveTab('gift')} className={`bg-white/10 text-white font-bold px-4 py-4 rounded-2xl shadow-lg hover:bg-white/20 transition-all flex flex-col items-center gap-2 border ${themeStyles.border}`}>
                                 <Gift size={24} /> Light Lantern
                             </button>
                         </div>

                         {showRSVP && (
                             <div className={`w-full max-w-sm mt-2 animate-fade-in-up`}>
                                 <button 
                                     onClick={handleRSVP}
                                     disabled={hasRSVPd}
                                     className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 border border-white/20 ${hasRSVPd ? 'bg-green-600/80 cursor-default' : 'bg-gradient-to-r from-pink-600 to-rose-600 hover:scale-105 active:scale-95'}`}
                                 >
                                     <CalendarCheck size={20} />
                                     {hasRSVPd ? "You're Attending!" : "Confirm Attendance"}
                                 </button>
                                 <p className={`text-[10px] mt-2 italic opacity-60 ${themeStyles.mutedText}`}>
                                     {hasRSVPd ? "We have saved your spot with love." : "The day is here! Let us know you're with us."}
                                 </p>
                             </div>
                         )}
                     </div>
                 )}

                 {/* CHAT TAB */}
                 {activeTab === 'chat' && (
                     <div className="flex flex-col flex-grow h-full overflow-hidden relative">
                         <div ref={chatScrollRef} className="flex-grow overflow-y-auto p-4 space-y-6 pb-4 relative z-0 overscroll-contain mx-0 sm:mx-2">
                             {messages.length === 0 && (
                                 <div className={`text-center mt-20 ${themeStyles.mutedText}`}>
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
                                                  <div className={`absolute -top-3 -left-2 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-white/20 z-10 ${themeStyles.button}`}>
                                                      <Crown size={10} fill="currentColor" /> Couple
                                                  </div>
                                              )}

                                              <div className={`px-4 py-3 shadow-lg backdrop-blur-sm transition-transform ${
                                                  msg.type === 'sticker' ? 'bg-transparent p-0 shadow-none' :
                                                  isMe ? 
                                                     `${themeStyles.userBubble} rounded-2xl rounded-tr-sm` : 
                                                     `${themeStyles.otherBubble} rounded-2xl rounded-tl-sm shadow-black/20`
                                              }`}>
                                                  {msg.type === 'sticker' && msg.stickerKey ? (
                                                      <div className="w-28 h-28 drop-shadow-xl transform hover:scale-105 transition-transform animate-pop-in">{STICKER_MAP[msg.stickerKey]}</div>
                                                  ) : (
                                                      <p className="text-sm font-serif leading-relaxed">{msg.text}</p>
                                                  )}
                                              </div>
                                              
                                              <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] opacity-60 ${isMe ? 'justify-end' : 'justify-start'} ${themeStyles.mutedText}`}>
                                                  {!isMe && <span className="font-bold">{msg.sender}</span>}
                                                  <span>• {msg.timestamp ? (new Date(msg.timestamp)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}</span>
                                              </div>
                                          </div>
                                     </div>
                                 )
                             })}
                         </div>

                         {/* Input Area */}
                         <div className={`p-3 sm:p-4 relative z-20 border-t pb-safe backdrop-blur-lg shadow-2xl ${themeStyles.inputBg} ${themeStyles.border}`}>
                             
                             {/* Typing Indicator */}
                             {typingUsers.size > 0 && (
                                <div className={`absolute bottom-full left-4 mb-2 text-[10px] px-3 py-1 rounded-full backdrop-blur-md animate-fade-in flex items-center gap-2 ${themeStyles.inputInner} ${themeStyles.accent}`}>
                                    <div className="flex gap-1">
                                        <div className={`w-1 h-1 rounded-full animate-bounce bg-current`} style={{animationDelay: '0s'}}></div>
                                        <div className={`w-1 h-1 rounded-full animate-bounce bg-current`} style={{animationDelay: '0.1s'}}></div>
                                        <div className={`w-1 h-1 rounded-full animate-bounce bg-current`} style={{animationDelay: '0.2s'}}></div>
                                    </div>
                                    <span>
                                        {Array.from(typingUsers).slice(0, 2).join(', ')} 
                                        {typingUsers.size > 2 ? ` and ${typingUsers.size - 2} others` : ''} 
                                        {typingUsers.size === 1 ? ' is' : ' are'} typing...
                                    </span>
                                </div>
                             )}

                             <div className={`flex items-center gap-2 rounded-full px-2 py-1.5 border focus-within:border-white/50 transition-colors shadow-inner ${themeStyles.inputInner} ${themeStyles.border}`}>
                                  <button 
                                     onClick={() => setActiveStickerTab(!activeStickerTab)}
                                     className={`p-2 rounded-full transition-colors ${activeStickerTab ? 'bg-white text-black rotate-12' : `${themeStyles.mutedText} hover:text-white`}`}
                                  >
                                      <Smile size={20} />
                                  </button>
                                  <input 
                                     type="text" 
                                     value={inputText}
                                     onChange={handleInputChange}
                                     placeholder="Whisper a wish..."
                                     className={`flex-grow bg-transparent border-none placeholder-white/30 focus:ring-0 focus:outline-none h-10 text-sm font-serif ${themeStyles.text}`}
                                     onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
                                  />
                                  <button 
                                     onClick={() => handleSendMessage(inputText)}
                                     disabled={!inputText.trim()}
                                     className={`p-2.5 text-white rounded-full hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg transform active:scale-95 ${themeStyles.button}`}
                                  >
                                      <Send size={18} />
                                  </button>
                             </div>

                             {/* Sticker Tray */}
                             {activeStickerTab && (
                                 <div className={`absolute bottom-full left-0 w-full border-t p-4 animate-slide-up z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-2xl ${themeStyles.stickerBg} ${themeStyles.border}`}>
                                     <div className="flex justify-between items-center mb-3 px-1">
                                         <span className={`text-xs uppercase tracking-widest font-bold flex items-center gap-2 ${themeStyles.mutedText}`}><Heart size={12} fill="currentColor"/> Stickers</span>
                                         <button onClick={() => setActiveStickerTab(false)} className={`bg-white/5 p-1 rounded-full hover:bg-white/10 ${themeStyles.mutedText}`}><X size={16}/></button>
                                     </div>
                                     <div className="grid grid-cols-3 gap-4 max-h-48 overflow-y-auto no-scrollbar">
                                         {Object.keys(STICKER_MAP).map(key => (
                                             <button key={key} onClick={() => handleSendMessage('', key)} className="aspect-square p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-white/30">
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
                             <h2 className="text-xl font-romantic text-white">Love Memories</h2>
                             <button 
                                onClick={() => fileInputRef.current?.click()} 
                                disabled={isUploading}
                                className={`text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg hover:brightness-110 ${themeStyles.button}`}
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
                                 <div key={p.id} className={`relative aspect-square rounded-xl overflow-hidden group bg-black/40 border animate-fade-in shadow-md ${themeStyles.border}`}>
                                     <img src={p.url} className="w-full h-full object-cover" loading="lazy" />
                                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex flex-col justify-end p-2">
                                         <p className="text-white text-xs truncate font-bold">{p.caption}</p>
                                         <span className={`text-[9px] ${themeStyles.mutedText}`}>{(new Date(p.timestamp)).toLocaleDateString()}</span>
                                     </div>
                                 </div>
                             ))}
                             {gallery.length === 0 && (
                                 <div className={`col-span-2 flex flex-col items-center justify-center py-20 gap-2 border border-dashed rounded-xl ${themeStyles.border} ${themeStyles.mutedText}`}>
                                     <ImageIcon size={32} className="opacity-50"/>
                                     <p className="text-sm">Share a moment of love.</p>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}

                 {/* GIFT TAB - Sky Lanterns */}
                 {activeTab === 'gift' && (
                     <div className="h-full overflow-y-auto p-6 pb-24 flex flex-col items-center justify-center text-center relative">
                         <div className="absolute inset-0 pointer-events-none overflow-hidden">
                             <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse"></div>
                             <div className="absolute top-40 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                         </div>

                         {releasedLantern ? (
                              <div className="flex flex-col items-center justify-center animate-fly-away absolute z-50">
                                  <div className="w-24 h-32 bg-gradient-to-t from-orange-500 via-orange-300 to-yellow-200 rounded-t-full rounded-b-lg shadow-[0_0_40px_rgba(249,115,22,0.6)] animate-pulse opacity-90"></div>
                                  <div className="w-16 h-4 bg-black/20 rounded-full mt-2 blur-md"></div>
                              </div>
                         ) : (
                             <div className={`relative z-10 max-w-sm w-full p-8 rounded-3xl border backdrop-blur-md shadow-2xl bg-black/20 ${themeStyles.border} animate-fade-in-up`}>
                                 <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-glow animate-float">
                                     <Gift size={40} className="text-orange-400" />
                                 </div>
                                 <h2 className="text-3xl font-romantic text-white mb-2">Sky Lantern</h2>
                                 <p className={`text-sm mb-8 ${themeStyles.mutedText}`}>
                                     Write a wish and release a lantern into the couple's night sky.
                                 </p>
                                 
                                 <textarea
                                     value={lanternMsg}
                                     onChange={(e) => setLanternMsg(e.target.value)}
                                     maxLength={100}
                                     placeholder="Your wish for the couple..."
                                     className={`w-full bg-black/30 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-orange-500 h-32 mb-2 resize-none text-center font-serif text-lg placeholder-white/20`}
                                 />
                                 <div className="text-right text-[10px] text-white/30 mb-6">{lanternMsg.length}/100</div>

                                 <button 
                                     onClick={handleReleaseLantern}
                                     disabled={!lanternMsg.trim()}
                                     className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-orange-500 to-pink-600 hover:shadow-orange-500/40`}
                                 >
                                     <Send size={18} /> Release Lantern
                                 </button>
                             </div>
                         )}
                         
                         {releasedLantern && (
                             <div className="mt-64 animate-fade-in">
                                 <p className="text-white font-romantic text-2xl">Your wish is flying to them...</p>
                             </div>
                         )}
                     </div>
                 )}

                 {/* GUESTS TAB */}
                 {activeTab === 'guests' && (
                     <div className="flex-grow overflow-y-auto p-4 pb-24">
                         <div className="mb-4">
                             <div className="relative">
                                 {/* Search logic handled by local filtering of global list */}
                                 <input 
                                    type="text" 
                                    placeholder="Find friends..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className={`w-full border rounded-full py-3 pl-4 pr-4 text-sm focus:outline-none focus:border-white/50 text-white placeholder-white/30 backdrop-blur-sm transition-colors ${themeStyles.inputInner} ${themeStyles.border}`}
                                 />
                             </div>
                         </div>

                         <div className="space-y-3">
                             {filteredGuests.map((guest, idx) => (
                                 <div key={idx} className="bg-white/5 p-4 rounded-2xl flex items-center gap-4 animate-slide-up hover:bg-white/10 transition-colors border border-white/5">
                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 ${
                                         guest.role === 'couple' ? 'bg-white text-black border-white' : 
                                         guest.name === userName ? `${themeStyles.button} border-white/50 text-white` : `bg-black/40 ${themeStyles.border} ${themeStyles.text}`
                                     }`}>
                                         {guest.name.charAt(0)}
                                     </div>
                                     <div className="flex-grow">
                                         <h3 className={`font-bold text-lg font-serif ${themeStyles.text}`}>{guest.name} {guest.name === userName && '(You)'}</h3>
                                         <div className="flex items-center gap-2">
                                             <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                                 guest.role === 'couple' ? 'bg-white text-black font-bold' : `bg-white/5 border-white/10 ${themeStyles.mutedText}`
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
             <nav className={`flex-shrink-0 p-2 border-t flex justify-around z-20 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.3)] backdrop-blur-lg ${themeStyles.navBg} ${themeStyles.border}`}>
                 {[
                     { id: 'home', icon: Home, label: 'Home' },
                     { id: 'chat', icon: MessageSquare, label: 'Chat' },
                     { id: 'gift', icon: Gift, label: 'Gift' },
                     { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
                     { id: 'guests', icon: Users, label: 'Guests' },
                 ].map(item => (
                     <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-300 ${activeTab === item.id ? themeStyles.navActive : `${themeStyles.mutedText} hover:text-white`}`}
                     >
                         <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : ''} />
                         <span className="text-[8px] uppercase tracking-widest font-bold">{item.label}</span>
                     </button>
                 ))}
             </nav>
        </div>
    );
};

export default GuestDashboard;