import React from 'react';

export const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden">
      {/* 1. Base Gradient: Deep Pearlescent Twilight */}
      {/* Blends from a warm earthy base (ground/horizon) up to a mystical purple/blue sky */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-rose-200 via-purple-300 to-slate-900"></div>
      
      {/* 2. Texture Overlay: Noise for film grain effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      {/* 3. Celestial Glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-400/20 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-300/20 rounded-full blur-[120px]"></div>

      {/* 3b. Drifting Fog Layers (New) */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
         <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-rose-100/20 to-transparent animate-fog" style={{ animationDuration: '25s' }}></div>
         <div className="absolute bottom-0 left-[-20%] right-[-20%] h-1/3 bg-gradient-to-t from-purple-200/10 to-transparent animate-fog" style={{ animationDelay: '5s', animationDuration: '35s' }}></div>
      </div>

      {/* 4. Pixie Dust Particles (Parallax Layers) */}
      {/* Layer 1: Small, slow, far */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div 
            key={`star-1-${i}`}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.5,
              animationDelay: Math.random() * 5 + 's',
              animationDuration: Math.random() * 3 + 3 + 's'
            }}
          />
        ))}
      </div>

      {/* Layer 2: Larger, brighter, closer */}
      <div className="absolute inset-0">
         {[...Array(15)].map((_, i) => (
          <div 
            key={`star-2-${i}`}
            className="absolute rounded-full bg-yellow-100 shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-twinkle"
            style={{
              width: Math.random() * 3 + 2 + 'px',
              height: Math.random() * 3 + 2 + 'px',
              top: Math.random() * 80 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.8 + 0.2,
              animationDelay: Math.random() * 4 + 's',
              animationDuration: Math.random() * 2 + 2 + 's'
            }}
          />
        ))}
      </div>

      {/* 5. Atmosphere / Fog */}
      <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-rose-200/30 to-transparent pointer-events-none blur-2xl"></div>
    </div>
  );
};