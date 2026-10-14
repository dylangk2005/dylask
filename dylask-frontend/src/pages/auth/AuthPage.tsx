import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';
import { Check, Eye, EyeOff, AlertCircle, Loader2, Sparkles, Terminal } from 'lucide-react';
import './auth.css';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleModeSwitch = (newMode: 'login' | 'register') => {
    setMode(newMode);
    setGlobalError(null);
    setFieldErrors({});
    navigate(newMode === 'login' ? '/login' : '/register', { replace: true });
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (mode === 'register') {
      if (!fullName.trim()) {
        errors.fullName = 'Họ và tên không được để trống.';
      } else if (fullName.trim().length < 2) {
        errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
      }
    }

    if (!email.trim()) {
      errors.email = 'Địa chỉ email không được để trống.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Email không đúng định dạng chuẩn.';
    }

    if (!password) {
      errors.password = 'Mật khẩu không được để trống.';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải chứa ít nhất 8 ký tự.';
    } else if (mode === 'register') {
      if (!/[A-Z]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất một chữ in hoa.';
      } else if (!/[a-z]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất một chữ in thường.';
      } else if (!/[0-9]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất một chữ số.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        await login({ email: email.trim(), password });
      } else {
        await register({ email: email.trim(), password, fullName: fullName.trim() });
      }

      const from = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          const map: Record<string, string> = {};
          err.errors.forEach((f) => {
            map[f.field] = f.message;
          });
          setFieldErrors(map);
        } else {
          setGlobalError(err.message || 'Đã xảy ra lỗi, vui lòng thử lại.');
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
      {/* CỘT TRÁI: FORM ĐĂNG NHẬP / ĐĂNG KÝ */}
      <main className="auth-left-pane">
        <div className="auth-form-card">
          {/* Brand Logo */}
          <div className="auth-brand">
            <div className="brand-mark">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <span className="brand-title">Dylask</span>
          </div>

          {/* Tiêu đề form */}
          <div className="auth-header">
            <h1 className="auth-title">
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký tài khoản'}
            </h1>
            <p className="auth-subtitle">
              {mode === 'login'
                ? 'Nhập thông tin xác thực để truy cập không gian làm việc của bạn.'
                : 'Khởi tạo tài khoản chỉ trong 30 giây để bắt đầu tối ưu năng suất.'}
            </p>
          </div>

          {/* Tab chuyển đổi Đăng nhập / Đăng ký */}
          <div className="auth-tabs" role="tablist">
            <button
              className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              onClick={() => handleModeSwitch('login')}
            >
              Đăng nhập
            </button>
            <button
              className={`auth-tab-btn ${mode === 'register' ? 'active' : ''}`}
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              onClick={() => handleModeSwitch('register')}
            >
              Đăng ký
            </button>
          </div>

          {/* Trạng thái lỗi toàn cục */}
          {globalError && (
            <div className="alert-banner" role="alert">
              <AlertCircle size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>{globalError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group-list">
              {/* Họ tên (Chỉ hiển thị khi Đăng ký) */}
              {mode === 'register' && (
                <div className={`form-field ${fieldErrors.fullName ? 'has-error' : ''}`}>
                  <label className="field-label" htmlFor="fullNameInput">
                    Họ và tên
                  </label>
                  <div className="input-wrapper">
                    <input
                      id="fullNameInput"
                      className="form-input"
                      type="text"
                      placeholder="Nguyễn Văn A"
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (fieldErrors.fullName) {
                          setFieldErrors((prev) => ({ ...prev, fullName: '' }));
                        }
                      }}
                      autoComplete="name"
                      disabled={isSubmitting}
                    />
                  </div>
                  {fieldErrors.fullName && (
                    <div className="field-error-text">
                      <AlertCircle size={12} />
                      <span>{fieldErrors.fullName}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Email */}
              <div className={`form-field ${fieldErrors.email ? 'has-error' : ''}`}>
                <label className="field-label" htmlFor="emailInput">
                  Địa chỉ email
                </label>
                <div className="input-wrapper">
                  <input
                    id="emailInput"
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
                  <label htmlFor="passwordInput">Mật khẩu</label>
                </div>
                <div className="input-wrapper">
                  <input
                    id="passwordInput"
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
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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
                    <span>Đang xử lý dữ liệu...</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Đăng nhập vào Dylask' : 'Khởi tạo tài khoản'}</span>
                )}
              </button>
            </div>
          </form>

          {/* Dòng chuyển mode */}
          <p className="auth-switch-text">
            <span>
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
            </span>
            <a
              className="auth-switch-link"
              role="button"
              onClick={() => handleModeSwitch(mode === 'login' ? 'register' : 'login')}
            >
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </a>
          </p>
        </div>
      </main>

      {/* CỘT PHẢI: HIỂN THỊ SHOWCASE HERO VỚI HÌNH ẢNH 3D & BADGES */}
      <aside className="auth-right-pane">
        <div className="showcase-content-wrapper">
          {/* Card hình ảnh 3D nổi bật */}
          <div className="hero-image-card">
            <div className="hero-mock-header">
              <span className="mock-dot red"></span>
              <span className="mock-dot yellow"></span>
              <span className="mock-dot green"></span>
            </div>
            <img
              src="/auth-hero.jpg"
              alt="Dylask Dual-Mode Workspace"
              className="hero-img"
            />
          </div>

          {/* Thông điệp thương hiệu */}
          <div className="intro-statement-card">
            <div className="intro-badge">
              <Sparkles size={13} />
              <span>DUAL-MODE PRODUCTIVITY</span>
            </div>
            <p className="intro-statement">
              Một nền tảng, hai trải nghiệm tối ưu cho cả công việc cá nhân và phát triển phần mềm.
            </p>
            <p className="intro-meta">
              Đồng bộ lịch trình, theo dõi thói quen thường nhật và điều phối Sprint kỹ thuật mượt mà trên cùng một hệ thống.
            </p>

            {/* Badges tính năng hai chế độ */}
            <div className="mode-feature-pills">
              <div className="feature-pill">
                <div className="feature-pill-title">
                  <Sparkles size={13} color="#2DD4BF" />
                  <span>Standard Mode</span>
                </div>
                <div className="feature-pill-desc">
                  My Day, Checklists, Pomodoro & Thống kê Streak
                </div>
              </div>

              <div className="feature-pill">
                <div className="feature-pill-title">
                  <Terminal size={13} color="#2DD4BF" />
                  <span>Developer Mode</span>
                </div>
                <div className="feature-pill-desc">
                  Kanban Sprints, Git Webhooks & Quản lý Backlog
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
