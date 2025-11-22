
import React, { useState, useEffect, useRef } from 'react';
import { 
  Settings, MessageSquare, Home, Users, 
  Trash2, Check, X, Save, Upload, Image as ImageIcon, Ban, Send, Megaphone, Palette, Sparkles, CloudFog, Flower, Camera, LogOut, Search,
  Eye, RotateCcw, CheckCircle, MapPin
} from 'lucide-react';
import { socket } from '../socket';

// --- Image Resizer for LocalStorage ---
const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                const MAX_SIZE = 800;
                
                if (width > height) {
                    if (width > MAX_SIZE) {
                        height *= MAX_SIZE / width;
                        width = MAX_SIZE;
                    }
                } else {
                    if (height > MAX_SIZE) {
                        width *= MAX_SIZE / height;
                        height = MAX_SIZE;
                    }
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
            img.src = e.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

interface AdminDashboardProps {
  onLogout: () => void;
}

interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
    timestamp: number;
}

interface GuestEntry {
    name: string;
    role: 'guest' | 'couple' | 'admin';
    joinedAt: number;
}

interface MapMarker {
    name: string;
    role: 'guest' | 'couple' | 'admin';
    lat: number;
    lng: number;
    timestamp: number;
}

interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset' | 'lavender' | 'forest';
    effect: 'dust' | 'petals' | 'lights' | 'fireflies' | 'none';
}

const THEME_BASES = {
    royal: 'bg-[#4a0404]',
    midnight: 'bg-[#020617]', 
    sunset: 'bg-[#2a0a18]',
    lavender: 'bg-[#2e1065]',
    forest: 'bg-[#052e16]',
};

const Atmosphere = ({ theme }: { theme: ThemeConfig }) => {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 transition-all duration-1000">
            
            {/* --- THEME: MIDNIGHT (Cinematic Cool) --- */}
            {theme.gradient === 'midnight' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-[#0f172a] to-black"></div>
                    <div className="absolute top-1/4 -left-1/2 w-[200%] h-[1px] bg-blue-400/30 blur-md rotate-[-10deg] animate-pulse-slow"></div>
                    <div className="absolute bottom-1/3 -left-1/2 w-[200%] h-[2px] bg-teal-500/20 blur-xl rotate-[5deg] animate-float"></div>
                    <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-800/20 rounded-full blur-[100px] animate-float" style={{animationDelay: '2s'}}></div>
                    <div className="absolute inset-0 opacity-[0.04]" 
                         style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}>
                    </div>
                    {[...Array(15)].map((_, i) => (
                        <div key={`star-${i}`} 
                             className="absolute rounded-full bg-blue-100 animate-pulse-slow"
                             style={{
                                 top: `${Math.random() * 100}%`,
                                 left: `${Math.random() * 100}%`,
                                 width: `${Math.random() * 2 + 1}px`,
                                 height: `${Math.random() * 2 + 1}px`,
                                 animationDelay: `${Math.random() * 4}s`,
                                 opacity: Math.random() * 0.7 + 0.3
                             }}
                        />
                    ))}
                </>
            )}

            {/* --- THEME: ROYAL (3D Romantic Red) --- */}
            {theme.gradient === 'royal' && (
                <>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_#be123c_0%,_#881337_40%,_#4c0519_80%,_#000000_100%)]"></div>
                    <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[100px] animate-float mix-blend-screen"></div>
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-red-900/40 rounded-full blur-[120px] animate-float" style={{animationDelay: '-3s', animationDuration: '10s'}}></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-rose-400/10 to-transparent opacity-60 animate-pulse-slow"></div>
                    <div className="absolute inset-0 opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    {[...Array(10)].map((_, i) => (
                        <div key={`gold-${i}`} className="absolute rounded-full bg-amber-400 animate-float"
                             style={{
                                 left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
                                 width: `${Math.random() * 3 + 1}px`, height: `${Math.random() * 3 + 1}px`,
                                 opacity: Math.random() * 0.5 + 0.2, animationDuration: `${Math.random() * 8 + 12}s`,
                                 boxShadow: '0 0 8px 1px rgba(251, 191, 36, 0.3)'
                             }}></div>
                    ))}
                </>
            )}

            {/* --- THEME: SUNSET (Living Art) --- */}
            {theme.gradient === 'sunset' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-[#4c1d95] via-[#be185d] to-[#fb923c]"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-20 left-1/4 w-72 h-72 bg-orange-500/30 rounded-full blur-[60px] animate-float"></div>
                    <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[400px] bg-pink-600/30 rounded-full blur-[80px] animate-pulse-slow"></div>
                </>
            )}

            {/* --- THEME: LAVENDER (Soft Mist) --- */}
            {theme.gradient === 'lavender' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-900 via-violet-950 to-black"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#e879f9_0%,_transparent_50%)] opacity-20"></div>
                    {[...Array(6)].map((_, i) => (
                         <div key={`mist-${i}`} className="absolute bg-purple-400/10 rounded-full blur-[100px] animate-float"
                              style={{
                                  left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                                  width: '400px', height: '400px',
                                  animationDelay: `${i * -2}s`, animationDuration: '15s'
                              }}></div>
                    ))}
                </>
            )}

            {/* --- THEME: FOREST (Enchanted) --- */}
            {theme.gradient === 'forest' && (
                <>
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-900 via-[#022c22] to-black"></div>
                    <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-teal-600/10 rounded-full blur-[120px]"></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] opacity-10 mix-blend-overlay"></div>
                </>
            )}

            {/* --- OVERLAY EFFECTS --- */}
            {theme.effect !== 'none' && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                     {theme.effect === 'petals' && [...Array(12)].map((_, i) => (
                         <div key={`petal-${i}`} className="absolute bg-rose-300/40 rounded-[100%_0%_100%_0%] animate-float shadow-sm"
                              style={{
                                  left: `${Math.random() * 100}%`, top: `${Math.random() * 120}%`,
                                  width: `${Math.random() * 15 + 8}px`, height: `${Math.random() * 15 + 8}px`,
                                  animationDuration: `${Math.random() * 10 + 15}s`, animationDelay: `${Math.random() * -5}s`,
                                  transform: `rotate(${Math.random() * 360}deg)`
                              }}></div>
                     ))}
                     {theme.effect === 'dust' && (
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                     )}
                     {theme.effect === 'lights' && (
                         <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-50 animate-shimmer" style={{ backgroundSize: '200% 200%' }}></div>
                     )}
                     {theme.effect === 'fireflies' && [...Array(25)].map((_, i) => (
                         <div key={`fly-${i}`} className="absolute bg-yellow-300 rounded-full animate-float shadow-[0_0_8px_2px_rgba(253,224,71,0.4)]"
                              style={{
                                  left: `${Math.random()*100}%`, top: `${Math.random()*100}%`,
                                  width: `${Math.random()*3+1}px`, height: `${Math.random()*3+1}px`,
                                  animationDuration: `${Math.random()*5+5}s`, opacity: Math.random() * 0.8
                              }}></div>
                     ))}
                </div>
            )}
        </div>
    );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'gallery' | 'messages' | 'settings' | 'theme' | 'map'>('overview');
  const [config, setConfig] = useState({ coupleName: "", date: "", welcomeMsg: "", coupleImage: "" });
  const [theme, setTheme] = useState<ThemeConfig>({ gradient: 'royal', effect: 'dust' });
  const [draftTheme, setDraftTheme] = useState<ThemeConfig>({ gradient: 'royal', effect: 'dust' });
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);
  const [mapMarkers, setMapMarkers] = useState<MapMarker[]>([]);
  const [msgCount, setMsgCount] = useState(0);
  const [heartCount, setHeartCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  
  const [isDirty, setIsDirty] = useState(false);
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [announceMsg, setAnnounceMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const handleBroadcast = () => {
      if (!announceMsg.trim()) return;
      socket.emit('announcement', announceMsg);
      setAnnounceMsg("");
      alert("Love Note Sent to All Guests!");
  };

  const handleBlockUser = (name: string) => {
      if(confirm(`Block ${name} from the app?`)) {
          socket.emit('block_user', name);
      }
  };

  // --- Persistence Effects ---
  useEffect(() => {
      try {
          localStorage.setItem('wedding_chat_messages', JSON.stringify(messages));
      } catch (e) {}
  }, [messages]);

  useEffect(() => {
      try {
          localStorage.setItem('wedding_gallery_media', JSON.stringify(photos));
      } catch (e) {}
  }, [photos]);

  useEffect(() => {
      localStorage.setItem('wedding_heart_count', heartCount.toString());
  }, [heartCount]);
  
  useEffect(() => {
      localStorage.setItem('wedding_theme_config', JSON.stringify(theme));
  }, [theme]);

  useEffect(() => {
      // Initial load from local storage
      const savedConfig = localStorage.getItem('wedding_global_config');
      const savedImage = localStorage.getItem('wedding_couple_image');
      const savedTheme = localStorage.getItem('wedding_theme_config');
      
      if (savedConfig) {
          const parsed = JSON.parse(savedConfig);
          setConfig({ 
              coupleName: parsed.coupleName || "",
              date: parsed.date || "",
              welcomeMsg: parsed.welcomeMsg || "",
              coupleImage: savedImage || parsed.coupleImage || ""
          });
      } else {
          setConfig({ coupleName: "Sneha & Aman", date: "2025-11-26", welcomeMsg: "Join us as we begin our forever.", coupleImage: savedImage || "" });
      }
      if (savedTheme) {
          const t = JSON.parse(savedTheme);
          setTheme(t);
          setDraftTheme(t);
      }

      // Socket Sync
      socket.emit('request_sync');

      const handleFullSync = (state: any) => {
          setMessages(state.messages || []);
          setMsgCount(state.messages?.length || 0);
          setPhotos(state.gallery || []);
          setHeartCount(state.heartCount || 0);
          setGuestList(state.guestList || []);
          setMapMarkers(state.mapMarkers || []);
          if(state.config) setConfig(state.config);
          if(state.theme) {
              setTheme(state.theme);
              if (!isDirty) setDraftTheme(state.theme);
          }
      };

      socket.on('full_sync', handleFullSync);
      socket.on('message', (data) => {
          setMessages(prev => {
              if (prev.some(m => m.id === data.payload.id)) return prev;
              return [...prev, data.payload];
          });
          setMsgCount(prev => prev + 1);
      });
      socket.on('heart_update', (data) => setHeartCount(data.count));
      socket.on('gallery_sync', (data) => setPhotos(data.payload));
      socket.on('user_presence', (data) => setGuestList(prev => [...prev.filter(g => g.name !== data.payload.name), data.payload]));
      socket.on('location_update', (markers) => setMapMarkers(markers));
      
      return () => {
          socket.off('full_sync', handleFullSync);
          socket.off('message');
          socket.off('heart_update');
          socket.off('gallery_sync');
          socket.off('user_presence');
          socket.off('location_update');
      };
  }, [isDirty]);

  useEffect(() => {
      if (activeTab === 'map' && mapContainerRef.current) {
          const L = (window as any).L;
          if (!L) return;

          mapContainerRef.current.innerHTML = "<div id='admin-map' style='width:100%; height:100%;'></div>";
          
          const map = L.map('admin-map').setView([20.5937, 78.9629], 4);
          
          L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
              maxZoom: 19
          }).addTo(map);

          mapMarkers.forEach((m: MapMarker) => {
              const isCouple = m.role === 'couple';
              const iconHtml = `
                  <div class="flex flex-col items-center">
                      <div class="w-8 h-8 rounded-full border-2 ${isCouple ? 'border-yellow-400 bg-yellow-500 text-black' : 'border-white bg-passion-800 text-white'} flex items-center justify-center font-bold shadow-lg">
                         ${isCouple ? '👑' : m.name.charAt(0)}
                      </div>
                      <div class="bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md mt-1 whitespace-nowrap font-bold">${m.name}</div>
                  </div>
              `;
              const icon = L.divIcon({
                  className: 'custom-marker',
                  html: iconHtml,
                  iconSize: [40, 60],
                  iconAnchor: [20, 60]
              });
              L.marker([m.lat, m.lng], { icon }).addTo(map);
          });

          if (mapMarkers.length > 0) {
              const group = L.featureGroup(mapMarkers.map((m: MapMarker) => L.marker([m.lat, m.lng])));
              map.fitBounds(group.getBounds().pad(0.2));
          }

          return () => map.remove();
      }
  }, [activeTab, mapMarkers]);

  const handleSaveConfig = () => {
      socket.emit('config_update', config);
      localStorage.setItem('wedding_global_config', JSON.stringify(config));
      if(config.coupleImage) localStorage.setItem('wedding_couple_image', config.coupleImage);
      alert("Settings Updated!");
  };

  const handlePreviewTheme = (newThemeParts: Partial<ThemeConfig>) => {
      setDraftTheme(prev => ({ ...prev, ...newThemeParts }));
      setIsDirty(true);
  };

  const handleSaveTheme = () => {
      setTheme(draftTheme);
      socket.emit('theme_update', draftTheme);
      localStorage.setItem('wedding_theme_config', JSON.stringify(draftTheme));
      setIsDirty(false);
  };

  const handleResetTheme = () => {
      const def = { gradient: 'royal' as const, effect: 'dust' as const };
      setDraftTheme(def);
      setIsDirty(true);
  };

  const handleClearData = () => {
      if (confirm("This will wipe all local data. Server data may persist until restart. Continue?")) {
          localStorage.clear();
          window.location.reload();
      }
  };

  const handleCoupleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          try {
              const base64 = await resizeImage(e.target.files[0]);
              setConfig(prev => ({ ...prev, coupleImage: base64 }));
          } catch (err) {
              console.error(err);
              alert("Failed to process image.");
          }
      }
  };

  const handleDeleteMessage = (id: string) => {
      const updated = messages.filter(m => m.id !== id);
      setMessages(updated);
      setMsgCount(updated.length);
      socket.emit('message_sync', updated);
  };

  const handleDeletePhoto = (id: string) => {
      if(confirm("Delete this photo?")) {
          const updated = photos.filter(p => p.id !== id);
          setPhotos(updated);
          socket.emit('gallery_sync', updated);
      }
  };

  const handleEditPhotoClick = (photo: MediaItem) => {
      setEditingPhotoId(photo.id);
      setEditCaption(photo.caption || "");
  };

  const handleSavePhotoCaption = (id: string) => {
      const updated = photos.map(p => p.id === id ? { ...p, caption: editCaption } : p);
      setPhotos(updated);
      socket.emit('gallery_sync', updated);
      setEditingPhotoId(null);
  };

  const filteredGuests = guestList.filter(g => g.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className={`w-full h-full flex flex-col font-serif text-pink-100 transition-all duration-1000 ${THEME_BASES[draftTheme.gradient] || THEME_BASES.royal}`}>
      
      <Atmosphere theme={draftTheme} />

      {/* Header */}
      <header className="p-4 bg-black/50 backdrop-blur-md border-b border-pink-500/20 flex justify-between items-center shadow-lg z-20 relative">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-600 text-white rounded-lg flex items-center justify-center font-bold shadow-md">
                  <Settings size={20} />
              </div>
              <div>
                  <h1 className="font-heading text-xl text-white">Love Admin</h1>
                  <p className="text-[10px] text-pink-400 uppercase tracking-widest">Control Center</p>
              </div>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-lg text-pink-400 hover:text-white transition-colors">
              <LogOut size={20} />
          </button>
      </header>

      <div className="flex flex-grow overflow-hidden relative z-10">
          {/* Sidebar */}
          <aside className="w-20 bg-black/30 border-r border-white/5 flex flex-col items-center py-4 gap-4 z-10 backdrop-blur-sm">
              {[
                  { id: 'overview', icon: Home, label: 'Home' },
                  { id: 'guests', icon: Users, label: 'Guests' },
                  { id: 'map', icon: MapPin, label: 'Map' },
                  { id: 'gallery', icon: Camera, label: 'Media' },
                  { id: 'messages', icon: MessageSquare, label: 'Chat' },
                  { id: 'theme', icon: Palette, label: 'Theme' },
                  { id: 'settings', icon: Settings, label: 'Settings' },
              ].map((item) => (
                  <button 
                    key={item.id} 
                    onClick={() => setActiveTab(item.id as any)}
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${activeTab === item.id ? 'bg-pink-600 text-white shadow-glow' : 'text-pink-400/50 hover:bg-white/5 hover:text-pink-200'}`}
                  >
                      <item.icon size={20} />
                  </button>
              ))}
          </aside>

          {/* Content */}
          <main className="flex-grow overflow-y-auto p-6">
              {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                      <h2 className="text-2xl font-romantic text-white mb-4 drop-shadow-md">Dashboard Overview</h2>
                      <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/5 p-5 rounded-xl border border-pink-500/20 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-pink-400 text-xs uppercase tracking-wider">Guests</span>
                                  <Users size={16} className="text-pink-500" />
                              </div>
                              <div className="text-3xl font-bold text-white">{guestList.length}</div>
                          </div>
                          <div className="bg-white/5 p-5 rounded-xl border border-pink-500/20 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-pink-400 text-xs uppercase tracking-wider">Messages</span>
                                  <MessageSquare size={16} className="text-pink-500" />
                              </div>
                              <div className="text-3xl font-bold text-white">{msgCount}</div>
                          </div>
                          <div className="bg-white/5 p-5 rounded-xl border border-pink-500/20 shadow-lg">
                              <div className="flex items-center justify-between mb-2">
                                  <span className="text-pink-400 text-xs uppercase tracking-wider">Hearts</span>
                                  <Sparkles size={16} className="text-pink-500" />
                              </div>
                              <div className="text-3xl font-bold text-white">{heartCount}</div>
                          </div>
                      </div>
                      
                      {/* Announcement Widget */}
                      <div className="bg-gradient-to-r from-passion-700 to-passion-800 p-6 rounded-xl border border-pink-500/30 shadow-lg">
                          <div className="flex items-center gap-2 mb-4">
                               <Megaphone className="text-pink-400" size={20} />
                               <h3 className="font-bold text-white">Send a Love Note (Announcement)</h3>
                          </div>
                          <div className="flex gap-3">
                              <input 
                                type="text" 
                                value={announceMsg}
                                onChange={e => setAnnounceMsg(e.target.value)}
                                className="flex-grow bg-black/40 border border-pink-500/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-pink-500"
                                placeholder="e.g. The first dance is starting..."
                              />
                              <button onClick={handleBroadcast} className="bg-pink-600 text-white font-bold px-6 py-3 rounded-lg shadow-lg hover:bg-pink-500 transition-all flex items-center gap-2">
                                  <Send size={18}/> Send
                              </button>
                          </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                          <h3 className="font-bold text-pink-200 mb-4">Danger Zone</h3>
                          <button onClick={handleClearData} className="w-full py-3 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
                              <Trash2 size={16} /> Wipe All Data
                          </button>
                      </div>
                  </div>
              )}

              {activeTab === 'guests' && (
                  <div className="space-y-6 animate-fade-in">
                       <div className="flex justify-between items-center">
                          <h2 className="text-2xl font-romantic text-white drop-shadow-md">Guest Management</h2>
                          <div className="relative w-64">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-400" size={16}/>
                              <input 
                                type="text" 
                                placeholder="Search guests..." 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-black/30 border border-pink-500/30 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-pink-500"
                              />
                          </div>
                       </div>

                       <div className="bg-white/5 rounded-xl border border-pink-500/20 overflow-hidden shadow-lg">
                           <table className="w-full text-left border-collapse">
                               <thead>
                                   <tr className="bg-black/20 border-b border-pink-500/10 text-pink-400 text-xs uppercase tracking-wider">
                                       <th className="p-4">Name</th>
                                       <th className="p-4">Role</th>
                                       <th className="p-4">Joined</th>
                                       <th className="p-4 text-right">Action</th>
                                   </tr>
                               </thead>
                               <tbody className="divide-y divide-pink-500/10">
                                   {filteredGuests.map((guest, i) => (
                                       <tr key={i} className="hover:bg-white/5 transition-colors">
                                           <td className="p-4 font-bold text-pink-100">{guest.name}</td>
                                           <td className="p-4">
                                               <span className={`text-[10px] px-2 py-1 rounded-full border ${
                                                   guest.role === 'couple' ? 'bg-white text-passion-900 font-bold' : 'border-pink-500/30 text-pink-300'
                                               }`}>{guest.role}</span>
                                           </td>
                                           <td className="p-4 text-sm text-stone-400">{new Date(guest.joinedAt).toLocaleString()}</td>
                                           <td className="p-4 text-right">
                                               {guest.role !== 'admin' && (
                                                   <button onClick={() => handleBlockUser(guest.name)} className="text-red-400 hover:text-red-200 bg-red-500/10 hover:bg-red-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                                                       Block
                                                   </button>
                                               )}
                                           </td>
                                       </tr>
                                   ))}
                               </tbody>
                           </table>
                           {filteredGuests.length === 0 && (
                               <div className="p-8 text-center text-stone-500 italic">No guests found.</div>
                           )}
                       </div>
                  </div>
              )}

              {activeTab === 'messages' && (
                  <div className="space-y-6 animate-fade-in">
                      <h2 className="text-2xl font-romantic text-white drop-shadow-md">Chat Moderation</h2>
                      <div className="space-y-3">
                          {messages.map((msg, i) => (
                              <div key={msg.id || i} className="bg-white/5 p-4 rounded-xl border border-pink-500/10 flex justify-between items-start group hover:border-pink-500/30 transition-colors shadow-sm">
                                   <div className="max-w-[80%]">
                                       <div className="flex items-center gap-2 mb-1">
                                           <span className="font-bold text-pink-200">{msg.sender}</span>
                                           <span className="text-[10px] text-stone-500 bg-black/30 px-2 rounded-full">{msg.timestamp}</span>
                                       </div>
                                       {msg.type === 'sticker' ? (
                                           <span className="text-xs bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded border border-pink-500/20">Sticker</span>
                                       ) : (
                                           <p className="text-stone-300 text-sm">{msg.text}</p>
                                       )}
                                   </div>
                                   <button onClick={() => handleDeleteMessage(msg.id)} className="text-stone-500 hover:text-red-400 p-2 bg-black/20 rounded-lg hover:bg-red-500/10 transition-all opacity-50 group-hover:opacity-100">
                                       <Trash2 size={16} />
                                   </button>
                              </div>
                          ))}
                          {messages.length === 0 && <div className="text-center text-stone-500 italic py-10">No messages yet.</div>}
                      </div>
                  </div>
              )}
              
              {/* MAP TAB */}
              {activeTab === 'map' && (
                   <div className="flex-grow relative z-10 flex flex-col h-full">
                       <h2 className="text-2xl font-romantic text-white drop-shadow-md mb-4">Guest Locations</h2>
                       <div ref={mapContainerRef} className="flex-grow w-full bg-black/50 rounded-xl overflow-hidden border border-pink-500/20" style={{minHeight: '400px'}}></div>
                   </div>
              )}

              {activeTab === 'theme' && (
                  <div className="space-y-8 animate-fade-in max-w-3xl pb-20">
                      <div className="flex justify-between items-center">
                           <h2 className="text-2xl font-romantic text-white flex items-center gap-3 drop-shadow-md">
                              <Palette className="text-pink-500"/> Mood & Vibe
                           </h2>
                           <div className="flex items-center gap-3">
                               <button 
                                  onClick={handleResetTheme} 
                                  className="px-4 py-2 rounded-lg border border-white/20 text-pink-200 hover:bg-white/10 hover:text-white transition-colors text-sm flex items-center gap-2"
                               >
                                   <RotateCcw size={14} /> Reset
                               </button>
                               <button 
                                  onClick={handleSaveTheme}
                                  disabled={!isDirty}
                                  className={`px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all ${isDirty ? 'bg-green-600 text-white hover:bg-green-500 hover:scale-105' : 'bg-white/10 text-stone-400 cursor-not-allowed'}`}
                               >
                                   {isDirty ? <Save size={16} /> : <CheckCircle size={16} />}
                                   {isDirty ? 'Broadcast Changes' : 'Published'}
                               </button>
                           </div>
                      </div>
                      
                      <div className="bg-white/5 p-6 rounded-xl border border-pink-500/20 shadow-xl">
                           <h3 className="text-pink-400 font-bold text-sm uppercase tracking-widest mb-4">Background Theme</h3>
                           <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
                               {[
                                   { id: 'royal', label: 'Romantic Red', class: 'bg-[radial-gradient(circle_at_center,#be123c,#4c0519)]' },
                                   { id: 'midnight', label: 'Cinematic Cool', class: 'bg-gradient-to-br from-slate-900 via-blue-950 to-black' },
                                   { id: 'sunset', label: 'Golden Hour', class: 'bg-gradient-to-b from-[#be123c] to-[#f59e0b]' },
                                   { id: 'lavender', label: 'Lavender Mist', class: 'bg-gradient-to-b from-purple-700 to-black' },
                                   { id: 'forest', label: 'Enchanted Forest', class: 'bg-gradient-to-b from-emerald-800 to-black' },
                               ].map(opt => (
                                   <button 
                                        key={opt.id}
                                        onClick={() => handlePreviewTheme({ gradient: opt.id as any })}
                                        className={`relative h-32 rounded-lg border-2 transition-all overflow-hidden group flex flex-col ${draftTheme.gradient === opt.id ? 'border-pink-500 scale-105 shadow-glow ring-2 ring-pink-500/50' : 'border-white/10 hover:border-white/30'}`}
                                   >
                                       <div className={`absolute inset-0 ${opt.class}`}></div>
                                       {/* Previews */}
                                       {opt.id === 'midnight' && <div className="absolute inset-0 opacity-30 bg-[conic-gradient(from_0deg,transparent,white,transparent)] animate-spin-slow blur-md"></div>}
                                       {opt.id === 'royal' && <div className="absolute inset-0 bg-rose-500/20 rounded-full blur-xl"></div>}
                                       {opt.id === 'lavender' && <div className="absolute top-0 left-0 w-full h-full bg-purple-500/20 blur-lg"></div>}
                                       
                                       <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors p-2">
                                            <span className="font-bold text-white text-xs shadow-black/50 drop-shadow-md text-center leading-tight mb-2">{opt.label}</span>
                                            {draftTheme.gradient !== opt.id && (
                                                <span className="text-[10px] bg-white/20 px-2 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Eye size={10} /> Preview
                                                </span>
                                            )}
                                       </div>
                                       {draftTheme.gradient === opt.id && (
                                           <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-0.5"><Check size={12}/></div>
                                       )}
                                   </button>
                               ))}
                           </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-xl border border-pink-500/20 shadow-xl">
                           <h3 className="text-pink-400 font-bold text-sm uppercase tracking-widest mb-4">Atmospheric Effects</h3>
                           <div className="grid grid-cols-5 gap-4">
                               {[
                                   { id: 'dust', label: 'Sparkle', icon: Sparkles },
                                   { id: 'petals', label: 'Petals', icon: Flower },
                                   { id: 'lights', label: 'Shimmer', icon: CloudFog },
                                   { id: 'fireflies', label: 'Fireflies', icon: Send },
                                   { id: 'none', label: 'Clean', icon: Ban },
                               ].map(opt => (
                                   <button 
                                        key={opt.id}
                                        onClick={() => handlePreviewTheme({ effect: opt.id as any })}
                                        className={`flex flex-col items-center justify-center gap-3 py-6 rounded-lg border transition-all relative overflow-hidden group ${draftTheme.effect === opt.id ? 'bg-white/10 border-pink-500 text-white' : 'bg-black/20 border-white/10 text-stone-400 hover:bg-white/5'}`}
                                   >
                                       <opt.icon size={24} className={draftTheme.effect === opt.id ? 'text-pink-400' : 'group-hover:text-pink-200'} />
                                       <span className="text-xs font-bold uppercase">{opt.label}</span>
                                       {draftTheme.effect !== opt.id && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Eye size={16} className="text-white"/>
                                            </div>
                                       )}
                                   </button>
                               ))}
                           </div>
                      </div>
                  </div>
              )}
              
              {activeTab === 'gallery' && (
                   <div className="space-y-6 animate-fade-in">
                       <h2 className="text-2xl font-romantic text-white drop-shadow-md">Media Gallery</h2>
                       <div className="grid grid-cols-3 gap-4">
                           {photos.map(photo => (
                               <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/40 shadow-md">
                                   <img src={photo.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Gallery" />
                                   
                                   {/* Overlay Controls */}
                                   <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                                       <button onClick={() => handleEditPhotoClick(photo)} className="text-blue-400 bg-white/10 p-2 rounded-full hover:bg-white/20"><Settings size={20}/></button>
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
                           {photos.length === 0 && <p className="col-span-3 text-stone-500 italic">No photos shared.</p>}
                       </div>
                   </div>
              )}
              {activeTab === 'settings' && (
                  <div className="space-y-6 animate-fade-in max-w-md">
                      <h2 className="text-2xl font-romantic text-white drop-shadow-md">Event Settings</h2>
                      
                      <div className="space-y-4">
                          <div>
                              <label className="block text-xs text-pink-400 uppercase tracking-widest mb-2">Couple Names</label>
                              <input 
                                type="text" 
                                value={config.coupleName} 
                                onChange={e => setConfig({...config, coupleName: e.target.value})}
                                className="w-full bg-black/30 border border-pink-500/30 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none"
                              />
                          </div>
                          <div>
                              <label className="block text-xs text-pink-400 uppercase tracking-widest mb-2">Event Date</label>
                              <input 
                                type="date" 
                                value={config.date} 
                                onChange={e => setConfig({...config, date: e.target.value})}
                                className="w-full bg-black/30 border border-pink-500/30 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none"
                              />
                          </div>
                          
                          <div>
                              <label className="block text-xs text-pink-400 uppercase tracking-widest mb-2">Main Photo (Welcome Screen)</label>
                              <div className="flex gap-4 items-start">
                                  <div className="flex-grow space-y-3">
                                      <label className="flex cursor-pointer bg-pink-600/20 border border-pink-500/30 hover:bg-pink-600/30 rounded-lg p-3 flex items-center justify-center gap-2 transition-colors group">
                                          <Upload size={16} className="text-pink-500 group-hover:scale-110 transition-transform"/>
                                          <span className="text-xs font-bold text-pink-100">Upload New Photo</span>
                                          <input type="file" className="hidden" accept="image/*" onChange={handleCoupleImageUpload} />
                                      </label>
                                  </div>
                                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500/30 bg-black/50 shrink-0 relative">
                                        {config.coupleImage ? (
                                            <img src={config.coupleImage} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-stone-600">
                                                <ImageIcon size={24} />
                                            </div>
                                        )}
                                  </div>
                              </div>
                          </div>

                          <div>
                              <label className="block text-xs text-pink-400 uppercase tracking-widest mb-2">Welcome Note</label>
                              <textarea 
                                rows={4}
                                value={config.welcomeMsg} 
                                onChange={e => setConfig({...config, welcomeMsg: e.target.value})}
                                className="w-full bg-black/30 border border-pink-500/30 rounded-lg p-3 text-white focus:border-pink-500 focus:outline-none"
                              />
                          </div>
                          <button onClick={handleSaveConfig} className="w-full bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-500 transition-colors flex items-center justify-center gap-2 shadow-glow">
                              <Save size={18} /> Save Changes
                          </button>
                      </div>
                  </div>
              )}
          </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
