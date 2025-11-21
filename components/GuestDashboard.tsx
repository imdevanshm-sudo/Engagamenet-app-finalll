
import React, { useState, useEffect, useRef } from 'react';
import { 
  Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, 
  ChevronRight, LogOut, Sparkles, Map, Send, 
  Smile, Upload, Phone, Download, Lock, Search, ExternalLink, Contact,
  User, Music, Info, MailCheck, X, Navigation, Share2, Check, LocateFixed, Compass, Flower, Settings, Bell, ToggleLeft, ToggleRight, Trash2, RefreshCw, Battery, Wifi, WifiOff, Smartphone, Users, Plus, Minus, Loader, Disc
} from 'lucide-react';

// --- Utility to Prevent XSS in Map Markers ---
const escapeHtml = (unsafe: string) => {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }

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

interface LocationUpdate {
    type: 'location_update' | 'location_request';
    id: string;
    name: string;
    lat: number;
    lng: number;
    role: 'guest' | 'couple' | 'admin';
    timestamp: number;
}

interface WeddingEvent {
    id: string;
    title: string;
    time: string;
    loc: string;
    icon: string;
}

const DEFAULT_EVENTS: WeddingEvent[] = [
    { id: '1', title: "Mehndi Ceremony", time: "Dec 20, 4:00 PM", loc: "Poolside Gardens", icon: "🌿" },
    { id: '2', title: "Sangeet Night", time: "Dec 20, 7:30 PM", loc: "Grand Ballroom", icon: "💃" },
    { id: '3', title: "Haldi", time: "Dec 21, 10:00 AM", loc: "Courtyard", icon: "✨" },
    { id: '4', title: "The Wedding", time: "Dec 21, 6:00 PM", loc: "Grand Lawn", icon: "💍" },
];

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

// --- Live Map Modal Component ---

const LiveMapModal: React.FC<{ isOpen: boolean; onClose: () => void; userName: string; activeUsers: Record<string, LocationUpdate>; }> = ({ isOpen, onClose, userName, activeUsers }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const venuePos = [26.7857, 83.0763]; // Hotel Soni International

    // Leaflet Map Rendering
    useEffect(() => {
        if (!isOpen || !mapRef.current) return;
        
        const L = (window as any).L;
        if (!L) return;

        if (!mapInstance.current) {
             mapInstance.current = L.map(mapRef.current).setView(venuePos, 13);
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
             }).addTo(mapInstance.current);

             // Add Venue Marker
             const venueIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #be123c; color: #fff; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border: 3px solid #fcd34d; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 24px; animation: pulse 2s infinite; z-index: 1000;">🏰</div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 48],
                popupAnchor: [0, -48]
            });
            L.marker(venuePos, { icon: venueIcon, zIndexOffset: 1000 }).addTo(mapInstance.current)
              .bindPopup("<b>The Royal Venue</b><br>Hotel Soni International").openPopup();
        }
        
        // Force resize to ensure map renders correctly if opened in a modal
        setTimeout(() => {
            if(mapInstance.current) mapInstance.current.invalidateSize();
        }, 100);

        // Update Markers
        Object.values(activeUsers).forEach((user: LocationUpdate) => {
            if (user.lat && user.lng) {
                if (markersRef.current[user.id]) {
                    markersRef.current[user.id].setLatLng([user.lat, user.lng]);
                } else {
                    const isMe = user.name === userName;
                    const safeName = escapeHtml(user.name);
                    const isCouple = user.role === 'couple';
                    const isAdmin = user.role === 'admin';

                    const iconHtml = `
                        <div class="relative flex flex-col items-center justify-center transition-all duration-1000 transform hover:scale-110">
                            <div class="w-10 h-10 rounded-full border-2 shadow-2xl flex items-center justify-center font-bold text-sm backdrop-blur-md ${
                                isCouple 
                                    ? 'bg-rose-600 text-white border-white shadow-rose-500/50' 
                                    : isAdmin ? 'bg-blue-600 text-white border-white shadow-blue-500/50'
                                    : 'bg-amber-500 text-black border-white shadow-amber-500/30'
                            }">
                                ${isCouple ? '❤️' : isAdmin ? '🛡️' : safeName.charAt(0)}
                            </div>
                             <div class="mt-1 px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-bold text-white whitespace-nowrap border border-white/10 shadow-lg">
                                ${isMe ? 'You' : safeName}
                            </div>
                        </div>
                    `;

                    const icon = L.divIcon({
                        className: 'custom-div-icon',
                        html: iconHtml,
                        iconSize: [40, 60],
                        iconAnchor: [20, 20]
                    });

                    const marker = L.marker([user.lat, user.lng], { icon }).addTo(mapInstance.current);
                    markersRef.current[user.id] = marker;
                }
            }
        });

    }, [isOpen, activeUsers]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] bg-[#2d0a0d] flex flex-col animate-in fade-in duration-300">
             <div className="absolute top-0 left-0 right-0 z-30 p-4 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                 <div className="pointer-events-auto">
                    <h2 className="text-gold-100 font-heading text-2xl drop-shadow-md flex items-center gap-2">
                        <MapPin className="text-rose-500" fill="currentColor" /> Live Map
                    </h2>
                    <p className="text-gold-400 text-xs font-serif opacity-80">
                        Everyone is on the way to the venue!
                    </p>
                 </div>
                 <button onClick={onClose} className="text-white bg-white/10 p-2 rounded-full backdrop-blur-sm hover:bg-white/20 transition-colors pointer-events-auto"><X size={24}/></button>
             </div>

             <div className="flex-grow relative bg-stone-900">
                 <div id="live-map-container" ref={mapRef} className="w-full h-full z-10"></div>
                 
                 {/* Overlay Stats */}
                 <div className="absolute bottom-8 left-4 right-4 z-20 pointer-events-none">
                     <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 flex items-center justify-between pointer-events-auto">
                          <div className="flex items-center gap-2">
                              <Users size={16} className="text-gold-400" />
                              <span className="text-white text-xs font-bold">{Object.keys(activeUsers).length} Active Guests</span>
                          </div>
                          <button onClick={() => {
                              if(mapInstance.current) mapInstance.current.setView(venuePos, 13);
                          }} className="bg-rose-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg hover:bg-rose-500">
                              Recenter Venue
                          </button>
                     </div>
                 </div>
             </div>
        </div>
    );
};

// --- Main Component ---

interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'events' | 'gallery' | 'chat'>('home');
  const [heartCount, setHeartCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
  
  const [rsvpStatus, setRsvpStatus] = useState<'yes' | 'maybe' | 'no' | null>(() => {
      return localStorage.getItem('wedding_rsvp_status') as any || null;
  });

  const [events, setEvents] = useState<WeddingEvent[]>(DEFAULT_EVENTS);
  const [gallery, setGallery] = useState<MediaItem[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // --- Data Sync & Tracking Logic ---
  useEffect(() => {
    // Initial Load
    const savedHearts = localStorage.getItem('wedding_heart_count');
    if (savedHearts) setHeartCount(parseInt(savedHearts));
    
    const savedMsgs = localStorage.getItem('wedding_chat_messages');
    if (savedMsgs) setMessages(JSON.parse(savedMsgs));
    
    const savedEvents = localStorage.getItem('wedding_events');
    if (savedEvents) setEvents(JSON.parse(savedEvents));

    const savedGallery = localStorage.getItem('wedding_gallery_media');
    if (savedGallery) setGallery(JSON.parse(savedGallery));
    else {
        // Fallback default gallery if empty
        const defaultPhotos: MediaItem[] = [
           { id: '1', url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', type: 'image', caption: 'Pre-wedding shoot ✨', timestamp: Date.now() },
           { id: '2', url: 'https://images.unsplash.com/photo-1511285560982-1356c11d4606?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', type: 'image', caption: 'Engagement Ring 💍', timestamp: Date.now() - 100000 },
        ];
        setGallery(defaultPhotos);
        localStorage.setItem('wedding_gallery_media', JSON.stringify(defaultPhotos));
    }

    // 1. Setup Broadcast Channel for all data + location
    const channel = new BroadcastChannel('wedding_portal_chat');
    const mapChannel = new BroadcastChannel('wedding_live_map');

    // 2. Location Tracking Handshake Protocol
    const broadcastLocation = (lat: number, lng: number) => {
         const update: LocationUpdate = {
             type: 'location_update',
             id: userName,
             name: userName,
             lat, lng,
             role: 'guest',
             timestamp: Date.now()
         };
         mapChannel.postMessage(update);
         // Update self in list so I appear on map
         setActiveUsers(prev => ({...prev, [userName]: update}));
    };

    let watchId: number;
    if (navigator.geolocation) {
         // Initial broadcast
         navigator.geolocation.getCurrentPosition(pos => {
             broadcastLocation(pos.coords.latitude, pos.coords.longitude);
         }, err => console.warn(err));

         // Continuous Tracking (High Accuracy)
         watchId = navigator.geolocation.watchPosition(
             pos => {
                 broadcastLocation(pos.coords.latitude, pos.coords.longitude);
             },
             err => console.warn("Tracking error", err),
             { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
         );
         
         // ASK OTHERS: "Where are you?"
         mapChannel.postMessage({ type: 'location_request' });
    }

    // 3. Listeners
    channel.onmessage = (event) => {
        const data = event.data;
        if (data.type === 'message') {
            setMessages(prev => [...prev, data.payload]);
        } else if (data.type === 'message_sync') {
            setMessages(data.payload);
        } else if (data.type === 'heart_update') {
            setHeartCount(data.count);
        } else if (data.type === 'event_sync') {
            setEvents(data.payload);
        } else if (data.type === 'gallery_sync') {
            setGallery(data.payload);
        }
    };

    mapChannel.onmessage = (event) => {
        const data = event.data as LocationUpdate;
        if (data.type === 'location_update') {
            setActiveUsers(prev => ({...prev, [data.id]: data}));
        } else if (data.type === 'location_request') {
            // Someone just joined, reply immediately with my location
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(pos => {
                    broadcastLocation(pos.coords.latitude, pos.coords.longitude);
                });
            }
        }
    };

    return () => {
        channel.close();
        mapChannel.close();
        if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [userName]);

  const handleRSVP = (status: 'yes' | 'maybe' | 'no') => {
      setRsvpStatus(status);
      localStorage.setItem('wedding_rsvp_status', status);
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        sender: userName,
        isCouple: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'text'
    };
    const updatedMsgs = [...messages, newMessage];
    setMessages(updatedMsgs);
    localStorage.setItem('wedding_chat_messages', JSON.stringify(updatedMsgs));

    const channel = new BroadcastChannel('wedding_portal_chat');
    channel.postMessage({ type: 'message', payload: newMessage });
    channel.close();
    setInputText("");
  };

  const handleSendSticker = (key: string) => {
    const newMessage: Message = {
        id: Date.now().toString(),
        stickerKey: key,
        sender: userName,
        isCouple: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'sticker'
    };
    const updatedMsgs = [...messages, newMessage];
    setMessages(updatedMsgs);
    localStorage.setItem('wedding_chat_messages', JSON.stringify(updatedMsgs));

    const channel = new BroadcastChannel('wedding_portal_chat');
    channel.postMessage({ type: 'message', payload: newMessage });
    channel.close();
    setShowStickerPicker(false);
  };

  // ... rest of component unchanged ...
  return (
    <div className="w-full h-full flex flex-col relative bg-[#1a0507] text-gold-100 overflow-hidden">
      {/* --- Header --- */}
      <header className="shrink-0 h-16 flex items-center justify-between px-4 border-b border-gold-500/20 bg-[#2d0a0d]/90 backdrop-blur-md z-20">
         <div className="flex items-center gap-3">
             <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 p-[2px]">
                 <div className="w-full h-full rounded-full bg-[#2d0a0d] flex items-center justify-center text-xs font-bold text-gold-100">
                     {userName.charAt(0)}
                 </div>
             </div>
             <div>
                 <h1 className="font-heading text-gold-100 text-lg leading-none">Namaste, {userName.split(' ')[0]}</h1>
                 <p className="text-[10px] text-gold-400 font-serif tracking-wider">Welcome to the festivities</p>
             </div>
         </div>
         <button onClick={() => setShowSettings(true)} className="p-2 text-gold-300 hover:bg-white/10 rounded-full transition-colors">
             <Settings size={20} />
         </button>
      </header>

      {/* --- Main Content --- */}
      <main className="flex-grow overflow-hidden relative">
         <FloralPattern opacity={0.03} />
         
         {/* Home Tab */}
         {activeTab === 'home' && (
             <div className="h-full overflow-y-auto p-4 space-y-6 pb-24 animate-fade-in">
                 
                 {/* RSVP Card */}
                 {!rsvpStatus ? (
                     <div className="bg-gradient-to-r from-gold-900/40 to-gold-700/10 rounded-2xl p-5 border border-gold-500/20 relative overflow-hidden">
                         <h3 className="font-heading text-xl mb-2 text-gold-200">Will you be joining us?</h3>
                         <p className="text-xs text-stone-400 mb-4 font-serif">Please let us know if you can make it to the Grand Wedding on Dec 21.</p>
                         <div className="flex gap-2">
                             <button onClick={() => handleRSVP('yes')} className="flex-1 bg-gold-600 text-[#2d0a0d] py-2 rounded-lg font-bold text-xs hover:bg-gold-500">Yes, Can't Wait!</button>
                             <button onClick={() => handleRSVP('maybe')} className="px-4 py-2 border border-white/10 rounded-lg text-xs hover:bg-white/5">Maybe</button>
                             <button onClick={() => handleRSVP('no')} className="px-4 py-2 border border-white/10 rounded-lg text-xs hover:bg-white/5">No</button>
                         </div>
                     </div>
                 ) : (
                     <div className="bg-[#2d0a0d]/50 rounded-2xl p-4 border border-white/5 flex items-center justify-between">
                         <div>
                             <h3 className="font-bold text-gold-200 text-sm">RSVP Status</h3>
                             <p className="text-xs text-stone-400">
                                 {rsvpStatus === 'yes' && "You are attending! 🎉"}
                                 {rsvpStatus === 'maybe' && "Marked as Tentative."}
                                 {rsvpStatus === 'no' && "We will miss you."}
                             </p>
                         </div>
                         <button onClick={() => setRsvpStatus(null)} className="text-xs text-gold-500 underline">Change</button>
                     </div>
                 )}

                 {/* Quick Actions */}
                 <div className="grid grid-cols-2 gap-3">
                      <div onClick={() => setActiveTab('events')} className="p-4 bg-[#2d0a0d]/40 rounded-xl border border-white/10 hover:bg-white/5 transition-colors cursor-pointer group">
                          <Calendar size={24} className="text-rose-400 mb-2 group-hover:scale-110 transition-transform" />
                          <h4 className="font-bold text-sm">Events</h4>
                          <p className="text-[10px] text-stone-500">Schedule & Locations</p>
                      </div>
                      <div onClick={() => setIsMapOpen(true)} className="p-4 bg-[#2d0a0d]/40 rounded-xl border border-white/10 hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden">
                           <Map size={24} className="text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                           <h4 className="font-bold text-sm">Live Map</h4>
                           <p className="text-[10px] text-stone-500">Find Guests & Venue</p>
                           <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
                      </div>
                 </div>

                 {/* Featured Photos Preview */}
                 <div>
                     <div className="flex justify-between items-end mb-3">
                         <h3 className="font-heading text-lg text-gold-200">Latest Memories</h3>
                         <button onClick={() => setActiveTab('gallery')} className="text-xs text-gold-500 flex items-center gap-1">View All <ChevronRight size={12}/></button>
                     </div>
                     <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                         {gallery.slice(0, 4).map((photo) => (
                             <div key={photo.id} className="w-32 h-32 shrink-0 rounded-lg overflow-hidden border border-white/10 relative">
                                 <img src={photo.url} className="w-full h-full object-cover" loading="lazy" />
                             </div>
                         ))}
                         <button onClick={() => setShowUploadModal(true)} className="w-32 h-32 shrink-0 rounded-lg border border-dashed border-white/20 flex flex-col items-center justify-center gap-2 text-stone-500 hover:bg-white/5 hover:text-gold-400 transition-colors">
                             <Camera size={20} />
                             <span className="text-[10px] uppercase font-bold">Upload</span>
                         </button>
                     </div>
                 </div>
             </div>
         )}
        
        {/* Events, Gallery, Chat tabs omitted for brevity as they are unchanged from original prompt except map integration which is handled by the useEffect and LiveMapModal */}
        {activeTab === 'events' && (
             <div className="h-full overflow-y-auto p-4 pb-24 animate-slide-up">
                 <h2 className="font-heading text-2xl text-gold-100 mb-6">Wedding Itinerary</h2>
                 <div className="relative space-y-8 pl-4 before:absolute before:top-2 before:bottom-10 before:left-[27px] before:w-[2px] before:bg-gradient-to-b before:from-gold-500 before:to-transparent">
                     {events.map((evt, i) => (
                         <div key={evt.id} className="relative pl-8 group">
                             <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#1a0507] border-2 border-gold-500 flex items-center justify-center z-10 shadow-[0_0_10px_rgba(234,179,8,0.3)] group-hover:scale-110 transition-transform">
                                 <div className="w-2 h-2 bg-gold-500 rounded-full"></div>
                             </div>
                             <div className="bg-[#2d0a0d] p-5 rounded-xl border border-white/10 shadow-lg group-hover:border-gold-500/30 transition-colors">
                                 <div className="flex justify-between items-start mb-2">
                                     <div className="text-3xl">{evt.icon}</div>
                                     <div className="text-right">
                                         <div className="text-xs font-bold text-gold-500 bg-gold-500/10 px-2 py-1 rounded-full">{evt.time}</div>
                                     </div>
                                 </div>
                                 <h3 className="font-bold text-lg text-white mb-1">{evt.title}</h3>
                                 <div className="flex items-center gap-2 text-stone-400 text-sm">
                                     <MapPin size={14} /> {evt.loc}
                                 </div>
                                 <div className="mt-4 pt-3 border-t border-white/5 flex gap-2">
                                     <button className="flex-1 text-xs bg-white/5 py-2 rounded hover:bg-white/10">Add to Calendar</button>
                                     <button onClick={() => setIsMapOpen(true)} className="flex-1 text-xs bg-white/5 py-2 rounded hover:bg-white/10">View on Map</button>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         )}

         {/* Gallery Tab */}
         {activeTab === 'gallery' && (
             <div className="h-full overflow-y-auto p-1 pb-24 animate-fade-in">
                 <div className="p-3 flex justify-between items-center sticky top-0 bg-[#1a0507]/90 backdrop-blur z-10">
                     <h2 className="font-heading text-xl text-gold-200">Shared Moments</h2>
                     <button onClick={() => setShowUploadModal(true)} className="bg-gold-600 text-[#2d0a0d] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-gold-500">
                         <Upload size={14} /> Add Photo
                     </button>
                 </div>
                 <div className="grid grid-cols-2 gap-1">
                     {gallery.map(photo => (
                         <div key={photo.id} className="aspect-square relative bg-[#2d0a0d] overflow-hidden group">
                             <img src={photo.url} alt="Memory" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                                 <p className="text-[10px] text-white truncate w-full">{photo.caption}</p>
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         )}

         {/* Chat Tab */}
         {activeTab === 'chat' && (
             <div className="flex flex-col h-full overflow-hidden relative">
                 {/* Adore Meter Floating */}
                 <div className="absolute bottom-[5rem] right-4 z-40 pointer-events-none">
                     <div className="pointer-events-auto">
                     </div>
                 </div>
                 <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 space-y-3 pb-24">
                     <div className="text-center py-6 opacity-50">
                         <div className="w-12 h-12 rounded-full bg-white/5 mx-auto mb-2 flex items-center justify-center"><MessageSquare size={20} /></div>
                         <p className="text-xs text-stone-400">Welcome to the Guest Book.<br/>Leave a message for the couple!</p>
                     </div>
                     {messages.map(m => (
                         <div key={m.id} className={`flex flex-col ${m.sender === userName ? 'items-end' : 'items-start'} animate-fade-in-up`}>
                             <div className={`max-w-[80%] px-4 py-2 rounded-2xl backdrop-blur-sm border shadow-sm ${m.sender === userName ? 'bg-gold-600 text-[#2d0a0d] border-gold-400 rounded-tr-none font-medium' : 'bg-white/10 text-white border-white/10 rounded-tl-none'}`}>
                                 {m.stickerKey ? (
                                     <div className="w-24 h-24 p-2">{STICKER_MAP[m.stickerKey]}</div>
                                 ) : (
                                     <p className="text-sm leading-relaxed">{m.text}</p>
                                 )}
                             </div>
                             <span className="text-[9px] text-stone-500 mt-1 px-1 flex items-center gap-1">
                                 {m.sender} {m.isCouple && <Heart size={8} fill="#e11d48" className="text-rose-500"/>} • {m.timestamp}
                             </span>
                         </div>
                     ))}
                 </div>
                 {/* Input Area */}
                 <div className="p-3 glass-deep border-t border-white/10 relative z-50">
                    {showStickerPicker && (
                         <div className="absolute bottom-full left-0 w-full bg-[#2d0a0d] border-t border-white/10 p-4 grid grid-cols-4 gap-4 animate-slide-up h-48 overflow-y-auto">
                             {Object.keys(STICKER_MAP).map(key => (
                                 <button key={key} onClick={() => handleSendSticker(key)} className="hover:scale-110 transition-transform p-2 bg-white/5 rounded-lg">
                                     {STICKER_MAP[key]}
                                 </button>
                             ))}
                         </div>
                    )}
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowStickerPicker(!showStickerPicker)} className={`p-2 rounded-full transition-colors ${showStickerPicker ? 'bg-gold-500 text-black' : 'bg-white/10 text-stone-400'}`}>
                            <Smile size={20} />
                        </button>
                        <input 
                            type="text" 
                            value={inputText} 
                            onChange={e => setInputText(e.target.value)}
                            className="flex-grow bg-black/40 border border-white/10 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-gold-500/50 text-white placeholder-white/30 transition-colors"
                            placeholder="Write a wish..."
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <button onClick={handleSendMessage} disabled={!inputText.trim()} className="p-2.5 bg-gold-600 rounded-full text-[#2d0a0d] hover:bg-gold-500 transition-colors active:scale-95 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
                            <Send size={20} />
                        </button>
                    </div>
                 </div>
             </div>
         )}

         {/* Bottom Nav */}
         <div className="absolute bottom-0 w-full bg-[#1a0507]/90 backdrop-blur-lg border-t border-white/10 p-2 z-30 safe-area-pb">
             <div className="flex justify-around items-center">
                 {[
                     { id: 'home', icon: Home, label: 'Home' },
                     { id: 'events', icon: Calendar, label: 'Events' },
                     { id: 'gallery', icon: Camera, label: 'Gallery' },
                     { id: 'chat', icon: MessageSquare, label: 'Guestbook' },
                 ].map(tab => (
                     <button 
                        key={tab.id} 
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all active:scale-95 duration-200 ${activeTab === tab.id ? 'text-gold-400 bg-white/5' : 'text-stone-500 hover:text-stone-300'}`}
                     >
                         <tab.icon size={20} strokeWidth={activeTab === tab.id ? 2.5 : 2} className={activeTab === tab.id ? 'animate-bounce-short' : ''} />
                         <span className="text-[9px] uppercase tracking-wider font-bold">{tab.label}</span>
                     </button>
                 ))}
             </div>
         </div>
      </main>
      
      {/* Live Map Modal */}
      <LiveMapModal 
        isOpen={isMapOpen} 
        onClose={() => setIsMapOpen(false)} 
        userName={userName} 
        activeUsers={activeUsers}
      />
    </div>
  );
};

export default GuestDashboard;
