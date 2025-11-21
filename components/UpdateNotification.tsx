
import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface UpdateNotificationProps {
  channelName: string;
  onUpdate: () => void;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ channelName, onUpdate }) => {
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    const channel = new BroadcastChannel(channelName);
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'story_updated') {
        setShowToast(true);
      }
    };
    
    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
      channel.close();
    };
  }, [channelName]);

  const handleRefresh = () => {
    setShowToast(false);
    onUpdate();
  };

  if (!showToast) {
    return null;
  }

  return (
    <div 
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[110] bg-rose-500 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 animate-bounce cursor-pointer"
      onClick={handleRefresh}
    >
      <RefreshCw size={18} />
      <span className="text-xs font-bold">The Couple's Story has been updated. Tap to see!</span>
    </div>
  );
};

export default UpdateNotification;
