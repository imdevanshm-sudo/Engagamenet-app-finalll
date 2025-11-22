import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from './socket';

export interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset' | 'lavender' | 'forest';
    effect: 'dust' | 'petals' | 'lights' | 'fireflies' | 'none';
}

interface ThemeContextType {
    theme: ThemeConfig;
    setTheme: (theme: ThemeConfig) => void;
}

const defaultTheme: ThemeConfig = { gradient: 'royal', effect: 'dust' };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);

    useEffect(() => {
        // Load from local storage
        const savedTheme = localStorage.getItem('wedding_theme_config');
        if (savedTheme) {
            try {
                setThemeState(JSON.parse(savedTheme));
            } catch(e) {
                console.error("Failed to parse theme", e);
            }
        }

        // Socket listeners
        const handleThemeSync = (data: any) => {
            setThemeState(data.payload);
            localStorage.setItem('wedding_theme_config', JSON.stringify(data.payload));
        };

        const handleFullSync = (state: any) => {
            if (state.theme) {
                setThemeState(state.theme);
                localStorage.setItem('wedding_theme_config', JSON.stringify(state.theme));
            }
        };

        socket.on('theme_sync', handleThemeSync);
        socket.on('full_sync', handleFullSync);

        return () => {
            socket.off('theme_sync', handleThemeSync);
            socket.off('full_sync', handleFullSync);
        };
    }, []);

    const setTheme = (newTheme: ThemeConfig) => {
        setThemeState(newTheme);
        // Optimistically update local storage as well
        localStorage.setItem('wedding_theme_config', JSON.stringify(newTheme));
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
