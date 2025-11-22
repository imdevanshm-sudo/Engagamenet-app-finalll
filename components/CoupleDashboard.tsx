
import React, { useState, useEffect, useRef } from 'react';
import { Home, MessageSquare, Heart, Music, LogOut, Send, Play, Pause, SkipForward, SkipBack, Image as ImageIcon, RefreshCw, Users, Crown, Radio } from 'lucide-react';

// --- Types ---
interface Message {
    id: string;
    text?: string;
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
    sender: string;
}

interface GuestEntry {
    name: string;
    role: 'guest' | 'couple' | 'admin';
    joinedAt: number;
}

interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover: string;
    album: string;
    durationStr: string;
}

interface CoupleDashboardProps {
  userName: string;
  onLogout: () => void;
}

const CoupleDashboard: React.FC<CoupleDashboardProps> = ({ userName, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'chat' | 'gallery' | 'guests' | 'music'>('home');
  const [messages, setMessages] = useState<Message[]>([]);
  const [heartCount, setHeartCount] = useState(0);
  const [gallery, setGallery] = useState<MediaItem[]>([]);
  const [guestList, setGuestList] = useState<GuestEntry[]>([]);
  const [chatInput, setChatInput] = useState("");
  const chatScrollRef = useRef<HTMLDivElement>(null);
  
  // Music State
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- Initial Data Load ---
  useEffect(() => {
      const loadData = () => {
          const msgs = localStorage.getItem('wedding_chat_messages');
          if (msgs) setMessages(JSON.parse(msgs));
          
          const hearts = localStorage.getItem('wedding_heart_count');
          if (hearts) setHeartCount(parseInt(hearts));

          const pics = localStorage.getItem('wedding_gallery_media');
          if (pics) setGallery(JSON.parse(pics));

          const savedGuests = localStorage.getItem('wedding_guest_registry');
          if (savedGuests) setGuestList(JSON.parse(savedGuests));

          // Romantic Playlist
          const pl = [
              { id: '1', title: 'Perfect', artist: 'Ed Sheeran', album: 'Divide', durationStr: '4:23', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/4/45/Divide_cover.png' },
              { id: '2', title: 'All of Me', artist: 'John Legend', album: 'Love in the Future', durationStr: '4:29', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/6/65/John_Legend_-_All_of_Me_%28single%29.jpg' },
              { id: '3', title: 'A Thousand Years', artist: 'Christina Perri', album: 'Twilight', durationStr: '4:45', url: '', cover: 'https://upload.wikimedia.org/wikipedia/en/4/42/A_Thousand_Years_%28Christina_Perri_song%29_cover.jpg' },
          ];
          setPlaylist(pl);
          setCurrentSong(pl[0]);
      };
      loadData();

      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.onmessage = (event) => {
          const data = event.data;
          switch(data.type) {
              case 'message': 
                  setMessages(prev => {
                      if (prev.some(m => m.id === data.payload.id)) return prev;
                      return [...prev, data.payload];
                  });
                  break;
              case 'message_sync':
                  setMessages(data.payload);
                  break;
              case 'heart_update':
                  setHeartCount(data.count);
                  break;
              case 'gallery_sync':
                  setGallery(data.payload);
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
      
      channel.postMessage({ type: 'user_presence', payload: { name: userName, role: 'couple', joinedAt: Date.now() } });

      return () => channel.close();
  }, []);

  useEffect(() => {
      if (activeTab === 'chat' && chatScrollRef.current) {
          chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
      }
  }, [messages, activeTab]);

  // --- Music Controls with Broadcast ---
  const togglePlay = () => {
      const newState = !isPlaying;
      setIsPlaying(newState);
      
      // Sync state to guests
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ 
          type: 'playlist_update', 
          currentSong, 
          isPlaying: newState
      });
      channel.close();
  };

  const playSong = (song: Song) => {
      setCurrentSong(song);
      setIsPlaying(true);
      
      // Sync state to guests
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ 
          type: 'playlist_update', 
          currentSong: song, 
          isPlaying: true
      });
      channel.close();
  };

  const handleSendMessage = (text: string) => {
      if (!text.trim()) return;
      const newMessage: Message = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          text,
          sender: userName,
          isCouple: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: 'text'
      };
      setMessages(prev => [...prev, newMessage]);
      localStorage.setItem('wedding_chat_messages', JSON.stringify([...messages, newMessage]));
      
      const channel = new BroadcastChannel('wedding_portal_chat');
      channel.postMessage({ type: 'message', payload: newMessage });
      channel.close();
      setChatInput("");
  };

  const handleClearCache = () => {
    if(confirm("Reset app data and reload?")) {
        localStorage.clear();
        window.location.reload();
    }
  };

  return (
    <div className="w-full h-full text-pink-100 font-serif flex flex-col relative overflow-hidden bg-gradient-to-b from-passion-900 via-[#380410] to-black">
        
        {/* Background Effects */}
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pink-500/20 blur-[100px] rounded-full"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-passion-600/20 blur-[100px] rounded-full"></div>
        </div>

        {/* Header */}
        <header className="flex-shrink-0 p-4 flex justify-between items-center z-20 border-b border-pink-500/20 bg-passion-900/80 backdrop-blur-md shadow-lg">
            <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full border-2 border-white p-0.5 bg-passion-700 shadow-glow">
                    <div className="w-full h-full rounded-full bg-pink-500 flex items-center justify-center text-white font-bold text-xl">
                        <Crown size={20} fill="white" />
                    </div>
                </div>
                <div>
                    <h1 className="font-romantic text-2xl text-white">The Happy Couple</h1>
                    <p className="text-[10px] text-pink-300 uppercase tracking-widest">Control Room</p>
                </div>
            </div>
            <div className="flex items-center gap-2">
                 <button onClick={handleClearCache} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-pink-300 transition-colors" title="Reset App">
                     <RefreshCw size={18} />
                 </button>
                 <button onClick={onLogout} className="p-2 hover:bg-white/5 rounded-lg text-pink-300 hover:text-white transition-colors">
                     <LogOut size={20} />
                 </button>
            </div>
        </header>

        {/* Content Area */}
        <main className="flex-grow overflow-hidden relative z-10">
            {activeTab === 'home' && (
                <div className="h-full overflow-y-auto p-6 animate-fade-in">
                     <div className="text-center my-6">
                         <Heart size={48} className="text-pink-500 mx-auto mb-4 animate-heartbeat fill-pink-500/50" />
                         <h2 className="text-4xl font-romantic text-pink-100 mb-2">Welcome, Lovebirds</h2>
                         <p className="text-pink-300 text-sm italic">Your love story is unfolding perfectly.</p>
                     </div>
                     
                     {/* Adore Meter Display */}
                     <div className="bg-gradient-to-r from-passion-700 to-pink-600 p-6 rounded-3xl border border-white/20 flex items-center justify-between mb-8 relative overflow-hidden shadow-glow group">
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                          <div className="relative z-10">
                              <h3 className="text-white font-bold text-lg mb-1">Love Showered</h3>
                              <p className="text-xs text-pink-100/80 uppercase tracking-widest">Hearts Received</p>
                          </div>
                          <div className="text-5xl font-bold text-white flex items-center gap-2 relative z-10 font-romantic">
                              {heartCount} 
                          </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                         <button onClick={() => setActiveTab('guests')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <Users size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">Guest List</span>
                         </button>
                         <button onClick={() => setActiveTab('chat')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <MessageSquare size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">Read Wishes</span>
                         </button>
                         <button onClick={() => setActiveTab('gallery')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <ImageIcon size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">Photo Album</span>
                         </button>
                         <button onClick={() => setActiveTab('music')} className="p-6 bg-white/5 rounded-2xl border border-pink-500/20 hover:bg-white/10 hover:border-pink-400 transition-all flex flex-col items-center gap-3 group">
                             <Music size={32} className="text-pink-400 group-hover:scale-110 transition-transform"/>
                             <span className="text-sm font-bold text-pink-100">DJ Control</span>
                         </button>
                     </div>
                </div>
            )}

            {activeTab === 'chat' && (
                <div className="flex flex-col h-full relative">
                    <div ref={chatScrollRef} className="flex-grow overflow-y-auto p-4 space-y-4 pb-24">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.sender === userName ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] p-3 rounded-2xl shadow-md ${msg.sender === userName ? 'bg-white text-passion-900 font-bold' : 'bg-black/40 border border-pink-500/30 text-pink-100'}`}>
                                    {!msg.sender.includes(userName) && <p className="text-[10px] text-pink-400 font-bold mb-1 uppercase tracking-wider">{msg.sender}</p>}
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-passion-900/90 border-t border-pink-500/20 pb-safe">
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Send love back..." 
                                className="flex-grow bg-black/30 border border-pink-500/30 rounded-full px-5 text-white focus:outline-none focus:border-pink-500"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                            />
                            <button onClick={() => handleSendMessage(chatInput)} className="p-3 bg-pink-600 rounded-full text-white shadow-lg hover:bg-pink-500 transform active:scale-95 transition-transform"><Send size={20} /></button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'gallery' && (
                <div className="h-full overflow-y-auto p-4 pb-24">
                     <h2 className="text-2xl font-romantic text-white mb-4">Shared Moments</h2>
                     <div className="grid grid-cols-3 gap-3">
                         {gallery.map(p => (
                             <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group bg-black/40 border border-pink-500/20">
                                 <img src={p.url} className="w-full h-full object-cover" loading="lazy" />
                                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                     <p className="text-white text-xs truncate font-bold">{p.caption}</p>
                                     <span className="text-[9px] text-pink-300">{p.sender}</span>
                                 </div>
                             </div>
                         ))}
                         {gallery.length === 0 && (
                             <div className="col-span-3 flex flex-col items-center justify-center py-20 text-pink-300/50 gap-2">
                                 <ImageIcon size={32} className="opacity-50"/>
                                 <p className="text-sm">Your album is empty.</p>
                             </div>
                         )}
                     </div>
                </div>
            )}

            {activeTab === 'guests' && (
                 <div className="h-full overflow-y-auto p-4 pb-24">
                      <h2 className="text-2xl font-romantic text-white mb-4">Guest List</h2>
                      <div className="bg-white/5 rounded-2xl border border-pink-500/20 divide-y divide-pink-500/10 overflow-hidden">
                          {guestList.map((g, i) => (
                              <div key={i} className="p-4 flex items-center gap-4 hover:bg-white/5">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${g.role === 'couple' ? 'bg-white text-passion-900' : 'bg-passion-800 text-pink-200'}`}>
                                      {g.name.charAt(0)}
                                  </div>
                                  <div>
                                      <h3 className="font-bold text-pink-100">{g.name}</h3>
                                      <div className="text-[10px] text-pink-400 uppercase tracking-widest">{g.role}</div>
                                  </div>
                              </div>
                          ))}
                      </div>
                 </div>
            )}

            {activeTab === 'music' && (
                <div className="h-full overflow-y-auto p-6 animate-fade-in pb-32">
                    <h2 className="text-3xl font-romantic text-white mb-6 text-center">Mood Controller</h2>
                    
                    {/* Now Playing Card */}
                    <div className="bg-gradient-to-b from-passion-700 to-black/60 p-6 rounded-3xl border border-pink-500/30 shadow-2xl mb-8 flex flex-col items-center relative overflow-hidden group">
                         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
                         <div className={`w-48 h-48 rounded-full border-4 border-pink-500/30 shadow-[0_0_40px_rgba(236,72,153,0.4)] mb-6 relative ${isPlaying ? 'animate-spin-slow' : ''}`}>
                             <img src={currentSong?.cover} className="w-full h-full object-cover rounded-full" />
                             <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/40 to-transparent"></div>
                             <div className="absolute w-8 h-8 bg-passion-900 rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-pink-500"></div>
                         </div>
                         
                         <div className="text-center mb-6 relative z-10">
                             <h3 className="text-xl font-bold text-white">{currentSong?.title}</h3>
                             <p className="text-pink-300 text-sm">{currentSong?.artist}</p>
                         </div>

                         <div className="flex items-center gap-8 relative z-10">
                             <button className="text-pink-400 hover:text-white transition-colors"><SkipBack size={32} /></button>
                             <button 
                                onClick={togglePlay}
                                className="w-20 h-20 rounded-full bg-pink-600 text-white flex items-center justify-center shadow-glow-lg hover:scale-105 transition-transform active:scale-95 hover:bg-pink-500"
                             >
                                 {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                             </button>
                             <button className="text-pink-400 hover:text-white transition-colors"><SkipForward size={32} /></button>
                         </div>
                         <div className="mt-4 flex items-center gap-2 text-[10px] text-green-400 uppercase tracking-widest font-bold bg-black/50 px-3 py-1 rounded-full">
                             <Radio size={10} className={isPlaying ? "animate-pulse" : ""} /> {isPlaying ? "Broadcasting to Guests" : "Paused"}
                         </div>
                    </div>

                    {/* Queue */}
                    <div className="space-y-3">
                        <h3 className="text-xs uppercase tracking-widest text-pink-400 font-bold mb-2 ml-1">Romantic Selection</h3>
                        {playlist.map((song, i) => (
                            <div 
                                key={song.id} 
                                onClick={() => playSong(song)}
                                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${currentSong?.id === song.id ? 'bg-white/10 border-pink-500' : 'bg-black/20 border-transparent hover:bg-white/5'}`}
                            >
                                <div className="w-12 h-12 rounded-lg overflow-hidden">
                                    <img src={song.cover} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-grow">
                                    <h4 className={`font-bold text-sm ${currentSong?.id === song.id ? 'text-pink-200' : 'text-stone-300'}`}>{song.title}</h4>
                                    <p className="text-xs text-stone-500">{song.artist}</p>
                                </div>
                                <div className="text-xs text-stone-500">{song.durationStr}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>

        {/* Navigation */}
        <nav className="flex-shrink-0 p-2 bg-passion-900 border-t border-pink-500/20 flex justify-around z-20 pb-safe shadow-[0_-5px_20px_rgba(0,0,0,0.4)]">
             {[
                 { id: 'home', icon: Home, label: 'Home' },
                 { id: 'chat', icon: MessageSquare, label: 'Chat' },
                 { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
                 { id: 'music', icon: Music, label: 'Music' },
             ].map(item => (
                 <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all ${activeTab === item.id ? 'bg-pink-600 text-white -translate-y-1 shadow-lg' : 'text-pink-400/60'}`}
                 >
                     <item.icon size={22} className={activeTab === item.id ? 'animate-pulse' : ''} />
                     <span className="text-[9px] uppercase tracking-widest font-bold">{item.label}</span>
                 </button>
             ))}
        </nav>
    </div>
  );
};

export default CoupleDashboard;
