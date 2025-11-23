
import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface IntroGateProps {
  onEnter: () => void;
  onStartOpen?: () => void;
}

export const IntroGate: React.FC<IntroGateProps> = ({ onEnter, onStartOpen }) => {
  const [isOpening, setIsOpening] = useState(false);

  const handleEnter = () => {
    if (onStartOpen) onStartOpen();
    setIsOpening(true);
    // Wait for animation before switching view. 
    // This syncs with the duration of the zoom/fade out.
    setTimeout(onEnter, 2200);
  };

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050208] overflow-hidden transition-all duration-1000 ${isOpening ? 'pointer-events-none' : ''}`}>
      
      {/* Background Ambience - Deep Darkness */}
      <div className={`absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/10 via-black to-black transition-opacity duration-1000 ${isOpening ? 'opacity-0' : 'opacity-100'}`}></div>
      
      {/* Fog/Mist at bottom */}
      <div className={`absolute bottom-0 w-full h-1/3 bg-gradient-to-t from-purple-900/10 to-transparent blur-3xl transition-opacity duration-1000 ${isOpening ? 'opacity-0' : 'opacity-100'}`}></div>

      {/* Main Content Wrapper - Animates Scale for "Entering" Effect */}
      <div className={`relative z-10 flex flex-col items-center transition-all duration-[2500ms] cubic-bezier(0.25, 1, 0.5, 1) ${isOpening ? 'scale-[4] opacity-0 translate-y-32' : 'scale-100 opacity-100 animate-fade-in'}`}>
        
        <h1 className="font-header text-2xl md:text-3xl text-amber-100/80 uppercase tracking-[0.3em] mb-12 text-center px-4 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-opacity duration-500">
          {isOpening ? '' : 'The Lantern Realm'}
        </h1>

        {/* The Door Scene Container with Perspective */}
        <div 
          className="relative group cursor-pointer"
          style={{ perspective: '1200px' }} // Critical for 3D rotation effect
          onClick={handleEnter}
        >
          {/* 1. The Blinding Light Behind the Door (The Portal) */}
          {/* Becomes massive and bright when opening, effectively transitioning to white/light */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[350px] bg-amber-100 rounded-full blur-[30px] transition-all duration-[2000ms] ease-in-out ${isOpening ? 'scale-[6] opacity-100' : 'scale-75 opacity-0 group-hover:opacity-30'}`}></div>
          
          {/* 2. Central Crack Light Leak - visible before opening */}
          <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-amber-200/80 shadow-[0_0_15px_rgba(255,200,100,1)] transition-opacity duration-500 ${isOpening ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'}`}></div>

          {/* 3. SVG Door */}
          <svg 
            width="280" 
            height="420" 
            viewBox="0 0 280 420" 
            className={`drop-shadow-2xl overflow-visible transition-transform duration-[2000ms] ${isOpening ? '' : 'hover:scale-[1.02]'}`}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <defs>
              <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#2a1005" />
                <stop offset="15%" stopColor="#3f1a08" />
                <stop offset="50%" stopColor="#4a1f0a" />
                <stop offset="85%" stopColor="#3f1a08" />
                <stop offset="100%" stopColor="#2a1005" />
              </linearGradient>
            </defs>

            {/* Door Frame (Fixed) */}
            <path d="M10 420 L10 130 A 130 130 0 0 1 270 130 L270 420" fill="none" stroke="#150500" strokeWidth="20" />
            
            {/* Dark Void Background inside the frame (visible as doors open) */}
            {/* Note: The 'Blinding Light' div above sits visually behind this SVG via z-index or stacking context if organized, 
                but since it's absolutely positioned in the parent, it shines through. 
                We use a semi-transparent fill here to let light through. */}
            
            {/* Left Door Panel */}
            <g 
              style={{ 
                transformOrigin: '20px 140px', 
                transform: isOpening ? 'rotateY(-115deg)' : 'rotateY(0deg)',
                transition: 'transform 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)' 
              }}
            >
               {/* Door Shape */}
               <path d="M20 420 L20 140 A 120 120 0 0 1 140 140 L140 420 Z" fill="url(#doorGradient)" stroke="#000" strokeWidth="1" />
               
               {/* Details */}
               <path d="M60 140 L60 420" stroke="#1a0500" strokeWidth="2" opacity="0.3" />
               <path d="M100 140 L100 420" stroke="#1a0500" strokeWidth="2" opacity="0.3" />
               
               {/* Metal Band & Studs */}
               <path d="M20 300 L140 300" stroke="#111" strokeWidth="4" opacity="0.8" />
               <circle cx="35" cy="300" r="2" fill="#554" />
               <circle cx="125" cy="300" r="2" fill="#554" />
               
               {/* Handle Ring */}
               <circle cx="115" cy="280" r="6" fill="#111" />
               <path d="M115 280 L 115 292" stroke="#333" strokeWidth="2" />
               <circle cx="115" cy="296" r="4" fill="none" stroke="#443" strokeWidth="2" />
            </g>

            {/* Right Door Panel */}
            <g 
              style={{ 
                transformOrigin: '260px 140px', 
                transform: isOpening ? 'rotateY(115deg)' : 'rotateY(0deg)',
                transition: 'transform 2.5s cubic-bezier(0.2, 0.8, 0.2, 1)' 
              }}
            >
               {/* Door Shape */}
               <path d="M140 420 L140 140 A 120 120 0 0 1 260 140 L260 420 Z" fill="url(#doorGradient)" stroke="#000" strokeWidth="1" />
               
               {/* Details */}
               <path d="M180 140 L180 420" stroke="#1a0500" strokeWidth="2" opacity="0.3" />
               <path d="M220 140 L220 420" stroke="#1a0500" strokeWidth="2" opacity="0.3" />

               {/* Metal Band */}
               <path d="M140 300 L260 300" stroke="#111" strokeWidth="4" opacity="0.8" />
               <circle cx="155" cy="300" r="2" fill="#554" />
               <circle cx="245" cy="300" r="2" fill="#554" />

               {/* Handle Ring */}
               <circle cx="165" cy="280" r="6" fill="#111" />
               <path d="M165 280 L 165 292" stroke="#333" strokeWidth="2" />
               <circle cx="165" cy="296" r="4" fill="none" stroke="#443" strokeWidth="2" />
            </g>
            
            {/* Glowing Crack Line (fades when opening) */}
             <line x1="140" y1="140" x2="140" y2="420" stroke="#fbbf24" strokeWidth="2" 
                className={`transition-opacity duration-300 ${isOpening ? 'opacity-0' : 'opacity-40 animate-pulse'}`} 
                style={{ filter: 'blur(2px)' }}
             />
          </svg>

          {/* Button Text */}
          <div className={`absolute -bottom-24 left-1/2 -translate-x-1/2 transition-all duration-500 ${isOpening ? 'opacity-0 translate-y-10' : 'opacity-100'}`}>
            <button className="flex items-center gap-3 text-amber-100 text-sm font-header tracking-[0.2em] border border-amber-500/30 px-8 py-3 rounded-full bg-black/40 hover:bg-amber-950/50 hover:border-amber-400 hover:shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-all active:scale-95 group-hover:text-white">
              <Sparkles size={14} className="text-amber-300 animate-pulse" />
              <span>ENTER THE REALM</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
