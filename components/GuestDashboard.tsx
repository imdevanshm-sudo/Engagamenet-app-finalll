import React, { useEffect, useRef, useState, useLayoutEffect } from 'react';
import { Home, Calendar, MessageSquare, Heart, Camera, MapPin, Clock, ChevronRight, X, Users, Utensils, Minus, Plus, CheckCircle, XCircle, Sparkles, Send, Smile, Sticker, ChevronLeft, LogOut, ChevronDown, Map, Navigation, Phone, Search, Compass, Globe, Plane, Hand, Music, Gift, Sun, Moon, Mic, PhoneCall, Film, ThumbsUp, LocateFixed, Contact, Upload, Image as ImageIcon, Bot } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

// --- Visual Assets & Icons ---

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

const KalashIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path d="M7 8C7 8 5 12 5 15C5 18.866 8.13401 22 12 22C15.866 22 19 18.866 19 15C19 12 17 8 17 8" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2"/>
    <path d="M12 2V5" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 5C15 5 17 4 17 4C17 4 16 7 12 7C8 7 7 4 7 4C7 4 9 5 12 5Z" stroke="currentColor" strokeWidth="2" fill="currentColor"/>
    <circle cx="12" cy="15" r="2" fill="currentColor" />
  </svg>
);

const LotusIcon = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} style={style}>
        <path d="M12,2 C12,2 16,8 16,12 C16,16 12,20 12,22 C12,20 8,16 8,12 C8,8 12,2 12,2 Z" opacity="0.8"/>
        <path d="M12,22 C12,20 18,16 20,12 C20,16 14,22 12,22 Z" opacity="0.6"/>
        <path d="M12,22 C12,20 6,16 4,12 C4,16 10,22 12,22 Z" opacity="0.6"/>
    </svg>
);

// --- AI Modal ---

const WeddingAIModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
        { role: 'model', text: "Namaste! I am your Royal Wedding Concierge. How can I assist you with the celebrations today?" }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    
    // Config for context
    const config = JSON.parse(localStorage.getItem('wedding_global_config') || '{}');
    const highlights = JSON.parse(localStorage.getItem('wedding_highlights') || '[]');
    
    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setIsLoading(true);
        
        try {
            // Use process.env.API_KEY as per guidelines
            const apiKey = process.env.API_KEY;
            
            if (!apiKey) {
                throw new Error("API Key not configured");
            }

            const ai = new GoogleGenAI({ apiKey });
            
            // Construct context from app state
            const context = `
                You are a polite, helpful, and royal wedding concierge for the wedding of ${config.coupleName || "Sneha and Aman"}.
                The wedding is at ${config.venue || "Taj Lands End"} on ${config.date}.
                
                Key Events:
                ${highlights.map((h: any) => `- ${h.title} at ${h.time} in ${h.location}`).join('\n')}
                
                Answer the guest's question concisely and elegantly. If you don't know, ask them to check with the event organizers.
            `;

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: userMsg,
                config: {
                    systemInstruction: context,
                }
            });
            
            const responseText = response.text;
            if (responseText) {
                 setMessages(prev => [...prev, { role: 'model', text: responseText }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'model', text: "I apologize, but I'm having trouble connecting to the royal archives right now. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className={`bg-[#fffbf5] w-full max-w-md rounded-2xl shadow-2xl border border-gold-300 overflow-hidden flex flex-col transition-all duration-300 ${isExpanded ? 'h-[80vh]' : 'h-[500px]'}`}>
                {/* Header */}
                <div className="bg-[#4a0e11] p-4 flex justify-between items-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10"><FloralPattern /></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center border-2 border-gold-400">
                            <Bot className="text-[#4a0e11]" size={24} />
                        </div>
                        <div>
                            <h3 className="text-gold-100 font-heading text-lg">Royal Concierge</h3>
                            <p className="text-gold-400 text-xs">Powered by Gemini AI</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 relative z-10">
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gold-300 hover:text-gold-100">
                            {isExpanded ? <Minus size={20}/> : <Plus size={20}/>}
                        </button>
                        <button onClick={onClose} className="text-gold-300 hover:text-gold-100">
                            <X size={24}/>
                        </button>
                    </div>
                </div>

                {/* Chat Area */}
                <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-[#fffbf5]">
                    {messages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-serif leading-relaxed shadow-sm ${
                                msg.role === 'user' 
                                ? 'bg-[#4a0e11] text-gold-100 rounded-tr-sm' 
                                : 'bg-white text-[#4a0e11] border border-gold-200 rounded-tl-sm'
                            }`}>
                                {msg.text}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-gold-200 flex gap-1">
                                <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce delay-75"></span>
                                <span className="w-2 h-2 bg-gold-400 rounded-full animate-bounce delay-150"></span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gold-200 flex gap-2">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask about events, venue, dress code..."
                        className="flex-grow bg-stone-50 border border-gold-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-gold-500 text-[#4a0e11] font-serif placeholder-stone-400"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                        className="bg-[#4a0e11] text-gold-100 w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#5e181f] disabled:opacity-50 transition-colors"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Guest Dashboard Component ---

interface GuestDashboardProps {
  userName: string;
  onLogout: () => void;
}

const GuestDashboard: React.FC<GuestDashboardProps> = ({ userName, onLogout }) => {
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);

  return (
    <div className="w-full h-full flex flex-col bg-[#fff0f5] relative overflow-hidden text-[#4a0e11]">
      <FloralPattern className="opacity-20 text-rose-900" />
      <FloralCorner className="absolute top-0 left-0 w-32 h-32 -translate-x-8 -translate-y-8 z-0" rotate={0} />
      <FloralCorner className="absolute top-0 right-0 w-32 h-32 translate-x-8 -translate-y-8 z-0" rotate={90} />

      {/* Header */}
      <header className="relative z-10 pt-16 pb-6 text-center">
          <div className="inline-block border-b-2 border-gold-300 pb-2 px-8">
             <h1 className="font-heading text-3xl text-[#4a0e11]">Namaste, {userName}</h1>
          </div>
          <p className="text-rose-800 font-serif italic mt-2 text-sm">Welcome to the celebration of love</p>
      </header>

      {/* Main Content - Grid Layout */}
      <main className="flex-grow overflow-y-auto px-6 pb-32 relative z-10 space-y-6 no-scrollbar">
          
          {/* Highlights Section (Spacious) */}
          <section>
              <h2 className="font-heading text-lg text-[#4a0e11] mb-4 flex items-center gap-2"><Sparkles size={18} className="text-gold-500"/> Upcoming Events</h2>
              <div className="space-y-4">
                   {[
                       { title: "Mehndi & Sangeet", time: "Dec 20th, 6:00 PM", loc: "Grand Ballroom", icon: Music },
                       { title: "Wedding Ceremony", time: "Dec 21st, 10:00 AM", loc: "Poolside Lawns", icon: Heart }
                   ].map((event, i) => (
                       <div key={i} className="bg-white rounded-2xl p-5 shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-gold-100 flex items-center gap-4 animate-in slide-in-from-bottom-4 duration-500" style={{animationDelay: `${i*100}ms`}}>
                           <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shadow-sm">
                               <event.icon size={20} />
                           </div>
                           <div className="flex-grow">
                               <h3 className="font-serif font-bold text-[#4a0e11] text-lg">{event.title}</h3>
                               <div className="flex flex-col sm:flex-row sm:gap-4 text-xs text-stone-500 mt-1 font-medium">
                                   <span className="flex items-center gap-1"><Clock size={12} /> {event.time}</span>
                                   <span className="flex items-center gap-1"><MapPin size={12} /> {event.loc}</span>
                               </div>
                           </div>
                           <ChevronRight className="text-gold-400" size={20} />
                       </div>
                   ))}
              </div>
          </section>

          {/* Quick Actions Grid */}
          <section className="grid grid-cols-2 gap-4">
              <button className="bg-gradient-to-br from-[#4a0e11] to-[#2d0a0d] text-gold-100 p-5 rounded-2xl shadow-lg flex flex-col items-center gap-2 active:scale-95 transition-transform">
                  <Camera size={28} className="text-gold-400" />
                  <span className="font-serif font-bold text-sm">Photo Gallery</span>
              </button>
              <button className="bg-white text-[#4a0e11] border border-gold-200 p-5 rounded-2xl shadow-sm flex flex-col items-center gap-2 active:scale-95 transition-transform">
                  <MessageSquare size={28} className="text-rose-500" />
                  <span className="font-serif font-bold text-sm">Guest Book</span>
              </button>
          </section>

          {/* Wedding AI Concierge Floating Action Button */}
          <div className="fixed bottom-24 right-6 z-50">
              <button 
                onClick={() => setIsAIModalOpen(true)}
                className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 text-white shadow-[0_4px_20px_rgba(180,83,9,0.4)] hover:scale-110 transition-transform duration-300"
              >
                  <div className="absolute inset-0 rounded-full border border-white/30 animate-ping opacity-20"></div>
                  <Bot size={28} />
                  <span className="absolute right-full mr-3 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Ask Concierge
                  </span>
              </button>
          </div>

      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gold-200 px-6 py-4 flex justify-between items-center z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
          <button className="flex flex-col items-center gap-1 text-rose-700">
              <Home size={22} strokeWidth={2.5} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#4a0e11] transition-colors">
              <Calendar size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Schedule</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-stone-400 hover:text-[#4a0e11] transition-colors">
              <Map size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Map</span>
          </button>
          <button onClick={onLogout} className="flex flex-col items-center gap-1 text-stone-400 hover:text-red-600 transition-colors">
              <LogOut size={22} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Exit</span>
          </button>
      </nav>

      {/* Modals */}
      <WeddingAIModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} />

    </div>
  );
};

export default GuestDashboard;