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
import './landing.css';

export const LandingPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState(0);

  const sectionIds = ['hero-section', 'standard-section', 'dev-section', 'cta-section'];

  const scrollToSection = (index: number) => {
    if (index < 0 || index >= sectionIds.length) return;
    const target = document.getElementById(sectionIds[index]);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPos = container.scrollTop;
      const windowHeight = window.innerHeight;
      const currentIndex = Math.round(scrollPos / windowHeight);
      setActiveSection(Math.min(sectionIds.length - 1, Math.max(0, currentIndex)));
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [sectionIds.length]);

  return (
    <div className="landing-container" ref={containerRef}>
      {/* ======================================================================
          TOP NAVIGATION BAR (GLASS)
          ====================================================================== */}
      <nav className="landing-nav">
        <Link to="/" className="landing-brand">
          <div className="landing-brand-mark">
            <Check size={18} strokeWidth={2.5} />
          </div>
          <span className="landing-brand-title">Dylask</span>
        </Link>

        <div className="landing-nav-links">
          <span className="landing-nav-link" onClick={() => scrollToSection(0)}>
            Trang chủ
          </span>
          <span className="landing-nav-link" onClick={() => scrollToSection(1)}>
            Standard Mode
          </span>
          <span className="landing-nav-link" onClick={() => scrollToSection(2)}>
            Developer Mode
          </span>
          <span className="landing-nav-link" onClick={() => scrollToSection(3)}>
            Trợ lý AI
          </span>
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
          FLOATING SIDE NAVIGATOR ("MŨI TÊN KÉO LÊN XUỐNG")
          ====================================================================== */}
      <div className="floating-side-nav">
        <button
          className="side-nav-btn"
          title="Lướt lên phần trước"
          onClick={() => scrollToSection(activeSection - 1)}
          disabled={activeSection === 0}
          style={{ opacity: activeSection === 0 ? 0.3 : 1 }}
        >
          <ChevronUp size={18} />
        </button>

        <div className="side-dots-list">
          {sectionIds.map((_, idx) => (
            <button
              key={idx}
              className={`side-dot ${activeSection === idx ? 'active' : ''}`}
              title={`Chuyển tới phần ${idx + 1}`}
              onClick={() => scrollToSection(idx)}
            />
          ))}
        </div>

        <button
          className="side-nav-btn"
          title="Lướt xuống phần kế tiếp"
          onClick={() => scrollToSection(activeSection + 1)}
          disabled={activeSection === sectionIds.length - 1}
          style={{ opacity: activeSection === sectionIds.length - 1 ? 0.3 : 1 }}
        >
          <ChevronDown size={18} />
        </button>
      </div>

      {/* ======================================================================
          SECTION 1: HERO SECTION
          ====================================================================== */}
      <section className="snap-section" id="hero-section">
        <div className="ambient-glow glow-teal" />
        <div className="ambient-glow glow-emerald" />

        <div className="hero-content">
          <div className="hero-left">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>KHÔNG GIAN NĂNG SUẤT KÉP THẾ HỆ MỚI</span>
            </div>

            <h1 className="hero-title">
              Cân Bằng Hoàn Hảo <br />
              <span className="gradient-text">Cuộc Sống & Lập Trình</span>
            </h1>

            <p className="hero-desc">
              Dylask là nền tảng năng suất đầu tiên cho phép chuyển đổi linh hoạt
              giữa giao diện Tiêu Chuẩn tinh gọn và Không Gian Kỹ Thuật chuyên sâu
              dành cho lập trình viên.
            </p>

            <div className="hero-cta-group">
              <Link to="/register" className="btn-hero-primary">
                <span>Bắt đầu ngay</span>
                <ArrowRight size={16} />
              </Link>
              <button
                className="btn-hero-secondary"
                onClick={() => scrollToSection(1)}
              >
                <span>Khám phá tính năng</span>
                <ChevronDown size={16} />
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-graphic-card">
              <div
                style={{
                  height: '32px',
                  background: 'rgba(15, 23, 42, 0.9)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 12px',
                  gap: '6px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <span
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}
                />
                <span
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}
                />
                <span
                  style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}
                />
                <span
                  style={{
                    marginLeft: 12,
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: '#94A3B8',
                  }}
                >
                  preview.dylask.app
                </span>
              </div>
              <img
                src="/auth-hero.jpg"
                alt="Dylask Dual-Mode Workspace"
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>

        {/* Scroll down prompt */}
        <div
          className="scroll-down-indicator"
          onClick={() => scrollToSection(1)}
        >
          <span>Cuộn xuống để khám phá</span>
          <ChevronDown className="scroll-arrow-bounce" size={18} />
        </div>
      </section>

      {/* ======================================================================
          SECTION 2: STANDARD MODE SHOWCASE
          ====================================================================== */}
      <section className="snap-section" id="standard-section">
        <div className="ambient-glow glow-emerald" />

        <div className="section-wrapper">
          <div className="section-header">
            <div className="section-tag standard">
              <Sparkles size={12} />
              <span>Chế độ Tiêu Chuẩn (Standard Mode)</span>
            </div>
            <h2 className="section-title">Nhẹ Nhàng, Rõ Ràng & Bền Bỉ</h2>
            <p className="section-desc">
              Thiết kế dành cho nhịp sống thường nhật. Tạm biệt cảm giác choáng ngợp,
              tập trung vào những gì quan trọng nhất trong ngày của bạn.
            </p>
          </div>

          <div className="cards-grid-3">
            <div className="interactive-feature-card">
              <div className="card-icon-box green">
                <Calendar size={22} />
              </div>
              <h3 className="card-title">My Day & Kế Hoạch Ngày</h3>
              <p className="card-text">
                Khởi động mỗi buổi sáng với danh sách công việc tinh lọc. Tự động
                phân loại việc khẩn cấp, quá hạn và lịch trình sắp tới.
              </p>
            </div>

            <div className="interactive-feature-card">
              <div className="card-icon-box teal">
                <CheckCircle2 size={22} />
              </div>
              <h3 className="card-title">Checklists & Subtasks</h3>
              <p className="card-text">
                Chia nhỏ các dự án lớn thành từng bước hành động cụ thể. Đánh dấu
                hoàn thành trực quan và kiểm soát tiến độ dễ dàng.
              </p>
            </div>

            <div className="interactive-feature-card">
              <div className="card-icon-box blue">
                <Clock size={22} />
              </div>
              <h3 className="card-title">Đồng Hồ Pomodoro & Kỷ Luật</h3>
              <p className="card-text">
                Tích hợp phiên làm việc sâu 25 phút. Theo dõi chuỗi ngày kỷ luật
                (Streak) với biểu đồ lửa đầy cảm hứng.
              </p>
            </div>
          </div>
        </div>

        <div
          className="scroll-down-indicator"
          onClick={() => scrollToSection(2)}
        >
          <span>Lướt tiếp sang Chế độ Developer</span>
          <ChevronDown className="scroll-arrow-bounce" size={18} />
        </div>
      </section>

      {/* ======================================================================
          SECTION 3: DEVELOPER MODE SHOWCASE
          ====================================================================== */}
      <section className="snap-section" id="dev-section">
        <div className="ambient-glow glow-indigo" />

        <div className="section-wrapper">
          <div className="section-header">
            <div className="section-tag developer">
              <Terminal size={12} />
              <span>Chế độ Kỹ Thuật (Developer Mode)</span>
            </div>
            <h2 className="section-title">Quy Trình Agile Chuẩn Lập Trình Viên</h2>
            <p className="section-desc">
              Giao diện Dark Theme tối ưu code, phím tắt tốc độ cao và tự động hóa
              gắn kết mã nguồn trực tiếp vào tiến độ công việc.
            </p>
          </div>

          <div className="cards-grid-3">
            <div className="interactive-feature-card">
              <div className="card-icon-box blue">
                <Kanban size={22} />
              </div>
              <h3 className="card-title">Kanban Sprints & Backlog</h3>
              <p className="card-text">
                Kéo thả các Issue qua các cột Todo, In Progress, Review và Done. Phân bổ
                Story Points và quản lý Sprint chuẩn kỹ thuật.
              </p>
            </div>

            <div className="interactive-feature-card">
              <div className="card-icon-box purple">
                <GitBranch size={22} />
              </div>
              <h3 className="card-title">Tự Động Hóa Git Webhooks</h3>
              <p className="card-text">
                Gắn mã commit hoặc Pull Request vào Task. Tự động chuyển trạng thái công
                việc khi bạn push code lên GitHub hay GitLab.
              </p>
            </div>

            <div className="interactive-feature-card">
              <div className="card-icon-box teal">
                <FileCode2 size={22} />
              </div>
              <h3 className="card-title">Markdown Docs & Command Palette</h3>
              <p className="card-text">
                Viết tài liệu kỹ thuật, snippet code với cú pháp Markdown trực tiếp.
                Bấm phím tắt <code style={{ color: '#2DD4BF' }}>Ctrl + K</code> để tìm kiếm siêu tốc.
              </p>
            </div>
          </div>
        </div>

        <div
          className="scroll-down-indicator"
          onClick={() => scrollToSection(3)}
        >
          <span>Khám phá Trợ lý AI & Bắt đầu</span>
          <ChevronDown className="scroll-arrow-bounce" size={18} />
        </div>
      </section>

      {/* ======================================================================
          SECTION 4: AI ASSISTANT & CALL TO ACTION (CTA)
          ====================================================================== */}
      <section className="snap-section" id="cta-section">
        <div className="ambient-glow glow-teal" />
        <div className="ambient-glow glow-emerald" />

        <div className="section-wrapper" style={{ textAlign: 'center', alignItems: 'center' }}>
          <div className="section-tag ai">
            <Bot size={12} />
            <span>Trợ Lý Thông Minh Chi Phí 0đ (BYOK)</span>
          </div>

          <h2 className="section-title" style={{ fontSize: '44px', maxWidth: '780px' }}>
            Sẵn Sàng Nâng Tầm Năng Suất Của Bạn?
          </h2>

          <p className="section-desc" style={{ maxWidth: '640px' }}>
            Sử dụng 10 lượt AI miễn phí mỗi tháng hoặc mang theo API Key của riêng bạn
            để bóc tách công việc, sinh test case và tóm tắt tiến độ chỉ bằng một câu lệnh tự nhiên.
          </p>

          <div style={{ display: 'flex', gap: '16px', marginTop: '16px' }}>
            <Link to="/register" className="btn-hero-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
              <span>Đăng ký tài khoản miễn phí</span>
              <ArrowRight size={18} />
            </Link>

            <Link to="/login" className="btn-hero-secondary" style={{ padding: '14px 28px', fontSize: '16px' }}>
              <span>Đã có tài khoản? Đăng nhập</span>
            </Link>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
              marginTop: '40px',
              color: '#64748B',
              fontSize: '13px',
            }}
          >
            <span>✓ Miễn phí trọn đời</span>
            <span>✓ Không cần thẻ tín dụng</span>
            <span>✓ Bảo mật dữ liệu cá nhân</span>
          </div>

          <footer
            style={{
              position: 'absolute',
              bottom: '20px',
              fontSize: '12px',
              color: '#475569',
            }}
          >
            © 2026 Dylask Web Platform. Dual-Mode Productivity Architecture.
          </footer>
        </div>
      </section>
    </div>
  );
};
