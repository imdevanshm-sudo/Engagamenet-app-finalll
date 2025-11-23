import React from "react";

interface LanternProps {
  message: {
    id: string;
    sender: string;
    text?: string;
    depth?: "near" | "mid" | "far";
    xValues?: number;
    speed?: number;
    delay?: number;
  };
  onClick: (msg: any) => void;
  isRevealed?: boolean;
  variant?: "floating" | "grid";
  label?: string;
}

const Lantern: React.FC<LanternProps> = ({
  message,
  onClick,
  isRevealed = false,
  variant = "floating",
  label,
}) => {
  const isGrid = variant === "grid";

  const depthConfig = {
    far: {
      size: "w-10 h-16",
      blur: "blur-[1px]",
      opacity: "opacity-50",
      zIndex: "z-0",
      scale: "scale-90",
    },
    mid: {
      size: "w-14 h-24",
      blur: "blur-[0.5px]",
      opacity: "opacity-80",
      zIndex: "z-10",
      scale: "scale-100",
    },
    near: {
      size: "w-20 h-32",
      blur: "blur-0",
      opacity: "opacity-100",
      zIndex: "z-20",
      scale: "scale-110",
    },
  };

  let config;
  if (isGrid) {
    config = {
      size: "w-full aspect-[2/3]",
      blur: "blur-0",
      opacity: "opacity-100",
      zIndex: "z-20",
      scale: "scale-100",
    };
  } else if (isRevealed) {
    config = {
      size: "w-48 h-72",
      blur: "blur-0",
      opacity: "opacity-100",
      zIndex: "z-50",
      scale: "scale-100",
    };
  } else {
    config = depthConfig[message.depth ?? "mid"];
  }

  return (
    <div
      className={`
        ${isGrid ? "relative" : "absolute"}
        ${config.size} ${config.opacity} ${config.blur} ${config.scale}
        transition-all duration-500 ease-out cursor-pointer drop-shadow-xl
      `}
      onClick={(e) => {
        e.stopPropagation();
        onClick(message);
      }}
    >
      <svg viewBox="0 0 100 150" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#ffeccc" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#fda458" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#8a3512" stopOpacity="0.9" />
          </radialGradient>
        </defs>

        <ellipse cx="50" cy="15" rx="32" ry="6" fill="#8a3810" />

        <path
          d="M15 15 L18 135 A 32 8 0 0 0 82 135 L85 15"
          fill="url(#glow)"
        />

        <g className="animate-pulse">
          <circle cx="50" cy="90" r="22" fill="#ffdf70" opacity="0.8" />
          <ellipse cx="50" cy="95" rx="14" ry="4" fill="#ffae32" opacity="0.5" />
        </g>

        <ellipse cx="50" cy="135" rx="30" ry="8" fill="#5e260a" fillOpacity="0.3" />
      </svg>

      {isRevealed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center">
          <p className="text-lg text-amber-50 italic drop-shadow-md leading-snug">
            {message.text}
          </p>
          <p className="mt-2 text-xs tracking-widest text-amber-200 font-bold uppercase">
            — {message.sender}
          </p>
        </div>
      )}

      {isGrid && label && (
        <div className="absolute bottom-2 w-full text-center">
          <div className="bg-amber-100/90 px-2 py-1 rounded-md text-[10px] text-amber-900 font-bold uppercase tracking-wide shadow">
            {label}
          </div>
        </div>
      )}
    </div>
  );
};

export default Lantern;
