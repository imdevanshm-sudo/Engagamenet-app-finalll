import React from 'react';
import { Home, Mail, Calendar, Users } from 'lucide-react';
import { ViewState } from '../types';

interface BottomNavProps {
  currentView: ViewState;
  onChange: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onChange }) => {
  const navItems = [
    { id: ViewState.HOME, label: 'Home', icon: Home },
    { id: ViewState.MESSAGES, label: 'Messages', icon: Mail },
    { id: ViewState.SCHEDULE, label: 'Schedule', icon: Calendar },
    { id: ViewState.FAMILY, label: 'Family', icon: Users },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-rose-50/90 backdrop-blur-md border-t border-rose-200 py-2 px-6 flex justify-between items-center z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] safe-area-pb">
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        const Icon = item.icon;
        
        return (
          <button
            key={item.id}
            onClick={() => onChange(item.id)}
            className={`flex flex-col items-center justify-center transition-colors duration-300 w-16
              ${isActive ? 'text-rose-600' : 'text-slate-500 hover:text-rose-400'}
            `}
          >
            <div className={`p-1 rounded-full transition-all duration-300 ${isActive ? 'bg-rose-100' : ''}`}>
              <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] mt-1 font-medium ${isActive ? 'opacity-100' : 'opacity-70'}`}>
              {item.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
