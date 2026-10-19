import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { userApi } from '@/api/user.api';
import type { AppMode } from '@/types/user';

export type { AppMode };

/**
 * Custom Hook quản lý trạng thái Dual-Mode (Standard Mode <-> Developer Mode).
 * 
 * Áp dụng cơ chế Optimistic UI:
 * 1. Thay đổi thuộc tính DOM `data-mode` trên <html> và <body> tức thì (< 16ms).
 * 2. Lưu bộ nhớ đệm `localStorage` để chống hiện tượng FOUC khi tải lại trang.
 * 3. Tự động điều hướng route phù hợp giữa 2 chế độ làm việc.
 * 4. Gửi ngầm request PATCH /api/v1/users/me/mode nếu người dùng đã đăng nhập.
 */
export function useDualMode() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('dylask_app_mode');
    return saved === 'developer' || saved === 'standard' ? saved : 'standard';
  });

  // Đồng bộ thuộc tính DOM khi component mount hoặc mode thay đổi
  useEffect(() => {
    document.documentElement.setAttribute('data-mode', mode);
    document.body.setAttribute('data-mode', mode);
    localStorage.setItem('dylask_app_mode', mode);
  }, [mode]);

  /**
   * Chuyển đổi sang một chế độ cụ thể với Optimistic UI.
   */
  const switchMode = useCallback(
    (targetMode: AppMode) => {
      if (targetMode === mode) return;

      // 1. Optimistic UI: Cập nhật state, DOM và localStorage tức thời
      setMode(targetMode);
      document.documentElement.setAttribute('data-mode', targetMode);
      document.body.setAttribute('data-mode', targetMode);
      localStorage.setItem('dylask_app_mode', targetMode);

      // 2. Chuyển hướng route tương ứng nếu đang ở các trang workspace
      const currentPath = location.pathname;
      const isSettings = currentPath.startsWith('/settings');

      if (!isSettings) {
        if (targetMode === 'developer') {
          // Từ Standard Workspace sang Developer Workspace
          navigate('/developer/board');
        } else {
          // Từ Developer Workspace sang Standard Workspace
          navigate('/tasks');
        }
      }

      // 3. Gửi request ngầm lên Backend nếu đã đăng nhập
      const token = localStorage.getItem('access_token');
      if (token) {
        userApi.updateMode(targetMode).catch((err) => {
          console.warn('Không thể đồng bộ chế độ lên máy chủ:', err);
        });
      }
    },
    [mode, location.pathname, navigate]
  );

  /**
   * Đảo chiều chế độ giữa 'standard' và 'developer'.
   */
  const toggleMode = useCallback(() => {
    const nextMode: AppMode = mode === 'standard' ? 'developer' : 'standard';
    switchMode(nextMode);
  }, [mode, switchMode]);

  return {
    mode,
    setMode,
    switchMode,
    toggleMode,
    isDeveloper: mode === 'developer',
    isStandard: mode === 'standard',
  };
}
