import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';
import { Check, Eye, EyeOff, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { AuthShowcasePane } from '@/components/auth/AuthShowcasePane';
import './auth.css';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakeForm, setShakeForm] = useState(false);

  const triggerShake = () => {
    setShakeForm(false);
    requestAnimationFrame(() => setShakeForm(true));
  };

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!email.trim()) {
      errors.email = 'Địa chỉ email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Email không đúng định dạng chuẩn.';
    }

    if (!password) {
      errors.password = 'Mật khẩu không được để trống.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) {
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/tasks';
      navigate(from, { replace: true });
    } catch (err) {
      triggerShake();
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          const map: Record<string, string> = {};
          err.errors.forEach((f) => {
            map[f.field] = f.message;
          });
          setFieldErrors(map);
        } else {
          setGlobalError(err.message || 'Email hoặc mật khẩu không chính xác.');
        }
      } else {
        setGlobalError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      {/* CỘT TRÁI: FORM ĐĂNG NHẬP RIÊNG BIỆT */}
      <main className="auth-left-pane">
        <div
          className={`auth-form-card ${shakeForm ? 'auth-shake' : ''}`}
          onAnimationEnd={() => setShakeForm(false)}
        >
          {/* Top Bar with Back to Landing Page */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link to="/" className="back-home-link" title="Quay lại trang giới thiệu">
              <ArrowLeft size={16} />
              <span>Trang chủ</span>
            </Link>

            <div className="auth-brand">
              <div className="brand-mark">
                <Check size={18} strokeWidth={2.5} />
              </div>
              <span className="brand-title">Dylask</span>
            </div>
          </div>

          {/* Tiêu đề form */}
          <div className="auth-header">
            <h1 className="auth-title">Đăng nhập</h1>
            <p className="auth-subtitle">
              Đăng nhập để tiếp tục công việc trong không gian làm việc của bạn.
            </p>
          </div>

          {/* Thông báo lỗi toàn cục */}
          {globalError && (
            <div className="alert-banner" role="alert">
              <AlertCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{globalError}</span>
            </div>
          )}

          {/* Form đăng nhập */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group-list">
              {/* Email */}
              <div className={`form-field ${fieldErrors.email ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="loginEmailInput">
                  Địa chỉ email
                </label>
                <div className="input-wrapper">
                  <input
                    id="loginEmailInput"
                    className="form-input"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: '' }));
                      }
                    }}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
                {fieldErrors.email && (
                  <div className="field-error-text">
                    <AlertCircle size={12} />
                    <span>{fieldErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Mật khẩu */}
              <div className={`form-field ${fieldErrors.password ? 'has-error' : ''}`}>
                <div className="field-label">
                  <label htmlFor="loginPasswordInput">Mật khẩu</label>
                </div>
                <div className="input-wrapper">
                  <input
                    id="loginPasswordInput"
                    className="form-input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu của bạn"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: '' }));
                      }
                    }}
                    autoComplete="current-password"
                    style={{ paddingRight: '38px' }}
                    disabled={isSubmitting}
                  />
                  <button
                    className="toggle-password-btn"
                    type="button"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="field-error-text">
                    <AlertCircle size={12} />
                    <span>{fieldErrors.password}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                className="btn-primary"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="spinner" size={16} />
                    <span>Đang xác thực...</span>
                  </>
                ) : (
                  <span>Đăng nhập vào Dylask</span>
                )}
              </button>
            </div>
          </form>

          {/* Đăng nhập nhanh bằng Google & GitHub */}
          <SocialAuthButtons mode="login" disabled={isSubmitting} />

          {/* Chuyển sang trang Đăng ký riêng biệt */}
          <p className="auth-switch-text">
            <span>Chưa có tài khoản?</span>
            <Link to="/register" className="auth-switch-link">
              Tạo tài khoản mới
            </Link>
          </p>
        </div>
      </main>

      {/* CỘT PHẢI: SHOWCASE TƯƠNG TÁC */}
      <AuthShowcasePane variant="login" />
    </div>
  );
};
