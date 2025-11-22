import React, { createContext, useContext, useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const AppContext = createContext<any>(null);

export const useAppContext = () => useContext(AppContext);

const socket = socketIOClient('http://localhost:3001');

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [activeSlide, setActiveSlide] = useState(0);
    const [gallery, setGallery] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [quiz, setQuiz] = useState<any>({});
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [hearts, setHearts] = useState(0);
    const [lanterns, setLanterns] = useState<any[]>([]);

    useEffect(() => {
        socket.on('sync_data', (data) => {
            setActiveSlide(data.activeSlide);
            setGallery(data.gallery);
            setUsers(data.guestList);
            setQuiz(data.quiz);
            setChatMessages(data.chatMessages);
            setHearts(data.hearts);
            setLanterns(data.lanterns);
        });

        socket.on('slide_changed', (newSlide) => {
            setActiveSlide(newSlide);
        });

        return () => {
            socket.off('sync_data');
            socket.off('slide_changed');
        };
    }, []);

    const value = {
        socket,
        activeSlide,
        setActiveSlide,
        gallery,
        users,
        quiz,
        chatMessages,
        hearts,
        lanterns,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
