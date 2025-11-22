import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import WelcomeScreen from './components/WelcomeScreen';
import GuestDashboard from './components/GuestDashboard';
import CoupleDashboard from './components/CoupleDashboard';
import AdminDashboard from './components/AdminDashboard';
import { X, Cookie, RefreshCw, Heart, AlertTriangle, Loader } from 'lucide-react';
import { ThemeProvider } from './ThemeContext';
import { AppProvider, useAppData } from './AppContext';

// Update this version string whenever you deploy a significant update to force a cache clear
const APP_VERSION = '2.0.2';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'guest-dashboard' | 'couple-dashboard' | 'admin-dashboard'>('welcome');
  const [userName, setUserName] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);
  
  // Use AppContext for data
  const { announcement, joinUser, sendAnnouncement, guestList } = useAppData();
  const [localAnnouncement, setLocalAnnouncement] = useState<{title: string, msg: string} | null>(null);

  // Pull to Refresh State
  const [pullStartPoint, setPullStartPoint] = useState(0);
  const [pullChange, setPullChange] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Version Check for Cache Busting
    const storedVersion = localStorage.getItem('wedding_app_version');
    
    if (storedVersion !== APP_VERSION) {
       console.log(`App updated from ${storedVersion} to ${APP_VERSION}. Cleaning stale data.`);
       // We keep essential user data
       const userType = localStorage.getItem('wedding_current_user_type');
       const guestName = localStorage.getItem('wedding_guest_name');
       const guestPhone = localStorage.getItem('wedding_guest_phone');
       const coupleName = localStorage.getItem('wedding_couple_name');
       const couplePhone = localStorage.getItem('wedding_couple_phone');
       const cookieConsent = localStorage.getItem('wedding_cookie_consent');
       
       localStorage.clear();
       
       if (userType) localStorage.setItem('wedding_current_user_type', userType);
       if (guestName) localStorage.setItem('wedding_guest_name', guestName);
       if (guestPhone) localStorage.setItem('wedding_guest_phone', guestPhone);
       if (coupleName) localStorage.setItem('wedding_couple_name', coupleName);
       if (couplePhone) localStorage.setItem('wedding_couple_phone', couplePhone);
       if (cookieConsent) localStorage.setItem('wedding_cookie_consent', cookieConsent);
       
       localStorage.setItem('wedding_app_version', APP_VERSION);
    }

    // Cookie Consent Check
    if (!localStorage.getItem('wedding_cookie_consent')) {
        setTimeout(() => setShowCookieConsent(true), 2000);
    }

    // Check for active session
    const storedUserType = localStorage.getItem('wedding_current_user_type');
    const storedName = localStorage.getItem('wedding_guest_name') || localStorage.getItem('wedding_couple_name');
    
    if (storedUserType === 'guest' && storedName) {
      setUserName(storedName);
      setCurrentView('guest-dashboard');
    } else if (storedUserType === 'couple' && storedName) {
      setUserName(storedName);
      setCurrentView('couple-dashboard');
    } else if (storedUserType === 'admin') {
      setUserName('Admin');
      setCurrentView('admin-dashboard');
    }
  }, []);

  // Listen for announcements from context
  useEffect(() => {
      if (announcement) {
          setLocalAnnouncement({ title: "A Note of Love", msg: announcement });
          setTimeout(() => setLocalAnnouncement(null), 8000);
      }
  }, [announcement]);

  // Handle blocking - check if current user is in guestList (or rather, if they are removed/missing implies block if active)
  // Actually, the socket event block_user is better handled in AppContext, but we need to trigger logout here.
  // We can listen to a side effect or just check existence if connected. 
  // Simplified: The server emits block_user, AppContext catches it and filters list.
  // We can add a specialized effect here to check if we got booted.
  // For simplicity, we'll rely on the socket event listener for block if we want to force logout instantly, 
  // but since AppContext handles data, we can just check if our name was removed from guestList while we are logged in as guest.
  // However, simple approach: AppContext handles the event listener for 'block_user' and we can expose a 'blockedUser' state or similar?
  // Or just re-implement the block listener here for the UI effect.
  
  // --- Pull to Refresh Logic ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setPullStartPoint(e.targetTouches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (pullStartPoint > 0 && window.scrollY === 0) {
        const pullY = e.targetTouches[0].clientY - pullStartPoint;
        if (pullY > 0) {
            setPullChange(pullY * 0.4);
        }
    }
  };

  const handleTouchEnd = () => {
      if (pullChange > 100) {
          setIsRefreshing(true);
          setTimeout(() => {
              window.location.reload();
          }, 500);
      } else {
          setPullChange(0);
      }
      setPullStartPoint(0);
  };

  const changeView = (view: typeof currentView) => {
      setIsTransitioning(true);
      setTimeout(() => {
          setCurrentView(view);
          setIsTransitioning(false);
      }, 500);
  };

  const handleLoginSuccess = (type: 'guest' | 'couple' | 'admin', name: string) => {
     setUserName(name);
     if (type === 'guest') {
       changeView('guest-dashboard');
     } else if (type === 'couple') {
       changeView('couple-dashboard'); 
     } else if (type === 'admin') {
       changeView('admin-dashboard');
     }
     // Notify server of presence via Context
     if (type !== 'admin') {
        joinUser(name, type);
     }
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_current_user_type');
    localStorage.removeItem('wedding_guest_name');
    localStorage.removeItem('wedding_couple_name');
    setUserName("");
    changeView('welcome');
  };

  const acceptCookies = () => {
      localStorage.setItem('wedding_cookie_consent', 'accepted');
      setShowCookieConsent(false);
  };

  return (
      <div 
          className="w-full h-full bg-passion-900 text-romance-100 font-serif overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
      >
        {/* Refresh Indicator */}
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center items-center pointer-events-none z-[200]"
          style={{ 
              height: `${pullChange}px`, 
              opacity: Math.min(pullChange / 100, 1),
              transition: isRefreshing ? 'height 0.2s ease-in' : 'none'
          }}
        >
            <div className="bg-passion-600 text-white rounded-full p-2 shadow-lg transform translate-y-4">
                {isRefreshing ? <Loader className="animate-spin" size={24} /> : <Heart size={24} className="text-white fill-white" style={{ transform: `scale(${1 + pullChange/200})` }} />}
            </div>
        </div>

        <div 
          ref={contentRef}
          className={`w-full h-full transition-all duration-500 ease-out transform ${isTransitioning ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 scale-100 blur-0'}`}
          style={{ transform: `translateY(${isRefreshing ? 50 : Math.min(pullChange, 150)}px)` }}
        >
          {currentView === 'welcome' && (
              <WelcomeScreen onLoginSuccess={handleLoginSuccess} />
          )}
          {currentView === 'guest-dashboard' && (
              <GuestDashboard userName={userName} onLogout={handleLogout} />
          )}
          {currentView === 'couple-dashboard' && (
              <CoupleDashboard userName={userName} onLogout={handleLogout} />
          )}
          {currentView === 'admin-dashboard' && (
              <AdminDashboard onLogout={handleLogout} />
          )}
        </div>

        {/* Global Announcement Toast */}
        {localAnnouncement && (
            <div className="fixed top-0 left-0 right-0 z-[200] flex items-start justify-center p-4 animate-slide-down pointer-events-none">
                <div className="bg-gradient-to-r from-passion-600 to-passion-500 text-white p-[1px] rounded-xl shadow-glow-lg max-w-md w-full pointer-events-auto">
                    <div className="bg-passion-900/90 backdrop-blur-md rounded-[10px] p-4 flex gap-4 items-start relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-pink-400 to-transparent animate-shimmer"></div>
                        <div className="p-3 bg-passion-700 rounded-full shrink-0 animate-pulse">
                            <Heart size={20} fill="white" className="text-white" />
                        </div>
                        <div className="flex-grow">
                            <h4 className="font-heading font-bold text-lg text-pink-200 mb-1">{localAnnouncement.title}</h4>
                            <p className="font-serif text-pink-100 leading-snug">{localAnnouncement.msg}</p>
                        </div>
                        <button onClick={() => setLocalAnnouncement(null)} className="text-pink-300 hover:text-white"><X size={18}/></button>
                    </div>
                </div>
            </div>
        )}

        {/* Cookie Consent Banner */}
        {showCookieConsent && (
            <div className="fixed bottom-4 left-4 right-4 z-[100] bg-black/80 backdrop-blur-lg p-4 rounded-xl border border-passion-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-passion-600 flex items-center justify-center text-white"><Cookie size={20} /></div>
                    <div>
                        <h4 className="font-bold text-pink-100 text-sm">Shared with Love & Cookies</h4>
                        <p className="text-[10px] text-pink-300">We use local storage to save your memories and session.</p>
                    </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={acceptCookies} className="flex-1 sm:flex-none bg-pink-500 text-white px-6 py-2 rounded-lg font-bold text-xs hover:bg-pink-400 transition-colors shadow-glow">Accept</button>
                    <button onClick={() => setShowCookieConsent(false)} className="p-2 hover:bg-white/10 rounded-lg text-pink-400"><X size={16}/></button>
                </div>
            </div>
        )}
      </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
