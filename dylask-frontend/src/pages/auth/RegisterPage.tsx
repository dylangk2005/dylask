import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ApiError } from '@/types/api';
import {
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  Terminal,
  ArrowLeft,
  Mail,
  RotateCcw,
} from 'lucide-react';
import { SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import './auth.css';

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState<'FORM' | 'OTP'>('FORM');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

  // Đếm ngược 60s cho nút gửi lại OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendCooldown]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Họ và tên không được để trống.';
    } else if (fullName.trim().length < 2) {
      errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
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
    } else {
      if (!/[A-Z]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất một chữ in hoa.';
      } else if (!/[a-z]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất một chữ in thường.';
      } else if (!/[0-9]/.test(password)) {
        errors.password = 'Mật khẩu phải chứa ít nhất một chữ số.';
      }
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Bước 1: Khởi tạo thông tin đăng ký
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessNotice(null);

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await register({ email: email.trim(), password, fullName: fullName.trim() });
      if (res.requiresVerification) {
        setStep('OTP');
        setResendCooldown(60);
        setSuccessNotice(res.message);
      } else {
        navigate('/tasks', { replace: true });
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errors && err.errors.length > 0) {
          const map: Record<string, string> = {};
          err.errors.forEach((f) => {
            map[f.field] = f.message;
          });
          setFieldErrors(map);
        } else {
          setGlobalError(err.message || 'Đăng ký tài khoản không thành công.');
        }
      } else {
        setGlobalError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Bước 2: Xác thực mã OTP 6 số
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalError(null);
    setSuccessNotice(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setGlobalError('Vui lòng nhập đúng mã xác thực gồm 6 chữ số.');
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail({ email: email.trim(), otp: otp.trim() });
      navigate('/tasks', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        setGlobalError(err.message || 'Mã xác thực không chính xác.');
      } else {
        setGlobalError('Lỗi kết nối khi xác thực OTP.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Gửi lại mã OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isSubmitting) return;

    setGlobalError(null);
    setIsSubmitting(true);
    try {
      await resendVerification(email.trim());
      setResendCooldown(60);
      setSuccessNotice('Mã xác thực mới đã được gửi. Vui lòng kiểm tra hòm thư của bạn.');
    } catch (err) {
      if (err instanceof ApiError) {
        setGlobalError(err.message || 'Không thể gửi lại mã xác thực.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tiêu chuẩn mật khẩu
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    <div className="auth-container">
      {/* CỘT TRÁI: FORM ĐĂNG KÝ HOẶC FORM NHẬP OTP */}
      <main className="auth-left-pane">
        <div className="auth-form-card">
          {/* Header Top Bar */}
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

          {/* BƯỚC 1: FORM ĐĂNG KÝ BAN ĐẦU */}
          {step === 'FORM' && (
            <>
              <div className="auth-header">
                <h1 className="auth-title">Tạo tài khoản</h1>
                <p className="auth-subtitle">
                  Bước 1: Khởi tạo thông tin cơ bản để thiết lập tài khoản của bạn.
                </p>
              </div>

              {globalError && (
                <div className="alert-banner" role="alert">
                  <AlertCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{globalError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} noValidate>
                <div className="form-group-list">
                  {/* Họ tên */}
                  <div className={`form-field ${fieldErrors.fullName ? 'has-error' : ''}`}>
                    <label className="field-label" htmlFor="registerFullNameInput">
                      Họ và tên
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="registerFullNameInput"
                        className="form-input"
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (fieldErrors.fullName) setFieldErrors((prev) => ({ ...prev, fullName: '' }));
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

                  {/* Email */}
                  <div className={`form-field ${fieldErrors.email ? 'has-error' : ''}`}>
                    <label className="field-label" htmlFor="registerEmailInput">
                      Địa chỉ email
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="registerEmailInput"
                        className="form-input"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: '' }));
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
                      <label htmlFor="registerPasswordInput">Mật khẩu</label>
                    </div>
                    <div className="input-wrapper">
                      <input
                        id="registerPasswordInput"
                        className="form-input"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Tối thiểu 8 ký tự (hoa, thường, số)"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: '' }));
                        }}
                        autoComplete="new-password"
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

                  {/* Chips tiêu chuẩn mật khẩu */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '-4px' }}>
                    <span className={`pwd-chip ${hasMinLength ? 'met' : ''}`}>
                      {hasMinLength ? '✓' : '•'} 8+ ký tự
                    </span>
                    <span className={`pwd-chip ${hasUpperCase ? 'met' : ''}`}>
                      {hasUpperCase ? '✓' : '•'} Chữ in hoa
                    </span>
                    <span className={`pwd-chip ${hasLowerCase ? 'met' : ''}`}>
                      {hasLowerCase ? '✓' : '•'} Chữ in thường
                    </span>
                    <span className={`pwd-chip ${hasNumber ? 'met' : ''}`}>
                      {hasNumber ? '✓' : '•'} Chữ số
                    </span>
                  </div>

                  {/* Xác nhận mật khẩu */}
                  <div className={`form-field ${fieldErrors.confirmPassword ? 'has-error' : ''}`}>
                    <div className="field-label">
                      <label htmlFor="registerConfirmPasswordInput">Xác nhận mật khẩu</label>
                      {confirmPassword && password && confirmPassword === password && (
                        <span style={{ fontSize: '12px', color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
                          <Check size={13} /> Khớp mật khẩu
                        </span>
                      )}
                    </div>
                    <div className="input-wrapper">
                      <input
                        id="registerConfirmPasswordInput"
                        className="form-input"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Nhập lại mật khẩu vừa tạo"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors((prev) => ({ ...prev, confirmPassword: '' }));
                        }}
                        autoComplete="new-password"
                        style={{ paddingRight: '38px' }}
                        disabled={isSubmitting}
                      />
                      <button
                        className="toggle-password-btn"
                        type="button"
                        title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <div className="field-error-text">
                        <AlertCircle size={12} />
                        <span>{fieldErrors.confirmPassword}</span>
                      </div>
                    )}
                  </div>

                  {/* Nút Đăng ký */}
                  <button className="btn-primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="spinner" size={16} />
                        <span>Đang xử lý thông tin...</span>
                      </>
                    ) : (
                      <span>Tiếp tục: Xác thực email</span>
                    )}
                  </button>
                </div>
              </form>

              {/* Đăng ký nhanh bằng Google & GitHub */}
              <SocialAuthButtons mode="register" disabled={isSubmitting} />

              <p className="auth-switch-text">
                <span>Đã có tài khoản?</span>
                <Link to="/login" className="auth-switch-link">
                  Đăng nhập ngay
                </Link>
              </p>
            </>
          )}

          {/* BƯỚC 2: FORM NHẬP MÃ XÁC THỰC OTP */}
          {step === 'OTP' && (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
                <div className="otp-icon-header">
                  <Mail size={24} />
                </div>
                <h1 className="auth-title">Xác thực địa chỉ email</h1>
                <p className="auth-subtitle" style={{ maxWidth: '380px' }}>
                  Chúng tôi đã gửi mã xác thực 6 chữ số tới{' '}
                  <strong style={{ color: 'var(--color-text)' }}>{email}</strong>. Vui lòng kiểm tra hộp thư của bạn.
                </p>
              </div>

              {successNotice && (
                <div
                  style={{
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    color: '#065F46',
                    padding: '10px 12px',
                    borderRadius: 'var(--radius)',
                    fontSize: '12px',
                    textAlign: 'center',
                  }}
                >
                  {successNotice}
                </div>
              )}

              {globalError && (
                <div className="alert-banner" role="alert">
                  <AlertCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
                  <span>{globalError}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit}>
                <div className="form-group-list">
                  <div className="form-field">
                    <label className="field-label" style={{ justifyContent: 'center' }}>
                      Nhập mã OTP 6 chữ số
                    </label>
                    <input
                      className="otp-input-field"
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setOtp(val);
                      }}
                      autoFocus
                      disabled={isSubmitting}
                    />
                  </div>

                  <button className="btn-primary" type="submit" disabled={isSubmitting || otp.length !== 6}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="spinner" size={16} />
                        <span>Đang kích hoạt tài khoản...</span>
                      </>
                    ) : (
                      <span>Kích hoạt & Đăng nhập</span>
                    )}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => setStep('FORM')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-text-muted)',
                        fontSize: '12px',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      ← Đổi email khác
                    </button>

                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0 || isSubmitting}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'none',
                        border: 'none',
                        color: resendCooldown > 0 ? 'var(--color-text-muted)' : 'var(--color-primary)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                      }}
                    >
                      <RotateCcw size={13} />
                      <span>{resendCooldown > 0 ? `Gửi lại mã (${resendCooldown}s)` : 'Gửi lại mã OTP'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </main>

      {/* CỘT PHẢI: HERO SHOWCASE */}
      <aside className="auth-right-pane">
        <div className="showcase-content-wrapper">
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

          <div className="intro-statement-card">
            <div className="intro-badge">
              <Sparkles size={13} />
              <span>DUAL-MODE PRODUCTIVITY</span>
            </div>
            <p className="intro-statement">
              Bảo mật 2 lớp an toàn cho mọi tài khoản cá nhân và kỹ thuật.
            </p>
            <p className="intro-meta">
              Xác thực email tức thì giúp bảo vệ dữ liệu dự án và nhiệm vụ của bạn khỏi truy cập trái phép.
            </p>

            <div className="mode-feature-pills">
              <div className="feature-pill">
                <div className="feature-pill-title">
                  <Sparkles size={13} color="#2DD4BF" />
                  <span>Standard Mode</span>
                </div>
                <div className="feature-pill-desc">
                  Thói quen, Checklist & Lịch biểu cá nhân
                </div>
              </div>

              <div className="feature-pill">
                <div className="feature-pill-title">
                  <Terminal size={13} color="#2DD4BF" />
                  <span>Developer Mode</span>
                </div>
                <div className="feature-pill-desc">
                  Quản lý Sprint, Git Triggers & Code Focus
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};
