
import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Settings, Scroll, Calendar, Megaphone, Plus, Minus,
  FileText, Camera, MessageSquare, Home, Users, Folder, 
  Trash2, Edit2, Check, X, Save, Search, Phone, MapPin, Upload, Image as ImageIcon, Film, ExternalLink, Map, Heart, Navigation, LocateFixed, Music, Clock, PenTool, Plane, LogOut, Send, Ban, BellRing, LayoutDashboard
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
    type: 'location_update' | 'location_request';
    id: string;
    name: string;
    lat: number;
    lng: number;
    role: 'guest' | 'couple' | 'admin';
    timestamp: number;
}

const DEFAULT_EVENTS: WeddingEvent[] = [
    { id: '1', title: "Mehndi Ceremony", time: "Dec 20, 4:00 PM", loc: "Poolside Gardens", icon: "🌿" },
    { id: '2', title: "Sangeet Night", time: "Dec 20, 7:30 PM", loc: "Grand Ballroom", icon: "💃" },
    { id: '3', title: "Haldi", time: "Dec 21, 10:00 AM", loc: "Courtyard", icon: "✨" },
    { id: '4', title: "The Wedding", time: "Dec 21, 6:00 PM", loc: "Grand Lawn", icon: "💍" },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'events' | 'gallery' | 'map' | 'users'>('dashboard');
    const [events, setEvents] = useState<WeddingEvent[]>(DEFAULT_EVENTS);
    const [gallery, setGallery] = useState<MediaItem[]>([]);
    const [announcement, setAnnouncement] = useState("");
    const [messages, setMessages] = useState<any[]>([]);
    
    // Map State
    const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<any>(null);
    const markersRef = useRef<Record<string, any>>({});
    const venuePos = [26.7857, 83.0763];

    useEffect(() => {
        // Load Data
        const savedEvents = localStorage.getItem('wedding_events');
        if (savedEvents) setEvents(JSON.parse(savedEvents));
        
        const savedGallery = localStorage.getItem('wedding_gallery_media');
        if (savedGallery) setGallery(JSON.parse(savedGallery));

        const savedMsgs = localStorage.getItem('wedding_chat_messages');
        if (savedMsgs) setMessages(JSON.parse(savedMsgs));

        // Broadcast Channels
        const chatChannel = new BroadcastChannel('wedding_portal_chat');
        const mapChannel = new BroadcastChannel('wedding_live_map');

        // --- Live Map Handshake Protocol ---
        const broadcastLocation = (lat: number, lng: number) => {
             const update: LocationUpdate = {
                 type: 'location_update',
                 id: 'admin_01',
                 name: 'Event Admin',
                 lat, lng,
                 role: 'admin',
                 timestamp: Date.now()
             };
             mapChannel.postMessage(update);
             setActiveUsers(prev => ({...prev, ['admin_01']: update}));
        };

        let watchId: number;
        if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(pos => {
                 broadcastLocation(pos.coords.latitude, pos.coords.longitude);
             });

             watchId = navigator.geolocation.watchPosition(
                 pos => {
                     broadcastLocation(pos.coords.latitude, pos.coords.longitude);
                 },
                 err => console.warn(err),
                 { enableHighAccuracy: true }
             );
             
             // Initiate Handshake: "Where is everyone?"
             mapChannel.postMessage({ type: 'location_request' });
        }

        mapChannel.onmessage = (event) => {
            const data = event.data as LocationUpdate;
            if (data.type === 'location_update') {
                setActiveUsers(prev => ({...prev, [data.id]: data}));
            } else if (data.type === 'location_request') {
                // Respond immediately to new joiners
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(pos => {
                        broadcastLocation(pos.coords.latitude, pos.coords.longitude);
                    });
                }
            }
        };

        chatChannel.onmessage = (event) => {
            const data = event.data;
            if (data.type === 'message') {
                 setMessages(prev => [...prev, data.payload]);
            } else if (data.type === 'gallery_sync') {
                 setGallery(data.payload);
            }
        };

        return () => {
            chatChannel.close();
            mapChannel.close();
            if (watchId) navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    // --- Map Rendering Logic ---
    useEffect(() => {
        if (activeTab !== 'map' || !mapRef.current) return;
        
        const L = (window as any).L;
        if (!L) return;

        if (!mapInstance.current) {
            mapInstance.current = L.map(mapRef.current).setView(venuePos, 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap'
            }).addTo(mapInstance.current);

            const venueIcon = L.divIcon({
                className: 'custom-div-icon',
                html: `<div style="background-color: #be123c; color: #fff; border-radius: 50%; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; border: 3px solid #fcd34d; box-shadow: 0 4px 10px rgba(0,0,0,0.5); font-size: 24px; z-index: 1000;">🏰</div>`,
                iconSize: [48, 48],
                iconAnchor: [24, 48]
            });
            L.marker(venuePos, { icon: venueIcon }).addTo(mapInstance.current).bindPopup("Hotel Soni International");
        }

        // Update Markers
        Object.values(activeUsers).forEach((user: LocationUpdate) => {
            if (user.lat && user.lng) {
                if (markersRef.current[user.id]) {
                    markersRef.current[user.id].setLatLng([user.lat, user.lng]);
                } else {
                    const safeName = escapeHtml(user.name);
                    const isCouple = user.role === 'couple';
                    const isAdmin = user.role === 'admin';
                    
                    const bgColor = isCouple ? 'bg-rose-600' : isAdmin ? 'bg-blue-600' : 'bg-amber-500';
                    const symbol = isCouple ? '❤️' : isAdmin ? '🛡️' : safeName.charAt(0);

                    const iconHtml = `
                        <div class="relative flex flex-col items-center justify-center">
                            <div class="w-10 h-10 rounded-full border-2 border-white shadow-lg flex items-center justify-center font-bold text-white ${bgColor}">
                                ${symbol}
                            </div>
                             <div class="mt-1 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-white whitespace-nowrap border border-white/10">
                                ${safeName}
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

        // Cleanup stale markers
        Object.keys(markersRef.current).forEach(id => {
            if (!activeUsers[id]) {
                markersRef.current[id].remove();
                delete markersRef.current[id];
            }
        });

        // Re-render fixes
        setTimeout(() => {
             if (mapInstance.current) mapInstance.current.invalidateSize();
        }, 100);

    }, [activeTab, activeUsers]);

    // --- Actions ---
    const handleSendAnnouncement = () => {
        if (!announcement.trim()) return;
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'announcement', message: announcement });
        channel.close();
        alert("Announcement Broadcasted!");
        setAnnouncement("");
    };

    const deleteMessage = (id: string) => {
        const updated = messages.filter(m => m.id !== id);
        setMessages(updated);
        localStorage.setItem('wedding_chat_messages', JSON.stringify(updated));
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'message_sync', payload: updated });
        channel.close();
    };

    const deletePhoto = (id: string) => {
        const updated = gallery.filter(m => m.id !== id);
        setGallery(updated);
        localStorage.setItem('wedding_gallery_media', JSON.stringify(updated));
        const channel = new BroadcastChannel('wedding_portal_chat');
        channel.postMessage({ type: 'gallery_sync', payload: updated });
        channel.close();
    };

    const blockUser = (name: string) => {
        if (confirm(`Are you sure you want to block ${name}? This will log them out.`)) {
             const channel = new BroadcastChannel('wedding_portal_chat');
             channel.postMessage({ type: 'block_user', name: name });
             channel.close();
        }
    };

    return (
        <div className="w-full h-full flex flex-col bg-stone-900 text-stone-100 font-sans">
            {/* Header */}
            <header className="h-16 border-b border-stone-800 bg-stone-950 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                        <Settings size={18} className="text-white animate-spin-slow" />
                    </div>
                    <h1 className="font-bold text-lg tracking-tight">Admin Console</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onLogout} className="text-stone-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium px-3 py-1.5 hover:bg-red-500/10 rounded-md">
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </header>

            <div className="flex flex-grow overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-stone-950 border-r border-stone-800 flex flex-col shrink-0">
                    <nav className="flex-grow p-4 space-y-2">
                        {[
                            { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
                            { id: 'events', icon: Calendar, label: 'Events Schedule' },
                            { id: 'gallery', icon: Image as any, label: 'Media Gallery' },
                            { id: 'map', icon: Map, label: 'Live Tracking' },
                            { id: 'users', icon: Users, label: 'User Management' },
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium ${activeTab === item.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-stone-400 hover:bg-stone-900 hover:text-stone-200'}`}
                            >
                                <item.icon size={18} /> {item.label}
                            </button>
                        ))}
                    </nav>
                    <div className="p-4 border-t border-stone-800">
                         <div className="bg-stone-900 rounded-xl p-4 border border-stone-800">
                             <h3 className="text-xs font-bold text-stone-500 uppercase mb-3 flex items-center gap-2"><Megaphone size={12}/> Global Broadcast</h3>
                             <textarea 
                                value={announcement}
                                onChange={e => setAnnouncement(e.target.value)}
                                className="w-full bg-black/40 rounded-lg p-2 text-xs text-stone-200 border border-stone-700 focus:outline-none focus:border-blue-500 mb-2 resize-none h-20"
                                placeholder="Type alert message..."
                             ></textarea>
                             <button onClick={handleSendAnnouncement} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-colors">
                                 <Send size={12} /> Send to All
                             </button>
                         </div>
                    </div>
                </aside>

                {/* Content Area */}
                <main className="flex-grow bg-stone-900 overflow-hidden relative">
                    {activeTab === 'dashboard' && (
                        <div className="p-8 overflow-y-auto h-full">
                            <h2 className="text-2xl font-bold mb-6 text-white">System Overview</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 shadow-xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><Users size={24} /></div>
                                        <span className="text-xs font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded">REALTIME</span>
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">{Object.keys(activeUsers).length}</div>
                                    <p className="text-sm text-stone-400">Active Guests Tracked</p>
                                </div>
                                <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 shadow-xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-green-500/20 text-green-400 rounded-xl"><MessageSquare size={24} /></div>
                                        <span className="text-xs font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded">TOTAL</span>
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">{messages.length}</div>
                                    <p className="text-sm text-stone-400">Wishes & Messages</p>
                                </div>
                                <div className="bg-stone-800 p-6 rounded-2xl border border-stone-700 shadow-xl">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><Camera size={24} /></div>
                                        <span className="text-xs font-mono text-stone-500 bg-stone-900 px-2 py-1 rounded">GALLERY</span>
                                    </div>
                                    <div className="text-4xl font-bold text-white mb-1">{gallery.length}</div>
                                    <p className="text-sm text-stone-400">Shared Moments</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'map' && (
                        <div className="w-full h-full relative flex flex-col">
                            <div className="absolute top-4 left-4 z-[1000] bg-stone-900/80 backdrop-blur p-3 rounded-lg border border-stone-700 shadow-lg">
                                <h3 className="text-sm font-bold text-white flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> Live Tracking Active</h3>
                                <p className="text-[10px] text-stone-400 mt-1">Updating positions in real-time</p>
                            </div>
                            <div ref={mapRef} className="w-full h-full z-0"></div>
                        </div>
                    )}

                    {activeTab === 'users' && (
                         <div className="p-8 overflow-y-auto h-full">
                            <h2 className="text-2xl font-bold mb-6 text-white">User Management</h2>
                            <div className="bg-stone-800 rounded-2xl border border-stone-700 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead className="bg-stone-900 border-b border-stone-700">
                                        <tr>
                                            <th className="p-4 text-xs font-bold text-stone-500 uppercase">User Name</th>
                                            <th className="p-4 text-xs font-bold text-stone-500 uppercase">Role</th>
                                            <th className="p-4 text-xs font-bold text-stone-500 uppercase">Status</th>
                                            <th className="p-4 text-xs font-bold text-stone-500 uppercase text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.values(activeUsers).map((user: LocationUpdate) => (
                                            <tr key={user.id} className="border-b border-stone-700 hover:bg-stone-700/50 transition-colors">
                                                <td className="p-4 text-sm font-medium text-white">{user.name}</td>
                                                <td className="p-4">
                                                    <span className={`text-xs px-2 py-1 rounded-full border ${
                                                        user.role === 'couple' ? 'bg-rose-900/30 border-rose-500/30 text-rose-400' : 
                                                        user.role === 'admin' ? 'bg-blue-900/30 border-blue-500/30 text-blue-400' : 
                                                        'bg-stone-700 text-stone-300 border-stone-600'
                                                    }`}>
                                                        {user.role.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className="flex items-center gap-2 text-xs text-green-400">
                                                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {user.role === 'guest' && (
                                                        <button 
                                                            onClick={() => blockUser(user.name)}
                                                            className="text-xs bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded transition-all border border-red-500/30"
                                                        >
                                                            Block Access
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                        {Object.keys(activeUsers).length === 0 && (
                                            <tr>
                                                <td colSpan={4} className="p-8 text-center text-stone-500 italic">No active users detected yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                         </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="p-8 overflow-y-auto h-full">
                            <h2 className="text-2xl font-bold mb-6 text-white">Event Schedule</h2>
                            <div className="space-y-4">
                                {events.map((evt, i) => (
                                    <div key={evt.id} className="bg-stone-800 p-4 rounded-xl border border-stone-700 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="text-3xl">{evt.icon}</div>
                                            <div>
                                                <div className="font-bold text-white">{evt.title}</div>
                                                <div className="text-sm text-stone-400">{evt.time} • {evt.loc}</div>
                                            </div>
                                        </div>
                                        <button className="p-2 hover:bg-stone-700 rounded-lg text-stone-400 hover:text-white"><Edit2 size={18} /></button>
                                    </div>
                                ))}
                                <button className="w-full py-4 border-2 border-dashed border-stone-700 rounded-xl text-stone-500 hover:border-blue-500 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
                                    <Plus size={20} /> Add New Event
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'gallery' && (
                        <div className="p-8 overflow-y-auto h-full">
                             <h2 className="text-2xl font-bold mb-6 text-white">Content Moderation</h2>
                             <div className="grid grid-cols-4 gap-4">
                                 {gallery.map(item => (
                                     <div key={item.id} className="relative group rounded-xl overflow-hidden bg-stone-950 border border-stone-700">
                                          <img src={item.url} className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                          <div className="absolute top-2 right-2">
                                              <button onClick={() => deletePhoto(item.id)} className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:scale-110 transition-transform">
                                                  <Trash2 size={14} />
                                              </button>
                                          </div>
                                          <div className="p-3">
                                              <p className="text-xs text-stone-400 truncate">{item.caption || "No Caption"}</p>
                                          </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
