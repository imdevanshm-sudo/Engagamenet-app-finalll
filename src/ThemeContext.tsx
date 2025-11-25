import React, { createContext, useContext, useState, useEffect } from 'react';
import { socket } from '../socket';

export interface ThemeConfig {
    gradient: 'royal' | 'midnight' | 'sunset' | 'lavender' | 'forest' | 'sunrise';
    effect: 'dust' | 'petals' | 'lights' | 'fireflies' | 'none';
}

export const themeStyles: { [key: string]: React.CSSProperties } = {
    royal: {
        background: 'linear-gradient(to right, #2d0a0d, #000)',
    },
    midnight: {
        background: 'linear-gradient(to right, #000033, #000)',
    },
    sunset: {
        background: 'linear-gradient(to right, #ff7e5f, #feb47b)',
    },
    lavender: {
        background: 'linear-gradient(to right, #e6e6fa, #b19cd9)',
    },
    forest: {
        background: 'linear-gradient(to right, #228B22, #006400)',
    },
    sunrise: {
        background: 'linear-gradient(to right, #ff9933, #ffcc00)',
    }
};

export const getThemeStyles = (theme: ThemeConfig): React.CSSProperties => {
    return themeStyles[theme.gradient] || {};
};


interface ThemeContextType {
    theme: ThemeConfig;
    setTheme: (theme: ThemeConfig) => void;
}

const defaultTheme: ThemeConfig = { gradient: 'royal', effect: 'dust' };

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setThemeState] = useState<ThemeConfig>(defaultTheme);

    useEffect(() => {
        // 1. Load from local storage on mount (Instant load)
        const savedTheme = localStorage.getItem('wedding_theme_config');
        if (savedTheme) {
            try {
                setThemeState(JSON.parse(savedTheme));
            } catch(e) {
                console.error("Failed to parse theme", e);
            }
        }

        // 2. Listen for REAL-TIME updates from Server
        // The server emits 'theme_sync' with the theme object directly
        const handleThemeUpdate = (newTheme: ThemeConfig) => {
            console.log("Theme Update Received:", newTheme);
            setThemeState(newTheme);
            localStorage.setItem('wedding_theme_config', JSON.stringify(newTheme));
        };

        // 3. Listen for Full Sync (Initial Load)
        const handleFullSync = (state: any) => {
            if (state.theme) {
                setThemeState(state.theme);
                localStorage.setItem('wedding_theme_config', JSON.stringify(state.theme));
            }
        };

        socket.on('theme_sync', handleThemeUpdate);
        socket.on('full_sync', handleFullSync);

        return () => {
            socket.off('theme_sync', handleThemeUpdate);
            socket.off('full_sync', handleFullSync);
        };
    }, []);

    const setTheme = (newTheme: ThemeConfig) => {
        setThemeState(newTheme);
        localStorage.setItem('wedding_theme_config', JSON.stringify(newTheme));
        // Note: We do NOT emit socket here. 
        // The AdminDashboard emits the change, and this Context LISTENS for it.
        // This prevents infinite loops.
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