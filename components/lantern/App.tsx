// components/lantern/App.tsx
import React, { useEffect, useRef, useState } from "react";
import Lantern from "./components/Lantern";
import { IntroGate } from "./components/IntroGate";
import { ArchiveView } from "./components/ArchiveView";
import { useAppData } from "../../AppContext";
import { AudioController } from "./utils/audio";

// Stable hash for consistent positions/speeds
const stable = (id: string, salt = "") => {
  let h = 0;
  const s = id + salt;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
};

const enrich = (l: any) => {
  const b = stable(String(l.id));
  const left = (b % 80) + 5;
  const speed = 15 + (b % 30);
  const delay = -(b % 10);
  const depth = ["near", "mid", "far"][b % 3];
  return { ...l, left, speed, delay, depth };
};

export default function LanternApp() {
  const { lanterns = [], savedLanterns = [], saveLantern, refreshData } = useAppData();

  const [hasEntered, setHasEntered] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const audio = useRef<AudioController | null>(null);

  const far = useRef<HTMLDivElement>(null);
  const mid = useRef<HTMLDivElement>(null);
  const near = useRef<HTMLDivElement>(null);

  // Always fetch fresh lanterns when opened
  useEffect(() => {
    try { refreshData(); } catch {}
  }, [refreshData]);

  const enriched = lanterns.map(enrich);

  const handleStartEntry = () => {
    audio.current = new AudioController();
    audio.current.init();
    audio.current.playDoorOpen?.();
  };

  const handleEntryComplete = () => {
    setHasEntered(true);
    audio.current?.playAmbientWind?.();
  };

  const handleLanternClick = (l: any) => {
    if (showArchive) return;
    setSelected(l);
    audio.current?.playLanternClick?.();
  };

  const handleRelease = (l: any) => {
    try { saveLantern(String(l.id)); } catch {}
    setSelected(null);
    audio.current?.playLanternClick?.();
  };

  const mouseMove = (e: React.MouseEvent) => {
    if (!hasEntered || showArchive) return;

    const w = e.currentTarget.clientWidth;
    const h = e.currentTarget.clientHeight;
    const x = (e.clientX / w - 0.5) * 2;
    const y = (e.clientY / h - 0.5) * 2;

    if (far.current) far.current.style.transform = `translate(${x*-15}px, ${y*-15}px)`;
    if (mid.current) mid.current.style.transform = `translate(${x*-35}px, ${y*-35}px)`;
    if (near.current) near.current.style.transform = `translate(${x*-60}px, ${y*-60}px)`;
  };

  return (
    <div className="relative w-full h-[100vh] overflow-hidden bg-[#0f0518]">

      {!hasEntered && (
        <IntroGate onStartOpen={handleStartEntry} onEnter={handleEntryComplete} />
      )}

      <div className={`relative w-full h-full transition-opacity duration-700 ${hasEntered ? "opacity-100" : "opacity-0"}`}>
        
        {/* LANTERN SKY */}
        <div className="absolute inset-0" ref={far}>
          {enriched.filter(l=>l.depth==="far").map(l=>(
            <div key={l.id}
              className="absolute z-10 flex flex-col"
              style={{
                left: `${l.left}%`,
                top: "100%",
                animation: `float-up ${l.speed}s linear infinite`,
                animationDelay: `${l.delay}s`,
              }}
              onClick={() => handleLanternClick(l)}
            >
              <Lantern message={l} />
            </div>
          ))}
        </div>

        <div className="absolute inset-0" ref={mid}>
          {enriched.filter(l=>l.depth==="mid").map(l=>(
            <div key={l.id}
              className="absolute z-20 flex flex-col"
              style={{
                left: `${l.left}%`,
                top: "100%",
                animation: `float-up ${l.speed}s linear infinite`,
                animationDelay: `${l.delay}s`,
              }}
              onClick={() => handleLanternClick(l)}
            >
              <Lantern message={l} />
            </div>
          ))}
        </div>

        <div className="absolute inset-0" ref={near}>
          {enriched.filter(l=>l.depth==="near").map(l=>(
            <div key={l.id}
              className="absolute z-30 flex flex-col"
              style={{
                left: `${l.left}%`,
                top: "100%",
                animation: `float-up ${l.speed}s linear infinite`,
                animationDelay: `${l.delay}s`,
              }}
              onClick={() => handleLanternClick(l)}
            >
              <Lantern message={l} />
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selected && (
          <div
            className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelected(null)}
          >
            <div className="bg-[#1a0a25] p-6 rounded-2xl" onClick={(e)=>e.stopPropagation()}>
              <Lantern message={selected} isRevealed />
              <h3 className="text-xl font-bold text-amber-100 mt-6">{selected.sender}</h3>
              <p className="text-white/80 mt-2 max-w-sm">{selected.text}</p>

              <div className="flex gap-3 justify-center mt-6">
                <button onClick={()=>setSelected(null)} className="px-4 py-2 rounded-xl bg-white/10">
                  Close
                </button>
                <button onClick={()=>handleRelease(selected)} className="px-4 py-2 rounded-xl bg-amber-500 text-black">
                  Release & Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ARCHIVE (Hidden until opened manually) */}
        {showArchive && (
          <ArchiveView
            onClose={() => setShowArchive(false)}
            messages={savedLanterns.map(enrich)}
            onSelectMessage={(m)=>{
              setShowArchive(false);
              setSelected(m);
              audio.current?.playLanternClick?.();
            }}
          />
        )}

      </div>

      {/* mouse parallax */}
      <div className="absolute inset-0" onMouseMove={mouseMove} />
    </div>
  );
}
