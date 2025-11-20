
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, 
  ChevronRight, LogOut, Sparkles, Map, Send, 
  Smile, Upload, Phone, Download, Lock, Search, ExternalLink, Contact,
  User, Music, Info, MailCheck, X, Navigation, Share2, Check, LocateFixed, Compass
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

interface LocationUpdate {
    type: 'location_update';
    id: string;
    name: string;
    lat: number;
    lng: number;
    role: 'guest' | 'couple';
}

// --- Assets & Stickers ---
const FloralPattern = ({ className, opacity = 0.05 }: { className?: string, opacity?: number }) => (
  <div className={`absolute inset-0 pointer-events-none ${className}`} style={{ opacity }}>
    <svg width="100%" height="100%">
      <pattern id="floral-pat" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
         <path d="M30,5 C35,15 45,15 50,5 C40,10 40,20 50,25 C40,30 40,40 50,45 C45,35 35,35 30,45 C35,35 25,35 20,45 C20,35 20,25 10,25 C20,20 20,10 10,5 C15,15 25,15 30,5 Z" fill="currentColor" />
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

            <div className="relative w-12 h-32 cursor-pointer group transition-transform active:scale-95 hover:scale-105 duration-300">
                <svg viewBox="0 0 60 200" className="absolute inset-0 w-full h-full drop-shadow-xl">
                    <defs>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                           <feGaussianBlur stdDeviation="2" result="blur" />
                           <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                    </defs>
                    <path d="M30,190 C45,190 55,180 55,165 L55,35 C55,15 45,5 30,5 C15,5 5,15 5,35 L5,165 C5,180 15,190 30,190 Z" fill="#fffbf5" stroke="#b45309" strokeWidth="2"/>
                    {Array.from({ length: 8 }).map((_, i) => (
                        <line key={i} x1="20" y1={35 + i * 18} x2="40" y2={35 + i * 18} stroke="#d6d3d1" strokeWidth="1" />
                    ))}
                    <circle cx="30" cy="165" r="18" fill="#fffbf5" stroke="#b45309" strokeWidth="2" />
                </svg>
                <div className="absolute bottom-[23px] left-[10px] right-[10px] bg-stone-100 rounded-t-full overflow-hidden h-[110px] w-[28px] ml-auto mr-auto z-10">
                    <div 
                        className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-rose-600 via-rose-500 to-rose-400 transition-all duration-700 ease-out flex items-start justify-center pt-1"
                        style={{ height: `${fillPercent}%` }}
                    >
                         <div className="w-full h-2 bg-white/30 animate-pulse blur-[1px]"></div>
                    </div>
                </div>
                <div className="absolute bottom-[7px] left-[11px] w-[26px] h-[26px] rounded-full bg-gradient-to-br from-rose-500 to-rose-700 z-20 shadow-inner flex items-center justify-center border border-rose-300">
                    <Heart size={14} fill="#fcd34d" className="text-gold-300 animate-pulse" />
                </div>
            </div>
            <div className="mt-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-full text-[8px] font-bold text-gold-200 tracking-widest uppercase shadow-sm border border-gold-500/30 text-center">
                Adore Meter<br/>{count}
            </div>
        </div>
    );
};

// --- Views ---

const GuestBookView = ({ userName, setViewMode }: { userName: string, setViewMode: (mode: 'directory' | 'wishes') => void }) => {
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
            <div className="bg-[#4a0e11] p-4 pb-2 text-white shadow-md z-20 shrink-0">
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
                <div className="flex-grow overflow-y-auto p-4 pb-32 bg-stone-50 overscroll-contain">
                     <div className="relative mb-4">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16}/>
                         <input 
                            type="text" 
                            placeholder="Find a guest..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-stone-200 rounded-full py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-gold-400 shadow-sm"
                         />
                     </div>
                     <div className="space-y-3">
                         {filteredGuests.map(guest => (
                             <div key={guest.id} className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex justify-between items-center animate-slide-up hover:shadow-md transition-shadow">
                                 <div className="flex items-center gap-3">
                                     <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-inner ${guest.role === 'Couple' ? 'bg-rose-100 text-rose-800' : 'bg-stone-100 text-stone-600'}`}>
                                         {guest.name.charAt(0)}
                                     </div>
                                     <div>
                                         <h3 className="font-bold text-[#4a0e11]">{guest.name}</h3>
                                         <span className="text-[10px] uppercase tracking-wider text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full border border-stone-200">{guest.role}</span>
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
                <div className="flex flex-col flex-grow h-full overflow-hidden relative bg-[#f8f5f2]">
                    <FloralPattern className="opacity-[0.03] z-0" />
                    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-24 relative z-10 overscroll-contain">
                        {messages.map((msg, i) => {
                            const isMe = msg.sender === userName;
                            return (
                                <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-fade-in-up`} style={{ animationDelay: `${i * 20}ms` }}>
                                    {!isMe && (
                                        <div className="flex items-center gap-1 ml-1 mb-0.5">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold ${msg.isCouple ? 'bg-rose-100 text-rose-600' : 'bg-stone-200 text-stone-600'}`}>
                                                {msg.sender.charAt(0)}
                                            </div>
                                            <span className="text-[10px] text-stone-500 font-bold">
                                                {msg.sender}
                                            </span>
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] px-4 py-2 text-sm font-serif shadow-sm relative ${
                                        msg.type === 'sticker' ? 'bg-transparent shadow-none p-0' :
                                        isMe ? 'bg-[#4a0e11] text-gold-100 rounded-2xl rounded-tr-none shadow-md' : 
                                        msg.isCouple ? 'bg-gradient-to-br from-rose-50 to-white text-rose-900 border border-rose-200 rounded-2xl rounded-tl-none shadow-sm' : 
                                        'bg-white text-stone-800 border border-stone-100 rounded-2xl rounded-tl-none shadow-sm'
                                    }`}>
                                        {msg.type === 'sticker' && msg.stickerKey ? (
                                            <div className="w-24 h-24 drop-shadow-sm transform hover:scale-105 transition-transform">{STICKER_MAP[msg.stickerKey]}</div>
                                        ) : msg.text}
                                        {isMe && msg.type !== 'sticker' && <div className="absolute bottom-0 right-1 text-[8px] opacity-60"><Check size={10} /></div>}
                                    </div>
                                    <span className="text-[9px] text-stone-400 mt-1 mx-1">{msg.timestamp}</span>
                                </div>
                            );
                        })}
                    </div>

                    {/* Adore Meter Inside Chat - Positioned absolute, slightly adjusted */}
                    <div className="absolute bottom-[11rem] right-4 z-40">
                        <AdoreMeter count={heartCount} onTrigger={triggerHeart} />
                    </div>

                    <div className="p-3 bg-white border-t border-stone-200 relative z-50 pb-24 lg:pb-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        {activeTab && (
                            <div className="absolute bottom-full left-0 right-0 bg-[#fffbf5] border-t border-gold-300 h-56 shadow-2xl animate-slide-up z-0 flex flex-col">
                                <div className="flex border-b border-gold-200">
                                    <button onClick={() => setActiveTab('emoji')} className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'emoji' ? 'bg-maroon-50 text-maroon-900 border-b-2 border-maroon-900' : 'text-stone-500'}`}>Emojis</button>
                                    <button onClick={() => setActiveTab('sticker')} className={`flex-1 py-3 text-xs font-bold transition-colors ${activeTab === 'sticker' ? 'bg-maroon-50 text-maroon-900 border-b-2 border-maroon-900' : 'text-stone-500'}`}>Stickers</button>
                                </div>
                                <div className="flex-grow overflow-y-auto p-4 overscroll-contain">
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
                                className="flex-grow bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-maroon-300 transition-colors"
                                placeholder="Send wishes..."
                                onKeyDown={e => e.key === 'Enter' && sendMessage(inputText)}
                            />
                            <button onClick={() => sendMessage(inputText)} className="p-2.5 bg-[#4a0e11] text-gold-100 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-md"><Send size={18}/></button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Map Component using Leaflet ---
const MapView = ({ userName }: { userName: string }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null); // Use 'any' because standard Leaflet typings are not imported in this environment
    const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
    const markersRef = useRef<Record<string, any>>({});
    const venuePos = [19.0436, 72.8193]; // Taj Lands End, Mumbai

    // Setup Live Location
    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        
        channel.onmessage = (event) => {
            const data = event.data as LocationUpdate;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({ ...prev, [data.id]: data }));
            }
        };

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const update: LocationUpdate = {
                    type: 'location_update',
                    id: userName,
                    name: userName,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    role: 'guest'
                };
                channel.postMessage(update);
                setActiveUsers(prev => ({ ...prev, [userName]: update }));
            },
            (err) => console.error(err),
            { enableHighAccuracy: true, timeout: 5000, maximumAge: 10000 }
        );

        return () => {
            channel.close();
            navigator.geolocation.clearWatch(watchId);
        };
    }, [userName]);

    // Initialize Leaflet Map
    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const L = (window as any).L;
        if (!L) return;

        mapInstance.current = L.map(mapRef.current).setView(venuePos, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);

        // Add Venue Marker
        const venueIcon = L.divIcon({
            className: 'custom-div-icon',
            html: `<div style="background-color: #be123c; color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 20px;">🏰</div>`,
            iconSize: [40, 40],
            iconAnchor: [20, 40]
        });

        const venueMarker = L.marker(venuePos, { icon: venueIcon }).addTo(mapInstance.current);
        venueMarker.bindPopup("<b>Taj Lands End</b><br>The Royal Wedding Venue").openPopup();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // Update Markers
    useEffect(() => {
        if (!mapInstance.current) return;
        const L = (window as any).L;
        
        Object.values(activeUsers).forEach(user => {
            // Skip if marker already exists and didn't move (optimization could be added here)
            if (markersRef.current[user.id]) {
                markersRef.current[user.id].setLatLng([user.lat, user.lng]);
            } else {
                const isMe = user.name === userName;
                const isCouple = user.role === 'couple';
                
                const iconHtml = isCouple 
                    ? `<div style="background-color: #be123c; width: 32px; height: 32px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">❤️</div>`
                    : `<div style="background-color: ${isMe ? '#15803d' : '#b45309'}; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 12px;">${user.name.charAt(0)}</div>`;

                const icon = L.divIcon({
                    className: 'custom-user-icon',
                    html: iconHtml,
                    iconSize: [32, 32],
                    iconAnchor: [16, 32]
                });

                const marker = L.marker([user.lat, user.lng], { icon }).addTo(mapInstance.current);
                marker.bindPopup(isMe ? "You are here" : user.name);
                markersRef.current[user.id] = marker;

                // Draw line to venue if it's me or couple
                if (isMe || isCouple) {
                    const line = L.polyline([[user.lat, user.lng], venuePos], {
                        color: isCouple ? '#be123c' : '#15803d',
                        weight: 3,
                        dashArray: '10, 10', 
                        opacity: 0.6
                    }).addTo(mapInstance.current);
                    
                    // Store line to remove later if needed, for now simplified
                }
            }
        });

    }, [activeUsers]);

    return (
        <div className="flex flex-col h-full bg-[#fffbf5]">
            <div className="bg-[#4a0e11] p-4 text-white shadow-md z-20 shrink-0 flex justify-between items-center">
                <h2 className="font-serif font-bold text-xl flex items-center gap-2"><Map size={20} className="text-gold-400"/> Live Map</h2>
                <div className="text-[10px] bg-white/10 px-2 py-1 rounded border border-white/20">
                    Updates Live
                </div>
            </div>
            <div className="flex-grow relative z-10">
                <div id="map" ref={mapRef} className="w-full h-full z-0"></div>
                
                {/* Overlay Info */}
                <div className="absolute bottom-24 left-4 right-4 bg-white/90 backdrop-blur p-4 rounded-xl shadow-lg z-[1000] border border-stone-200 pointer-events-none">
                     <div className="flex items-start gap-3">
                         <div className="bg-green-100 p-2 rounded-full text-green-700"><Navigation size={20} /></div>
                         <div>
                             <h3 className="font-bold text-[#4a0e11] text-sm">Traveling to Taj Lands End</h3>
                             <p className="text-xs text-stone-500">Your location is being shared with other guests. Follow the dashed line to the venue.</p>
                         </div>
                     </div>
                </div>
            </div>
        </div>
    );
}

const Lightbox = ({ url, onClose, caption }: { url: string, onClose: () => void, caption?: string }) => (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center animate-in fade-in duration-300" style={{ touchAction: 'none' }}>
        <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white p-2"><X size={32} /></button>
        <div className="max-w-4xl max-h-[80vh] w-full px-4 flex items-center justify-center">
            <img src={url} alt="Full view" className="max-w-full max-h-full object-contain rounded-md shadow-2xl" />
        </div>
        {caption && <p className="mt-4 text-gold-100 font-serif text-lg text-center">{caption}</p>}
        <button className="mt-6 bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full flex items-center gap-2 transition-colors">
             <Download size={18} /> Save Memory
        </button>
    </div>
);

const MemoriesView = ({ userName }: { userName: string }) => {
    const [photos, setPhotos] = useState<MediaItem[]>([]);
    const [selectedPhoto, setSelectedPhoto] = useState<MediaItem | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const saved = localStorage.getItem('wedding_gallery_media');
        if (saved) setPhotos(JSON.parse(saved));
    }, []);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const newPhoto: MediaItem = {
                    id: Date.now().toString(),
                    url: reader.result as string,
                    type: 'image',
                    caption: `Uploaded by ${userName}`,
                    timestamp: Date.now()
                };
                const updated = [newPhoto, ...photos];
                setPhotos(updated);
                localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#fffbf5] animate-fade-in">
             <div className="bg-[#4a0e11] p-4 text-white shadow-md z-20 shrink-0 flex justify-between items-center">
                <h2 className="font-serif font-bold text-xl flex items-center gap-2"><Camera size={20} className="text-gold-400"/> Memories</h2>
                <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-gold-500 text-[#4a0e11] px-3 py-1.5 rounded-full font-bold flex items-center gap-1">
                    <Upload size={12}/> Upload
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
            </div>
            <div className="flex-grow overflow-y-auto p-4 pb-32 grid grid-cols-2 gap-4 content-start">
                {photos.map((photo, i) => (
                    <div key={i} onClick={() => setSelectedPhoto(photo)} className={`bg-stone-200 rounded-xl overflow-hidden shadow-sm aspect-square relative group cursor-pointer animate-in zoom-in fill-mode-backwards duration-500`} style={{ animationDelay: `${i * 50}ms` }}>
                        <img src={photo.url} className="w-full h-full object-cover" alt="Memory"/>
                    </div>
                ))}
                {photos.length === 0 && (
                    <div className="col-span-2 flex flex-col items-center justify-center h-64 text-stone-400">
                        <Camera size={48} className="mb-2 opacity-20" />
                        <p className="text-sm">No memories shared yet.</p>
                    </div>
                )}
            </div>
            {selectedPhoto && <Lightbox url={selectedPhoto.url} caption={selectedPhoto.caption} onClose={() => setSelectedPhoto(null)} />}
        </div>
    );
};

// --- Main Guest Dashboard ---

interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
  const [activeView, setActiveView] = useState<'home' | 'schedule' | 'chat' | 'gallery' | 'map'>('home');
  const [showCelebration, setShowCelebration] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'no' | null>(null);

  useEffect(() => {
      // Simulate welcome celebration on first load
      const hasSeen = sessionStorage.getItem('wedding_seen_celebration');
      if (!hasSeen) {
          setShowCelebration(true);
          sessionStorage.setItem('wedding_seen_celebration', 'true');
      }
  }, []);

  const handleRSVP = (status: 'yes' | 'no') => {
      setRsvpStatus(status);
      // In a real app, sending to backend
      if (status === 'yes') setShowCelebration(true);
  };

  return (
    <div className="w-full h-full bg-[#fffbf5] flex flex-col relative font-serif text-[#4a0e11] overflow-hidden">
      {showCelebration && <CelebrationOverlay onClose={() => setShowCelebration(false)} />}
      
      {/* Top Bar (only for Home) */}
      {activeView === 'home' && (
          <header className="p-6 pb-2 animate-slide-down">
              <div className="flex justify-between items-start">
                  <div>
                      <p className="text-stone-500 text-xs font-bold uppercase tracking-widest mb-1">Namaste,</p>
                      <h1 className="text-3xl font-heading text-[#4a0e11] leading-none">{userName.split(' ')[0]}</h1>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#4a0e11] flex items-center justify-center text-gold-200 shadow-lg">
                      <User size={20} />
                  </div>
              </div>
          </header>
      )}

      {/* Main Content Area */}
      <main className="flex-grow overflow-hidden relative z-10">
          {activeView === 'home' && (
              <div className="h-full overflow-y-auto p-6 pb-32 space-y-6 overscroll-contain">
                  {/* Welcome Card */}
                  <div className="bg-[#4a0e11] rounded-3xl p-6 text-gold-100 relative overflow-hidden shadow-xl group">
                      <FloralPattern className="opacity-10" />
                      <div className="relative z-10">
                          <div className="flex justify-between items-start mb-4">
                              <span className="bg-gold-500/20 text-gold-300 text-[10px] font-bold px-2 py-1 rounded-full border border-gold-500/30">42 Days To Go</span>
                              <Heart className="text-rose-500 fill-rose-500 animate-pulse" size={20} />
                          </div>
                          <h2 className="font-heading text-2xl mb-2">Sneha & Aman</h2>
                          <p className="text-gold-200/80 text-sm leading-relaxed mb-6 font-serif">
                              We are delighted to have you join us in celebrating our union.
                          </p>
                          
                          {rsvpStatus === null ? (
                              <div className="flex gap-3">
                                  <button onClick={() => handleRSVP('yes')} className="flex-1 bg-gold-500 text-[#4a0e11] py-2.5 rounded-xl font-bold text-sm shadow-lg hover:bg-gold-400 transition-colors">I'm Attending</button>
                                  <button onClick={() => handleRSVP('no')} className="px-4 py-2.5 rounded-xl border border-gold-500/30 text-gold-300 text-sm font-bold hover:bg-white/5">Sorry, can't</button>
                              </div>
                          ) : (
                              <div className="bg-white/10 rounded-xl p-3 flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-[#4a0e11]"><Check size={16}/></div>
                                  <div>
                                      <p className="text-sm font-bold text-gold-200">RSVP Sent</p>
                                      <p className="text-[10px] text-gold-400">Thank you for your response!</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>

                  {/* Quick Actions Grid */}
                  <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setActiveView('schedule')} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow active:scale-95">
                          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center"><Calendar size={24}/></div>
                          <span className="text-sm font-bold text-stone-700">Events</span>
                      </button>
                      <button onClick={() => setActiveView('map')} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow active:scale-95">
                          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><MapPin size={24}/></div>
                          <span className="text-sm font-bold text-stone-700">Location</span>
                      </button>
                      <button onClick={() => setActiveView('gallery')} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow active:scale-95">
                          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Camera size={24}/></div>
                          <span className="text-sm font-bold text-stone-700">Photos</span>
                      </button>
                      <button onClick={() => setActiveView('chat')} className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center gap-3 hover:shadow-md transition-shadow active:scale-95">
                          <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center"><MessageSquare size={24}/></div>
                          <span className="text-sm font-bold text-stone-700">Guest Book</span>
                      </button>
                  </div>

                  {/* Story Teaser */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100 flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-stone-200 overflow-hidden flex-shrink-0">
                          <img src="https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400" className="w-full h-full object-cover" />
                      </div>
                      <div>
                          <h3 className="font-bold text-[#4a0e11] text-sm">Our Story</h3>
                          <p className="text-xs text-stone-500 mt-1 line-clamp-2">From a chance meeting at a coffee shop to a lifetime together...</p>
                          <button className="text-[10px] font-bold text-rose-600 mt-2 uppercase tracking-wider flex items-center gap-1">Read More <ChevronRight size={10}/></button>
                      </div>
                  </div>
              </div>
          )}

          {activeView === 'chat' && <GuestBookView userName={userName} setViewMode={() => {}} />}
          {activeView === 'gallery' && <MemoriesView userName={userName} />}
          {activeView === 'map' && <MapView userName={userName} />}
          
          {activeView === 'schedule' && (
              <div className="h-full overflow-y-auto p-6 pb-32 bg-[#fffbf5] animate-fade-in">
                  <div className="bg-[#4a0e11] -mx-6 -mt-6 p-6 pb-8 mb-6 text-white relative overflow-hidden">
                      <FloralPattern className="opacity-10" />
                      <h2 className="text-2xl font-heading relative z-10">Wedding Events</h2>
                      <p className="text-gold-400 text-sm font-serif relative z-10">Dec 20 - Dec 22, 2025</p>
                  </div>
                  
                  <div className="space-y-8 relative pl-4">
                      {/* Timeline Line */}
                      <div className="absolute left-4 top-2 bottom-0 w-0.5 bg-stone-200"></div>

                      {[
                          { title: "Mehndi Ceremony", time: "Dec 20, 4:00 PM", loc: "Poolside Gardens", icon: "🌿" },
                          { title: "Sangeet Night", time: "Dec 20, 7:30 PM", loc: "Grand Ballroom", icon: "💃" },
                          { title: "Haldi", time: "Dec 21, 10:00 AM", loc: "Courtyard", icon: "✨" },
                          { title: "The Wedding", time: "Dec 21, 6:00 PM", loc: "Taj Lands End", icon: "💍" }
                      ].map((event, i) => (
                          <div key={i} className="relative pl-8 animate-slide-up" style={{ animationDelay: `${i * 100}ms` }}>
                              <div className="absolute left-0 top-1 w-8 h-8 -ml-4 bg-white border-4 border-[#fffbf5] rounded-full shadow-md flex items-center justify-center text-lg z-10">
                                  {event.icon}
                              </div>
                              <div className="bg-white p-5 rounded-xl shadow-sm border border-stone-100">
                                  <h3 className="font-heading text-lg text-[#4a0e11] mb-1">{event.title}</h3>
                                  <div className="flex flex-col gap-1 text-xs text-stone-500 font-bold uppercase tracking-wider">
                                      <span className="flex items-center gap-1"><Clock size={12}/> {event.time}</span>
                                      <span className="flex items-center gap-1 text-rose-700"><MapPin size={12}/> {event.loc}</span>
                                  </div>
                                  <button onClick={() => setActiveView('map')} className="mt-3 text-[10px] bg-stone-100 hover:bg-stone-200 text-stone-600 px-3 py-1.5 rounded-full font-bold transition-colors">View Location</button>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          )}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md rounded-2xl p-2 shadow-2xl border border-white/10 z-40 flex justify-between items-center">
           {[
              { id: 'home', icon: Home, label: 'Home' },
              { id: 'schedule', icon: Calendar, label: 'Events' },
              { id: 'map', icon: Map, label: 'Map' },
              { id: 'chat', icon: MessageSquare, label: 'Guestbook' },
           ].map((item) => (
               <button 
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all ${activeView === item.id ? 'text-gold-400 bg-white/10' : 'text-stone-400 hover:text-white'}`}
               >
                   <item.icon size={20} strokeWidth={activeView === item.id ? 2.5 : 2} />
                   <span className="text-[9px] font-medium">{item.label}</span>
               </button>
           ))}
           <button onClick={onLogout} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-rose-400 hover:bg-rose-900/20 transition-colors">
               <LogOut size={20} />
               <span className="text-[9px] font-medium">Exit</span>
           </button>
      </nav>
    </div>
  );
};

export default GuestDashboard;
