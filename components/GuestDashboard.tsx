
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, 
  ChevronRight, LogOut, Sparkles, Map, Send, 
  Smile, Upload, Phone, Download, Lock, Search, ExternalLink, Contact,
  User, Music, Info, MailCheck
} from 'lucide-react';

// --- Types ---
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

interface GuestContact {
    id: number;
    name: string;
    phone: string;
    role: 'Guest' | 'Family' | 'Couple';
}

// --- Assets & Stickers ---
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

// Stickers
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

// --- Sub-Components ---

const CelebrationOverlay = ({ onClose }: { onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const confettiItems = Array.from({ length: 60 }).map((_, i) => ({
    id: i,
    left: Math.random() * 100 + '%',
    animationDuration: 2 + Math.random() * 3 + 's',
    animationDelay: Math.random() * 0.5 + 's',
    type: i % 5 
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in" style={{ touchAction: 'none' }}>
       {confettiItems.map((item) => (
          <div 
            key={item.id}
            className="absolute top-[-50px] animate-celebration-fall pointer-events-none"
            style={{
               left: item.left,
               animationDuration: item.animationDuration,
               animationDelay: item.animationDelay
            }}
          >
             {item.type === 0 && <Heart className="text-rose-500 fill-rose-500 drop-shadow-md" size={16 + Math.random() * 20} />}
             {item.type === 1 && <span className="text-2xl text-gold-400 drop-shadow-md">✿</span>}
             {item.type === 2 && <div className="w-3 h-6 bg-gradient-to-b from-gold-300 to-gold-500 rotate-45 shadow-sm" />}
             {item.type === 3 && <div className="w-4 h-4 bg-rose-600 rounded-tl-full rounded-br-full shadow-sm" />}
             {item.type === 4 && <Sparkles className="text-gold-200" size={20} />}
          </div>
       ))}
       
       <div className="relative bg-[#fffbf5] border-[4px] border-double border-gold-400 p-8 rounded-3xl shadow-2xl text-center transform animate-zoom-in duration-500 overflow-hidden max-w-xs mx-4">
           <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#fffbf5_0%,_#fef3c7_100%)] opacity-50"></div>
           <FloralCorner className="absolute top-0 left-0 w-16 h-16 -translate-x-2 -translate-y-2 opacity-60" />
           <FloralCorner className="absolute bottom-0 right-0 w-16 h-16 translate-x-2 translate-y-2 rotate-180 opacity-60" />
           
           <div className="relative z-10 flex flex-col items-center">
               <h2 className="font-heading text-4xl text-[#4a0e11] mb-2 drop-shadow-sm">Subh Kamnaye!</h2>
               <div className="w-16 h-1 bg-rose-500/30 rounded-full mb-4"></div>
               <p className="font-serif text-stone-600 leading-relaxed mb-4">
                   Your presence will make our day complete. <br/> RSVP Confirmed.
               </p>
               <button onClick={onClose} className="bg-[#4a0e11] text-gold-100 px-6 py-2 rounded-full font-bold text-sm shadow-lg active:scale-95 transition-transform">
                   Dhanyavaad
               </button>
           </div>
       </div>
    </div>
  );
};

const AdoreMeter = ({ count, onTrigger }: { count: number, onTrigger: () => void }) => {
    const fillPercent = Math.min(100, Math.max(10, (count * 0.1) % 110));
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
        <div className="flex flex-col items-center pointer-events-auto animate-fade-in delay-500 relative z-50" onClick={handleClick}>
            <div className="absolute bottom-full w-24 h-40 pointer-events-none overflow-hidden -z-10 left-1/2 -translate-x-1/2">
                 {hearts.map(h => (
                     <div key={h.id} className="absolute bottom-0 left-1/2 animate-sidebar-float text-rose-500 drop-shadow-lg" style={{ '--x': `${h.x}px` } as React.CSSProperties}>
                         {h.type === 'heart' && <Heart size={20} fill="currentColor" />}
                         {h.type === 'ring' && <div className="w-5 h-5 border-2 border-yellow-400 rounded-full"></div>}
                         {h.type === 'diamond' && <div className="w-4 h-4 bg-blue-400 rotate-45"></div>}
                     </div>
                 ))}
            </div>

            <div className="relative w-12 h-36 cursor-pointer group transition-transform active:scale-95 hover:scale-105 duration-300">
                <svg viewBox="0 0 60 200" className="absolute inset-0 w-full h-full drop-shadow-2xl">
                    <path d="M30,190 C45,190 55,180 55,165 L55,35 C55,15 45,5 30,5 C15,5 5,15 5,35 L5,165 C5,180 15,190 30,190 Z" fill="#fffbf5" stroke="#b45309" strokeWidth="2"/>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <line key={i} x1="20" y1={35 + i * 18} x2="40" y2={35 + i * 18} stroke="#d6d3d1" strokeWidth="1" />
                    ))}
                    <circle cx="30" cy="165" r="18" fill="#fffbf5" stroke="#b45309" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-[26px] left-[10px] right-[10px] bg-stone-100 rounded-t-full overflow-hidden h-[125px] w-[28px] ml-auto mr-auto z-10">
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
            <div className="mt-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm rounded-full text-[8px] font-bold text-gold-200 tracking-widest uppercase shadow-sm border border-gold-500/30 text-center">
                Adore Meter<br/>{count}
            </div>
        </div>
    );
};

// --- Views ---

const GuestBookView = ({ userName }: { userName: string }) => {
    const [view, setView] = useState<'directory' | 'wishes'>('directory');
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [activeTab, setActiveTab] = useState<'emoji' | 'sticker' | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [heartCount, setHeartCount] = useState(0);

    const guestDirectory: GuestContact[] = ([
        { id: 1, name: "Ravi Sharma", phone: "9876543210", role: 'Guest' },
        { id: 2, name: "Priya Patel", phone: "9876543211", role: 'Guest' },
        { id: 3, name: "Amit Singh", phone: "9876543212", role: 'Family' },
        { id: 4, name: "Sneha Gupta", phone: "9876543213", role: 'Couple' },
        { id: 5, name: "Aman Gupta", phone: "9876543214", role: 'Couple' },
        { id: 6, name: "Raj Malhotra", phone: "9876543215", role: 'Guest' },
        { id: 7, name: "Simran Kaur", phone: "9876543216", role: 'Family' },
    ] as GuestContact[]).filter(g => g.name !== userName); 

    useEffect(() => {
        const saved = localStorage.getItem('wedding_chat_messages');
        if (saved) setMessages(JSON.parse(saved));

        // Hearts
        const savedHearts = localStorage.getItem('wedding_heart_count');
        setHeartCount(savedHearts ? parseInt(savedHearts) : 450);

        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.onmessage = (event) => {
            if (event.data.type === 'message') {
                setMessages(prev => {
                    const exists = prev.some(m => m.id === event.data.payload.id);
                    return exists ? prev : [...prev, event.data.payload];
                });
            }
            if (event.data.type === 'heart_update') {
                setHeartCount(event.data.count);
            }
        };
        return () => channel.close();
    }, []);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages, view]);

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

    const triggerHeart = () => {
        const newCount = heartCount + 1;
        setHeartCount(newCount);
        localStorage.setItem('wedding_heart_count', newCount.toString());
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'heart_update', count: newCount });
    };

    const filteredGuests = guestDirectory.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-full relative animate-fade-in bg-[#fffbf5]">
            <div className="bg-[#4a0e11] p-4 pb-2 text-white shadow-md z-20">
                <h2 className="font-serif font-bold text-xl flex items-center gap-2 mb-3"><Contact size={20} className="text-gold-400"/> Guest Book</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setView('directory')} 
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${view === 'directory' ? 'bg-[#fffbf5] text-[#4a0e11]' : 'bg-white/10 text-gold-200 hover:bg-white/20'}`}
                    >
                        Directory
                    </button>
                    <button 
                        onClick={() => setView('wishes')} 
                        className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-t-lg transition-colors ${view === 'wishes' ? 'bg-[#fffbf5] text-[#4a0e11]' : 'bg-white/10 text-gold-200 hover:bg-white/20'}`}
                    >
                        Wishes & Chat
                    </button>
                </div>
            </div>
            
            {view === 'directory' ? (
                <div className="flex-grow overflow-y-auto p-4 pb-32">
                     <div className="relative mb-4">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16}/>
                         <input 
                            type="text" 
                            placeholder="Find a guest..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-gold-400"
                         />
                     </div>
                     <div className="space-y-3">
                         {filteredGuests.map(guest => (
                             <div key={guest.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center animate-slide-up">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${guest.role === 'Couple' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-600'}`}>
                                         {guest.name.charAt(0)}
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-[#4a0e11]">{guest.name}</h3>
                                         <span className="text-[10px] uppercase tracking-wider text-stone-400 bg-stone-50 px-2 py-0.5 rounded">{guest.role}</span>
                                     </div>
                                 </div>
                                 <a href={`tel:${guest.phone}`} className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors active:scale-95 shadow-sm border border-green-100">
                                     <Phone size={18} fill="currentColor" className="opacity-80"/>
                                 </a>
                             </div>
                         ))}
                         {filteredGuests.length === 0 && (
                             <p className="text-center text-stone-400 text-sm mt-8 italic">No guests found.</p>
                         )}
                     </div>
                </div>
            ) : (
                <div className="flex flex-col flex-grow h-full overflow-hidden relative">
                    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#fffbf5] pb-32">
                        {messages.map((msg, i) => {
                            const isMe = msg.sender === userName;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`} style={{ animationDelay: `${i * 20}ms` }}>
                                    {!isMe && (
                                        <span className="text-[10px] text-stone-500 ml-1 mb-0.5 font-bold">
                                            {msg.sender} {msg.isCouple && <span className="text-rose-500">(Couple)</span>}
                                        </span>
                                    )}
                                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm font-serif shadow-sm ${
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

                    {/* Adore Meter Inside Chat - Positioned higher to clear input bar */}
                    <div className="absolute bottom-[11rem] right-4 z-40">
                        <AdoreMeter count={heartCount} onTrigger={triggerHeart} />
                    </div>

                    <div className="p-3 bg-white border-t border-stone-100 relative z-50 pb-24 lg:pb-3">
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
                                placeholder="Send wishes..."
                                onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
                            />
                            <button onClick={() => sendMessage(inputText)} className="p-2 bg-[#4a0e11] text-gold-100 rounded-full hover:scale-105 active:scale-95 transition-transform"><Send size={18}/></button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Helper function to set view via other methods if needed */}
        </div>
    );
};

const MemoriesView = () => {
    const [photos, setPhotos] = useState<MediaItem[]>([]);
    
    useEffect(() => {
        const saved = localStorage.getItem('wedding_gallery_media');
        if (saved) setPhotos(JSON.parse(saved));
    }, []);

    const handleUpload = () => {
        const newPhoto: MediaItem = {
             id: Date.now().toString(),
             url: `https://source.unsplash.com/random/400x400?wedding-party&sig=${Date.now()}`, 
             type: 'image',
             caption: 'Shared Memory',
             timestamp: Date.now()
        }
        const updated = [newPhoto, ...photos];
        setPhotos(updated);
        localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
        alert("Photo Uploaded Successfully!");
    };

    const handleDownload = (url: string, e: React.MouseEvent) => {
        e.stopPropagation();
        alert("Downloading memory to device...");
        // In a real app, this would trigger a blob download
    };

    return (
        <div className="h-full flex flex-col bg-[#1a0507] animate-fade-in">
            <div className="p-6 pb-4 border-b border-white/10 flex justify-between items-end">
                <div>
                    <h2 className="text-gold-100 font-heading text-2xl animate-fade-in-up">Memories</h2>
                    <p className="text-gold-400 text-xs animate-fade-in-up delay-100">Shared moments from everyone</p>
                </div>
                <button onClick={handleUpload} className="bg-gold-500 text-[#2d0a0d] text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 hover:bg-gold-400 active:scale-95 transition-transform">
                    <Upload size={14}/> Upload
                </button>
            </div>
            <div className="flex-grow overflow-y-auto p-4 grid grid-cols-2 gap-3 pb-24">
                {photos.length === 0 && (
                    <div className="col-span-2 text-center text-gold-400/50 mt-10 italic text-sm">No memories shared yet. Be the first!</div>
                )}
                {photos.map((photo, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden relative group animate-zoom-in shadow-lg" style={{ animationDelay: `${i*50}ms` }}>
                        <img src={photo.url} alt="Memory" className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                            <span className="text-gold-100 text-[10px] font-bold mb-1">{photo.caption}</span>
                            <button 
                                onClick={(e) => handleDownload(photo.url, e)}
                                className="self-end bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-white/40 transition-colors"
                            >
                                <Download size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const MapView = ({ userName }: { userName: string }) => {
    const [viewMode, setViewMode] = useState<'venue' | 'google'>('venue');
    const [activeUsers, setActiveUsers] = useState<Record<string, any>>({});
    
    // Geolocation logic
    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        channel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({ ...prev, [data.id]: data }));
            }
        };
        
        let watchId: number;
        if (navigator.geolocation) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                     // Mock mapping lat/long to visual map (0-100%)
                     const { latitude, longitude } = position.coords;
                     const pseudoX = (Math.abs(longitude * 10000) % 80) + 10; 
                     const pseudoY = (Math.abs(latitude * 10000) % 80) + 10;
                     
                     const update = { 
                        type: 'location_update', 
                        id: userName, 
                        name: userName, 
                        x: pseudoX, y: pseudoY, 
                        role: 'guest',
                        map: viewMode
                     };
                     channel.postMessage(update);
                     setActiveUsers(prev => ({ ...prev, [userName]: update }));
                },
                (error) => console.warn(error),
                { enableHighAccuracy: true }
            );
        }

        return () => {
            channel.close();
            if(watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, [userName, viewMode]);

    const VENUE_ZONES = [
        { name: "Grand Stage", x: 50, y: 20, w: 30, h: 15, color: "#be123c" },
        { name: "Mandap", x: 80, y: 50, w: 20, h: 20, color: "#b45309" },
        { name: "Royal Dining", x: 20, y: 50, w: 25, h: 25, color: "#15803d" },
        { name: "Entrance", x: 50, y: 90, w: 20, h: 10, color: "#4a0e11" },
        { name: "Bar", x: 80, y: 80, w: 15, h: 15, color: "#1d4ed8" },
    ];
    
    const openGoogleMaps = () => {
        window.open("https://www.google.com/maps/search/?api=1&query=Taj+Lands+End+Mumbai", "_blank");
    };

    return (
        <div className="h-full bg-[#f5f5f4] relative overflow-hidden flex flex-col animate-fade-in">
             <div className="absolute top-4 left-4 right-4 z-20 flex flex-col gap-3 animate-slide-up">
                 <div className="bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-stone-200 flex justify-between items-center">
                     <div>
                         <h3 className="font-bold text-[#4a0e11] text-sm flex items-center gap-2"><MapPin size={16} className="text-rose-500"/> Live Location</h3>
                         <p className="text-[10px] text-stone-500">Showing real-time position.</p>
                     </div>
                     <button onClick={openGoogleMaps} className="bg-blue-50 border border-blue-200 p-2 rounded-full text-blue-600 hover:bg-blue-100 active:scale-95 transition-transform flex items-center gap-2 px-3">
                         <ExternalLink size={14}/> <span className="text-xs font-bold">Google Maps</span>
                     </button>
                 </div>
                 
                 <div className="bg-black/40 backdrop-blur-md rounded-full p-1 flex border border-gold-500/30 self-center shadow-lg">
                     <button 
                        onClick={() => setViewMode('venue')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'venue' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-300 hover:text-gold-100'}`}
                     >
                         Venue
                     </button>
                     <button 
                        onClick={() => setViewMode('google')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'google' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-300 hover:text-gold-100'}`}
                     >
                         Google Maps
                     </button>
                 </div>
             </div>
             
             <div className="flex-grow relative map-container bg-[#f5f5f4] overflow-hidden">
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
                     </>
                 ) : (
                     // Google Maps Simulation (Realtime Map)
                     <div className="absolute inset-0 bg-[#f3f4f6] overflow-hidden pointer-events-none">
                        {/* Roads */}
                        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(90deg, transparent 95%, #fff 95%), linear-gradient(transparent 95%, #fff 95%)', backgroundSize: '50px 50px' }}></div>
                        <div className="absolute top-0 bottom-0 left-1/3 w-4 bg-white border-x border-gray-300"></div>
                        <div className="absolute left-0 right-0 top-1/3 h-4 bg-white border-y border-gray-300"></div>
                        <div className="absolute left-0 right-0 bottom-1/4 h-6 bg-[#fbbf24]/30 border-y border-[#fbbf24] transform -rotate-6"></div>

                        {/* Parks */}
                        <div className="absolute top-10 right-10 w-32 h-32 bg-green-100 rounded-full border border-green-200 opacity-50"></div>
                        <div className="absolute bottom-20 left-[-20px] w-40 h-40 bg-green-100 rounded-full border border-green-200 opacity-50"></div>

                        {/* Labels */}
                        <div className="absolute top-12 right-16 text-[10px] font-bold text-green-800 opacity-70 bg-white/50 px-1 rounded">City Park</div>
                        <div className="absolute bottom-32 left-6 text-[10px] font-bold text-green-800 opacity-70 bg-white/50 px-1 rounded">Garden</div>
                    </div>
                 )}
                 
                 {Object.values(activeUsers).map((u: any, i) => {
                     const userMap = u.map || 'venue';
                     if (userMap !== viewMode) return null;
                     
                     return (
                        <div 
                            key={i}
                            className="absolute flex flex-col items-center z-20 group animate-zoom-in transition-all duration-500"
                            style={{ left: `${u.x}%`, top: `${u.y}%`, transform: 'translate(-50%, -50%)' }}
                        >
                            <div 
                            className={`relative rounded-full shadow-lg transition-all duration-300 w-12 h-12 p-[2px] ${u.role === 'couple' ? 'bg-rose-950' : 'bg-[#1a0405]'}`}
                            >
                                <div className={`w-full h-full rounded-full border ${u.role === 'couple' ? 'border-rose-400' : 'border-gold-500/30'} overflow-hidden relative bg-[#2d0a0d] flex items-center justify-center`}>
                                    <Sparkles size={18} className="text-gold-300 opacity-80" />
                                </div>
                            </div>
                            <div className="mt-2 px-2 py-0.5 bg-black/70 backdrop-blur-md rounded text-[9px] text-gold-100 font-bold">
                                {u.name === userName ? 'You' : u.name}
                            </div>
                        </div>
                     );
                 })}
             </div>
        </div>
    );
};

// --- Main Guest Dashboard ---

interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'schedule' | 'map' | 'guest-book' | 'memories'>('home');
  const [rsvpConfirmed, setRsvpConfirmed] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  // Timer Logic (Target: Nov 26, 2025)
  const targetDate = new Date("2025-11-26T00:00:00");
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
      const savedRsvp = localStorage.getItem('wedding_global_rsvp');
      if(savedRsvp === 'true') setRsvpConfirmed(true);

      // Timer Update
      const timer = setInterval(() => {
          const now = new Date();
          const diff = targetDate.getTime() - now.getTime();
          
          if (diff <= 0) {
              setIsTimeUp(true);
              setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
              clearInterval(timer);
          } else {
              const days = Math.floor(diff / (1000 * 60 * 60 * 24));
              const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
              const minutes = Math.floor((diff / 1000 / 60) % 60);
              const seconds = Math.floor((diff / 1000) % 60);
              setTimeLeft({ days, hours, minutes, seconds });
          }
      }, 1000);

      return () => {
          clearInterval(timer);
      };
  }, []);

  const handleRSVP = () => {
      if (!isTimeUp || rsvpConfirmed) return;
      setRsvpConfirmed(true);
      localStorage.setItem('wedding_global_rsvp', 'true');
      setShowCelebration(true);
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#fffbf5] relative font-serif overflow-hidden text-[#4a0e11]">
      {showCelebration && <CelebrationOverlay onClose={() => setShowCelebration(false)} />}
      
      {/* Dynamic Background */}
      <FloralPattern className="text-[#4a0e11] opacity-[0.03] z-0" />
      
      {/* Main Content Area */}
      <div className="flex-grow overflow-y-auto no-scrollbar relative z-10 pb-20">
        
        {/* Header */}
        <header className="pt-8 pb-4 px-6 flex justify-between items-center bg-gradient-to-b from-[#fffbf5] to-[#fffbf5]/90 sticky top-0 z-30 backdrop-blur-sm">
            <div>
                <h1 className="font-cursive text-3xl text-[#4a0e11]">Sneha & Aman</h1>
                <p className="text-[10px] tracking-[0.3em] text-[#b45309] normal-case">The Engagement</p>
            </div>
            <div className="text-center">
                 <div className="bg-[#4a0e11] text-gold-100 px-3 py-1 rounded-lg shadow-md flex gap-2 text-xs font-mono">
                     <span className="flex flex-col leading-none"><span>{timeLeft.days}</span><span className="text-[6px] opacity-60">D</span></span>:
                     <span className="flex flex-col leading-none"><span>{timeLeft.hours}</span><span className="text-[6px] opacity-60">H</span></span>:
                     <span className="flex flex-col leading-none"><span>{timeLeft.minutes}</span><span className="text-[6px] opacity-60">M</span></span>
                 </div>
            </div>
        </header>

        {activeTab === 'home' && (
            <div className="px-6 space-y-8 animate-fade-in pb-24">
                {/* Welcome Card */}
                <div className="relative bg-[#2d0a0d] rounded-3xl p-8 text-center text-gold-100 shadow-2xl overflow-hidden group perspective-1000">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
                    <FloralCorner className="absolute top-0 left-0 w-20 h-20 -translate-x-4 -translate-y-4 opacity-20" />
                    <FloralCorner className="absolute bottom-0 right-0 w-20 h-20 translate-x-4 translate-y-4 rotate-180 opacity-20" />
                    
                    <div className="relative z-10">
                        <h2 className="font-heading text-2xl mb-2">Namaste, {userName}</h2>
                        <p className="font-serif italic opacity-80 text-sm leading-relaxed mb-6">
                            "We are delighted to have you join us in celebrating our union. Your blessings mean the world to us."
                        </p>
                        
                        {/* Grand RSVP Button */}
                        <div className="relative inline-block w-full max-w-xs">
                             <button 
                                onClick={handleRSVP}
                                disabled={!isTimeUp || rsvpConfirmed}
                                className={`w-full py-4 rounded-xl font-heading tracking-widest text-sm transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.3)] relative overflow-hidden group
                                    ${rsvpConfirmed 
                                        ? 'bg-green-800 text-green-100 cursor-default' 
                                        : isTimeUp 
                                            ? 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-600 text-[#2d0a0d] hover:scale-105 active:scale-95' 
                                            : 'bg-stone-800 text-stone-500 cursor-not-allowed border border-stone-700'
                                    }`}
                             >
                                {rsvpConfirmed ? (
                                    <span className="flex items-center justify-center gap-2"><Sparkles size={16}/> Attendance Confirmed</span>
                                ) : !isTimeUp ? (
                                    <span className="flex items-center justify-center gap-2"><Lock size={14}/> RSVP Locked (Nov 26)</span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2"><MailCheck size={16}/> Click to RSVP</span>
                                )}
                             </button>
                             {!isTimeUp && !rsvpConfirmed && (
                                 <p className="text-[10px] text-stone-500 mt-2 uppercase tracking-wider">Unlocks automatically when timer ends</p>
                             )}
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => setActiveTab('memories')} className="bg-white p-6 rounded-2xl shadow-sm border border-gold-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 group-hover:scale-110 transition-transform">
                            <Camera size={24} />
                        </div>
                        <span className="font-serif font-bold text-[#4a0e11] text-sm">Memories</span>
                    </button>
                    <button onClick={() => setActiveTab('map')} className="bg-white p-6 rounded-2xl shadow-sm border border-gold-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow group">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <Map size={24} />
                        </div>
                        <span className="font-serif font-bold text-[#4a0e11] text-sm">Live Map</span>
                    </button>
                </div>
            </div>
        )}

        {activeTab === 'schedule' && (
            <div className="px-6 pb-24 space-y-6 animate-slide-up">
                <h2 className="font-heading text-2xl text-[#4a0e11] mb-4 pl-2 border-l-4 border-gold-500">Wedding Events</h2>
                {[
                    { time: "Dec 20 • 6:00 PM", title: "Mehndi & Sangeet", loc: "Grand Ballroom", icon: Music },
                    { time: "Dec 21 • 10:00 AM", title: "Haldi Ceremony", loc: "Poolside Deck", icon: Sparkles },
                    { time: "Dec 21 • 7:00 PM", title: "The Wedding", loc: "Shanti Gardens", icon: Heart },
                    { time: "Dec 21 • 9:00 PM", title: "Royal Dinner", loc: "Banquet Hall", icon: User }
                ].map((event, i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex gap-4 items-start relative overflow-hidden">
                        <div className="w-12 h-12 rounded-full bg-[#fffbf5] border border-gold-200 flex items-center justify-center text-[#b45309] flex-shrink-0 z-10">
                            <event.icon size={20} />
                        </div>
                        <div className="z-10">
                            <p className="text-xs font-bold text-gold-600 uppercase tracking-wider mb-1">{event.time}</p>
                            <h3 className="font-serif font-bold text-lg text-[#2d0a0d] mb-1">{event.title}</h3>
                            <p className="text-sm text-stone-500 flex items-center gap-1"><MapPin size={12}/> {event.loc}</p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 opacity-5 text-[#4a0e11]">
                            <FloralCorner className="w-24 h-24" />
                        </div>
                    </div>
                ))}
            </div>
        )}

        {activeTab === 'guest-book' && <GuestBookView userName={userName} />}
        {activeTab === 'memories' && <MemoriesView />}
        {activeTab === 'map' && <MapView userName={userName} />}

      </div>

      {/* Bottom Navigation */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gold-200 px-6 py-3 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
          <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 ${activeTab === 'home' ? 'text-[#4a0e11]' : 'text-stone-400'}`}>
              <Home size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Home</span>
          </button>
          <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center gap-1 ${activeTab === 'schedule' ? 'text-[#4a0e11]' : 'text-stone-400'}`}>
              <Calendar size={20} strokeWidth={activeTab === 'schedule' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Events</span>
          </button>
          <button onClick={() => setActiveTab('map')} className={`flex flex-col items-center gap-1 ${activeTab === 'map' ? 'text-[#4a0e11]' : 'text-stone-400'}`}>
              <Map size={20} strokeWidth={activeTab === 'map' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Map</span>
          </button>
          <button onClick={() => setActiveTab('guest-book')} className={`flex flex-col items-center gap-1 ${activeTab === 'guest-book' ? 'text-[#4a0e11]' : 'text-stone-400'}`}>
              <Contact size={20} strokeWidth={activeTab === 'guest-book' ? 2.5 : 2} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Guests</span>
          </button>
          <button onClick={onLogout} className="flex flex-col items-center gap-1 text-stone-400 hover:text-rose-500">
              <LogOut size={20} />
              <span className="text-[9px] font-bold uppercase tracking-wider">Exit</span>
          </button>
      </div>

    </div>
  );
};

export default GuestDashboard;
