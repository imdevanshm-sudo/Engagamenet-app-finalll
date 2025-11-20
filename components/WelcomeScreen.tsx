import React, { useEffect, useRef, useState } from 'react';
import { User, Sparkles, Lock, Image as ImageIcon, X, Save, Check, LogIn, Volume2, VolumeX, ChevronRight } from 'lucide-react';

// --- Audio Utilities ---
const isAudioMuted = () => localStorage.getItem('wedding_audio_muted') === 'true';

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
};

const playBellSound = () => {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(2800, t);
  
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(5600, t); 

  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.15, t + 0.01); 
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); 

  gain2.gain.setValueAtTime(0, t);
  gain2.gain.linearRampToValueAtTime(0.05, t + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5); 

  osc.connect(gain);
  osc2.connect(gain2);
  gain.connect(ctx.destination);
  gain2.connect(ctx.destination);

  osc.start(t);
  osc2.start(t);
  osc.stop(t + 1.5);
  osc2.stop(t + 1.5);
};

const playStrumSound = () => {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const notes = [329.63, 369.99, 415.30, 493.88, 554.37, 659.25];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    const start = t + (i * 0.06);
    
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.02); 
    gain.gain.exponentialRampToValueAtTime(0.001, start + 3.0); 

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + 3.5);
  });
};

// --- Visual Components ---

const GoldDust = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{x: number, y: number, vx: number, vy: number, size: number, alpha: number, phase: number}> = [];

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
      const count = Math.floor((canvas.width * canvas.height) / 12000); 
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2, 
          vy: -Math.random() * 0.4 - 0.05, 
          size: Math.random() * 1.5,
          alpha: Math.random() * 0.6 + 0.1,
          phase: Math.random() * Math.PI * 2
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.phase) * 0.15;
        p.phase += 0.015;

        if (p.y < -5) p.y = canvas.height + 5;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(252, 238, 181, ${p.alpha + Math.sin(p.phase) * 0.15})`; 
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
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70 w-full h-full will-change-transform" />;
};

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
     const r3 = (i * 41 + 19) % 100; 
     return {
        id: i,
        left: `${r1}%`,
        delay: `${r2 * 0.2}s`, 
        duration: `${15 + (r3 * 0.1)}s`, 
        scale: 0.6 + (r2 * 0.004)
     };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
       {petals.map(p => (
          <div 
            key={p.id}
            className="absolute -top-8 animate-petal-fall opacity-0 will-change-transform"
            style={{
               left: p.left,
               animationDelay: p.delay,
               animationDuration: p.duration,
               '--scale': p.scale
            } as React.CSSProperties}
          >
            <PetalIcon className="w-5 h-5 drop-shadow-sm opacity-80" />
          </div>
       ))}
    </div>
  );
}

// --- Custom Icons ---

const DiyaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C12 2 10 6 10 9C10 11 14 11 14 9C14 6 12 2 12 2Z" fill="#fbbf24" className="animate-flicker origin-bottom" />
    <path d="M2 14C2 14 2 20 12 20C22 20 22 14 22 14C22 14 18 16 12 16C6 16 2 14 2 14Z" fill="currentColor" />
    <path d="M4 14.5C4 14.5 7 17 12 17C17 17 20 14.5 20 14.5" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeLinecap="round"/>
  </svg>
);

const RingsIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
    <circle cx="16" cy="12" r="6" stroke="currentColor" strokeWidth="2" />
    <path d="M12 9L12 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const GaneshaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C9 2 8 4 8 5C8 6 9 6 9 6C7 7 6 9 6 11C6 13 7 14 7 14L6 18H18L17 14C17 14 18 13 18 11C18 9 17 7 15 6C15 6 16 6 16 5C16 4 15 2 12 2Z" opacity="0.9"/>
    <path d="M10 18L9 21H15L14 18H10Z" />
    <circle cx="12" cy="21" r="1" fill="#fbbf24" />
  </svg>
);

const SpinningFlower = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <g className="origin-center animate-spin-slow will-change-transform">
      {Array.from({ length: 8 }).map((_, i) => (
        <path 
          key={i}
          d="M50,50 Q65,20 50,5 Q35,20 50,50" 
          fill="#e3c98d" 
          stroke="#b45309" 
          strokeWidth="1"
          transform={`rotate(${i * 45} 50 50)`} 
          className="opacity-90"
        />
      ))}
      <circle cx="50" cy="50" r="12" fill="#701a1f" stroke="#e3c98d" strokeWidth="2" />
      <circle cx="50" cy="50" r="4" fill="#e3c98d" />
    </g>
  </svg>
);

const PeacockFeather = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 300" className={className} style={style}>
    <path d="M50,35 C50,100 48,180 50,300" stroke="url(#quillGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />
    <g strokeWidth="0.5" fill="none">
        {Array.from({ length: 50 }).map((_, i) => {
            const y = 60 + i * 4.5;
            const spread = 35 + Math.sin(i * 0.1) * 12; 
            const droop = i * 0.6;
            const color = i < 15 ? '#10b981' : '#15803d'; 
            
            return (
                <React.Fragment key={i}>
                   <path d={`M50,${y} C38,${y - 5} 20,${y - 10 + droop} ${50 - spread},${y - 20 + droop}`} stroke={color} opacity={0.5} />
                   <path d={`M50,${y} C62,${y - 5} 80,${y - 10 + droop} ${50 + spread},${y - 20 + droop}`} stroke={color} opacity={0.5} />
                </React.Fragment>
            );
        })}
    </g>
    <g transform="translate(50, 55)">
        <path d="M0,-32 C22,-32 38,-8 20,28 C0,42 -20,28 -38,-8 C-38,-32 -22,-32 0,-32" fill="url(#eyeGold)" opacity="0.95" />
        <path d="M0,-24 C16,-24 26,-5 14,18 C0,26 -14,18 -26,-5 C-26,-24 -16,-24 0,-24" fill="url(#eyeTurquoise)" />
        <ellipse cx="0" cy="-5" rx="11" ry="14" fill="url(#eyeDeep)" />
        <ellipse cx="-4" cy="-10" rx="2" ry="4" fill="white" fillOpacity="0.6" transform="rotate(-15)" />
    </g>
  </svg>
);

// --- Constants ---
const DEFAULT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Radha_Krishna_by_Raja_Ravi_Varma.jpg/480px-Radha_Krishna_by_Raja_Ravi_Varma.jpg";
const DEFAULT_WELCOME = "Our hearts are overflowing with joy as we invite you to the beginning of our journey. Your presence makes our story complete. Welcome to our festivities!";

// --- Main Component ---

interface WelcomeScreenProps {
  onLoginSuccess: (type: 'guest' | 'couple' | 'admin', name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginSuccess }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const feathersRef = useRef<HTMLDivElement>(null);
  
  // Parallax Refs
  const bgBackRef = useRef<HTMLDivElement>(null); 
  const bgMidRef = useRef<HTMLDivElement>(null);  
  const bgFrontRef = useRef<HTMLDivElement>(null); 

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [config, setConfig] = useState({ coupleName: "Sneha & Aman", date: "2025-11-26" });
  const [welcomeMsg, setWelcomeMsg] = useState(DEFAULT_WELCOME);
  const [muted, setMuted] = useState(isAudioMuted());
  
  const [coupleImage, setCoupleImage] = useState<string>(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('wedding_couple_image') || DEFAULT_IMAGE;
      }
      return DEFAULT_IMAGE;
  });

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  const [showUserLogin, setShowUserLogin] = useState(false);
  const [loginType, setLoginType] = useState<'guest' | 'couple'>('guest');
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
      const savedConfig = localStorage.getItem('wedding_global_config');
      if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
      }
      const msg = localStorage.getItem('wedding_welcome_msg');
      if (msg) setWelcomeMsg(msg);
  }, []);

  useEffect(() => {
    setMounted(true);
    try {
      playStrumSound();
    } catch (e) {
      // Ignore
    }

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
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    
    const handleFirstInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
      }
    };
    window.addEventListener('click', handleFirstInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstInteraction, { once: true });

    return () => {
      clearInterval(timer);
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, [hasInteracted, config.date]);

  const toggleMute = () => {
      const newState = !muted;
      setMuted(newState);
      localStorage.setItem('wedding_audio_muted', String(newState));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const maxScroll = scrollHeight - clientHeight;
      
      if (feathersRef.current) {
        const progress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
        feathersRef.current.style.setProperty('--scroll-p', progress.toFixed(3));
      }

      requestAnimationFrame(() => {
         if (bgBackRef.current) bgBackRef.current.style.transform = `translate3d(0, ${-scrollTop * 0.05}px, 0)`;
         if (bgMidRef.current) bgMidRef.current.style.transform = `translate3d(0, ${-scrollTop * 0.15}px, 0)`;
         if (bgFrontRef.current) bgFrontRef.current.style.transform = `translate3d(0, ${-scrollTop * 0.25}px, 0)`;
      });
    };

    const el = scrollRef.current;
    handleScroll(); 
    el?.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    return () => {
        el?.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const featherConfig = [
    { rotate: -45, y: 30, scale: 0.85 },
    { rotate: -30, y: 15, scale: 0.95 },
    { rotate: -15, y: 5, scale: 1.0 },
    { rotate: 0, y: 0, scale: 1.1 }, 
    { rotate: 15, y: 5, scale: 1.0 },
    { rotate: 30, y: 15, scale: 0.95 },
    { rotate: 45, y: 30, scale: 0.85 },
  ];
  
  const handleAdminClick = () => {
      playBellSound();
      setAdminPin("");
      setShowAdminLogin(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      playBellSound();
      if (adminPin === "2025") {
          setShowAdminLogin(false);
          localStorage.setItem('wedding_current_user_type', 'admin');
          onLoginSuccess('admin', 'Admin');
      } else {
          alert("Incorrect PIN. Try 2025.");
      }
  };

  const handleUserLoginOpen = (type: 'guest' | 'couple') => {
    playBellSound();
    setLoginType(type);
    const storedName = localStorage.getItem(`wedding_${type}_name`);
    const storedPhone = localStorage.getItem(`wedding_${type}_phone`);
    setUserName(storedName || "");
    setUserPhone(storedPhone || "");
    setShowUserLogin(true);
  };

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    playBellSound();
    
    if (!userName.trim() || !userPhone.trim()) {
      alert("Please enter both name and phone number.");
      return;
    }

    if (loginType === 'guest') {
        if (userName.trim().length < 3) {
             alert("Full Name is required (minimum 3 characters).");
             return;
        }
        if (!/^\d{10}$/.test(userPhone.trim())) {
             alert("Please enter a valid 10-digit phone number.");
             return;
        }
    } else if (loginType === 'couple') {
        if (!/^\d{10}$/.test(userPhone.trim())) {
             alert("Please enter a valid 10-digit phone number.");
             return;
        }
        const lowerName = userName.trim().toLowerCase();
        if (!lowerName.includes('aman') && !lowerName.includes('sneha')) {
            alert("Access Denied: Couple login is restricted to Aman or Sneha.");
            return;
        }
    }

    localStorage.setItem(`wedding_${loginType}_name`, userName);
    localStorage.setItem(`wedding_${loginType}_phone`, userPhone);
    localStorage.setItem('wedding_current_user_type', loginType);
    
    setShowUserLogin(false);
    onLoginSuccess(loginType, userName);
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#2d0a0d]">
      <style>{`
        @keyframes sway {
          0%, 100% { transform: rotate(-1deg); }
          50% { transform: rotate(1deg); }
        }
        .feather-sway {
          animation: sway 4s ease-in-out infinite;
          will-change: transform;
        }
        @keyframes flicker {
           0%, 100% { opacity: 1; transform: scale(1); }
           25% { opacity: 0.8; transform: scale(0.95); }
           50% { opacity: 0.95; transform: scale(1.05); }
           75% { opacity: 0.85; transform: scale(0.98); }
        }
        .animate-flicker {
           animation: flicker 2.5s infinite linear;
        }
        @keyframes petal-fall {
           0% { transform: translateY(-5vh) translateX(0) rotate(0deg) scale(var(--scale)); opacity: 0; }
           10% { opacity: 1; }
           90% { opacity: 1; }
           100% { transform: translateY(105vh) translateX(20px) rotate(360deg) scale(var(--scale)); opacity: 0; }
        }
        .animate-petal-fall {
           animation-name: petal-fall;
           animation-timing-function: linear;
           animation-iteration-count: infinite;
           will-change: transform, opacity;
        }
        @keyframes bloom-enter {
           0% { opacity: 0; transform: scale(0.4); filter: brightness(3) blur(4px); }
           50% { opacity: 1; transform: scale(1.05); filter: brightness(1.2) blur(0px); }
           100% { opacity: 1; transform: scale(1); filter: brightness(1); }
        }
        .animate-bloom {
           animation: bloom-enter 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
           will-change: transform, opacity, filter;
        }
      `}</style>
      
      <svg width="0" height="0" className="absolute pointer-events-none">
        <defs>
            <linearGradient id="quillGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.9"/>
                <stop offset="100%" stopColor="#fef3c7" stopOpacity="0.3"/>
            </linearGradient>
            <radialGradient id="eyeDeep" cx="50%" cy="40%" r="50%">
                <stop offset="0%" stopColor="#172554" />
                <stop offset="100%" stopColor="#020617" />
            </radialGradient>
            <radialGradient id="eyeTurquoise" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#2dd4bf" />
                <stop offset="100%" stopColor="#0f766e" />
            </radialGradient>
            <radialGradient id="eyeGold" cx="50%" cy="50%" r="50%">
                <stop offset="40%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#b45309" />
            </radialGradient>
        </defs>
      </svg>

      {/* --- Parallax Background Layers --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
         <div ref={bgBackRef} className="absolute w-full h-[120%] -top-[10%] left-0 will-change-transform">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#4a0e11_0%,_#2d0a0d_100%)] opacity-100"></div>
             <div className="absolute inset-0 opacity-[0.05] bg-repeat" 
                  style={{ 
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                  }}>
             </div>
         </div>
         <div ref={bgMidRef} className="absolute w-full h-[120%] -top-[10%] left-0 will-change-transform">
            <GoldDust />
         </div>
         <div ref={bgFrontRef} className="absolute w-full h-[120%] -top-[10%] left-0 will-change-transform">
             <FallingPetals />
         </div>
      </div>

      <button 
          onClick={toggleMute} 
          className="absolute top-4 right-4 z-50 text-gold-300 p-2 bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/40 transition-all animate-fade-in delay-1000"
      >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* --- Scrollable Content Area --- */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth overscroll-contain"
      >
        <header className="flex-shrink-0 pt-12 pb-4 px-4 text-center relative animate-fade-in-up duration-1000">
           <h1 className="font-cursive text-[3.5rem] sm:text-[4.2rem] leading-none text-gold-100 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] filter animate-fade-in-up delay-100">
             {config.coupleName}
           </h1>
           <p className="text-gold-300/80 font-serif text-sm tracking-[0.3em] uppercase mt-2 shadow-black drop-shadow-sm animate-slide-in-right delay-300">
             The Engagement
           </p>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 pb-32 z-20">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-6 flex-shrink-0 group perspective-1000 opacity-0 animate-bloom" style={{ animationDelay: '200ms' }}>
             <div className="absolute inset-0 bg-gold-400/20 blur-2xl rounded-full transform group-hover:scale-110 transition-transform duration-700"></div>
             
             <div className="absolute -inset-8 pointer-events-none animate-zoom-in delay-700 fill-mode-backwards">
                <div className="w-full h-full animate-spin-slow">
                  <svg viewBox="0 0 200 200" className="w-full h-full fill-gold-300 opacity-40">
                    {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                        <path key={deg} d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform={`rotate(${deg} 100 100)`} />
                    ))}
                  </svg>
                </div>
             </div>

             {/* Couple Image */}
             <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-tr from-gold-300 via-gold-100 to-gold-400 shadow-2xl z-10">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#4a0e11] relative">
                    <img src={coupleImage} alt="Couple" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4a0e11]/60 via-transparent to-transparent"></div>
                </div>
             </div>
             
             {/* Floating Elements */}
             <div className="absolute -right-4 bottom-4 animate-float-slow z-20"><DiyaIcon className="w-12 h-12 drop-shadow-lg" /></div>
             <div className="absolute -left-4 top-4 animate-float-slow z-20" style={{ animationDelay: '1s' }}><RingsIcon className="w-12 h-12 text-gold-200 drop-shadow-lg" /></div>
          </div>

          {/* Text Content */}
          <div className="text-center max-w-md mx-auto space-y-6 relative z-10">
              <p className="font-serif text-gold-100 text-lg leading-relaxed drop-shadow-md animate-fade-in-up delay-500">
                  {welcomeMsg}
              </p>
              
              {/* Countdown */}
              <div className="flex justify-center gap-4 py-4 animate-fade-in-up delay-700">
                 {Object.entries(timeLeft).map(([unit, val], i) => (
                     <div key={unit} className="flex flex-col items-center">
                         <span className="text-2xl font-heading text-gold-200">{val}</span>
                         <span className="text-[10px] uppercase tracking-widest text-gold-400/70">{unit}</span>
                     </div>
                 ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3 items-center w-full max-w-xs mx-auto animate-fade-in-up delay-1000">
                  <button 
                    onClick={() => handleUserLoginOpen('guest')}
                    className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-[#4a0e11] py-3.5 rounded-full font-bold tracking-wide shadow-[0_0_20px_rgba(250,204,21,0.3)] hover:shadow-[0_0_30px_rgba(250,204,21,0.5)] hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                      <Sparkles size={18} /> Enter as Guest
                  </button>
                  
                  <button 
                    onClick={() => handleUserLoginOpen('couple')}
                    className="text-gold-300 text-xs uppercase tracking-widest hover:text-gold-100 transition-colors py-2 flex items-center gap-1"
                  >
                      <Lock size={12} /> Couple Login
                  </button>
              </div>
          </div>
        </main>

        {/* Decorative Bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-0 flex justify-between items-end opacity-40">
            <PeacockFeather className="w-24 h-64 -ml-4 -mb-4 transform -rotate-12" />
            <PeacockFeather className="w-24 h-64 -mr-4 -mb-4 transform rotate-12 scale-x-[-1]" />
        </div>

        {/* Admin Trigger */}
        <button 
            onClick={handleAdminClick} 
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/5 hover:text-white/20 text-[10px] p-2"
        >
            Admin
        </button>

        {/* --- Modals --- */}
        
        {/* Admin Login Modal */}
        {showAdminLogin && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#2d0a0d] border border-gold-500/30 p-6 rounded-2xl w-full max-w-xs text-center shadow-2xl animate-zoom-in">
                    <h3 className="text-gold-200 font-heading text-xl mb-4">Admin Access</h3>
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                        <input 
                            type="password" 
                            value={adminPin} 
                            onChange={e => setAdminPin(e.target.value)}
                            className="w-full bg-black/30 border border-gold-500/20 rounded-lg px-4 py-2 text-center text-gold-100 tracking-[0.5em] focus:outline-none focus:border-gold-400"
                            placeholder="PIN"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-2 rounded-lg border border-gold-500/20 text-gold-400 hover:bg-white/5">Cancel</button>
                            <button type="submit" className="flex-1 py-2 rounded-lg bg-gold-600 text-[#2d0a0d] font-bold hover:bg-gold-500">Unlock</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* User Login Modal */}
        {showUserLogin && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                <div className="bg-[#fffbf5] text-[#4a0e11] p-8 rounded-2xl w-full max-w-sm shadow-2xl relative animate-slide-up border-4 border-[#4a0e11]">
                    <button onClick={() => setShowUserLogin(false)} className="absolute top-2 right-2 text-stone-400 hover:text-[#4a0e11]"><X size={20} /></button>
                    
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3 text-[#4a0e11]">
                             {loginType === 'couple' ? <GaneshaIcon className="w-10 h-10" /> : <User size={32} />}
                        </div>
                        <h3 className="font-heading text-2xl">{loginType === 'couple' ? 'Couple Login' : 'Guest Entry'}</h3>
                        <p className="text-xs text-stone-500 font-serif italic mt-1">Please provide your details</p>
                    </div>

                    <form onSubmit={handleUserLoginSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Full Name</label>
                            <input 
                                type="text" 
                                value={userName} 
                                onChange={e => setUserName(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#4a0e11] focus:ring-1 focus:ring-[#4a0e11]"
                                placeholder="e.g. Rajesh Kumar"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-1">Phone Number</label>
                            <input 
                                type="tel" 
                                value={userPhone} 
                                onChange={e => setUserPhone(e.target.value)}
                                className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 focus:outline-none focus:border-[#4a0e11] focus:ring-1 focus:ring-[#4a0e11]"
                                placeholder="10-digit mobile number"
                            />
                        </div>
                        <button type="submit" className="w-full bg-[#4a0e11] text-gold-100 py-3 rounded-lg font-bold shadow-lg hover:bg-[#691419] transition-colors active:scale-95 flex items-center justify-center gap-2 mt-2">
                            <span>Continue</span> <ChevronRight size={16} />
                        </button>
                    </form>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default WelcomeScreen;