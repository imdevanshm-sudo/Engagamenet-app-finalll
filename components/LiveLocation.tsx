
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';
import { MapPin, Navigation, Wifi, WifiOff, Users } from 'lucide-react';

interface LocationUpdate {
    id: string;
    name: string;
    lat: number;
    lng: number;
    role: 'guest' | 'couple';
    lastUpdated: number;
}

interface LiveLocationProps {
    userName: string;
    isSharingEnabled: boolean;
}

const LiveLocation: React.FC<LiveLocationProps> = ({ userName, isSharingEnabled }) => {
    const [activeUsers, setActiveUsers] = useState<Record<string, LocationUpdate>>({});
    
    const venuePos = { lat: 19.0436, lng: 72.8193 }; 

    useEffect(() => {
        if (!isSharingEnabled || !userName) {
            setActiveUsers({});
            return;
        }

        const locationsCol = collection(db, 'locations');
        const currentUserDocRef = doc(locationsCol, userName);

        const unsubscribe = onSnapshot(locationsCol, (snapshot) => {
            const users: Record<string, LocationUpdate> = {};
            snapshot.forEach(doc => {
                const data = doc.data() as LocationUpdate;
                if (Date.now() - data.lastUpdated < 5 * 60 * 1000) {
                    users[doc.id] = { ...data, id: doc.id };
                } else {
                    deleteDoc(doc.ref);
                }
            });
            setActiveUsers(users);
        });

        const watchId = navigator.geolocation.watchPosition(
            (pos) => {
                const update: LocationUpdate = {
                    id: userName,
                    name: userName,
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                    role: 'guest',
                    lastUpdated: Date.now()
                };
                setDoc(currentUserDocRef, update);
            },
            (err) => console.error("Geolocation Error:", err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );

        return () => {
            unsubscribe();
            navigator.geolocation.clearWatch(watchId);
            deleteDoc(currentUserDocRef);
        };
    }, [userName, isSharingEnabled]);

    const getPositionStyle = (lat: number, lng: number) => {
        const scale = 10000;
        const y = (venuePos.lat - lat) * scale + 50;
        const x = (lng - venuePos.lng) * scale + 50;
        
        const clampedX = Math.max(5, Math.min(95, x));
        const clampedY = Math.max(5, Math.min(95, y));
        
        return { top: `${clampedY}%`, left: `${clampedX}%` };
    };

    return (
        <div className="flex flex-col h-full bg-stone-900 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-start pointer-events-none">
                <div>
                    <h2 className="font-serif font-bold text-xl flex items-center gap-2 text-gold-100"><MapPin size={20} className="text-gold-400"/> Live Radar</h2>
                    <p className="text-[10px] text-white/70">Locating guests near Taj Lands End</p>
                </div>
                
                <div className="pointer-events-auto">
                     {isSharingEnabled ? (
                         <div className="text-[10px] bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30 text-green-400 flex items-center gap-1 backdrop-blur-md">
                             <Wifi size={12} /> Live
                         </div>
                     ) : (
                         <div className="text-[10px] bg-red-500/20 px-3 py-1 rounded-full border border-red-500/30 text-red-400 flex items-center gap-1 backdrop-blur-md">
                             <WifiOff size={12} /> Offline
                         </div>
                     )}
                </div>
            </div>

            <div className="flex-grow w-full h-full relative bg-[#1c1917]">
                <div className="absolute inset-0 opacity-20" 
                     style={{ 
                         backgroundImage: 'radial-gradient(circle, #44403c 1px, transparent 1px)', 
                         backgroundSize: '40px 40px' 
                     }}>
                </div>
                
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-rose-500/20 rounded-full animate-ping opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-rose-500/30 rounded-full"></div>

                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <div className="w-4 h-4 bg-rose-600 rounded-full shadow-[0_0_15px_rgba(225,29,72,0.8)] animate-pulse"></div>
                    <span className="text-[10px] text-rose-200 mt-1 font-bold bg-black/50 px-2 py-0.5 rounded whitespace-nowrap">The Wedding</span>
                </div>

                {Object.values(activeUsers).map(user => {
                    const pos = getPositionStyle(user.lat, user.lng);
                    return (
                        <div 
                            key={user.id} 
                            className="absolute flex flex-col items-center transition-all duration-1000 ease-in-out z-20"
                            style={{ top: pos.top, left: pos.left }}
                        >
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shadow-lg ${user.name === userName ? "border-green-500 bg-green-500/20" : "border-amber-500 bg-amber-500/20"}`}>
                                <div className={`w-2 h-2 rounded-full ${user.name === userName ? "bg-green-500" : "bg-amber-500"}`}></div>
                            </div>
                            <span className="text-[10px] text-white mt-1 font-medium bg-black/60 px-2 rounded backdrop-blur-sm">
                                {user.name === userName ? "You" : user.name}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-24 left-4 right-4 z-20">
                 <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl flex items-center gap-4">
                     <div className="bg-gold-500 p-3 rounded-full text-stone-900">
                        <Users size={24} />
                     </div>
                     <div className="flex-grow">
                         <h3 className="font-bold text-white text-sm">Guest Radar</h3>
                         <p className="text-xs text-white/60">
                            {Object.keys(activeUsers).length} active nearby
                         </p>
                     </div>
                 </div>
            </div>
        </div>
    );
};

export default LiveLocation;
