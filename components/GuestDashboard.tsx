import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { 
  Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, 
  ChevronRight, LogOut, Sparkles, Music, Map, User, Send, 
  Smile, X, Image as ImageIcon, Upload, Navigation, Users, LocateFixed, Plane
} from 'lucide-react';

// --- Types & Assets (Same as before) ---
interface Message {
    id: string;
    text?: string;
    stickerKey?: string;
    sender: string;
    isCouple: boolean;
    timestamp: string;
    type: 'text' | 'sticker';
}

interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
    timestamp: number;
}

const FloralPattern = ({ className, opacity = 0.1 }: { className?: string, opacity?: number }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }}>
    <svg width="100%" height="100%">
      <pattern id="floral-pat" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M20,0 C25,10 35,10 40,0 C30,5 30,15 40,20 C30,25 30,35 40,40 C35,30 25,30 20,40 C25,30 15,30 10,40 C10,30 10,20 0,20 C10,15 10,5 0,0 C5,10 15,10 20,0 Z" fill="currentColor" />
      </pattern>
      <rect width="100%" height="100%" fill="url(#floral-pat)" />
    </svg>
  </div>
);

const FloralCorner = ({ className, rotate = 0 }: { className?: string, rotate?: number }) => (
  <svg viewBox="0 0 100 100" className={className} style={{ transform: `rotate(${rotate}deg)` }}>
    <path d="M0,0 C30,0 40,10 50,30 C60,10 90,0 100,0 C90,20 80,40 60,50 C80,60 90,90 100,100 C70,90 60,80 50,60 C40,80 10,90 0,100 C10,70 20,60 40,50 C20,40 10,20 0,0 Z" fill="#cd7f7f" opacity="0.9" />
    <path d="M10,10 Q30,10 40,25 Q25,40 10,40 Q10,25 10,10" fill="#e3c98d" opacity="0.8" />
    <path d="M0,0 L20,0 L0,20 Z" fill="#881337" />
    <circle cx="25" cy="25" r="4" fill="#fff" fillOpacity="0.6" />
  </svg>
);

const StickerKalash = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M30,80 Q30,95 50,95 Q70,95 70,80 L75,40 Q80,30 50,30 Q20,30 25,40 Z" fill="#b45309" stroke="#78350f" strokeWidth="2"/><path d="M30,40 Q50,50 70,40" stroke="#fcd34d" strokeWidth="3" fill="none"/><circle cx="50" cy="60" r="10" fill="#fcd34d" /><path d="M50,30 L50,20 M40,30 L35,15 M60,30 L65,15" stroke="#15803d" strokeWidth="3"/><circle cx="50" cy="15" r="8" fill="#fbbf24"/></svg>);
const StickerShehnai = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M20,80 L80,20 L90,30 L30,90 Z" fill="#92400e" /><circle cx="25" cy="85" r="12" fill="#fbbf24" stroke="#b45309" strokeWidth="2"/><circle cx="25" cy="85" r="6" fill="#000" opacity="0.3"/><path d="M35,65 L40,60 M50,50 L55,45 M65,35 L70,30" stroke="#fbbf24" strokeWidth="3"/></svg>);
const StickerSagai = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><defs><radialGradient id="ringGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#fff" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs><path d="M20,65 Q20,95 50,95 Q80,95 80,65 L80,55 Q50,45 20,55 Z" fill="#be123c" stroke="#881337" strokeWidth="2"/><path d="M20,55 Q50,45 80,55 Q50,65 20,55" fill="#9f1239" /><circle cx="50" cy="45" r="12" fill="none" stroke="#fbbf24" strokeWidth="4" /><circle cx="50" cy="33" r="4" fill="#fff" filter="url(#ringGlow)"/><path d="M50,33 L50,33" stroke="#fff" strokeWidth="2" className="animate-pulse"/><text x="50" y="85" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#fbbf24" fontWeight="bold">Sagai</text></svg>);
const StickerJodi = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M50,85 L20,55 Q5,40 20,25 Q35,10 50,35 Q65,10 80,25 Q95,40 65,55 Z" fill="#be123c" stroke="#9f1239" strokeWidth="2" /><text x="50" y="45" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#fff" fontWeight="bold">Jodi</text><text x="50" y="60" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#fbbf24" fontWeight="bold">No. 1</text></svg>);
const StickerBadhai = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><rect x="10" y="30" width="80" height="40" rx="5" fill="#fef3c7" stroke="#d97706" strokeWidth="2"/><text x="50" y="52" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#b45309" fontWeight="bold">Badhai</text><text x="50" y="67" textAnchor="middle" fontFamily="serif" fontSize="14" fill="#b45309" fontWeight="bold">Ho!</text><circle cx="15" cy="35" r="3" fill="#ef4444" /><circle cx="85" cy="35" r="3" fill="#ef4444" /><circle cx="15" cy="65" r="3" fill="#ef4444" /><circle cx="85" cy="65" r="3" fill="#ef4444" /></svg>);
const StickerSwagat = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M10,30 Q50,100 90,30" fill="none" stroke="#ea580c" strokeWidth="12" strokeLinecap="round" strokeDasharray="1,12" /><path d="M10,30 Q50,100 90,30" fill="none" stroke="#facc15" strokeWidth="12" strokeLinecap="round" strokeDasharray="1,12" strokeDashoffset="6"/><text x="50" y="50" textAnchor="middle" fontFamily="serif" fontSize="16" fill="#4a0e11" fontWeight="bold">Swagat</text><text x="50" y="65" textAnchor="middle" fontFamily="serif" fontSize="12" fill="#4a0e11">Hai</text></svg>);
const StickerNazar = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M10,50 Q50,20 90,50 Q50,80 10,50 Z" fill="#fff" stroke="#000" strokeWidth="2"/><circle cx="50" cy="50" r="18" fill="#3b82f6" /><circle cx="50" cy="50" r="10" fill="#000" /><circle cx="55" cy="45" r="4" fill="#fff" /><text x="50" y="90" textAnchor="middle" fontFamily="serif" fontSize="10" fill="#000">Nazar Na Lage</text></svg>);
const StickerElephant = () => (<svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md"><path d="M20,60 Q20,30 50,30 Q80,30 80,60 L80,90 L70,90 L70,70 L60,70 L60,90 L50,90" fill="#94a3b8"/><path d="M20,60 Q10,70 20,80" stroke="#94a3b8" strokeWidth="4" fill="none"/><rect x="40" y="30" width="20" height="20" fill="#b91c1c"/><circle cx="35" cy="45" r="2" fill="#000"/></svg>);

const STICKER_MAP: Record<string, React.ReactNode> = {
    'sagai': <StickerSagai />,
    'badhai': <StickerBadhai />,
    'jodi': <StickerJodi />,
    'swagat': <StickerSwagat />,
    'nazar': <StickerNazar />,
    'kalash': <StickerKalash />,
    'shehnai': <StickerShehnai />,
    'gajraj': <StickerElephant />,
};

const MapTree = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path d="M50,80 L50,100" stroke="#5D4037" strokeWidth="8" />
    <path d="M20,80 Q10,60 30,40 Q10,30 40,10 Q70,30 60,40 Q90,60 80,80 Q50,90 20,80 Z" fill="#4a7c59" stroke="#33523f" strokeWidth="2" />
    <circle cx="30" cy="50" r="3" fill="#ef4444" opacity="0.6" />
    <circle cx="60" cy="30" r="3" fill="#ef4444" opacity="0.6" />
    <circle cx="70" cy="60" r="3" fill="#ef4444" opacity="0.6" />
  </svg>
);

const MapElephant = ({ className, flip }: { className?: string, flip?: boolean }) => (
  <svg viewBox="0 0 100 60" className={className} style={{ transform: flip ? 'scaleX(-1)' : 'none' }}>
      <path d="M20,40 C10,40 10,20 30,15 C40,10 60,10 75,20 C85,25 90,40 90,50 L85,50 L85,40 L75,40 L75,50 L65,50 L65,40 L40,40" fill="#5D4037" />
      <path d="M20,40 Q25,50 15,55" stroke="#5D4037" strokeWidth="3" fill="none" />
      <rect x="40" y="15" width="25" height="20" fill="#c05621" rx="2" />
      <path d="M40,15 L65,15 L65,35 L40,35 Z" fill="url(#elephantPattern)" fillOpacity="0.5" />
      <defs>
      <pattern id="elephantPattern" width="4" height="4" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#fcd34d" />
      </pattern>
      </defs>
  </svg>
);

const CityMapBackground = () => (
    <div className="absolute inset-0 bg-[#e0f2fe] overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 bottom-0 w-[65%] bg-[#ecfccb] border-l-[6px] border-[#d9f99d] rounded-l-[50px] shadow-xl opacity-80"></div>
        <div className="absolute left-0 top-0 bottom-0 w-[35%] opacity-20" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <svg className="absolute inset-0 w-full h-full">
            <path d="M 85 5 L 85 30 Q 85 50 60 50 L 50 50" fill="none" stroke="#94a3b8" strokeWidth="16" strokeLinecap="round" />
            <path d="M 85 5 L 85 30 Q 85 50 60 50 L 50 50" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeDasharray="10 10" />
            <path d="M 50 50 Q 20 50 20 80 L 20 90" fill="none" stroke="#3b82f6" strokeWidth="14" strokeLinecap="round" />
            <path d="M 50 50 Q 20 50 20 80 L 20 90" fill="none" stroke="#60a5fa" strokeWidth="10" strokeLinecap="round" />
        </svg>
        <div className="absolute top-6 right-[10%] flex flex-col items-center animate-pulse">
             <Plane className="text-slate-600 rotate-45" size={24} />
             <span className="text-[9px] font-bold text-slate-700 bg-white/90 px-1 rounded shadow-sm">Airport</span>
        </div>
        <div className="absolute bottom-12 left-[15%] flex flex-col items-center">
             <div className="w-12 h-12 bg-rose-500/30 rounded-full animate-ping absolute"></div>
             <div className="bg-white p-1.5 rounded-full shadow-lg z-10">
                <MapPin className="text-rose-600" size={24} fill="#e11d48" />
             </div>
             <span className="text-[10px] font-bold text-white bg-rose-600 px-2 py-0.5 rounded shadow-sm mt-1">Taj Lands End</span>
        </div>
    </div>
);

const MapNode: React.FC<{ x: number; y: number; name: string; delay?: number; phone?: string; type?: 'guest' | 'couple' }> = ({ x, y, name, delay = 0, phone, type = 'guest' }) => {
    return (
        <div 
            className="absolute flex flex-col items-center z-20 group animate-zoom-in cursor-pointer transition-all duration-500"
            style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', animationDelay: `${delay}ms` }}
        >
            <div 
              className={`relative rounded-full shadow-[0_25px_35px_-5px_rgba(0,0,0,0.7),0_0_0_2px_${type === 'couple' ? '#e11d48' : '#fbbf24'}] transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-4 w-16 h-16 p-[4px] ${type === 'couple' ? 'bg-rose-950' : 'bg-[#1a0405]'}`}
              style={{ transform: 'perspective(500px) rotateX(10deg)' }}
            >
                <div className={`w-full h-full rounded-full border ${type === 'couple' ? 'border-rose-400' : 'border-gold-500/30'} overflow-hidden relative bg-[#2d0a0d] flex items-center justify-center`}>
                    {type === 'couple' ? (
                        <Heart size={24} className="text-rose-500 fill-rose-500 animate-pulse" />
                    ) : (
                        <Users size={24} className="text-gold-300 opacity-80" />
                    )}
                </div>
                {type === 'couple' && (
                     <div className="absolute inset-0 rounded-full border-2 border-rose-500 animate-ping opacity-50"></div>
                )}
            </div>
            <div className={`mt-4 px-4 py-1 ${type === 'couple' ? 'bg-rose-900/90 border-rose-500' : 'bg-[#4a0e11]/90 border-[#f59e0b]/50'} backdrop-blur-md rounded-full border shadow-[0_8px_16px_rgba(0,0,0,0.6)] transform transition-transform group-hover:scale-105 group-hover:-translate-y-1`}>
                <span className="text-[#fef3c7] text-xs sm:text-sm font-serif font-bold whitespace-nowrap tracking-wide drop-shadow-sm">{name}</span>
            </div>
            <div className="absolute top-[90%] left-1/2 w-1 h-8 bg-black/30 -translate-x-1/2 blur-[2px] origin-top transform skew-x-[20deg] z-[-1]"></div>
        </div>
    );
};

// --- Components ---

const LoveThermometer = ({ count, onTrigger }: { count: number, onTrigger: () => void }) => {
    const fillPercent = Math.min(100, Math.max(10, (count * 5) % 110)); 
    const [hearts, setHearts] = useState<Array<{id: number, type: 'heart'|'ring'|'diamond', x: number}>>([]);

    const handleClick = () => {
        onTrigger();
        const id = Date.now();
        const types: ('heart'|'ring'|'diamond')[] = ['heart', 'ring', 'diamond'];
        const type = types[Math.floor(Math.random() * types.length)];
        const x = Math.random() * 40 - 20; 
        setHearts(prev => [...prev, { id, type, x }]);
        setTimeout(() => setHearts(prev => prev.filter(h => h.id !== id)), 2000);
    };

    return (
        <div className="flex flex-col items-center pointer-events-auto animate-fade-in delay-500" onClick={handleClick}>
            <div className="absolute bottom-full w-24 h-40 pointer-events-none overflow-hidden -z-10 left-1/2 -translate-x-1/2">
                 {hearts.map(h => (
                     <div key={h.id} className="absolute bottom-0 left-1/2 animate-sidebar-float text-rose-500 drop-shadow-lg" style={{ '--x': `${h.x}px` } as React.CSSProperties}>
                         {h.type === 'heart' && <Heart size={20} fill="currentColor" />}
                         {h.type === 'ring' && <div className="w-5 h-5 border-2 border-yellow-400 rounded-full"></div>}
                         {h.type === 'diamond' && <div className="w-4 h-4 bg-blue-400 rotate-45"></div>}
                     </div>
                 ))}
            </div>

            <div className="relative w-12 h-40 cursor-pointer group transition-transform active:scale-95 hover:scale-105 duration-300">
                <svg viewBox="0 0 60 200" className="absolute inset-0 w-full h-full drop-shadow-2xl">
                    <path d="M30,190 C45,190 55,180 55,165 L55,35 C55,15 45,5 30,5 C15,5 5,15 5,35 L5,165 C5,180 15,190 30,190 Z" fill="#fffbf5" stroke="#b45309" strokeWidth="2"/>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <line key={i} x1="20" y1={35 + i * 18} x2="40" y2={35 + i * 18} stroke="#d6d3d1" strokeWidth="1" />
                    ))}
                    <circle cx="30" cy="165" r="18" fill="#fffbf5" stroke="#b45309" strokeWidth="2" />
                    <path d="M30,5 C40,5 50,15 50,25" fill="none" stroke="#fbbf24" strokeWidth="2" opacity="0.5"/>
                </svg>
                <div className="absolute bottom-[26px] left-[10px] right-[10px] bg-stone-100 rounded-t-full overflow-hidden h-[130px] w-[28px] ml-auto mr-auto z-10">
                    <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 transition-all duration-700 ease-out flex items-start justify-center pt-1"
                        style={{ height: `${fillPercent}%` }}
                    >
                         <div className="w-full h-2 bg-white/30 animate-pulse blur-[1px]"></div>
                    </div>
                </div>
                <div className="absolute bottom-[7px] left-[11px] w-[26px] h-[26px] rounded-full bg-gradient-to-br from-rose-500 to-rose-700 z-20 shadow-inner flex items-center justify-center">
                    <Heart size={14} fill="#fcd34d" className="text-gold-300 animate-pulse" />
                </div>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[8px] font-bold text-gold-200 tracking-widest uppercase shadow-sm border border-gold-500/30">
                Tap Me
            </div>
        </div>
    );
};

const ChatView = ({ userName, heartCount, triggerHeart }: { userName: string, heartCount: number, triggerHeart: () => void }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState<'emoji' | 'sticker' | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('wedding_chat_messages');
        if (saved) setMessages(JSON.parse(saved));

        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.onmessage = (event) => {
            if (event.data.type === 'message') {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === event.data.payload.id);
                    return exists ? prev : [...prev, event.data.payload];
                });
            }
        };
        return () => channel.close();
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const sendMessage = (text: string = "", stickerKey?: string) => {
        if (!text && !stickerKey) return;
        const newMsg: Message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            text,
            stickerKey,
            sender: userName,
            isCouple: false,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: stickerKey ? 'sticker' : 'text'
        };

        const updated = [...messages, newMsg];
        setMessages(updated);
        localStorage.setItem('wedding_chat_messages', JSON.stringify(updated));
        
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'message', payload: newMsg });
        channel.close();

        setInputText("");
        setActiveTab(null);
    };

    return (
        <div className="flex flex-col h-full relative animate-fade-in">
            <div className="bg-[#4a0e11] p-4 text-white shadow-md z-20 flex justify-between items-center">
                <div>
                    <h2 className="font-serif font-bold text-lg flex items-center gap-2"><MessageSquare size={18} className="text-gold-400"/> Guest Book</h2>
                    <p className="text-xs text-gold-400 opacity-70">Share your wishes with the couple!</p>
                </div>
                <div className="text-xs text-gold-200 font-mono bg-black/20 px-2 py-1 rounded">
                    {heartCount} ❤️
                </div>
            </div>
            
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#fffbf5] pb-32">
                {messages.map((msg, i) => {
                    const isMe = msg.sender === userName;
                    return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`} style={{ animationDelay: `${i * 50}ms` }}>
                            {!isMe && (
                                <span className="text-[10px] text-stone-500 ml-1 mb-0.5 font-bold">
                                    {msg.sender} {msg.isCouple && <span className="text-rose-500">(Couple)</span>}
                                </span>
                            )}
                            <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-serif shadow-sm hover:shadow-md transition-shadow ${
                                msg.type === 'sticker' ? 'bg-transparent shadow-none p-0' :
                                isMe ? 'bg-[#4a0e11] text-gold-100 rounded-tr-sm' : 
                                msg.isCouple ? 'bg-rose-100 text-rose-900 border border-rose-200' : 'bg-white text-stone-800 border border-stone-100 rounded-tl-sm'
                            }`}>
                                {msg.type === 'sticker' && msg.stickerKey ? (
                                    <div className="w-24 h-24">{STICKER_MAP[msg.stickerKey]}</div>
                                ) : msg.text}
                            </div>
                            <span className="text-[9px] text-stone-300 mt-1 mx-1">{msg.timestamp}</span>
                        </div>
                    );
                })}
            </div>

            {/* Love Bar Floating on the Right */}
            <div className="absolute right-2 bottom-20 z-40">
                <LoveThermometer count={heartCount} onTrigger={triggerHeart} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-stone-100 relative z-50">
                {activeTab && (
                    <div className="absolute bottom-full left-0 right-0 bg-[#fffbf5] border-t border-gold-300 h-56 shadow-2xl animate-slide-up z-0 flex flex-col">
                        <div className="flex border-b border-gold-200">
                            <button onClick={() => setActiveTab('emoji')} className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'emoji' ? 'bg-maroon-50 text-maroon-900 border-b-2 border-maroon-900' : 'text-stone-500'}`}>Emojis</button>
                            <button onClick={() => setActiveTab('sticker')} className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'sticker' ? 'bg-maroon-50 text-maroon-900 border-b-2 border-maroon-900' : 'text-stone-500'}`}>Stickers</button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-4">
                           {activeTab === 'sticker' ? (
                               <div className="grid grid-cols-3 gap-4">
                                    {Object.keys(STICKER_MAP).map((key) => (
                                        <button key={key} onClick={() => sendMessage(undefined, key)} className="hover:scale-110 transition-transform p-2 bg-white rounded-lg shadow-sm border border-stone-100">
                                            <div className="w-full aspect-square">{STICKER_MAP[key]}</div>
                                        </button>
                                    ))}
                               </div>
                           ) : (
                               <div className="grid grid-cols-6 gap-2 text-2xl">
                                   {["❤️", "🎉", "👏", "🔥", "🥰", "😍", "🥂", "💍", "🕺", "💃", "✨", "🌸"].map(emoji => (
                                       <button key={emoji} onClick={() => setInputText(prev => prev + emoji)} className="hover:bg-stone-100 rounded p-2 transition-colors transform hover:scale-125">{emoji}</button>
                                   ))}
                               </div>
                           )}
                        </div>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab(activeTab ? null : 'sticker')} className="p-2 text-stone-400 hover:text-maroon-600 transition-colors"><Smile size={24}/></button>
                    <input 
                        type="text" 
                        value={inputText} 
                        onChange={e => setInputText(e.target.value)}
                        onFocus={() => setActiveTab(null)}
                        className="flex-grow bg-stone-50 border border-stone-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-maroon-300 transition-colors"
                        placeholder="Write a message..."
                        onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
                    />
                    <button onClick={() => sendMessage(inputText)} className="p-2 bg-[#4a0e11] text-gold-100 rounded-full hover:scale-105 active:scale-95 transition-transform"><Send size={18}/></button>
                </div>
            </div>
        </div>
    );
};

const GalleryView = () => {
    const [photos, setPhotos] = useState<MediaItem[]>([]);
    
    useEffect(() => {
        const saved = localStorage.getItem('wedding_gallery_media');
        if (saved) setPhotos(JSON.parse(saved));
    }, []);

    const handleUpload = () => {
        const newPhoto: MediaItem = {
             id: Date.now().toString(),
             url: `https://source.unsplash.com/random/400x400?wedding,party&sig=${Date.now()}`, // Simulation
             type: 'image',
             caption: 'Guest Upload',
             timestamp: Date.now()
        }
        const updated = [newPhoto, ...photos];
        setPhotos(updated);
        localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
    };

    return (
        <div className="h-full flex flex-col bg-[#1a0507] animate-fade-in">
            <div className="p-6 pb-2 border-b border-white/10">
                <h2 className="text-gold-100 font-heading text-2xl animate-fade-in-up">Moments</h2>
                <p className="text-gold-400 text-xs animate-fade-in-up delay-100">Captured by friends & family</p>
            </div>
            <div className="flex-grow overflow-y-auto p-4 grid grid-cols-2 gap-3">
                <button onClick={handleUpload} className="aspect-square rounded-xl border-2 border-dashed border-gold-500/30 flex flex-col items-center justify-center gap-2 text-gold-400 hover:bg-white/5 transition-colors animate-zoom-in group">
                    <Upload size={24} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold uppercase tracking-wide">Add Photo</span>
                </button>
                {photos.map((photo, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group animate-zoom-in shadow-lg" style={{ animationDelay: `${i*100}ms` }}>
                        <img src={photo.url} alt="Gallery" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-white text-[10px]">{photo.caption}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MapView = ({ userName }: { userName: string }) => {
    const [activeUsers, setActiveUsers] = useState<Record<string, any>>({});
    const [myLocation, setMyLocation] = useState({ x: 50, y: 80 }); 
    const [viewMode, setViewMode] = useState<'venue' | 'city'>('venue');

    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        channel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({ ...prev, [data.id]: data }));
            }
        };

        const simulatedGuests = [
            { id: 'g1', name: 'Ravi', x: 20, y: 50, role: 'guest', map: 'venue' },
            { id: 'g2', name: 'Priya', x: 80, y: 80, role: 'guest', map: 'venue' },
            { id: 'g3', name: 'Amit', x: 50, y: 20, role: 'guest', map: 'venue' },
            { id: 'g4', name: 'Uncle', x: 85, y: 15, role: 'guest', map: 'city' },
            { id: 'g5', name: 'Aunt', x: 20, y: 80, role: 'guest', map: 'city' },
        ];
        simulatedGuests.forEach(g => setActiveUsers(prev => ({ ...prev, [g.id]: g })));

        return () => channel.close();
    }, []);

    const updateLocation = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        setMyLocation({ x, y });

        const channel = new BroadcastChannel('wedding_live_map');
        channel.postMessage({ 
            type: 'location_update', 
            id: userName, 
            name: userName, 
            x, y, 
            role: 'guest',
            map: viewMode
        });
        channel.close();
        
        setActiveUsers(prev => ({ ...prev, [userName]: { id: userName, name: userName, x, y, role: 'guest', map: viewMode } }));
    };

    const VENUE_ZONES = [
        { name: "Grand Stage", x: 50, y: 20, w: 30, h: 15, color: "#be123c" },
        { name: "Mandap", x: 80, y: 50, w: 20, h: 20, color: "#b45309" },
        { name: "Royal Dining", x: 20, y: 50, w: 25, h: 25, color: "#15803d" },
        { name: "Entrance", x: 50, y: 90, w: 20, h: 10, color: "#4a0e11" },
        { name: "Bar", x: 80, y: 80, w: 15, h: 15, color: "#1d4ed8" },
    ];

    return (
        <div className="h-full bg-[#f5f5f4] relative overflow-hidden flex flex-col animate-fade-in">
             {/* Top Bar with Toggle */}
             <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 animate-slide-up">
                 <div className="bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-stone-200 flex justify-between items-center">
                     <div>
                         <h3 className="font-bold text-[#4a0e11] text-sm flex items-center gap-2"><MapPin size={16} className="text-rose-500"/> {viewMode === 'venue' ? 'Venue Map' : 'Journey Tracker'}</h3>
                         <p className="text-[10px] text-stone-500">Tap to set your location.</p>
                     </div>
                     <button onClick={() => updateLocation({ currentTarget: document.querySelector('.map-container') } as any)} className="bg-gold-100 p-2 rounded-full text-[#4a0e11] hover:bg-gold-200 active:scale-95 transition-transform"><LocateFixed size={18}/></button>
                 </div>
                 
                 <div className="bg-black/40 backdrop-blur-md rounded-full p-1 flex border border-gold-500/30 self-center shadow-lg">
                     <button 
                        onClick={() => setViewMode('venue')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'venue' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-300 hover:text-gold-100'}`}
                     >
                         Venue
                     </button>
                     <button 
                        onClick={() => setViewMode('city')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'city' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-300 hover:text-gold-100'}`}
                     >
                         City Journey
                     </button>
                 </div>
             </div>
             
             <div className="flex-grow relative cursor-crosshair map-container bg-[#f5f5f4] overflow-hidden" onClick={updateLocation}>
                 
                 {viewMode === 'venue' ? (
                     <>
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a0e11 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                         <div className="absolute inset-0 w-[100%] h-[100%] border-[10px] border-[#4a0e11]/10 pointer-events-none"></div>

                         {VENUE_ZONES.map((zone, i) => (
                              <div key={i} className="absolute border-2 border-dashed flex items-center justify-center text-center p-2 opacity-60 pointer-events-none transition-opacity hover:opacity-100" 
                                  style={{ 
                                    left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`, 
                                    transform: 'translate(-50%, -50%)',
                                    borderColor: zone.color, backgroundColor: `${zone.color}08`
                                  }}>
                                  <span className="font-serif font-bold text-[10px] uppercase tracking-wider text-[#4a0e11] bg-white/80 px-2 py-1 rounded-full shadow-sm animate-fade-in delay-500">{zone.name}</span>
                              </div>
                         ))}

                        <MapTree className="absolute top-[15%] left-[15%] w-24 h-24 opacity-60 pointer-events-none" />
                        <MapTree className="absolute top-[15%] right-[15%] w-24 h-24 opacity-60 pointer-events-none" />
                        <MapElephant className="absolute bottom-[20%] left-[10%] w-32 h-20 opacity-40 pointer-events-none" />
                        <MapElephant className="absolute bottom-[20%] right-[10%] w-32 h-20 opacity-40 pointer-events-none" flip />
                     </>
                 ) : (
                     <CityMapBackground />
                 )}
                 
                 {/* Render Users */}
                 {Object.values(activeUsers).map((u: any, i) => {
                     // Only show user if they are on the current map type (default to venue if undefined)
                     const userMap = u.map || 'venue';
                     if (userMap !== viewMode) return null;
                     
                     return <MapNode key={i} x={u.x} y={u.y} name={u.name === userName ? 'You' : u.name} type={u.role} delay={i * 100} />;
                 })}
             </div>
        </div>
    );
};

// --- Main Guest Dashboard Component ---

interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'map' | 'chat' | 'gallery'>('home');
  const [highlights, setHighlights] = useState<any[]>([]);
  const [heartCount, setHeartCount] = useState(0);
  const [floatingHearts, setFloatingHearts] = useState<Array<{id: number, left: number}>>([]);

  useEffect(() => {
      const savedEvents = localStorage.getItem('wedding_highlights');
      if (savedEvents) setHighlights(JSON.parse(savedEvents));
      else {
          setHighlights([
              { id: 1, title: "Mehndi & Sangeet", time: "6:00 PM", location: "Grand Ballroom" },
              { id: 2, title: "Wedding Ceremony", time: "10:00 AM", location: "Poolside Lawns" }
          ]);
      }
      
      const savedHearts = localStorage.getItem('wedding_heart_count');
      if (savedHearts) setHeartCount(parseInt(savedHearts));

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (e) => {
          if (e.data.type === 'heart_update') setHeartCount(e.data.count);
      };
      return () => channel.close();
  }, []);

  const triggerHeart = () => {
      const newCount = heartCount + 1;
      setHeartCount(newCount);
      localStorage.setItem('wedding_heart_count', newCount.toString());
      
      const id = Date.now();
      setFloatingHearts(prev => [...prev, { id, left: Math.random() * 80 + 10 }]);
      setTimeout(() => setFloatingHearts(prev => prev.filter(h => h.id !== id)), 2000);

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'heart_update', count: newCount });
      channel.close();
  };

  const renderContent = () => {
      switch(activeTab) {
          case 'chat': return <ChatView userName={userName} heartCount={heartCount} triggerHeart={triggerHeart} />;
          case 'gallery': return <GalleryView />;
          case 'map': return <MapView userName={userName} />;
          case 'schedule': 
             return (
                 <div className="p-6 animate-fade-in">
                     <h2 className="font-heading text-2xl text-[#4a0e11] mb-6 border-b border-gold-300 pb-4 animate-fade-in-up">Event Schedule</h2>
                     <div className="space-y-6 border-l-2 border-gold-200 ml-3 pl-6 relative">
                         {highlights.map((event, i) => (
                             <div key={i} className="relative animate-slide-in-right" style={{ animationDelay: `${i*150}ms` }}>
                                 <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[#4a0e11] border-2 border-gold-100"></div>
                                 <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 hover:shadow-md transition-all hover:-translate-y-1 duration-300">
                                     <h3 className="font-serif font-bold text-lg text-rose-900">{event.title}</h3>
                                     <div className="flex items-center gap-4 text-xs text-stone-500 mt-2">
                                         <span className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded"><Clock size={12}/> {event.time}</span>
                                         <span className="flex items-center gap-1 bg-stone-100 px-2 py-1 rounded"><MapPin size={12}/> {event.location}</span>
                                     </div>
                                 </div>
                             </div>
                         ))}
                     </div>
                 </div>
             );
          default: // Home
             return (
                 <div className="p-6 animate-fade-in duration-500 relative z-10">
                      <header className="text-center mb-8 animate-fade-in-up">
                          <div className="inline-block border-b-2 border-gold-300 pb-2 px-8">
                             <h1 className="font-heading text-3xl text-[#4a0e11]">Namaste, {userName}</h1>
                          </div>
                          <p className="text-rose-800 font-serif italic mt-2 text-sm animate-fade-in-up delay-200">Welcome to the celebration</p>
                      </header>
                      
                      <div className="grid grid-cols-2 gap-4 mb-8">
                          <button onClick={() => setActiveTab('gallery')} className="group bg-gradient-to-br from-[#4a0e11] to-[#2d0a0d] text-gold-100 p-5 rounded-2xl shadow-lg flex flex-col items-center gap-2 active:scale-95 transition-all hover:shadow-gold-glow hover:-translate-y-1 animate-zoom-in delay-100">
                              <Camera size={28} className="text-gold-400 group-hover:scale-110 transition-transform" />
                              <span className="font-serif font-bold text-sm">Photos</span>
                          </button>
                          <button onClick={() => setActiveTab('chat')} className="group bg-white text-[#4a0e11] border border-gold-200 p-5 rounded-2xl shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-all hover:bg-gold-50 hover:-translate-y-1 animate-zoom-in delay-200">
                              <MessageSquare size={28} className="text-rose-500 group-hover:rotate-12 transition-transform" />
                              <span className="font-serif font-bold text-sm">Guest Book</span>
                          </button>
                      </div>

                      {/* Love Meter Interaction (Home Shortcut) */}
                      <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-xl border border-white text-center relative overflow-hidden animate-zoom-in delay-300 hover:shadow-2xl transition-shadow duration-500">
                           <h3 className="font-heading text-lg text-rose-900 mb-2">Share the Love!</h3>
                           <p className="text-xs text-stone-500 mb-4">Tap to send live hearts</p>
                           
                           <button onClick={triggerHeart} className="w-20 h-20 bg-rose-500 rounded-full mx-auto flex items-center justify-center text-white shadow-lg shadow-rose-500/30 active:scale-90 transition-transform relative z-10 hover:scale-110 hover:shadow-xl">
                               <Heart size={40} fill="currentColor" className="animate-pulse"/>
                           </button>
                           <div className="mt-4 font-bold text-2xl text-rose-900 font-mono animate-fade-in-up delay-500">{heartCount} <span className="text-xs font-sans font-normal text-stone-500">Hearts</span></div>

                           {floatingHearts.map(h => (
                               <div key={h.id} className="absolute bottom-20 pointer-events-none animate-sidebar-float text-rose-500" style={{ left: `${h.left}%`, animationDuration: '1s' }}>
                                   <Heart fill="currentColor" size={24} />
                               </div>
                           ))}
                      </div>
                 </div>
             );
      }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#fff0f5] relative overflow-hidden text-[#4a0e11]">
      <style>{`
        @keyframes sidebar-float {
          0% { opacity: 0; transform: translateY(0) translateX(0) scale(0.5); }
          20% { opacity: 1; transform: translateY(-40px) translateX(var(--x)) scale(1); }
          100% { opacity: 0; transform: translateY(-150px) translateX(calc(var(--x) * 1.5)) scale(0.8); }
        }
        .animate-sidebar-float { animation: sidebar-float 2s ease-out forwards; }
      `}</style>
      <FloralPattern className="opacity-20 text-rose-900" />
      <FloralCorner className="absolute top-0 left-0 w-32 h-32 -translate-x-8 -translate-y-8 z-0" rotate={0} />
      <FloralCorner className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 z-0" rotate={90} />

      {/* Main Content Area */}
      <main className="flex-grow overflow-y-auto pb-20 no-scrollbar relative z-10">
          {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gold-200 px-6 py-3 flex justify-between items-center z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] pb-6 sm:pb-3 animate-slide-up delay-500">
          {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'schedule', icon: Calendar, label: 'Schedule' },
              { id: 'map', icon: Map, label: 'Map' },
              { id: 'gallery', icon: Camera, label: 'Gallery' },
              { id: 'chat', icon: MessageSquare, label: 'Chat' },
          ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 transition-all duration-300 ${activeTab === item.id ? 'text-[#4a0e11] scale-110 -translate-y-1' : 'text-stone-400 hover:text-rose-400 hover:-translate-y-1 active:scale-95'}`}
              >
                  <item.icon size={20} strokeWidth={activeTab === item.id ? 2.5 : 2} />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
              </button>
          ))}
          <button onClick={onLogout} className="flex flex-col items-center gap-1 text-stone-400 hover:text-red-600 transition-all border-l border-stone-200 pl-4 ml-1 hover:scale-105 hover:-translate-y-1 active:scale-95">
              <LogOut size={20} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Exit</span>
          </button>
      </nav>
    </div>
  );
};

export default GuestDashboard;