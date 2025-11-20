import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, ChevronRight, X, Users, Utensils, Minus, Plus, CheckCircle, XCircle, Sparkles, Send, Smile, Sticker, ChevronLeft, LogOut, ChevronDown, Map, Navigation, Phone, Search, Compass, Globe, Plane, Hand, Music, Gift, Sun, Moon, Mic, PhoneCall, Film, ThumbsUp, LocateFixed, Contact, Upload, Image as ImageIcon, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Visual Assets & Icons ---

const FloralPattern = ({ className, opacity = 0.1 }: { className?: string, opacity?: number }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }}>
    <svg width="100%" height="100%">
      <pattern id="floral-pat" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20,0 C25,10 35,10 40,0 C30,5 30,15 40,20 C30,25 30,35 40,40 C35,30 25,30 20,40 C25,30 15,30 10,40 C10,30 10,20 0,20 C10,15 10,5 0,0 C5,10 15,10 20,0 Z" fill="currentColor" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#floral-pat)" />
    </svg>
  </div>
);

const FloralCorner = ({ className, rotate = 0 }: { className?: string, rotate?: number }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
    <path d="M0,0 C30,0 40,10 50,30 C60,10 90,0 100,0 C90,20 80,40 60,50 C80,60 90,90 100,100 C70,90 60,80 50,60 C40,80 10,90 0,100 C10,70 20,60 40,50 C20,40 10,20 0,0 Z" fill="#cd7f7f" opacity="0.9" />
    <path d="M10,10 Q30,10 40,25 Q25,40 10,40 Q10,25 10,10" fill="#e3c98d" opacity="0.8" />
    <path d="M0,0 L20,0 L0,20 Z" fill="#881337" />
    <circle cx="25" cy="25" r="4" fill="#fff" fillOpacity="0.6" />
  </svg>
);

const KalashIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 8C7 8 5 12 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 12 17 8 17 8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
    <path d="M12 2V5" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 5C15 5 17 4 17 4C17 4 16 7 12 7C8 7 7 4 7 4C7 4 9 5 12 5Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
    <circle cx="12" cy="15" r="2" fill="currentColor" />
  </svg>
);

const LotusIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
        <path d="M12,2 C12,2 16,8 16,12 C16,16 12,20 12,22 C12,20 8,16 8,12 C8,8 12,2 12,2 Z" opacity="0.8"/>
        <path d="M12,22 C12,20 18,16 20,12 C20,16 14,22 12,22 Z" opacity="0.6"/>
        <path d="M12,22 C12,20 6,16 4,12 C4,16 10,22 12,22 Z" opacity="0.6"/>
    </svg>
);

const ScrollsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M15 5L17 3L19 5L17 7L15 5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M5 5L7 3L9 5L7 7L5 5Z" fill="currentColor" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M7 7L17 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 7L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" fillOpacity="0.4" transform="rotate(45 12 12)" />
  </svg>
);

const RingsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
     <circle cx="9" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
     <circle cx="15" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
     <path d="M12 9L12 10" stroke="currentColor" strokeWidth="1.5"/>
     <path d="M12 6L13 7L14 6L12 4L10 6L11 7L12 6Z" fill="currentColor" />
  </svg>
);

// --- Map Specific Assets ---

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

// --- Sticker Components ---
const StickerKalash = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <path d="M30,80 Q30,95 50,95 Q70,95 70,80 L75,40 Q80,30 50,30 Q20,30 25,40 Z" fill="#b45309" stroke="#78350f" strokeWidth="2"/>
    <path d="M30,40 Q50,50 70,40" stroke="#fcd34d" strokeWidth="3" fill="none"/>
    <circle cx="50" cy="60" r="10" fill="#fcd34d" />
    <path d="M50,30 L50,20 M40,30 L35,15 M60,30 L65,15" stroke="#15803d" strokeWidth="3"/>
    <circle cx="50" cy="15" r="8" fill="#fbbf24"/>
  </svg>
);

const StickerShehnai = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <path d="M20,80 L80,20 L90,30 L30,90 Z" fill="#92400e" />
    <circle cx="25" cy="85" r="12" fill="#fbbf24" stroke="#b45309" strokeWidth="2"/>
    <circle cx="25" cy="85" r="6" fill="#000" opacity="0.3"/>
    <path d="M35,65 L40,60 M50,50 L55,45 M65,35 L70,30" stroke="#fbbf24" strokeWidth="3"/>
  </svg>
);

const StickerSagai = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <defs>
      <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="100%" stopColor="transparent" />
      </radialGradient>
    </defs>
    <path d="M20,65 Q20,95 50,95 Q80,95 80,65 L80,55 Q50,45 20,55 Z" fill="#be123c" stroke="#881337" strokeWidth="2"/>
    <path d="M20,55 Q50,45 80,55 Q50,65 20,55" fill="#9f1239" />
    <circle cx="50" cy="45" r="12" fill="none" stroke="#fbbf24" strokeWidth="4" />
    <circle cx="50" cy="33" r="4" fill="#fff" filter="url(#ringGlow)"/>
    <path d="M50,33 L50,33" stroke="#fff" strokeWidth="2" className="animate-pulse"/>
    <text x="50" y="85" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#fbbf24" fontWeight="bold">Sagai</text>
  </svg>
);

const StickerJodi = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
     <path d="M50,85 L20,55 Q5,40 20,25 Q35,10 50,35 Q65,10 80,25 Q95,40 65,55 Z" fill="#be123c" stroke="#9f1239" strokeWidth="2" />
     <text x="50" y="45" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#fff" fontWeight="bold">Jodi</text>
     <text x="50" y="60" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#fbbf24" fontWeight="bold">No. 1</text>
  </svg>
);

const StickerBadhai = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <rect x="10" y="30" width="80" height="40" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="2"/>
    <text x="50" y="52" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#b45309" fontWeight="bold">Badhai</text>
    <text x="50" y="67" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#b45309" fontWeight="bold">Ho!</text>
    <circle cx="15" cy="35" r="3" fill="#ef4444" />
    <circle cx="85" cy="35" r="3" fill="#ef4444" />
    <circle cx="15" cy="65" r="3" fill="#ef4444" />
    <circle cx="85" cy="65" r="3" fill="#ef4444" />
  </svg>
);

const StickerSwagat = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <path d="M10,30 Q50,100 90,30" fill="none" stroke="#ea580c" strokeWidth="12" strokeLinecap="round" strokeDasharray="1,12" />
    <path d="M10,30 Q50,100 90,30" fill="none" stroke="#facc15" strokeWidth="12" strokeLinecap="round" strokeDasharray="1,12" strokeDashoffset="6"/>
    <text x="50" y="50" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#4a0e11" fontWeight="bold">Swagat</text>
    <text x="50" y="65" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#4a0e11">Hai</text>
  </svg>
);

const StickerNazar = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
    <path d="M10,50 Q50,20 90,50 Q50,80 10,50 Z" fill="#fff" stroke="#000" strokeWidth="2"/>
    <circle cx="50" cy="50" r="18" fill="#3b82f6" />
    <circle cx="50" cy="50" r="10" fill="#000" />
    <circle cx="55" cy="45" r="4" fill="#fff" />
    <text x="50" y="90" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#000">Nazar Na Lage</text>
  </svg>
);

const StickerElephant = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
     <path d="M20,60 Q20,30 50,30 Q80,30 80,60 L80,90 L70,90 L70,70 L60,70 L60,90 L50,90" fill="#94a3b8"/>
     <path d="M20,60 Q10,70 20,80" stroke="#94a3b8" strokeWidth="4" fill="none"/><rect x="40" y="30" width="20" height="20" fill="#b91c1c"/><circle cx="35" cy="45" r="2" fill="#000"/></svg>
);

// --- Effects ---

const DashboardGoldDust = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const particles: Array<{x: number, y: number, vy: number, size: number, alpha: number, phase: number}> = [];

    const resize = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
      initParticles();
    };

    const initParticles = () => {
      particles.length = 0;
      const count = 40;
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vy: -Math.random() * 0.3 - 0.1,
          size: Math.random() * 1.5,
          alpha: Math.random() * 0.5 + 0.2,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.y += p.vy;
        if (p.y < 0) p.y = canvas.height;
        
        const shimmer = Math.sin(Date.now() * 0.003 + p.phase);
        ctx.globalAlpha = p.alpha * (0.5 + 0.5 * shimmer);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(draw);
    };

    window.addEventListener('resize', resize);
    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />;
};

const CelebrationEffects = () => (
  <div className="fixed inset-0 z-[100] pointer-events-none overflow-hidden flex justify-center">
    <style>{`
      @keyframes celebrate-fall {
        0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
      }
    `}</style>
    {Array.from({ length: 60 }).map((_, i) => {
       const left = Math.random() * 100;
       const duration = 2.5 + Math.random() * 2;
       const delay = Math.random() * 1.5;
       const rotationDir = Math.random() > 0.5 ? 1 : -1;
       const type = i % 4; 
       
       return (
         <div 
           key={i}
           className="absolute -top-20"
           style={{
             left: `${left}%`,
             animation: `celebrate-fall ${duration}s linear ${delay}s forwards`,
             '--tw-rotate': `${rotationDir * 360}deg`
           } as React.CSSProperties}
         >
             {type === 0 ? (
                <Heart className="text-rose-500 drop-shadow-lg" size={24 + Math.random() * 12} fill="#e11d48" />
             ) : type === 1 ? (
                <LotusIcon className="w-8 h-8 text-pink-500 drop-shadow-lg" />
             ) : type === 2 ? (
                <div className="w-8 h-8 opacity-90 text-gold-500"><FloralCorner className="w-full h-full" /></div>
             ) : (
                <div className="w-2.5 h-4 bg-gold-400 rounded-sm shadow-sm" style={{ backgroundColor: ['#fbbf24', '#ef4444', '#10b981', '#3b82f6'][i % 4] }} />
             )}
         </div>
       );
    })}
  </div>
);

// --- Shared Interactive Pan/Zoom Hook with Pinch ---
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
                {/* Pulse Effect for Couple */}
                {type === 'couple' && (
                     <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-50"></div>
                )}
            </div>
            <div className={`mt-4 px-4 py-1 ${type === 'couple' ? 'bg-rose-900/90 border-rose-500' : 'bg-[#4a0e11]/90 border-[#f59e0b]/50'} backdrop-blur-md rounded-full border shadow-[0_8px_16px_rgba(0,0,0,0.6)] transform transition-transform group-hover:scale-105 group-hover:-translate-y-1`}>
                <span className="text-[#fef3c7] text-xs sm:text-sm font-serif font-bold whitespace-nowrap tracking-wide drop-shadow-sm">{name}</span>
            </div>
