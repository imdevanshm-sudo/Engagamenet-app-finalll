import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Home, MessageSquare, Heart, Camera, X, Sparkles, Music, Gift, Smile, Send, Play, Pause, SkipForward, SkipBack, ExternalLink, LogOut, ChevronRight, Radio, Map, Navigation, Phone, Search, Compass, Globe, Plane, Hand, Plus, Minus, Users, Utensils, PhoneCall, MapPin, Lock, User, Film, Upload, Mic, ChevronLeft, LocateFixed } from 'lucide-react';

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

type BroadcastEvent = 
  | { type: 'message'; payload: Message }
  | { type: 'heart_update'; count: number }
  | { type: 'love_explosion'; sender: string }
  | { type: 'location_update'; id: string; name: string; x: number; y: number; role: 'guest' | 'couple' };

interface LocationUpdate {
    type: 'location_update';
    id: string;
    name: string;
    x: number;
    y: number;
    role: 'couple' | 'guest';
}

// --- Shared Assets (Stickers & Map Icons) ---
// ... (Keep existing sticker SVG components same as before to avoid huge diff, they are fine) ...

const StickerKalash = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <path d="M30,80 Q30,95 50,95 Q70,95 70,80 L75,40 Q80,30 50,30 Q20,30 25,40 Z" fill="#b45309" stroke="#78350f" strokeWidth="2"/>
    <path d="M30,40 Q50,50 70,40" stroke="#fcd34d" strokeWidth="3" fill="none"/>
    <circle cx="50" cy="60" r="10" fill="#fcd34d" />
    <path d="M50,30 L50,20 M40,30 L35,15 M60,30 L65,15" stroke="#15803d" strokeWidth="3"/>
    <circle cx="50" cy="15" r="8" fill="#fbbf24"/>
  </svg>
);

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

// --- Hooks ---

const useLockBodyScroll = (isLocked: boolean) => {
  useLayoutEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (isLocked) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isLocked]);
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

  const zoom = (delta: number) => {
     setTransform(prev => ({
         ...prev,
         scale: Math.min(maxScale, Math.max(minScale, prev.scale + delta))
     }));
  };

  const setRotation = (deg: number) => {
      setTransform(prev => ({ ...prev, rotate: deg }));
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

  return { transform, isDragging, handlers, zoom, setRotation, style };
};

// --- Map Components ---

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

// --- Photo Gallery View ---
const PhotoGalleryView: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const [photos, setPhotos] = useState<MediaItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            const saved = localStorage.getItem('wedding_gallery_media');
            if (saved) {
                try {
                    setPhotos(JSON.parse(saved));
                } catch (e) {
                    console.error(e);
                    // Fallback defaults
                }
            }
        }
    }, [isOpen]);

    const handleUpload = () => {
        // Simulation of upload
        const newPhoto: MediaItem = {
             id: Date.now().toString(),
             url: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=2070&auto=format&fit=crop",
             type: 'image',
             caption: 'Couple Upload',
             timestamp: Date.now()
        }
        const updated = [newPhoto, ...photos];
        setPhotos(updated);
        localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
    }

    return (
        <div className="fixed inset-0 z-[70] bg-[#1a0405] overflow-y-auto animate-in slide-in-from-bottom duration-700">
             <div className="sticky top-0 bg-[#1a0405]/90 backdrop-blur-md p-4 flex justify-between items-center border-b border-gold-500/30 z-50 shadow-lg">
                <h2 className="text-gold-100 font-heading text-xl tracking-widest">Family Memories</h2>
                <button onClick={onClose} className="text-gold-400 hover:text-gold-100 bg-black/20 rounded-full p-2"><X size={24}/></button>
            </div>
            <div className="p-6 pb-24 max-w-lg mx-auto">
                 <div className="bg-[#fcd34d] rounded-2xl p-4 mb-8 flex items-center justify-center gap-4 shadow-xl cursor-pointer hover:bg-[#fbbf24] transition-colors active:scale-95" onClick={handleUpload}>
                     <Upload size={24} className="text-[#4a0e11]"/>
                     <span className="text-[#4a0e11] font-bold font-serif text-lg">Add New Memory</span>
                 </div>
                 <div className="grid grid-cols-2 gap-6">
                     {photos.map((photo, i) => (
                         <div 
                            key={i} 
                            className={`relative rounded-2xl overflow-hidden shadow-lg border-2 border-gold-500/20 group cursor-pointer animate-in zoom-in fade-in duration-700 fill-mode-backwards ${i % 3 === 0 ? 'col-span-2 aspect-video' : 'col-span-1 aspect-square'}`}
                            style={{ animationDelay: `${i * 50}ms` }}
                        >
                             {photo.type === 'video' ? (
                                 <div className="w-full h-full flex items-center justify-center bg-black relative">
                                     <img src={photo.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt={`Memory ${i}`}/>
                                     <div className="absolute inset-0 flex items-center justify-center">
                                         <Film className="text-white/80 drop-shadow-lg w-12 h-12" />
                                     </div>
                                 </div>
                             ) : (
                                 <img src={photo.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={`Memory ${i}`}/>
                             )}

                             <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                 <span className="text-white text-sm font-serif tracking-wider">{photo.caption || 'View Memory'}</span>
                             </div>
                         </div>
                     ))}
                 </div>
            </div>
        </div>
    );
};

// --- Heart Hug Animation Component ---
const HeartHug = () => (
    <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none overflow-hidden">
         <style>{`
             @keyframes hugLeft { 
                 0% { transform: translateX(-60px) rotate(-10deg); opacity: 0; } 
                 40% { transform: translateX(0) rotate(-10deg); opacity: 1; } 
                 60% { transform: translateX(4px) rotate(-15deg); } 
                 100% { transform: translateX(0) rotate(-10deg); } 
             }
             @keyframes hugRight { 
                 0% { transform: translateX(60px) rotate(10deg); opacity: 0; } 
                 40% { transform: translateX(0) rotate(10deg); opacity: 1; } 
                 60% { transform: translateX(-4px) rotate(15deg); } 
                 100% { transform: translateX(0) rotate(10deg); } 
             }
             .animate-hug-left { animation: hugLeft 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
             .animate-hug-right { animation: hugRight 1.5s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
         `}</style>
         <div className="relative w-24 h-24">
             <Heart className="text-rose-600 w-12 h-12 absolute top-6 left-0 animate-hug-left drop-shadow-lg" fill="currentColor" />
             <Heart className="text-rose-500 w-12 h-12 absolute top-6 right-0 animate-hug-right drop-shadow-lg" fill="currentColor" />
             <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-gold-200 font-cursive text-lg opacity-0 animate-in fade-in delay-1000 duration-1000 fill-mode-forwards whitespace-nowrap">Forever Yours!</div>
         </div>
    </div>
);

const LiveMapModal: React.FC<{ isOpen: boolean; onClose: () => void; userName: string }> = ({ isOpen, onClose, userName }) => {
    const { transform, handlers, style } = usePanZoom(1, 0.5, 3);
    const [activeUsers, setActiveUsers] = useState<Record<string, {x: number, y: number, name: string, role: 'couple'|'guest', timestamp: number}>>({});
    const [myLocation, setMyLocation] = useState<{x: number, y: number} | null>(null);
    const [viewMode, setViewMode] = useState<'venue' | 'google'>('venue');

    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        channel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({
                    ...prev,
                    [data.id]: { x: data.x, y: data.y, name: data.name, role: data.role, timestamp: Date.now() }
                }));
            }
        };
        return () => channel.close();
    }, []);

    // Couple can update location by clicking too
    const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (viewMode !== 'venue') return;
        if (!isOpen) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setMyLocation({ x, y });
        
        const channel = new BroadcastChannel('wedding_live_map');
        channel.postMessage({
            type: 'location_update',
            id: userName,
            name: userName,
            x, y,
            role: 'couple'
        });
        channel.close();
    };

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
                    <h2 className="text-gold-100 font-heading text-2xl drop-shadow-md">Live Venue Tracker</h2>
                    <p className="text-gold-400 text-xs font-serif opacity-80">
                        {viewMode === 'venue' ? 'Tap to update your location' : 'View real-time traffic & directions'}
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
                         Google Location
                     </button>
                 </div>
             </div>
             
             <div className="flex-grow overflow-hidden relative bg-[#1a0507]">
                  {viewMode === 'venue' ? (
                      <div className="w-full h-full cursor-grab active:cursor-grabbing relative overflow-hidden" {...handlers} style={style}>
                          <div 
                            className="absolute inset-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
                            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
                          >
                              <div className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 bg-[#f5f5f4] border-[20px] border-[#4a0e11] shadow-2xl overflow-hidden" onClick={handleMapClick}>
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
                                  
                                  {myLocation && (
                                      <MapNode x={myLocation.x} y={myLocation.y} name="You" type="couple" />
                                  )}

                                  {Object.values(activeUsers).map((u, i) => (
                                      <MapNode key={i} x={u.x} y={u.y} name={u.name} type={u.role} delay={i * 100} />
                                  ))}
                              </div>
                          </div>
                      </div>
                  ) : (
                      <div className="w-full h-full relative">
                          <iframe 
                              width="100%" 
                              height="100%" 
                              style={{ border: 0 }} 
                              loading="lazy" 
                              allowFullScreen 
                              src="https://maps.google.com/maps?q=Taj+Lands+End+Mumbai&t=&z=17&ie=UTF8&iwloc=&output=embed"
                              className="grayscale-[20%] contrast-125"
                          ></iframe>
                           <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur px-4 py-2 rounded-full shadow-lg border border-gold-200 flex items-center gap-2 z-10">
                                <a href="https://www.google.com/maps/search/?api=1&query=Taj+Lands+End+Mumbai" target="_blank" rel="noreferrer" className="text-xs font-bold text-blue-700 flex items-center gap-1">
                                    <Navigation size={12}/> Open in Google Maps App
                                </a>
                          </div>
                      </div>
                  )}
             </div>
        </div>
    );
};

// --- Love Thermometer Component ---
const LoveThermometer = ({ count }: { count: number }) => {
    const fillPercent = Math.min(100, Math.max(10, (count * 5) % 110)); 
    const [hearts, setHearts] = useState<Array<{id: number, type: 'heart'|'ring'|'diamond', x: number}>>([]);

    const handleClick = () => {
        const id = Date.now();
        const types: ('heart'|'ring'|'diamond')[] = ['heart', 'ring', 'diamond'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * 40 - 20; 
        setHearts(prev => [...prev, { id, type, x }]);
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
    };

    return (
        <div className="absolute right-2 bottom-32 z-50 flex flex-col items-center pointer-events-auto" onClick={handleClick}>
            <div className="absolute bottom-full w-24 h-40 pointer-events-none overflow-hidden -z-10 left-1/2 -translate-x-1/2">
                 {hearts.map(h => (
                     <div key={h.id} className="absolute bottom-0 left-1/2 animate-sidebar-float text-rose-500 drop-shadow-lg" style={{ '--x': `${h.x}px` } as React.CSSProperties}>
                         {h.type === 'heart' && <Heart size={20} fill="currentColor" />}
                         {h.type === 'ring' && <div className="w-5 h-5 border-2 border-yellow-400 rounded-full"></div>}
                         {h.type === 'diamond' && <div className="w-4 h-4 bg-blue-400 rotate-45"></div>}
                     </div>
                 ))}
            </div>

            <div className="relative w-14 h-48 cursor-pointer group transition-transform active:scale-95">
                <svg viewBox="0 0 60 200" className="absolute inset-0 w-full h-full drop-shadow-2xl">
                    <path d="M30,190 C45,190 55,180 55,165 L55,35 C55,15 45,5 30,5 C15,5 5,15 5,35 L5,165 C5,180 15,190 30,190 Z" fill="#fffbf5" stroke="#b45309" strokeWidth="2"/>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <line key={i} x1="20" y1={35 + i * 18} x2="40" y2={35 + i * 18} stroke="#d6d3d1" strokeWidth="1" />
                    ))}
                    <circle cx="30" cy="165" r="18" fill="#fffbf5" stroke="#b45309" strokeWidth="2" />
                    <path d="M30,5 C40,5 50,15 50,25" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
                </svg>
                <div className="absolute bottom-[26px] left-[10px] right-[10px] bg-stone-100 rounded-t-full overflow-hidden h-[138px] w-[36px] ml-auto mr-auto z-10">
                    <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 transition-all duration-700 ease-out flex items-start justify-center pt-1"
                        style={{ height: `${fillPercent}%` }}
                    >
                         <div className="w-full h-2 bg-white/30 animate-pulse blur-[1px]"></div>
                         <div className="absolute bottom-2 left-2 w-1 h-1 bg-white/40 rounded-full animate-ping"></div>
                         <div className="absolute bottom-6 right-3 w-1.5 h-1.5 bg-white/40 rounded-full animate-ping delay-300"></div>
                    </div>
                </div>
                <div className="absolute bottom-[7px] left-[12px] w-[32px] h-[32px] rounded-full bg-gradient-to-br from-rose-500 to-rose-700 z-20 shadow-inner flex items-center justify-center">
                    <Heart size={16} fill="#fcd34d" className="text-gold-300 animate-pulse" />
                </div>
                <div className="absolute inset-0 z-30 rounded-full bg-gradient-to-r from-white/40 to-transparent opacity-30 pointer-events-none w-[80%] mx-auto"></div>
            </div>
            <div className="mt-2 px-2 py-1 bg-black/40 backdrop-blur-sm rounded-full text-[10px] font-bold text-gold-200 tracking-widest uppercase shadow-sm border border-gold-500/30">
                Love Meter
            </div>
        </div>
    );
};

// --- Message Board Component ---
const MessageBoard: React.FC<{ isOpen: boolean; onClose: () => void; userName: string }> = ({ isOpen, onClose, userName }) => {
    const [messages, setMessages] = useState<Message[]>(() => {
        if (typeof window === 'undefined') return [];
        const saved = localStorage.getItem('wedding_chat_messages');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { console.error(e); }
        }
        return [
            { id: '1', text: "So excited to see you all! Let the celebrations begin! 🎉", sender: "Sneha Gupta", isCouple: true, timestamp: "10:30 AM", type: 'text' },
            { id: '2', text: "The excitement is real! Looking forward to celebrating with everyone.", sender: "Ravi Sharma", isCouple: false, timestamp: "10:35 AM", type: 'text' },
            { id: '3', text: "So happy you all could make it. Your presence is the greatest gift.", sender: "Aman Gupta", isCouple: true, timestamp: "10:38 AM", type: 'text' },
        ];
    });
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState<'emoji' | 'sticker' | null>(null);
    const [floatingHearts, setFloatingHearts] = useState<Array<{id: number, left: number}>>([]);
    const [globalHeartCount, setGlobalHeartCount] = useState<number>(() => {
        if (typeof window === 'undefined') return 0;
        const saved = localStorage.getItem('wedding_heart_count');
        return saved ? parseInt(saved) : 42; 
    });
    const scrollRef = useRef<HTMLDivElement>(null);
    useLockBodyScroll(isOpen);

    useEffect(() => {
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.onmessage = (event) => {
            const data = event.data as BroadcastEvent;
            if (data.type === 'message') {
                setMessages((prev) => {
                    if (prev.some(m => m.id === data.payload.id)) return prev;
                    return [...prev, data.payload];
                });
            } else if (data.type === 'heart_update') {
                setGlobalHeartCount(data.count);
            }
        };
        return () => channel.close();
    }, []);

    useEffect(() => {
        localStorage.setItem('wedding_chat_messages', JSON.stringify(messages));
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
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

    const handleSendMessage = () => {
        if (!inputText.trim()) return;
        const isCoupleUser = true; // Since this is CoupleDashboard
        const newMessage: Message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            text: inputText,
            sender: userName,
            isCouple: isCoupleUser,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
        };
        setMessages(prev => [...prev, newMessage]);
        broadcastMessage(newMessage);
        setInputText("");
    };

    const handleSendSticker = (stickerKey: string) => {
        const isCoupleUser = true;
        const newMessage: Message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            stickerKey: stickerKey,
            sender: userName,
            isCouple: isCoupleUser,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'sticker'
        };
        setMessages(prev => [...prev, newMessage]);
        broadcastMessage(newMessage);
        setActiveTab(null);
    };

    const triggerHeart = () => {
        const id = Date.now();
        const left = Math.random() * 60 + 10;
        setFloatingHearts(prev => [...prev, { id, left }]);
        setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 2000);
        const newCount = globalHeartCount + 1;
        setGlobalHeartCount(newCount);
        broadcastHeartUpdate(newCount);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-[#fff9f0] flex flex-col animate-in slide-in-from-bottom duration-500">
            <div className="bg-[#4a0e11] p-4 pt-8 flex items-center gap-4 shadow-md relative shrink-0 z-20">
                 <button onClick={onClose} className="text-gold-200 hover:text-white transition-colors"><ChevronLeft size={28} /></button>
                 <div className="flex-grow text-center mr-8">
                     <h2 className="text-gold-100 font-serif text-xl flex items-center justify-center gap-2">Sneha <Heart size={18} className="text-rose-500 fill-rose-500 animate-pulse"/> Aman</h2>
                     <p className="text-gold-400/60 text-xs uppercase tracking-widest font-serif">Live Messages</p>
                 </div>
            </div>
            <div className="flex-grow relative overflow-hidden bg-[#fff9f0]">
                <div ref={scrollRef} className="absolute inset-0 overflow-y-auto p-4 space-y-8 pb-32 pr-4 z-10">
                    {messages.map((msg) => {
                        const isSelf = msg.sender === userName;
                        return (
                            <div key={msg.id} className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                {!isSelf && (
                                    <div className="flex items-center gap-2 mb-2 ml-1">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border ${msg.isCouple ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-stone-100 text-stone-600 border-stone-200'}`}>
                                            {msg.isCouple ? (msg.sender.includes("Sneha") ? "S" : "A") : msg.sender.charAt(0)}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-serif font-bold leading-none ${msg.isCouple ? 'text-rose-700' : 'text-stone-600'}`}>{msg.sender}</span>
                                            {msg.isCouple && <span className="text-[10px] text-rose-500 font-sans uppercase tracking-wide">Couple</span>}
                                        </div>
                                    </div>
                                )}
                                <div className={`max-w-[85%] rounded-3xl px-5 py-3 shadow-md relative border ${
                                    msg.type === 'sticker' ? 'bg-transparent shadow-none border-none p-0' :
                                    isSelf ? 'bg-[#4a0e11] text-gold-100 rounded-tr-sm border-gold-500/20' : 
                                    msg.isCouple ? 'bg-gradient-to-br from-rose-50 to-white text-rose-900 rounded-tl-sm border-rose-200' : 
                                    'bg-white text-stone-800 rounded-tl-sm border-stone-100'
                                }`}>
                                    {msg.type === 'sticker' && msg.stickerKey && STICKER_MAP[msg.stickerKey] ? (
                                        <div className="w-32 h-32 animate-in zoom-in-50 spring-duration-300">{STICKER_MAP[msg.stickerKey]}</div>
                                    ) : (
                                        <p className="text-base font-serif leading-relaxed">{msg.text}</p>
                                    )}
                                </div>
                                <span className="text-[10px] text-stone-400 mt-1.5 mx-2 font-medium tracking-wide">{msg.timestamp}</span>
                            </div>
                        );
                    })}
                </div>
                <div onClick={triggerHeart}><LoveThermometer count={globalHeartCount} /></div>
                {floatingHearts.map((h) => (
                    <div key={h.id} className="absolute bottom-20 text-rose-500 animate-float-up pointer-events-none z-30" style={{ left: `${h.left}%` }}><Heart size={32} fill="currentColor" /></div>
                ))}
            </div>
            {/* Input Area */}
            <div className="bg-white border-t border-stone-200 p-3 pb-6 z-30 relative shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                {activeTab && (
                    <div className="absolute bottom-full left-0 right-0 bg-[#fffbf5] border-t border-gold-300 h-64 shadow-2xl animate-in slide-in-from-bottom-10 z-0 flex flex-col">
                        <div className="flex border-b border-gold-200">
                            <button onClick={() => setActiveTab('emoji')} className={`flex-1 py-4 font-serif text-sm font-bold transition-colors ${activeTab === 'emoji' ? 'text-maroon-800 border-b-2 border-maroon-800 bg-maroon-50' : 'text-stone-400'}`}>Emojis</button>
                            <button onClick={() => setActiveTab('sticker')} className={`flex-1 py-4 font-serif text-sm font-bold transition-colors ${activeTab === 'sticker' ? 'text-maroon-800 border-b-2 border-maroon-800 bg-maroon-50' : 'text-stone-400'}`}>Stickers</button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-6 bg-white/50 relative">
                           {activeTab === 'sticker' ? (
                               <div className="grid grid-cols-3 gap-6 relative z-10">
                                   {Object.keys(STICKER_MAP).map((key, i) => (
                                       <button key={i} onClick={() => handleSendSticker(key)} className="aspect-square p-2 hover:bg-gold-100 rounded-xl transition-colors group flex flex-col items-center justify-center gap-1">
                                           <div className="w-20 h-20 group-hover:scale-110 transition-transform">{STICKER_MAP[key]}</div>
                                       </button>
                                   ))}
                               </div>
                           ) : (
                               <div className="grid grid-cols-6 gap-4 text-3xl relative z-10">
                                   {["🙏", "🎉", "❤️", "🌹", "💍", "✨", "💃", "🕺", "🥁", "🎊", "👰‍♀️", "🤵‍♂️", "🥘", "🥂", "😍", "🥰", "🔥", "👏"].map(emoji => (
                                       <button key={emoji} onClick={() => setInputText(prev => prev + emoji)} className="p-2 hover:bg-stone-100 rounded-lg transition-colors">{emoji}</button>
                                   ))}
                               </div>
                           )}
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-3 relative z-20 bg-white px-1">
                    <button onClick={() => setActiveTab(activeTab ? null : 'sticker')} className={`p-3 rounded-full transition-colors ${activeTab ? 'bg-gold-100 text-maroon-800' : 'text-stone-400 hover:bg-stone-100'}`}><Smile size={26} /></button>
                    <div className="flex-grow bg-stone-50 rounded-full border border-stone-200 flex items-center px-4 py-3 focus-within:border-maroon-300 focus-within:ring-2 focus-within:ring-maroon-100 transition-all">
                        <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onFocus={() => setActiveTab(null)} placeholder="Send your love..." className="bg-transparent border-none outline-none w-full text-base font-serif text-stone-800 placeholder-stone-400" onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}/>
                    </div>
                    {inputText.trim() ? (
                        <button onClick={handleSendMessage} className="p-3 bg-maroon-800 text-white rounded-full hover:bg-maroon-700 transition-colors active:scale-95 shadow-lg"><Send size={24} /></button>
                    ) : (
                        <button onClick={triggerHeart} className="p-3 bg-rose-50 text-rose-500 rounded-full hover:bg-rose-100 transition-colors active:scale-95 border border-rose-200 shadow-md"><Heart size={24} fill="currentColor" /></button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Couple Dashboard Component ---

interface CoupleDashboardProps {
  userName: string;
  onLogout?: () => void;
}

const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ userName, onLogout }) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [showExplosion, setShowExplosion] = useState(false);
  const [config, setConfig] = useState({ coupleName: "Sneha & Aman", date: "2025-11-26" });
  
  // Countdown state
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [manualHugTrigger, setManualHugTrigger] = useState(false);

  useEffect(() => {
      const savedConfig = localStorage.getItem('wedding_global_config');
      if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
      }
  }, []);

  useEffect(() => {
    const targetDate = new Date(config.date + 'T00:00:00');

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = +targetDate - +now;
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        });
        setIsTimeUp(false);
      } else {
          setIsTimeUp(true);
          setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, [config.date]);

  // This button now only sends to private chat
  const handlePrivateLoveSignal = () => {
      // Send private message to simulate button action
      const channel = new BroadcastChannel('wedding_couple_private');
      const loveMsg: Message = {
          id: Date.now().toString(),
          text: "Just thinking of you... 💖",
          sender: userName,
          isCouple: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
      };
      channel.postMessage({ type: 'message', payload: loveMsg });
      
      const saved = localStorage.getItem('wedding_private_messages');
      const prevMsgs = saved ? JSON.parse(saved) : [];
      localStorage.setItem('wedding_private_messages', JSON.stringify([...prevMsgs, loveMsg]));
      channel.close();
      
      setIsChatOpen(true);
  };

  const handlePublicLoveExplosion = () => {
      setShowExplosion(true);
      setTimeout(() => setShowExplosion(false), 3000);

      const channel = new BroadcastChannel('wedding_portal_chat');
      const newCount = Math.floor(Math.random() * 50) + 100;
      channel.postMessage({ type: 'love_explosion', sender: userName });
      channel.postMessage({ type: 'heart_update', count: newCount });
      channel.close();
  };

  const handleStatusUpdate = (locationName: string, x: number, y: number) => {
      const channel = new BroadcastChannel('wedding_live_map');
      const update: LocationUpdate = {
          type: 'location_update',
          id: 'couple-main',
          name: config.coupleName,
          x: x,
          y: y,
          role: 'couple'
      };
      channel.postMessage(update);
      channel.close();
      alert(`Status Updated: We are now at ${locationName}`);
  };

  const handleTestAnimation = () => {
      setManualHugTrigger(true);
      setTimeout(() => setManualHugTrigger(false), 4000);
  }

  return (
    <div className="w-full h-full flex flex-col bg-[#fff0f5] relative font-serif overflow-hidden text-[#4a0e11]">
      {/* ... [Styles remain same] ... */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 10s infinite; }
        .animate-pulse-glow { animation: pulse-glow 2s infinite; }
      `}</style>

      {showExplosion && (
          <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
              {Array.from({ length: 50 }).map((_, i) => (
                  <div key={i} className="absolute text-rose-500 animate-bounce" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDuration: `${0.5 + Math.random()}s`, fontSize: `${20 + Math.random() * 40}px` }}>💖</div>
              ))}
              <div className="absolute inset-0 bg-rose-500/20 animate-pulse"></div>
          </div>
      )}

      <div className="flex-grow overflow-y-auto no-scrollbar relative z-10 pb-32">
        <header className="pt-14 pb-8 text-center relative animate-in fade-in slide-in-from-top-6 duration-1000">
            <div className="relative inline-block">
                <h1 className="font-cursive text-[3.5rem] text-transparent bg-clip-text bg-gradient-to-r from-[#be123c] via-[#e11d48] to-[#be123c] drop-shadow-sm leading-tight scale-y-110">
                    {config.coupleName}
                </h1>
                <div className="absolute -top-6 -right-6 text-gold-400 animate-spin-slow opacity-60"><Sparkles size={24} fill="currentColor" /></div>
            </div>
            <div className="flex items-center justify-center gap-3 mt-2">
                <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-rose-300"></div>
                <p className="font-serif text-sm text-[#9f1239] tracking-[0.3em] uppercase font-light">Forever Begins Now</p>
                <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-rose-300"></div>
            </div>
        </header>

        <div className="flex justify-center items-center gap-0 px-4 mb-10 relative perspective-1000">
            <div className="relative w-32 h-32 -mr-4 z-10 group transition-transform hover:z-30 hover:scale-110 duration-500">
                 <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-400 to-rose-200 p-[3px] shadow-xl">
                    <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1621184455862-c163dfb30e0f?q=80&w=1974&auto=format&fit=crop" alt="Sneha" className="w-full h-full object-cover"/>
                    </div>
                 </div>
            </div>
            <div className="relative z-20 transform -translate-y-1 animate-in zoom-in duration-700 delay-300">
                 <button onClick={handlePrivateLoveSignal} className="w-24 h-24 bg-white/80 backdrop-blur-md rounded-full shadow-[0_0_30px_rgba(225,29,72,0.3)] flex items-center justify-center border border-rose-100 relative group active:scale-90 transition-transform">
                     <div className="absolute inset-0 rounded-full border border-rose-200 animate-ping opacity-20 pointer-events-none"></div>
                     <div className="flex flex-col items-center justify-center">
                         <Heart size={36} strokeWidth={0} fill="#e11d48" className="text-rose-600 drop-shadow-md animate-pulse group-hover:scale-125 transition-transform" />
                         <span className="font-cursive text-rose-800 text-lg leading-none mt-1">Click Me!</span>
                     </div>
                 </button>
            </div>
            <div className="relative w-32 h-32 -ml-4 z-10 group transition-transform hover:z-30 hover:scale-110 duration-500">
                 <div className="absolute inset-0 rounded-full bg-gradient-to-tl from-rose-400 to-rose-200 p-[3px] shadow-xl">
                    <div className="w-full h-full rounded-full border-[3px] border-white overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=1974&auto=format&fit=crop" alt="Aman" className="w-full h-full object-cover"/>
                    </div>
                 </div>
            </div>
        </div>

        {/* Quick Status Update for Map */}
        <div className="px-5 mb-6">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-serif text-rose-900 font-bold text-sm flex items-center gap-2"><MapPin size={16} /> Quick Status Update</h3>
                <button onClick={() => setIsMapOpen(true)} className="text-[10px] font-bold text-rose-600 flex items-center gap-1 bg-rose-100 px-2 py-1 rounded-full hover:bg-rose-200 transition-colors"><Map size={12}/> Live Map</button>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => handleStatusUpdate("Stage", 50, 20)} className="bg-white border border-rose-200 rounded-full px-4 py-1.5 text-xs font-bold text-rose-700 shadow-sm whitespace-nowrap active:scale-95">At Stage</button>
                <button onClick={() => handleStatusUpdate("Dinner", 20, 50)} className="bg-white border border-rose-200 rounded-full px-4 py-1.5 text-xs font-bold text-rose-700 shadow-sm whitespace-nowrap active:scale-95">Having Dinner</button>
                <button onClick={() => handleStatusUpdate("Entrance", 50, 90)} className="bg-white border border-rose-200 rounded-full px-4 py-1.5 text-xs font-bold text-rose-700 shadow-sm whitespace-nowrap active:scale-95">At Entrance</button>
                <button onClick={() => handleStatusUpdate("Mandap", 80, 50)} className="bg-white border border-rose-200 rounded-full px-4 py-1.5 text-xs font-bold text-rose-700 shadow-sm whitespace-nowrap active:scale-95">At Mandap</button>
            </div>
        </div>

        <div className="px-5 space-y-8">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="flex items-center justify-between px-2 mb-3">
                    <h3 className="font-serif text-rose-900 font-bold text-lg flex items-center gap-2"><Radio size={18} className="text-rose-500"/> Live Music</h3>
                </div>
                {/* Placeholder for Spotify Player */}
                <div className="bg-white/60 backdrop-blur-xl rounded-[2rem] p-5 shadow-lg h-32 flex items-center justify-center border border-white/50">
                    <Music className="animate-bounce text-rose-400" />
                    <span className="ml-2 text-rose-800 font-serif italic">Playing "Raabta"...</span>
                </div>
            </div>

            <div className="bg-gradient-to-r from-white to-rose-50 rounded-3xl p-5 shadow-lg border border-rose-100 relative overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                 <div className="absolute right-0 top-0 opacity-5"><MessageSquare size={100} /></div>
                 <div className="flex justify-between items-center mb-4 relative z-10">
                     <h3 className="font-serif text-rose-900 font-bold text-lg">Love Notes</h3>
                     <span className="bg-rose-100 text-rose-600 text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1"><span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse"></span> Live</span>
                 </div>
                 <button onClick={() => setIsChatOpen(true)} className="w-full mt-4 py-2.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-200 transition-colors flex items-center justify-center gap-2">Open Message Board <ChevronRight size={14}/></button>
            </div>

            <div className="bg-[#4a0e11] rounded-3xl p-6 shadow-[0_10px_30px_rgba(74,14,17,0.3)] border border-[#5e181f] relative overflow-hidden text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400 min-h-[180px] flex flex-col justify-center cursor-pointer group" onClick={handleTestAnimation}>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                 <div className="relative z-10">
                      <h3 className="text-gold-100 font-heading text-lg tracking-widest mb-6">Countdown to {config.date}</h3>
                      <div className="flex justify-between items-center max-w-xs mx-auto">
                           {[{val: timeLeft.days, label: "Days"}, {val: timeLeft.hours, label: "Hours"}, {val: timeLeft.minutes, label: "Mins"}].map((item, i) => (
                               <div key={i} className="flex flex-col items-center">
                                   <div className="text-3xl font-bold text-gold-200 mb-1">{item.val}</div>
                                   <div className="text-[10px] text-gold-400 uppercase tracking-widest">{item.label}</div>
                               </div>
                           ))}
                      </div>
                      <div className="mt-6 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-gold-600 to-gold-300 w-[75%] rounded-full"></div>
                      </div>
                      <div className="mt-2 text-[8px] text-gold-500/40 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Tap to preview moment</div>
                 </div>
                 
                 {/* Heart Hug Animation Triggered when time is up or manually tested */}
                 {(isTimeUp || manualHugTrigger) && <HeartHug />}
            </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="absolute bottom-6 left-4 right-4 bg-black/80 backdrop-blur-xl rounded-2xl p-2 shadow-2xl border border-white/10 z-40 flex justify-between items-center animate-in slide-in-from-bottom-10 duration-1000 delay-500">
           <button className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-rose-400 bg-white/10">
               <Home size={20} strokeWidth={2.5} />
               <span className="text-[9px] font-bold">Home</span>
           </button>
           <button onClick={() => setIsGalleryOpen(true)} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-stone-400 hover:text-white transition-colors">
               <Camera size={20} />
               <span className="text-[9px] font-medium">Gallery</span>
           </button>
           
           <div className="relative -top-8">
               <button onClick={handlePublicLoveExplosion} className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-[0_8px_20px_rgba(225,29,72,0.6)] flex items-center justify-center transform hover:scale-110 active:scale-90 transition-transform border-4 border-[#fff0f5] animate-pulse-glow">
                   <Heart size={24} fill="currentColor" />
               </button>
           </div>

           <button onClick={() => setIsChatOpen(true)} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-stone-400 hover:text-white transition-colors">
               <MessageSquare size={20} />
               <span className="text-[9px] font-medium">Chat</span>
           </button>
           <button onClick={onLogout} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-stone-400 hover:text-rose-400 transition-colors">
               <LogOut size={20} />
               <span className="text-[9px] font-medium">Exit</span>
           </button>
      </div>

      <MessageBoard isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} userName={userName} />
      <PhotoGalleryView isOpen={isGalleryOpen} onClose={() => setIsGalleryOpen(false)} />
      <LiveMapModal isOpen={isMapOpen} onClose={() => setIsMapOpen(false)} userName={userName} />
    </div>
  );
};

export default CoupleDashboard;