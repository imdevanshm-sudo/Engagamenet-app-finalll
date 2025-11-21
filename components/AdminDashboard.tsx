
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, Scroll, Calendar, Megaphone, Plus, Minus,
  FileText, Camera, MessageSquare, Home, Users, Folder, 
  Trash2, Edit2, Check, X, Save, Search, Phone, MapPin, Upload, Image as ImageIcon, Film, ExternalLink, Map, Heart, Navigation, LocateFixed, Music, Clock, PenTool, Plane, LogOut, Send, Ban, BellRing, Palette, Sparkles, CloudFog, Flower
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

interface AdminDashboardProps {
  onLogout: () => void;
}

interface WeddingEvent {
    id: string;
    title: string;
    time: string;
    loc: string;
    icon: string;
}

interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
    timestamp: number;
}

interface LocationUpdate {
    type: 'location_update';
    id: string;
    name: string;
    x: number;
    y: number;
    lat?: number;
    lng?: number;
    role: 'guest' | 'couple';
    map: 'all' | 'venue' | 'google';
}

interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset';
    effect: 'dust' | 'petals' | 'lights' | 'none';
}

const DEFAULT_EVENTS: WeddingEvent[] = [
    { id: '1', title: "Welcome Lunch", time: "Nov 26, 12:30 PM", loc: "Spice Garden", icon: "🍲" },
    { id: '2', title: "Ring Ceremony (Sagai)", time: "Nov 26, 5:00 PM", loc: "Royal Gardens", icon: "💍" },
    { id: '3', title: "Engagement Dinner", time: "Nov 26, 8:00 PM", loc: "Grand Ballroom", icon: "🥂" },
    { id: '4', title: "DJ & Dance", time: "Nov 26, 10:00 PM", loc: "Poolside", icon: "💃" },
];

// --- Shared Map Components ---

const MapTree = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 100 100" className={className}>
    <path d="M50,80 L50,100" stroke="#5D4037" strokeWidth="8" />
    <path d="M20,80 Q10,60 30,40 Q10,30 40,10 Q70,30 60,40 Q90,60 80,80 Q50,90 20,80 Z" fill="#4a7c59" stroke="#33523f" strokeWidth="2" />
    <circle cx="30" cy="50" r="3" fill="#ef4444" opacity="0.6" />
    <circle cx="60" cy="30" r="3" fill="#ef4444" opacity="0.6" />
    <circle cx="70" cy="60" r="3" fill="#ef4444" opacity="0.6" />
  </svg>
);

const MapNode: React.FC<{ x: number; y: number; name: string; delay?: number; phone?: string; type?: 'guest' | 'couple' }> = ({ x, y, name, delay = 0, phone, type = 'guest' }) => {
    return (
        <div 
            className="absolute flex flex-col items-center z-20 group animate-in zoom-in duration-700 fill-mode-backwards cursor-pointer transition-all duration-500"
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

// --- Hooks ---

const usePanZoom = (initialScale = 1, minScale = 0.5, maxScale = 3) => {
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: initialScale, rotate: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const [pinchDist, setPinchDist] = useState<number | null>(null);
  const [pinchCenter, setPinchCenter] = useState<{x: number, y: number} | null>(null);

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if ('touches' in e && e.touches.length === 2) {
       const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
       );
       const center = {
           x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
           y: (e.touches[0].clientY + e.touches[1].clientY) / 2
       };
       setPinchDist(dist);
       setPinchCenter(center);
       return;
    }

    setIsDragging(true);
    lastPos.current = { x: clientX - transform.x, y: clientY - transform.y };
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if ('touches' in e && e.touches.length === 2 && pinchDist !== null && pinchCenter !== null) {
       e.preventDefault();
       const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
       );
       const center = {
           x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
           y: (e.touches[0].clientY + e.touches[1].clientY) / 2
       };

       const deltaScale = dist - pinchDist;
       const newScale = Math.min(maxScale, Math.max(minScale, transform.scale + deltaScale * 0.005));
       
       const deltaX = center.x - pinchCenter.x;
       const deltaY = center.y - pinchCenter.y;

       setTransform(prev => ({ 
           ...prev, 
           scale: newScale,
           x: prev.x + deltaX,
           y: prev.y + deltaY
       }));
       setPinchDist(dist);
       setPinchCenter(center);
       return;
    }

    if (!isDragging) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    if ('touches' in e) e.preventDefault(); 

    setTransform(prev => ({
       ...prev,
       x: clientX - lastPos.current.x,
       y: clientY - lastPos.current.y
    }));
  };

  const handleMouseUp = () => {
      setIsDragging(false);
      setPinchDist(null);
      setPinchCenter(null);
  };

  const handlers = {
      onMouseDown: handleMouseDown,
      onTouchStart: handleMouseDown,
      onMouseMove: handleMouseMove,
      onTouchMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onTouchEnd: handleMouseUp,
      onMouseLeave: handleMouseUp
  };
  
  const style: React.CSSProperties = { touchAction: 'none' };

  return { transform, isDragging, handlers, style };
};

// --- Admin Live Map Component ---

const AdminLiveMap: React.FC<{ mapImage?: string }> = ({ mapImage }) => {
    const { transform, handlers, style } = usePanZoom(1, 0.5, 3);
    const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
    const [viewMode, setViewMode] = useState<'venue' | 'google'>('venue');
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const venuePos = [26.7857, 83.0763]; // Hotel Soni International, Khalilabad
    
    const VENUE_ZONES = [
        { name: "Grand Stage", x: 50, y: 20, w: 30, h: 15, color: "#be123c" },
        { name: "Mandap", x: 80, y: 50, w: 20, h: 20, color: "#b45309" },
        { name: "Royal Dining", x: 20, y: 50, w: 25, h: 25, color: "#15803d" },
        { name: "Entrance", x: 50, y: 90, w: 20, h: 10, color: "#4a0e11" },
        { name: "Bar", x: 80, y: 80, w: 15, h: 15, color: "#1d4ed8" },
    ];

    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        
        // HANDSHAKE: Ask guests to report in
        channel.postMessage({ type: 'location_request' });

        channel.onmessage = (event) => {
            const data = event.data as LocationUpdate;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({
                    ...prev,
                    [data.id]: data
                }));
            }
        };
        return () => channel.close();
    }, []);

    // Leaflet Setup for Google Mode
    useEffect(() => {
        if (viewMode !== 'google') {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
                markersRef.current = {};
            }
            return;
        }

        if (!mapRef.current || mapInstance.current) return;

        const L = (window as any).L;
        if (!L) return;

        mapInstance.current = L.map(mapRef.current).setView(venuePos, 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        
        L.marker(venuePos).addTo(mapInstance.current).bindPopup("Hotel Soni International").openPopup();

        return () => {
            if(mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        }
    }, [viewMode]);

    // Update Leaflet Markers
    useEffect(() => {
        if (!mapInstance.current || viewMode !== 'google') return;
        const L = (window as any).L;
        
        Object.values(activeUsers).forEach((user: LocationUpdate) => {
            if (user.lat && user.lng) {
                 if (markersRef.current[user.id]) {
                     markersRef.current[user.id].setLatLng([user.lat, user.lng]);
                 } else {
                     const safeName = escapeHtml(user.name);
                     const iconHtml = `
                        <div class="relative flex flex-col items-center justify-center">
                            <div class="w-8 h-8 rounded-full border-2 shadow-lg flex items-center justify-center font-bold text-xs backdrop-blur-md ${
                                user.role === 'couple'
                                    ? 'bg-rose-900/90 border-rose-400 text-rose-100' 
                                    : 'bg-amber-900/90 border-amber-400 text-amber-100'
                            }">
                                ${safeName.charAt(0)}
                            </div>
                             <div class="mt-1 px-2 py-0.5 rounded bg-black/60 text-[8px] font-bold text-white whitespace-nowrap border border-white/10">
                                ${user.role === 'couple' ? 'Couple' : safeName}
                            </div>
                        </div>
                    `;
                    const icon = L.divIcon({
                        className: 'bg-transparent border-none',
                        html: iconHtml,
                        iconSize: [40, 50],
                        iconAnchor: [20, 20]
                    });
                     const marker = L.marker([user.lat, user.lng], { icon }).addTo(mapInstance.current);
                     markersRef.current[user.id] = marker;
                 }
            }
        });
    }, [activeUsers, viewMode]);

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center p-2 bg-black/20">
                <h3 className="text-gold-200 font-bold text-sm">Live Tracking ({Object.keys(activeUsers).length} Active)</h3>
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('venue')} className={`px-3 py-1 rounded text-xs ${viewMode === 'venue' ? 'bg-gold-500 text-black' : 'bg-white/10 text-white'}`}>Venue</button>
                    <button onClick={() => setViewMode('google')} className={`px-3 py-1 rounded text-xs ${viewMode === 'google' ? 'bg-gold-500 text-black' : 'bg-white/10 text-white'}`}>Map</button>
                </div>
            </div>
            <div className="flex-grow relative overflow-hidden bg-[#2d0a0d]">
                 {viewMode === 'venue' ? (
                     <div className="w-full h-full cursor-move relative overflow-hidden" {...handlers} style={style}>
                        <div 
                            className="absolute inset-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
                            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}
                        >
                            <div className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 bg-[#f5f5f4] border-[20px] border-[#4a0e11] shadow-2xl overflow-hidden">
                                 {mapImage ? (
                                     <>
                                        <img src={mapImage} className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Venue Map" />
                                        <div className="absolute inset-0 bg-black/5"></div>
                                     </>
                                 ) : (
                                     <>
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4a0e11 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
                                        {VENUE_ZONES.map((zone, i) => (
                                            <div key={i} className="absolute border-2 border-dashed flex items-center justify-center text-center p-2 opacity-60" 
                                                style={{ 
                                                    left: `${zone.x}%`, top: `${zone.y}%`, width: `${zone.w}%`, height: `${zone.h}%`, 
                                                    transform: 'translate(-50%, -50%)',
                                                    borderColor: zone.color, backgroundColor: `${zone.color}10`
                                                }}>
                                                <span className="font-serif font-bold text-[10px] uppercase tracking-wider text-[#4a0e11] bg-white/80 px-2 py-1 rounded-full shadow-sm">{zone.name}</span>
                                            </div>
                                        ))}
                                        <MapTree className="absolute top-[15%] left-[15%] w-24 h-24 opacity-80" />
                                        <MapTree className="absolute top-[15%] right-[15%] w-24 h-24 opacity-80" />
                                     </>
                                 )}
                                 
                                 {Object.values(activeUsers).map((u: LocationUpdate, i) => (
                                     <MapNode key={i} x={u.x} y={u.y} name={escapeHtml(u.name)} type={u.role} />
                                 ))}
                            </div>
                        </div>
                     </div>
                 ) : (
                     <div ref={mapRef} className="w-full h-full"></div>
                 )}
            </div>
        </div>
    );
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'highlights' | 'gallery' | 'messages' | 'config' | 'theme' | 'map'>('overview');
  const [config, setConfig] = useState({ coupleName: "", date: "", welcomeMsg: "", coupleImage: "", venueMapUrl: "" });
  const [theme, setTheme] = useState<ThemeConfig>({ gradient: 'royal', effect: 'dust' });
  const [guestCount, setGuestCount] = useState(0);
  const [msgCount, setMsgCount] = useState(0);
  const [heartCount, setHeartCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [events, setEvents] = useState<WeddingEvent[]>(DEFAULT_EVENTS);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  
  // Event Form State
  const [newEvent, setNewEvent] = useState({ title: '', time: '', loc: '', icon: '✨' });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Photo editing state
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");

  // Announcement State
  const [announceMsg, setAnnounceMsg] = useState("");

  // Broadcast Helper
  const broadcastSync = (type: string, payload: any) => {
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type, payload });
      channel.close();
  };
  
  // Unique Admin Action: Send Broadcast Announcement
  const handleBroadcast = () => {
      if (!announceMsg.trim()) return;
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'announcement', message: announceMsg });
      channel.close();
      setAnnounceMsg("");
      alert("Announcement Sent to All Active Guests!");
  };

  const handleBlockUser = (name: string) => {
      if(confirm(`Are you sure you want to BLOCK ${name} from the app? They will be logged out instantly.`)) {
          const channel = new BroadcastChannel('wedding_portal_chat');
          channel.postMessage({ type: 'block_user', name: name });
          channel.close();
          // Also delete their messages
          const newMessages = messages.filter(m => m.sender !== name);
          setMessages(newMessages);
          setMsgCount(newMessages.length);
          localStorage.setItem('wedding_chat_messages', JSON.stringify(newMessages));
          broadcastSync('message_sync', newMessages);
      }
  };

  useEffect(() => {
      // Initial Load
      const loadData = () => {
        const savedConfig = localStorage.getItem('wedding_global_config');
        const savedImage = localStorage.getItem('wedding_couple_image');
        const savedTheme = localStorage.getItem('wedding_theme_config');
        
        if (savedConfig) {
            const parsed = JSON.parse(savedConfig);
            setConfig({ 
                coupleName: parsed.coupleName || "",
                date: parsed.date || "",
                welcomeMsg: parsed.welcomeMsg || "",
                coupleImage: savedImage || parsed.coupleImage || "",
                venueMapUrl: parsed.venueMapUrl || ""
            });
        } else {
            setConfig({ coupleName: "Sneha & Aman", date: "2025-11-26", welcomeMsg: "Welcome to our Engagement!", coupleImage: savedImage || "", venueMapUrl: "" });
        }

        if (savedTheme) {
            setTheme(JSON.parse(savedTheme));
        }

        // Count guests (rough estimate from local keys)
        let gCount = 0;
        for (let i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i)?.startsWith('wedding_guest_name')) gCount++;
        }
        setGuestCount(gCount + 200); // Mock baseline

        const msgs = localStorage.getItem('wedding_chat_messages');
        if (msgs) {
            const parsed = JSON.parse(msgs);
            setMessages(parsed);
            setMsgCount(parsed.length);
        }

        const hearts = localStorage.getItem('wedding_heart_count');
        if(hearts) setHeartCount(parseInt(hearts));
        
        const savedEvents = localStorage.getItem('wedding_events');
        if(savedEvents) setEvents(JSON.parse(savedEvents));

        const savedPhotos = localStorage.getItem('wedding_gallery_media');
        if(savedPhotos) setPhotos(JSON.parse(savedPhotos));
      };
      loadData();

      // Listen for Updates from other tabs
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (event) => {
          const data = event.data;
          switch(data.type) {
              case 'message': 
                  setMessages(prev => {
                      const newState = [...prev, data.payload];
                      setMsgCount(newState.length);
                      return newState;
                  });
                  break;
              case 'message_sync':
                  setMessages(data.payload);
                  setMsgCount(data.payload.length);
                  break;
              case 'heart_update':
                  setHeartCount(data.count);
                  break;
              case 'gallery_sync':
                  setPhotos(data.payload);
                  break;
              case 'event_sync':
                  setEvents(data.payload);
                  break;
          }
      };

      return () => channel.close();
  }, []);

  const handleSaveConfig = () => {
      localStorage.setItem('wedding_global_config', JSON.stringify(config));
      localStorage.setItem('wedding_welcome_msg', config.welcomeMsg);
      if (config.coupleImage) {
          localStorage.setItem('wedding_couple_image', config.coupleImage);
      }
      broadcastSync('config_sync', config);
      alert("Configuration Saved & Broadcasted!");
  };

  const handleThemeUpdate = (newTheme: Partial<ThemeConfig>) => {
      const updated = { ...theme, ...newTheme };
      setTheme(updated);
      localStorage.setItem('wedding_theme_config', JSON.stringify(updated));
      broadcastSync('theme_sync', updated);
  };

  const handleClearData = () => {
      if (confirm("Are you sure? This will clear all local data.")) {
          localStorage.clear();
          window.location.reload();
      }
  };
  
  // --- Events Management ---
  const handleAddOrUpdateEvent = () => {
      if(!newEvent.title || !newEvent.time) return;
      
      let updated;
      if (editingId) {
          updated = events.map(e => e.id === editingId ? { ...newEvent, id: editingId } : e);
          setEditingId(null);
      } else {
          updated = [...events, { ...newEvent, id: Date.now().toString() }];
      }
      
      setEvents(updated);
      localStorage.setItem('wedding_events', JSON.stringify(updated));
      broadcastSync('event_sync', updated);
      setNewEvent({ title: '', time: '', loc: '', icon: '✨' });
  };

  const handleEditClick = (evt: WeddingEvent) => {
      setNewEvent(evt);
      setEditingId(evt.id);
  };

  const handleCancelEdit = () => {
      setNewEvent({ title: '', time: '', loc: '', icon: '✨' });
      setEditingId(null);
  };
  
  const handleDeleteEvent = (id: string) => {
      if(confirm("Delete this event?")) {
          const updated = events.filter(e => e.id !== id);
          setEvents(updated);
          localStorage.setItem('wedding_events', JSON.stringify(updated));
          broadcastSync('event_sync', updated);
          if (editingId === id) handleCancelEdit();
      }
  };

  // --- Messages Management ---
  const handleDeleteMessage = (id: string) => {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      setMsgCount(updated.length);
      localStorage.setItem('wedding_chat_messages', JSON.stringify(updated));
      broadcastSync('message_sync', updated);
  };

  // --- Gallery Management ---
  const handleDeletePhoto = (id: string) => {
      if(confirm("Delete this photo?")) {
          const updated = photos.filter(p => p.id !== id);
          setPhotos(updated);
          localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
          broadcastSync('gallery_sync', updated);
      }
  };

  const handleEditPhotoClick = (photo: MediaItem) => {
      setEditingPhotoId(photo.id);
      setEditCaption(photo.caption || "");
  };

  const handleSavePhotoCaption = (id: string) => {
      const updated = photos.map(p => p.id === id ? { ...p, caption: editCaption } : p);
      setPhotos(updated);
      localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
      broadcastSync('gallery_sync', updated);
      setEditingPhotoId(null);
  };

  return (
    <div className={`w-full h-full flex flex-col font-serif ${
        theme.gradient === 'midnight' ? 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617]' :
        theme.gradient === 'sunset' ? 'bg-gradient-to-b from-[#4a0404] via-[#7c2d12] to-[#2d0a0d]' :
        'bg-gradient-to-b from-[#1a0507] via-[#2d0a0d] to-[#0f0505]'
    } text-gold-100 transition-colors duration-1000`}>
      {/* Header */}
      <header className="p-4 bg-[#2d0a0d]/90 backdrop-blur-md border-b border-gold-500/20 flex justify-between items-center shadow-lg z-20">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gold-500 text-[#2d0a0d] rounded-lg flex items-center justify-center font-bold shadow-md">
                  <Settings size={20} />
              </div>
              <div>
                  <h1 className="font-heading text-xl text-gold-100">Admin Panel</h1>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest">Engagement Control Center</p>
              </div>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-lg text-stone-400 hover:text-white transition-colors">
              <LogOut size={20} />
          </button>
      </header>

      <div className="flex flex-grow overflow-hidden">
          {/* Sidebar */}
          <aside className="w-20 bg-[#2d0a0d]/50 border-r border-white/5 flex flex-col items-center py-4 gap-4 z-10 backdrop-blur-sm">
              {[
                  { id: 'overview', icon: Home, label: 'Home' },
                  { id: 'theme', icon: Palette, label: 'Theme' },
                  { id: 'highlights', icon: Calendar, label: 'Events' },
                  { id: 'gallery', icon: Camera, label: 'Media' },
                  { id: 'messages', icon: MessageSquare, label: 'Chat' },
                  { id: 'map', icon: Map, label: 'Map' },
                  { id: 'config', icon: Edit2, label: 'Config' },
              ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === item.id ? 'bg-gold-500 text-[#2d0a0d] shadow-lg shadow-gold-500/20' : 'text-stone-500 hover:bg-white/5 hover:text-stone-300'}`}
                  >
                      <item.icon size={20} />
                  </button>
              ))}
          </aside>

          {/* Content */}
          <main className="flex-grow overflow-y-auto p-6">
              {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                      <h2 className="text-2xl font-heading text-gold-200 mb-4">Dashboard Overview</h2>
                      <div className="grid grid-cols-3 gap-4">
                          <div className="bg-[#2d0a0d] p-5 rounded-xl border border-white/10 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-stone-400 text-xs uppercase tracking-wider">Total Guests</span>
                                  <Users size={16} className="text-gold-500" />
                              </div>
                              <div className="text-3xl font-bold text-white">{guestCount}</div>
                          </div>
                          <div className="bg-[#2d0a0d] p-5 rounded-xl border border-white/10 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-stone-400 text-xs uppercase tracking-wider">Messages</span>
                                  <MessageSquare size={16} className="text-rose-500" />
                              </div>
                              <div className="text-3xl font-bold text-white">{msgCount}</div>
                          </div>
                          <div className="bg-[#2d0a0d] p-5 rounded-xl border border-white/10 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-stone-400 text-xs uppercase tracking-wider">Total Hearts</span>
                                  <Heart size={16} className="text-rose-500" fill="currentColor" />
                              </div>
                              <div className="text-3xl font-bold text-white">{heartCount}</div>
                          </div>
                      </div>
                      
                      {/* Announcement Widget */}
                      <div className="bg-gradient-to-r from-gold-900/30 to-gold-700/10 p-6 rounded-xl border border-gold-500/30">
                          <div className="flex items-center gap-2 mb-4">
                               <Megaphone className="text-gold-400" size={20} />
                               <h3 className="font-bold text-gold-100">Make a Royal Announcement</h3>
                          </div>
                          <div className="flex gap-3">
                              <input 
                                type="text" 
                                value={announceMsg}
                                onChange={e => setAnnounceMsg(e.target.value)}
                                className="flex-grow bg-black/40 border border-gold-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold-500"
                                placeholder="e.g. The Ring Ceremony begins in 10 minutes!"
                              />
                              <button onClick={handleBroadcast} className="bg-gold-500 text-[#2d0a0d] font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-gold-400 transition-all flex items-center gap-2">
                                  <Send size={18}/> Broadcast
                              </button>
                          </div>
                      </div>

                      <div className="bg-[#2d0a0d] p-6 rounded-xl border border-white/10">
                          <h3 className="font-bold text-gold-100 mb-4">System Actions</h3>
                          <button onClick={handleClearData} className="w-full py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                              <Trash2 size={16} /> Reset All App Data
                          </button>
                      </div>
                  </div>
              )}

              {activeTab === 'theme' && (
                  <div className="space-y-8 animate-fade-in max-w-2xl">
                      <h2 className="text-2xl font-heading text-gold-200 flex items-center gap-3">
                          <Palette className="text-gold-500"/> Theme Customizer
                      </h2>
                      
                      <div className="bg-[#2d0a0d] p-6 rounded-xl border border-white/10 shadow-xl">
                           <h3 className="text-gold-400 font-bold text-sm uppercase tracking-widest mb-4">Background Gradient</h3>
                           <div className="grid grid-cols-3 gap-4">
                               {[
                                   { id: 'royal', label: 'Royal Rose', class: 'bg-gradient-to-b from-[#1a0507] via-[#2d0a0d] to-[#0f0505]' },
                                   { id: 'midnight', label: 'Midnight Blue', class: 'bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#020617]' },
                                   { id: 'sunset', label: 'Golden Sunset', class: 'bg-gradient-to-b from-[#4a0404] via-[#7c2d12] to-[#2d0a0d]' },
                               ].map(opt => (
                                   <button 
                                        key={opt.id}
                                        onClick={() => handleThemeUpdate({ gradient: opt.id as any })}
                                        className={`relative h-24 rounded-lg border-2 transition-all overflow-hidden group ${theme.gradient === opt.id ? 'border-gold-500 scale-105 shadow-gold-500/20 shadow-lg' : 'border-white/10 hover:border-white/30'}`}
                                   >
                                       <div className={`absolute inset-0 ${opt.class}`}></div>
                                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                                            <span className="font-bold text-white text-sm shadow-black/50 drop-shadow-md">{opt.label}</span>
                                       </div>
                                       {theme.gradient === opt.id && (
                                           <div className="absolute top-2 right-2 bg-gold-500 text-[#2d0a0d] rounded-full p-0.5"><Check size={12}/></div>
                                       )}
                                   </button>
                               ))}
                           </div>
                      </div>

                      <div className="bg-[#2d0a0d] p-6 rounded-xl border border-white/10 shadow-xl">
                           <h3 className="text-gold-400 font-bold text-sm uppercase tracking-widest mb-4">Cinematic Overlay Effect</h3>
                           <div className="grid grid-cols-4 gap-4">
                               {[
                                   { id: 'dust', label: 'Gold Dust', icon: Sparkles },
                                   { id: 'petals', label: 'Rose Petals', icon: Flower },
                                   { id: 'lights', label: 'God Rays', icon: CloudFog },
                                   { id: 'none', label: 'None', icon: Ban },
                               ].map(opt => (
                                   <button 
                                        key={opt.id}
                                        onClick={() => handleThemeUpdate({ effect: opt.id as any })}
                                        className={`flex flex-col items-center justify-center gap-3 py-6 rounded-lg border transition-all ${theme.effect === opt.id ? 'bg-white/10 border-gold-500 text-gold-100' : 'bg-black/20 border-white/10 text-stone-400 hover:bg-white/5'}`}
                                   >
                                       <opt.icon size={24} className={theme.effect === opt.id ? 'text-gold-400' : ''} />
                                       <span className="text-xs font-bold uppercase">{opt.label}</span>
                                   </button>
                               ))}
                           </div>
                      </div>
                      
                      <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-500/30 text-sm text-blue-200 flex gap-3">
                          <Film className="shrink-0" />
                          <p>Changes made here are broadcast instantly to all guests, the couple dashboard, and the welcome screen. No refresh required.</p>
                      </div>
                  </div>
              )}
              
              {activeTab === 'highlights' && (
                  <div className="space-y-6 animate-fade-in">
                       <h2 className="text-2xl font-heading text-gold-200">Manage Events</h2>
                       <div className="bg-[#2d0a0d] p-4 rounded-xl border border-white/10">
                           <div className="flex justify-between items-center mb-4">
                               <h3 className="text-sm font-bold text-gold-400 uppercase">{editingId ? 'Edit Event' : 'Add New Event'}</h3>
                               {editingId && <button onClick={handleCancelEdit} className="text-xs text-red-400 hover:text-red-300">Cancel</button>}
                           </div>
                           <div className="grid grid-cols-2 gap-4 mb-4">
                               <input type="text" placeholder="Event Title" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white" />
                               <input type="text" placeholder="Time (e.g. Dec 20, 4PM)" value={newEvent.time} onChange={e => setNewEvent({...newEvent, time: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white" />
                               <input type="text" placeholder="Location" value={newEvent.loc} onChange={e => setNewEvent({...newEvent, loc: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white" />
                               <input type="text" placeholder="Icon (Emoji)" value={newEvent.icon} onChange={e => setNewEvent({...newEvent, icon: e.target.value})} className="bg-black/30 border border-white/10 rounded p-2 text-white" />
                           </div>
                           <button onClick={handleAddOrUpdateEvent} className={`px-4 py-2 rounded font-bold flex items-center gap-2 transition-colors ${editingId ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-gold-600 hover:bg-gold-500 text-black'}`}>
                               {editingId ? <><Save size={16}/> Update Event</> : <><Plus size={16}/> Add Event</>}
                           </button>
                       </div>
                       <div className="space-y-2">
                           {events.map(evt => (
                               <div key={evt.id} className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${editingId === evt.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-[#1a0507] border-white/5'}`}>
                                   <div className="flex items-center gap-3">
                                       <span className="text-2xl">{evt.icon}</span>
                                       <div>
                                           <div className="font-bold text-white">{evt.title}</div>
                                           <div className="text-xs text-stone-500">{evt.time} • {evt.loc}</div>
                                       </div>
                                   </div>
                                   <div className="flex gap-2">
                                       <button onClick={() => handleEditClick(evt)} className="text-blue-400 hover:text-blue-300 p-2"><Edit2 size={18}/></button>
                                       <button onClick={() => handleDeleteEvent(evt.id)} className="text-red-400 hover:text-red-300 p-2"><Trash2 size={18}/></button>
                                   </div>
                               </div>
                           ))}
                       </div>
                  </div>
              )}
              
              {activeTab === 'gallery' && (
                   <div className="space-y-6 animate-fade-in">
                       <h2 className="text-2xl font-heading text-gold-200">Media Gallery</h2>
                       <div className="grid grid-cols-3 gap-4">
                           {photos.map(photo => (
                               <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/40">
                                   <img src={photo.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Gallery" />
                                   
                                   {/* Overlay Controls */}
                                   <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                       <button onClick={() => handleEditPhotoClick(photo)} className="text-blue-400 bg-white/10 p-2 rounded-full hover:bg-white/20"><Edit2 size={20}/></button>
                                       <button onClick={() => handleDeletePhoto(photo.id)} className="text-red-400 bg-white/10 p-2 rounded-full hover:bg-white/20"><Trash2 size={20}/></button>
                                   </div>

                                   {/* Caption Display / Edit Mode */}
                                   <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 min-h-[40px] flex items-center">
                                       {editingPhotoId === photo.id ? (
                                           <div className="flex w-full gap-1">
                                               <input 
                                                  type="text" 
                                                  value={editCaption} 
                                                  onChange={e => setEditCaption(e.target.value)} 
                                                  className="w-full bg-white/10 border border-white/20 rounded px-1 text-[10px] text-white"
                                                  autoFocus
                                               />
                                               <button onClick={() => handleSavePhotoCaption(photo.id)} className="text-green-400"><Check size={14}/></button>
                                               <button onClick={() => setEditingPhotoId(null)} className="text-red-400"><X size={14}/></button>
                                           </div>
                                       ) : (
                                           <p className="text-[10px] text-white truncate w-full text-center">{photo.caption || 'No Caption'}</p>
                                       )}
                                   </div>
                               </div>
                           ))}
                           {photos.length === 0 && <p className="col-span-3 text-stone-500 italic">No photos uploaded yet.</p>}
                       </div>
                   </div>
              )}

              {activeTab === 'messages' && (
                  <div className="space-y-4 animate-fade-in">
                      <h2 className="text-2xl font-heading text-gold-200">Message Log & Moderation</h2>
                      <div className="space-y-2">
                          {messages.map((m, i) => (
                              <div key={i} className="bg-[#2d0a0d] p-3 rounded-lg border border-white/5 flex justify-between items-start">
                                  <div>
                                      <div className="flex items-center gap-2 mb-1">
                                          <span className={`font-bold text-sm ${m.isCouple ? 'text-rose-400' : 'text-gold-100'}`}>{m.sender} {m.isCouple && '(Couple)'}</span>
                                          <span className="text-[10px] text-stone-500">{m.timestamp}</span>
                                      </div>
                                      <p className="text-stone-300 text-sm">{m.text || '[Sticker]'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                      {!m.isCouple && m.sender !== 'Admin' && (
                                          <button onClick={() => handleBlockUser(m.sender)} title="Block User" className="text-stone-600 hover:text-red-500 p-1">
                                              <Ban size={14} />
                                          </button>
                                      )}
                                      <button onClick={() => handleDeleteMessage(m.id)} className="text-stone-500 hover:text-red-400 p-1"><Trash2 size={16}/></button>
                                  </div>
                              </div>
                          ))}
                          {messages.length === 0 && <p className="text-stone-500 italic">No messages yet.</p>}
                      </div>
                  </div>
              )}

              {activeTab === 'config' && (
                  <div className="space-y-6 animate-fade-in max-w-md">
                      <h2 className="text-2xl font-heading text-gold-200">Engagement Configuration</h2>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs text-stone-400 uppercase tracking-widest mb-2">Couple Name</label>
                              <input 
                                type="text" 
                                value={config.coupleName} 
                                onChange={e => setConfig({...config, coupleName: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-xs text-stone-400 uppercase tracking-widest mb-2">Engagement Date</label>
                              <input 
                                type="date" 
                                value={config.date} 
                                onChange={e => setConfig({...config, date: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none"
                              />
                          </div>
                           <div>
                              <label className="block text-xs text-stone-400 uppercase tracking-widest mb-2">Main Display Image URL</label>
                              <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={config.coupleImage} 
                                    onChange={e => setConfig({...config, coupleImage: e.target.value})}
                                    className="flex-grow bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none"
                                    placeholder="https://..."
                                />
                                {config.coupleImage && (
                                    <div className="w-12 h-12 rounded overflow-hidden border border-white/20">
                                        <img src={config.coupleImage} className="w-full h-full object-cover" />
                                    </div>
                                )}
                              </div>
                          </div>
                           <div>
                              <label className="block text-xs text-stone-400 uppercase tracking-widest mb-2">Venue Map Custom Image URL</label>
                              <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={config.venueMapUrl} 
                                    onChange={e => setConfig({...config, venueMapUrl: e.target.value})}
                                    className="flex-grow bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none"
                                    placeholder="https://... (Overrides default map)"
                                />
                                {config.venueMapUrl && (
                                    <div className="w-12 h-12 rounded overflow-hidden border border-white/20 bg-white/5">
                                        <img src={config.venueMapUrl} className="w-full h-full object-cover" />
                                    </div>
                                )}
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs text-stone-400 uppercase tracking-widest mb-2">Welcome Message</label>
                              <textarea 
                                rows={4}
                                value={config.welcomeMsg} 
                                onChange={e => setConfig({...config, welcomeMsg: e.target.value})}
                                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none"
                              />
                          </div>
                          <button onClick={handleSaveConfig} className="w-full bg-gold-600 text-black font-bold py-3 rounded-lg hover:bg-gold-500 transition-colors flex items-center justify-center gap-2">
                              <Save size={18} /> Save Changes
                          </button>
                      </div>
                  </div>
              )}

              {activeTab === 'map' && (
                  <div className="h-full rounded-xl overflow-hidden border border-white/10 shadow-xl animate-fade-in">
                      <AdminLiveMap mapImage={config.venueMapUrl} />
                  </div>
              )}
          </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
