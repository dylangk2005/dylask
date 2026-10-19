import { api } from './client';
import type {
  UserProfile,
  UpdateModeRequest,
  UpdateModeResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AppMode,
} from '@/types/user';

/**
 * Tập hợp các API client giao tiếp với module người dùng (`/api/v1/users/me`) của Backend.
 */
export const userApi = {
  /**
   * Lấy thông tin hồ sơ chi tiết của người dùng đang đăng nhập.
   */
  getProfile: (): Promise<UserProfile> => {
    return api.get<UserProfile>('/users/me');
  },

  /**
   * Chuyển đổi và lưu lại chế độ giao diện mặc định ('standard' hoặc 'developer').
   */
  updateMode: (mode: AppMode): Promise<UpdateModeResponse> => {
    const payload: UpdateModeRequest = { mode };
    return api.patch<UpdateModeResponse>('/users/me/mode', payload);
  },

  /**
   * Cập nhật họ tên hiển thị của người dùng.
   */
  updateProfile: (fullName: string): Promise<UserProfile> => {
    const payload: UpdateProfileRequest = { fullName };
    return api.put<UserProfile>('/users/me/profile', payload);
  },

  /**
   * Đổi mật khẩu tài khoản người dùng và thu hồi các phiên đăng nhập khác.
   */
  changePassword: (data: ChangePasswordRequest): Promise<void> => {
    return api.put<void>('/users/me/password', data);
  },
};
