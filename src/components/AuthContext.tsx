import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: { uid: string; email: string; role: UserRole } | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  refreshProfile: () => Promise<void>;
  login: (userData: UserProfile) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUserProfile(data);
      } else if (res.status === 401) {
        // Session expired or unauthorized
        setUserProfile(null);
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUserProfile(null);
    } finally {
      setLoading(false);
      setIsAuthReady(true);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const login = (userData: UserProfile) => {
    setUserProfile(userData);
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    await fetchProfile();
  };

  const user = userProfile ? { uid: userProfile.uid, email: userProfile.email, role: userProfile.role } : null;

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, isAuthReady, refreshProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
