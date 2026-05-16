'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserProfile {
  id: number;
  role: number;
  role_name: string;
  role_display: string;
  can_manage_users: boolean;
  can_manage_customers: boolean;
  can_manage_orders: boolean;
  can_manage_payments: boolean;
  can_manage_fabrics: boolean;
  can_manage_measurements: boolean;
  can_view_reports: boolean;
  can_manage_settings: boolean;
  // user_details: User
}

interface Subscription {
  id: number;
  plan: string;
  status: string;
  max_customers: number;
  max_orders: number;
  max_fabrics: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  profile: UserProfile | null;
  subscription: Subscription | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('Token');
    const storedUser = localStorage.getItem('user');
    const storedProfile = localStorage.getItem('profile');
    const storedSubscription = localStorage.getItem('subscription');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      if (storedProfile) {
        setSubscription(JSON.parse(storedProfile));
      }
      if (storedSubscription) {
        setSubscription(JSON.parse(storedSubscription));
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await authAPI.login(username, password);
    const { token, user, subscription, profile } = response.data;
    localStorage.setItem('Token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('profile', JSON.stringify(profile));
    localStorage.setItem('subscription', JSON.stringify(subscription));
    setToken(token);
    setUser(user);
    setProfile(profile)
    setSubscription(subscription);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('user');
    localStorage.removeItem('profile');
    localStorage.removeItem('subscription');
    setToken(null);
    setUser(null);
    setProfile(null);
    setSubscription(null);
    router.push('/login');
  };

  const hasPermission = (permission: string): boolean => {
    if (!profile) return false;
    return (profile as any)[permission] === true;
  };

  return (
    <AuthContext.Provider value={{ user, token, subscription, login, logout, isLoading, hasPermission, profile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};