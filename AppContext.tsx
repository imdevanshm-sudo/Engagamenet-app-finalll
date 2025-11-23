import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { socket } from './socket';

// --- Shared Types ---

export interface Message {
    id: string;
    text?: string;
    stickerKey?: string;
    sender: string;
    isCouple: boolean;
    timestamp: string;
    type: 'text' | 'sticker';
}

export interface MediaItem {
    id: string;
    url: string;
    type: 'image' | 'video';
    caption?: string;
    timestamp: number;
    sender: string;
}

export interface GuestEntry {
    name: string;
    role: 'guest' | 'couple' | 'admin';
    joinedAt: number;
    rsvp?: boolean;
}

export interface Song {
    id: string;
    title: string;
    artist: string;
    url: string;
    cover: string;
    album: string;
    durationStr: string;
}

export interface Lantern {
    id: string;
    sender: string;
    message: string;
    color: string;
    timestamp: number;
}

export interface Location {
    id: string;
    lat: number;
    lng: number;
    timestamp: number;
}

export interface GlobalConfig {
    coupleName: string;
    date: string;
    welcomeMsg: string;
    coupleImage: string;
}

// --- Context Interface ---

interface AppContextType {
    // State
    messages: Message[];
    gallery: MediaItem[];
    guestList: GuestEntry[];
    heartCount: number;
    lanterns: Lantern[];
    locations: Location[];
    config: GlobalConfig;
    currentSong: Song | null;
    isPlaying: boolean;
    announcement: string | null;
    typingUsers: Set<string>;
    isConnected: boolean;

    // Actions
    sendMessage: (text: string, stickerKey?: string, sender?: string, isCouple?: boolean) => void;
    sendHeart: () => void;
    uploadMedia: (item: MediaItem) => void;
    sendLantern: (lantern: Lantern) => void;
    sendRSVP: (name: string) => void;
    joinUser: (name: string, role: 'guest' | 'couple' | 'admin') => void;
    updateConfig: (cfg: GlobalConfig) => void;
    updatePlaylistState: (song: Song | null, playing: boolean) => void;
    sendAnnouncement: (msg: string) => void;
    deleteMessage: (id: string) => void;
    deleteMedia: (id: string) => void;
    updateMediaCaption: (id: string, caption: string) => void;
    blockUser: (name: string) => void;
    setTyping: (user: string, isTyping: boolean) => void;
    broadcastLocation: (lat: number, lng: number) => void;
    refreshData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- Provider ---

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initial State - Arrays initialized to [] to prevent crash
    const [messages, setMessages] = useState<Message[]>([]);
    const [gallery, setGallery] = useState<MediaItem[]>([]);
    const [guestList, setGuestList] = useState<GuestEntry[]>([]);
    const [heartCount, setHeartCount] = useState<number>(0);
    const [lanterns, setLanterns] = useState<Lantern[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [config, setConfig] = useState<GlobalConfig>({
        coupleName: "The Couple",
        date: "2025-12-26",
        welcomeMsg: "Join us as we begin our forever.",
        coupleImage: ""
    });
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [announcement, setAnnouncement] = useState<string | null>(null);
    const [typingUsers, setTypingUsersState] = useState<Set<string>>(new Set());
    const [isConnected, setIsConnected] = useState(socket.connected);

    // --- Load from Local Storage on Mount ---
    useEffect(() => {
        try {
            const storedMsgs = localStorage.getItem('wedding_chat_messages');
            if (storedMsgs) setMessages(JSON.parse(storedMsgs));

            const storedGallery = localStorage.getItem('wedding_gallery_media');
            if (storedGallery) setGallery(JSON.parse(storedGallery));

            const storedHearts = localStorage.getItem('wedding_heart_count');
            if (storedHearts) setHeartCount(parseInt(storedHearts));

            const storedConfig = localStorage.getItem('wedding_global_config');
            if (storedConfig) {
                const parsed = JSON.parse(storedConfig);
                setConfig(prev => ({ ...prev, ...parsed }));
            }
        } catch (e) {
            console.error("Failed to load local storage data", e);
        }
    }, []);

    // --- Persist to Local Storage ---
    useEffect(() => { localStorage.setItem('wedding_chat_messages', JSON.stringify(messages)); }, [messages]);
    useEffect(() => { localStorage.setItem('wedding_gallery_media', JSON.stringify(gallery)); }, [gallery]);
    useEffect(() => { localStorage.setItem('wedding_heart_count', heartCount.toString()); }, [heartCount]);
    useEffect(() => { localStorage.setItem('wedding_global_config', JSON.stringify(config)); }, [config]);

    // --- Socket Event Listeners ---
    useEffect(() => {
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        const handleFullSync = (state: any) => {
            if (!state) return;
            if (state.messages) setMessages(state.messages);
            if (state.gallery) setGallery(state.gallery);
            if (state.heartCount !== undefined) setHeartCount(state.heartCount);
            if (state.guestList) setGuestList(state.guestList);
            if (state.lanterns) setLanterns(state.lanterns);
            if (state.locations) setLocations(state.locations);
            if (state.config) setConfig(state.config);
            if (state.currentSong) setCurrentSong(state.currentSong);
            if (state.isPlaying !== undefined) setIsPlaying(state.isPlaying);
            if (state.announcement) setAnnouncement(state.announcement);
        };

        const handleMessage = (data: any) => {
            setMessages(prev => {
                // Avoid duplicates if logic runs twice
                if (prev.some(m => m.id === data.payload?.id || m.id === data.id)) return prev;
                return [...prev, data.payload || data];
            });
        };

        const handleHeartUpdate = (data: any) => setHeartCount(data.count);
        const handleGallerySync = (data: any) => setGallery(data.payload || data);
        const handleLanternAdded = (data: any) => setLanterns(prev => [...prev, data.payload || data]);
        
        const handleLocationsUpdate = (data: any) => {
            if (Array.isArray(data)) setLocations(data);
        };

        const handleUserPresence = (data: any) => {
            const user = data.payload || data;
            setGuestList(prev => {
                const filtered = prev.filter(g => g.name !== user.name);
                return [...filtered, user];
            });
        };

        const handleBlock = (data: any) => setGuestList(prev => prev.filter(g => g.name !== data.name));
        const handleConfigSync = (data: any) => setConfig(data.payload || data);
        const handlePlaylistUpdate = (data: any) => { setCurrentSong(data.currentSong); setIsPlaying(data.isPlaying); };
        const handleAnnouncement = (data: any) => setAnnouncement(data.message);
        const handleTyping = (data: { user: string, isTyping: boolean }) => {
            setTypingUsersState(prev => {
                const newSet = new Set(prev);
                if (data.isTyping) newSet.add(data.user);
                else newSet.delete(data.user);
                return newSet;
            });
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('sync_data', handleFullSync); // Also listen to 'sync_data' as used in server.js
        socket.on('full_sync', handleFullSync);
        socket.on('message', handleMessage);
        socket.on('send_message', handleMessage); // Catch direct emits if named differently
        socket.on('heart_update', handleHeartUpdate);
        socket.on('gallery_sync', handleGallerySync);
        socket.on('lantern_added', handleLanternAdded);
        socket.on('locations_update', handleLocationsUpdate);
        socket.on('user_presence', handleUserPresence);
        socket.on('block_user', handleBlock);
        socket.on('config_sync', handleConfigSync);
        socket.on('playlist_update', handlePlaylistUpdate);
        socket.on('announcement', handleAnnouncement);
        socket.on('typing', handleTyping);

        socket.emit('request_sync');

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('sync_data', handleFullSync);
            socket.off('full_sync', handleFullSync);
            socket.off('message', handleMessage);
            socket.off('send_message', handleMessage);
            socket.off('heart_update', handleHeartUpdate);
            socket.off('gallery_sync', handleGallerySync);
            socket.off('lantern_added', handleLanternAdded);
            socket.off('locations_update', handleLocationsUpdate);
            socket.off('user_presence', handleUserPresence);
            socket.off('block_user', handleBlock);
            socket.off('config_sync', handleConfigSync);
            socket.off('playlist_update', handlePlaylistUpdate);
            socket.off('announcement', handleAnnouncement);
            socket.off('typing', handleTyping);
        };
    }, []);

    // --- Actions ---

    const sendMessage = useCallback((text: string, stickerKey?: string, sender: string = "Anonymous", isCouple: boolean = false) => {
        const newMessage: Message = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            text,
            stickerKey,
            sender,
            isCouple,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: stickerKey ? 'sticker' : 'text'
        };
        setMessages(prev => [...prev, newMessage]);
        socket.emit('send_message', newMessage); // Updated to match server event
    }, []);

    const sendHeart = useCallback(() => {
        setHeartCount(prev => prev + 1);
        socket.emit('add_heart'); // Updated to match server event
    }, []);

    const uploadMedia = useCallback((item: MediaItem) => {
        setGallery(prev => [item, ...prev]);
        socket.emit('upload_media', item); // Updated to match server event
    }, []);

    const sendLantern = useCallback((lantern: Lantern) => {
        socket.emit('release_lantern', lantern); // Updated to match server event
    }, []);

    const sendRSVP = useCallback((name: string) => {
        socket.emit('send_rsvp', { name });
    }, []);

    const joinUser = useCallback((name: string, role: 'guest' | 'couple' | 'admin') => {
        if (role !== 'admin') {
            socket.emit('join_user', { name, role, joinedAt: Date.now() }); // Updated to match server event
        }
    }, []);

    const updateConfig = useCallback((cfg: GlobalConfig) => {
        setConfig(cfg);
        socket.emit('config_update', cfg);
    }, []);

    const updatePlaylistState = useCallback((song: Song | null, playing: boolean) => {
        setCurrentSong(song);
        setIsPlaying(playing);
        socket.emit('playlist_update', { currentSong: song, isPlaying: playing });
    }, []);

    const sendAnnouncement = useCallback((msg: string) => {
        socket.emit('send_announcement', msg); // Updated to match server
    }, []);

    const deleteMessage = useCallback((id: string) => {
        const updated = messages.filter(m => m.id !== id);
        setMessages(updated);
        socket.emit('message_sync', updated);
    }, [messages]);

    const deleteMedia = useCallback((id: string) => {
        const updated = gallery.filter(p => p.id !== id);
        setGallery(updated);
        socket.emit('gallery_sync', updated);
    }, [gallery]);

    const updateMediaCaption = useCallback((id: string, caption: string) => {
        const updated = gallery.map(p => p.id === id ? { ...p, caption } : p);
        setGallery(updated);
        socket.emit('gallery_sync', updated);
    }, [gallery]);

    const blockUser = useCallback((name: string) => {
        socket.emit('block_user', { name });
    }, []);

    const setTyping = useCallback((user: string, isTyping: boolean) => {
        socket.emit('typing', { user, isTyping });
    }, []);

    const broadcastLocation = useCallback((lat: number, lng: number) => {
        socket.emit('update_location', { lat, lng, timestamp: Date.now() });
    }, []);

    const refreshData = useCallback(() => {
        socket.emit('request_sync');
    }, []);

    return (
        <AppContext.Provider value={{
            messages, gallery, guestList, heartCount, lanterns, locations,
            config, currentSong, isPlaying, announcement, typingUsers, isConnected,
            sendMessage, sendHeart, uploadMedia, sendLantern, sendRSVP, joinUser,
            updateConfig, updatePlaylistState, sendAnnouncement, deleteMessage, deleteMedia,
            updateMediaCaption, blockUser, setTyping, broadcastLocation, refreshData
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppData = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useAppData must be used within an AppProvider');
    }
    return context;
};