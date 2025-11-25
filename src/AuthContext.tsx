import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define User Type
type User = {
  name: string;
  role: 'couple' | 'guest' | 'admin';
} | null;

// Define Context Interface
interface AuthContextType {
  user: User;
  login: (name: string, role: 'couple' | 'guest' | 'admin') => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  // Load session from local storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('wedding_auth');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse auth cookie", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (name: string, role: 'couple' | 'guest' | 'admin') => {
    const newUser = { name, role };
    setUser(newUser);
    localStorage.setItem('wedding_auth', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wedding_auth');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};