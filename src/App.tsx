import React, { useState, useEffect, useRef } from 'react';
import WelcomeScreen from '@/components/WelcomeScreen';
import GuestDashboard from '@/components/GuestDashboard';
import CoupleDashboard from '@/components/CoupleDashboard';
import AdminDashboard from '@/components/AdminDashboard';
import { useAppData } from './AppContext';
import { socket } from "@/socket";
import { Loader, Heart, Lock, X } from 'lucide-react';

const APP_VERSION = '2.0.5';

export default function App() {
  // --- State ---
  const [currentView, setCurrentView] = useState<'welcome' | 'guest' | 'couple' | 'admin'>('welcome');
  const [userName, setUserName] = useState<string>("");
  const [isBlocked, setIsBlocked] = useState(false);
  const [localAnnouncement, setLocalAnnouncement] = useState<{title: string, msg: string} | null>(null);
  
  const { announcement, joinUser, blockUser } = useAppData();

  // --- Initialization & Session Check ---
  useEffect(() => {
    // Version Check / Cache Bust
    const storedVersion = localStorage.getItem('wedding_app_version');
    if (storedVersion !== APP_VERSION) {
       localStorage.removeItem('wedding_current_user_type');
       localStorage.setItem('wedding_app_version', APP_VERSION);
    }

    // Restore Session
    const storedType = localStorage.getItem('wedding_current_user_type');
    const storedName = localStorage.getItem('wedding_user_name');
    
    if (storedType && storedName) {
      setUserName(storedName);
      if (storedType === 'guest') setCurrentView('guest');
      else if (storedType === 'couple') setCurrentView('couple');
      else if (storedType === 'admin') setCurrentView('admin');
      
      // Re-sync presence
      if (storedType !== 'admin') {
         joinUser(storedName, storedType as any);
      }
    }
  }, [joinUser]);

  // --- Listen for Block Events ---
  useEffect(() => {
      const handleBlock = (data: { name: string }) => {
          if (userName && data.name && userName.toLowerCase() === data.name.toLowerCase()) {
              if (currentView !== 'admin') {
                  handleLogout();
                  setIsBlocked(true);
              }
          }
      };
      socket.on('block_user', handleBlock);
      return () => { socket.off('block_user', handleBlock); };
  }, [userName, currentView]);

  // --- Listen for Announcements ---
  useEffect(() => {
      if (announcement) {
          setLocalAnnouncement({ title: "A Note of Love", msg: announcement });
          const timer = setTimeout(() => setLocalAnnouncement(null), 8000);
          return () => clearTimeout(timer);
      }
  }, [announcement]);

  // --- Handlers ---
  const handleLoginSuccess = (type: 'guest' | 'couple' | 'admin', name: string) => {
     setIsBlocked(false);
     setUserName(name);
     
     localStorage.setItem('wedding_current_user_type', type);
     localStorage.setItem('wedding_user_name', name);

     if (type === 'guest') setCurrentView('guest');
     else if (type === 'couple') setCurrentView('couple');
     else if (type === 'admin') setCurrentView('admin');

     if (type !== 'admin') {
        joinUser(name, type);
     }
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_current_user_type');
    localStorage.removeItem('wedding_user_name');
    setUserName("");
    setCurrentView('welcome');
  };

  // --- Render ---
  return (
    <div className="w-full h-full bg-black text-white font-serif overflow-hidden relative">
      
      {/* Blocked Overlay */}
      {isBlocked && (
         <div className="absolute inset-0 z-[250] bg-black flex flex-col items-center justify-center p-8 text-center animate-fade-in">
           <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
              <Lock size={40} className="text-red-500" />
           </div>
           <h1 className="text-3xl font-bold text-white mb-2">Access Restricted</h1>
           <p className="text-stone-400">The host has restricted your access to this event.</p>
           <button onClick={() => setIsBlocked(false)} className="mt-8 text-sm text-stone-500 underline">Back to Home</button>
         </div>
      )}

      {/* Announcement Toast */}
      {localAnnouncement && (
          <div className="fixed top-4 left-4 right-4 z-[200] flex justify-center pointer-events-none">
              <div className="bg-gradient-to-r from-pink-600 to-rose-500 text-white p-[1px] rounded-xl shadow-2xl max-w-md w-full pointer-events-auto animate-slide-down">
                  <div className="bg-black/90 backdrop-blur-md rounded-[10px] p-4 flex gap-4 items-start">
                      <div className="p-2 bg-pink-700 rounded-full shrink-0 animate-pulse">
                          <Heart size={18} fill="white" />
                      </div>
                      <div className="flex-grow">
                          <h4 className="font-bold text-pink-200 text-sm mb-0.5">{localAnnouncement.title}</h4>
                          <p className="text-white text-sm leading-snug">{localAnnouncement.msg}</p>
                      </div>
                      <button onClick={() => setLocalAnnouncement(null)} className="text-pink-300 hover:text-white"><X size={16}/></button>
                  </div>
              </div>
          </div>
      )}

      {/* Main Views */}
      {currentView === 'welcome' && <WelcomeScreen onLoginSuccess={handleLoginSuccess} />}
      {currentView === 'guest' && <GuestDashboard userName={userName} onLogout={handleLogout} />}
      {currentView === 'couple' && <CoupleDashboard userName={userName} onLogout={handleLogout} />}
      {currentView === 'admin' && <AdminDashboard onLogout={handleLogout} />}
    </div>
  );
}