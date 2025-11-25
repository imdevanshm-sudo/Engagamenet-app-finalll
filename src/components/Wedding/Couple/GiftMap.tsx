import React, { useState, useRef, useMemo } from "react";
import { LayoutGrid, Gift, X } from "lucide-react";
import { useAppData } from "../../../AppContext";
import { AudioController } from "/home/user/engagement-app2/components/lantern/utils/audio.ts";
import { IntroGate } from "/home/user/engagement-app2/components/lantern/components/IntroGate.tsx";
import { Background } from "/home/user/engagement-app2/components/lantern/components/Background.tsx";
import { ArchiveView } from "/home/user/engagement-app2/components/lantern/components/ArchiveView.tsx";
import { Lantern } from "/home/user/engagement-app2/components/lantern/components/Lantern.tsx";

interface GiftMapProps {
  onClose: () => void;
}

export default function GiftMap({ onClose }: GiftMapProps) {
  // Use 'any' to bypass strict context type checking for savedLanterns if needed
  const { lanterns, savedLanterns, saveLantern, config } = useAppData() as any; 
  
  const [hasEntered, setHasEntered] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);

  const audioRef = useRef<AudioController | null>(null);
  const farLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const nearLayerRef = useRef<HTMLDivElement>(null);

  const coupleName = config?.coupleName ?? "The Couple";

  const isGuest = (l: any) => {
      const sender = String(l.sender || "");
      return sender !== String(coupleName) && sender !== "Aman" && sender !== "Sneha";
  };

  const adaptLantern = (l: any) => ({
      ...l,
      text: l.message || l.text || "A wish for love...",
      depth: l.depth || "mid",
      xValues: l.xValues || Math.random() * 90,
      speed: l.speed || 20,
      delay: l.delay || 0
  });

  const floatingLanterns = useMemo(() => {
      return (Array.isArray(lanterns) ? lanterns : []).filter(isGuest).map(adaptLantern);
  }, [lanterns]);

  const archiveLanterns = useMemo(() => {
      const active = Array.isArray(lanterns) ? lanterns : [];
      const saved = Array.isArray(savedLanterns) ? savedLanterns : [];
      const combined = [...active, ...saved];
      const uniqueMap = new Map();
      combined.forEach(item => uniqueMap.set(item.id, item));
      return Array.from(uniqueMap.values()).filter(isGuest).map(adaptLantern);
  }, [lanterns, savedLanterns]);

  const handleStartEntry = () => {
    audioRef.current = new AudioController();
    audioRef.current.init();
    audioRef.current.playDoorOpen();
  };

  const handleEntryComplete = () => {
    setHasEntered(true);
    audioRef.current?.playAmbientWind();
  };

  const handleLanternClick = (msg: any) => {
    if (showArchive) return;
    setSelectedMessage(msg);
    audioRef.current?.playLanternClick();
  };

  const handleArchiveSelection = (msg: any) => {
    setShowArchive(false);
    setSelectedMessage(msg);
    audioRef.current?.playLanternClick();
  };

  const handleCloseModal = (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setSelectedMessage(null);
  };

  const handleSaveAndClose = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (selectedMessage?.id) {
          saveLantern(selectedMessage.id); 
      }
      handleCloseModal();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!hasEntered || showArchive || selectedMessage) return;
    const { clientX, clientY, currentTarget } = e;
    const width = currentTarget.clientWidth;
    const height = currentTarget.clientHeight;
    const x = (clientX / width - 0.5) * 2;
    const y = (clientY / height - 0.5) * 2;
    if (farLayerRef.current) farLayerRef.current.style.transform = `translate(${x * -15}px, ${y * -15}px)`;
    if (midLayerRef.current) midLayerRef.current.style.transform = `translate(${x * -35}px, ${y * -35}px)`;
    if (nearLayerRef.current) nearLayerRef.current.style.transform = `translate(${x * -60}px, ${y * -60}px)`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0518] overflow-hidden font-serif text-white">
      {!hasEntered && <IntroGate onStartOpen={handleStartEntry} onEnter={handleEntryComplete} />}
      <div className={`relative w-full h-full transition-opacity duration-[2000ms] ${hasEntered ? 'opacity-100' : 'opacity-0'}`}>
        <Background />
        <div className="absolute top-6 left-6 z-[60]"><button onClick={onClose} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all"><X size={22} /></button></div>
        <div className="absolute top-6 right-6 z-[60]"><button onClick={() => setShowArchive(true)} className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-amber-100/80 transition-all duration-300 group shadow-[0_0_15px_rgba(255,255,255,0.05)]"><LayoutGrid size={22} className="group-hover:scale-110 transition-transform" /></button></div>

        <main className="w-full h-full relative overflow-hidden touch-none perspective-1000" onMouseMove={handleMouseMove}>
           {floatingLanterns.length === 0 && hasEntered && <div className="absolute inset-0 flex flex-col items-center justify-center text-white/30 gap-4 pointer-events-none"><Gift size={48} className="opacity-20" /><p className="italic text-sm">No lanterns from guests yet...</p></div>}
           <div className="absolute inset-0 top-0 -bottom-[20vh] transition-transform duration-100 ease-out pointer-events-none" ref={farLayerRef}>
              {floatingLanterns.filter((m: any) => m.depth === 'far').map((msg: any) => <Lantern key={msg.id} message={msg} onClick={handleLanternClick} />)}
           </div>
           <div className="absolute inset-0 top-0 -bottom-[20vh] transition-transform duration-100 ease-out pointer-events-none" ref={midLayerRef}>
              {floatingLanterns.filter((m: any) => !m.depth || m.depth === 'mid').map((msg: any) => <Lantern key={msg.id} message={msg} onClick={handleLanternClick} />)}
           </div>
           <div className="absolute inset-0 top-0 -bottom-[20vh] transition-transform duration-100 ease-out pointer-events-none" ref={nearLayerRef}>
              {floatingLanterns.filter((m: any) => m.depth === 'near').map((msg: any) => <Lantern key={msg.id} message={msg} onClick={handleLanternClick} />)}
           </div>
        </main>

        {selectedMessage && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-all duration-1000 cursor-pointer" onClick={() => setSelectedMessage(null)}>
            <div className="relative flex flex-col items-center animate-[floatUp_0.8s_ease-out_forwards] pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <div className="relative">
                <div className="transform scale-90 md:scale-125 transition-transform duration-700 hover:scale-95 md:hover:scale-[1.3]">
                  <Lantern message={selectedMessage} onClick={() => {}} isRevealed={true} />
                </div>
              </div>
              <div className="mt-12 flex gap-4 animate-[fadeIn_2s_ease-in]">
                  <button onClick={handleSaveAndClose} className="px-6 py-2 bg-amber-500 text-black font-serif font-bold rounded-full hover:bg-amber-400 transition-colors shadow-[0_0_20px_rgba(245,158,11,0.4)]">Release & Save</button>
                  <button onClick={() => setSelectedMessage(null)} className="px-6 py-2 bg-white/10 text-white font-serif rounded-full hover:bg-white/20 transition-colors">Close</button>
              </div>
            </div>
          </div>
        )}

        {showArchive && <ArchiveView onClose={() => setShowArchive(false)} messages={archiveLanterns} onSelectMessage={handleArchiveSelection} />}
      </div>
    </div>
  );
}