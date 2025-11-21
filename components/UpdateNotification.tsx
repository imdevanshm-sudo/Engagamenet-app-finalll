
import React from 'react';

interface UpdateNotificationProps {
  onUpdate: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ onUpdate }) => {
  return (
    <div className="fixed bottom-4 right-4 bg-gold-500 text-maroon-900 p-4 rounded-lg shadow-deep flex items-center animate-slide-up">
      <div className="flex-grow">
        <p className="font-bold">A new version is available!</p>
        <p className="text-sm">Refresh to get the latest features.</p>
      </div>
      <button 
        onClick={onUpdate}
        className="ml-4 px-4 py-2 bg-maroon-900 text-gold-100 rounded-md hover:bg-maroon-800 transition-colors"
      >
        Refresh
      </button>
    </div>
  );
};

export default UpdateNotification;
