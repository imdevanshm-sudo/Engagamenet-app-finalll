
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, 
  ChevronRight, LogOut, Sparkles, Map, Send, 
  Smile, Upload, Phone, Download, Lock, Search, ExternalLink, Contact,
  User, Music, Info, MailCheck, X, Navigation, Share2, Check, LocateFixed, Compass, Flower, Settings, Bell, ToggleLeft, ToggleRight, Trash2, RefreshCw, Battery, Wifi, WifiOff, Smartphone, Users, Plus, Minus, Loader, Disc, Crown
} from 'lucide-react';

// --- Utility to Prevent XSS in Map Markers ---
const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

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
}

interface GuestContact {
    id: number;
    name: string;
    phone: string;
    role: 'Guest' | 'Family' | 'Couple';
}

interface LocationUpdate {
    type: 'location_update';
    id: string;
    name: string;
    x: number;
    y: number;
    lat?: number;
    lng?: number;
    role: 'guest' | 'couple';
    map: 'all' | 'venue' | 'google';
}

interface WeddingEvent {
    id: string;
    title: string;
    time: string;
    loc: string;
    icon: string;
}

interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset';
    effect: 'dust' | 'petals' | 'lights' | 'none';
}

const DEFAULT_EVENTS: WeddingEvent[] = [
    { id: '1', title: "Ring Ceremony", time: "Nov 26, 5:00 PM", loc: "Royal Gardens", icon: "💍" },
    { id: '2', title: "Dinner & Toast", time: "Nov 26, 7:30 PM", loc: "Grand Ballroom", icon: "🥂" },
    { id: '3', title: "DJ Night", time: "Nov 26, 9:00 PM", loc: "Poolside", icon: "💃" },
];

// --- Assets & Effects ---

// Gold Dust Effect
const GoldDust = ({ opacity = 0.4 }: { opacity?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
        x: number, y: number, vx: number, vy: number, 
        size: number, alpha: number 
    }> = [];

    const resize = () => {
      if (canvas.parentElement) {
          canvas.width = canvas.parentElement.clientWidth;
          canvas.height = canvas.parentElement.clientHeight;
      } else {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
      }
      initParticles();
    };

    const initParticles = () => {
      particles = [];
      const count = Math.floor((canvas.width * canvas.height) / 20000); 
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
          size: Math.random() * 2 + 0.5,
          alpha: Math.random() * 0.5 + 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fbbf24'; // Gold
      
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.globalAlpha = p.alpha * opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [opacity]);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 mix-blend-screen" />;
};

// God Rays Effect
const GodRays = () => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-overlay">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-gradient-to-b from-gold-200/10 to-transparent rotate-12 blur-3xl transform origin-top-left animate-breathe"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[60%] bg-gradient-to-b from-gold-400/5 to-transparent -rotate-12 blur-3xl transform origin-top-right animate-breathe delay-700"></div>
    </div>
);

// Petals Effect
const PetalIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 30 30" className={className} style={style}>
     <path d="M15,0 C5,5 0,15 5,25 C10,30 20,30 25,25 C30,15 25,5 15,0 Z" fill="url(#petal-gradient)" />
     <defs>
        <linearGradient id="petal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor="#be123c" /> 
           <stop offset="50%" stopColor="#9f1239" />
           <stop offset="100%" stopColor="#881337" /> 
        </linearGradient>
     </defs>
  </svg>
);

const FallingPetals = () => {
  const petals = Array.from({ length: 12 }).map((_, i) => {
     const r1 = (i * 37 + 13) % 100; 
     const r2 = (i * 23 + 7) % 100;  
     return {
        id: i,
        left: `${r1}%`,
        delay: `${r2 * 0.2}s`, 
        duration: `${15 + (i * 0.5)}s`, 
        scale: 0.6 + (r2 * 0.008),
     };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
       {petals.map(p => (
          <div 
            key={p.id}
            className="absolute -top-8 animate-petal-fall opacity-0 will-change-transform blur-[0px]"
            style={{
               left: p.left,
               animationDelay: p.delay,
               animationDuration: p.duration,
               '--scale': p.scale
            } as React.CSSProperties}
          >
            <PetalIcon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
       ))}
    </div>
  );
}

// Stickers
const StickerKalash = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M30,80 Q30,95 50,95 Q70,95 70,80 L75,40 Q80,30 50,30 Q20,30 25,40 Z" fill="#b45309" stroke="#78350f" strokeWidth="2"/><path d="M30,40 Q50,50 70,40" stroke="#fcd34d" strokeWidth="3" fill="none"/><circle cx="50" cy="60" r="10" fill="#fcd34d" /><path d="M50,30 L50,20 M40,30 L35,15 M60,30 L65,15" stroke="#15803d" strokeWidth="3"/><circle cx="50" cy="15" r="8" fill="#fbbf24"/></svg>);
const StickerShehnai = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M20,80 L80,20 L90,30 L30,90 Z" fill="#92400e" /><circle cx="25" cy="85" r="12" fill="#fbbf24" stroke="#b45309" strokeWidth="2"/><circle cx="25" cy="85" r="6" fill="#000" opacity="0.3"/><path d="M35,65 L40,60 M50,50 L55,45 M65,35 L70,30" stroke="#fbbf24" strokeWidth="3"/></svg>);
const StickerSagai = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><defs><radialGradient id="ringGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs><path d="M20,65 Q20,95 50,95 Q80,95 80,65 L80,55 Q50,45 20,55 Z" fill="#be123c" stroke="#881337" strokeWidth="2"/><path d="M20,55 Q50,45 80,55 Q50,65 20,55" fill="#9f1239" /><circle cx="50" cy="45" r="12" fill="none" stroke="#fbbf24" strokeWidth="4" /><circle cx="50" cy="33" r="4" fill="#fff" filter="url(#ringGlow)"/><path d="M50,33 L50,33" stroke="#fff" strokeWidth="2" className="animate-pulse"/><text x="50" y="85" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#fbbf24" fontWeight="bold">Sagai</text></svg>);
const StickerJodi = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M50,85 L20,55 Q5,40 20,25 Q35,10 50,35 Q65,10 80,25 Q95,40 65,55 Z" fill="#be123c" stroke="#9f1239" strokeWidth="2" /><text x="50" y="45" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#fff" fontWeight="bold">Jodi</text><text x="50" y="60" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#fbbf24" fontWeight="bold">No. 1</text></svg>);
const StickerBadhai = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="10" y="30" width="80" height="40" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="2"/><text x="50" y="52" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#b45309" fontWeight="bold">Badhai</text><text x="50" y="67" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#b45309" fontWeight="bold">Ho!</text><circle cx="15" cy="35" r="3" fill="#ef4444" /><circle cx="85" cy="35" r="3" fill="#ef4444" /><circle cx="15" cy="65" r="3" fill="#ef4444" /><circle cx="85" cy="65" r="3" fill="#ef4444" /></svg>);
const StickerSwagat = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M10,30 Q50,100 90,30" fill="none" stroke="#ea580c" strokeWidth="12" strokeLinecap="round" strokeDasharray="1,12" /><path d="M10,30 Q50,100 90,30" fill="none" stroke="#facc15" strokeWidth="12" strokeLinecap="round" strokeDasharray="1,12" strokeDashoffset="6"/><text x="50" y="50" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#4a0e11" fontWeight="bold">Swagat</text><text x="50" y="65" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#4a0e11">Hai</text></svg>);
const StickerNazar = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M10,50 Q50,20 90,50 Q50,80 10,50 Z" fill="#fff" stroke="#000" strokeWidth="2"/><circle cx="50" cy="50" r="18" fill="#3b82f6" /><circle cx="50" cy="50" r="10" fill="#000" /><circle cx="55" cy="45" r="4" fill="#fff" /><text x="50" y="90" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#000">Nazar Na Lage</text></svg>);
const StickerElephant = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M20,60 Q20,30 50,30 Q80,30 80,60 L80,90 L70,90 L70,70 L60,70 L60,90 L50,90" fill="#94a3b8"/><path d="M20,60 Q10,70 20,80" stroke="#94a3b8" strokeWidth="4" fill="none"/><rect x="40" y="30" width="20" height="20" fill="#b91c1c"/><circle cx="35" cy="45" r="2" fill="#000"/></svg>);

const STICKER_MAP: Record<string, React.ReactNode> = {
    'sagai': <StickerSagai />,
    'badhai': <StickerBadhai />,
    'jodi': <StickerJodi />,
    'swagat': <StickerSwagat />,
    'nazar': <StickerNazar />,
    'kalash': <StickerKalash />,
    'shehnai': <StickerShehnai />,
    'gajraj': <StickerElephant />,
};

const AdoreMeter = ({ count, onTrigger }: { count: number, onTrigger: () => void }) => {
    // Calculate fill percentage (cycling every 100 likes for visual effect)
    const fillPercent = Math.min(100, (count % 100) + 15); 
    const [hearts, setHearts] = useState<Array<{id: number, type: 'heart'|'sparkle', x: number, delay: number}>>([]);
    const [scale, setScale] = useState(1);

    const handleClick = () => {
        onTrigger();
        setScale(0.9); // Click press effect
        setTimeout(() => setScale(1), 150);

        const id = Date.now();
        const types: ('heart'|'sparkle')[] = ['heart', 'sparkle'];
        // Generate multiple particles per click
        for (let i = 0; i < 3; i++) {
            const type = types[Math.floor(Math.random() * types.length)];
            const x = (Math.random() * 60) - 30; // Spread -30px to 30px
            const delay = i * 100;
            
            const newHeart = { id: id + i, type, x, delay };
            setHearts(prev => [...prev, newHeart]);
            
            // Clean up
            setTimeout(() => {
                setHearts(prev => prev.filter(h => h.id !== newHeart.id));
            }, 2000);
        }
    };

    return (
        <div className="relative z-50">
            {/* Floating Particles Container */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 w-40 h-60 pointer-events-none overflow-hidden -z-10">
                 {hearts.map(h => (
                     <div 
                        key={h.id} 
                        className="absolute bottom-4 left-1/2 animate-sidebar-float text-rose-500 drop-shadow-lg will-change-transform" 
                        style={{ 
                            '--x': `${h.x}px`,
                            animationDelay: `${h.delay}ms`
                        } as React.CSSProperties}
                     >
                         {h.type === 'heart' ? (
                             <Heart size={Math.random() * 10 + 14} fill="url(#heartGradient)" className="text-rose-500" />
                         ) : (
                             <Sparkles size={16} className="text-gold-400" />
                         )}
                     </div>
                 ))}
                 <svg width="0" height="0">
                    <defs>
                        <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#fbbf24" />
                            <stop offset="100%" stopColor="#e11d48" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>

            {/* Main Orb Button */}
            <button 
                onClick={handleClick}
                className="relative w-16 h-16 rounded-full group transition-transform duration-200 active:scale-90"
                style={{ transform: `scale(${scale})` }}
            >
                {/* Glowing Ring */}
                <div className="absolute -inset-1 bg-gradient-to-br from-rose-500 to-gold-500 rounded-full blur opacity-40 group-hover:opacity-75 animate-pulse-slow"></div>
                
                {/* Glass Container */}
                <div className="absolute inset-0 rounded-full bg-black/60 backdrop-blur-md border-2 border-white/10 overflow-hidden shadow-2xl">
                    {/* Liquid Fill */}
                    <div 
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 transition-all duration-500 ease-out"
                        style={{ height: `${fillPercent}%` }}
                    >
                        {/* Wave top */}
                        <div className="absolute top-0 left-0 w-full h-[4px] bg-rose-300/50 blur-[2px]"></div>
                    </div>
                    
                    {/* Reflection */}
                    <div className="absolute top-2 left-3 w-4 h-2 bg-white/20 rounded-full -rotate-12 blur-[1px]"></div>
                </div>

                {/* Center Icon & Count */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
                    <Heart size={20} fill="#fff" className="text-white drop-shadow-md animate-heartbeat" />
                    <span className="text-[9px] font-bold text-white drop-shadow-md mt-0.5 bg-black/20 px-1.5 rounded-full backdrop-blur-[1px]">
                        {count}
                    </span>
                </div>
            </button>
            
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <span className="text-[9px] text-gold-500 font-bold uppercase tracking-wider opacity-80">Adore</span>
            </div>
        </div>
    );
};

const GuestBookView = ({ userName, messages, onSendMessage, heartCount, onHeartTrigger, isRomanticMode, gallery, onUpload }: { userName: string, messages: Message[], onSendMessage: (text: string, stickerKey?: string) => void, heartCount: number, onHeartTrigger: () => void, isRomanticMode: boolean, gallery: MediaItem[], onUpload: () => void }) => {
    const [view, setView] = useState<'directory' | 'wishes' | 'gallery'>('wishes');
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState<'emoji' | 'sticker' | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSending, setIsSending] = useState(false);

    const guestDirectory: GuestContact[] = ([
        { id: 1, name: "Ravi Sharma", phone: "9876543210", role: 'Guest' },
        { id: 2, name: "Priya Patel", phone: "9876543211", role: 'Guest' },
        { id: 3, name: "Amit Singh", phone: "9876543212", role: 'Family' },
        { id: 4, name: "Sneha Gupta", phone: "9876543213", role: 'Couple' },
        { id: 5, name: "Aman Gupta", phone: "9876543214", role: 'Couple' },
        { id: 6, name: "Raj Malhotra", phone: "9876543215", role: 'Guest' },
        { id: 7, name: "Simran Kaur", phone: "9876543216", role: 'Family' },
    ] as GuestContact[]).filter(g => g.name !== userName); 

    useEffect(() => {
        if (view === 'wishes' && scrollRef.current) {
             scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, view]);

    const sendMessage = (text: string = "", stickerKey?: string) => {
        if (isSending) return;
        setIsSending(true);
        
        setTimeout(() => {
             onSendMessage(text, stickerKey);
             setInputText("");
             setActiveTab(null);
             setIsSending(false);
        }, 300);
    };

    const filteredGuests = guestDirectory.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-full relative animate-fade-in bg-transparent">
            <div className="glass-deep p-4 pb-2 text-white shadow-lg z-20 shrink-0 border-b border-white/10">
                <h2 className="font-serif font-bold text-xl flex items-center gap-2 mb-3 text-gold-100"><Contact size={20} className="text-gold-400"/> Guest Book</h2>
                <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('directory')} 
                        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all ${view === 'directory' ? 'bg-white/10 text-gold-100 shadow-sm' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        Directory
                    </button>
                    <button 
                        onClick={() => setView('wishes')} 
                        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all ${view === 'wishes' ? 'bg-white/10 text-gold-100 shadow-sm' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        Chat
                    </button>
                     <button 
                        onClick={() => setView('gallery')} 
                        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-md transition-all ${view === 'gallery' ? 'bg-white/10 text-gold-100 shadow-sm' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        Gallery
                    </button>
                </div>
            </div>
            
            {view === 'directory' && (
                <div className="flex-grow overflow-y-auto p-4 pb-32 overscroll-contain">
                     <div className="relative mb-4">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16}/>
                         <input 
                            type="text" 
                            placeholder="Find a guest..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/30 border border-white/10 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-gold-400 text-white placeholder-white/30 backdrop-blur-sm transition-colors"
                         />
                     </div>
                     <div className="space-y-3">
                         {filteredGuests.map(guest => (
                             <div key={guest.id} className="glass-deep p-4 rounded-xl flex justify-between items-center animate-slide-up hover:bg-white/5 transition-colors">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg border border-white/10 ${guest.role === 'Couple' ? 'bg-rose-900/50 text-rose-200' : 'bg-white/10 text-white'}`}>
                                         {guest.name.charAt(0)}
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-gold-100">{guest.name}</h3>
                                         <span className="text-[10px] uppercase tracking-wider text-white/50 bg-white/5 px-2 py-0.5 rounded-full border border-white/10">{guest.role}</span>
                                     </div>
                                 </div>
                                 <a href={`tel:${guest.phone}`} className="w-10 h-10 rounded-full bg-green-900/30 text-green-400 flex items-center justify-center hover:bg-green-900/50 transition-colors active:scale-95 shadow-sm border border-green-500/20">
                                     <Phone size={18} fill="currentColor" className="opacity-80"/>
                                 </a>
                             </div>
                         ))}
                     </div>
                </div>
            )}
            
            {view === 'gallery' && (
                <div className="flex-grow overflow-y-auto p-4 pb-32">
                    <div className="grid grid-cols-2 gap-3">
                         <button onClick={onUpload} className="aspect-square rounded-xl border-2 border-dashed border-gold-500/30 flex flex-col items-center justify-center text-gold-400 gap-2 hover:bg-gold-500/10 transition-colors">
                             <Camera size={24} />
                             <span className="text-xs font-bold uppercase">Add Memory</span>
                         </button>
                         {gallery.map(p => (
                             <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group bg-black/40">
                                 <img src={p.url} className="w-full h-full object-cover" loading="lazy" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2">
                                     <p className="text-white text-xs truncate">{p.caption}</p>
                                     <span className="text-[9px] text-stone-400">{(new Date(p.timestamp)).toLocaleDateString()}</span>
                                 </div>
                             </div>
                         ))}
                         {gallery.length === 0 && (
                             <div className="col-span-2 flex flex-col items-center justify-center py-10 text-stone-500 gap-2">
                                 <p className="text-sm">No photos shared yet.</p>
                             </div>
                         )}
                    </div>
                </div>
            )}

            {view === 'wishes' && (
                <div className="flex flex-col flex-grow h-full overflow-hidden relative">
                    <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[#1a0507] to-transparent z-10 pointer-events-none"></div>

                    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-6 pb-24 relative z-0 overscroll-contain mx-0 sm:mx-2">
                        {messages.map((msg, i) => {
                            const isMe = msg.sender === userName;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-slide-up`}>
                                     <div className={`max-w-[85%] relative group`}>
                                         
                                         {/* Couple Badge */}
                                         {msg.isCouple && (
                                             <div className="absolute -top-3 -left-2 bg-gradient-to-r from-rose-600 to-rose-800 text-white text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-rose-400/50 z-10">
                                                 <Crown size={10} fill="currentColor" /> Couple
                                             </div>
                                         )}

                                         <div className={`px-4 py-3 shadow-lg backdrop-blur-sm transition-transform ${
                                             msg.type === 'sticker' ? 'bg-transparent p-0 shadow-none' :
                                             isMe ? 
                                                'bg-gradient-to-br from-gold-400 to-gold-600 text-[#2d0a0d] rounded-2xl rounded-tr-sm shadow-gold-500/10' : 
                                             msg.isCouple ? 
                                                'bg-gradient-to-br from-rose-900 to-[#4a0410] border border-rose-500/30 text-rose-100 rounded-2xl rounded-tl-sm shadow-[0_4px_15px_rgba(225,29,72,0.2)]' :
                                                'bg-white/10 border border-white/5 text-stone-200 rounded-2xl rounded-tl-sm shadow-black/20'
                                         }`}>
                                             {msg.type === 'sticker' && msg.stickerKey ? (
                                                 <div className="w-28 h-28 drop-shadow-xl transform hover:scale-105 transition-transform">{STICKER_MAP[msg.stickerKey]}</div>
                                             ) : (
                                                 <p className="text-sm font-serif leading-relaxed">{msg.text}</p>
                                             )}
                                         </div>
                                         
                                         <div className={`flex items-center gap-1.5 mt-1.5 text-[10px] opacity-60 ${isMe ? 'justify-end text-gold-300/70' : 'justify-start text-stone-400'}`}>
                                             {!isMe && <span className="font-bold text-gold-500/80">{msg.sender}</span>}
                                             <span>• {msg.timestamp}</span>
                                         </div>
                                     </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Adore Meter - Integrated Floating Button */}
                    <div className="absolute bottom-24 right-4 z-50">
                        <AdoreMeter count={heartCount} onTrigger={onHeartTrigger} />
                    </div>

                    {/* Chat Input Area */}
                    <div className="p-3 sm:p-4 relative z-20 bg-[#2d0a0d]/90 border-t border-white/10 pb-safe backdrop-blur-lg shadow-2xl">
                        <div className="flex items-center gap-2 bg-black/40 rounded-full px-2 py-1.5 border border-white/10 focus-within:border-gold-500/50 transition-colors">
                             <button 
                                onClick={() => setActiveTab(activeTab === 'sticker' ? null : 'sticker')}
                                className={`p-2 rounded-full transition-colors ${activeTab === 'sticker' ? 'bg-gold-500 text-black rotate-12' : 'text-stone-400 hover:text-gold-400'}`}
                             >
                                 <Smile size={20} />
                             </button>
                             <input 
                                type="text" 
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Send your wishes..."
                                className="flex-grow bg-transparent border-none text-white placeholder-white/30 focus:ring-0 focus:outline-none h-10 text-sm"
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                             />
                             <button 
                                onClick={() => sendMessage(inputText)}
                                disabled={!inputText.trim() || isSending}
                                className="p-2.5 bg-gradient-to-r from-gold-500 to-gold-600 text-[#2d0a0d] rounded-full hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                             >
                                 {isSending ? <Loader size={18} className="animate-spin"/> : <Send size={18} />}
                             </button>
                        </div>

                        {/* Sticker Tray */}
                        {activeTab === 'sticker' && (
                            <div className="absolute bottom-full left-0 w-full bg-[#1a0507] border-t border-white/10 p-4 animate-slide-up z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] rounded-t-2xl">
                                <div className="flex justify-between items-center mb-3 px-1">
                                    <span className="text-xs text-stone-400 uppercase tracking-widest font-bold flex items-center gap-2"><Sparkles size={12} className="text-gold-500"/> Stickers</span>
                                    <button onClick={() => setActiveTab(null)} className="bg-white/5 p-1 rounded-full hover:bg-white/10"><X size={16} className="text-stone-400"/></button>
                                </div>
                                <div className="grid grid-cols-4 gap-3 sm:gap-4 max-h-48 overflow-y-auto no-scrollbar">
                                    {Object.keys(STICKER_MAP).map(key => (
                                        <button key={key} onClick={() => sendMessage('', key)} className="aspect-square p-2 bg-white/5 rounded-xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95 border border-transparent hover:border-gold-500/30">
                                            {STICKER_MAP[key]}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

const LiveMapModal = ({ 
    userName, 
    isOpen, 
    onClose,
    activeUsers,
    isSharing,
    onToggleSharing
}: { 
    userName: string, 
    isOpen: boolean, 
    onClose: () => void,
    activeUsers: Record<string, LocationUpdate>,
    isSharing: boolean,
    onToggleSharing: () => void
}) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    
    // Initial Position: Hotel Soni International, Khalilabad
    const venuePos = [26.7857, 83.0763]; 

    useEffect(() => {
        if (!isOpen) return;
        
        // Initialize Map
        const initMap = async () => {
            if (mapRef.current && !mapInstance.current) {
                const L = (window as any).L;
                if (!L) return;

                mapInstance.current = L.map(mapRef.current).setView(venuePos, 14);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap'
                }).addTo(mapInstance.current);

                const venueIcon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: #be123c; color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 20px;">🏰</div>`,
                    iconSize: [40, 40],
                    iconAnchor: [20, 40]
                });
                L.marker(venuePos, { icon: venueIcon }).addTo(mapInstance.current).bindPopup("Hotel Soni International").openPopup();
            }
        };
        
        setTimeout(initMap, 100);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                markersRef.current = {};
            }
        };
    }, [isOpen]);

    // Update Markers
    useEffect(() => {
        if (!mapInstance.current) return;
        const L = (window as any).L;

        Object.values(activeUsers).forEach((user: any) => {
             const u = user as LocationUpdate;
             if (u.lat && u.lng) {
                 if (markersRef.current[u.id]) {
                     markersRef.current[u.id].setLatLng([u.lat, u.lng]);
                 } else {
                     const safeName = escapeHtml(u.name);
                     const iconHtml = `
                        <div class="relative flex flex-col items-center justify-center">
                            <div class="w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center font-bold text-xs backdrop-blur-md ${
                                u.role === 'couple'
                                    ? 'bg-rose-900/90 border-rose-400 text-rose-100' 
                                    : u.id === userName 
                                        ? 'bg-green-900/90 border-green-400 text-green-100'
                                        : 'bg-amber-900/90 border-amber-400 text-amber-100'
                            }">
                                ${safeName.charAt(0)}
                            </div>
                             <div class="mt-1 px-2 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white whitespace-nowrap border border-white/10">
                                ${u.role === 'couple' ? 'Couple' : u.id === userName ? 'You' : safeName}
                            </div>
                        </div>
                    `;
                    const icon = L.divIcon({
                        className: 'bg-transparent border-none',
                        html: iconHtml,
                        iconSize: [40, 50],
                        iconAnchor: [20, 20]
                    });
                     const marker = L.marker([u.lat, u.lng], { icon }).addTo(mapInstance.current);
                     markersRef.current[u.id] = marker;
                 }
             }
        });

    }, [activeUsers, userName, isOpen]);

    // GPS Locate Function
    const handleLocateMe = () => {
        if (!mapInstance.current || !navigator.geolocation) return;
        
        navigator.geolocation.getCurrentPosition((pos) => {
            const { latitude, longitude } = pos.coords;
            mapInstance.current.flyTo([latitude, longitude], 18);
        }, (err) => {
            alert("Could not locate you. Please enable GPS.");
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col animate-fade-in">
            <div className="p-4 bg-[#2d0a0d] flex justify-between items-center border-b border-white/10">
                <h3 className="text-gold-100 font-heading flex items-center gap-2"><Map size={18}/> Live Tracker</h3>
                <button onClick={onClose} className="p-2 bg-white/10 rounded-full text-white"><X size={20}/></button>
            </div>
            
            {/* Map Control Bar */}
            <div className="bg-black/40 p-2 flex justify-between items-center px-4 border-b border-white/5">
                 <span className="text-xs text-stone-400 flex items-center gap-2">
                     <Users size={14} /> {Object.keys(activeUsers).length} Active
                 </span>
                 <button 
                    onClick={onToggleSharing}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${isSharing ? 'bg-green-900/40 text-green-400 border border-green-500/50' : 'bg-white/5 text-stone-400 border border-white/10 hover:bg-white/10'}`}
                 >
                     <div className={`w-2 h-2 rounded-full ${isSharing ? 'bg-green-500 animate-pulse' : 'bg-stone-500'}`}></div>
                     {isSharing ? 'Sharing Live' : 'Share Location'}
                 </button>
            </div>

            <div className="flex-grow relative">
                 <div ref={mapRef} className="w-full h-full bg-stone-200"></div>
                 {/* GPS Button */}
                 <button 
                    onClick={handleLocateMe}
                    className="absolute bottom-4 right-4 z-[500] bg-white text-black p-3 rounded-full shadow-xl active:scale-95 transition-transform"
                 >
                     <LocateFixed size={24} />
                 </button>
            </div>
            <div className="p-4 bg-[#2d0a0d] text-center">
                <p className="text-xs text-stone-400">Enable sharing to help friends find you at the venue!</p>
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
    const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'guestbook' | 'map'>('home');
    const [messages, setMessages] = useState<Message[]>([]);
    const [gallery, setGallery] = useState<MediaItem[]>([]);
    const [events, setEvents] = useState<WeddingEvent[]>(DEFAULT_EVENTS);
    const [heartCount, setHeartCount] = useState(0);
    const [showMapModal, setShowMapModal] = useState(false);
    const [globalConfig, setGlobalConfig] = useState({ coupleName: "Sneha & Aman", date: "Nov 26" });
    const [theme, setTheme] = useState<ThemeConfig>({ gradient: 'royal', effect: 'dust' });

    // --- Location Tracking State (Lifted from Modal) ---
    const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
    const [isLocationSharing, setIsLocationSharing] = useState(false);
    const lastLocationRef = useRef<LocationUpdate | null>(null);

    // --- Sync Logic ---
    useEffect(() => {
        // Load Initial Data
        const msgs = localStorage.getItem('wedding_chat_messages');
        if (msgs) setMessages(JSON.parse(msgs));
        
        const hearts = localStorage.getItem('wedding_heart_count');
        if (hearts) setHeartCount(parseInt(hearts));

        const pics = localStorage.getItem('wedding_gallery_media');
        if (pics) setGallery(JSON.parse(pics));

        const evts = localStorage.getItem('wedding_events');
        if (evts) setEvents(JSON.parse(evts));

        const conf = localStorage.getItem('wedding_global_config');
        if (conf) {
             const c = JSON.parse(conf);
             setGlobalConfig({ coupleName: c.coupleName || "Sneha & Aman", date: c.date || "Nov 26" });
        }

        const savedTheme = localStorage.getItem('wedding_theme_config');
        if (savedTheme) {
            setTheme(JSON.parse(savedTheme));
        }

        // Listen for broadcasts
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.onmessage = (event) => {
            const data = event.data;
            switch (data.type) {
                case 'message':
                    setMessages(prev => [...prev, data.payload]);
                    break;
                case 'message_sync':
                    setMessages(data.payload);
                    break;
                case 'heart_update':
                    setHeartCount(data.count);
                    break;
                case 'gallery_sync':
                    setGallery(data.payload);
                    break;
                case 'event_sync':
                    setEvents(data.payload);
                    break;
                case 'config_sync':
                    setGlobalConfig({ coupleName: data.payload.coupleName, date: data.payload.date });
                    break;
                case 'theme_sync':
                    setTheme(data.payload);
                    break;
            }
        };

        return () => channel.close();
    }, []);

    // --- Background Location Tracking Effect ---
    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');

        // 1. Handshake: Announce we are here and ask others for their location
        channel.postMessage({ type: 'location_request' });

        channel.onmessage = (event) => {
             const data = event.data;
             if (data.type === 'location_update') {
                 setActiveUsers(prev => ({ ...prev, [data.id]: data }));
             } else if (data.type === 'location_request') {
                 // If someone else joins and we are sharing, tell them where we are immediately
                 if (isLocationSharing && lastLocationRef.current) {
                     channel.postMessage(lastLocationRef.current);
                 }
             }
        };

        let watchId: number;
        if (isLocationSharing && navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords;
                    // Generate pseudo venue coords for the visual map
                    const pseudoX = (Math.abs(longitude * 10000) % 80) + 10; 
                    const pseudoY = (Math.abs(latitude * 10000) % 80) + 10;

                    const update: LocationUpdate = {
                        type: 'location_update',
                        id: userName,
                        name: userName,
                        x: pseudoX, y: pseudoY,
                        lat: latitude,
                        lng: longitude,
                        role: 'guest',
                        map: 'all'
                    };
                    
                    lastLocationRef.current = update;
                    channel.postMessage(update);
                    // Update local state so I see myself
                    setActiveUsers(prev => ({ ...prev, [userName]: update }));
                },
                (err) => console.error("Geo Error:", err),
                { enableHighAccuracy: true, maximumAge: 5000 }
            );
        }
        
        return () => {
            channel.close();
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [isLocationSharing, userName]);

    // Actions
    const handleSendMessage = (text: string, stickerKey?: string) => {
        const newMessage: Message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            text,
            stickerKey,
            sender: userName,
            isCouple: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: stickerKey ? 'sticker' : 'text'
        };
        
        const updated = [...messages, newMessage];
        setMessages(updated);
        // Persist temporarily (Admin handles true persistence)
        localStorage.setItem('wedding_chat_messages', JSON.stringify(updated));

        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'message', payload: newMessage });
        channel.close();
    };

    const handleHeartTrigger = () => {
        const newCount = heartCount + 1;
        setHeartCount(newCount);
        localStorage.setItem('wedding_heart_count', newCount.toString());
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'heart_update', count: newCount });
        channel.close();
    };

    const handleUpload = () => {
        // Simulate upload
        const mockImages = [
            "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
            "https://images.unsplash.com/photo-1520854221256-17451cc330e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60"
        ];
        const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
        
        const newPhoto: MediaItem = {
            id: Date.now().toString(),
            url: randomImg,
            type: 'image',
            caption: `Shared by ${userName}`,
            timestamp: Date.now()
        };

        const updated = [newPhoto, ...gallery];
        setGallery(updated);
        localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
        
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'gallery_sync', payload: updated });
        channel.close();
        
        alert("Photo Shared to Gallery!");
    };

    const handleClearCache = () => {
        if(confirm("Reset app data and reload? This fixes most issues.")) {
            localStorage.clear();
            window.location.reload();
        }
    };

    return (
        <div className={`w-full h-full flex flex-col relative overflow-hidden transition-colors duration-1000 ${
            theme.gradient === 'midnight' ? 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617]' :
            theme.gradient === 'sunset' ? 'bg-gradient-to-b from-[#4a0404] via-[#7c2d12] to-[#2d0a0d]' :
            'bg-gradient-to-b from-[#1a0507] via-[#2d0a0d] to-[#0f0505]'
        } text-gold-100 font-serif`}>
             <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000">
                 {theme.effect === 'dust' && <GoldDust opacity={0.3} />}
                 {theme.effect === 'petals' && <FallingPetals />}
                 {theme.effect === 'lights' && <GodRays />}
             </div>

             {/* Header */}
             <header className="p-4 flex justify-between items-center z-20 border-b border-gold-500/20 bg-[#2d0a0d]/80 backdrop-blur-md">
                 <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gold-500/10 border border-gold-500/50 flex items-center justify-center font-bold text-gold-200">
                         {userName.charAt(0)}
                     </div>
                     <div>
                         <h1 className="font-heading text-lg text-gold-100 leading-tight">{globalConfig.coupleName}</h1>
                         <p className="text-[10px] text-gold-400 uppercase tracking-widest">Engagement Ceremony</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-2">
                     <button onClick={handleClearCache} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-stone-400 transition-colors" title="Reset App">
                         <RefreshCw size={18} />
                     </button>
                     <button onClick={onLogout} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-stone-400 transition-colors">
                         <LogOut size={18} />
                     </button>
                 </div>
             </header>

             {/* Content Area */}
             <main className="flex-grow overflow-hidden relative z-10">
                 {activeTab === 'home' && (
                     <div className="h-full overflow-y-auto p-6 space-y-8 animate-fade-in">
                         <div className="text-center mt-4">
                             <div className="inline-block p-4 rounded-full border-2 border-gold-500/30 bg-gradient-to-br from-gold-900/20 to-transparent mb-4 shadow-[0_0_30px_rgba(234,179,8,0.2)] animate-pulse-slow">
                                 <Sparkles size={32} className="text-gold-300" />
                             </div>
                             <h2 className="text-3xl font-cursive text-gold-200 mb-2">Namaste, {userName}</h2>
                             <p className="text-sm text-stone-300 max-w-xs mx-auto leading-relaxed">
                                 Welcome to the celebration of love. We are delighted to have you with us on this auspicious occasion.
                             </p>
                         </div>

                         {/* Quick Actions */}
                         <div className="grid grid-cols-2 gap-4">
                             <button onClick={() => setActiveTab('schedule')} className="bg-[#2d0a0d] p-4 rounded-xl border border-white/10 hover:border-gold-500/50 transition-all group">
                                 <Calendar size={24} className="text-gold-500 mb-2 group-hover:scale-110 transition-transform"/>
                                 <h3 className="font-bold text-sm">Itinerary</h3>
                                 <p className="text-[10px] text-stone-500">View event timings</p>
                             </button>
                             <button onClick={() => setShowMapModal(true)} className="bg-[#2d0a0d] p-4 rounded-xl border border-white/10 hover:border-gold-500/50 transition-all group relative overflow-hidden">
                                 {isLocationSharing && (
                                     <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                                 )}
                                 <MapPin size={24} className="text-rose-500 mb-2 group-hover:scale-110 transition-transform"/>
                                 <h3 className="font-bold text-sm">Venue Map</h3>
                                 <p className="text-[10px] text-stone-500">Find your way</p>
                             </button>
                         </div>
                         
                         {/* Next Event Widget */}
                         <div className="bg-gradient-to-r from-gold-900/40 to-[#2d0a0d] p-5 rounded-xl border border-gold-500/20 relative overflow-hidden">
                             <div className="absolute -right-4 top-1/2 -translate-y-1/2 text-gold-500/5 text-[100px] font-cursive leading-none">Love</div>
                             <h3 className="text-xs font-bold uppercase tracking-widest text-gold-400 mb-2">Upcoming</h3>
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-gold-500/20 rounded-lg flex items-center justify-center text-xl">{events[0]?.icon || '✨'}</div>
                                 <div>
                                     <div className="font-bold text-gold-100">{events[0]?.title || 'Ceremony'}</div>
                                     <div className="text-xs text-stone-400">{events[0]?.time} • {events[0]?.loc}</div>
                                 </div>
                             </div>
                         </div>
                     </div>
                 )}

                 {activeTab === 'schedule' && (
                     <div className="h-full overflow-y-auto p-6 animate-fade-in pb-24">
                         <h2 className="text-2xl font-heading text-gold-200 mb-6 text-center">Ceremony Timeline</h2>
                         <div className="space-y-4 relative">
                             {/* Timeline Line */}
                             <div className="absolute left-[19px] top-4 bottom-4 w-[2px] bg-gold-500/20 z-0"></div>
                             
                             {events.map((evt, i) => (
                                 <div key={evt.id} className="relative z-10 flex items-start gap-4 group">
                                     <div className="w-10 h-10 rounded-full bg-[#1a0507] border-2 border-gold-500 text-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.2)] group-hover:scale-110 transition-transform">
                                         {evt.icon}
                                     </div>
                                     <div className="flex-grow bg-[#2d0a0d] p-4 rounded-xl border border-white/5 group-hover:border-gold-500/30 transition-colors">
                                         <h3 className="font-bold text-gold-100 text-lg">{evt.title}</h3>
                                         <div className="flex items-center gap-4 mt-2 text-xs text-stone-400">
                                             <span className="flex items-center gap-1"><Clock size={12}/> {evt.time}</span>
                                             <span className="flex items-center gap-1"><MapPin size={12}/> {evt.loc}</span>
                                         </div>
                                     </div>
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}

                 {activeTab === 'guestbook' && (
                     <GuestBookView 
                         userName={userName} 
                         messages={messages} 
                         onSendMessage={handleSendMessage}
                         heartCount={heartCount}
                         onHeartTrigger={handleHeartTrigger}
                         isRomanticMode={false}
                         gallery={gallery}
                         onUpload={handleUpload}
                     />
                 )}
             </main>
             
             {/* Bottom Navigation */}
             <nav className="flex-shrink-0 p-2 bg-[#2d0a0d] border-t border-white/10 flex justify-around z-20 pb-safe">
                 {[
                     { id: 'home', icon: Home, label: 'Home' },
                     { id: 'schedule', icon: Calendar, label: 'Events' },
                     { id: 'guestbook', icon: MessageSquare, label: 'GuestBook' },
                 ].map(item => (
                     <button 
                        key={item.id}
                        onClick={() => setActiveTab(item.id as any)}
                        className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-gold-900/50 text-gold-200' : 'text-stone-500'}`}
                     >
                         <item.icon size={20} className={activeTab === item.id ? 'animate-bounce-small' : ''} />
                         <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
                     </button>
                 ))}
             </nav>

             <LiveMapModal 
                userName={userName} 
                isOpen={showMapModal} 
                onClose={() => setShowMapModal(false)}
                activeUsers={activeUsers}
                isSharing={isLocationSharing}
                onToggleSharing={() => setIsLocationSharing(!isLocationSharing)}
             />
        </div>
    );
};

export default GuestDashboard;
