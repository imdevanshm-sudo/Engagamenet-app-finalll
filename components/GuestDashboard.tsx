
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, 
  ChevronRight, LogOut, Sparkles, Map, Send, 
  Smile, Upload, Phone, Download, Lock, Search, ExternalLink, Contact,
  User, Music, Info, MailCheck, X, Navigation, Share2, Check, LocateFixed, Compass, Flower, Settings, Bell, ToggleLeft, ToggleRight, Trash2, RefreshCw, Battery, Wifi, WifiOff, Smartphone, Users, Plus, Minus, Loader, Disc
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

interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover: string;
    durationStr: string;
}

const DEFAULT_EVENTS: WeddingEvent[] = [
    { id: '1', title: "Mehndi Ceremony", time: "Dec 20, 4:00 PM", loc: "Poolside Gardens", icon: "🌿" },
    { id: '2', title: "Sangeet Night", time: "Dec 20, 7:30 PM", loc: "Grand Ballroom", icon: "💃" },
    { id: '3', title: "Haldi", time: "Dec 21, 10:00 AM", loc: "Courtyard", icon: "✨" },
    { id: '4', title: "The Wedding", time: "Dec 21, 6:00 PM", loc: "Grand Lawn", icon: "💍" },
];

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

const MapTree = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M50,80 L50,100" stroke="#5D4037" strokeWidth="8" />
      <path d="M20,80 Q10,60 30,40 Q10,30 40,10 Q70,30 60,40 Q90,60 80,80 Q50,90 20,80 Z" fill="#4a7c59" stroke="#33523f" strokeWidth="2" />
      <circle cx="30" cy="50" r="3" fill="#ef4444" opacity="0.6" />
      <circle cx="60" cy="30" r="3" fill="#ef4444" opacity="0.6" />
      <circle cx="70" cy="60" r="3" fill="#ef4444" opacity="0.6" />
    </svg>
  );
  
const MapElephant = ({ className, flip }: { className?: string, flip?: boolean }) => (
    <svg viewBox="0 0 100 60" className={className} style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
        <path d="M20,40 C10,40 10,20 30,15 C40,10 60,10 75,20 C85,25 90,40 90,50 L85,50 L85,40 L75,40 L75,50 L65,50 L65,40 L40,40" fill="#5D4037" />
        <path d="M20,40 Q25,50 15,55" stroke="#5D4037" strokeWidth="3" fill="none" />
        <rect x="40" y="15" width="25" height="20" fill="#c05621" rx="2" />
        <path d="M40,15 L65,15 L65,35 L40,35 Z" fill="url(#elephantPattern)" fillOpacity="0.5" />
        <defs>
        <pattern id="elephantPattern" width="4" height="4" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="#fcd34d" />
        </pattern>
        </defs>
    </svg>
);

const MapNode: React.FC<{ x: number; y: number; name: string; delay?: number; phone?: string; type?: 'guest' | 'couple' }> = ({ x, y, name, delay = 0, phone, type = 'guest' }) => {
    return (
        <div 
            className="absolute flex flex-col items-center z-20 group animate-in zoom-in duration-700 fill-mode-backwards cursor-pointer transition-all duration-500"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', animationDelay: `${delay}ms` }}
        >
            <div 
              className={`relative rounded-full shadow-[0_25px_35px_-5px_rgba(0,0,0,0.7),0_0_0_2px_${type === 'couple' ? '#e11d48' : '#fbbf24'}] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-4 w-16 h-16 p-[4px] ${type === 'couple' ? 'bg-rose-950' : 'bg-[#1a0405]'}`}
              style={{ transform: 'perspective(500px) rotateX(10deg)' }}
            >
                <div className={`w-full h-full rounded-full border ${type === 'couple' ? 'border-rose-400' : 'border-gold-500/30'} overflow-hidden relative bg-[#2d0a0d] flex items-center justify-center`}>
                    {type === 'couple' ? (
                        <Heart size={24} className="text-rose-500 fill-rose-500 animate-pulse" />
                    ) : (
                        <Users size={24} className="text-gold-300 opacity-80" />
                    )}
                </div>
                {type === 'couple' && (
                     <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-50"></div>
                )}
            </div>
            <div className={`mt-4 px-4 py-1 ${type === 'couple' ? 'bg-rose-900/90 border-rose-500' : 'bg-[#4a0e11]/90 border-[#f59e0b]/50'} backdrop-blur-md rounded-full border shadow-[0_8px_16px_rgba(0,0,0,0.6)] transform transition-transform group-hover:scale-105 group-hover:-translate-y-1`}>
                <span className="text-[#fef3c7] text-xs sm:text-sm font-serif font-bold whitespace-nowrap tracking-wide drop-shadow-sm">{name}</span>
            </div>
            <div className="absolute top-[90%] left-1/2 w-1 h-8 bg-black/30 -translate-x-1/2 blur-[2px] origin-top transform skew-x-[20deg] z-[-1]"></div>
        </div>
    );
};

// --- Hooks ---

const usePanZoom = (initialScale = 1, minScale = 0.5, maxScale = 3) => {
    const [transform, setTransform] = useState({ x: 0, y: 0, scale: initialScale, rotate: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const lastPos = useRef({ x: 0, y: 0 });
    const [pinchDist, setPinchDist] = useState<number | null>(null);
    const [pinchCenter, setPinchCenter] = useState<{x: number, y: number} | null>(null);
  
    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
  
      if ('touches' in e && e.touches.length === 2) {
         const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
         );
         const center = {
             x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
             y: (e.touches[0].clientY + e.touches[1].clientY) / 2
         };
         setPinchDist(dist);
         setPinchCenter(center);
         return;
      }
  
      setIsDragging(true);
      lastPos.current = { x: clientX - transform.x, y: clientY - transform.y };
    };
  
    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
      if ('touches' in e && e.touches.length === 2 && pinchDist !== null && pinchCenter !== null) {
         e.preventDefault();
         const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
         );
         const center = {
             x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
             y: (e.touches[0].clientY + e.touches[1].clientY) / 2
         };
  
         const deltaScale = dist - pinchDist;
         const newScale = Math.min(maxScale, Math.max(minScale, transform.scale + deltaScale * 0.005));
         
         const deltaX = center.x - pinchCenter.x;
         const deltaY = center.y - pinchCenter.y;
  
         setTransform(prev => ({ 
             ...prev, 
             scale: newScale,
             x: prev.x + deltaX,
             y: prev.y + deltaY
         }));
         setPinchDist(dist);
         setPinchCenter(center);
         return;
      }
  
      if (!isDragging) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      
      if ('touches' in e) e.preventDefault(); 

      setTransform(prev => ({
         ...prev,
         x: clientX - lastPos.current.x,
         y: clientY - lastPos.current.y
      }));
    };
  
    const handleMouseUp = () => {
        setIsDragging(false);
        setPinchDist(null);
        setPinchCenter(null);
    };
  
    const handlers = {
        onMouseDown: handleMouseDown,
        onTouchStart: handleMouseDown,
        onMouseMove: handleMouseMove,
        onTouchMove: handleMouseMove,
        onMouseUp: handleMouseUp,
        onTouchEnd: handleMouseUp,
        onMouseLeave: handleMouseUp
    };
    
    const style: React.CSSProperties = { touchAction: 'none' };
  
    return { transform, isDragging, handlers, style };
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

// --- Settings View ---
const SettingsView = ({ onClose }: { onClose: () => void }) => {
    const [locationEnabled, setLocationEnabled] = useState(() => localStorage.getItem('wedding_setting_location') === 'true');
    const [notificationsEnabled, setNotificationsEnabled] = useState(() => localStorage.getItem('wedding_setting_notifications') === 'true');
    const [cameraAccess, setCameraAccess] = useState(false);
    const [cacheSize, setCacheSize] = useState("0 MB");

    useEffect(() => {
        if ('caches' in window) {
            caches.keys().then(keys => setCacheSize(`${keys.length * 2} MB (Est)`));
        }
        navigator.permissions?.query({ name: 'camera' as any }).then(status => {
            setCameraAccess(status.state === 'granted');
        }).catch(() => {});
    }, []);

    const toggleLocation = () => {
        const newState = !locationEnabled;
        setLocationEnabled(newState);
        localStorage.setItem('wedding_setting_location', String(newState));
    };

    const toggleNotifications = () => {
        if (!notificationsEnabled && 'Notification' in window) {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    setNotificationsEnabled(true);
                    localStorage.setItem('wedding_setting_notifications', 'true');
                }
            });
        } else {
            setNotificationsEnabled(false);
            localStorage.setItem('wedding_setting_notifications', 'false');
        }
    };

    const clearCache = async () => {
        if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
            setCacheSize("0 MB");
            alert("Cache cleared successfully. App will reload.");
            window.location.reload();
        }
    };

    return (
        <div className="h-full flex flex-col bg-[#2d0a0d] text-gold-100 p-4 pb-32 animate-fade-in">
            <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                <button onClick={onClose}><ChevronRight className="rotate-180" /></button>
                <h2 className="text-xl font-heading">App Settings</h2>
            </div>

            <div className="space-y-6">
                {/* Permissions Section */}
                <div className="glass-deep p-4 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Permissions & Hardware</h3>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <MapPin size={20} className="text-rose-400" />
                            <div>
                                <p className="font-bold text-sm">Location Tracking</p>
                                <p className="text-[10px] text-white/50">Enable live updates on the map</p>
                            </div>
                        </div>
                        <button onClick={toggleLocation}>
                            {locationEnabled ? <ToggleRight size={32} className="text-green-400" /> : <ToggleLeft size={32} className="text-white/30" />}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Bell size={20} className="text-gold-400" />
                            <div>
                                <p className="font-bold text-sm">Notifications</p>
                                <p className="text-[10px] text-white/50">Get updates on events</p>
                            </div>
                        </div>
                        <button onClick={toggleNotifications}>
                            {notificationsEnabled ? <ToggleRight size={32} className="text-green-400" /> : <ToggleLeft size={32} className="text-white/30" />}
                        </button>
                    </div>

                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Camera size={20} className="text-blue-400" />
                            <div>
                                <p className="font-bold text-sm">Camera Access</p>
                                <p className="text-[10px] text-white/50">{cameraAccess ? 'Granted' : 'Not Granted'}</p>
                            </div>
                        </div>
                        <span className={`w-2 h-2 rounded-full ${cameraAccess ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    </div>
                </div>

                {/* Storage & Data */}
                <div className="glass-deep p-4 rounded-xl space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Storage & Data</h3>
                    
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Trash2 size={20} className="text-red-400" />
                            <div>
                                <p className="font-bold text-sm">Clear Cache</p>
                                <p className="text-[10px] text-white/50">Used: {cacheSize}</p>
                            </div>
                        </div>
                        <button onClick={clearCache} className="text-xs bg-red-900/50 border border-red-500/30 px-3 py-1 rounded text-red-200">Clear</button>
                    </div>

                    <div className="flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <RefreshCw size={20} className="text-blue-400" />
                            <div>
                                <p className="font-bold text-sm">Check for Update</p>
                                <p className="text-[10px] text-white/50">v1.2.0</p>
                            </div>
                        </div>
                         <button onClick={() => window.location.reload()} className="text-xs bg-blue-900/50 border border-blue-500/30 px-3 py-1 rounded text-blue-200">Reload</button>
                    </div>
                </div>

                {/* Device Stats */}
                <div className="grid grid-cols-2 gap-4">
                     <div className="glass-deep p-3 rounded-xl flex items-center gap-3">
                         <Battery size={20} className="text-green-400" />
                         <div>
                             <p className="text-[10px] text-white/50">Battery</p>
                             <p className="text-xs font-bold">Optimized</p>
                         </div>
                     </div>
                     <div className="glass-deep p-3 rounded-xl flex items-center gap-3">
                         {navigator.onLine ? <Wifi size={20} className="text-green-400" /> : <WifiOff size={20} className="text-red-400" />}
                         <div>
                             <p className="text-[10px] text-white/50">Network</p>
                             <p className="text-xs font-bold">{navigator.onLine ? 'Online' : 'Offline'}</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

// --- Views ---

const GuestBookView = ({ userName, messages, onSendMessage, heartCount, onHeartTrigger, isRomanticMode, gallery, onUpload }: { userName: string, messages: Message[], onSendMessage: (text: string, stickerKey?: string) => void, heartCount: number, onHeartTrigger: () => void, isRomanticMode: boolean, gallery: MediaItem[], onUpload: () => void }) => {
    const [view, setView] = useState<'directory' | 'wishes' | 'gallery'>('directory');
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
        
        // Simulate network delay
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
                         {filteredGuests.length === 0 && (
                             <p className="text-center text-white/40 text-sm mt-8 italic">No guests found.</p>
                         )}
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
                                placeholder="Write a wish..."
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(inputText)}
                            />
                            <button onClick={() => sendMessage(inputText)} disabled={isSending || !inputText.trim()} className="p-2.5 bg-gold-600 rounded-full text-[#2d0a0d] hover:bg-gold-500 transition-colors active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                                {isSending ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const LiveMapModal: React.FC<{ isOpen: boolean; onClose: () => void; userName: string; activeUsers: Record<string, LocationUpdate> }> = ({ isOpen, onClose, userName, activeUsers }) => {
    const { transform, handlers, style } = usePanZoom(1, 0.5, 3);
    const [viewMode, setViewMode] = useState<'venue' | 'google'>('venue');
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const venuePos = [26.7857, 83.0763];

    // Leaflet Effect
    useEffect(() => {
        if (viewMode === 'google' && isOpen && mapRef.current && !mapInstance.current) {
             const L = (window as any).L;
             if (!L) return;
             
             mapInstance.current = L.map(mapRef.current).setView(venuePos, 13);
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
             }).addTo(mapInstance.current);

             const venueIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #be123c; color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 20px;">🏰</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            L.marker(venuePos, { icon: venueIcon }).addTo(mapInstance.current).bindPopup("Hotel Soni International");
        }
        
        if (viewMode !== 'google' && mapInstance.current) {
             mapInstance.current.remove();
             mapInstance.current = null;
        }
    }, [viewMode, isOpen]);

    // Update Markers
    useEffect(() => {
        if (!mapInstance.current || viewMode !== 'google') return;
        const L = (window as any).L;
        
        Object.values(activeUsers).forEach((user: LocationUpdate) => {
            if (user.lat && user.lng) {
                if (markersRef.current[user.id]) {
                    markersRef.current[user.id].setLatLng([user.lat, user.lng]);
                } else {
                    const isMe = user.name === userName;
                    const safeName = escapeHtml(user.name);
                    const iconHtml = `
                        <div class="relative flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-110">
                            <div class="w-8 h-8 rounded-full border-2 shadow-2xl flex items-center justify-center font-bold text-sm backdrop-blur-md ${
                                isMe 
                                    ? 'bg-green-900/90 border-green-400 text-green-100 shadow-green-500/50' 
                                    : 'bg-amber-900/90 border-amber-400 text-amber-100 shadow-amber-500/30'
                            }">
                                ${safeName.charAt(0)}
                            </div>
                             <div class="mt-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white whitespace-nowrap border border-white/10 shadow-lg">
                                ${isMe ? 'You' : safeName}
                            </div>
                        </div>
                    `;

                    const icon = L.divIcon({
                        className: 'bg-transparent border-none',
                        html: iconHtml,
                        iconSize: [40, 60],
                        iconAnchor: [20, 20]
                    });

                    const marker = L.marker([user.lat, user.lng], { icon }).addTo(mapInstance.current);
                    markersRef.current[user.id] = marker;
                }
            }
        });
    }, [activeUsers, viewMode]);

    const VENUE_ZONES = [
        { name: "Grand Stage", x: 50, y: 20, w: 30, h: 15, color: "#be123c" },
        { name: "Mandap", x: 80, y: 50, w: 20, h: 20, color: "#b45309" },
        { name: "Royal Dining", x: 20, y: 50, w: 25, h: 25, color: "#15803d" },
        { name: "Entrance", x: 50, y: 90, w: 20, h: 10, color: "#4a0e11" },
        { name: "Bar", x: 80, y: 80, w: 15, h: 15, color: "#1d4ed8" },
    ];

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] bg-[#2d0a0d] flex flex-col animate-in fade-in duration-300">
             <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                 <div className="pointer-events-auto">
                    <h2 className="text-gold-100 font-heading text-2xl drop-shadow-md">{viewMode === 'venue' ? 'Live Venue Tracker' : 'Realtime Google Maps'}</h2>
                    <p className="text-gold-400 text-xs font-serif opacity-80">
                        {viewMode === 'venue' ? 'Find your friends.' : 'Tracking all guests live.'}
                    </p>
                 </div>
                 <button onClick={onClose} className="text-white bg-white/10 p-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors pointer-events-auto"><X size={24}/></button>
             </div>

             {/* Toggle Switch */}
             <div className="absolute top-20 left-0 right-0 z-30 flex justify-center pointer-events-none">
                 <div className="bg-black/40 backdrop-blur-md rounded-full p-1 flex border border-gold-500/30 pointer-events-auto shadow-lg">
                     <button 
                        onClick={() => setViewMode('venue')}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'venue' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-300 hover:text-gold-100'}`}
                     >
                         Venue Tracker
                     </button>
                     <button 
                        onClick={() => setViewMode('google')}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'google' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-300 hover:text-gold-100'}`}
                     >
                         Map View
                     </button>
                 </div>
             </div>
             
             <div className="flex-grow overflow-hidden relative bg-[#1a0507]" style={{ touchAction: 'none' }}>
                 {viewMode === 'venue' ? (
                  <div className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden" {...handlers} style={style}>
                      <div 
                        className="absolute inset-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
                        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
                      >
                          <div className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 bg-[#f5f5f4] border-[20px] border-[#4a0e11] shadow-2xl overflow-hidden">
                                  <>
                                    <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a0e11 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                                    
                                    {VENUE_ZONES.map((zone, i) => (
                                        <div key={i} className="absolute border-2 border-dashed flex items-center justify-center text-center p-2 opacity-60 hover:opacity-100 transition-opacity" 
                                            style={{ 
                                                left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`, 
                                                transform: 'translate(-50%, -50%)',
                                                borderColor: zone.color, backgroundColor: `${zone.color}10`
                                            }}>
                                            <span className="font-serif font-bold text-[10px] uppercase tracking-wider text-[#4a0e11] bg-white/80 px-2 py-1 rounded-full shadow-sm">{zone.name}</span>
                                        </div>
                                    ))}

                                    <MapTree className="absolute top-[15%] left-[15%] w-24 h-24 opacity-80" />
                                    <MapTree className="absolute top-[15%] right-[15%] w-24 h-24 opacity-80" />
                                    <MapElephant className="absolute bottom-[20%] left-[10%] w-32 h-20 opacity-60" />
                                    <MapElephant className="absolute bottom-[20%] right-[10%] w-32 h-20 opacity-60" flip />
                                  </>
                              
                              {/* Render Users */}
                              {Object.values(activeUsers).map((u: LocationUpdate, i) => {
                                  return <MapNode key={i} x={u.x} y={u.y} name={u.name === userName ? 'You' : u.name} type={u.role} delay={i * 100} />;
                              })}
                          </div>
                      </div>
                  </div>
                 ) : (
                     <div id="guest-map" ref={mapRef} className="w-full h-full bg-stone-200"></div>
                 )}
             </div>
        </div>
    );
};

// --- Main Guest Dashboard Component ---

interface GuestDashboardProps {
  userName: string;
  onLogout?: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
  const [isRsvpOpen, setIsRsvpOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false);
  const [config, setConfig] = useState({ coupleName: "Sneha & Aman", date: "2025-11-26" });
  const [events, setEvents] = useState<WeddingEvent[]>(DEFAULT_EVENTS);
  const [isRomanticMode, setIsRomanticMode] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Music State
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Gallery State
  const [gallery, setGallery] = useState<MediaItem[]>([]);

  // Slider Bar State
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Message & Heart State Lifted to Parent Simulation
  const [messages, setMessages] = useState<Message[]>(() => {
      if (typeof window === 'undefined') return [];
      const saved = localStorage.getItem('wedding_chat_messages');
      if (saved) {
          try { return JSON.parse(saved); } catch (e) { console.error(e); }
      }
      return [
          { id: '1', text: "So excited to see you all! Let the celebrations begin! 🎉", sender: "Sneha Gupta", isCouple: true, timestamp: "10:30 AM", type: 'text' },
          { id: '2', text: "The excitement is real! Looking forward to celebrating with everyone.", sender: "Ravi Sharma", isCouple: false, timestamp: "10:35 AM", type: 'text' },
      ];
  });
  const [globalHeartCount, setGlobalHeartCount] = useState<number>(() => {
      if (typeof window === 'undefined') return 0;
      const saved = localStorage.getItem('wedding_heart_count');
      return saved ? parseInt(saved) : 42; 
  });

  // --- Broadcast Channel Listener ---
  useEffect(() => {
      // Check theme
      const savedTheme = localStorage.getItem('wedding_theme_mode');
      if (savedTheme === 'romantic') setIsRomanticMode(true);

      // Load Data
      const savedEvents = localStorage.getItem('wedding_events');
      if (savedEvents) {
          try { setEvents(JSON.parse(savedEvents)); } catch(e) {}
      }
      const savedGallery = localStorage.getItem('wedding_gallery_media');
      if(savedGallery) {
          try { setGallery(JSON.parse(savedGallery)); } catch(e) {}
      }

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (event) => {
          const data = event.data;
          switch(data.type) {
              case 'message': 
                  setMessages((prev) => {
                      if (prev.some(m => m.id === data.payload.id)) return prev;
                      return [...prev, data.payload];
                  });
                  break;
              case 'message_sync': // Bulk update (e.g. admin delete)
                  setMessages(data.payload);
                  break;
              case 'heart_update':
                  setGlobalHeartCount(data.count);
                  break;
              case 'theme_update':
                  setIsRomanticMode(data.mode === 'romantic');
                  break;
              case 'playlist_update':
                  setCurrentSong(data.currentSong);
                  setIsPlaying(data.isPlaying);
                  break;
              case 'gallery_sync':
                  setGallery(data.payload);
                  break;
              case 'event_sync':
                  setEvents(data.payload);
                  break;
              case 'config_sync':
                  setConfig(data.payload);
                  break;
          }
      };
      return () => channel.close();
  }, []);

  useEffect(() => {
      localStorage.setItem('wedding_chat_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
      localStorage.setItem('wedding_heart_count', globalHeartCount.toString());
  }, [globalHeartCount]);

  const broadcastMessage = (msg: Message) => {
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'message', payload: msg });
      channel.close();
  };

  const broadcastHeartUpdate = (count: number) => {
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'heart_update', count });
      channel.close();
  };

  const broadcastGalleryUpdate = (photos: MediaItem[]) => {
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'gallery_sync', payload: photos });
      channel.close();
  }

  const handleSendMessage = (text: string, stickerKey?: string) => {
      const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          text: stickerKey ? undefined : text,
          stickerKey: stickerKey,
          sender: userName,
          isCouple: false,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: stickerKey ? 'sticker' : 'text'
      };
      setMessages(prev => [...prev, newMessage]);
      broadcastMessage(newMessage);
  };

  const triggerHeart = () => {
      const newCount = globalHeartCount + 1;
      setGlobalHeartCount(newCount);
      broadcastHeartUpdate(newCount);
  };

  const handlePhotoUpload = () => {
      // Simulate uploading a photo
      const newPhoto: MediaItem = {
          id: Date.now().toString(),
          url: `https://source.unsplash.com/random/800x800/?wedding,party&sig=${Math.random()}`, // Random placeholder
          type: 'image',
          caption: `Shared by ${userName}`,
          timestamp: Date.now()
      };
      // Fallback for Unsplash deprecation in some envs, using consistent reliable placeholder logic if needed
      newPhoto.url = 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

      const updatedGallery = [newPhoto, ...gallery];
      setGallery(updatedGallery);
      localStorage.setItem('wedding_gallery_media', JSON.stringify(updatedGallery));
      broadcastGalleryUpdate(updatedGallery);
      setShowUploadModal(false);
  };

  useEffect(() => {
      // Listen for config updates
      const checkConfig = () => {
          const savedConfig = localStorage.getItem('wedding_global_config');
          if (savedConfig) {
              setConfig(JSON.parse(savedConfig));
          }
      };
      checkConfig();
      const interval = setInterval(checkConfig, 2000);
      return () => clearInterval(interval);
  }, []);

  useEffect(() => {
      const channel = new BroadcastChannel('wedding_live_map');
      channel.onmessage = (event) => {
          const data = event.data as LocationUpdate;
          if (data.type === 'location_update') {
              setActiveUsers(prev => ({ ...prev, [data.id]: data }));
          }
      };

      let watchId: number;
      if (navigator.geolocation) {
          watchId = navigator.geolocation.watchPosition(
              (position) => {
                   const { latitude, longitude } = position.coords;
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
                   channel.postMessage(update);
                   setActiveUsers(prev => ({ ...prev, [userName]: update }));
              },
              (error) => console.warn(error),
              { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
          );
      }

      return () => {
          channel.close();
          if(watchId) navigator.geolocation.clearWatch(watchId);
      };
  }, [userName]);

  const handleRsvp = () => {
      setRsvpConfirmed(true);
      setIsRsvpOpen(true);
  };

  return (
    <div className={`w-full h-full flex flex-col relative font-serif overflow-hidden transition-all duration-1000 ${isRomanticMode ? 'bg-[radial-gradient(ellipse_at_center,_#4a0416_0%,_#1a0507_100%)]' : 'bg-[#2d0a0d]'}`}>
      {isRomanticMode ? (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 animate-pulse"></div>
             {Array.from({ length: 15 }).map((_, i) => (
                 <div key={i} className="absolute -top-10 text-rose-500/20 animate-petal-fall" style={{ 
                     left: `${Math.random()*100}%`, 
                     animationDuration: `${8 + Math.random()*10}s`, 
                     animationDelay: `${Math.random()*5}s`
                 }}>
                     <Flower size={16} fill="currentColor" />
                 </div>
            ))}
        </div>
      ) : (
         <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
             <GoldDust opacity={0.3} />
             <FloralPattern className="text-gold-500" opacity={0.03} />
         </div>
      )}

      {/* Top Bar */}
      <div className="flex justify-between items-center p-4 z-20 relative bg-gradient-to-b from-[#1a0507] to-transparent">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 p-[2px] shadow-lg shadow-gold-500/20">
                  <div className="w-full h-full rounded-full bg-[#2d0a0d] flex items-center justify-center text-gold-100 font-bold text-lg">
                      {userName.charAt(0)}
                  </div>
              </div>
              <div>
                  <h1 className="text-gold-100 font-heading text-lg leading-none">Namaste,</h1>
                  <p className="text-gold-400 text-xs font-serif">{userName}</p>
              </div>
          </div>
          <div className="flex gap-3">
               <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className="p-2 rounded-full bg-white/5 border border-white/10 text-gold-300 hover:bg-white/10 transition-colors">
                   <Settings size={18} />
               </button>
               <button onClick={onLogout} className="p-2 rounded-full bg-white/5 border border-white/10 text-rose-400 hover:bg-rose-900/30 transition-colors">
                   <LogOut size={18} />
               </button>
          </div>
      </div>

      {isSettingsOpen ? (
          <div className="flex-grow overflow-hidden relative z-20">
               <SettingsView onClose={() => setIsSettingsOpen(false)} />
          </div>
      ) : (
      <div className="flex-grow flex flex-col relative overflow-hidden z-10">
        {/* Main Content Area - Split View */}
        <div className="flex-grow flex flex-col md:flex-row overflow-hidden relative">
            
            {/* Left Column: Schedule & Map (Visible underneath slider on Mobile) */}
            <div className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto no-scrollbar pb-32 md:pb-4 w-full">
                 {/* Wedding Info Card */}
                 <div className="glass-panel p-6 rounded-2xl relative overflow-hidden shrink-0 animate-slide-up group">
                     <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Calendar size={80} className="text-gold-500"/></div>
                     <h2 className="text-2xl font-heading text-gold-100 mb-1">{config.coupleName}</h2>
                     <p className="text-stone-400 text-xs uppercase tracking-widest mb-4">{config.date} • Grand Palace</p>
                     
                     <div className="flex gap-3">
                         <button 
                            onClick={handleRsvp}
                            disabled={rsvpConfirmed}
                            className={`flex-1 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2 ${rsvpConfirmed ? 'bg-green-900/50 text-green-200 border border-green-500/30' : 'bg-gradient-to-r from-gold-500 to-gold-700 text-[#2d0a0d] shadow-lg hover:brightness-110'}`}
                         >
                             {rsvpConfirmed ? <><Check size={14}/> Confirmed</> : "RSVP Now"}
                         </button>
                         <button onClick={() => setIsMapOpen(true)} className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gold-100 hover:bg-white/10 transition-colors flex items-center justify-center">
                             <Map size={18} />
                         </button>
                     </div>
                 </div>

                 {/* Highlights (Events) - Dynamic */}
                 <div className="space-y-3 animate-slide-up delay-100">
                     <div className="flex items-center justify-between px-1">
                         <h3 className="font-bold text-gold-200 text-sm uppercase tracking-widest">Highlights</h3>
                         <span className="text-[10px] text-stone-500 bg-white/5 px-2 py-0.5 rounded-full">Live Updates</span>
                     </div>
                     {events.map((evt, i) => (
                         <div key={evt.id} className="glass-deep p-4 rounded-xl flex items-center gap-4 hover:bg-white/5 transition-colors cursor-default group border border-white/5 hover:border-gold-500/30">
                             <div className="w-12 h-12 rounded-full bg-[#2d0a0d] border border-gold-500/20 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform">
                                 {evt.icon}
                             </div>
                             <div className="flex-grow">
                                 <h4 className="font-bold text-gold-100 text-sm group-hover:text-gold-400 transition-colors">{evt.title}</h4>
                                 <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-1">
                                     <span className="flex items-center gap-1"><Clock size={10}/> {evt.time}</span>
                                     <span className="flex items-center gap-1"><MapPin size={10}/> {evt.loc}</span>
                                 </div>
                             </div>
                             <ChevronRight size={14} className="text-white/20 group-hover:translate-x-1 transition-transform"/>
                         </div>
                     ))}
                 </div>
            </div>

            {/* Music Widget */}
            {currentSong && isPlaying && (
                 <div className="absolute bottom-20 md:bottom-4 left-4 right-4 md:right-auto md:w-80 glass-panel p-3 rounded-full flex items-center gap-3 z-30 shadow-2xl border border-[#1DB954]/30 animate-slide-up">
                      <div className="w-10 h-10 rounded-full bg-[#121212] border border-white/10 flex items-center justify-center relative overflow-hidden animate-spin-slow">
                           <img src={currentSong.cover} className="absolute inset-0 w-full h-full object-cover opacity-70" />
                           <Disc size={16} className="text-[#1DB954] relative z-10" />
                      </div>
                      <div className="flex-grow overflow-hidden">
                          <div className="flex items-center gap-2">
                              <span className="text-[8px] font-bold text-[#1DB954] uppercase tracking-wider bg-[#1DB954]/10 px-1.5 rounded-sm">Live</span>
                              <span className="text-xs font-bold text-white truncate">{currentSong.title}</span>
                          </div>
                          <p className="text-[10px] text-stone-400 truncate">{currentSong.artist}</p>
                      </div>
                      <div className="flex gap-1">
                          <div className="w-1 h-3 bg-[#1DB954] rounded-full animate-pulse"></div>
                          <div className="w-1 h-5 bg-[#1DB954] rounded-full animate-pulse delay-75"></div>
                          <div className="w-1 h-2 bg-[#1DB954] rounded-full animate-pulse delay-150"></div>
                      </div>
                 </div>
            )}

            {/* Right Column: Guest Book (Chat) - Slider Sheet on Mobile */}
            <div 
                className={`
                    fixed inset-x-0 bottom-0 z-40 
                    flex flex-col 
                    bg-[#1a0507]/95 backdrop-blur-xl border-t border-gold-500/20 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] rounded-t-3xl 
                    h-[90vh] transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                    md:static md:h-auto md:bg-black/20 md:backdrop-blur-sm md:border-t-0 md:border-l md:border-white/5 md:shadow-none md:rounded-none md:transform-none md:flex-[1.5]
                 `}
                 style={{
                     transform: window.innerWidth < 768 
                        ? (isSheetOpen ? 'translateY(0)' : 'translateY(calc(100% - 80px))') 
                        : 'none'
                 }}
            >
                 {/* Mobile Handle / Slider Bar */}
                 <div 
                    className="w-full h-10 flex items-center justify-center shrink-0 md:hidden cursor-pointer active:cursor-grabbing touch-none"
                    onClick={() => setIsSheetOpen(!isSheetOpen)}
                    onTouchStart={(e) => {
                        const startY = e.touches[0].clientY;
                        const handleTouchEnd = (evt: TouchEvent) => {
                            const diff = startY - evt.changedTouches[0].clientY;
                            if (diff > 50) setIsSheetOpen(true); // Swipe Up
                            else if (diff < -50) setIsSheetOpen(false); // Swipe Down
                            window.removeEventListener('touchend', handleTouchEnd);
                        };
                        window.addEventListener('touchend', handleTouchEnd);
                    }}
                 >
                     <div className={`w-12 h-1.5 rounded-full transition-all duration-300 ${isSheetOpen ? 'bg-white/20' : 'bg-gold-500/50 w-16 animate-pulse'}`}></div>
                 </div>

                 <GuestBookView 
                    userName={userName} 
                    messages={messages} 
                    onSendMessage={handleSendMessage}
                    heartCount={globalHeartCount}
                    onHeartTrigger={triggerHeart}
                    isRomanticMode={isRomanticMode}
                    gallery={gallery}
                    onUpload={() => setShowUploadModal(true)}
                 />
            </div>
        </div>
      </div>
      )}

      {/* Modals */}
      {isRsvpOpen && <CelebrationOverlay onClose={() => setIsRsvpOpen(false)} />}
      <LiveMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} userName={userName} activeUsers={activeUsers} />
      
      {/* Guest Upload Modal */}
      {showUploadModal && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
               <div className="bg-[#2d0a0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center animate-zoom-in">
                   <h3 className="text-xl font-heading text-gold-100 mb-4">Share a Memory</h3>
                   <div className="h-40 border-2 border-dashed border-stone-600 rounded-xl flex flex-col items-center justify-center gap-2 mb-4 bg-black/20">
                        <Upload size={32} className="text-stone-500" />
                        <p className="text-xs text-stone-500">Tap to select photo</p>
                   </div>
                   <input type="text" placeholder="Write a caption..." className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm mb-4 focus:border-gold-500 focus:outline-none" />
                   <div className="flex gap-3">
                       <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 rounded-lg border border-white/10 text-stone-400">Cancel</button>
                       <button onClick={handlePhotoUpload} className="flex-1 py-3 rounded-lg bg-gold-600 text-black font-bold">Post</button>
                   </div>
               </div>
          </div>
      )}

    </div>
  );
};

export default GuestDashboard;
