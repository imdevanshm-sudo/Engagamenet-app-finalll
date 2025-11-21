
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, Scroll, Calendar, Megaphone, Plus, Minus,
  FileText, Camera, MessageSquare, Home, Users, Folder, 
  Trash2, Edit2, Check, X, Save, Search, Phone, MapPin, Upload, Image as ImageIcon, Film, ExternalLink, Map, Heart, Navigation, LocateFixed, Music, Clock, PenTool, Plane
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

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

const AdminLiveMap: React.FC = () => {
    const { transform, handlers, style } = usePanZoom(1, 0.5, 3);
    const [activeUsers, setActiveUsers] = useState<Record<string, {x: number, y: number, lat?: number, lng?: number, name: string, role: 'couple'|'guest', timestamp: number, map?: 'venue'|'google'}>>({});
    const [viewMode, setViewMode] = useState<'venue' | 'google'>('venue');
    
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const linesRef = useRef<Record<string, any>>({});
    const venuePos = [26.7857, 83.0763]; // Hotel Soni International, Khalilabad

    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        channel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({
                    ...prev,
                    [data.id]: { x: data.x, y: data.y, lat: data.lat, lng: data.lng, name: data.name, role: data.role, timestamp: Date.now(), map: data.map }
                }));
            }
        };
        return () => channel.close();
    }, []);

    // Leaflet Logic
    useEffect(() => {
        if (viewMode === 'google' && mapRef.current && !mapInstance.current) {
             const L = (window as any).L;
             if (!L) return;
             
             // Initialize with zoomControl: false to use custom controls
             mapInstance.current = L.map(mapRef.current, { zoomControl: false }).setView(venuePos, 13);
             
             L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
             }).addTo(mapInstance.current);

             const venueIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #be123c; color: #fff; border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border: 2px solid #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 20px;">🏰</div>`,
                iconSize: [40, 40],
                iconAnchor: [20, 40]
            });
            L.marker(venuePos, { icon: venueIcon }).addTo(mapInstance.current).bindPopup("Hotel Soni International");
        }
        
        return () => {
            if (viewMode !== 'google' && mapInstance.current) {
                 mapInstance.current.remove();
                 mapInstance.current = null;
                 markersRef.current = {};
                 linesRef.current = {};
            }
        };
    }, [viewMode]);

     // Update Markers on Google Map with RPG Style
     useEffect(() => {
        if (!mapInstance.current || viewMode !== 'google') return;
        const L = (window as any).L;

        Object.entries(activeUsers).forEach(([id, user]) => {
            if (user.lat && user.lng) {
                const isCouple = user.role === 'couple';
                
                // Update or Create Marker
                if (markersRef.current[id]) {
                    markersRef.current[id].setLatLng([user.lat, user.lng]);
                } else {
                    const iconHtml = `
                        <div class="relative flex flex-col items-center justify-center transition-all duration-500 transform hover:scale-110">
                            <div class="w-10 h-10 rounded-full border-2 shadow-2xl flex items-center justify-center font-bold text-lg backdrop-blur-md ${
                                isCouple 
                                    ? 'bg-rose-900/90 border-rose-400 text-rose-100 shadow-rose-500/50' 
                                    : 'bg-amber-900/90 border-amber-400 text-amber-100 shadow-amber-500/30'
                            }">
                                ${isCouple ? '👑' : user.name.charAt(0)}
                                ${isCouple ? '<div class="absolute -inset-3 rounded-full border border-rose-500/40 animate-ping pointer-events-none"></div>' : ''}
                            </div>
                            <div class="mt-1 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white whitespace-nowrap border border-white/10 shadow-lg">
                                ${user.name}
                            </div>
                            <div class="absolute top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-black/60 -mt-1"></div>
                        </div>
                    `;

                    const icon = L.divIcon({
                        className: 'bg-transparent border-none',
                        html: iconHtml,
                        iconSize: [40, 60],
                        iconAnchor: [20, 20]
                    });

                    const marker = L.marker([user.lat, user.lng], { icon }).addTo(mapInstance.current);
                    markersRef.current[id] = marker;
                }

                // Update or Create Line to Venue
                if (linesRef.current[id]) {
                    linesRef.current[id].setLatLngs([[user.lat, user.lng], venuePos]);
                } else {
                    const line = L.polyline([[user.lat, user.lng], venuePos], {
                        color: isCouple ? '#be123c' : '#15803d',
                        weight: 2,
                        dashArray: '5, 8', 
                        opacity: 0.5
                    }).addTo(mapInstance.current);
                    linesRef.current[id] = line;
                }
            }
        });
    }, [activeUsers, viewMode]);

    const handleZoomIn = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mapInstance.current) mapInstance.current.zoomIn();
    };
    
    const handleZoomOut = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mapInstance.current) mapInstance.current.zoomOut();
    };
    
    const handleCenterVenue = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (mapInstance.current) {
            mapInstance.current.flyTo(venuePos, 15, {
                animate: true,
                duration: 1.5
            });
        }
    };

    const VENUE_ZONES = [
        { name: "Grand Stage", x: 50, y: 20, w: 30, h: 15, color: "#be123c" },
        { name: "Mandap", x: 80, y: 50, w: 20, h: 20, color: "#b45309" },
        { name: "Royal Dining", x: 20, y: 50, w: 25, h: 25, color: "#15803d" },
        { name: "Entrance", x: 50, y: 90, w: 20, h: 10, color: "#4a0e11" },
        { name: "Bar", x: 80, y: 80, w: 15, h: 15, color: "#1d4ed8" },
    ];

    return (
        <div className="h-full flex flex-col bg-[#fffbf5] rounded-xl overflow-hidden shadow-inner border border-gold-200 relative animate-in fade-in duration-500">
            <div className="absolute top-4 left-0 right-0 z-20 flex justify-center pointer-events-none">
                 <div className="bg-white/90 backdrop-blur-md rounded-full p-1 flex border border-gold-500/30 pointer-events-auto shadow-lg">
                     <button 
                        onClick={() => setViewMode('venue')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'venue' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-600 hover:text-gold-800'}`}
                     >
                         Venue Tracker
                     </button>
                     <button 
                        onClick={() => setViewMode('google')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-all ${viewMode === 'google' ? 'bg-gold-500 text-[#2d0a0d] shadow-sm' : 'text-gold-600 hover:text-gold-800'}`}
                     >
                         Google Maps
                     </button>
                 </div>
            </div>

            <div className="flex-grow relative overflow-hidden bg-[#f5f5f4]">
                {viewMode === 'venue' ? (
                    <div className="w-full h-full cursor-move bg-[#2d0a0d]" {...handlers} style={style}>
                        <div className="absolute inset-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
                            style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
                            <div className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 bg-[#f5f5f4] border-[20px] border-[#4a0e11] shadow-2xl">
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
                                    <MapElephant className="absolute bottom-[20%] left-[10%] w-32 h-20 opacity-60" />
                                    <MapElephant className="absolute bottom-[20%] right-[10%] w-32 h-20 opacity-60" flip />
                                
                                {Object.values(activeUsers).map((u, i) => {
                                    return <MapNode key={i} x={u.x || 50} y={u.y || 50} name={u.name} type={u.role} delay={0} />;
                                })}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="relative w-full h-full">
                         <div id="admin-map-full" ref={mapRef} className="w-full h-full bg-stone-200"></div>
                         
                         {/* Custom Controls Overlay */}
                         <div className="absolute bottom-8 right-6 flex flex-col gap-3 z-[400]">
                             <button 
                                 onClick={handleCenterVenue}
                                 className="bg-white p-3 rounded-full shadow-lg text-rose-600 hover:bg-rose-50 transition-transform hover:scale-105 border border-rose-100"
                                 title="Go to Venue"
                             >
                                 <MapPin size={20} />
                             </button>
                             <div className="flex flex-col bg-white rounded-full shadow-lg border border-stone-100 overflow-hidden">
                                 <button 
                                     onClick={handleZoomIn}
                                     className="p-3 hover:bg-stone-50 text-stone-600 border-b border-stone-100"
                                     title="Zoom In"
                                 >
                                     <Plus size={20} />
                                 </button>
                                 <button 
                                     onClick={handleZoomOut}
                                     className="p-3 hover:bg-stone-50 text-stone-600"
                                     title="Zoom Out"
                                 >
                                     <Minus size={20} />
                                 </button>
                             </div>
                         </div>

                         <div className="absolute bottom-8 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-white/50 z-[400] text-xs font-bold text-stone-600 flex items-center gap-2">
                             <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                             Live Tracking Active
                         </div>
                    </div>
                )}
            </div>
            
            <div className="p-3 bg-white border-t border-gold-200 flex justify-between items-center text-xs font-bold text-stone-600">
                 <div className="flex gap-4">
                     <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> Couple Live</span>
                     <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gold-500"></span> Guests ({Object.values(activeUsers).filter(u => u.role === 'guest').length})</span>
                 </div>
                 <span>Real-time Monitor</span>
            </div>
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'map' | 'config'>('overview');

  return (
    <div className="flex h-full w-full bg-[#f5f5f4] text-[#4a0e11] font-serif overflow-hidden absolute inset-0 z-50">
      {/* Sidebar */}
      <aside className="w-64 bg-[#2d0a0d] text-gold-100 flex flex-col border-r border-gold-500/20 flex-shrink-0 z-50 shadow-xl">
        <div className="p-6 border-b border-white/10">
          <h1 className="font-heading text-2xl text-gold-300">Admin Portal</h1>
          <p className="text-xs text-gold-500/60 uppercase tracking-widest mt-1">Royal Wedding Manager</p>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-gold-600 text-[#2d0a0d] font-bold shadow-lg' : 'text-stone-400 hover:bg-white/5 hover:text-gold-200'}`}
          >
            <Home size={18} /> Overview
          </button>
          <button 
            onClick={() => setActiveTab('guests')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'guests' ? 'bg-gold-600 text-[#2d0a0d] font-bold shadow-lg' : 'text-stone-400 hover:bg-white/5 hover:text-gold-200'}`}
          >
            <Users size={18} /> Guest List
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'map' ? 'bg-gold-600 text-[#2d0a0d] font-bold shadow-lg' : 'text-stone-400 hover:bg-white/5 hover:text-gold-200'}`}
          >
            <Map size={18} /> Live Map
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'config' ? 'bg-gold-600 text-[#2d0a0d] font-bold shadow-lg' : 'text-stone-400 hover:bg-white/5 hover:text-gold-200'}`}
          >
            <Settings size={18} /> Configuration
          </button>
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={onLogout} className="w-full flex items-center gap-2 justify-center px-4 py-2 rounded-lg border border-white/10 text-stone-400 hover:bg-white/5 hover:text-rose-400 transition-colors text-sm">
            <ArrowLeft size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow bg-[#f5f5f4] p-0 sm:p-6 lg:p-8 overflow-hidden flex flex-col">
         <div className="w-full h-full flex flex-col">
            <header className="mb-6 flex justify-between items-center flex-shrink-0 px-4 sm:px-0">
                <h2 className="text-2xl sm:text-3xl font-heading text-[#4a0e11]">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold text-[#4a0e11]">Admin User</p>
                        <p className="text-xs text-stone-500">Super Admin</p>
                    </div>
                    <div className="w-10 h-10 bg-[#4a0e11] rounded-full flex items-center justify-center text-gold-300">
                        <Settings size={20} />
                    </div>
                </div>
            </header>

            <div className="flex-grow bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden relative">
                {activeTab === 'overview' && (
                    <div className="p-8 overflow-y-auto h-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-rose-100 rounded-lg text-rose-600"><Users size={24}/></div>
                                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded">Total</span>
                                </div>
                                <h3 className="text-4xl font-heading text-[#4a0e11] mb-1">142</h3>
                                <p className="text-stone-500 text-sm">Guests Confirmed</p>
                            </div>
                            <div className="bg-gold-50 p-6 rounded-xl border border-gold-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-gold-100 rounded-lg text-gold-700"><MessageSquare size={24}/></div>
                                    <span className="text-xs font-bold text-gold-700 bg-gold-100 px-2 py-1 rounded">Live</span>
                                </div>
                                <h3 className="text-4xl font-heading text-[#4a0e11] mb-1">856</h3>
                                <p className="text-stone-500 text-sm">Wishes Received</p>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><Camera size={24}/></div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded">New</span>
                                </div>
                                <h3 className="text-4xl font-heading text-[#4a0e11] mb-1">24</h3>
                                <p className="text-stone-500 text-sm">Photos Uploaded</p>
                            </div>
                        </div>
                        
                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="border border-stone-100 rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-lg mb-4 text-[#4a0e11]">Recent Activities</h3>
                                <div className="space-y-4">
                                    {[1,2,3,4].map(i => (
                                        <div key={i} className="flex gap-3 items-start border-b border-stone-50 pb-3 last:border-0">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-gold-500 flex-shrink-0"></div>
                                            <div>
                                                <p className="text-sm font-bold text-stone-700">New Guest Registration</p>
                                                <p className="text-xs text-stone-500">Rahul Kumar joined via Invite Link</p>
                                                <p className="text-[10px] text-stone-400 mt-1">2 mins ago</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="border border-stone-100 rounded-xl p-6 shadow-sm bg-stone-50">
                                <h3 className="font-bold text-lg mb-4 text-[#4a0e11]">System Health</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-600">Server Status</span>
                                        <span className="text-green-600 font-bold">Operational</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-600">Database Load</span>
                                        <span className="text-stone-800 font-bold">12%</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-stone-600">Active Sessions</span>
                                        <span className="text-stone-800 font-bold">45</span>
                                    </div>
                                    <div className="mt-4 p-3 bg-blue-100 text-blue-800 text-xs rounded-lg">
                                        System running optimally. Last backup: 1 hour ago.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'map' && <div className="h-full w-full"><AdminLiveMap /></div>}
                
                {activeTab === 'guests' && (
                    <div className="p-8 text-center text-stone-400 h-full flex flex-col items-center justify-center">
                        <Users size={64} className="mx-auto mb-4 opacity-20"/>
                        <h3 className="text-xl font-bold text-stone-600">Guest Management</h3>
                        <p className="max-w-md mx-auto mt-2">Manage guest lists, RSVPs, and room allocations here. Feature currently in maintenance.</p>
                    </div>
                )}

                 {activeTab === 'config' && (
                    <div className="p-8 text-center text-stone-400 h-full flex flex-col items-center justify-center">
                        <Settings size={64} className="mx-auto mb-4 opacity-20"/>
                        <h3 className="text-xl font-bold text-stone-600">App Configuration</h3>
                        <p className="max-w-md mx-auto mt-2">Update wedding details, theme settings, and feature toggles. Feature currently in maintenance.</p>
                    </div>
                )}
            </div>
         </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
