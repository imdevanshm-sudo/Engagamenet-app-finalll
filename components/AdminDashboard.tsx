
import React, { useState, useEffect } from 'react';
import { 
  Settings, MessageSquare, Home, Users, 
  Trash2, Check, X, Save, Upload, Image as ImageIcon, Film, Ban, Send, Megaphone, Palette, Sparkles, CloudFog, Flower, Camera, LogOut
} from 'lucide-react';

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

interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset';
    effect: 'dust' | 'petals' | 'lights' | 'none';
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'guests' | 'gallery' | 'messages' | 'settings' | 'theme'>('overview');
  const [config, setConfig] = useState({ coupleName: "", date: "", welcomeMsg: "", coupleImage: "" });
  const [theme, setTheme] = useState<ThemeConfig>({ gradient: 'royal', effect: 'dust' });
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);
  const [msgCount, setMsgCount] = useState(0);
  const [heartCount, setHeartCount] = useState(0);
  const [messages, setMessages] = useState<any[]>([]);
  const [photos, setPhotos] = useState<MediaItem[]>([]);
  
  const [editingPhotoId, setEditingPhotoId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [announceMsg, setAnnounceMsg] = useState("");

  // Broadcast Helper
  const broadcastSync = (type: string, payload: any) => {
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type, payload });
      channel.close();
  };
  
  const handleBroadcast = () => {
      if (!announceMsg.trim()) return;
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'announcement', message: announceMsg });
      channel.close();
      setAnnounceMsg("");
      alert("Love Note Sent to All Guests!");
  };

  const handleBlockUser = (name: string) => {
      if(confirm(`Block ${name} from the app?`)) {
          const channel = new BroadcastChannel('wedding_portal_chat');
          channel.postMessage({ type: 'block_user', name: name });
          channel.close();
          const newMessages = messages.filter(m => m.sender !== name);
          setMessages(newMessages);
          setMsgCount(newMessages.length);
          localStorage.setItem('wedding_chat_messages', JSON.stringify(newMessages));
          broadcastSync('message_sync', newMessages);
          
          const newGuests = guestList.filter(g => g.name !== name);
          setGuestList(newGuests);
          localStorage.setItem('wedding_guest_registry', JSON.stringify(newGuests));
      }
  };

  useEffect(() => {
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
                coupleImage: savedImage || parsed.coupleImage || ""
            });
        } else {
            setConfig({ coupleName: "Sneha & Aman", date: "2025-11-26", welcomeMsg: "Join us as we begin our forever.", coupleImage: savedImage || "" });
        }

        if (savedTheme) {
            setTheme(JSON.parse(savedTheme));
        }

        const savedGuests = localStorage.getItem('wedding_guest_registry');
        if (savedGuests) setGuestList(JSON.parse(savedGuests));

        const msgs = localStorage.getItem('wedding_chat_messages');
        if (msgs) {
            const parsed = JSON.parse(msgs);
            setMessages(parsed);
            setMsgCount(parsed.length);
        }

        const hearts = localStorage.getItem('wedding_heart_count');
        if(hearts) setHeartCount(parseInt(hearts));
        
        const savedPhotos = localStorage.getItem('wedding_gallery_media');
        if(savedPhotos) setPhotos(JSON.parse(savedPhotos));
      };
      loadData();

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (event) => {
          const data = event.data;
          switch(data.type) {
              case 'message': 
                  setMessages(prev => {
                      if (prev.some(m => m.id === data.payload.id)) return prev;
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
              case 'user_presence':
                  setGuestList(prev => {
                      if (prev.some(g => g.name === data.payload.name)) return prev;
                      const newList = [...prev, data.payload];
                      localStorage.setItem('wedding_guest_registry', JSON.stringify(newList));
                      return newList;
                  });
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
      alert("Settings Updated!");
  };

  const handleThemeUpdate = (newTheme: Partial<ThemeConfig>) => {
      const updated = { ...theme, ...newTheme };
      setTheme(updated);
      localStorage.setItem('wedding_theme_config', JSON.stringify(updated));
      broadcastSync('theme_sync', updated);
  };

  const handleClearData = () => {
      if (confirm("This will wipe all messages, photos, and guest list. Continue?")) {
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
      localStorage.setItem('wedding_chat_messages', JSON.stringify(updated));
      broadcastSync('message_sync', updated);
  };

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
    <div className="w-full h-full flex flex-col font-serif bg-passion-900 text-pink-100 transition-colors duration-1000">
      {/* Header */}
      <header className="p-4 bg-black/50 backdrop-blur-md border-b border-pink-500/20 flex justify-between items-center shadow-lg z-20">
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

      <div className="flex flex-grow overflow-hidden">
          {/* Sidebar */}
          <aside className="w-20 bg-black/30 border-r border-white/5 flex flex-col items-center py-4 gap-4 z-10 backdrop-blur-sm">
              {[
                  { id: 'overview', icon: Home, label: 'Home' },
                  { id: 'guests', icon: Users, label: 'Guests' },
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
                      <h2 className="text-2xl font-romantic text-white mb-4">Dashboard Overview</h2>
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
                      <div className="bg-gradient-to-r from-passion-700 to-passion-800 p-6 rounded-xl border border-pink-500/30">
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

              {activeTab === 'theme' && (
                  <div className="space-y-8 animate-fade-in max-w-2xl">
                      <h2 className="text-2xl font-romantic text-white flex items-center gap-3">
                          <Palette className="text-pink-500"/> Mood & Vibe
                      </h2>
                      
                      <div className="bg-white/5 p-6 rounded-xl border border-pink-500/20 shadow-xl">
                           <h3 className="text-pink-400 font-bold text-sm uppercase tracking-widest mb-4">Color Palette</h3>
                           <div className="grid grid-cols-3 gap-4">
                               {[
                                   { id: 'royal', label: 'Deep Passion', class: 'bg-gradient-to-b from-passion-900 to-black' },
                                   { id: 'midnight', label: 'Midnight Kiss', class: 'bg-gradient-to-b from-[#0f172a] to-[#1e1b4b]' },
                                   { id: 'sunset', label: 'Burning Love', class: 'bg-gradient-to-b from-[#7c2d12] to-[#4a0404]' },
                               ].map(opt => (
                                   <button 
                                        key={opt.id}
                                        onClick={() => handleThemeUpdate({ gradient: opt.id as any })}
                                        className={`relative h-24 rounded-lg border-2 transition-all overflow-hidden group ${theme.gradient === opt.id ? 'border-pink-500 scale-105 shadow-glow' : 'border-white/10 hover:border-white/30'}`}
                                   >
                                       <div className={`absolute inset-0 ${opt.class}`}></div>
                                       <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-transparent transition-colors">
                                            <span className="font-bold text-white text-sm shadow-black/50 drop-shadow-md">{opt.label}</span>
                                       </div>
                                       {theme.gradient === opt.id && (
                                           <div className="absolute top-2 right-2 bg-pink-500 text-white rounded-full p-0.5"><Check size={12}/></div>
                                       )}
                                   </button>
                               ))}
                           </div>
                      </div>

                      <div className="bg-white/5 p-6 rounded-xl border border-pink-500/20 shadow-xl">
                           <h3 className="text-pink-400 font-bold text-sm uppercase tracking-widest mb-4">Atmosphere</h3>
                           <div className="grid grid-cols-4 gap-4">
                               {[
                                   { id: 'dust', label: 'Stardust', icon: Sparkles },
                                   { id: 'petals', label: 'Petals', icon: Flower },
                                   { id: 'lights', label: 'Glow', icon: CloudFog },
                                   { id: 'none', label: 'Clean', icon: Ban },
                               ].map(opt => (
                                   <button 
                                        key={opt.id}
                                        onClick={() => handleThemeUpdate({ effect: opt.id as any })}
                                        className={`flex flex-col items-center justify-center gap-3 py-6 rounded-lg border transition-all ${theme.effect === opt.id ? 'bg-white/10 border-pink-500 text-white' : 'bg-black/20 border-white/10 text-stone-400 hover:bg-white/5'}`}
                                   >
                                       <opt.icon size={24} className={theme.effect === opt.id ? 'text-pink-400' : ''} />
                                       <span className="text-xs font-bold uppercase">{opt.label}</span>
                                   </button>
                               ))}
                           </div>
                      </div>
                  </div>
              )}
              
              {activeTab === 'gallery' && (
                   <div className="space-y-6 animate-fade-in">
                       <h2 className="text-2xl font-romantic text-white">Media Gallery</h2>
                       <div className="grid grid-cols-3 gap-4">
                           {photos.map(photo => (
                               <div key={photo.id} className="relative group aspect-square rounded-lg overflow-hidden border border-white/10 bg-black/40">
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
                      <h2 className="text-2xl font-romantic text-white">Event Settings</h2>
                      
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
