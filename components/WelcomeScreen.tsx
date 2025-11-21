
import React, { useEffect, useRef, useState } from 'react';
import { User, Sparkles, Lock, Image as ImageIcon, X, Save, Check, LogIn, Volume2, VolumeX, ChevronRight, Heart, Loader } from 'lucide-react';

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

// --- 3D Tilt Hook ---
const useTilt = (ref: React.RefObject<HTMLDivElement>) => {
  const [transform, setTransform] = useState("");
  
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const { left, top, width, height } = el.getBoundingClientRect();
        
        const x = (clientX - left) / width;
        const y = (clientY - top) / height;
        
        const tiltX = (0.5 - y) * 20; // Rotate X axis based on Y position
        const tiltY = (x - 0.5) * 20; // Rotate Y axis based on X position

        setTransform(`perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.02)`);
    };

    const handleLeave = () => {
        setTransform(`perspective(1000px) rotateX(0deg) rotateY(0deg) scale(1)`);
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
        el.removeEventListener('mousemove', handleMove);
        el.removeEventListener('mouseleave', handleLeave);
    }
  }, []);

  return transform;
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
    let particles: Array<{
        x: number, y: number, vx: number, vy: number, 
        size: number, alpha: number, phase: number, depth: number 
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
      const count = Math.floor((canvas.width * canvas.height) / 10000); 
      for (let i = 0; i < count; i++) {
        // Depth: 0 is far (slow, small, blur), 1 is near (fast, big, clear)
        const depth = Math.random(); 
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2 * (depth + 0.5), 
          vy: (-Math.random() * 0.3 - 0.1) * (depth + 0.5), 
          size: (Math.random() * 2 + 0.5) * (depth + 0.5),
          alpha: Math.random() * 0.5 + 0.1,
          phase: Math.random() * Math.PI * 2,
          depth
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.phase) * 0.1;
        p.phase += 0.01;

        if (p.y < -5) p.y = canvas.height + 5;
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        // Depth of field effect: blur distant particles
        if (p.depth < 0.3) {
             ctx.fillStyle = `rgba(252, 238, 181, ${p.alpha * 0.5})`;
             ctx.shadowBlur = 4;
             ctx.shadowColor = '#fceeb5';
        } else {
             ctx.fillStyle = `rgba(252, 238, 181, ${p.alpha})`;
             ctx.shadowBlur = 0;
        }
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

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80 w-full h-full will-change-transform" />;
};

const GodRays = () => (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[60%] bg-gradient-to-b from-gold-200/10 to-transparent rotate-12 blur-3xl transform origin-top-left animate-breathe"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[120%] h-[60%] bg-gradient-to-b from-gold-400/5 to-transparent -rotate-12 blur-3xl transform origin-top-right animate-breathe delay-700"></div>
    </div>
);

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
  const petals = Array.from({ length: 16 }).map((_, i) => {
     const r1 = (i * 37 + 13) % 100; 
     const r2 = (i * 23 + 7) % 100;  
     const r3 = (i * 41 + 19) % 100; 
     return {
        id: i,
        left: `${r1}%`,
        delay: `${r2 * 0.2}s`, 
        duration: `${15 + (r3 * 0.1)}s`, 
        scale: 0.6 + (r2 * 0.008),
        depth: r3 % 3 // 0: back, 1: mid, 2: front
     };
  });

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
       {petals.map(p => (
          <div 
            key={p.id}
            className={`absolute -top-8 animate-petal-fall opacity-0 will-change-transform ${p.depth === 0 ? 'blur-[2px] opacity-60' : ''} ${p.depth === 2 ? 'blur-[0px] drop-shadow-lg' : ''}`}
            style={{
               left: p.left,
               animationDelay: p.delay,
               animationDuration: p.duration,
               zIndex: p.depth * 10,
               '--scale': p.scale
            } as React.CSSProperties}
          >
            <PetalIcon className="w-5 h-5" />
          </div>
       ))}
    </div>
  );
}

// --- Constants ---
const DEFAULT_IMAGE = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Radha_Krishna_by_Raja_Ravi_Varma.jpg/480px-Radha_Krishna_by_Raja_Ravi_Varma.jpg";
const DEFAULT_WELCOME = "Our hearts are overflowing with joy as we invite you to the beginning of our journey. Your presence makes our story complete. Welcome to our festivities!";

// --- Main Component ---

interface WelcomeScreenProps {
  onLoginSuccess: (type: 'guest' | 'couple' | 'admin', name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginSuccess }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardTransform = useTilt(cardRef);
  
  // Parallax Refs
  const bgBackRef = useRef<HTMLDivElement>(null); 
  const bgMidRef = useRef<HTMLDivElement>(null);  
  const bgFrontRef = useRef<HTMLDivElement>(null); 

  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 });
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
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      // Listen for config updates from Admin
      const checkConfig = () => {
          const savedConfig = localStorage.getItem('wedding_global_config');
          if (savedConfig) {
              setConfig(JSON.parse(savedConfig));
          }
          const msg = localStorage.getItem('wedding_welcome_msg');
          if (msg) setWelcomeMsg(msg);
      };
      checkConfig();
      const interval = setInterval(checkConfig, 2000);
      return () => clearInterval(interval);
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
    return () => clearInterval(timer);
  }, [config.date]);

  const toggleMute = () => {
      const newState = !muted;
      setMuted(newState);
      localStorage.setItem('wedding_audio_muted', String(newState));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      const { scrollTop } = scrollRef.current;
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
  
  const handleAdminClick = () => {
      playBellSound();
      setAdminPin("");
      setErrorMsg("");
      setShowAdminLogin(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg("");
      setIsLoading(true);
      playBellSound();

      // Simulate network delay for security
      setTimeout(() => {
          // Check against Base64 hash of '2025' (MjAyNQ==) for basic obfuscation
          // To keep it simple yet better than plain text, we verify the hash.
          if (btoa(adminPin) === "MjAyNQ==") {
              setShowAdminLogin(false);
              localStorage.setItem('wedding_current_user_type', 'admin');
              onLoginSuccess('admin', 'Admin');
          } else {
              setErrorMsg("Invalid Credentials");
              setAdminPin("");
          }
          setIsLoading(false);
      }, 800);
  };

  const handleUserLoginOpen = (type: 'guest' | 'couple') => {
    playBellSound();
    setLoginType(type);
    const storedName = localStorage.getItem(`wedding_${type}_name`);
    const storedPhone = localStorage.getItem(`wedding_${type}_phone`);
    setUserName(storedName || "");
    setUserPhone(storedPhone || "");
    setErrorMsg("");
    setShowUserLogin(true);
  };

  const validatePhone = (phone: string) => {
      // Strict 10 digit validation
      const re = /^\d{10}$/;
      return re.test(phone.replace(/[- ]/g, ""));
  };

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    playBellSound();
    
    if (!userName.trim() || !userPhone.trim()) {
      setErrorMsg("Please enter both name and phone number.");
      return;
    }

    if (!validatePhone(userPhone)) {
        setErrorMsg("Please enter a valid 10-digit phone number.");
        return;
    }

    setIsLoading(true);

    setTimeout(() => {
        localStorage.setItem(`wedding_${loginType}_name`, userName);
        localStorage.setItem(`wedding_${loginType}_phone`, userPhone);
        localStorage.setItem('wedding_current_user_type', loginType);
        setShowUserLogin(false);
        onLoginSuccess(loginType, userName);
        setIsLoading(false);
    }, 800);
  };

  return (
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#0f0505]">
      <style>{`
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
      
      {/* --- Parallax Background Layers --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-[#1a0507] via-[#2d0a0d] to-[#0f0505]">
         <GodRays />
         <div ref={bgBackRef} className="absolute w-full h-[120%] -top-[10%] left-0 will-change-transform">
             <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#4a0e11_0%,_transparent_70%)] opacity-80"></div>
         </div>
         <div ref={bgMidRef} className="absolute w-full h-[120%] -top-[10%] left-0 will-change-transform">
            <GoldDust />
         </div>
         <div ref={bgFrontRef} className="absolute w-full h-[120%] -top-[10%] left-0 will-change-transform">
             <FallingPetals />
         </div>
         
         {/* Cinematic Fog at Bottom */}
         <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-[#000000] to-transparent opacity-60 z-0"></div>
      </div>

      <button 
          onClick={toggleMute} 
          className="absolute top-6 right-6 z-50 text-gold-300 p-3 bg-black/30 rounded-full backdrop-blur-md hover:bg-black/50 transition-all animate-fade-in delay-1000 border border-white/10 shadow-lg"
      >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Admin Trigger */}
      <button 
          onClick={handleAdminClick} 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-gold-500/30 hover:text-gold-400 transition-all p-2 flex items-center gap-2 group"
      >
          <Lock size={14} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-serif uppercase tracking-widest">Admin</span>
      </button>

      {/* --- Scrollable Content Area --- */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth overscroll-contain"
      >
        <header className="flex-shrink-0 pt-16 pb-6 px-4 text-center relative animate-fade-in-up duration-1000 z-20">
           <h1 className="font-cursive text-[4rem] sm:text-[5rem] leading-none text-transparent bg-clip-text bg-gradient-to-b from-gold-100 via-gold-300 to-gold-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] filter animate-fade-in-up delay-100">
             {config.coupleName}
           </h1>
           <p className="text-gold-200 font-heading text-xs tracking-[0.4em] uppercase mt-4 text-glow animate-slide-in-right delay-300">
             The Royal Engagement
           </p>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 pb-32 z-20 perspective-[1000px]">
          
          {/* 3D Card Container */}
          <div 
            ref={cardRef}
            className="relative w-72 h-72 sm:w-80 sm:h-80 my-8 flex-shrink-0 animate-bloom"
            style={{ transform: cardTransform, transition: 'transform 0.1s ease-out', transformStyle: 'preserve-3d' }}
          >
             {/* Back Glow */}
             <div className="absolute inset-0 bg-rose-900/40 blur-3xl rounded-full transform translate-z-[-50px]"></div>
             
             {/* Decorative Rings */}
             <div className="absolute -inset-10 border border-gold-500/20 rounded-full animate-spin-slow pointer-events-none" style={{ transform: 'translateZ(20px)' }}></div>
             <div className="absolute -inset-4 border border-gold-500/30 rounded-full animate-spin-slow pointer-events-none" style={{ animationDirection: 'reverse', transform: 'translateZ(40px)' }}></div>

             {/* Main Image Container */}
             <div className="relative w-full h-full rounded-full p-1.5 bg-gradient-to-br from-gold-300 via-gold-100 to-gold-500 shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-10">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#2d0a0d] relative group">
                    <img src={coupleImage} alt="Couple" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 will-change-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2d0a0d]/80 via-transparent to-transparent mix-blend-multiply"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                </div>
             </div>
          </div>

          {/* Glass Panel Content */}
          <div className="glass-panel max-w-md mx-auto space-y-8 p-8 rounded-2xl relative z-10 animate-fade-in-up delay-500 transform hover:scale-[1.01] transition-transform duration-500">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
              
              <p className="font-serif text-gold-100 text-lg leading-relaxed text-center opacity-90">
                  {welcomeMsg}
              </p>
              
              {/* Countdown */}
              <div className="flex justify-center gap-6 py-2 border-t border-white/5 border-b border-white/5">
                 {Object.entries(timeLeft).map(([unit, val], i) => (
                     <div key={unit} className="flex flex-col items-center min-w-[60px]">
                         <span className="text-3xl font-heading text-gradient-gold font-bold">{val}</span>
                         <span className="text-[10px] uppercase tracking-widest text-stone-400">{unit}</span>
                     </div>
                 ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 items-center w-full">
                  <button 
                    onClick={() => handleUserLoginOpen('guest')}
                    className="w-full bg-gradient-to-r from-gold-500 to-gold-700 text-[#2d0a0d] py-4 rounded-xl font-heading font-bold tracking-widest shadow-[0_0_25px_rgba(234,179,8,0.3)] hover:shadow-[0_0_35px_rgba(234,179,8,0.5)] hover:brightness-110 transition-all active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                      <Sparkles size={18} /> Enter as Guest
                  </button>
                  
                  <button 
                    onClick={() => handleUserLoginOpen('couple')}
                    className="text-gold-400/60 text-xs uppercase tracking-widest hover:text-gold-200 transition-colors py-2 flex items-center gap-2 hover:gap-3 duration-300"
                  >
                      <Heart size={12} fill="currentColor" /> Couple Login
                  </button>
              </div>
          </div>
        </main>
      </div>
      
      {/* --- Modals --- */}
        
      {/* Admin Login Modal */}
      {showAdminLogin && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="glass-deep p-8 rounded-2xl w-full max-w-xs text-center animate-zoom-in border border-gold-500/20">
                  <h3 className="text-gold-200 font-heading text-xl mb-6">Admin Access</h3>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <input 
                          type="password" 
                          value={adminPin} 
                          onChange={e => setAdminPin(e.target.value)}
                          className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-center text-gold-100 tracking-[0.5em] focus:outline-none focus:border-gold-400 transition-colors ${errorMsg ? 'border-red-500' : 'border-gold-500/30'}`}
                          placeholder="PIN"
                          autoFocus
                      />
                      {errorMsg && <p className="text-red-400 text-xs animate-shake">{errorMsg}</p>}
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-2.5 rounded-lg border border-white/10 text-stone-400 hover:bg-white/5 hover:text-white transition-colors">Cancel</button>
                          <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-lg bg-gold-600 text-[#2d0a0d] font-bold hover:bg-gold-500 transition-colors flex items-center justify-center">
                              {isLoading ? <Loader size={16} className="animate-spin" /> : "Unlock"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* User Login Modal */}
      {showUserLogin && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
              <div className="glass-panel p-8 rounded-2xl w-full max-w-sm relative animate-slide-up border border-white/10 shadow-2xl">
                  <button onClick={() => setShowUserLogin(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                  
                  <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center mx-auto mb-4 text-[#4a0e11] shadow-[0_0_30px_rgba(234,179,8,0.4)]">
                            {loginType === 'couple' ? <Heart size={32} fill="currentColor" /> : <User size={32} />}
                      </div>
                      <h3 className="font-heading text-3xl text-gold-100 mb-2">{loginType === 'couple' ? 'Couple Login' : 'Guest Entry'}</h3>
                      <p className="text-xs text-gold-200/60 font-serif tracking-wider uppercase">Please provide your details</p>
                  </div>

                  <form onSubmit={handleUserLoginSubmit} className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gold-400/80 mb-2 ml-1">Full Name</label>
                          <input 
                              type="text" 
                              value={userName} 
                              onChange={e => setUserName(e.target.value)}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-gold-100 focus:outline-none focus:border-gold-500/50 focus:bg-black/50 transition-all"
                              placeholder="e.g. Rajesh Kumar"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-gold-400/80 mb-2 ml-1">Phone Number</label>
                          <input 
                              type="tel" 
                              value={userPhone} 
                              onChange={e => setUserPhone(e.target.value)}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-gold-100 focus:outline-none focus:border-gold-500/50 focus:bg-black/50 transition-all"
                              placeholder="10-digit mobile number"
                              maxLength={10}
                          />
                      </div>
                      
                      {errorMsg && <p className="text-red-400 text-xs text-center animate-shake">{errorMsg}</p>}

                      <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-rose-700 to-rose-900 text-white py-4 rounded-xl font-bold shadow-lg hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 group border border-rose-500/30">
                          {isLoading ? (
                              <Loader size={20} className="animate-spin" />
                          ) : (
                              <><span>Begin Journey</span> <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
                          )}
                      </button>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default WelcomeScreen;
