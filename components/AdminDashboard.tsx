
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, Scroll, Calendar, Megaphone, Plus, 
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

const CityMapBackground = () => (
    <div className="absolute inset-0 bg-[#e8eaed] overflow-hidden pointer-events-none">
        {/* Map Layers */}
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(#dadce0 1px, transparent 1px), linear-gradient(90deg, #dadce0 1px, transparent 1px)', backgroundSize: '100px 100px' }}></div>
        
        {/* Roads */}
        <div className="absolute top-0 bottom-0 left-1/3 w-8 bg-white border-x border-gray-300 shadow-sm"></div>
        <div className="absolute left-0 right-0 top-1/3 h-8 bg-white border-y border-gray-300 shadow-sm"></div>
        <div className="absolute left-0 right-0 bottom-1/4 h-12 bg-[#fce8b2] border-y border-[#f9d06e] transform -rotate-6 border-2"></div>

        {/* Water */}
        <div className="absolute right-0 bottom-0 w-1/3 h-1/3 bg-[#aadaff] rounded-tl-[100px] border-l-4 border-t-4 border-[#9acbf9]"></div>

        {/* Parks */}
        <div className="absolute top-20 right-10 w-40 h-40 bg-[#cbf0d1] rounded-full border border-[#b0e3b8]"></div>
        <div className="absolute bottom-32 left-[-30px] w-48 h-48 bg-[#cbf0d1] rounded-full border border-[#b0e3b8]"></div>

        {/* Labels */}
        <div className="absolute top-24 right-16 text-[10px] font-bold text-[#137333] bg-white/70 px-1.5 py-0.5 rounded shadow-sm border border-white">City Park</div>
        <div className="absolute bottom-40 left-10 text-[10px] font-bold text-[#137333] bg-white/70 px-1.5 py-0.5 rounded shadow-sm border border-white">Rose Garden</div>
        <div className="absolute top-[35%] left-[40%] text-[10px] font-bold text-slate-600 bg-white/80 px-1.5 py-0.5 rounded border border-slate-200">Main St</div>
    </div>
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
    const [activeUsers, setActiveUsers] = useState<Record<string, {x: number, y: number, name: string, role: 'couple'|'guest', timestamp: number, map?: 'venue'|'google'}>>({});
    const [viewMode, setViewMode] = useState<'venue' | 'google'>('venue');

    useEffect(() => {
        const channel = new BroadcastChannel('wedding_live_map');
        channel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({
                    ...prev,
                    [data.id]: { x: data.x, y: data.y, name: data.name, role: data.role, timestamp: Date.now(), map: data.map }
                }));
            }
        };
        return () => channel.close();
    }, []);

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

            <div className="flex-grow relative overflow-hidden cursor-move bg-[#f5f5f4]" {...handlers} style={style}>
                    <div className="absolute inset-0 w-full h-full origin-top-left transition-transform duration-75 ease-out"
                        style={{ transform: `translate(${transform.x}px, ${transform.y}px) scale(${transform.scale})` }}>
                        <div className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 bg-[#f5f5f4] border-[20px] border-[#4a0e11] shadow-2xl">
                            
                            {viewMode === 'venue' ? (
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
                                    <MapElephant className="absolute bottom-[20%] left-[10%] w-32 h-20 opacity-60" />
                                    <MapElephant className="absolute bottom-[20%] right-[10%] w-32 h-20 opacity-60" flip />
                                </>
                            ) : (
                                <CityMapBackground />
                            )}
                            
                            {Object.values(activeUsers).map((u, i) => {
                                // Default to venue if undefined
                                const userMap = u.map || 'venue';
                                if (userMap !== viewMode) return null;
                                return <MapNode key={i} x={u.x} y={u.y} name={u.name} type={u.role} delay={0} />;
                            })}
                        </div>
                    </div>
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

// --- Main Admin Dashboard ---

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeView, setActiveView] = useState<'home' | 'guests' | 'content' | 'gallery' | 'map' | 'config'>('home');
  
  // Stats
  const [guestCount, setGuestCount] = useState(142);
  const [photoCount, setPhotoCount] = useState(856);
  const [messageCount, setMessageCount] = useState(324);
  
  // Guest Management State
  const [guests, setGuests] = useState([
    { id: 1, name: "Ravi Sharma", phone: "9876543210", rsvp: true, status: "Checked In" },
    { id: 2, name: "Priya Patel", phone: "9876543211", rsvp: true, status: "Pending" },
    { id: 3, name: "Amit Singh", phone: "9876543212", rsvp: false, status: "Not Coming" },
    { id: 4, name: "Sneha's Parents", phone: "9876543213", rsvp: true, status: "Checked In" },
  ]);

  // Config State
  const [config, setConfig] = useState({
      coupleName: "Sneha & Aman",
      date: "2025-11-26",
      venue: "Taj Lands End, Mumbai",
      primaryColor: "#4a0e11",
      secondaryColor: "#fcd34d"
  });

  // Content Management State
  const [welcomeMsg, setWelcomeMsg] = useState(() => {
      return localStorage.getItem('wedding_welcome_msg') || "Our hearts are overflowing with joy as we invite you to the beginning of our journey. Your presence makes our story complete. Welcome to our festivities!";
  });
  const [loveStory, setLoveStory] = useState(() => {
      return localStorage.getItem('wedding_love_story') || "From the first glance to forever... it started with a simple coffee that turned into endless conversations.";
  });
  const [highlights, setHighlights] = useState(() => {
      const saved = localStorage.getItem('wedding_highlights');
      return saved ? JSON.parse(saved) : [
          { id: 1, title: "Mehndi & Sangeet", time: "Dec 20th, 6:00 PM", location: "The Grand Ballroom", type: "Music" },
          { id: 2, title: "Engagement Ceremony", time: "Dec 21st, 7:30 PM", location: "The Shanti Gardens", type: "Rings" }
      ];
  });
  const [newHighlight, setNewHighlight] = useState({ title: "", time: "", location: "", type: "Star" });

  useEffect(() => {
      // Persist Content changes
      localStorage.setItem('wedding_welcome_msg', welcomeMsg);
      localStorage.setItem('wedding_love_story', loveStory);
      localStorage.setItem('wedding_highlights', JSON.stringify(highlights));
      localStorage.setItem('wedding_global_config', JSON.stringify(config));
  }, [welcomeMsg, loveStory, highlights, config]);

  const handleSaveConfig = () => {
      localStorage.setItem('wedding_global_config', JSON.stringify(config));
      alert("Configuration Saved!");
  };

  const handleAddGuest = () => {
      const name = prompt("Enter Guest Name:");
      if (!name) return;
      const phone = prompt("Enter Phone Number:") || "";
      const newGuest = {
          id: Date.now(),
          name,
          phone,
          rsvp: true,
          status: "Pending"
      };
      setGuests([...guests, newGuest]);
      setGuestCount(prev => prev + 1);
  };

  const handleDeleteGuest = (id: number) => {
      if (confirm("Are you sure you want to remove this guest?")) {
          setGuests(guests.filter(g => g.id !== id));
          setGuestCount(prev => prev - 1);
      }
  };

  const handleToggleRSVP = (id: number) => {
      setGuests(guests.map(g => 
          g.id === id ? { ...g, rsvp: !g.rsvp } : g
      ));
  }

  const handleAddHighlight = () => {
      if(!newHighlight.title) return;
      setHighlights([...highlights, { ...newHighlight, id: Date.now() }]);
      setNewHighlight({ title: "", time: "", location: "", type: "Star" });
  };

  const handleDeleteHighlight = (id: number) => {
      setHighlights(highlights.filter((h: any) => h.id !== id));
  };

  return (
    <div className="w-full h-full bg-[#fffbf5] flex overflow-hidden font-serif text-[#2d0a0d]">
      
      {/* Sidebar */}
      <div className="w-20 sm:w-64 bg-[#2d0a0d] flex flex-col border-r border-gold-500/30 shadow-2xl relative z-20">
          <div className="p-6 flex items-center justify-center sm:justify-start gap-3 border-b border-gold-500/20">
              <Settings className="text-gold-400 animate-spin-slow" size={24} />
              <h1 className="hidden sm:block text-gold-100 font-heading text-xl tracking-widest">Admin</h1>
          </div>
          
          <nav className="flex-grow p-4 space-y-2">
              {[
                  { id: 'home', label: 'Overview', icon: Home },
                  { id: 'guests', label: 'Guest List', icon: Users },
                  { id: 'content', label: 'App Content', icon: PenTool },
                  { id: 'map', label: 'Live Map', icon: Map },
                  { id: 'gallery', label: 'Gallery', icon: Camera },
                  { id: 'config', label: 'Settings', icon: FileText },
              ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => setActiveView(item.id as any)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${activeView === item.id ? 'bg-gold-500 text-[#2d0a0d] shadow-lg shadow-gold-500/20 font-bold' : 'text-gold-400 hover:bg-white/5 hover:text-gold-200'}`}
                  >
                      <item.icon size={20} />
                      <span className="hidden sm:block text-sm tracking-wide">{item.label}</span>
                  </button>
              ))}
          </nav>

          <div className="p-4 border-t border-gold-500/20">
              <button onClick={onLogout} className="w-full flex items-center gap-3 p-3 rounded-xl text-rose-400 hover:bg-rose-900/20 transition-colors">
                  <ArrowLeft size={20} />
                  <span className="hidden sm:block text-sm font-bold">Logout</span>
              </button>
          </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow flex flex-col h-full overflow-hidden relative">
          {/* Top Bar */}
          <header className="bg-white border-b border-gold-200 h-16 flex items-center justify-between px-8 shadow-sm relative z-10">
              <h2 className="text-2xl font-heading text-[#4a0e11]">
                  {activeView === 'home' && 'Dashboard Overview'}
                  {activeView === 'guests' && 'Guest Management'}
                  {activeView === 'map' && 'Live Venue Tracking'}
                  {activeView === 'gallery' && 'Media Gallery'}
                  {activeView === 'content' && 'Content Management'}
                  {activeView === 'config' && 'Global Settings'}
              </h2>
              <div className="flex items-center gap-4">
                  <div className="bg-gold-100 text-gold-800 px-3 py-1 rounded-full text-xs font-bold border border-gold-300">
                      Admin Access
                  </div>
                  <div className="w-8 h-8 bg-[#4a0e11] rounded-full flex items-center justify-center text-gold-400">
                      <Settings size={16} />
                  </div>
              </div>
          </header>

          {/* Content Area */}
          <main className="flex-grow overflow-y-auto p-8 bg-[#f5f5f4] overscroll-contain">
              
              {activeView === 'home' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      {[
                          { label: 'Total Guests', value: guestCount, icon: Users, color: 'bg-blue-50 text-blue-600' },
                          { label: 'Photos Uploaded', value: photoCount, icon: Camera, color: 'bg-purple-50 text-purple-600' },
                          { label: 'Messages', value: messageCount, icon: MessageSquare, color: 'bg-pink-50 text-pink-600' },
                          { label: 'Days To Go', value: 42, icon: Calendar, color: 'bg-amber-50 text-amber-600' },
                      ].map((stat, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-4">
                                  <div className={`p-3 rounded-xl ${stat.color}`}>
                                      <stat.icon size={24} />
                                  </div>
                                  <span className="text-stone-400 bg-stone-50 px-2 py-1 rounded text-xs font-bold">+12%</span>
                              </div>
                              <h3 className="text-3xl font-bold text-stone-800 mb-1">{stat.value}</h3>
                              <p className="text-stone-500 text-sm font-medium">{stat.label}</p>
                          </div>
                      ))}

                      <div className="col-span-1 md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                          <h3 className="font-heading text-lg mb-4 flex items-center gap-2"><Megaphone size={20} className="text-gold-600"/> Recent Activity</h3>
                          <div className="space-y-4">
                              {[1,2,3].map((_, i) => (
                                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-stone-50 rounded-xl transition-colors border border-transparent hover:border-stone-200">
                                      <div className="w-10 h-10 rounded-full bg-stone-200 flex items-center justify-center text-stone-500 font-bold">GK</div>
                                      <div>
                                          <p className="text-sm font-bold text-stone-800">Guest "Ravi" just checked in.</p>
                                          <p className="text-xs text-stone-400">2 minutes ago</p>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      </div>
                      
                      <div className="col-span-1 md:col-span-2 bg-[#4a0e11] p-6 rounded-2xl shadow-lg text-gold-100 relative overflow-hidden">
                          <div className="relative z-10">
                              <h3 className="font-heading text-lg mb-2">Quick Broadcast</h3>
                              <p className="text-gold-400/80 text-sm mb-6">Send a push notification to all guests instantly.</p>
                              <div className="flex gap-2">
                                  <input type="text" placeholder="Type message..." className="flex-grow bg-white/10 border border-gold-500/30 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gold-400 placeholder-gold-500/30"/>
                                  <button className="bg-gold-500 text-[#4a0e11] px-4 py-2 rounded-lg font-bold text-sm hover:bg-gold-400 transition-colors">Send</button>
                              </div>
                          </div>
                          <div className="absolute -right-10 -bottom-10 opacity-10">
                              <Megaphone size={150} />
                          </div>
                      </div>
                  </div>
              )}

              {activeView === 'guests' && (
                  <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden animate-in fade-in duration-500">
                      <div className="p-6 border-b border-stone-100 flex justify-between items-center">
                          <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                              <input type="text" placeholder="Search guests..." className="pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm w-64 focus:outline-none focus:border-gold-400"/>
                          </div>
                          <button onClick={handleAddGuest} className="bg-[#4a0e11] text-gold-100 px-6 py-3 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#5e181f] transition-colors shadow-lg">
                              <Plus size={16} /> Add Guest
                          </button>
                      </div>
                      <table className="w-full text-sm text-left">
                          <thead className="bg-stone-50 text-stone-500 font-bold uppercase text-xs">
                              <tr>
                                  <th className="px-6 py-5">Guest Name</th>
                                  <th className="px-6 py-5">Phone</th>
                                  <th className="px-6 py-5">RSVP Status</th>
                                  <th className="px-6 py-5">Status</th>
                                  <th className="px-6 py-5 text-right">Actions</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-100">
                              {guests.map((guest) => (
                                  <tr key={guest.id} className="hover:bg-stone-50 transition-colors">
                                      <td className="px-6 py-6 font-medium text-stone-800 text-base">{guest.name}</td>
                                      <td className="px-6 py-6 text-stone-600">{guest.phone}</td>
                                      <td className="px-6 py-6">
                                          <button onClick={() => handleToggleRSVP(guest.id)} className={`px-3 py-1 rounded-full text-xs font-bold cursor-pointer ${guest.rsvp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                              {guest.rsvp ? 'Attending' : 'Not Attending'}
                                          </button>
                                      </td>
                                      <td className="px-6 py-6">
                                          <span className="flex items-center gap-2 text-stone-600">
                                              <span className={`w-2 h-2 rounded-full ${guest.status === 'Checked In' ? 'bg-green-500' : 'bg-stone-300'}`}></span>
                                              {guest.status}
                                          </span>
                                      </td>
                                      <td className="px-6 py-6 text-right space-x-3">
                                          <button className="p-2 hover:bg-stone-200 rounded text-stone-500"><Edit2 size={18}/></button>
                                          <button onClick={() => handleDeleteGuest(guest.id)} className="p-2 hover:bg-red-50 rounded text-red-500"><Trash2 size={18}/></button>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}
              
              {activeView === 'map' && (
                  <div className="h-[calc(100vh-10rem)] animate-in fade-in zoom-in duration-500">
                       <AdminLiveMap />
                  </div>
              )}

              {activeView === 'gallery' && (
                  <div className="grid grid-cols-4 gap-6 animate-in fade-in duration-500">
                      <div className="col-span-4 bg-white p-6 rounded-xl mb-4 flex justify-between items-center shadow-sm border border-stone-100">
                           <h3 className="font-bold text-stone-800 text-lg">Moderation Queue (3 Pending)</h3>
                           <button className="text-sm text-blue-600 font-bold hover:underline">Review All</button>
                      </div>
                      {Array.from({ length: 8 }).map((_, i) => (
                          <div key={i} className="aspect-square bg-stone-200 rounded-xl overflow-hidden relative group shadow-sm">
                              <img src={`https://source.unsplash.com/random/400x400?wedding,indian&sig=${i}`} className="w-full h-full object-cover" alt="Gallery" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                   <button className="p-3 bg-white rounded-full text-stone-900 hover:bg-red-500 hover:text-white transition-colors shadow-lg"><Trash2 size={18}/></button>
                                   <button className="p-3 bg-white rounded-full text-stone-900 hover:bg-blue-500 hover:text-white transition-colors shadow-lg"><ExternalLink size={18}/></button>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {activeView === 'content' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in slide-in-from-bottom-8 duration-500">
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                          <h3 className="font-heading text-lg mb-4 flex items-center gap-2 text-[#4a0e11]"><FileText size={18}/> Welcome Screen Message</h3>
                          <textarea 
                              className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-gold-400 text-sm leading-relaxed"
                              value={welcomeMsg}
                              onChange={(e) => setWelcomeMsg(e.target.value)}
                              placeholder="Enter the welcome message shown to all guests..."
                          ></textarea>
                          <p className="text-xs text-stone-400 mt-2">This text appears on the main welcome card.</p>
                      </div>
                      
                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
                          <h3 className="font-heading text-lg mb-4 flex items-center gap-2 text-[#4a0e11]"><Heart size={18}/> Our Love Story</h3>
                          <textarea 
                              className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl text-stone-700 focus:outline-none focus:border-gold-400 text-sm leading-relaxed"
                              value={loveStory}
                              onChange={(e) => setLoveStory(e.target.value)}
                              placeholder="Tell your story..."
                          ></textarea>
                          <p className="text-xs text-stone-400 mt-2">This text appears in the 'Our Love Story' modal.</p>
                      </div>

                      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 col-span-1 lg:col-span-2">
                          <h3 className="font-heading text-lg mb-4 flex items-center gap-2 text-[#4a0e11]"><Calendar size={18}/> Manage Highlights</h3>
                          <div className="mb-4 grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-stone-50 rounded-xl border border-stone-200">
                               <input placeholder="Event Title" className="p-2 rounded border border-stone-200 text-sm" value={newHighlight.title} onChange={e=>setNewHighlight({...newHighlight, title: e.target.value})} />
                               <input placeholder="Time (e.g. 6:00 PM)" className="p-2 rounded border border-stone-200 text-sm" value={newHighlight.time} onChange={e=>setNewHighlight({...newHighlight, time: e.target.value})} />
                               <input placeholder="Location" className="p-2 rounded border border-stone-200 text-sm" value={newHighlight.location} onChange={e=>setNewHighlight({...newHighlight, location: e.target.value})} />
                               <button onClick={handleAddHighlight} className="bg-gold-500 text-[#4a0e11] font-bold rounded py-2 text-sm hover:bg-gold-400 flex items-center justify-center gap-2"><Plus size={14}/> Add Event</button>
                          </div>
                          <div className="space-y-3">
                              {highlights.map((h: any) => (
                                  <div key={h.id} className="flex items-center justify-between p-4 bg-white border border-stone-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                      <div>
                                          <h4 className="font-bold text-[#4a0e11]">{h.title}</h4>
                                          <p className="text-xs text-stone-500 flex gap-3 mt-1">
                                              <span className="flex items-center gap-1"><Clock size={10}/> {h.time}</span>
                                              <span className="flex items-center gap-1"><MapPin size={10}/> {h.location}</span>
                                          </p>
                                      </div>
                                      <button onClick={() => handleDeleteHighlight(h.id)} className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                                  </div>
                              ))}
                          </div>
                      </div>
                  </div>
              )}

              {activeView === 'config' && (
                  <div className="bg-white max-w-2xl mx-auto rounded-2xl shadow-sm border border-stone-100 p-8 animate-in slide-in-from-bottom-8 duration-500">
                      <h3 className="font-heading text-xl mb-6 border-b border-stone-100 pb-4">Global Settings</h3>
                      <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Couple Name</label>
                                  <input type="text" value={config.coupleName} onChange={e => setConfig({...config, coupleName: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-gold-400"/>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Event Date</label>
                                  <input type="date" value={config.date} onChange={e => setConfig({...config, date: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-gold-400"/>
                              </div>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Venue Name</label>
                              <input type="text" value={config.venue} onChange={e => setConfig({...config, venue: e.target.value})} className="w-full p-3 bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:border-gold-400"/>
                          </div>
                          <div className="grid grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Primary Color</label>
                                  <div className="flex items-center gap-3">
                                      <input type="color" value={config.primaryColor} onChange={e => setConfig({...config, primaryColor: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-0"/>
                                      <span className="text-sm font-mono text-stone-600">{config.primaryColor}</span>
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Accent Color</label>
                                  <div className="flex items-center gap-3">
                                      <input type="color" value={config.secondaryColor} onChange={e => setConfig({...config, secondaryColor: e.target.value})} className="h-10 w-10 rounded cursor-pointer border-0"/>
                                      <span className="text-sm font-mono text-stone-600">{config.secondaryColor}</span>
                                  </div>
                              </div>
                          </div>
                          <div className="pt-6 border-t border-stone-100 flex justify-end">
                              <button onClick={handleSaveConfig} className="bg-[#4a0e11] text-gold-100 px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-[#5e181f] transition-all shadow-lg shadow-maroon-900/20">
                                  <Save size={18} /> Save Changes
                              </button>
                          </div>
                      </div>
                  </div>
              )}

          </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
