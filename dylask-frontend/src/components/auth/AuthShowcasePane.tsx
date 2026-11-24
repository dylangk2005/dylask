import React, { useState } from 'react';
import { Sparkles, Terminal, ShieldCheck } from 'lucide-react';
import { HeroWorkspaceVisual } from '@/components/landing/LandingIllustrations';

interface AuthShowcasePaneProps {
  variant: 'login' | 'register';
}

/**
 * Khung giới thiệu tương tác bên phải cho trang Đăng nhập và Đăng ký.
 * Cho phép bấm chuyển trực tiếp giữa Standard Workspace và Developer Workspace.
 */
export const AuthShowcasePane: React.FC<AuthShowcasePaneProps> = ({ variant }) => {
  const [previewMode, setPreviewMode] = useState<'standard' | 'developer'>('standard');

  const isLogin = variant === 'login';

  return (
    <aside className="auth-right-pane">
      <div className="auth-dot-grid" aria-hidden="true" />
      <div className="showcase-content-wrapper">
        <div className="hero-image-card">
          <div className="hero-mock-header" style={{ justifyContent: 'space-between', padding: '0 14px', height: '38px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mock-dot red" />
              <span className="mock-dot yellow" />
              <span className="mock-dot green" />
              <span
                style={{
                  marginLeft: '10px',
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono)',
                  color: '#94A3B8',
                }}
              >
                workspace.dylask.app
              </span>
            </div>

            <button
              type="button"
              onClick={() =>
                setPreviewMode((prev) => (prev === 'standard' ? 'developer' : 'standard'))
              }
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 9px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                border: '1px solid rgba(45, 212, 191, 0.35)',
                background: 'rgba(45, 212, 191, 0.12)',
                color: '#2DD4BF',
                cursor: 'pointer',
              }}
            >
              {previewMode === 'standard' ? (
                <>
                  <Terminal size={12} />
                  <span>To Dev</span>
                </>
              ) : (
                <>
                  <Sparkles size={12} />
                  <span>To Standard</span>
                </>
              )}
            </button>
          </div>

          <HeroWorkspaceVisual mode={previewMode} />
        </div>

        <div className="intro-statement-card">
          <div className="intro-badge">
            {isLogin ? <Sparkles size={13} /> : <ShieldCheck size={13} />}
            <span>{isLogin ? 'DUAL-MODE WORKSPACE' : 'XÁC THỰC 2 LỚP AN TOÀN'}</span>
          </div>

          <p className="intro-statement">
            {isLogin
              ? 'Chào mừng bạn trở lại với Dylask.'
              : 'Dữ liệu cá nhân & mã nguồn được bảo vệ tách biệt.'}
          </p>

          <p className="intro-meta">
            {isLogin
              ? 'Tiếp tục kế hoạch hằng ngày hoặc theo dõi tiến độ Sprint & Git của bạn.'
              : 'Xác thực email OTP nhanh chóng và nhận ngay 10 lượt trợ lý AI miễn phí mỗi tháng.'}
          </p>

          <div className="mode-feature-pills">
            <div
              className="feature-pill"
              onClick={() => setPreviewMode('standard')}
              style={{
                cursor: 'pointer',
                borderColor: previewMode === 'standard' ? 'rgba(45, 212, 191, 0.5)' : undefined,
              }}
            >
              <div className="feature-pill-title">
                <Sparkles size={13} color="#2DD4BF" />
                <span>Standard Workspace</span>
              </div>
              <div className="feature-pill-desc">
                My Day, Lịch tuần &amp; Pomodoro 25p
              </div>
            </div>

            <div
              className="feature-pill"
              onClick={() => setPreviewMode('developer')}
              style={{
                cursor: 'pointer',
                borderColor: previewMode === 'developer' ? 'rgba(56, 189, 248, 0.5)' : undefined,
              }}
            >
              <div className="feature-pill-title">
                <Terminal size={13} color="#38BDF8" />
                <span>Developer Workspace</span>
              </div>
              <div className="feature-pill-desc">
                Kanban Sprint, Git &amp; Ctrl + K
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
