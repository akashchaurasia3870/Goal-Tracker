import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { sampleUser } from '../data/user_data';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('taskflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [settings, setSettings] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('taskflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize auth check or fallback to demo user if requested
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('taskflow_token');
      if (storedToken) {
        try {
          const res = await api.get('/users/profile');
          if (res.data) {
            setUser(res.data.user);
            setSettings(res.data.settings);
            localStorage.setItem('taskflow_user', JSON.stringify(res.data.user));
          }
        } catch (error) {
          console.warn('[AuthContext] Session expired or server unavailable:', error.message);
          // If token invalid, clear
          if (error.status === 401) {
            logout(false);
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user: userData, accessToken, settings: userSettings } = res.data;

      setUser(userData);
      setSettings(userSettings);
      setToken(accessToken);
      localStorage.setItem('taskflow_token', accessToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));

      toast.success(`Welcome back, ${userData.name}!`);
      return userData;
    } catch (error) {
      const msg = error.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (name, email, password, role = 'User') => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user: userData, accessToken } = res.data;

      setUser(userData);
      setToken(accessToken);
      localStorage.setItem('taskflow_token', accessToken);
      localStorage.setItem('taskflow_user', JSON.stringify(userData));

      toast.success('Account created successfully!');
      return userData;
    } catch (error) {
      const msg = error.message || 'Registration failed.';
      toast.error(msg);
      throw error;
    }
  };

  const logout = async (notify = true) => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } finally {
      setUser(null);
      setSettings(null);
      setToken(null);
      localStorage.removeItem('taskflow_token');
      localStorage.removeItem('taskflow_user');
      if (notify) {
        toast.success('Logged out successfully');
      }
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const res = await api.put('/users/profile', updateData);
      const updatedUser = { ...user, ...res.data };
      setUser(updatedUser);
      localStorage.setItem('taskflow_user', JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      toast.error(error.message || 'Failed to update profile');
      throw error;
    }
  };

  const updateSettings = async (settingsData) => {
    try {
      const res = await api.put('/users/settings', settingsData);
      setSettings(res.data);
      toast.success('Settings updated successfully');
      return res.data;
    } catch (error) {
      toast.error(error.message || 'Failed to update settings');
      throw error;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/users/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to change password');
      throw error;
    }
  };

  // Demo Login Helper for rapid testing during development
  const loginAsDemo = (role = 'User') => {
    const demoUser = {
      ...sampleUser,
      id: role === 'Admin' ? 'usr_admin_001' : 'usr_001',
      name: role === 'Admin' ? 'Admin Manager' : 'Alex Johnson',
      email: role === 'Admin' ? 'admin@taskflow.dev' : 'alex@taskflow.dev',
      role,
    };
    setUser(demoUser);
    setToken('demo_mock_token_2026');
    localStorage.setItem('taskflow_user', JSON.stringify(demoUser));
    localStorage.setItem('taskflow_token', 'demo_mock_token_2026');
    toast.success(`Logged in as ${role} (Demo Mode)`);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        settings,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        login,
        register,
        logout,
        updateProfile,
        updateSettings,
        changePassword,
        loginAsDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
