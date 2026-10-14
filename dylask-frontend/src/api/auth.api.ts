import { api } from './client';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailRequest,
  User,
} from '@/types/auth';

/**
 * Tập hợp các API client giao tiếp với module xác thực (`/api/v1/auth`) của Backend.
 */
export const authApi = {
  /**
   * Đăng nhập người dùng bằng email và mật khẩu.
   * Cấp Access Token trong response body và Refresh Token trong HttpOnly Cookie.
   */
  login: (data: LoginRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/login', data);
  },

  /**
   * Đăng ký tài khoản người dùng mới (Bước 1).
   * Kích hoạt gửi mã OTP 6 chữ số tới hòm thư người dùng.
   */
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return api.post<RegisterResponse>('/auth/register', data);
  },

  /**
   * Xác thực mã OTP 6 chữ số để kích hoạt tài khoản (Bước 2).
   * Tự động đăng nhập và trả về Access Token nếu mã hợp lệ.
   */
  verifyEmail: (data: VerifyEmailRequest): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/verify-email', data);
  },

  /**
   * Gửi lại mã xác thực OTP mới tới email (áp dụng giới hạn cooldown 60 giây).
   */
  resendVerification: (email: string): Promise<void> => {
    return api.post<void>('/auth/resend-verification', { email });
  },

  /**
   * Làm mới Access Token thông qua Refresh Token (Token Rotation).
   */
  refresh: (refreshToken?: string): Promise<AuthResponse> => {
    return api.post<AuthResponse>('/auth/refresh', refreshToken ? { refreshToken } : {});
  },

  /**
   * Đăng xuất phiên làm việc hiện tại và thu hồi Refresh Token trên máy chủ.
   */
  logout: (refreshToken?: string): Promise<void> => {
    return api.post<void>('/auth/logout', refreshToken ? { refreshToken } : {});
  },

  /**
   * Lấy thông tin hồ sơ của người dùng đang đăng nhập dựa trên JWT Access Token hiện thời.
   */
  getMe: (): Promise<User> => {
    return api.get<User>('/auth/me');
  },
};
