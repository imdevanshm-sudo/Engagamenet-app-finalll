import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GuestDashboard from './components/GuestDashboard';
import CoupleDashboard from './components/CoupleDashboard';
import AdminDashboard from './components/AdminDashboard';

// Update this version string whenever you deploy a significant update to force a cache clear
const APP_VERSION = '1.1.0';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'guest-dashboard' | 'couple-dashboard' | 'admin-dashboard'>('welcome');
  const [userName, setUserName] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);

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
       
       // Clear all local storage to remove stale state/caches
       localStorage.clear();
       
       // Restore session data
       if (userType) localStorage.setItem('wedding_current_user_type', userType);
       if (guestName) localStorage.setItem('wedding_guest_name', guestName);
       if (guestPhone) localStorage.setItem('wedding_guest_phone', guestPhone);
       if (coupleName) localStorage.setItem('wedding_couple_name', coupleName);
       if (couplePhone) localStorage.setItem('wedding_couple_phone', couplePhone);
       
       // Set new version
       localStorage.setItem('wedding_app_version', APP_VERSION);
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
    </div>
  );
};

export default App;