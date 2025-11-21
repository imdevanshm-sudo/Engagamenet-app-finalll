
import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Home, MessageSquare, Heart, Camera, X, Sparkles, Music, Gift, Smile, Send, Play, Pause, SkipForward, SkipBack, ExternalLink, LogOut, ChevronRight, Radio, Map, Navigation, Phone, Search, Compass, Globe, Plane, Hand, Plus, Minus, Users, Utensils, PhoneCall, MapPin, Lock, User, Film, Upload, Mic, ChevronLeft, LocateFixed, Volume2, VolumeX, ListMusic, Download, Check, Flower, Smartphone, PlusCircle, Disc, Wifi } from 'lucide-react';

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

type BroadcastEvent = 
  | { type: 'message'; payload: Message }
  | { type: 'message_sync'; payload: Message[] }
  | { type: 'heart_update'; count: number }
  | { type: 'gallery_sync'; payload: MediaItem[] }
  | { type: 'event_sync'; payload: any[] }
  | { type: 'playlist_update'; playlist: Song[]; currentSong: Song | null; isPlaying: boolean }
  | { type: 'theme_update'; mode: 'default' | 'romantic' }
  | { type: 'config_sync'; payload: any };

interface LocationUpdate {
    type: 'location_update';
    id: string;
    name: string;
    x: number;
    y: number;
    lat?: number;
    lng?: number;
    role: 'couple' | 'guest';
    map: 'all' | 'venue' | 'google';
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

// --- Live Map Modal Component ---

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
                                user.role === 'couple' 
                                    ? 'bg-rose-900/90 border-rose-400 text-rose-100 shadow-rose-500/50' 
                                    : 'bg-amber-900/90 border-amber-400 text-amber-100 shadow-amber-500/30'
                            }">
                                ${user.role === 'couple' ? '❤️' : safeName.charAt(0)}
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
                        {viewMode === 'venue' ? 'See where guests are mingling.' : 'Tracking all guests live.'}
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

// --- Constants for Music ---

// Mock Spotify Database
const SPOTIFY_DATABASE: Song[] = [
    {
        id: 's1',
        title: 'Raabta (Kehte Hain)',
        artist: 'Arijit Singh',
        album: 'Agent Vinod',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        cover: 'https://i.scdn.co/image/ab67616d0000b273552058844946641674911737',
        durationStr: '4:03'
    },
    {
        id: 's2',
        title: 'Din Shagna Da',
        artist: 'Jasleen Royal',
        album: 'Phillauri',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        cover: 'https://i.scdn.co/image/ab67616d0000b273a1e292d88dfc375f088df445',
        durationStr: '3:36'
    },
    {
        id: 's3',
        title: 'Kabira (Encore)',
        artist: 'Harshdeep Kaur',
        album: 'Yeh Jawaani Hai Deewani',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        cover: 'https://i.scdn.co/image/ab67616d0000b27382e33d3c6261625465a68666',
        durationStr: '4:29'
    },
    {
        id: 's4',
        title: 'Mangalyam',
        artist: 'A.R. Rahman',
        album: 'Saathiya',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        cover: 'https://i.scdn.co/image/ab67616d0000b2731649f690532b2a68704d9c2a',
        durationStr: '2:45'
    },
    {
        id: 's5',
        title: 'Perfect',
        artist: 'Ed Sheeran',
        album: 'Divide',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
        cover: 'https://i.scdn.co/image/ab67616d0000b273ba5db46f4b838ef6027e6f96',
        durationStr: '4:23'
    },
    {
        id: 's6',
        title: 'Kesariya',
        artist: 'Arijit Singh',
        album: 'Brahmāstra',
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3',
        cover: 'https://i.scdn.co/image/ab67616d0000b273c08202c503a1e2b3d2c734c4',
        durationStr: '4:28'
    },
    { 
        id: 's7', 
        title: 'Ranjha', 
        artist: 'B Praak, Jasleen Royal', 
        album: 'Shershaah', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3', 
        cover: 'https://i.scdn.co/image/ab67616d0000b2734c84d85144bd02da8055230d', 
        durationStr: '3:48' 
    },
    { 
        id: 's8', 
        title: 'Tum Se Hi', 
        artist: 'Mohit Chauhan', 
        album: 'Jab We Met', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3', 
        cover: 'https://i.scdn.co/image/ab67616d0000b2739990361a5a49c24df0302c69', 
        durationStr: '5:23' 
    },
    { 
        id: 's9', 
        title: 'Peaches', 
        artist: 'Justin Bieber', 
        album: 'Justice', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 
        cover: 'https://i.scdn.co/image/ab67616d0000b273e6f407c7f3a0ec98845e4431', 
        durationStr: '3:18' 
    },
    { 
        id: 's10', 
        title: 'Lover', 
        artist: 'Diljit Dosanjh', 
        album: 'MoonChild Era', 
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 
        cover: 'https://i.scdn.co/image/ab67616d0000b2738166424538200a3355e70e04', 
        durationStr: '2:59' 
    },
];

const CoupleDashboard: React.FC<{ userName: string, onLogout: () => void }> = ({ userName, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'gallery' | 'music'>('home');
    const [heartCount, setHeartCount] = useState(0);
    const [messages, setMessages] = useState<Message[]>([]);
    const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
    const [photos, setPhotos] = useState<MediaItem[]>([]);
    const [isRomanticMode, setIsRomanticMode] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isMapOpen, setIsMapOpen] = useState(false);
    
    // Chat State
    const [inputText, setInputText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- Music State ---
    const [spotifyConnected, setSpotifyConnected] = useState(false);
    const [musicQueue, setMusicQueue] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [musicSearchQuery, setMusicSearchQuery] = useState("");
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const broadcastSync = (type: string, payload: any) => {
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type, payload });
        channel.close();
    };

    // Initialize Data
    useEffect(() => {
        // Load local storage
        const savedMsgs = localStorage.getItem('wedding_chat_messages');
        if (savedMsgs) setMessages(JSON.parse(savedMsgs));
        
        const savedHearts = localStorage.getItem('wedding_heart_count');
        if (savedHearts) setHeartCount(parseInt(savedHearts));

        const savedPhotos = localStorage.getItem('wedding_gallery_media');
        if (savedPhotos) setPhotos(JSON.parse(savedPhotos));
        else {
            // Default dummy photos
            const defaultPhotos: MediaItem[] = [
               { id: '1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', type: 'image', caption: 'Pre-wedding shoot ✨', timestamp: Date.now() },
               { id: '2', url: 'https://images.unsplash.com/photo-1511285560982-1356c11d4606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', type: 'image', caption: 'Engagement Ring 💍', timestamp: Date.now() - 100000 },
            ];
            setPhotos(defaultPhotos);
            localStorage.setItem('wedding_gallery_media', JSON.stringify(defaultPhotos));
        }

        const savedPlaylist = localStorage.getItem('wedding_playlist');
        if(savedPlaylist) setMusicQueue(JSON.parse(savedPlaylist));

        // Broadcast Channel
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.onmessage = (event) => {
            const data = event.data as BroadcastEvent;
            if (data.type === 'message') {
                setMessages(prev => [...prev, data.payload]);
            } else if (data.type === 'message_sync') { // Bulk update (e.g. admin delete)
                setMessages(data.payload);
            } else if (data.type === 'heart_update') {
                setHeartCount(data.count);
            } else if (data.type === 'gallery_sync') { // Gallery update (e.g. admin delete or upload)
                setPhotos(data.payload);
            } else if (data.type === 'playlist_update') {
                // Sync playlist across devices
                setMusicQueue(data.playlist);
                if (data.currentSong && (!currentSong || currentSong.id !== data.currentSong.id)) {
                     setCurrentSong(data.currentSong);
                }
                setIsPlaying(data.isPlaying);
            }
        };

        return () => channel.close();
    }, []);

    useEffect(() => {
        if (activeTab === 'chat' && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, activeTab]);

    // --- Music Handlers ---
    
    const broadcastMusicState = (newQueue: Song[], newCurrent: Song | null, playing: boolean) => {
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({
            type: 'playlist_update',
            playlist: newQueue,
            currentSong: newCurrent,
            isPlaying: playing
        });
        channel.close();
        // Persist
        localStorage.setItem('wedding_playlist', JSON.stringify(newQueue));
    };

    const handleSpotifyConnect = () => {
        // Simulate OAuth flow
        const win = window.open('', 'Spotify Login', 'width=400,height=500');
        if (win) {
            win.document.write('<div style="background:#191414;color:white;height:100%;display:flex;align-items:center;justify-content:center;font-family:sans-serif;"><h1>Connecting to Spotify...</h1></div>');
            setTimeout(() => {
                win.close();
                setSpotifyConnected(true);
                if(musicQueue.length === 0) {
                    const initialQueue = [SPOTIFY_DATABASE[0], SPOTIFY_DATABASE[2]];
                    setMusicQueue(initialQueue);
                    setCurrentSong(initialQueue[0]);
                    broadcastMusicState(initialQueue, initialQueue[0], false);
                }
            }, 1500);
        }
    };

    const handlePlaySong = (song: Song) => {
        if (currentSong?.id === song.id) {
            // Toggle
            if (isPlaying) {
                audioRef.current?.pause();
                setIsPlaying(false);
                broadcastMusicState(musicQueue, currentSong, false);
            } else {
                audioRef.current?.play();
                setIsPlaying(true);
                broadcastMusicState(musicQueue, currentSong, true);
            }
        } else {
            // New Song
            setCurrentSong(song);
            setIsPlaying(true);
            // If not in queue, add it
            if (!musicQueue.find(s => s.id === song.id)) {
                const newQueue = [...musicQueue, song];
                setMusicQueue(newQueue);
                broadcastMusicState(newQueue, song, true);
            } else {
                broadcastMusicState(musicQueue, song, true);
            }
        }
    };

    const handleNextSong = () => {
        if (!currentSong || musicQueue.length === 0) return;
        const idx = musicQueue.findIndex(s => s.id === currentSong.id);
        const nextSong = musicQueue[(idx + 1) % musicQueue.length];
        setCurrentSong(nextSong);
        setIsPlaying(true);
        broadcastMusicState(musicQueue, nextSong, true);
    };

    const handlePrevSong = () => {
        if (!currentSong || musicQueue.length === 0) return;
        const idx = musicQueue.findIndex(s => s.id === currentSong.id);
        const prevSong = musicQueue[(idx - 1 + musicQueue.length) % musicQueue.length];
        setCurrentSong(prevSong);
        setIsPlaying(true);
        broadcastMusicState(musicQueue, prevSong, true);
    };

    const handleAddToQueue = (song: Song) => {
        if (musicQueue.find(s => s.id === song.id)) return;
        const newQueue = [...musicQueue, song];
        setMusicQueue(newQueue);
        broadcastMusicState(newQueue, currentSong, isPlaying);
    };

    const handleRemoveFromQueue = (songId: string) => {
        const newQueue = musicQueue.filter(s => s.id !== songId);
        setMusicQueue(newQueue);
        if (currentSong?.id === songId) {
            setIsPlaying(false);
            setCurrentSong(null);
        }
        broadcastMusicState(newQueue, currentSong?.id === songId ? null : currentSong, currentSong?.id === songId ? false : isPlaying);
    };

    // Audio Element Effect
    useEffect(() => {
        if (audioRef.current) {
            if (currentSong) {
                if (audioRef.current.src !== currentSong.url) {
                    audioRef.current.src = currentSong.url;
                    audioRef.current.load();
                }
                if (isPlaying) {
                    audioRef.current.play().catch(e => console.log("Autoplay prevented", e));
                } else {
                    audioRef.current.pause();
                }
            } else {
                audioRef.current.pause();
            }
        }
    }, [currentSong, isPlaying]);


    // --- Map Location Tracking ---
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
                    const pseudoX = 80; // Couple stays near mandap in mock
                    const pseudoY = 50; 
                    
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
                    channel.postMessage(update);
                    setActiveUsers(prev => ({ ...prev, [userName]: update }));
                },
                (error) => console.warn(error),
                { enableHighAccuracy: true }
            );
        }
        return () => {
            channel.close();
            if(watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [userName]);

    const handleThemeToggle = () => {
        const newMode = !isRomanticMode;
        setIsRomanticMode(newMode);
        localStorage.setItem('wedding_theme_mode', newMode ? 'romantic' : 'default');
        // Broadcast theme change
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'theme_update', mode: newMode ? 'romantic' : 'default' });
        channel.close();
    };

    // --- Chat Handlers ---
    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            sender: userName,
            isCouple: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
        };
        const updatedMessages = [...messages, newMessage];
        setMessages(updatedMessages);
        localStorage.setItem('wedding_chat_messages', JSON.stringify(updatedMessages));
        broadcastSync('message', newMessage);
        setInputText("");
    };
    
    const triggerHeart = () => {
        const newCount = heartCount + 1;
        setHeartCount(newCount);
        localStorage.setItem('wedding_heart_count', newCount.toString());
        broadcastSync('heart_update', { count: newCount });
    };

    // --- Render Helpers ---

    const renderSpotifyView = () => {
        const filteredSongs = SPOTIFY_DATABASE.filter(s => 
            s.title.toLowerCase().includes(musicSearchQuery.toLowerCase()) || 
            s.artist.toLowerCase().includes(musicSearchQuery.toLowerCase())
        );

        return (
            <div className="flex flex-col h-full bg-[#121212] text-white overflow-hidden rounded-t-2xl animate-slide-up">
                 {/* Hidden Audio Element */}
                 <audio ref={audioRef} onEnded={handleNextSong} />

                 <div className="p-4 bg-gradient-to-b from-green-900 to-[#121212] pb-8 shrink-0">
                      <div className="flex justify-between items-center mb-6">
                          <div className="flex items-center gap-2">
                               <Disc size={24} className={`text-[#1DB954] ${isPlaying ? 'animate-spin-slow' : ''}`} />
                               <h2 className="font-bold text-lg tracking-tight">Couple's Radio</h2>
                          </div>
                          <div className="px-3 py-1 rounded-full bg-black/40 text-[10px] font-bold text-[#1DB954] border border-[#1DB954]/30 flex items-center gap-1">
                              <Wifi size={10} /> Connected to Spotify
                          </div>
                      </div>

                      {/* Player Card */}
                      {currentSong ? (
                          <div className="flex gap-4 items-end">
                               <img src={currentSong.cover} className="w-32 h-32 rounded-md shadow-2xl shadow-black" />
                               <div className="flex-grow mb-1">
                                   <h3 className="font-bold text-2xl leading-tight mb-1">{currentSong.title}</h3>
                                   <p className="text-stone-400 text-sm mb-4">{currentSong.artist}</p>
                                   
                                   <div className="flex items-center gap-4">
                                       <button onClick={handlePrevSong} className="text-stone-400 hover:text-white transition-colors"><SkipBack size={24}/></button>
                                       <button onClick={() => handlePlaySong(currentSong)} className="w-12 h-12 rounded-full bg-[#1DB954] flex items-center justify-center text-black hover:scale-105 transition-transform shadow-lg shadow-green-900/50">
                                           {isPlaying ? <Pause size={24} fill="black"/> : <Play size={24} fill="black" className="ml-1"/>}
                                       </button>
                                       <button onClick={handleNextSong} className="text-stone-400 hover:text-white transition-colors"><SkipForward size={24}/></button>
                                   </div>
                               </div>
                          </div>
                      ) : (
                          <div className="h-32 flex items-center justify-center text-stone-500 italic">
                              Select a song to start the vibe
                          </div>
                      )}
                 </div>

                 <div className="flex-grow flex flex-col overflow-hidden">
                      {/* Tabs/Search */}
                      <div className="px-4 py-2 border-b border-white/10 flex gap-2 bg-[#121212]">
                          <div className="relative flex-grow">
                               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" size={16} />
                               <input 
                                  type="text" 
                                  value={musicSearchQuery}
                                  onChange={e => setMusicSearchQuery(e.target.value)}
                                  placeholder="Search songs..." 
                                  className="w-full bg-[#2a2a2a] rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:bg-[#333]"
                               />
                          </div>
                      </div>

                      {/* Content List */}
                      <div className="flex-grow overflow-y-auto p-4 space-y-2">
                           {musicSearchQuery ? (
                               <>
                                 <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Search Results</h4>
                                 {filteredSongs.map(song => (
                                     <div key={song.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded group">
                                          <img src={song.cover} className="w-10 h-10 rounded" />
                                          <div className="flex-grow min-w-0">
                                              <div className={`font-bold text-sm truncate ${currentSong?.id === song.id ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</div>
                                              <div className="text-xs text-stone-400 truncate">{song.artist}</div>
                                          </div>
                                          <button onClick={() => handleAddToQueue(song)} className="p-2 text-stone-400 hover:text-white"><PlusCircle size={20}/></button>
                                     </div>
                                 ))}
                               </>
                           ) : (
                               <>
                                 <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Up Next</h4>
                                 {musicQueue.map((song, idx) => (
                                     <div key={`${song.id}-${idx}`} className={`flex items-center gap-3 p-2 rounded group ${currentSong?.id === song.id ? 'bg-white/10' : 'hover:bg-white/5'}`}>
                                          {currentSong?.id === song.id && isPlaying ? (
                                              <div className="w-4 flex items-end justify-center gap-[2px] h-4">
                                                  <div className="w-[2px] bg-[#1DB954] animate-[bounce_1s_infinite] h-2"></div>
                                                  <div className="w-[2px] bg-[#1DB954] animate-[bounce_1.2s_infinite] h-4"></div>
                                                  <div className="w-[2px] bg-[#1DB954] animate-[bounce_0.8s_infinite] h-3"></div>
                                              </div>
                                          ) : (
                                              <span className="w-4 text-xs text-stone-500 text-center">{idx + 1}</span>
                                          )}
                                          <img src={song.cover} className="w-10 h-10 rounded" />
                                          <div className="flex-grow min-w-0 cursor-pointer" onClick={() => handlePlaySong(song)}>
                                              <div className={`font-bold text-sm truncate ${currentSong?.id === song.id ? 'text-[#1DB954]' : 'text-white'}`}>{song.title}</div>
                                              <div className="text-xs text-stone-400 truncate">{song.artist}</div>
                                          </div>
                                          <button onClick={() => handleRemoveFromQueue(song.id)} className="opacity-0 group-hover:opacity-100 text-stone-500 hover:text-red-400 p-2"><Minus size={16}/></button>
                                     </div>
                                 ))}
                                 {musicQueue.length === 0 && <p className="text-sm text-stone-500 text-center py-8">Queue is empty. Add some songs!</p>}
                               </>
                           )}
                      </div>
                 </div>
            </div>
        );
    };

    const renderChat = () => (
        <div className="flex flex-col h-full overflow-hidden relative">
             {/* Adore Meter Inside Chat */}
             <div className="absolute bottom-[5rem] right-4 z-40 pointer-events-none">
                 <div className="pointer-events-auto">
                    <AdoreMeter count={heartCount} onTrigger={triggerHeart} />
                 </div>
             </div>

             <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 pb-24">
                 {messages.map(m => (
                     <div key={m.id} className={`flex flex-col ${m.sender === userName ? 'items-end' : 'items-start'}`}>
                         <div className={`max-w-[85%] px-4 py-2 rounded-2xl backdrop-blur-sm border shadow-sm ${m.sender === userName ? 'bg-rose-900/80 text-rose-100 border-rose-500/30 rounded-tr-none' : 'bg-white/10 text-white border-white/10 rounded-tl-none'}`}>
                             {m.stickerKey ? (
                                 <div className="w-20 h-20">{STICKER_MAP[m.stickerKey]}</div>
                             ) : (
                                 <p className="text-sm">{m.text}</p>
                             )}
                         </div>
                         <span className="text-[10px] text-white/40 mt-1 mx-1">{m.sender} • {m.timestamp}</span>
                     </div>
                 ))}
             </div>
             
             {/* Input Area */}
             <div className="p-3 glass-deep border-t border-white/10 relative z-50">
                <div className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={inputText} 
                        onChange={e => setInputText(e.target.value)}
                        className="flex-grow bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-rose-500/50 text-white placeholder-white/30 transition-colors shadow-inner"
                        placeholder="Send a message..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage} disabled={!inputText.trim()} className="p-2.5 bg-rose-600 rounded-full text-white hover:bg-rose-500 transition-colors active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                        <Send size={20} />
                    </button>
                </div>
             </div>
        </div>
    );

    const renderGallery = () => (
        <div className="grid grid-cols-2 gap-3 p-4 overflow-y-auto pb-20">
             {/* Upload Button */}
             <button onClick={() => setShowUploadModal(true)} className="aspect-square rounded-xl border-2 border-dashed border-gold-500/30 flex flex-col items-center justify-center text-gold-400 gap-2 hover:bg-gold-500/10 transition-colors">
                 <Camera size={24} />
                 <span className="text-xs font-bold uppercase">Add Memory</span>
             </button>

             {photos.map(p => (
                 <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden group bg-black/40">
                     <img src={p.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                         <p className="text-white text-xs truncate">{p.caption}</p>
                     </div>
                 </div>
             ))}
        </div>
    );

    return (
        <div className={`w-full h-full flex flex-col ${isRomanticMode ? 'bg-rose-950' : 'bg-[#2d0a0d]'}`}>
            {/* Atmosphere Layer */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {isRomanticMode ? (
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4a0416_0%,_transparent_100%)] opacity-60"></div>
                ) : (
                    <GoldDust opacity={0.3} />
                )}
            </div>

            {/* Top Bar */}
            <div className="shrink-0 p-4 flex items-center justify-between z-20 bg-black/20 backdrop-blur-sm border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-lg shadow-rose-900/50">
                        <Heart size={20} fill="currentColor" className="animate-pulse" />
                    </div>
                    <div>
                        <h1 className="font-heading text-gold-100 text-lg leading-none">Couple Dashboard</h1>
                        <p className="text-rose-300 text-xs font-serif">Love is in the air</p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <button onClick={handleThemeToggle} className={`p-2 rounded-full transition-colors ${isRomanticMode ? 'bg-rose-500 text-white shadow-glow-rose' : 'bg-white/10 text-stone-400'}`}>
                         <Sparkles size={18} />
                     </button>
                     <button onClick={onLogout} className="p-2 rounded-full bg-white/10 text-stone-400 hover:bg-white/20">
                         <LogOut size={18} />
                     </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow overflow-hidden relative z-10 bg-[#0f0505]/50">
                 {activeTab === 'home' && (
                     <div className="h-full p-4 overflow-y-auto space-y-4">
                         {/* Stats Card */}
                         <div className="bg-gradient-to-br from-rose-900 to-rose-950 p-6 rounded-2xl shadow-xl border border-rose-500/30 relative overflow-hidden">
                             <Heart size={120} className="absolute -right-4 -bottom-4 text-rose-500/10 rotate-12" />
                             <div className="relative z-10 text-center">
                                 <div className="text-5xl font-heading text-white mb-1 drop-shadow-lg">{heartCount}</div>
                                 <p className="text-rose-200 text-xs uppercase tracking-widest">Love Received</p>
                             </div>
                         </div>

                         {/* Quick Actions */}
                         <div className="grid grid-cols-2 gap-3">
                              <button onClick={() => setActiveTab('chat')} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center gap-2 group">
                                  <MessageSquare size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                  <span className="text-xs font-bold text-stone-300">Guestbook</span>
                              </button>
                              <button onClick={() => setActiveTab('gallery')} className="p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex flex-col items-center gap-2 group">
                                  <Camera size={24} className="text-purple-400 group-hover:scale-110 transition-transform" />
                                  <span className="text-xs font-bold text-stone-300">Memories</span>
                              </button>
                         </div>

                         {/* Location Map Mini View */}
                         <div className="h-48 bg-stone-900 rounded-xl border border-white/10 overflow-hidden relative cursor-pointer group" onClick={() => setIsMapOpen(true)}>
                             <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] transition-opacity group-hover:opacity-50"></div>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <div className="w-32 h-32 rounded-full border-4 border-rose-500/30 flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform">
                                     <div className="w-4 h-4 bg-rose-500 rounded-full shadow-[0_0_20px_rgba(244,63,94,0.8)]"></div>
                                 </div>
                             </div>
                             <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/10 flex items-center gap-2">
                                 <Users size={12} /> {Object.keys(activeUsers).length} Active Guests
                             </div>
                             <div className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                 <ExternalLink size={14} />
                             </div>
                         </div>
                     </div>
                 )}
                 
                 {activeTab === 'chat' && renderChat()}
                 {activeTab === 'gallery' && renderGallery()}
                 
                 {activeTab === 'music' && (
                     !spotifyConnected ? (
                         <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                             <div className="w-24 h-24 bg-[#1DB954] rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(29,185,84,0.4)] animate-float">
                                 <Music size={48} className="text-black" />
                             </div>
                             <h2 className="text-2xl font-heading text-white mb-2">Set the Mood</h2>
                             <p className="text-stone-400 text-sm mb-8 max-w-xs">Connect your Spotify account to curate the wedding playlist and let guests vibe with you.</p>
                             <button 
                                onClick={handleSpotifyConnect}
                                className="bg-[#1DB954] text-black font-bold px-8 py-4 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center gap-3"
                             >
                                 <Wifi size={20} /> Connect Spotify
                             </button>
                         </div>
                     ) : renderSpotifyView()
                 )}
            </div>

            {/* Bottom Nav */}
            <div className="shrink-0 bg-black/40 backdrop-blur-xl border-t border-white/10 p-2">
                <div className="flex justify-around items-center">
                     {[
                         { id: 'home', icon: Home, label: 'Home' },
                         { id: 'chat', icon: MessageSquare, label: 'Chat' },
                         { id: 'music', icon: Music, label: 'Spotify' },
                         { id: 'gallery', icon: Camera, label: 'Gallery' },
                     ].map(tab => (
                         <button 
                            key={tab.id} 
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${activeTab === tab.id ? 'text-gold-400 bg-white/5' : 'text-stone-500 hover:text-stone-300'}`}
                         >
                             <tab.icon size={20} className={activeTab === tab.id ? 'animate-bounce-short' : ''} />
                             <span className="text-[9px] uppercase tracking-wider font-bold">{tab.label}</span>
                         </button>
                     ))}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
                     <div className="bg-[#2d0a0d] border border-white/10 rounded-2xl p-6 w-full max-w-sm text-center">
                         <h3 className="text-xl font-heading text-gold-100 mb-4">Share a Moment</h3>
                         <div className="h-40 border-2 border-dashed border-stone-600 rounded-xl flex flex-col items-center justify-center gap-2 mb-4 bg-black/20">
                              <Upload size={32} className="text-stone-500" />
                              <p className="text-xs text-stone-500">Tap to select photo</p>
                         </div>
                         <input type="text" placeholder="Write a caption..." className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white text-sm mb-4 focus:border-gold-500 focus:outline-none" />
                         <div className="flex gap-3">
                             <button onClick={() => setShowUploadModal(false)} className="flex-1 py-3 rounded-lg border border-white/10 text-stone-400">Cancel</button>
                             <button onClick={() => {
                                 const newPhoto: MediaItem = {
                                     id: Date.now().toString(),
                                     url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
                                     type: 'image',
                                     caption: 'Just added! ❤️',
                                     timestamp: Date.now()
                                 };
                                 const updatedPhotos = [newPhoto, ...photos];
                                 setPhotos(updatedPhotos);
                                 localStorage.setItem('wedding_gallery_media', JSON.stringify(updatedPhotos));
                                 broadcastSync('gallery_sync', updatedPhotos);
                                 setShowUploadModal(false);
                             }} className="flex-1 py-3 rounded-lg bg-gold-600 text-black font-bold">Post</button>
                         </div>
                     </div>
                </div>
            )}
            
            {/* Map Modal */}
            <LiveMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} userName={userName} activeUsers={activeUsers} />
        </div>
    );
};

export default CoupleDashboard;
