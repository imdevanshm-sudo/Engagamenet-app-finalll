import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import GuestDashboard from './components/GuestDashboard';
import CoupleDashboard from './components/CoupleDashboard';
import AdminDashboard from './components/AdminDashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'guest-dashboard' | 'couple-dashboard' | 'admin-dashboard'>('welcome');
  const [userName, setUserName] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
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
      }, 300);
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
      <div className={`w-full h-full transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
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