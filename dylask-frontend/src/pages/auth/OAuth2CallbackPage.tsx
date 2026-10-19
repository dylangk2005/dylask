import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, AlertCircle } from 'lucide-react';
import './auth.css';

/**
 * Trang tiếp nhận Callback từ quy trình xác thực OAuth2 (Google & GitHub).
 * Đọc Access Token trả về từ Backend Redirect, lưu vào AuthContext và chuyển hướng vào Dashboard.
 */
export const OAuth2CallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuth2Success } = useAuth();

  // Đọc params trực tiếp từ URL
  const token = searchParams.get('token');
  const errorParam = searchParams.get('error');

  // Khởi tạo thông báo lỗi từ tham số URL nếu có
  const initialError = errorParam
    ? decodeURIComponent(errorParam) || 'Đăng nhập mạng xã hội không thành công.'
    : !token
      ? 'Không tìm thấy mã thông báo xác thực hợp lệ.'
      : null;

  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  useEffect(() => {
    // 1. Trường hợp có lỗi từ trước hoặc thiếu token: Hẹn giờ quay về trang đăng nhập
    if (initialError) {
      const timer = setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }

    // 2. Trường hợp nhận token thành công: Đồng bộ với AuthContext
    if (token) {
      handleOAuth2Success(token)
        .then(() => {
          // Xóa query token trên URL để bảo vệ lịch sử trình duyệt
          window.history.replaceState({}, document.title, '/oauth2/callback');
          navigate('/tasks', { replace: true });
        })
        .catch((err: unknown) => {
          console.error('OAuth2 callback error:', err);
          setErrorMessage('Không thể đồng bộ hồ sơ đăng nhập. Đang chuyển về trang đăng nhập...');
          setTimeout(() => navigate('/login', { replace: true }), 2500);
        });
    }
  }, [token, initialError, handleOAuth2Success, navigate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        width: '100vw',
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-ui)',
        gap: '16px',
        textAlign: 'center',
        padding: '20px',
      }}
    >
      {errorMessage ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            maxWidth: '400px',
          }}
        >
          <AlertCircle size={36} color="#EF4444" />
          <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Đăng nhập không thành công</h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-muted)' }}>{errorMessage}</p>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <Loader2 className="spinner" size={32} color="var(--color-primary)" />
          <h2 style={{ fontSize: '18px', fontWeight: 600, letterSpacing: '-0.3px' }}>
            Đang hoàn tất đăng nhập Dylask...
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Hệ thống đang đồng bộ phiên làm việc của bạn, vui lòng đợi trong giây lát.
          </p>
        </div>
      )}
    </div>
  );
};
