import React from 'react';

// ✅ FIX: Local interface definition to prevent import errors and type mismatches
export interface LanternMessage {
  id: string;
  sender: string;
  text?: string;    // UI expects this
  message?: string; // Server might send this
  depth?: 'far' | 'mid' | 'near';
  xValues?: number;
  speed?: number;
  delay?: number;
  [key: string]: any; // Allow loose properties to prevent crashes
}

interface LanternProps {
  message: LanternMessage;
  onClick: (msg: LanternMessage) => void;
  isRevealed?: boolean;
  variant?: 'floating' | 'grid';
  label?: string;
}

export const Lantern: React.FC<LanternProps> = ({ message, onClick, isRevealed = false, variant = 'floating', label }) => {
  const isGrid = variant === 'grid';

  // ✅ FIX: Robustly resolve text content
  const contentText = message.text || message.message || "A wish for love...";
  const senderName = message.sender || "Guest";

  // 3D Depth Configurations
  const depthConfig = {
    far: { size: 'w-12 h-20', blur: 'blur-[2px]', opacity: 'opacity-50', zIndex: 'z-0', scale: 'scale-75', windDuration: '12s' },
    mid: { size: 'w-20 h-32', blur: 'blur-[0.5px]', opacity: 'opacity-85', zIndex: 'z-10', scale: 'scale-100', windDuration: '8s' },
    near: { size: 'w-32 h-48', blur: 'blur-0', opacity: 'opacity-100', zIndex: 'z-20', scale: 'scale-110', windDuration: '6s' }
  };

  // Safe depth access
  const depthKey = (message.depth && ['far', 'mid', 'near'].includes(message.depth)) ? message.depth : 'mid';
  
  let currentConfig;
  if (isGrid) {
    currentConfig = { size: 'w-full aspect-[2/3]', blur: 'blur-0', opacity: 'opacity-100', zIndex: 'z-10', scale: 'scale-100', windDuration: '0s' };
  } else if (isRevealed) {
    currentConfig = { size: 'w-64 h-96', blur: 'blur-0', opacity: 'opacity-100', zIndex: 'z-50', scale: 'scale-100', windDuration: '20s' };
  } else {
    currentConfig = depthConfig[depthKey];
  }

  const animationClass = isGrid ? '' : isRevealed ? 'animate-wind' : 'animate-rise';

  const containerStyle = (isGrid || isRevealed) ? {} : {
    left: `${message.xValues ?? Math.random() * 90}%`,
    animationDuration: `${message.speed ?? 15}s`,
    animationDelay: `${message.delay ?? 0}s`,
  };
  
  const windStyle = isGrid ? {} : { 
      animationDuration: currentConfig.windDuration, 
      animationDelay: `${parseInt(message.id) % 5 || 0}s` 
  };

  return (
    <div 
      className={`${isGrid ? 'relative' : 'absolute'} ${animationClass} ${currentConfig.size} ${currentConfig.zIndex} ${currentConfig.opacity} ${currentConfig.blur} ${currentConfig.scale} transition-all duration-700 ease-in-out cursor-pointer group pointer-events-auto`}
      style={containerStyle}
      onClick={(e) => { e.stopPropagation(); onClick(message); }}
    >
      <div className={`relative w-full h-full ${(!isGrid && !isRevealed) ? 'animate-wind' : ''}`} style={windStyle}>
        <div className={`relative w-full h-full lantern-glow origin-top ${isGrid ? 'hover:scale-105 transition-transform duration-300' : ''}`}>
          
          {/* Lantern SVG */}
          <svg viewBox="0 0 100 150" className="w-full h-full overflow-visible drop-shadow-2xl" preserveAspectRatio="xMidYMid meet">
            <defs>
              <radialGradient id="paperGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffedd5" stopOpacity="0.96" />
                <stop offset="100%" stopColor="#9a3412" stopOpacity="0.92" />
              </radialGradient>
              <radialGradient id="flameCore" cx="50%" cy="65%" r="25%">
                <stop offset="0%" stopColor="#ffff" stopOpacity="1" />
                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
              </radialGradient>
              <pattern id="indianPattern" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                 <circle cx="5" cy="5" r="1" fill="#7c2d12" opacity="0.15" />
              </pattern>
            </defs>
            <path d="M50 -10 L50 10" stroke="#502010" strokeWidth="1.5" />
            <circle cx="50" cy="-10" r="2" fill="#502010" />
            <ellipse cx="50" cy="15" rx="36" ry="6" fill="#7c2d12" />
            <path d="M15 15 L18 135 A 32 8 0 0 0 82 135 L85 15" fill="url(#paperGlow)" />
            <g className="animate-candle origin-bottom">
               <circle cx="50" cy="90" r="28" fill="url(#flameCore)" />
            </g>
          </svg>

          {/* Grid Label */}
          {isGrid && (
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 w-[85%]">
              <div className="bg-amber-100/90 px-2 py-1 rounded shadow-lg text-center transform -rotate-1">
                <p className="text-[8px] font-bold text-amber-950 uppercase truncate">
                    {label ?? senderName}
                </p>
              </div>
            </div>
          )}

          {/* Revealed Message */}
          {isRevealed ? (
            <div className="absolute inset-0 top-8 bottom-8 flex flex-col items-center justify-center p-4 text-center animate-[fadeIn_1s_ease-out]">
              <p className="font-script text-xl text-rose-950 leading-tight mb-4 line-clamp-6">{contentText}</p>
              <div className="w-16 h-[1px] bg-rose-900/40 mx-auto my-3"></div>
              <p className="text-xs font-bold text-rose-900 uppercase tracking-widest">{senderName}</p>
            </div>
          ) : (
             !isGrid && message.depth === 'near' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                     <div className="bg-amber-100/20 backdrop-blur-sm px-2 py-0.5 rounded border border-amber-200/30 shadow-lg transform rotate-1">
                        <p className="font-script text-sm text-amber-950 drop-shadow-md">Tap to read</p>
                     </div>
                </div>
             )
          )}
        </div>
      </div>
    </div>
  );
};
export default Lantern;