
import React, { useEffect, useRef, useState } from 'react';
import { User, Sparkles, Lock, X, Heart, Volume2, VolumeX, ChevronRight, Loader } from 'lucide-react';
import { socket } from '../socket';
import { useTheme, ThemeConfig } from '../ThemeContext';

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

// Base background colors that sit behind the artistic layers
const THEME_BASES = {
    royal: 'bg-[#4a0404]', 
    midnight: 'bg-[#020617]', 
    sunset: 'bg-[#2a0a18]',
    lavender: 'bg-[#2e1065]',
    forest: 'bg-[#052e16]',
};

const Atmosphere = ({ theme }: { theme: ThemeConfig }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000">
            
            {/* --- THEME: MIDNIGHT (Cinematic Cool) --- */}
            {theme.gradient === 'midnight' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-[#0f172a] to-black"></div>
                    {/* Anamorphic Lens Flares */}
                    <div className="absolute top-1/4 -left-1/2 w-[200%] h-[2px] bg-blue-500/40 blur-sm rotate-[-12deg] animate-pulse-slow shadow-[0_0_30px_rgba(59,130,246,0.6)]"></div>
                    <div className="absolute bottom-1/3 -left-1/2 w-[200%] h-[1px] bg-teal-400/30 blur-md rotate-[8deg] animate-float"></div>
                    
                    {/* Deep Glows */}
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-800/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>
                    
                    {/* Cinematic Grain */}
                    <div className="absolute inset-0 opacity-[0.07] mix-blend-overlay" 
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
                    </div>
                </>
            )}

            {/* --- THEME: ROYAL (3D Romantic Red) --- */}
            {theme.gradient === 'royal' && (
                <>
                    {/* Deep Radial Vignette for 3D feel */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#be123c_0%,_#881337_40%,_#4c0519_80%,_#1a0105_100%)]"></div>
                    
                    {/* Floating Rosy Orbs */}
                    <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[120px] animate-float mix-blend-screen"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/20 rounded-full blur-[100px] animate-float" style={{animationDelay: '-3s', animationDuration: '10s'}}></div>
                    
                    {/* Subtle Cube Texture for Depth */}
                    <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    
                    {/* Gold Embers */}
                    {[...Array(8)].map((_, i) => (
                        <div key={`gold-${i}`} className="absolute rounded-full bg-amber-400/60 animate-float"
                             style={{
                                 left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                 width: `${Math.random() * 4 + 1}px`, height: `${Math.random() * 4 + 1}px`,
                                 opacity: Math.random() * 0.6 + 0.2, animationDuration: `${Math.random() * 10 + 15}s`,
                                 boxShadow: '0 0 10px 2px rgba(251, 191, 36, 0.2)'
                             }}></div>
                    ))}
                </>
            )}

            {/* --- THEME: SUNSET (Living Art) --- */}
            {theme.gradient === 'sunset' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#4c1d95] via-[#be185d] to-[#fb923c]"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-20 left-1/4 w-72 h-72 bg-orange-500/30 rounded-full blur-[60px] animate-float"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[400px] bg-pink-600/30 rounded-full blur-[80px] animate-pulse-slow"></div>
                </>
            )}

            {/* --- THEME: LAVENDER (Soft Mist) --- */}
            {theme.gradient === 'lavender' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-violet-950 to-black"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#e879f9_0%,_transparent_50%)] opacity-20"></div>
                    {[...Array(6)].map((_, i) => (
                         <div key={`mist-${i}`} className="absolute bg-purple-400/10 rounded-full blur-[100px] animate-float"
                              style={{
                                  left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                                  width: '400px', height: '400px',
                                  animationDelay: `${i * -2}s`, animationDuration: '15s'
                              }}></div>
                    ))}
                </>
            )}

            {/* --- THEME: FOREST (Enchanted) --- */}
            {theme.gradient === 'forest' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-[#022c22] to-black"></div>
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay"></div>
                </>
            )}

            {/* --- OVERLAY EFFECTS --- */}
            {theme.effect !== 'none' && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                     {theme.effect === 'petals' && [...Array(12)].map((_, i) => (
                         <div key={`petal-${i}`} className="absolute bg-rose-300/40 rounded-[100%_0%_100%_0%] animate-float shadow-sm"
                              style={{
                                  left: `${Math.random() * 100}%`, top: `${Math.random() * 120}%`,
                                  width: `${Math.random() * 15 + 8}px`, height: `${Math.random() * 15 + 8}px`,
                                  animationDuration: `${Math.random() * 10 + 15}s`, animationDelay: `${Math.random() * -5}s`,
                                  transform: `rotate(${Math.random() * 360}deg)`
                              }}></div>
                     ))}
                     {theme.effect === 'dust' && (
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                     )}
                     {theme.effect === 'lights' && (
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 animate-shimmer" style={{ backgroundSize: '200% 200%' }}></div>
                     )}
                     {theme.effect === 'fireflies' && [...Array(25)].map((_, i) => (
                         <div key={`fly-${i}`} className="absolute bg-yellow-300 rounded-full animate-float shadow-[0_0_8px_2px_rgba(253,224,71,0.4)]"
                              style={{
                                  left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                                  width: `${Math.random()*3+1}px`, height: `${Math.random()*3+1}px`,
                                  animationDuration: `${Math.random()*5+5}s`, opacity: Math.random() * 0.8
                              }}></div>
                     ))}
                </div>
            )}
        </div>
    );
};

const FloatingHearts = () => {
    const [hearts, setHearts] = useState<Array<{id: number, left: number, top: number, scale: number, speed: number}>>([]);

    useEffect(() => {
        const count = 15;
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
                    className="absolute text-pink-500/20 animate-float mix-blend-screen"
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

// --- Constants ---
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=1000&auto=format&fit=crop"; 
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
  const { theme } = useTheme();
  const [coupleImage, setCoupleImage] = useState(DEFAULT_IMAGE);

  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPin, setAdminPin] = useState("");
  const [showUserLogin, setShowUserLogin] = useState(false);
  const [loginType, setLoginType] = useState<'guest' | 'couple'>('guest');
  const [userName, setUserName] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      // Initialize data from local storage first for speed
      const savedConfig = localStorage.getItem('wedding_global_config');
      if (savedConfig) {
          setConfig(JSON.parse(savedConfig));
      }
      const msg = localStorage.getItem('wedding_welcome_msg');
      if (msg) setWelcomeMsg(msg);

      const img = localStorage.getItem('wedding_couple_image');
      if (img) setCoupleImage(img);

      // Listen for real-time socket updates
      socket.emit('request_sync');

      const handleConfigSync = (data: any) => {
          const newConfig = data.payload;
          setConfig(newConfig);
          if (newConfig.coupleImage) setCoupleImage(newConfig.coupleImage);
          if (newConfig.welcomeMsg) setWelcomeMsg(newConfig.welcomeMsg);
          localStorage.setItem('wedding_global_config', JSON.stringify(newConfig));
      };

      const handleFullSync = (state: any) => {
          if(state.config) {
              setConfig(state.config);
              if (state.config.coupleImage) setCoupleImage(state.config.coupleImage);
          }
      };

      socket.on('config_sync', handleConfigSync);
      socket.on('full_sync', handleFullSync);

      return () => {
          socket.off('config_sync', handleConfigSync);
          socket.off('full_sync', handleFullSync);
      };
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
    <div className={`w-full h-full flex flex-col relative overflow-hidden ${THEME_BASES[theme.gradient] || THEME_BASES.royal}`}>
      
      {/* Artistic Atmosphere Layer */}
      <Atmosphere theme={theme} />
      <FloatingHearts />

      {/* Soft Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.3)_100%)] z-0"></div>

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
           <h1 className="font-romantic text-6xl sm:text-7xl leading-none text-transparent bg-clip-text bg-gradient-to-br from-pink-200 via-pink-100 to-rose-300 drop-shadow-[0_2px_10px_rgba(225,29,72,0.5)] pb-2">
             {config.coupleName}
           </h1>
           <p className="text-pink-200/90 font-serif italic text-sm tracking-widest mt-4 animate-slide-up delay-300 text-shadow-sm">
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
             <div className={`absolute inset-0 blur-[60px] rounded-full transform translate-z-[-50px] animate-pulse-slow ${theme.gradient === 'midnight' ? 'bg-blue-600/40' : theme.gradient === 'sunset' ? 'bg-orange-500/40' : theme.gradient === 'lavender' ? 'bg-purple-600/40' : theme.gradient === 'forest' ? 'bg-emerald-600/40' : 'bg-passion-600/40'}`}></div>
             
             <div className="absolute -inset-6 border border-pink-500/20 rounded-full animate-spin-slow pointer-events-none"></div>

             <div className="relative w-full h-full rounded-full p-1 bg-gradient-to-br from-white/20 via-transparent to-white/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] z-10 backdrop-blur-sm">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-black/20 relative group">
                    <img src={coupleImage} alt="Couple" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 will-change-transform" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>
             </div>
          </div>

          {/* Glass Panel Content */}
          <div className="glass-romance max-w-md mx-auto space-y-8 p-8 rounded-3xl relative z-10 animate-fade-in-up delay-500 w-full bg-black/20 backdrop-blur-xl border border-white/10">
              
              <p className="font-romantic text-pink-100 text-2xl leading-relaxed text-center drop-shadow-md">
                  {welcomeMsg}
              </p>
              
              {/* Countdown */}
              <div className="flex justify-center gap-4 py-4 border-t border-white/10 border-b">
                 {Object.entries(timeLeft).map(([unit, val], i) => (
                     <div key={unit} className="flex flex-col items-center min-w-[60px]">
                         <span className="text-2xl font-serif text-white font-bold drop-shadow-lg">{val}</span>
                         <span className="text-[9px] uppercase tracking-widest text-pink-200">{unit}</span>
                     </div>
                 ))}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-4 items-center w-full">
                  <button 
                    onClick={() => handleUserLoginOpen('guest')}
                    className="w-full bg-gradient-to-r from-pink-600/80 to-passion-800/80 text-white py-4 rounded-full font-heading font-bold tracking-widest shadow-lg hover:shadow-glow hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-3 group relative overflow-hidden border border-white/20"
                  >
                      <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                      <Sparkles size={18} /> Enter Celebration
                  </button>
                  
                  <button 
                    onClick={() => handleUserLoginOpen('couple')}
                    className="text-pink-300/80 text-xs uppercase tracking-widest hover:text-white transition-colors py-2 flex items-center gap-2 hover:gap-3 duration-300"
                  >
                      <Heart size={12} fill="currentColor" /> Couple Login
                  </button>
              </div>
          </div>
        </main>
      </div>
      
      {/* --- Modals --- */}
      {showAdminLogin && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="glass-romance p-8 rounded-2xl w-full max-w-xs text-center animate-zoom-in bg-black/40">
                  <h3 className="text-pink-200 font-heading text-xl mb-6">Secret Access</h3>
                  <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <input 
                          type="password" 
                          value={adminPin} 
                          onChange={e => setAdminPin(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-center text-pink-100 tracking-[0.5em] focus:outline-none focus:border-pink-400 transition-colors"
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

      {showUserLogin && (
          <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fade-in">
              <div className={`bg-gradient-to-b p-8 rounded-3xl w-full max-w-sm relative animate-slide-up border border-white/20 shadow-2xl ${theme.gradient === 'midnight' ? 'from-blue-950 to-black' : theme.gradient === 'forest' ? 'from-emerald-900 to-black' : 'from-passion-900 to-black'}`}>
                  <button onClick={() => setShowUserLogin(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24} /></button>
                  
                  <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-glow animate-pulse-slow border border-white/20">
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
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-pink-100 focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all"
                              placeholder="e.g. Romeo"
                          />
                      </div>
                      <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-pink-400/80 mb-2 ml-1">Phone Number</label>
                          <input 
                              type="tel" 
                              value={userPhone} 
                              onChange={e => setUserPhone(e.target.value)}
                              className="w-full bg-black/30 border border-white/10 rounded-xl px-5 py-4 text-pink-100 focus:outline-none focus:border-pink-500 focus:bg-black/50 transition-all"
                              placeholder="10-digit number"
                          />
                      </div>
                      
                      {errorMsg && <p className="text-red-400 text-xs text-center animate-shake">{errorMsg}</p>}

                      <button type="submit" disabled={isLoading} className="w-full bg-gradient-to-r from-pink-600 to-passion-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-glow transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 group border border-white/20">
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
