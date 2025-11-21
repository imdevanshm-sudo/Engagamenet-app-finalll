
import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Heart, Camera, X, Sparkles, Music, Gift, Smile, Send, Play, Pause, SkipForward, SkipBack, ExternalLink, LogOut, ChevronRight, Radio, Map, Navigation, Phone, Search, Compass, Globe, Plane, Hand, Plus, Minus, Users, Utensils, PhoneCall, MapPin, Lock, User, Film, Upload, Mic, ChevronLeft, LocateFixed, Volume2, VolumeX, ListMusic, Download, Check, Flower, Smartphone, PlusCircle, Disc, Wifi, Settings, CloudFog, RefreshCw } from 'lucide-react';

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

interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover: string;
    album: string;
    durationStr: string;
    isCustom?: boolean;
}

interface LocationUpdate {
    type: 'location_update' | 'location_leave' | 'location_request';
    id: string;
    name: string;
    x: number;
    y: number;
    lat?: number;
    lng?: number;
    role: 'couple' | 'guest';
    map: 'all' | 'venue' | 'google';
}

interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset';
    effect: 'dust' | 'petals' | 'lights' | 'none';
}

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

// --- Shared Assets (Stickers & Map Icons) ---
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

const MapTree = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 100 100" className={className}>
      <path d="M50,80 L50,100" stroke="#5D4037" strokeWidth="8" />
      <path d="M20,80 Q10,60 30,40 Q10,30 40,10 Q70,30 60,40 Q90,60 80,80 Q50,90 20,80 Z" fill="#4a7c59" stroke="#33523f" strokeWidth="2" />
      <circle cx="30" cy="50" r="3" fill="#ef4444" opacity="0.6" />
      <circle cx="60" cy="30" r="3" fill="#ef4444" opacity="0.6" />
      <circle cx="70" cy="60" r="3" fill="#ef4444" opacity="0.6" />
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

interface CoupleDashboardProps {
  userName: string;
  onLogout: () => void;
}

const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'map' | 'music'>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [heartCount, setHeartCount] = useState(0);
  const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
  const [theme, setTheme] = useState<ThemeConfig>({ gradient: 'royal', effect: 'dust' });
  const [venueMapUrl, setVenueMapUrl] = useState("");
  
  // Music State
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Map PanZoom
  const { transform, handlers, style } = usePanZoom(1, 0.5, 3);
  const [viewMode, setViewMode] = useState<'venue' | 'google'>('venue');
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  const venuePos = [26.7857, 83.0763];
  
  // Location Broadcast Ref
  const [isSharingLocation, setIsSharingLocation] = useState(false);
  const lastLocationRef = useRef<LocationUpdate | null>(null);

  const VENUE_ZONES = [
        { name: "Grand Stage", x: 50, y: 20, w: 30, h: 15, color: "#be123c" },
        { name: "Mandap", x: 80, y: 50, w: 20, h: 20, color: "#b45309" },
        { name: "Royal Dining", x: 20, y: 50, w: 25, h: 25, color: "#15803d" },
        { name: "Entrance", x: 50, y: 90, w: 20, h: 10, color: "#4a0e11" },
        { name: "Bar", x: 80, y: 80, w: 15, h: 15, color: "#1d4ed8" },
  ];

  // --- Initial Data Load ---
  useEffect(() => {
      const loadData = () => {
          const msgs = localStorage.getItem('wedding_chat_messages');
          if (msgs) setMessages(JSON.parse(msgs));
          
          const hearts = localStorage.getItem('wedding_heart_count');
          if (hearts) setHeartCount(parseInt(hearts));

          const savedTheme = localStorage.getItem('wedding_theme_config');
          if (savedTheme) setTheme(JSON.parse(savedTheme));

          const savedConfig = localStorage.getItem('wedding_global_config');
          if (savedConfig) {
              const parsed = JSON.parse(savedConfig);
              if (parsed.venueMapUrl) setVenueMapUrl(parsed.venueMapUrl);
          }

          // Mock Playlist
          const pl = [
              { id: '1', title: 'Din Shagna Da', artist: 'Jasleen Royal', album: 'Wedding', durationStr: '3:45', url: '', cover: 'https://i1.sndcdn.com/artworks-000396211683-3q0g30-t500x500.jpg' },
              { id: '2', title: 'Ranjha', artist: 'B Praak', album: 'Shershaah', durationStr: '4:12', url: '', cover: 'https://c.saavncdn.com/238/Shershaah-Hindi-2021-20210815181610-500x500.jpg' },
              { id: '3', title: 'Kudmayi', artist: 'Sachet Tandon', album: 'RRKPK', durationStr: '4:20', url: '', cover: 'https://c.saavncdn.com/464/Kudmayi-From-Rocky-Aur-Rani-Kii-Prem-Kahaani-Hindi-2023-20230803181008-500x500.jpg' },
          ];
          setPlaylist(pl);
          setCurrentSong(pl[0]);
      };
      loadData();

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (event) => {
          const data = event.data;
          switch(data.type) {
              case 'message': 
                  setMessages(prev => [...prev, data.payload]);
                  break;
              case 'message_sync':
                  setMessages(data.payload);
                  break;
              case 'heart_update':
                  setHeartCount(data.count);
                  break;
              case 'theme_sync':
                  setTheme(data.payload);
                  break;
              case 'config_sync':
                  if(data.payload.venueMapUrl) setVenueMapUrl(data.payload.venueMapUrl);
                  break;
          }
      };
      return () => channel.close();
  }, []);

  // --- Location Handshake & Heartbeat Logic ---
  useEffect(() => {
      const channel = new BroadcastChannel('wedding_live_map');
      
      // 1. Announce presence to guests (ask them to reply)
      channel.postMessage({ type: 'location_request' });

      channel.onmessage = (event) => {
          const data = event.data as any;
          if (data.type === 'location_update') {
              setActiveUsers(prev => ({ ...prev, [data.id]: data }));
          } else if (data.type === 'location_request') {
              // Someone else asked, reply if we have data
              if (lastLocationRef.current) {
                  channel.postMessage(lastLocationRef.current);
              }
          } else if (data.type === 'location_leave') {
              // Remove user from map
              setActiveUsers(prev => {
                  const next = { ...prev };
                  delete next[data.id];
                  return next;
              });
          }
      };

      let watchId: number;
      let heartbeatInterval: any;

      if (isSharingLocation && navigator.geolocation) {
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
                      role: 'couple',
                      map: 'all' 
                   };
                   
                   lastLocationRef.current = update;
                   channel.postMessage(update);
                   setActiveUsers(prev => ({ ...prev, [userName]: update }));
              },
              (error) => console.warn(error),
              { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
          );

          // Heartbeat: Re-broadcast every 5s to stay visible to new joiners
          heartbeatInterval = setInterval(() => {
              if (lastLocationRef.current) {
                  channel.postMessage(lastLocationRef.current);
              }
          }, 5000);

      } else {
          // If we stop sharing, announce departure
          if (lastLocationRef.current) {
              channel.postMessage({ type: 'location_leave', id: userName });
          }
          // Clean self from map
          setActiveUsers(prev => {
              const next = { ...prev };
              delete next[userName];
              return next;
          });
      }

      return () => {
          channel.close();
          if(watchId) navigator.geolocation.clearWatch(watchId);
          if(heartbeatInterval) clearInterval(heartbeatInterval);
      }
  }, [userName, isSharingLocation]);

  // --- Music Controls ---
  const togglePlay = () => {
      const newState = !isPlaying;
      setIsPlaying(newState);
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ 
          type: 'playlist_update', 
          currentSong, 
          isPlaying: newState,
          playlist 
      });
      channel.close();
  };

  const playSong = (song: Song) => {
      setCurrentSong(song);
      setIsPlaying(true);
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ 
          type: 'playlist_update', 
          currentSong: song, 
          isPlaying: true,
          playlist 
      });
      channel.close();
  };

  // --- Chat ---
  const handleSendMessage = (text: string) => {
      const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          text,
          sender: userName,
          isCouple: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
      };
      setMessages(prev => [...prev, newMessage]);
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'message', payload: newMessage });
      channel.close();
  };
  
  const triggerHeart = () => {
      const newCount = heartCount + 1;
      setHeartCount(newCount);
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'heart_update', count: newCount });
      channel.close();
  };

  // --- Map Leaflet Effect ---
  useEffect(() => {
    if (viewMode !== 'google') {
        if (mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
            markersRef.current = {};
        }
        return;
    }

    if (!mapRef.current || mapInstance.current) return;

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

    return () => {
        if(mapInstance.current) {
            mapInstance.current.remove();
            mapInstance.current = null;
        }
    }
  }, [viewMode]);

  useEffect(() => {
        if (!mapInstance.current || viewMode !== 'google') return;
        const L = (window as any).L;
        
        Object.values(activeUsers).forEach((user: LocationUpdate) => {
            if (user.lat && user.lng) {
                 if (markersRef.current[user.id]) {
                     markersRef.current[user.id].setLatLng([user.lat, user.lng]);
                 } else {
                     const safeName = escapeHtml(user.name);
                     const iconHtml = `
                        <div class="relative flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-110">
                            <div class="w-8 h-8 rounded-full border-2 shadow-2xl flex items-center justify-center font-bold text-sm backdrop-blur-md ${
                                user.role === 'couple'
                                    ? 'bg-rose-900/90 border-rose-400 text-rose-100 shadow-rose-500/50' 
                                    : 'bg-amber-900/90 border-amber-400 text-amber-100 shadow-amber-500/30'
                            }">
                                ${safeName.charAt(0)}
                            </div>
                             <div class="mt-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] font-bold text-white whitespace-nowrap border border-white/10 shadow-lg">
                                ${user.role === 'couple' ? 'Couple' : safeName}
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
            } else {
                // Remove marker if invalid coords
                 if (markersRef.current[user.id]) {
                     markersRef.current[user.id].remove();
                     delete markersRef.current[user.id];
                 }
            }
        });
        
        // Cleanup markers for users who left
        Object.keys(markersRef.current).forEach(id => {
            if (!activeUsers[id]) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });
  }, [activeUsers, viewMode]);

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

  const handleClearCache = () => {
    if(confirm("Reset app data and reload? This fixes most issues.")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className={`w-full h-full text-rose-50 font-serif flex flex-col relative overflow-hidden transition-colors duration-1000 ${
        theme.gradient === 'midnight' ? 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617]' :
        theme.gradient === 'sunset' ? 'bg-gradient-to-b from-[#4a0404] via-[#7c2d12] to-[#2d0a0d]' :
        'bg-gradient-to-b from-[#1a0507] via-[#2d0a0d] to-[#0f0505]'
    }`}>
        <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000">
             {theme.effect === 'dust' && <GoldDust opacity={0.2} />}
             {theme.effect === 'petals' && <FallingPetals />}
             {theme.effect === 'lights' && <GodRays />}
        </div>

        {/* Header */}
        <header className="flex-shrink-0 p-4 flex justify-between items-center z-20 border-b border-rose-500/20 bg-[#2d0a0d]/80 backdrop-blur-md">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-rose-500 p-0.5 bg-rose-950">
                    <div className="w-full h-full rounded-full bg-rose-900 flex items-center justify-center text-rose-200 font-bold text-xl">
                        {userName.charAt(0)}
                    </div>
                </div>
                <div>
                    <h1 className="font-heading text-xl text-rose-100">Royal Couple</h1>
                    <p className="text-xs text-rose-400 uppercase tracking-widest">Control Center</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={handleClearCache} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-rose-400 transition-colors" title="Reset App">
                     <RefreshCw size={18} />
                 </button>
                 <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-lg text-rose-400 hover:text-rose-200 transition-colors">
                     <LogOut size={20} />
                 </button>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-hidden relative z-10">
            {activeTab === 'home' && (
                <div className="h-full overflow-y-auto p-6 animate-fade-in">
                     <div className="text-center my-6">
                         <Heart size={40} className="text-rose-500 mx-auto mb-4 animate-pulse-slow fill-rose-500/50" />
                         <h2 className="text-3xl font-cursive text-rose-200 mb-2">Welcome back, {userName}</h2>
                         <p className="text-stone-400 text-sm">Your big day is getting closer.</p>
                     </div>
                     
                     {/* Adore Meter Display */}
                     <div className="bg-gradient-to-br from-rose-900/50 to-rose-950/50 p-6 rounded-2xl border border-rose-500/20 flex items-center justify-between mb-6 relative overflow-hidden group">
                          <div className="absolute inset-0 bg-rose-500/5 group-hover:bg-rose-500/10 transition-colors"></div>
                          <div>
                              <h3 className="text-rose-200 font-bold mb-1">Love Received</h3>
                              <p className="text-xs text-rose-400/80">Total hearts from guests</p>
                          </div>
                          <div className="text-4xl font-bold text-rose-100 flex items-center gap-2">
                              {heartCount} <Heart size={24} fill="currentColor" className="text-rose-500"/>
                          </div>
                          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-rose-500/20 rounded-full blur-xl"></div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => setActiveTab('map')} className="p-4 bg-black/30 rounded-xl border border-rose-500/20 hover:border-rose-500/50 transition-all flex flex-col items-center gap-2 group">
                             <Map size={24} className="text-rose-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-rose-100">Live Map</span>
                         </button>
                         <button onClick={() => setActiveTab('chat')} className="p-4 bg-black/30 rounded-xl border border-rose-500/20 hover:border-rose-500/50 transition-all flex flex-col items-center gap-2 group">
                             <MessageSquare size={24} className="text-rose-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-rose-100">Messages</span>
                         </button>
                     </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="flex flex-col h-full relative">
                    <div className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === userName ? 'bg-rose-600 text-white' : 'bg-black/40 border border-rose-500/20'}`}>
                                    {!msg.sender.includes(userName) && <p className="text-[10px] text-rose-400 font-bold mb-1">{msg.sender}</p>}
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#2d0a0d] border-t border-rose-500/20 pb-24">
                        <div className="flex gap-2">
                            <button onClick={triggerHeart} className="p-3 bg-rose-900/50 rounded-full text-rose-400 border border-rose-500/30"><Heart size={20} /></button>
                            <input 
                                type="text" 
                                placeholder="Reply to guests..." 
                                className="flex-grow bg-black/30 border border-rose-500/20 rounded-full px-4 text-rose-100 focus:outline-none focus:border-rose-500"
                                onKeyDown={(e) => {
                                    if(e.key === 'Enter') {
                                        handleSendMessage((e.target as HTMLInputElement).value);
                                        (e.target as HTMLInputElement).value = '';
                                    }
                                }}
                            />
                            <button className="p-3 bg-rose-600 rounded-full text-white shadow-lg hover:bg-rose-500"><Send size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'map' && (
                <div className="flex flex-col h-full">
                    <div className="bg-black/40 p-2 flex justify-between items-center px-4 border-b border-white/5 shrink-0">
                        <div className="flex gap-2">
                             <button onClick={() => setViewMode('venue')} className={`px-3 py-1 rounded-full text-xs font-bold ${viewMode === 'venue' ? 'bg-rose-600 text-white' : 'bg-white/10 text-stone-400'}`}>Venue</button>
                             <button onClick={() => setViewMode('google')} className={`px-3 py-1 rounded-full text-xs font-bold ${viewMode === 'google' ? 'bg-rose-600 text-white' : 'bg-white/10 text-stone-400'}`}>GPS Map</button>
                        </div>
                        <button 
                            onClick={() => setIsSharingLocation(!isSharingLocation)}
                            className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-colors ${isSharingLocation ? 'bg-green-900/30 border-green-500 text-green-400' : 'bg-white/5 border-white/10 text-stone-500'}`}
                        >
                            <div className={`w-1.5 h-1.5 rounded-full ${isSharingLocation ? 'bg-green-500 animate-pulse' : 'bg-stone-500'}`}></div>
                            {isSharingLocation ? 'Broadcasting' : 'Location Off'}
                        </button>
                    </div>

                    <div className="flex-grow relative bg-stone-900 overflow-hidden">
                         {viewMode === 'venue' ? (
                             <div className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden" {...handlers} style={style}>
                                <div 
                                    className="absolute inset-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
                                    style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
                                >
                                    <div className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 bg-[#f5f5f4] border-[20px] border-[#4a0e11] shadow-2xl overflow-hidden">
                                        {venueMapUrl ? (
                                            <>
                                                <img src={venueMapUrl} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Venue Map" />
                                                <div className="absolute inset-0 bg-black/5"></div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a0e11 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                                                {VENUE_ZONES.map((zone, i) => (
                                                    <div key={i} className="absolute border-2 border-dashed flex items-center justify-center text-center p-2 opacity-60" 
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
                                            </>
                                        )}
                                        
                                        {Object.values(activeUsers).map((u: LocationUpdate, i) => (
                                            <MapNode key={i} x={u.x} y={u.y} name={escapeHtml(u.name)} type={u.role} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                         ) : (
                             <div className="relative w-full h-full">
                                 <div ref={mapRef} className="w-full h-full bg-stone-200"></div>
                                 <button 
                                    onClick={handleLocateMe}
                                    className="absolute bottom-4 right-4 z-[500] bg-white text-black p-3 rounded-full shadow-xl active:scale-95 transition-transform hover:bg-gray-100"
                                 >
                                     <LocateFixed size={24} />
                                 </button>
                             </div>
                         )}
                    </div>
                </div>
            )}

            {activeTab === 'music' && (
                <div className="h-full overflow-y-auto p-6 animate-fade-in pb-32">
                    <h2 className="text-2xl font-heading text-rose-200 mb-6 text-center">Music Controller</h2>
                    
                    {/* Now Playing Card */}
                    <div className="bg-gradient-to-b from-rose-900/40 to-black/40 p-6 rounded-2xl border border-rose-500/20 shadow-2xl mb-8 flex flex-col items-center relative overflow-hidden">
                         <div className="absolute inset-0 bg-noise opacity-10"></div>
                         <div className={`w-48 h-48 rounded-full border-4 border-rose-500/30 shadow-[0_0_40px_rgba(225,29,72,0.3)] mb-6 relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                             <img src={currentSong?.cover} className="w-full h-full object-cover rounded-full" />
                             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 to-transparent"></div>
                             <div className="absolute w-8 h-8 bg-[#2d0a0d] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-rose-500/50"></div>
                         </div>
                         
                         <div className="text-center mb-6">
                             <h3 className="text-xl font-bold text-rose-100">{currentSong?.title}</h3>
                             <p className="text-rose-400 text-sm">{currentSong?.artist}</p>
                         </div>

                         <div className="flex items-center gap-6">
                             <button className="text-rose-400 hover:text-rose-200"><SkipBack size={28} /></button>
                             <button 
                                onClick={togglePlay}
                                className="w-16 h-16 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-transform active:scale-95"
                             >
                                 {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" className="ml-1" />}
                             </button>
                             <button className="text-rose-400 hover:text-rose-200"><SkipForward size={28} /></button>
                         </div>
                    </div>

                    {/* Queue */}
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest text-rose-500/80 font-bold mb-2 ml-1">Up Next</h3>
                        {playlist.map((song, i) => (
                            <div 
                                key={song.id} 
                                onClick={() => playSong(song)}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-all cursor-pointer ${currentSong?.id === song.id ? 'bg-rose-900/30 border-rose-500/50' : 'bg-black/20 border-white/5 hover:bg-white/5'}`}
                            >
                                <div className="w-10 h-10 rounded-lg overflow-hidden">
                                    <img src={song.cover} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className={`font-bold text-sm ${currentSong?.id === song.id ? 'text-rose-200' : 'text-stone-300'}`}>{song.title}</h4>
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
        <nav className="flex-shrink-0 p-2 bg-[#2d0a0d] border-t border-rose-500/20 flex justify-around z-20 pb-safe">
             {[
                 { id: 'home', icon: Home, label: 'Home' },
                 { id: 'chat', icon: MessageSquare, label: 'Chat' },
                 { id: 'map', icon: Map, label: 'Track' },
                 { id: 'music', icon: Music, label: 'Music' },
             ].map(item => (
                 <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${activeTab === item.id ? 'bg-rose-900/50 text-rose-200' : 'text-stone-500'}`}
                 >
                     <item.icon size={20} className={activeTab === item.id ? 'animate-bounce-small' : ''} />
                     <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
                 </button>
             ))}
        </nav>
    </div>
  );
};

export default CoupleDashboard;
