import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useDualMode } from '@/hooks/useDualMode';
import { userApi } from '@/api/user.api';
import type { UserProfile } from '@/types/user';
import {
  User as UserIcon,
  Palette,
  Sparkles,
  Terminal,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Bot,
  ShieldCheck,
  Check,
} from 'lucide-react';
import './settings.css';

type SettingsTab = 'profile' | 'appearance' | 'ai';

export const SettingsPage: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const { mode, switchMode } = useDualMode();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // State form cập nhật họ tên
  const [fullName, setFullName] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // State form đổi mật khẩu
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Nạp thông tin hồ sơ người dùng
  useEffect(() => {
    let isMounted = true;
    userApi
      .getProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
          setFullName(data.fullName || '');
          setIsLoadingProfile(false);
        }
      })
      .catch((err) => {
        console.error('Không thể nạp hồ sơ người dùng:', err);
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Xử lý cập nhật họ tên
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      setProfileFeedback({ type: 'error', message: 'Họ tên phải có độ dài từ 2 đến 100 ký tự' });
      return;
    }

    setIsUpdatingProfile(true);
    setProfileFeedback(null);

    try {
      const updated = await userApi.updateProfile(fullName.trim());
      setProfile(updated);
      updateUser({ fullName: updated.fullName });
      setProfileFeedback({ type: 'success', message: 'Cập nhật họ tên thành công!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể cập nhật hồ sơ';
      setProfileFeedback({ type: 'error', message: msg });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Xử lý đổi mật khẩu
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      setPasswordFeedback({ type: 'error', message: 'Vui lòng nhập mật khẩu hiện tại' });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordFeedback({ type: 'error', message: 'Mật khẩu mới phải có tối thiểu 8 ký tự' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordFeedback({ type: 'error', message: 'Mật khẩu xác nhận không khớp' });
      return;
    }

    setIsChangingPassword(true);
    setPasswordFeedback(null);

    try {
      await userApi.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPasswordFeedback({
        type: 'success',
        message: 'Đổi mật khẩu thành công! Các phiên đăng nhập trên thiết bị khác đã được thu hồi an toàn.',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đổi mật khẩu thất bại';
      setPasswordFeedback({ type: 'error', message: msg });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Tiêu chí kiểm tra mật khẩu động
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasDigit = /\d/.test(newPassword);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasDigit;

  return (
    <div className="settings-container">
      {/* Tiêu đề trang */}
      <div className="settings-header">
        <h1 className="settings-title">Cài đặt & Tùy chọn</h1>
        <p className="settings-subtitle">
          Quản lý tài khoản cá nhân, tùy biến giao diện Dual-Mode và cấu hình tính năng trợ lý AI
        </p>
      </div>

      {/* Tabs chuyển đổi */}
      <div className="settings-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'appearance'}
          className={`settings-tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <Palette size={16} />
          <span>Giao diện & Chế độ</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={16} />
          <span>Hồ sơ & Bảo mật</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ai'}
          className={`settings-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Bot size={16} />
          <span>Trí tuệ nhân tạo (AI)</span>
        </button>
      </div>

      {/* TAB 1: GIAO DIỆN & DUAL-MODE */}
      {activeTab === 'appearance' && (
        <div className="settings-section">
          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">Chế độ trải nghiệm (Dual-Mode System)</h2>
              <p className="settings-card-desc">
                Chọn phong cách giao diện chủ đạo. Dylask sẽ tự động chuyển đổi theme và lưu lại tùy chọn cho mọi lần đăng nhập.
              </p>
            </div>

            <div className="mode-selection-grid">
              {/* Card Standard Mode */}
              <div
                className={`mode-card ${mode === 'standard' ? 'selected' : ''}`}
                onClick={() => switchMode('standard')}
              >
                <div className="mode-card-header">
                  <span className="mode-card-badge">Cá nhân</span>
                  <div className="mode-radio-circle" />
                </div>
                <div className="mode-card-title">
                  <Sparkles size={18} color="var(--color-primary)" />
                  <span>Standard Workspace</span>
                </div>
                <p className="mode-card-desc">
                  Giao diện tối giản, gam màu nhẹ nhàng, trực quan. Phù hợp cho việc quản lý công việc hàng ngày, thói quen sinh hoạt, lịch trình và chu kỳ Pomodoro.
                </p>
              </div>

              {/* Card Developer Mode */}
              <div
                className={`mode-card ${mode === 'developer' ? 'selected' : ''}`}
                onClick={() => switchMode('developer')}
              >
                <div className="mode-card-header">
                  <span className="mode-card-badge">Agile &amp; Git</span>
                  <div className="mode-radio-circle" />
                </div>
                <div className="mode-card-title">
                  <Terminal size={18} color="var(--color-primary)" />
                  <span>Developer Workspace</span>
                </div>
                <p className="mode-card-desc">
                  Mật độ thông tin cao, phông chữ kỹ thuật JetBrains Mono, bảng Kanban 5 cột chuẩn Agile, tối ưu hóa tích hợp Git và phím tắt điều hướng nhanh.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HỒ SƠ & BẢO MẬT */}
      {activeTab === 'profile' && (
        <div className="settings-section">
          {/* Thông tin hồ sơ */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">Thông tin tài khoản</h2>
              <p className="settings-card-desc">Cập nhật họ tên hiển thị của bạn trên hệ thống</p>
            </div>

            {profileFeedback && (
              <div className={`settings-alert ${profileFeedback.type}`}>
                {profileFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{profileFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="settings-form-group">
                <label className="settings-label">Địa chỉ Email</label>
                <input
                  type="email"
                  className="settings-input"
                  value={profile?.email || authUser?.email || ''}
                  disabled
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  Email là định danh tài khoản và không thể thay đổi
                </span>
              </div>

              <div className="settings-form-group">
                <label className="settings-label">Họ và tên</label>
                <input
                  type="text"
                  className="settings-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary-action"
                disabled={isUpdatingProfile || isLoadingProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <Loader2 size={14} className="spinner" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>Lưu thay đổi</span>
                )}
              </button>
            </form>
          </div>

          {/* Đổi mật khẩu */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">Bảo mật & Đổi mật khẩu</h2>
              <p className="settings-card-desc">
                Cập nhật mật khẩu định kỳ để nâng cao an toàn. Sau khi đổi mật khẩu, mọi phiên đăng nhập trên thiết bị khác sẽ tự động bị thu hồi.
              </p>
            </div>

            {passwordFeedback && (
              <div className={`settings-alert ${passwordFeedback.type}`}>
                {passwordFeedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="settings-form-group">
                <label className="settings-label">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  className="settings-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="settings-form-group">
                <label className="settings-label">Mật khẩu mới</label>
                <input
                  type="password"
                  className="settings-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {/* Chỉ báo tiêu chí mật khẩu */}
                {newPassword && (
                  <div className="password-check-list">
                    <div className={`password-check-item ${hasMinLength ? 'valid' : ''}`}>
                      <Check size={12} color={hasMinLength ? 'var(--color-success)' : 'currentColor'} />
                      <span>Tối thiểu 8 ký tự</span>
                    </div>
                    <div className={`password-check-item ${hasUppercase ? 'valid' : ''}`}>
                      <Check size={12} color={hasUppercase ? 'var(--color-success)' : 'currentColor'} />
                      <span>Có chữ hoa (A-Z)</span>
                    </div>
                    <div className={`password-check-item ${hasLowercase ? 'valid' : ''}`}>
                      <Check size={12} color={hasLowercase ? 'var(--color-success)' : 'currentColor'} />
                      <span>Có chữ thường (a-z)</span>
                    </div>
                    <div className={`password-check-item ${hasDigit ? 'valid' : ''}`}>
                      <Check size={12} color={hasDigit ? 'var(--color-success)' : 'currentColor'} />
                      <span>Có chữ số (0-9)</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="settings-form-group">
                <label className="settings-label">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  className="settings-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                {confirmPassword && confirmPassword !== newPassword && (
                  <span style={{ fontSize: '11px', color: 'var(--color-danger)' }}>
                    Mật khẩu xác nhận không khớp
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary-action"
                disabled={isChangingPassword || !isPasswordValid || newPassword !== confirmPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 size={14} className="spinner" />
                    <span>Đang cập nhật...</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={15} />
                    <span>Cập nhật mật khẩu</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: TRÍ TUỆ NHÂN TẠO (AI) */}
      {activeTab === 'ai' && (
        <div className="settings-section">
          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">Hạn mức trợ lý AI dùng thử</h2>
              <p className="settings-card-desc">
                Hệ thống cấp sẵn 10 lượt gọi AI dùng thử/tháng (tự động làm mới vào ngày 1 hàng tháng).
              </p>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                padding: 'var(--space-4)',
                borderRadius: 'var(--radius)',
                backgroundColor: 'var(--color-bg)',
                border: 'var(--border-width) solid var(--color-border)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Lượt gọi trong tháng:</span>
                <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {profile ? profile.aiTrialCount : 0} / {profile ? profile.aiTrialLimit : 10} lượt
                </span>
              </div>

              {/* Progress bar */}
              <div
                style={{
                  width: '100%',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(100, ((profile?.aiTrialCount || 0) / (profile?.aiTrialLimit || 10)) * 100)}%`,
                    height: '100%',
                    backgroundColor: 'var(--color-primary)',
                    borderRadius: 'var(--radius-full)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                <ShieldCheck size={15} color="var(--color-success)" />
                <span>
                  Lượt gọi sẽ tự động được làm mới lại vào 00:00 ngày{' '}
                  {profile?.aiTrialResetAt ? new Date(profile.aiTrialResetAt).toLocaleDateString('vi-VN') : '01 hàng tháng'}.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
