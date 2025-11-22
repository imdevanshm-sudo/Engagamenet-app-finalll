
import React, { useEffect, useRef, useState } from 'react';
import { User, Sparkles, Lock, X, Heart, Volume2, VolumeX, ChevronRight, Loader } from 'lucide-react';

// --- Audio Utilities ---
const isAudioMuted = () => localStorage.getItem('wedding_audio_muted') === 'true';

const getAudioContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
  return AudioContext ? new AudioContext() : null;
};

// Soft Chime Effect
const playChimeSound = () => {
  if (isAudioMuted()) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const t = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major Chord
  
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    
    const start = t + (i * 0.1);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.05, start + 0.05); 
    gain.gain.exponentialRampToValueAtTime(0.001, start + 2.0); 

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 2.5);
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
        
        const tiltX = (0.5 - y) * 10; // Subtle tilt
        const tiltY = (x - 0.5) * 10; 

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

const FloatingHearts = () => {
    const [hearts, setHearts] = useState<Array<{id: number, left: number, top: number, scale: number, speed: number}>>([]);

    useEffect(() => {
        const count = 20;
        const newHearts = [];
        for(let i=0; i<count; i++) {
            newHearts.push({
                id: i,
                left: Math.random() * 100,
                top: Math.random() * 100,
                scale: Math.random() * 0.5 + 0.5,
                speed: Math.random() * 5 + 5
            });
        }
        setHearts(newHearts);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {hearts.map(h => (
                <div 
                    key={h.id}
                    className="absolute text-pink-500/20 animate-float"
                    style={{
                        left: `${h.left}%`,
                        top: `${h.top}%`,
                        transform: `scale(${h.scale})`,
                        animationDuration: `${h.speed}s`
                    }}
                >
                    <Heart fill="currentColor" size={40} />
                </div>
            ))}
        </div>
    )
}

const Stardust = () => {
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
      const count = 100; 
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2, 
          size: Math.random() * 2,
          alpha: Math.random() * 0.5 + 0.1
        });
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#fecdd3'; // Rose Pink
      
      particles.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;

        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;

        ctx.beginPath();
        ctx.globalAlpha = p.alpha;
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
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-60" />;
};

// --- Constants ---
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop"; // Romantic couple placeholder
const DEFAULT_WELCOME = "Join us as we begin our forever.";

// --- Main Component ---

interface WelcomeScreenProps {
  onLoginSuccess: (type: 'guest' | 'couple' | 'admin', name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onLoginSuccess }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cardTransform = useTilt(cardRef);
  
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
      // Listen for config updates
      const checkUpdates = () => {
          const savedConfig = localStorage.getItem('wedding_global_config');
          if (savedConfig) {
              setConfig(JSON.parse(savedConfig));
          }
          const msg = localStorage.getItem('wedding_welcome_msg');
          if (msg) setWelcomeMsg(msg);

          const img = localStorage.getItem('wedding_couple_image');
          if (img && img !== coupleImage) setCoupleImage(img);
      };
      checkUpdates();
      const interval = setInterval(checkUpdates, 2000);

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (event) => {
          if (event.data.type === 'config_sync') {
              const newConfig = event.data.payload;
              setConfig(newConfig);
              if (newConfig.coupleImage) setCoupleImage(newConfig.coupleImage);
              if (newConfig.welcomeMsg) setWelcomeMsg(newConfig.welcomeMsg);
          }
      };

      return () => {
          clearInterval(interval);
          channel.close();
      };
  }, [coupleImage]);

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

  const handleAdminClick = () => {
      playChimeSound();
      setAdminPin("");
      setErrorMsg("");
      setShowAdminLogin(true);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg("");
      setIsLoading(true);
      playChimeSound();

      setTimeout(() => {
          if (btoa(adminPin) === "MjAyNQ==") { // 2025
              setShowAdminLogin(false);
              localStorage.setItem('wedding_current_user_type', 'admin');
              onLoginSuccess('admin', 'Admin');
          } else {
              setErrorMsg("Incorrect PIN");
              setAdminPin("");
          }
          setIsLoading(false);
      }, 800);
  };

  const handleUserLoginOpen = (type: 'guest' | 'couple') => {
    playChimeSound();
    setLoginType(type);
    const storedName = localStorage.getItem(`wedding_${type}_name`);
    const storedPhone = localStorage.getItem(`wedding_${type}_phone`);
    setUserName(storedName || "");
    setUserPhone(storedPhone || "");
    setErrorMsg("");
    setShowUserLogin(true);
  };

  const handleUserLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    playChimeSound();
    
    if (!userName.trim() || !userPhone.trim()) {
      setErrorMsg("Please tell us who you are.");
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
    <div className="w-full h-full flex flex-col relative overflow-hidden bg-[#4c0519]">
      
      {/* Romantic Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-b from-passion-900 via-[#380410] to-black">
         <FloatingHearts />
         <Stardust />
         
         {/* Soft Spotlight */}
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-passion-600/20 to-transparent blur-3xl"></div>
         
         {/* Vignette */}
         <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,#4c0519_100%)] opacity-80"></div>
      </div>

      <button 
          onClick={toggleMute} 
          className="absolute top-6 right-6 z-50 text-pink-200 p-3 bg-black/20 rounded-full backdrop-blur-md hover:bg-black/40 transition-all border border-white/10 shadow-lg"
      >
          {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
      </button>

      {/* Admin Trigger */}
      <button 
          onClick={handleAdminClick} 
          className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 text-white/20 hover:text-white/60 transition-all p-2 flex items-center gap-2"
      >
          <Lock size={12} />
      </button>

      {/* --- Scrollable Content Area --- */}
      <div 
        ref={scrollRef}
        className="relative z-10 flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar scroll-smooth overscroll-contain"
      >
        <header className="flex-shrink-0 pt-20 pb-6 px-4 text-center relative animate-fade-in-up duration-1000 z-20">
           <div className="inline-block mb-4 animate-pulse-slow">
                <Heart fill="url(#heart-grad)" className="w-12 h-12 text-transparent" />
                <svg width="0" height="0">
                    <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f472b6" />
                        <stop offset="100%" stopColor="#be123c" />
                    </linearGradient>
                </svg>
           </div>
           <h1 className="font-romantic text-6xl sm:text-7xl leading-none text-transparent bg-clip-text bg-gradient-to-br from-pink-200 via-pink-100 to-rose-300 drop-shadow-[0_5px_15px_rgba(225,29,72,0.5)] pb-2">
             {config.coupleName}
           </h1>
           <p className="text-pink-300/80 font-serif italic text-sm tracking-widest mt-4 animate-slide-up delay-300">
             Our Love Story
           </p>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 pb-32 z-20 perspective-[1000px]">
          
          {/* 3D Card Container */}
          <div 
            ref={cardRef}
            className="relative w-72 h-72 sm:w-80 sm:h-80 my-8 flex-shrink-0"
            style={{ transform: cardTransform, transition: 'transform 0.1s ease-out', transformStyle: 'preserve-3d' }}
          >
             {/* Back Glow */}
             <div className="absolute inset-0 bg-passion-600/40 blur-[60px] rounded-full transform translate-z-[-50px] animate-pulse-slow"></div>
             
             {/* Decorative Rings */}
             <div className="absolute -inset-6 border border-pink-500/20 rounded-full animate-spin-slow pointer-events-none"></div>

             {/* Main Image Container */}
             <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-br from-pink-400 via-passion-600 to-pink-400 shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#4c0519] relative group">
                    <img src={coupleImage} alt="Couple" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 will-change-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-passion-900/60 via-transparent to-transparent"></div>
                </div>
             </div>
          </div>

          {/* Glass Panel Content */}
          <div className="glass-romance max-w-md mx-auto space-y-8 p-8 rounded-3xl relative z-10 animate-fade-in-up delay-500 w-full">
              
              <p className="font-romantic text-pink-100 text-2xl leading-relaxed text-center drop-shadow-md">
                  {welcomeMsg}
              </p>
              
              {/* Countdown */}
              <div className="flex justify-center gap-4 py-4 border-t border-pink-500/20 border-b border-pink-500/20">
                 {Object.entries(timeLeft).map(([unit, val], i) => (
                     <div key={unit} className="flex flex-col items-center min-w-[60px]">
                         <span className="text-2xl font-serif text-white font-bold">{val}</span>
                         <span className="text-[9px] uppercase tracking-widest text-pink-300">{unit}</span>
                     </div>
                 ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 items-center w-full">
                  <button 
                    onClick={() => handleUserLoginOpen('guest')}
                    className="w-full bg-gradient-to-r from-passion-600 to-passion-800 text-white py-4 rounded-full font-heading font-bold tracking-widest shadow-glow hover:shadow-glow-lg hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden"
                  >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                      <Sparkles size={18} /> Enter Celebration
                  </button>
                  
                  <button 
                    onClick={() => handleUserLoginOpen('couple')}
                    className="text-pink-400/60 text-xs uppercase tracking-widest hover:text-pink-200 transition-colors py-2 flex items-center gap-2 hover:gap-3 duration-300"
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
              <div className="glass-romance p-8 rounded-2xl w-full max-w-xs text-center animate-zoom-in">
                  <h3 className="text-pink-200 font-heading text-xl mb-6">Secret Access</h3>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <input 
                          type="password" 
                          value={adminPin} 
                          onChange={e => setAdminPin(e.target.value)}
                          className={`w-full bg-black/40 border rounded-lg px-4 py-3 text-center text-pink-100 tracking-[0.5em] focus:outline-none focus:border-pink-400 transition-colors ${errorMsg ? 'border-red-500' : 'border-pink-500/30'}`}
                          placeholder="PIN"
                          autoFocus
                      />
                      {errorMsg && <p className="text-red-400 text-xs animate-shake">{errorMsg}</p>}
                      <div className="flex gap-3">
                          <button type="button" onClick={() => setShowAdminLogin(false)} className="flex-1 py-2.5 rounded-lg border border-white/10 text-pink-400 hover:bg-white/5 hover:text-white transition-colors">Cancel</button>
                          <button type="submit" disabled={isLoading} className="flex-1 py-2.5 rounded-lg bg-passion-600 text-white font-bold hover:bg-passion-500 transition-colors flex items-center justify-center">
                              {isLoading ? <Loader size={16} className="animate-spin" /> : "Unlock"}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* User Login Modal */}
      {showUserLogin && (
          <div className="fixed inset-0 z-[60] bg-passion-900/95 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
              <div className="bg-gradient-to-b from-passion-800 to-black p-8 rounded-3xl w-full max-w-sm relative animate-slide-up border border-pink-500/30 shadow-2xl">
                  <button onClick={() => setShowUserLogin(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                  
                  <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-pink-500 to-passion-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-glow animate-pulse-slow">
                            {loginType === 'couple' ? <Heart size={32} fill="currentColor" /> : <User size={32} />}
                      </div>
                      <h3 className="font-romantic text-4xl text-pink-100 mb-2">{loginType === 'couple' ? 'The Couple' : 'Welcome Guest'}</h3>
                      <p className="text-xs text-pink-300/60 font-serif tracking-wider uppercase">May we have your details?</p>
                  </div>

                  <form onSubmit={handleUserLoginSubmit} className="space-y-5">
                      <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-pink-400/80 mb-2 ml-1">Your Name</label>
                          <input 
                              type="text" 
                              value={userName} 
                              onChange={e => setUserName(e.target.value)}
                              className="w-full bg-black/30 border border-pink-500/20 rounded-xl px-5 py-4 text-pink-100 focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all"
                              placeholder="e.g. Romeo"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-pink-400/80 mb-2 ml-1">Phone Number</label>
                          <input 
                              type="tel" 
                              value={userPhone} 
                              onChange={e => setUserPhone(e.target.value)}
                              className="w-full bg-black/30 border border-pink-500/20 rounded-xl px-5 py-4 text-pink-100 focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all"
                              placeholder="10-digit number"
                          />
                      </div>
                      
                      {errorMsg && <p className="text-red-400 text-xs text-center animate-shake">{errorMsg}</p>}

                      <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-600 to-passion-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 group border border-pink-500/30">
                          {isLoading ? (
                              <Loader size={20} className="animate-spin" />
                          ) : (
                              <><span>Enter with Love</span> <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" /></>
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
