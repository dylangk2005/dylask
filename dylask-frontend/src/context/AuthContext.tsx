import React, { useEffect, useState, useCallback } from 'react';
import type { User, LoginRequest, RegisterRequest, RegisterResponse, VerifyEmailRequest } from '@/types/auth';
import { authApi } from '@/api/auth.api';
import { AuthContext } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Khôi phục phiên làm việc khi app khởi chạy
  const restoreSession = useCallback(async () => {
    try {
      const storedToken = localStorage.getItem('access_token');
      if (storedToken) {
        try {
          const currentUser = await authApi.getMe();
          setUser(currentUser);
          setAccessToken(storedToken);
          setIsLoading(false);
          return;
        } catch {
          // Token cũ hết hạn -> thử refresh qua HttpOnly cookie bên dưới
        }
      }

      // Thử refresh phiên tự động bằng cookie HttpOnly
      try {
        const refreshRes = await authApi.refresh();
        if (refreshRes && refreshRes.accessToken) {
          localStorage.setItem('access_token', refreshRes.accessToken);
          setAccessToken(refreshRes.accessToken);
          setUser(refreshRes.user);
        }
      } catch {
        // Không có phiên hoạt động
        localStorage.removeItem('access_token');
        setAccessToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.login(credentials);
      localStorage.setItem('access_token', res.accessToken);
      setAccessToken(res.accessToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    return await authApi.register(data);
  };

  const verifyEmail = async (data: VerifyEmailRequest) => {
    setIsLoading(true);
    try {
      const res = await authApi.verifyEmail(data);
      localStorage.setItem('access_token', res.accessToken);
      setAccessToken(res.accessToken);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async (email: string) => {
    await authApi.resendVerification(email);
  };

  const handleOAuth2Success = async (token: string) => {
    localStorage.setItem('access_token', token);
    setAccessToken(token);
    try {
      const currentUser = await authApi.getMe();
      setUser(currentUser);
    } catch (err) {
      console.error('Không thể lấy thông tin người dùng sau khi đăng nhập OAuth2:', err);
    }
  };

  const updateUser = useCallback((updated: Partial<User>) => {
    setUser((prev) => (prev ? { ...prev, ...updated } : null));
  }, []);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Bỏ qua lỗi mạng khi logout để xóa state cục bộ
    } finally {
      localStorage.removeItem('access_token');
      setAccessToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        verifyEmail,
        resendVerification,
        handleOAuth2Success,
        updateUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
