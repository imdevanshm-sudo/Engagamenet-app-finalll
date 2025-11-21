
import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GuestDashboard from './components/GuestDashboard';
import CoupleDashboard from './components/CoupleDashboard';
import AdminDashboard from './components/AdminDashboard';
import { X, Cookie, RefreshCw } from 'lucide-react';

// Update this version string whenever you deploy a significant update to force a cache clear
const APP_VERSION = '1.2.0';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'guest-dashboard' | 'couple-dashboard' | 'admin-dashboard'>('welcome');
  const [userName, setUserName] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showCookieConsent, setShowCookieConsent] = useState(false);
  const [showUpdateToast, setShowUpdateToast] = useState(false);

  useEffect(() => {
    // Version Check for Cache Busting
    const storedVersion = localStorage.getItem('wedding_app_version');
    
    if (storedVersion !== APP_VERSION) {
       console.log(`App updated from ${storedVersion} to ${APP_VERSION}. Cleaning stale data.`);
       
       // Preserve session data to avoid logging users out unnecessarily
       const userType = localStorage.getItem('wedding_current_user_type');
       const guestName = localStorage.getItem('wedding_guest_name');
       const guestPhone = localStorage.getItem('wedding_guest_phone');
       const coupleName = localStorage.getItem('wedding_couple_name');
       const couplePhone = localStorage.getItem('wedding_couple_phone');
       const cookieConsent = localStorage.getItem('wedding_cookie_consent');
       
       // Clear all local storage to remove stale state/caches
       localStorage.clear();
       
       // Restore session data
       if (userType) localStorage.setItem('wedding_current_user_type', userType);
       if (guestName) localStorage.setItem('wedding_guest_name', guestName);
       if (guestPhone) localStorage.setItem('wedding_guest_phone', guestPhone);
       if (coupleName) localStorage.setItem('wedding_couple_name', coupleName);
       if (couplePhone) localStorage.setItem('wedding_couple_phone', couplePhone);
       if (cookieConsent) localStorage.setItem('wedding_cookie_consent', cookieConsent);
       
       // Set new version
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

  const changeView = (view: typeof currentView) => {
      setIsTransitioning(true);
      setTimeout(() => {
          setCurrentView(view);
          setIsTransitioning(false);
      }, 500); // Slower transition for a more royal feel
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
  };

  const handleLogout = () => {
    localStorage.removeItem('wedding_current_user_type');
    changeView('welcome');
  };

  const acceptCookies = () => {
      localStorage.setItem('wedding_cookie_consent', 'accepted');
      setShowCookieConsent(false);
  };

  return (
    <div className="w-full h-full bg-[#2d0a0d] text-gold-100 font-serif overflow-hidden">
      <div className={`w-full h-full transition-all duration-500 ease-out transform ${isTransitioning ? 'opacity-0 scale-[0.98] blur-sm' : 'opacity-100 scale-100 blur-0'}`}>
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

      {/* Cookie Consent Banner */}
      {showCookieConsent && (
          <div className="fixed bottom-4 left-4 right-4 z-[100] bg-black/90 backdrop-blur-lg p-4 rounded-xl border border-gold-500/30 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500">
              <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-[#4a0e11]"><Cookie size={20} /></div>
                  <div>
                      <h4 className="font-bold text-gold-100 text-sm">We use cookies (and love!)</h4>
                      <p className="text-[10px] text-stone-400">We use local storage to save your preferences, login session, and cached media for a better experience.</p>
                  </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                  <button onClick={acceptCookies} className="flex-1 sm:flex-none bg-gold-500 text-[#2d0a0d] px-6 py-2 rounded-lg font-bold text-xs hover:bg-gold-400 transition-colors">Accept</button>
                  <button onClick={() => setShowCookieConsent(false)} className="p-2 hover:bg-white/10 rounded-lg text-stone-400"><X size={16}/></button>
              </div>
          </div>
      )}

      {/* Update Toast */}
      {showUpdateToast && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[110] bg-blue-600 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce cursor-pointer" onClick={() => window.location.reload()}>
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-xs font-bold">New Version Available. Tap to Refresh!</span>
          </div>
      )}
    </div>
  );
};

export default App;
