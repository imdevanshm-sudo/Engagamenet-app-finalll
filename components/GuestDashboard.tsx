import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, 
  ChevronRight, LogOut, Sparkles, Map, Send, 
  Smile, Upload, Phone, Download, Lock, Search, ExternalLink, Contact,
  User, Music, Info, MailCheck, X, Navigation, Share2, Check, LocateFixed, Compass, Flower
} from 'lucide-react';

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
    lat: number;
    lng: number;
    role: 'guest' | 'couple';
}

// --- Assets & Stickers ---
const FloralPattern = ({ className, opacity = 0.05 }: { className?: string, opacity?: number }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }}>
    <svg width="100%" height="100%">
      <pattern id="floral-pat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
         <path d="M30,5 C35,15 45,15 50,5 C40,10 40,20 50,25 C40,30 40,40 50,45 C45,35 35,35 30,45 C35,35 25,35 20,45 C20,35 20,25 10,25 C20,20 20,10 10,5 C15,15 25,15 30,5 Z" fill="currentColor" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#floral-pat)" />
    </svg>
  </div>
);

// --- Live Background Component ---
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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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

// --- Sub-Components ---

const CelebrationOverlay = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const confettiItems = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    animationDuration: 2 + Math.random() * 3 + 's',
    animationDelay: Math.random() * 0.5 + 's',
    type: i % 5 
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-lg animate-fade-in" style={{ touchAction: 'none' }}>
       {confettiItems.map((item) => (
          <div 
            key={item.id}
            className="absolute top-[-50px] animate-celebration-fall pointer-events-none"
            style={{
               left: item.left,
               animationDuration: item.animationDuration,
               animationDelay: item.animationDelay
            }}
          >
             {item.type === 0 && <Heart className="text-rose-500 fill-rose-500 drop-shadow-md" size={16 + Math.random() * 20} />}
             {item.type === 1 && <span className="text-2xl text-gold-400 drop-shadow-md">✿</span>}
             {item.type === 2 && <div className="w-3 h-6 bg-gradient-to-b from-gold-300 to-gold-500 rotate-45 shadow-sm" />}
             {item.type === 3 && <div className="w-4 h-4 bg-rose-600 rounded-tl-full rounded-br-full shadow-sm" />}
             {item.type === 4 && <Sparkles className="text-gold-200" size={20} />}
          </div>
       ))}
       
       <div className="glass-panel p-8 rounded-3xl shadow-2xl text-center transform animate-zoom-in duration-500 overflow-hidden max-w-xs mx-4 border border-gold-500/20">
           <div className="relative z-10 flex flex-col items-center">
               <h2 className="font-heading text-4xl text-gold-100 mb-2 drop-shadow-sm text-glow">Subh Kamnaye!</h2>
               <div className="w-16 h-1 bg-gold-400/30 rounded-full mb-4"></div>
               <p className="font-serif text-stone-300 leading-relaxed mb-6">
                   Your presence will make our day complete. <br/> RSVP Confirmed.
               </p>
               <button onClick={onClose} className="bg-gradient-to-r from-gold-500 to-gold-700 text-[#2d0a0d] px-8 py-3 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform hover:brightness-110">
                   Dhanyavaad
               </button>
           </div>
       </div>
    </div>
  );
};

const AdoreMeter = ({ count, onTrigger }: { count: number, onTrigger: () => void }) => {
    const fillPercent = Math.min(100, Math.max(10, (count * 0.1) % 110));
    const [hearts, setHearts] = useState<Array<{id: number, type: 'heart'|'ring'|'diamond', x: number}>>([]);

    const handleClick = () => {
        onTrigger();
        const id = Date.now();
        const types: ('heart'|'ring'|'diamond')[] = ['heart', 'ring', 'diamond'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * 40 - 20; 
        setHearts(prev => [...prev, { id, type, x }]);
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
    };

    return (
        <div className="flex flex-col items-center pointer-events-auto animate-fade-in delay-500 relative z-50" onClick={handleClick}>
            <div className="absolute bottom-full w-24 h-40 pointer-events-none overflow-hidden -z-10 left-1/2 -translate-x-1/2">
                 {hearts.map(h => (
                     <div key={h.id} className="absolute bottom-0 left-1/2 animate-sidebar-float text-rose-500 drop-shadow-lg" style={{ '--x': `${h.x}px` } as React.CSSProperties}>
                         {h.type === 'heart' && <Heart size={20} fill="currentColor" />}
                         {h.type === 'ring' && <div className="w-5 h-5 border-2 border-yellow-400 rounded-full"></div>}
                         {h.type === 'diamond' && <div className="w-4 h-4 bg-blue-400 rotate-45"></div>}
                     </div>
                 ))}
            </div>

            <div className="relative w-14 h-36 cursor-pointer group transition-transform active:scale-95 hover:scale-105 duration-300">
                <div className="absolute inset-0 bg-black/20 backdrop-blur-md rounded-full border border-white/20 shadow-xl"></div>
                <div className="absolute bottom-2 left-2 right-2 bg-stone-800/50 rounded-full overflow-hidden h-[80%] w-[calc(100%-16px)] ml-auto mr-auto z-10">
                    <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 transition-all duration-700 ease-out flex items-start justify-center pt-1 shadow-[0_0_15px_rgba(225,29,72,0.6)]"
                        style={{ height: `${fillPercent}%` }}
                    >
                         <div className="w-full h-2 bg-white/30 animate-pulse blur-[1px]"></div>
                    </div>
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 z-20 shadow-lg flex items-center justify-center border-2 border-rose-300">
                    <Heart size={16} fill="#fcd34d" className="text-gold-300 animate-pulse" />
                </div>
            </div>
            <div className="mt-2 px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-[9px] font-bold text-gold-200 tracking-widest uppercase shadow-sm border border-gold-500/30 text-center">
                Adore Meter<br/>{count}
            </div>
        </div>
    );
};

// --- Views ---

const GuestBookView = ({ userName, setViewMode, messages, onSendMessage, heartCount, onHeartTrigger, isRomanticMode }: { userName: string, setViewMode: (mode: 'directory' | 'wishes') => void, messages: Message[], onSendMessage: (text: string, stickerKey?: string) => void, heartCount: number, onHeartTrigger: () => void, isRomanticMode: boolean }) => {
    const [view, setView] = useState<'directory' | 'wishes'>('directory');
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState<'emoji' | 'sticker' | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");

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
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, view]);

    const sendMessage = (text: string = "", stickerKey?: string) => {
        onSendMessage(text, stickerKey);
        setInputText("");
        setActiveTab(null);
    };

    const filteredGuests = guestDirectory.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-full relative animate-fade-in bg-transparent">
            <div className="glass-deep p-4 pb-2 text-white shadow-lg z-20 shrink-0 border-b border-white/10">
                <h2 className="font-serif font-bold text-xl flex items-center gap-2 mb-3 text-gold-100"><Contact size={20} className="text-gold-400"/> Guest Book</h2>
                <div className="flex gap-2 bg-black/20 p-1 rounded-lg">
                    <button 
                        onClick={() => setView('directory')} 
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${view === 'directory' ? 'bg-white/10 text-gold-100 shadow-sm' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        Directory
                    </button>
                    <button 
                        onClick={() => setView('wishes')} 
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${view === 'wishes' ? 'bg-white/10 text-gold-100 shadow-sm' : 'text-white/50 hover:bg-white/5'}`}
                    >
                        Wishes & Chat
                    </button>
                </div>
            </div>
            
            {view === 'directory' ? (
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
                         {filteredGuests.length === 0 && (
                             <p className="text-center text-white/40 text-sm mt-8 italic">No guests found.</p>
                         )}
                     </div>
                </div>
            ) : (
                <div className="flex flex-col flex-grow h-full overflow-hidden relative">
                    {/* Backdrop specifically for chat to improve readability */}
                    <div className={`absolute inset-2 bottom-24 rounded-xl border backdrop-blur-md z-0 pointer-events-none transition-colors duration-500 ${isRomanticMode ? 'bg-black/40 border-white/10' : 'bg-white/60 border-white/30'}`}></div>

                    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-24 relative z-10 overscroll-contain mx-2">
                        {messages.map((msg, i) => {
                            const isMe = msg.sender === userName;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`} style={{ animationDelay: `${i * 20}ms` }}>
                                    {!isMe && (
                                        <div className="flex items-center gap-1 ml-1 mb-0.5">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${msg.isCouple ? 'bg-rose-900 text-rose-200' : 'bg-white/20 text-white'}`}>
                                                {msg.sender.charAt(0)}
                                            </div>
                                            <span className={`text-[10px] font-bold drop-shadow-sm ${isRomanticMode ? 'text-white/60' : 'text-stone-600'}`}>
                                                {msg.sender}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-4 py-2.5 text-sm font-serif shadow-lg backdrop-blur-md relative border ${
                                        msg.type === 'sticker' ? 'bg-transparent shadow-none border-none p-0' :
                                        isMe ? 'bg-gold-900/60 text-gold-100 rounded-2xl rounded-tr-none border-gold-500/30' : 
                                        msg.isCouple ? 'bg-rose-900/60 text-rose-100 border-rose-500/30 rounded-2xl rounded-tl-none' : 
                                        'bg-black/40 text-stone-200 border-white/10 rounded-2xl rounded-tl-none'
                                    }`}>
                                        {msg.type === 'sticker' && msg.stickerKey ? (
                                            <div className="w-24 h-24 drop-shadow-lg transform hover:scale-105 transition-transform">{STICKER_MAP[msg.stickerKey]}</div>
                                        ) : msg.text}
                                        {isMe && msg.type !== 'sticker' && <div className="absolute bottom-0 right-1 text-[8px] opacity-60"><Check size={10} /></div>}
                                    </div>
                                    <span className={`text-[9px] mt-1 mx-1 ${isRomanticMode ? 'text-white/30' : 'text-stone-500'}`}>{msg.timestamp}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Adore Meter Inside Chat */}
                    <div className="absolute bottom-[11rem] right-4 z-40">
                        <AdoreMeter count={heartCount} onTrigger={onHeartTrigger} />
                    </div>

                    <div className="p-3 glass-deep border-t border-white/10 relative z-50 pb-24 lg:pb-3">
                        {activeTab && (
                            <div className="absolute bottom-full left-0 right-0 bg-[#1a0507]/95 backdrop-blur-xl border-t border-gold-500/30 h-56 shadow-2xl animate-slide-up z-0 flex flex-col">
                                <div className="flex border-b border-white/10">
                                    <button onClick={() => setActiveTab('emoji')} className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'emoji' ? 'bg-white/10 text-gold-100 border-b-2 border-gold-500' : 'text-white/40'}`}>Emojis</button>
                                    <button onClick={() => setActiveTab('sticker')} className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'sticker' ? 'bg-white/10 text-gold-100 border-b-2 border-gold-500' : 'text-white/40'}`}>Stickers</button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 overscroll-contain">
                                {activeTab === 'sticker' ? (
                                    <div className="grid grid-cols-3 gap-4">
                                            {Object.keys(STICKER_MAP).map((key) => (
                                                <button key={key} onClick={() => sendMessage(undefined, key)} className="hover:scale-110 transition-transform p-2 bg-white/5 rounded-lg shadow-sm border border-white/10">
                                                    <div className="w-full aspect-square">{STICKER_MAP[key]}</div>
                                                </button>
                                            ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-6 gap-2 text-2xl">
                                        {["❤️", "🎉", "👏", "🔥", "🥰", "😍", "🥂", "💍", "🕺", "💃", "✨", "🌸"].map(emoji => (
                                            <button key={emoji} onClick={() => setInputText(prev => prev + emoji)} className="hover:bg-white/10 rounded p-2 transition-colors transform hover:scale-125">{emoji}</button>
                                        ))}
                                    </div>
                                )}
                                </div>
                            </div>
                        )}
                        <div className="flex items-center gap-2">
                            <button onClick={() => setActiveTab(activeTab ? null : 'sticker')} className="p-2 text-white/60 hover:text-gold-400 transition-colors"><Smile size={24}/></button>
                            <input 
                                type="text" 
                                value={inputText} 
                                onChange={e => setInputText(e.target.value)}
                                onFocus={() => setActiveTab(null)}
                                className="flex-grow bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500/50 text-white placeholder-white/30 transition-colors shadow-inner"
                                placeholder="Send wishes..."
                                onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
                            />
                            <button onClick={() => sendMessage(inputText)} className="p-2.5 bg-gradient-to-r from-gold-600 to-gold-400 text-[#2d0a0d] rounded-full hover:scale-105 active:scale-95 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.4)]"><Send size={18}/></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Map Component using Leaflet ---
const MapView = ({ userName }: { userName: string }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null); 
    const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
    const markersRef = useRef<Record<string, any>>({});
    const linesRef = useRef<Record<string, any>>({});
    const venuePos = [19.0436, 72.8193]; // Taj Lands End, Mumbai

    // Setup Live Location
    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        
        channel.onmessage = (event) => {
            const data = event.data as LocationUpdate;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({ ...prev, [data.id]: data }));
            }
        };

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const update: LocationUpdate = {
                    type: 'location_update',
                    id: userName,
                    name: userName,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    role: 'guest'
                };
                channel.postMessage(update);
                setActiveUsers(prev => ({ ...prev, [userName]: update }));
            },
            (err) => console.error(err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );

        return () => {
            channel.close();
            navigator.geolocation.clearWatch(watchId);
        };
    }, [userName]);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const L = (window as any).L;
        if (!L) return;

        mapInstance.current = L.map(mapRef.current).setView(venuePos, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Add Venue Marker
        const venueIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #be123c; color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 20px;">🏰</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        const venueMarker = L.marker(venuePos, { icon: venueIcon }).addTo(mapInstance.current);
        venueMarker.bindPopup("<b>Taj Lands End</b><br>The Royal Wedding Venue").openPopup();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update Markers & Lines
    useEffect(() => {
        if (!mapInstance.current) return;
        const L = (window as any).L;
        
        Object.values(activeUsers).forEach(user => {
            // Update Marker
            if (markersRef.current[user.id]) {
                markersRef.current[user.id].setLatLng([user.lat, user.lng]);
            } else {
                const isMe = user.name === userName;
                const isCouple = user.role === 'couple';
                
                const iconHtml = isCouple 
                    ? `<div style="background-color: #be123c; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">❤️</div>`
                    : `<div style="background-color: ${isMe ? '#15803d' : '#b45309'}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px;">${user.name.charAt(0)}</div>`;

                const icon = L.divIcon({
                    className: 'custom-user-icon',
                    html: iconHtml,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });

                const marker = L.marker([user.lat, user.lng], { icon }).addTo(mapInstance.current);
                marker.bindPopup(isMe ? "You are here" : user.name);
                markersRef.current[user.id] = marker;
            }

            // Update Line to Venue for EVERYONE to show convergence
            if (linesRef.current[user.id]) {
                linesRef.current[user.id].setLatLngs([[user.lat, user.lng], venuePos]);
            } else {
                const isCouple = user.role === 'couple';
                const line = L.polyline([[user.lat, user.lng], venuePos], {
                    color: isCouple ? '#be123c' : '#15803d',
                    weight: 2,
                    dashArray: '10, 10', 
                    opacity: 0.5
                }).addTo(mapInstance.current);
                linesRef.current[user.id] = line;
            }
        });

    }, [activeUsers]);

    return (
        <div className="flex flex-col h-full bg-transparent">
            <div className="glass-deep p-4 text-white shadow-lg z-20 shrink-0 flex justify-between items-center border-b border-white/10">
                <h2 className="font-serif font-bold text-xl flex items-center gap-2 text-gold-100"><Map size={20} className="text-gold-400"/> Live Map</h2>
                <div className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/20 text-green-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Updates Live
                </div>
            </div>
            <div className="flex-grow relative z-10">
                <div id="map" ref={mapRef} className="w-full h-full z-0 rounded-b-xl opacity-90"></div>
                
                {/* Overlay Info */}
                <div className="absolute bottom-24 left-4 right-4 glass-deep p-4 rounded-xl shadow-lg z-[1000] pointer-events-none">
                     <div className="flex items-start gap-3">
                         <div className="bg-green-900/50 p-2 rounded-full text-green-400 border border-green-500/30"><Navigation size={20} /></div>
                         <div>
                             <h3 className="font-bold text-gold-100 text-sm">Traveling to Taj Lands End</h3>
                             <p className="text-xs text-white/60">Everyone is traveling to the common venue point.</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
}

const Lightbox = ({ url, onClose, caption }: { url: string, onClose: () => void, caption?: string }) => (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300" style={{ touchAction: 'none' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
        <div className="max-w-4xl max-h-[80vh] w-full px-4 flex items-center justify-center">
            <img src={url} alt="Full view" className="max-w-full max-h-full object-contain rounded-md shadow-2xl" />
        </div>
        {caption && <p className="mt-4 text-gold-100 font-serif text-lg text-center">{caption}</p>}
        <button className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors">
             <Download size={18} /> Save Memory
        </button>
    </div>
);

const MemoriesView = ({ userName }: { userName: string }) => {
    const [photos, setPhotos] = useState<MediaItem[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('wedding_gallery_media');
        if (saved) setPhotos(JSON.parse(saved));
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhoto: MediaItem = {
                    id: Date.now().toString(),
                    url: reader.result as string,
                    type: 'image',
                    caption: `Uploaded by ${userName}`,
                    timestamp: Date.now()
                };
                const updated = [newPhoto, ...photos];
                setPhotos(updated);
                localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full bg-transparent animate-fade-in">
             <div className="glass-deep p-4 text-white shadow-lg z-20 shrink-0 flex justify-between items-center border-b border-white/10">
                <h2 className="font-serif font-bold text-xl flex items-center gap-2 text-gold-100"><Camera size={20} className="text-gold-400"/> Memories</h2>
                <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-gold-600 text-[#2d0a0d] px-4 py-2 rounded-full font-bold flex items-center gap-1 hover:brightness-110 transition-all shadow-[0_0_10px_rgba(234,179,8,0.3)]">
                    <Upload size={12}/> Upload
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </div>
            <div className="flex-grow overflow-y-auto p-4 pb-32 grid grid-cols-2 gap-4 content-start">
                {photos.map((photo, i) => (
                    <div key={i} onClick={() => setSelectedPhoto(photo)} className={`glass-deep rounded-xl overflow-hidden shadow-lg aspect-square relative group cursor-pointer animate-in zoom-in fill-mode-backwards duration-500 border border-white/10`} style={{ animationDelay: `${i * 50}ms` }}>
                        <img src={photo.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Memory"/>
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full text-white"><Camera size={20}/></div>
                        </div>
                    </div>
                ))}
                {photos.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center h-64 text-white/30">
                        <Camera size={48} className="mb-2 opacity-20" />
                        <p className="text-sm font-serif">No memories shared yet.</p>
                    </div>
                )}
            </div>
            {selectedPhoto && <Lightbox url={selectedPhoto.url} caption={selectedPhoto.caption} onClose={() => setSelectedPhoto(null)} />}
        </div>
    );
};

// --- Main Guest Dashboard ---

interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
  const [activeView, setActiveView] = useState<'home' | 'schedule' | 'chat' | 'gallery' | 'map'>('home');
  const [showCelebration, setShowCelebration] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);
  const [isRomanticMode, setIsRomanticMode] = useState(false);
  
  // State Lifted from GuestBookView
  const [messages, setMessages] = useState<Message[]>([]);
  const [heartCount, setHeartCount] = useState(0);

  useEffect(() => {
      const savedTheme = localStorage.getItem('wedding_theme_mode');
      if (savedTheme === 'romantic') setIsRomanticMode(true);

      const savedMessages = localStorage.getItem('wedding_chat_messages');
      if (savedMessages) setMessages(JSON.parse(savedMessages));

      const savedHearts = localStorage.getItem('wedding_heart_count');
      setHeartCount(savedHearts ? parseInt(savedHearts) : 450);

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (event) => {
          if (event.data.type === 'message') {
              setMessages(prev => {
                  const exists = prev.some(m => m.id === event.data.payload.id);
                  return exists ? prev : [...prev, event.data.payload];
              });
          }
          if (event.data.type === 'heart_update') {
              setHeartCount(event.data.count);
          }
          if (event.data.type === 'theme_update') {
              setIsRomanticMode(event.data.mode === 'romantic');
          }
      };
      return () => channel.close();
  }, []);

  useEffect(() => {
      if (messages.length > 0) {
          localStorage.setItem('wedding_chat_messages', JSON.stringify(messages));
      }
  }, [messages]);

  useEffect(() => {
      if (heartCount > 0) {
         localStorage.setItem('wedding_heart_count', heartCount.toString());
      }
  }, [heartCount]);

  const toggleTheme = () => {
      const newMode = !isRomanticMode;
      setIsRomanticMode(newMode);
      localStorage.setItem('wedding_theme_mode', newMode ? 'romantic' : 'default');
      
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'theme_update', mode: newMode ? 'romantic' : 'default' });
      channel.close();
  };

  const handleSendMessage = (text: string = "", stickerKey?: string) => {
      if (!text && !stickerKey) return;
      const newMsg: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          text,
          stickerKey,
          sender: userName,
          isCouple: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: stickerKey ? 'sticker' : 'text'
      };

      setMessages(prev => [...prev, newMsg]);
      
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'message', payload: newMsg });
      channel.close();
  };

  const handleHeartTrigger = () => {
      const newCount = heartCount + 1;
      setHeartCount(newCount);
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'heart_update', count: newCount });
      channel.close();
  };

  useEffect(() => {
      const hasSeen = sessionStorage.getItem('wedding_seen_celebration');
      if (!hasSeen) {
          setShowCelebration(true);
          sessionStorage.setItem('wedding_seen_celebration', 'true');
      }
  }, []);

  const handleRSVP = (status: 'yes' | 'no') => {
      setRsvpStatus(status);
      if (status === 'yes') setShowCelebration(true);
  };

  return (
    <div className={`w-full h-full flex flex-col relative font-serif overflow-hidden transition-all duration-1000 ${isRomanticMode ? 'bg-[#2d0a0d] text-gold-100' : 'bg-[#fffbf5] text-[#4a0e11]'}`}>
      
      {/* Romantic Mode / Cinematic Background */}
      {isRomanticMode ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {/* Deep Nebula Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_#881337_0%,_#2d0a0d_60%)]"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/20 blur-[100px] rounded-full animate-pulse-slow"></div>
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gold-600/10 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            
            {/* Floating Petals */}
            {Array.from({ length: 15 }).map((_, i) => (
                 <div key={i} className="absolute -top-10 text-rose-500/30 animate-petal-fall" style={{ 
                     left: `${Math.random()*100}%`, 
                     animationDuration: `${8 + Math.random()*10}s`, 
                     animationDelay: `${Math.random()*5}s`,
                     fontSize: `${10 + Math.random() * 20}px`,
                     filter: `blur(${Math.random() * 2}px)`
                 }}>
                     <Flower size={20} fill="currentColor" />
                 </div>
            ))}
        </div>
      ) : (
        // Normal Mode Background - Subtle Live Gold Dust
         <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fffbf5_0%,_#fef3c7_100%)] opacity-50"></div>
            <FloralPattern className="opacity-5" />
            <GoldDust opacity={0.3} />
         </div>
      )}

      {showCelebration && <CelebrationOverlay onClose={() => setShowCelebration(false)} />}
      
      {/* Theme Toggle */}
      <button 
         onClick={toggleTheme}
         className={`absolute top-6 right-6 z-50 p-3 rounded-full shadow-2xl transition-all duration-500 glass-deep group ${isRomanticMode ? 'text-rose-400 border-rose-500/50' : 'text-stone-400 border-stone-300'}`}
      >
          <Flower size={20} className={`group-hover:rotate-180 transition-transform duration-700 ${isRomanticMode ? 'text-rose-400 fill-rose-900/50' : ''}`} />
      </button>

      {/* Top Bar */}
      {activeView === 'home' && (
          <header className="p-6 pb-2 animate-slide-down relative z-10">
              <div className="flex justify-between items-start">
                  <div>
                      <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${isRomanticMode ? 'text-gold-200/70' : 'text-stone-500'}`}>Namaste,</p>
                      <h1 className={`text-3xl font-heading leading-none ${isRomanticMode ? 'text-transparent bg-clip-text bg-gradient-to-r from-gold-100 via-gold-300 to-gold-500 text-glow' : 'text-[#4a0e11]'}`}>{userName.split(' ')[0]}</h1>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg border ${isRomanticMode ? 'glass-deep text-gold-200 border-gold-500/30' : 'bg-white text-[#4a0e11] border-stone-100'}`}>
                      <User size={20} />
                  </div>
              </div>
          </header>
      )}

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative z-10">
          {activeView === 'home' && (
              <div className="h-full overflow-y-auto p-6 pb-32 space-y-6 overscroll-contain">
                  {/* Welcome Card 3D */}
                  <div className={`rounded-3xl p-8 relative overflow-hidden shadow-2xl group transition-all duration-500 perspective-1000 transform hover:scale-[1.02] ${isRomanticMode ? 'glass-deep border border-rose-500/20' : 'bg-white text-[#4a0e11] border border-stone-100'}`}>
                      
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
                      
                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-6">
                              <span className={`text-[10px] font-bold px-3 py-1 rounded-full border ${isRomanticMode ? 'bg-gold-500/10 text-gold-300 border-gold-500/30' : 'bg-gold-100 text-gold-800 border-gold-200'}`}>42 Days To Go</span>
                              <Heart className={`animate-pulse ${isRomanticMode ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]' : 'text-rose-500 fill-rose-500'}`} size={24} />
                          </div>
                          <h2 className={`font-heading text-3xl mb-2 ${isRomanticMode ? 'text-gradient-gold' : 'text-[#4a0e11]'}`}>Sneha & Aman</h2>
                          <p className={`text-sm leading-relaxed mb-8 font-serif ${isRomanticMode ? 'text-white/70' : 'text-stone-600'}`}>
                              We are delighted to have you join us in celebrating our union.
                          </p>
                          
                          {rsvpStatus === null ? (
                              <div className="flex gap-3">
                                  <button onClick={() => handleRSVP('yes')} className="flex-1 bg-gradient-to-r from-gold-500 to-gold-700 text-[#2d0a0d] py-3 rounded-xl font-bold text-sm shadow-lg hover:brightness-110 transition-all">I'm Attending</button>
                                  <button onClick={() => handleRSVP('no')} className={`px-5 py-3 rounded-xl border text-sm font-bold transition-colors ${isRomanticMode ? 'border-white/20 text-white/60 hover:bg-white/5' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>Sorry, can't</button>
                              </div>
                          ) : (
                              <div className={`rounded-xl p-4 flex items-center gap-3 border ${isRomanticMode ? 'bg-green-900/20 border-green-500/30' : 'bg-green-50 border-green-100'}`}>
                                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md"><Check size={16}/></div>
                                  <div>
                                      <p className={`text-sm font-bold ${isRomanticMode ? 'text-green-400' : 'text-green-800'}`}>RSVP Sent</p>
                                      <p className={`text-[10px] ${isRomanticMode ? 'text-green-400/60' : 'text-green-700/60'}`}>Thank you for your response!</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-4">
                      {[
                          { id: 'schedule', icon: Calendar, label: 'Events', color: 'rose' },
                          { id: 'map', icon: MapPin, label: 'Location', color: 'blue' },
                          { id: 'gallery', icon: Camera, label: 'Photos', color: 'purple' },
                          { id: 'chat', icon: MessageSquare, label: 'Guest Book', color: 'orange' },
                      ].map((item) => (
                          <button 
                            key={item.id}
                            onClick={() => setActiveView(item.id as any)} 
                            className={`p-6 rounded-2xl shadow-lg flex flex-col items-center gap-4 transition-all active:scale-95 hover:-translate-y-1 ${
                                isRomanticMode 
                                ? 'glass-deep hover:bg-white/5' 
                                : 'bg-white border border-stone-100 hover:shadow-xl'
                            }`}
                          >
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-inner ${
                                  isRomanticMode 
                                  ? 'bg-white/5 border border-white/10 text-gold-300' 
                                  : `bg-${item.color}-50 text-${item.color}-600`
                              }`}>
                                  <item.icon size={28} strokeWidth={1.5}/>
                              </div>
                              <span className={`text-sm font-bold tracking-wide ${isRomanticMode ? 'text-gold-100' : 'text-stone-700'}`}>{item.label}</span>
                          </button>
                      ))}
                  </div>

                  {/* Story Teaser */}
                  <div className={`rounded-2xl p-5 shadow-lg flex items-center gap-4 ${
                      isRomanticMode 
                      ? 'glass-deep' 
                      : 'bg-white border border-stone-100 text-[#4a0e11]'
                  }`}>
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-lg border border-white/10">
                          <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400" className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div>
                          <h3 className={`font-bold text-base ${isRomanticMode ? 'text-gold-200' : 'text-[#4a0e11]'}`}>Our Story</h3>
                          <p className={`text-xs mt-2 line-clamp-2 leading-relaxed ${isRomanticMode ? 'text-white/60' : 'text-stone-500'}`}>From a chance meeting at a coffee shop to a lifetime together...</p>
                          <button className={`text-[10px] font-bold mt-3 uppercase tracking-wider flex items-center gap-1 ${isRomanticMode ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600'}`}>Read More <ChevronRight size={12}/></button>
                      </div>
                  </div>
              </div>
          )}

          {activeView === 'chat' && (
             <GuestBookView 
                userName={userName} 
                setViewMode={() => {}} 
                messages={messages}
                onSendMessage={handleSendMessage}
                heartCount={heartCount}
                onHeartTrigger={handleHeartTrigger}
                isRomanticMode={isRomanticMode}
             />
          )}
          {activeView === 'gallery' && <MemoriesView userName={userName} />}
          {activeView === 'map' && <MapView userName={userName} />}
          
          {activeView === 'schedule' && (
              <div className="h-full overflow-y-auto p-6 pb-32 animate-fade-in">
                  <div className={`-mx-6 -mt-6 p-8 pb-10 mb-6 relative overflow-hidden ${isRomanticMode ? 'bg-gradient-to-b from-rose-950 to-transparent' : 'bg-[#4a0e11] text-white'}`}>
                      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                      <h2 className={`text-3xl font-heading relative z-10 ${isRomanticMode ? 'text-gradient-gold' : 'text-gold-100'}`}>Wedding Events</h2>
                      <p className="text-gold-400 text-sm font-serif relative z-10 mt-1">Dec 20 - Dec 22, 2025</p>
                  </div>
                  
                  <div className="space-y-8 relative pl-4">
                      {/* Timeline Line */}
                      <div className={`absolute left-4 top-2 bottom-0 w-[2px] ${isRomanticMode ? 'bg-white/10' : 'bg-stone-200'}`}></div>

                      {[
                          { title: "Mehndi Ceremony", time: "Dec 20, 4:00 PM", loc: "Poolside Gardens", icon: "🌿" },
                          { title: "Sangeet Night", time: "Dec 20, 7:30 PM", loc: "Grand Ballroom", icon: "💃" },
                          { title: "Haldi", time: "Dec 21, 10:00 AM", loc: "Courtyard", icon: "✨" },
                          { title: "The Wedding", time: "Dec 21, 6:00 PM", loc: "Taj Lands End", icon: "💍" }
                      ].map((event, i) => (
                          <div key={i} className="relative pl-8 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                              <div className={`absolute left-0 top-1 w-8 h-8 -ml-4 rounded-full shadow-lg flex items-center justify-center text-lg z-10 border-4 ${isRomanticMode ? 'bg-rose-900 border-rose-950 text-gold-200' : 'bg-white border-[#fffbf5]'}`}>
                                  {event.icon}
                              </div>
                              <div className={`p-6 rounded-xl shadow-lg transition-all hover:-translate-y-1 ${
                                  isRomanticMode 
                                  ? 'glass-deep' 
                                  : 'bg-white border border-stone-100 text-[#4a0e11]'
                              }`}>
                                  <h3 className={`font-heading text-xl mb-2 ${isRomanticMode ? 'text-gold-100' : 'text-[#4a0e11]'}`}>{event.title}</h3>
                                  <div className={`flex flex-col gap-1.5 text-xs font-bold uppercase tracking-wider ${isRomanticMode ? 'text-white/60' : 'text-stone-500'}`}>
                                      <span className="flex items-center gap-2"><Clock size={14} className="opacity-70"/> {event.time}</span>
                                      <span className={`flex items-center gap-2 ${isRomanticMode ? 'text-rose-300' : 'text-rose-700'}`}><MapPin size={14}/> {event.loc}</span>
                                  </div>
                                  <button onClick={() => setActiveView('map')} className={`mt-4 text-[10px] px-4 py-2 rounded-full font-bold transition-colors border ${isRomanticMode ? 'border-white/20 hover:bg-white/10 text-white' : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-100'}`}>View Location</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </main>

      {/* Bottom Navigation */}
      <nav className={`absolute bottom-6 left-6 right-6 rounded-2xl p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)] border z-40 flex justify-between items-center backdrop-blur-xl ${isRomanticMode ? 'bg-black/60 border-white/10' : 'bg-black/80 border-white/10'}`}>
           {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'schedule', icon: Calendar, label: 'Events' },
              { id: 'map', icon: Map, label: 'Map' },
              { id: 'chat', icon: MessageSquare, label: 'Guestbook' },
           ].map((item) => (
               <button 
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-all duration-300 ${activeView === item.id ? 'text-gold-400 bg-white/10 shadow-inner' : 'text-white/40 hover:text-white'}`}
               >
                   <item.icon size={20} strokeWidth={activeView === item.id ? 2.5 : 1.5} />
                   <span className="text-[9px] font-medium tracking-wide">{item.label}</span>
               </button>
           ))}
           <button onClick={onLogout} className="flex-1 flex flex-col items-center gap-1.5 py-2 rounded-xl text-rose-500 hover:bg-rose-900/20 transition-colors">
               <LogOut size={20} strokeWidth={1.5} />
               <span className="text-[9px] font-medium tracking-wide">Exit</span>
           </button>
      </nav>
    </div>
  );
};

export default GuestDashboard;