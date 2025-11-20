import React, { useEffect, useRef, useState } from 'react';
import { User, Sparkles, Lock, Image as ImageIcon, X, Save, Check, LogIn, Volume2, VolumeX } from 'lucide-react';

// --- Audio Utilities ---

// Global mute state management
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

  // Manjira / Small Bell sound: High pitch sine with clean decay
  osc.type = 'sine';
  osc.frequency.setValueAtTime(2800, t);
  
  // Add a subtle overtone for "brass" feel
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.setValueAtTime(5600, t); // 2nd harmonic

  // Envelope
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.15, t + 0.01); // Attack
  gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Long ringing decay

  gain2.gain.setValueAtTime(0, t);
  gain2.gain.linearRampToValueAtTime(0.05, t + 0.01);
  gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.5); // Shorter decay for harmonic

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
  
  // Pentatonic Scale / Raag Bhupali-ish notes (E Major Pentatonic for brightness)
  // E4, F#4, G#4, B4, C#5, E5
  const notes = [329.63, 369.99, 415.30, 493.88, 554.37, 659.25];
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Triangle wave sounds more like a plucked string (Sitar/Santoor)
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);
    
    // Staggered entrance for strum effect
    const start = t + (i * 0.06);
    
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.08, start + 0.02); // Soft attack
    gain.gain.exponentialRampToValueAtTime(0.001, start + 3.0); // Long sustain

    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + 3.5);
  });
};

// --- Components for Visual Effects ---

const GoldDust = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    // Particles: x, y, velocity x, velocity y, size, alpha, oscillation phase
    let particles: Array<{x: number, y: number, vx: number, vy: number, size: number, alpha: number, phase: number}> = [];

    const resize = () => {
      // Size to parent to support parallax container being larger than viewport
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
      // Density based on area
      const count = Math.floor((canvas.width * canvas.height) / 12000); 
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2, // Very slow horizontal drift
          vy: -Math.random() * 0.4 - 0.05, // Slow upward float
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
        p.x += p.vx + Math.sin(p.phase) * 0.15; // Gentle sine wave wiggle
        p.phase += 0.015;

        // Wrap around logic
        if (p.y < -5) p.y = canvas.height + 5;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        // Gold/Warm White Color
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

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-70 w-full h-full" />;
};

const PetalIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 30 30" className={className} style={style}>
     <path d="M15,0 C5,5 0,15 5,25 C10,30 20,30 25,25 C30,15 25,5 15,0 Z" fill="url(#petal-gradient)" />
     <defs>
        <linearGradient id="petal-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
           <stop offset="0%" stopColor="#be123c" /> {/* Rose 700 */}
           <stop offset="50%" stopColor="#9f1239" />
           <stop offset="100%" stopColor="#881337" /> {/* Rose 900 */}
        </linearGradient>
     </defs>
  </svg>
);

const FallingPetals = () => {
  // Create a fixed set of petals with random delays
  const petals = Array.from({ length: 12 }).map((_, i) => {
     const r1 = (i * 37 + 13) % 100; // Pseudo-random position
     const r2 = (i * 23 + 7) % 100;  // Pseudo-random delay
     const r3 = (i * 41 + 19) % 100; // Pseudo-random duration
     return {
        id: i,
        left: `${r1}%`,
        delay: `${r2 * 0.2}s`, // Spread over 20s
        duration: `${15 + (r3 * 0.1)}s`, // 15-25s duration
        scale: 0.6 + (r2 * 0.004)
     };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
       {petals.map(p => (
          <div 
            key={p.id}
            className="absolute -top-8 animate-petal-fall opacity-0"
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

// --- Custom Icons for the Buttons ---

const DiyaIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Flame with realistic flicker */}
    <path d="M12 2C12 2 10 6 10 9C10 11 14 11 14 9C14 6 12 2 12 2Z" fill="#fbbf24" className="animate-flicker origin-bottom" />
    {/* Lamp Base */}
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
    <g className="origin-center animate-spin-slow">
      {/* Petals */}
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
      {/* Inner circle */}
      <circle cx="50" cy="50" r="12" fill="#701a1f" stroke="#e3c98d" strokeWidth="2" />
      <circle cx="50" cy="50" r="4" fill="#e3c98d" />
    </g>
  </svg>
);

// --- Peacock Feather Component ---
const PeacockFeather = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 100 300" className={className} style={style}>
    {/* Stem - Elegant S-curve */}
    <path d="M50,35 C50,100 48,180 50,300" stroke="url(#quillGrad)" strokeWidth="1.5" fill="none" opacity="0.8" />

    {/* Barbs - Dense and flowing */}
    <g strokeWidth="0.5" fill="none">
        {Array.from({ length: 50 }).map((_, i) => {
            const y = 60 + i * 4.5;
            // Calculating control points for a natural curve
            const spread = 35 + Math.sin(i * 0.1) * 12; 
            const droop = i * 0.6;
            const color = i < 15 ? '#10b981' : '#15803d'; // Gradient from bright to dark green
            
            return (
                <React.Fragment key={i}>
                   <path d={`M50,${y} C38,${y - 5} 20,${y - 10 + droop} ${50 - spread},${y - 20 + droop}`} stroke={color} opacity={0.5} />
                   <path d={`M50,${y} C62,${y - 5} 80,${y - 10 + droop} ${50 + spread},${y - 20 + droop}`} stroke={color} opacity={0.5} />
                </React.Fragment>
            );
        })}
    </g>
    
    {/* The Eye - Intricate and bold */}
    <g transform="translate(50, 55)">
        {/* Outer Gold Halo */}
        <path d="M0,-32 C22,-32 38,-8 20,28 C0,42 -20,28 -38,-8 C-38,-32 -22,-32 0,-32" fill="url(#eyeGold)" opacity="0.95" />
        
        {/* Inner Turquoise Heart/Drop */}
        <path d="M0,-24 C16,-24 26,-5 14,18 C0,26 -14,18 -26,-5 C-26,-24 -16,-24 0,-24" fill="url(#eyeTurquoise)" />
        
        {/* Deep Blue Core */}
        <ellipse cx="0" cy="-5" rx="11" ry="14" fill="url(#eyeDeep)" />
        
        {/* Highlight */}
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
  const bgBackRef = useRef<HTMLDivElement>(null); // Gradient & Texture
  const bgMidRef = useRef<HTMLDivElement>(null);  // Gold Dust
  const bgFrontRef = useRef<HTMLDivElement>(null); // Petals

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
  const [hasInteracted, setHasInteracted] = useState(false);
  const [config, setConfig] = useState({ coupleName: "Sneha & Aman", date: "2025-11-26" });
  const [welcomeMsg, setWelcomeMsg] = useState(DEFAULT_WELCOME);
  const [muted, setMuted] = useState(isAudioMuted());
  
  // State for Couple Image (Persisted)
  const [coupleImage, setCoupleImage] = useState<string>(() => {
      if (typeof window !== 'undefined') {
          return localStorage.getItem('wedding_couple_image') || DEFAULT_IMAGE;
      }
      return DEFAULT_IMAGE;
  });

  // Admin State
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState("");

  // User Login State
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [loginType, setLoginType] = useState<'guest' | 'couple'>('guest');
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
      const savedConfig = localStorage.getItem('wedding_global_config');
      if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
      }
      // Load dynamic welcome message
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

    // Engagement Date
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
      
      // Feather animation logic
      if (feathersRef.current) {
        const progress = maxScroll > 0 ? Math.min(Math.max(scrollTop / maxScroll, 0), 1) : 0;
        feathersRef.current.style.setProperty('--scroll-p', progress.toFixed(3));
      }

      // Parallax Logic: Move background layers at different speeds relative to scroll
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
    { rotate: 0, y: 0, scale: 1.1 }, // Center
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
        }
        @keyframes bloom-enter {
           0% { opacity: 0; transform: scale(0.4); filter: brightness(3) blur(4px); }
           50% { opacity: 1; transform: scale(1.05); filter: brightness(1.2) blur(0px); }
           100% { opacity: 1; transform: scale(1); filter: brightness(1); }
        }
        .animate-bloom {
           animation: bloom-enter 1.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
      
      {/* Feather Gradients */}
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

      {/* Audio Toggle */}
      <button 
          onClick={toggleMute} 
          className="absolute top-4 right-4 z-50 text-gold-300 p-2 bg-black/20 rounded-full backdrop-blur-sm hover:bg-black/40 transition-all"
      >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* --- Scrollable Content Area --- */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth"
      >
        <header className="flex-shrink-0 pt-12 pb-4 px-4 text-center relative animate-in fade-in slide-in-from-top-4 duration-1000">
           <h1 className="font-cursive text-[3.5rem] sm:text-[4.2rem] leading-none text-gold-100 drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] filter">
             {config.coupleName}
           </h1>
           <p className="text-gold-300/80 font-serif text-sm tracking-[0.3em] uppercase mt-2 shadow-black drop-shadow-sm">
             The Engagement
           </p>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 pb-32 z-20">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-6 flex-shrink-0 group perspective-1000 opacity-0 animate-bloom" style={{ animationDelay: '200ms' }}>
             <div className="absolute inset-0 bg-gold-400/20 blur-2xl rounded-full transform group-hover:scale-110 transition-transform duration-700"></div>
             
             <div className="absolute -inset-8 pointer-events-none animate-in fade-in zoom-in duration-1000 delay-700 fill-mode-backwards">
                <div className="w-full h-full animate-spin-slow [animation-duration:20s]">
                  <svg viewBox="0 0 200 200" className="w-full h-full fill-gold-300 opacity-40">
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(0 100 100)" />
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(45 100 100)" />
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(90 100 100)" />
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(135 100 100)" />
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(180 100 100)" />
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(225 100 100)" />
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(270 100 100)" />
                    <path d="M100,10 C110,30 130,40 100,50 C70,40 90,30 100,10" transform="rotate(315 100 100)" />
                  </svg>
                </div>
             </div>

             <div className="absolute inset-0 rounded-full border-[4px] border-[#e3c98d] shadow-[0_0_15px_rgba(227,201,141,0.4),inset_0_0_10px_rgba(0,0,0,0.5)] z-20 overflow-hidden bg-[#2d0a0d] transition-transform duration-500 ease-out group-hover:rotate-y-12 group-hover:rotate-x-12">
                <div className="absolute inset-[3px] rounded-full border-[1px] border-dashed border-gold-200/50 relative z-10"></div>
                <div className="w-full h-full relative">
                    <img 
                      src={coupleImage}
                      alt="Royal Couple" 
                      className="w-full h-full object-cover object-top opacity-90 hover:scale-110 transition-transform duration-1000 ease-out sepia-[0.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#4a0e11]/80 via-transparent to-transparent z-0"></div>
                </div>
             </div>
             <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 z-30 drop-shadow-2xl">
                 <div className="w-16 h-16 transition-transform hover:scale-110 duration-300">
                    <SpinningFlower className="w-full h-full" />
                 </div>
             </div>
          </div>
          
          <div className="relative z-20 mt-2 mb-2 text-center animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-300">
              <p className="text-gold-300 font-serif text-xl sm:text-2xl tracking-wider opacity-90 drop-shadow-md">स्नेहा और अमन</p>
          </div>

          <div className="w-full max-w-sm relative mt-2 animate-in fade-in duration-1000 delay-500 slide-in-from-bottom-4">
             <div className="absolute -inset-1 bg-gold-400/20 rounded-t-[50%] blur-md animate-pulse-slow pointer-events-none"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-[#4a0e11] to-[#2d0a0d] rounded-t-[50%] border-t-2 border-x border-gold-400/40 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"></div>
             <div className="absolute inset-2 bottom-0 border-t border-x border-gold-300/20 rounded-t-[45%] pointer-events-none"></div>
             <div className="relative z-10 pt-12 pb-8 px-6 flex flex-col items-center text-center">
                <h2 className="text-2xl font-serif text-gold-100 mb-1 drop-shadow-md">
                  Welcome to <br/> Our Celebration
                </h2>
                <div className="relative w-full mb-8 mt-2 group cursor-default">
                    <div className="absolute -inset-2 bg-gold-400/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <p className="text-gold-200/90 italic font-serif text-sm leading-relaxed px-4 py-2 border-y border-gold-500/10 relative z-10">
                        "{welcomeMsg}"
                    </p>
                </div>

                <div className="w-full space-y-4">
                  <button 
                    onClick={() => handleUserLoginOpen('guest')}
                    className="group relative w-full h-14 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(166,24,33,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-[#5e181f] via-[#751e26] to-[#3d0a0e] border border-[#8c2b36]"></div>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                     <div className="relative flex items-center justify-center px-6 h-full">
                        <div className="absolute left-6 flex items-center justify-center">
                           <User size={18} className="text-gold-200" />
                        </div>
                        <span className="text-gold-100 font-serif text-lg tracking-wide drop-shadow-sm group-hover:text-white transition-colors">Family & Friends</span>
                        <div className="absolute right-5 flex items-center justify-center">
                           <DiyaIcon className="w-6 h-6 text-gold-300 group-hover:text-gold-100 transition-colors" />
                        </div>
                     </div>
                  </button>
                  <button 
                    onClick={() => handleUserLoginOpen('couple')}
                    className="group relative w-full h-14 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,140,140,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-[#d48c8c] via-[#e09e9e] to-[#b56b6b] border border-[#e8b5b5]"></div>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                     <div className="relative flex items-center justify-center px-6 h-full">
                        <span className="text-[#2d0a0d] font-serif text-lg tracking-wide font-medium drop-shadow-sm">Couple Login</span>
                        <div className="absolute right-5 flex items-center justify-center">
                           <RingsIcon className="w-6 h-6 text-[#5e181f] group-hover:text-[#2d0a0d] transition-colors" />
                        </div>
                     </div>
                  </button>
                  <button 
                    onClick={handleAdminClick}
                    className="group relative w-full h-14 rounded-full overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,157,95,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
                  >
                     <div className="absolute inset-0 bg-gradient-to-r from-[#c59d5f] via-[#d4af37] to-[#9c7836] border border-[#e6cf9c]"></div>
                     <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1s_infinite]"></div>
                     <div className="relative flex items-center justify-center px-4 h-full">
                        <span className="text-[#2d0a0d] font-serif text-lg tracking-wide font-medium drop-shadow-sm">Organisers/Admin Login</span>
                        <div className="absolute right-5 flex items-center justify-center">
                           <GaneshaIcon className="w-7 h-7 text-[#4a0e11] group-hover:scale-110 transition-transform" />
                        </div>
                     </div>
                  </button>
                </div>
                
                 <div className="mt-10 mb-4 relative z-20 flex flex-col items-center w-full">
                     <div className="flex items-center justify-center gap-6 text-gold-200 font-heading relative">
                         <div className="flex flex-col items-center group cursor-default">
                             <span className="text-3xl font-bold text-gold-100 drop-shadow-lg transition-transform group-hover:-translate-y-1">{timeLeft.days}</span>
                             <span className="text-[9px] uppercase opacity-60 font-serif tracking-widest mt-1">Days</span>
                         </div>
                         <span className="text-gold-500/60 mb-4 text-xl animate-pulse">:</span>
                         <div className="flex flex-col items-center group cursor-default">
                             <span className="text-3xl font-bold text-gold-100 drop-shadow-lg transition-transform group-hover:-translate-y-1">{timeLeft.hours}</span>
                             <span className="text-[9px] uppercase opacity-60 font-serif tracking-widest mt-1">Hours</span>
                         </div>
                         <span className="text-gold-500/60 mb-4 text-xl animate-pulse">:</span>
                         <div className="flex flex-col items-center group cursor-default">
                             <span className="text-3xl font-bold text-gold-100 drop-shadow-lg transition-transform group-hover:-translate-y-1">{timeLeft.minutes}</span>
                             <span className="text-[9px] uppercase opacity-60 font-serif tracking-widest mt-1">Mins</span>
                         </div>
                     </div>
                     <div className="mt-4 flex items-center gap-3 w-full justify-center opacity-40">
                         <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-gold-400"></div>
                         <div className="w-1 h-1 rounded-full bg-gold-300"></div>
                         <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-gold-400"></div>
                     </div>
                 </div>
             </div>
          </div>

          <div className="mt-8 mb-2 px-4 relative z-20 w-full max-w-xs animate-in fade-in duration-1000 delay-500 text-center">
             <p className="font-cursive text-2xl sm:text-3xl text-gold-300 leading-relaxed drop-shadow-md opacity-90">
               "Two souls with but a single thought, <br/> two hearts that beat as one."
             </p>
          </div>
        </main>

        <footer className="relative w-full z-20 pointer-events-none">
           <div 
              ref={feathersRef}
              className="flex justify-center items-end -mb-8 sm:-mb-12 space-x-[-1.8rem] sm:space-x-[-2.2rem] relative z-0 will-change-transform perspective-1000"
              style={{ '--scroll-p': 0 } as React.CSSProperties}
           >
              {featherConfig.map((f, i) => (
                <div 
                  key={i}
                  className="transition-transform duration-75 ease-out origin-bottom-center"
                  style={{
                    transform: `
                      rotate(calc(${f.rotate}deg + (var(--scroll-p) * ${(i - 3) * 12}deg))) 
                      translateY(calc(${f.y}px + (var(--scroll-p) * 40px))) 
                      scale(${f.scale})
                    `,
                    zIndex: 10 - Math.abs(i - 3),
                    filter: 'drop-shadow(0 5px 15px rgba(0,0,0,0.6))'
                  }}
                >
                    <div 
                        className={`transform transition-all duration-[1500ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] feather-sway origin-bottom ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
                        style={{ 
                            transitionDelay: `${i * 80}ms`,
                            animationDelay: `${i * 0.3}s` // Stagger the sway too
                        }}
                    >
                        <PeacockFeather className="w-32 h-64 sm:w-40 sm:h-80" />
                    </div>
                </div>
              ))}
           </div>

           <div className="relative z-30 bg-[#1a0507] border-t border-gold-600/30 pt-4 pb-6 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]">
              <div className="flex justify-center items-center gap-6 text-gold-500/50 text-[10px] sm:text-xs font-serif tracking-[0.2em] pointer-events-auto">
                  <span className="hover:text-gold-300 transition-colors cursor-pointer flex items-center gap-1">
                     Exclusively for Family & Loved Ones
                  </span>
              </div>
              <div className="flex justify-between items-center px-8 mt-2 opacity-40">
                 <Sparkles size={10} className="text-gold-300 animate-pulse" />
                 <div className="h-[1px] bg-gradient-to-r from-transparent via-gold-600/50 to-transparent flex-1 mx-4"></div>
                 <Sparkles size={10} className="text-gold-300 animate-pulse delay-75" />
              </div>
           </div>
        </footer>
      </div>

      {/* --- Modals --- */}
      
      {showAdminLogin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#2d0a0d] border border-gold-400/30 w-full max-w-xs rounded-xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                <div className="bg-[#4a0e11] px-4 py-3 flex justify-between items-center border-b border-gold-400/20">
                    <h3 className="text-gold-100 font-serif tracking-wide flex items-center gap-2"><Lock size={14}/> Admin Access</h3>
                    <button onClick={() => setShowAdminLogin(false)} className="text-gold-400 hover:text-gold-100"><X size={18}/></button>
                </div>
                <form onSubmit={handleLoginSubmit} className="p-6 flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-gold-400/70 text-xs font-serif uppercase tracking-wider">Enter PIN</label>
                        <input 
                            type="password" 
                            autoFocus
                            maxLength={4}
                            value={adminPin}
                            onChange={(e) => setAdminPin(e.target.value)}
                            className="w-full bg-black/20 border-b border-gold-500/30 text-gold-100 p-2 focus:outline-none focus:border-gold-400 placeholder-gold-500/30 text-center tracking-[0.5em] text-xl font-serif"
                            placeholder="••••"
                        />
                    </div>
                    <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-[#2d0a0d] py-2 rounded font-serif font-bold flex items-center justify-center gap-2 transition-colors mt-2">
                        <LogIn size={16} /> Login
                    </button>
                </form>
            </div>
        </div>
      )}

      {showUserLogin && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-[#2d0a0d] border border-gold-400/30 w-full max-w-xs rounded-xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
                <div className="bg-[#4a0e11] px-4 py-3 flex justify-between items-center border-b border-gold-400/20">
                    <h3 className="text-gold-100 font-serif tracking-wide flex items-center gap-2">
                        {loginType === 'guest' ? <User size={14}/> : <RingsIcon className="w-4 h-4"/>} 
                        {loginType === 'guest' ? 'Guest Entry' : 'Couple Entry'}
                    </h3>
                    <button onClick={() => setShowUserLogin(false)} className="text-gold-400 hover:text-gold-100"><X size={18}/></button>
                </div>
                <form onSubmit={handleUserLoginSubmit} className="p-6 flex flex-col gap-4">
                    <div className="space-y-1">
                        <label className="text-gold-400/70 text-xs font-serif uppercase tracking-wider">Full Name</label>
                        <input 
                            type="text" 
                            autoFocus
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            className="w-full bg-black/20 border-b border-gold-500/30 text-gold-100 p-2 focus:outline-none focus:border-gold-400 placeholder-gold-500/30 font-serif"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-gold-400/70 text-xs font-serif uppercase tracking-wider">Phone Number</label>
                        <input 
                            type="tel" 
                            value={userPhone}
                            onChange={(e) => setUserPhone(e.target.value)}
                            className="w-full bg-black/20 border-b border-gold-500/30 text-gold-100 p-2 focus:outline-none focus:border-gold-400 placeholder-gold-500/30 font-serif"
                            placeholder="Enter phone number"
                            required
                        />
                    </div>
                    <button type="submit" className="bg-gold-500 hover:bg-gold-400 text-[#2d0a0d] py-2 rounded font-serif font-bold flex items-center justify-center gap-2 transition-colors mt-4 relative overflow-hidden group">
                        <span className="absolute inset-0 w-full h-full bg-white/30 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                        <Check size={16} /> Enter Celebration
                    </button>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

export default WelcomeScreen;