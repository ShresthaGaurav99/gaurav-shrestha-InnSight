import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkLoggedInUser();
  }, []);

  const checkLoggedInUser = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userInfo = await AsyncStorage.getItem('user');
      if (token && userInfo) {
        const parsedUser = JSON.parse(userInfo);
        setUser(parsedUser);
      }
    } catch (e) {
      console.log('Failed to fetch user', e);
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role) => {
    if (role === 'admin' || role === 'manager' || role === 'customer' || role === 'guest') {
      router.replace('/(tabs)/dashboard');
    } else if (role === 'staff') {
      router.replace('/(tabs)/tasks');
    } else {
      router.replace('/(tabs)/dashboard');
    }
  };

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token, user } = res.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      redirectByRole(user.role);
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const verifyOTP = async (email, otp) => {
    try {
      const res = await api.post('/auth/verify-otp', { email, otp });
      const { token, user } = res.data;
      
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      redirectByRole(user.role);
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const resendOTP = async (email) => {
    try {
      const res = await api.post('/auth/resend-otp', { email });
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const register = async (name, email, password, role) => {
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      router.push({
        pathname: '/(auth)/verify-otp',
        params: { email },
      });
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const requestPasswordReset = async (email) => {
    try {
      const res = await api.post('/auth/forgot-password', { email });
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const resetPassword = async (email, otp, password) => {
    try {
      const res = await api.post('/auth/reset-password', { email, otp, password });
      return res.data;
    } catch (e) {
      throw e;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('user');
    setUser(null);
    router.replace('/(auth)/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyOTP,
        resendOTP,
        register,
        requestPasswordReset,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
