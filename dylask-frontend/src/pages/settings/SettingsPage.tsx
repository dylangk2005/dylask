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
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Keyboard,
  ListChecks,
  Cpu,
} from 'lucide-react';
import './settings.css';

type SettingsTab = 'profile' | 'appearance' | 'ai';

const SHORTCUT_HINTS = [
  { key: 'C', desc: 'Mở nhanh cửa sổ tạo công việc mới' },
  { key: '/', desc: 'Focus nhanh vào ô tìm kiếm ở Danh sách công việc' },
  { key: 'T', desc: 'Quay về ngày Hôm nay trên Lịch trình' },
  { key: '1 · 2 · 3', desc: 'Chuyển nhanh chế độ Tháng / Tuần / Ngày trên Lịch trình' },
];

export const SettingsPage: React.FC = () => {
  const { user: authUser, updateUser } = useAuth();
  const { mode, switchMode } = useDualMode();

  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(true);

  // State form cập nhật họ tên
  const [fullName, setFullName] = useState<string>('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [profileFeedback, setProfileFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // State form đổi mật khẩu & hiển thị mật khẩu
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showCurrentPw, setShowCurrentPw] = useState<boolean>(false);
  const [showNewPw, setShowNewPw] = useState<boolean>(false);
  const [showConfirmPw, setShowConfirmPw] = useState<boolean>(false);
  const [isChangingPassword, setIsChangingPassword] = useState<boolean>(false);
  const [passwordFeedback, setPasswordFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

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
  const passedChecks = [hasMinLength, hasUppercase, hasLowercase, hasDigit].filter(Boolean).length;
  const isPasswordValid = passedChecks === 4;

  const displayName = profile?.fullName || authUser?.fullName || 'Người dùng Dylask';
  const displayEmail = profile?.email || authUser?.email || '';
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || 'D';

  const aiUsed = profile?.aiTrialCount ?? 0;
  const aiLimit = profile?.aiTrialLimit ?? 10;
  const aiRemaining = Math.max(0, aiLimit - aiUsed);
  const aiPercent = Math.min(100, Math.round((aiUsed / Math.max(1, aiLimit)) * 100));

  return (
    <div className="settings-container">
      {/* Header đồng bộ cùng toàn bộ Standard Workspace */}
      <div className="settings-header-row">
        <div className="settings-title-block">
          <span className="settings-icon-badge" aria-hidden="true">
            <SettingsIcon size={20} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="settings-title">Cài đặt &amp; Tùy chọn</h1>
            <p className="settings-subtitle">
              Quản lý tài khoản cá nhân, tùy biến giao diện Dual-Mode và cấu hình trợ lý AI
            </p>
          </div>
        </div>

        <div className="settings-user-chip">
          <div className="settings-user-avatar">{avatarInitial}</div>
          <div className="settings-user-meta">
            <span className="settings-user-name">{displayName}</span>
            <span className="settings-user-email">{displayEmail || 'Tài khoản cá nhân'}</span>
          </div>
          <span className="settings-mode-pill">
            {mode === 'standard' ? 'Standard' : 'Developer'}
          </span>
        </div>
      </div>

      {/* Segmented Tabs chuyển đổi */}
      <div className="settings-tabs" role="tablist" aria-label="Danh mục cài đặt">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'appearance'}
          className={`settings-tab-btn ${activeTab === 'appearance' ? 'active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <Palette size={15} />
          <span>Giao diện &amp; Chế độ</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'profile'}
          className={`settings-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <UserIcon size={15} />
          <span>Hồ sơ &amp; Bảo mật</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'ai'}
          className={`settings-tab-btn ${activeTab === 'ai' ? 'active' : ''}`}
          onClick={() => setActiveTab('ai')}
        >
          <Bot size={15} />
          <span>Trí tuệ nhân tạo (AI)</span>
          <span className="settings-tab-count">{aiRemaining}/{aiLimit}</span>
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
                role="button"
                tabIndex={0}
                className={`mode-card ${mode === 'standard' ? 'selected' : ''}`}
                onClick={() => switchMode('standard')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchMode('standard');
                  }
                }}
              >
                <div className="mode-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mode-card-badge">Cá nhân</span>
                    {mode === 'standard' && (
                      <span className="mode-active-tag">Đang sử dụng</span>
                    )}
                  </div>
                  <div className="mode-radio-circle" />
                </div>

                {/* Live Mini Preview cho Standard Mode */}
                <div className="mode-preview standard-preview" aria-hidden="true">
                  <div className="preview-sidebar light">
                    <span className="preview-dot teal" />
                    <span className="preview-line" />
                    <span className="preview-line short" />
                  </div>
                  <div className="preview-canvas light">
                    <div className="preview-card-row">
                      <span className="preview-check" />
                      <span className="preview-line wide" />
                    </div>
                    <div className="preview-card-row">
                      <span className="preview-check done" />
                      <span className="preview-line" />
                    </div>
                  </div>
                  <div className="preview-ring" />
                </div>

                <div className="mode-card-title">
                  <Sparkles size={17} color="var(--color-primary)" />
                  <span>Standard Workspace</span>
                </div>
                <p className="mode-card-desc">
                  Giao diện sáng tối giản, gam màu ngọc bích nhẹ nhàng. Tối ưu cho quản lý công việc hàng ngày, thói quen, lịch trình và đồng hồ Pomodoro.
                </p>
                <div className="mode-feature-tags">
                  <span>Kế hoạch hôm nay</span>
                  <span>Pomodoro</span>
                  <span>Lịch trình</span>
                </div>
              </div>

              {/* Card Developer Mode */}
              <div
                role="button"
                tabIndex={0}
                className={`mode-card ${mode === 'developer' ? 'selected' : ''}`}
                onClick={() => switchMode('developer')}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchMode('developer');
                  }
                }}
              >
                <div className="mode-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mode-card-badge">Agile &amp; Git</span>
                    {mode === 'developer' && (
                      <span className="mode-active-tag">Đang sử dụng</span>
                    )}
                  </div>
                  <div className="mode-radio-circle" />
                </div>

                {/* Live Mini Preview cho Developer Mode */}
                <div className="mode-preview dev-preview" aria-hidden="true">
                  <div className="preview-sidebar dark">
                    <span className="preview-dot mint" />
                    <span className="preview-line dark" />
                    <span className="preview-line short dark" />
                  </div>
                  <div className="preview-kanban">
                    <div className="preview-col">
                      <span className="preview-chip mint" />
                      <span className="preview-chip dark" />
                    </div>
                    <div className="preview-col">
                      <span className="preview-chip amber" />
                    </div>
                    <div className="preview-col">
                      <span className="preview-chip dark" />
                    </div>
                  </div>
                </div>

                <div className="mode-card-title">
                  <Terminal size={17} color="var(--color-primary)" />
                  <span>Developer Workspace</span>
                </div>
                <p className="mode-card-desc">
                  Nền tối tương phản cao, phông chữ kỹ thuật JetBrains Mono, bảng Kanban chuẩn Agile, tích hợp Git Webhook và thao tác bàn phím nhanh.
                </p>
                <div className="mode-feature-tags">
                  <span>Kanban Sprints</span>
                  <span>Git Triggers</span>
                  <span>Code Focus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Phím tắt điều hướng nhanh */}
          <div className="settings-card">
            <div className="settings-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Keyboard size={16} color="var(--color-primary)" />
                <h2 className="settings-card-title">Phím tắt điều hướng nhanh</h2>
              </div>
              <p className="settings-card-desc">
                Sử dụng khi không đứng trong ô nhập liệu để thao tác nhanh hơn trên toàn hệ thống.
              </p>
            </div>

            <div className="shortcuts-grid">
              {SHORTCUT_HINTS.map((item) => (
                <div key={item.key} className="shortcut-item">
                  <span className="shortcut-desc">{item.desc}</span>
                  <kbd className="shortcut-kbd">{item.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HỒ SƠ & BẢO MẬT */}
      {activeTab === 'profile' && (
        <div className="settings-profile-grid">
          {/* Thông tin hồ sơ */}
          <div className="settings-card">
            <div className="settings-card-header">
              <h2 className="settings-card-title">Thông tin tài khoản</h2>
              <p className="settings-card-desc">Cập nhật họ tên hiển thị của bạn trên hệ thống</p>
            </div>

            {profileFeedback && (
              <div className={`settings-alert ${profileFeedback.type}`}>
                {profileFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{profileFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="settings-form">
              <div className="settings-form-group">
                <label className="settings-label">Địa chỉ Email</label>
                <input
                  type="email"
                  className="settings-input"
                  value={displayEmail}
                  disabled
                />
                <span className="settings-help-text">
                  Email là định danh tài khoản và không thể thay đổi
                </span>
              </div>

              <div className="settings-form-group">
                <label className="settings-label" htmlFor="settings-fullname">
                  Họ và tên
                </label>
                <input
                  id="settings-fullname"
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
              <h2 className="settings-card-title">Bảo mật &amp; Đổi mật khẩu</h2>
              <p className="settings-card-desc">
                Sau khi đổi mật khẩu, mọi phiên đăng nhập trên thiết bị khác sẽ tự động bị thu hồi.
              </p>
            </div>

            {passwordFeedback && (
              <div className={`settings-alert ${passwordFeedback.type}`}>
                {passwordFeedback.type === 'success' ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertCircle size={16} />
                )}
                <span>{passwordFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="settings-form">
              <div className="settings-form-group">
                <label className="settings-label" htmlFor="settings-current-pw">
                  Mật khẩu hiện tại
                </label>
                <div className="settings-input-wrap">
                  <input
                    id="settings-current-pw"
                    type={showCurrentPw ? 'text' : 'password'}
                    className="settings-input with-toggle"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="settings-pw-toggle"
                    onClick={() => setShowCurrentPw((prev) => !prev)}
                    aria-label={showCurrentPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                  >
                    {showCurrentPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="settings-form-group">
                <label className="settings-label" htmlFor="settings-new-pw">
                  Mật khẩu mới
                </label>
                <div className="settings-input-wrap">
                  <input
                    id="settings-new-pw"
                    type={showNewPw ? 'text' : 'password'}
                    className="settings-input with-toggle"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="settings-pw-toggle"
                    onClick={() => setShowNewPw((prev) => !prev)}
                    aria-label={showNewPw ? 'Ẩn mật khẩu mới' : 'Hiện mật khẩu mới'}
                  >
                    {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                {newPassword && (
                  <>
                    <div className="password-strength-bar" aria-hidden="true">
                      {[1, 2, 3, 4].map((step) => (
                        <span
                          key={step}
                          className={`strength-segment ${
                            passedChecks >= step
                              ? passedChecks <= 2
                                ? 'weak'
                                : passedChecks === 3
                                  ? 'medium'
                                  : 'strong'
                              : ''
                          }`}
                        />
                      ))}
                    </div>

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
                  </>
                )}
              </div>

              <div className="settings-form-group">
                <label className="settings-label" htmlFor="settings-confirm-pw">
                  Xác nhận mật khẩu mới
                </label>
                <div className="settings-input-wrap">
                  <input
                    id="settings-confirm-pw"
                    type={showConfirmPw ? 'text' : 'password'}
                    className="settings-input with-toggle"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="settings-pw-toggle"
                    onClick={() => setShowConfirmPw((prev) => !prev)}
                    aria-label={showConfirmPw ? 'Ẩn mật khẩu xác nhận' : 'Hiện mật khẩu xác nhận'}
                  >
                    {showConfirmPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <h2 className="settings-card-title">Hạn mức trợ lý AI dùng thử</h2>
                  <p className="settings-card-desc">
                    Hệ thống cấp sẵn {aiLimit} lượt gọi AI dùng thử/tháng (tự động làm mới vào ngày 1 hàng tháng).
                  </p>
                </div>
                <span className="ai-remaining-pill">Còn lại {aiRemaining} lượt</span>
              </div>
            </div>

            <div className="ai-quota-box">
              <div className="ai-quota-top">
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  Lượt đã sử dụng trong tháng:
                </span>
                <span className="ai-quota-numbers">
                  {aiUsed} / {aiLimit} lượt
                </span>
              </div>

              <div className="ai-progress-track">
                <div
                  className={`ai-progress-fill ${
                    aiPercent >= 90 ? 'critical' : aiPercent >= 70 ? 'warn' : ''
                  }`}
                  style={{ width: `${aiPercent}%` }}
                />
              </div>

              <div className="ai-reset-note">
                <ShieldCheck size={15} color="var(--color-success)" />
                <span>
                  Lượt gọi sẽ tự động được làm mới lại vào 00:00 ngày{' '}
                  {profile?.aiTrialResetAt
                    ? new Date(profile.aiTrialResetAt).toLocaleDateString('vi-VN')
                    : '01 hàng tháng'}
                  .
                </span>
              </div>
            </div>

            {/* Giới thiệu các khả năng của AI trong hệ thống */}
            <div className="ai-capabilities-grid">
              <div className="ai-capability-item">
                <ListChecks size={17} color="var(--color-primary)" />
                <strong>Phân tách đầu việc</strong>
                <p>Tự động gợi ý checklist con từ mô tả công việc phức tạp.</p>
              </div>
              <div className="ai-capability-item">
                <Sparkles size={17} color="var(--color-primary)" />
                <strong>Sắp xếp ưu tiên</strong>
                <p>Đề xuất các đầu việc quan trọng nhất cần đưa vào Kế hoạch hôm nay.</p>
              </div>
              <div className="ai-capability-item">
                <Cpu size={17} color="var(--color-primary)" />
                <strong>Hỗ trợ Dev Sprint</strong>
                <p>Tóm tắt phạm vi issue và sinh bước triển khai kỹ thuật ở Developer Mode.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
