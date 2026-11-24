import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  Sparkles,
  Terminal,
  Calendar,
  CheckCircle2,
  Clock,
  Kanban,
  GitBranch,
  FileCode2,
  Bot,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import {
  HeroWorkspaceVisual,
  StandardShowcaseVisual,
  DeveloperShowcaseVisual,
  AiByokShowcaseVisual,
} from '@/components/landing/LandingIllustrations';
import './landing.css';

const SECTION_IDS = ['hero-section', 'standard-section', 'dev-section', 'cta-section'] as const;

/**
 * Trang giới thiệu chính (LandingPage) với Replayable Staggered Scroll Reveal,
 * minh họa trực quan riêng cho từng phân hệ và bản xem trước tương tác Standard/Developer Workspace.
 */
export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    'hero-section': true,
  });
  const [previewMode, setPreviewMode] = useState<'standard' | 'developer'>('standard');

  const scrollToSection = (index: number) => {
    if (index < 0 || index >= SECTION_IDS.length) return;
    const target = document.getElementById(SECTION_IDS[index]);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Theo dõi từng section bằng IntersectionObserver để kích hoạt hiệu ứng mỗi lần cuộn tới (replayable)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sectionElements = SECTION_IDS
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        setVisibleSections((prev) => {
          const next = { ...prev };
          for (const entry of entries) {
            next[entry.target.id] = entry.isIntersecting;
          }
          return next;
        });

        // Cập nhật section đang hoạt động cho Navbar và chấm điều hướng bên phải
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.45) {
            const idx = SECTION_IDS.indexOf(entry.target.id as (typeof SECTION_IDS)[number]);
            if (idx !== -1) {
              setActiveSection(idx);
            }
          }
        }
      },
      {
        root: container,
        threshold: [0.15, 0.45],
      }
    );

    for (const el of sectionElements) {
      visibilityObserver.observe(el);
    }

    return () => {
      visibilityObserver.disconnect();
    };
  }, []);

  return (
    <div className="landing-container" ref={containerRef}>
      <div className="landing-dot-grid" aria-hidden="true" />

      {/* ======================================================================
          TOP NAVIGATION BAR (FIXED GLASS)
          ====================================================================== */}
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <div className="landing-brand-mark">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <span className="landing-brand-title">Dylask</span>
        </Link>

        <div className="landing-nav-links">
          <button
            type="button"
            className={`landing-nav-link ${activeSection === 0 ? 'active' : ''}`}
            onClick={() => scrollToSection(0)}
          >
            Trang chủ
          </button>
          <button
            type="button"
            className={`landing-nav-link ${activeSection === 1 ? 'active' : ''}`}
            onClick={() => scrollToSection(1)}
          >
            Standard Workspace
          </button>
          <button
            type="button"
            className={`landing-nav-link ${activeSection === 2 ? 'active' : ''}`}
            onClick={() => scrollToSection(2)}
          >
            Developer Workspace
          </button>
          <button
            type="button"
            className={`landing-nav-link ${activeSection === 3 ? 'active' : ''}`}
            onClick={() => scrollToSection(3)}
          >
            Trợ lý AI
          </button>
        </div>

        <div className="landing-nav-actions">
          <Link to="/login" className="btn-nav-login">
            Đăng nhập
          </Link>
          <Link to="/register" className="btn-nav-register">
            Bắt đầu miễn phí
          </Link>
        </div>
      </nav>

      {/* ======================================================================
          FLOATING SIDE NAVIGATOR
          ====================================================================== */}
      <div className="floating-side-nav">
        <button
          type="button"
          className="side-nav-btn"
          title="Lướt lên phần trước"
          onClick={() => scrollToSection(activeSection - 1)}
          disabled={activeSection === 0}
          style={{ opacity: activeSection === 0 ? 0.3 : 1 }}
        >
          <ChevronUp size={18} />
        </button>

        <div className="side-dots-list">
          {SECTION_IDS.map((id, idx) => (
            <button
              key={id}
              type="button"
              className={`side-dot ${activeSection === idx ? 'active' : ''}`}
              title={`Chuyển tới phần ${idx + 1}`}
              onClick={() => scrollToSection(idx)}
            />
          ))}
        </div>

        <button
          type="button"
          className="side-nav-btn"
          title="Lướt xuống phần kế tiếp"
          onClick={() => scrollToSection(activeSection + 1)}
          disabled={activeSection === SECTION_IDS.length - 1}
          style={{ opacity: activeSection === SECTION_IDS.length - 1 ? 0.3 : 1 }}
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* ======================================================================
          SECTION 1: HERO SECTION
          ====================================================================== */}
      <section
        className={`snap-section ${visibleSections['hero-section'] ? 'is-visible' : ''}`}
        id="hero-section"
      >
        <div className="ambient-glow glow-teal" />
        <div className="ambient-glow glow-emerald" />

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge reveal-from-left delay-1">
              <Sparkles size={14} />
              <span>2 KHÔNG GIAN LÀM VIỆC TRONG 1 NỀN TẢNG</span>
            </div>

            <h1 className="hero-title reveal-from-left delay-2">
              Cân Bằng Nhịp Sống <br />
              <span className="gradient-text">&amp; Quy Trình Lập Trình</span>
            </h1>

            <p className="hero-desc reveal-from-left delay-3">
              Chuyển đổi tức thì giữa <strong>Standard Workspace</strong> gọn nhẹ cho công việc
              hằng ngày và <strong>Developer Workspace</strong> chuyên sâu với Kanban, Sprint &amp; Git.
            </p>

            <div className="hero-cta-group reveal-from-left delay-4">
              <Link to="/register" className="btn-hero-primary">
                <span>Bắt đầu ngay</span>
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                className="btn-hero-secondary"
                onClick={() => scrollToSection(1)}
              >
                <span>Khám phá tính năng</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="hero-right reveal-from-right delay-2">
            <div className="hero-graphic-card">
              <div className="preview-topbar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }} />
                  <span
                    style={{
                      marginLeft: 10,
                      fontSize: 11,
                      fontFamily: 'var(--font-mono)',
                      color: '#94A3B8',
                    }}
                  >
                    preview.dylask.app
                  </span>
                </div>

                <button
                  type="button"
                  className="preview-switch-btn"
                  onClick={() =>
                    setPreviewMode((prev) => (prev === 'standard' ? 'developer' : 'standard'))
                  }
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

              <div className="preview-body">
                <HeroWorkspaceVisual mode={previewMode} />
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-down-indicator" onClick={() => scrollToSection(1)}>
          <span>Cuộn xuống để khám phá</span>
          <ChevronDown className="scroll-arrow-bounce" size={18} />
        </div>
      </section>

      {/* ======================================================================
          SECTION 2: STANDARD WORKSPACE SHOWCASE
          ====================================================================== */}
      <section
        className={`snap-section ${visibleSections['standard-section'] ? 'is-visible' : ''}`}
        id="standard-section"
      >
        <div className="ambient-glow glow-emerald" />

        <div className="section-wrapper">
          <div className="section-header">
            <div className="section-tag standard reveal-item delay-1">
              <Sparkles size={12} />
              <span>STANDARD WORKSPACE</span>
            </div>
            <h2 className="section-title reveal-item delay-2">
              Gọn Gàng Mỗi Ngày, Bền Vững Thói Quen
            </h2>
            <p className="section-desc reveal-item delay-3">
              Thiết kế tối giản cho nhịp sống thường nhật. Khởi động ngày mới nhẹ đầu,
              theo sát lịch trình và duy trì nhịp độ hoàn thành công việc ổn định.
            </p>
          </div>

          <div className="showcase-split">
            <div className="cards-stack">
              <div className="interactive-feature-card reveal-from-left delay-2">
                <div className="card-icon-box green">
                  <Calendar size={22} />
                </div>
                <div>
                  <h3 className="card-title">My Day, Lịch Biểu &amp; Kế Hoạch Tuần</h3>
                  <p className="card-text">
                    Mỗi ngày mới bắt đầu sạch sẽ (Clean Slate) kèm gợi ý việc ưu tiên, lịch
                    Tháng/Tuần/Ngày kéo thả và tự động tạo lại việc lặp định kỳ.
                  </p>
                </div>
              </div>

              <div className="interactive-feature-card reveal-from-left delay-3">
                <div className="card-icon-box teal">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="card-title">Checklist Chi Tiết &amp; Dời Lịch Quá Hạn</h3>
                  <p className="card-text">
                    Chia nhỏ đầu việc thành các bước cụ thể, nhận diện ngay việc trễ hạn và
                    dời lịch hàng loạt sang Hôm nay hoặc Ngày mai chỉ với một chạm.
                  </p>
                </div>
              </div>

              <div className="interactive-feature-card reveal-from-left delay-4">
                <div className="card-icon-box blue">
                  <Clock size={22} />
                </div>
                <div>
                  <h3 className="card-title">Đồng Hồ Pomodoro &amp; Thống Kê Năng Suất</h3>
                  <p className="card-text">
                    Chạy phiên tập trung 25 phút gắn trực tiếp vào từng việc. Tự động ghi nhận
                    chuỗi ngày kỷ luật (Streak 🔥) và biểu đồ xu hướng hằng tuần.
                  </p>
                </div>
              </div>
            </div>

            <div className="showcase-visual-frame reveal-from-right delay-3">
              <StandardShowcaseVisual />
            </div>
          </div>
        </div>

        <div className="scroll-down-indicator" onClick={() => scrollToSection(2)}>
          <span>Khám phá Developer Workspace</span>
          <ChevronDown className="scroll-arrow-bounce" size={18} />
        </div>
      </section>

      {/* ======================================================================
          SECTION 3: DEVELOPER WORKSPACE SHOWCASE
          ====================================================================== */}
      <section
        className={`snap-section ${visibleSections['dev-section'] ? 'is-visible' : ''}`}
        id="dev-section"
      >
        <div className="ambient-glow glow-indigo" />

        <div className="section-wrapper">
          <div className="section-header">
            <div className="section-tag developer reveal-item delay-1">
              <Terminal size={12} />
              <span>DEVELOPER WORKSPACE</span>
            </div>
            <h2 className="section-title reveal-item delay-2">
              Quy Trình Agile &amp; Git Cho Lập Trình Viên
            </h2>
            <p className="section-desc reveal-item delay-3">
              Giao diện Dark Theme dịu mắt tối ưu khi code, điều hướng bằng phím tắt và liên
              kết trực tiếp mã nguồn với tiến độ từng Issue.
            </p>
          </div>

          <div className="showcase-split reverse">
            <div className="showcase-visual-frame reveal-from-left delay-3">
              <DeveloperShowcaseVisual />
            </div>

            <div className="cards-stack">
              <div className="interactive-feature-card reveal-from-right delay-2">
                <div className="card-icon-box blue">
                  <Kanban size={22} />
                </div>
                <div>
                  <h3 className="card-title">Kanban Sprint &amp; Quản Lý Backlog</h3>
                  <p className="card-text">
                    Kéo thả Issue qua các cột Backlog, Todo, In Progress, Review và Done. Theo
                    dõi Story Points và tiến độ Sprint rõ ràng.
                  </p>
                </div>
              </div>

              <div className="interactive-feature-card reveal-from-right delay-3">
                <div className="card-icon-box purple">
                  <GitBranch size={22} />
                </div>
                <div>
                  <h3 className="card-title">Đồng Bộ GitHub / GitLab Webhooks</h3>
                  <p className="card-text">
                    Tạo nhanh tên nhánh chuẩn từ Task và tự động cập nhật trạng thái khi bạn
                    push commit, mở Pull Request hoặc merge code.
                  </p>
                </div>
              </div>

              <div className="interactive-feature-card reveal-from-right delay-4">
                <div className="card-icon-box teal">
                  <FileCode2 size={22} />
                </div>
                <div>
                  <h3 className="card-title">Markdown Spec &amp; Command Palette</h3>
                  <p className="card-text">
                    Ghi chú kỹ thuật, đoạn mã Markdown ngay trong Task. Nhấn{' '}
                    <code style={{ color: '#2DD4BF' }}>Ctrl + K</code> để chuyển trang hoặc tìm
                    kiếm tức thì không cần rời bàn phím.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-down-indicator" onClick={() => scrollToSection(3)}>
          <span>Khám phá Trợ lý AI &amp; Bắt đầu</span>
          <ChevronDown className="scroll-arrow-bounce" size={18} />
        </div>
      </section>

      {/* ======================================================================
          SECTION 4: AI ASSISTANT (BYOK) & CALL TO ACTION
          ====================================================================== */}
      <section
        className={`snap-section ${visibleSections['cta-section'] ? 'is-visible' : ''}`}
        id="cta-section"
      >
        <div className="ambient-glow glow-teal" />
        <div className="ambient-glow glow-purple" />

        <div className="section-wrapper">
          <div className="showcase-split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="section-tag ai reveal-from-left delay-1" style={{ width: 'fit-content' }}>
                <Bot size={12} />
                <span>TRỢ LÝ AI LINH HOẠT (BYOK)</span>
              </div>

              <h2 className="section-title reveal-from-left delay-2" style={{ textAlign: 'left', fontSize: '40px' }}>
                Sẵn Sàng Nâng Tầm <br />
                Hiệu Suất Làm Việc?
              </h2>

              <p className="section-desc reveal-from-left delay-3" style={{ textAlign: 'left' }}>
                Trải nghiệm 10 lượt AI miễn phí mỗi tháng hoặc tự gắn API Key (BYOK) để bóc tách
                câu lệnh tự nhiên thành công việc, sinh checklist và gợi ý test case nhanh chóng.
              </p>

              <div className="hero-cta-group reveal-from-left delay-4">
                <Link to="/register" className="btn-hero-primary" style={{ padding: '13px 28px' }}>
                  <span>Tạo tài khoản miễn phí</span>
                  <ArrowRight size={17} />
                </Link>

                <Link to="/login" className="btn-hero-secondary" style={{ padding: '13px 24px' }}>
                  <span>Đã có tài khoản? Đăng nhập</span>
                </Link>
              </div>

              <div
                className="reveal-from-left delay-5"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '18px',
                  marginTop: '8px',
                  color: '#94A3B8',
                  fontSize: '13px',
                }}
              >
                <span>✓ Bắt đầu miễn phí</span>
                <span>✓ 10 lượt AI miễn phí/tháng</span>
                <span>✓ Dữ liệu tách biệt &amp; bảo mật</span>
              </div>
            </div>

            <div className="showcase-visual-frame reveal-from-right delay-3">
              <AiByokShowcaseVisual />
            </div>
          </div>

          <footer
            className="reveal-item delay-5"
            style={{
              textAlign: 'center',
              marginTop: '12px',
              fontSize: '12px',
              color: '#475569',
            }}
          >
            © 2026 Dylask Web Platform · Standard Workspace &amp; Developer Workspace.
          </footer>
        </div>
      </section>
    </div>
  );
};
