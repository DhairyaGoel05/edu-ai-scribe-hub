
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'INSTRUCTOR';
  createdAt?: string;
  updatedAt?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData: { name: string; phone: string; age: number; role: 'student' | 'instructor' }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on app start
    const token = localStorage.getItem('auth_token');
    const savedUser = localStorage.getItem('currentUser');
    if (token && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setProfile(userData);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiService.login({ email, password });
      
      // Store token and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      setUser(response.user);
      setProfile(response.user);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, userData: { name: string; phone: string; age: number; role: 'student' | 'instructor' }) => {
    setLoading(true);
    try {
      const response = await apiService.register({
        email,
        password,
        name: userData.name,
        role: userData.role.toUpperCase() as 'STUDENT' | 'INSTRUCTOR'
      });

      // Store token and user data
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      
      setUser(response.user);
      setProfile(response.user);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(error.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      setProfile(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in');
    
    try {
      // For now, just update locally since we don't have a profile update endpoint
      const updatedUser = { ...user, ...updates };
      
      setUser(updatedUser);
      setProfile(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const value = {
    user,
    profile,
    login,
    signup,
    logout,
    updateProfile,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
