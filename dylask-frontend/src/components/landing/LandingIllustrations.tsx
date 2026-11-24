import React from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  GitBranch,
  GitPullRequest,
  Sparkles,
  Search,
  Bot,
  KeyRound,
  Calendar,
} from 'lucide-react';

interface HeroWorkspaceVisualProps {
  mode: 'standard' | 'developer';
}

/**
 * Minh họa tương tác cho Hero Section, biến đổi trực quan giữa Standard Workspace & Developer Workspace.
 */
export const HeroWorkspaceVisual: React.FC<HeroWorkspaceVisualProps> = ({ mode }) => {
  const isStd = mode === 'standard';

  return (
    <div
      style={{
        padding: '20px',
        background: isStd
          ? 'linear-gradient(145deg, #FAFAF7 0%, #EFF6F4 100%)'
          : 'linear-gradient(145deg, #0E1116 0%, #161B26 100%)',
        color: isStd ? '#1C1B18' : '#E6EDF3',
        transition: 'background 0.4s ease, color 0.3s ease',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Header strip inside mockup */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '3px 9px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              background: isStd ? '#E6F4F1' : 'rgba(45, 212, 191, 0.14)',
              color: isStd ? '#0F766E' : '#2DD4BF',
            }}
          >
            {isStd ? 'Standard Workspace' : 'Developer Workspace'}
          </span>
          <span style={{ fontSize: '11px', opacity: 0.65, fontFamily: 'var(--font-mono)' }}>
            {isStd ? 'My Day · Hôm nay' : 'Sprint #14 · Kanban'}
          </span>
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 700,
            color: isStd ? '#D97706' : '#38BDF8',
          }}
        >
          {isStd ? (
            <>
              <Flame size={13} /> 7 ngày Streak
            </>
          ) : (
            <>
              <GitBranch size={13} /> main ← feat/ui
            </>
          )}
        </span>
      </div>

      {isStd ? (
        /* Standard Workspace interactive view */
        <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.85fr', gap: '14px', flex: 1 }}>
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E5E0',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: '#1C1B18', marginBottom: '2px' }}>
              Kế hoạch hôm nay (3/4)
            </div>
            {[
              { title: 'Hoàn thiện báo cáo tuần', done: true, tag: 'Công việc' },
              { title: 'Ôn tập 30 từ vựng IELTS', done: true, tag: 'Học tập' },
              { title: 'Review lịch trình tháng 12', done: false, tag: 'Cá nhân' },
              { title: 'Chạy bộ 30 phút buổi chiều', done: false, tag: 'Sức khỏe' },
            ].map((item) => (
              <div
                key={item.title}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: '#FAFAF7',
                  border: '1px solid #E7E5E0',
                  fontSize: '11.5px',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {item.done ? (
                    <CheckCircle2 size={13} color="#16A34A" />
                  ) : (
                    <Circle size={13} color="#6B6A63" />
                  )}
                  <span style={{ textDecoration: item.done ? 'line-through' : 'none', opacity: item.done ? 0.6 : 1 }}>
                    {item.title}
                  </span>
                </span>
                <span style={{ fontSize: '10px', color: '#0F766E', fontWeight: 600 }}>{item.tag}</span>
              </div>
            ))}
          </div>

          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E7E5E0',
              borderRadius: '10px',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            <svg width="96" height="96" viewBox="0 0 96 96">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#E7E5E0" strokeWidth="7" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#0F766E"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="251.3"
                strokeDashoffset="68"
                transform="rotate(-90 48 48)"
              />
              <text
                x="48"
                y="52"
                textAnchor="middle"
                fill="#1C1B18"
                fontSize="16"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                18:45
              </text>
            </svg>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#0F766E', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} /> Tập trung 25p
            </div>
          </div>
        </div>
      ) : (
        /* Developer Workspace interactive view */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', flex: 1 }}>
            {[
              {
                col: 'TODO',
                color: '#94A3B8',
                items: [
                  { id: 'DEV-18', title: 'Setup GitHub Webhook', sp: '3 SP' },
                  { id: 'DEV-19', title: 'Command Palette Ctrl+K', sp: '5 SP' },
                ],
              },
              {
                col: 'IN PROGRESS',
                color: '#38BDF8',
                items: [{ id: 'DEV-15', title: 'Kanban Drag & Drop API', sp: '5 SP' }],
              },
              {
                col: 'DONE',
                color: '#2DD4BF',
                items: [
                  { id: 'DEV-12', title: 'JWT Refresh Rotation', sp: '3 SP' },
                  { id: 'DEV-14', title: 'Analytics Streak Query', sp: '2 SP' },
                ],
              },
            ].map((column) => (
              <div
                key={column.col}
                style={{
                  background: '#161B22',
                  border: '1px solid #262C36',
                  borderRadius: '8px',
                  padding: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                <div style={{ fontSize: '10px', fontWeight: 700, color: column.color, letterSpacing: '0.05em' }}>
                  {column.col}
                </div>
                {column.items.map((card) => (
                  <div
                    key={card.id}
                    style={{
                      background: '#21262D',
                      border: '1px solid #30363D',
                      borderRadius: '6px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', fontFamily: 'var(--font-mono)', color: '#8B949E' }}>
                      <span>{card.id}</span>
                      <span style={{ color: '#2DD4BF' }}>{card.sp}</span>
                    </div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#E6EDF3' }}>{card.title}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div
            style={{
              background: '#161B22',
              border: '1px solid #262C36',
              borderRadius: '8px',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
            }}
          >
            <span style={{ color: '#38BDF8', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <GitPullRequest size={13} /> PR #48 merged → Tự động chuyển DEV-12 sang DONE
            </span>
            <span style={{ color: '#2DD4BF' }}>Ctrl + K</span>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Minh họa cho phần Standard Workspace (My Day, Lịch & Thống kê Streak).
 */
export const StandardShowcaseVisual: React.FC = () => {
  return (
    <div
      style={{
        padding: '22px',
        background: 'linear-gradient(155deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.9) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
          <Calendar size={16} color="#34D399" />
          <span>Nhịp Năng Suất 7 Ngày</span>
        </div>
        <span
          style={{
            padding: '3px 10px',
            borderRadius: '9999px',
            background: 'rgba(245, 158, 11, 0.16)',
            color: '#FBBF24',
            fontSize: '11px',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <Flame size={13} /> 12 ngày Streak
        </span>
      </div>

      {/* SVG Weekly Bar Chart */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '10px',
          padding: '16px',
        }}
      >
        <svg viewBox="0 0 360 120" width="100%" height="120" aria-label="Biểu đồ năng suất 7 ngày">
          {[
            { day: 'T2', h: 56 },
            { day: 'T3', h: 78 },
            { day: 'T4', h: 64 },
            { day: 'T5', h: 92 },
            { day: 'T6', h: 84 },
            { day: 'T7', h: 48 },
            { day: 'CN', h: 70 },
          ].map((bar, idx) => {
            const x = 18 + idx * 48;
            const y = 94 - bar.h;
            return (
              <g key={bar.day}>
                <rect x={x} y={10} width="24" height="84" rx="5" fill="rgba(255,255,255,0.05)" />
                <rect x={x} y={y} width="24" height={bar.h} rx="5" fill="url(#stdGrad)" />
                <text x={x + 12} y="112" textAnchor="middle" fill="#94A3B8" fontSize="11" fontWeight="600">
                  {bar.day}
                </text>
              </g>
            );
          })}
          <defs>
            <linearGradient id="stdGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>Tỷ lệ hoàn thành</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#34D399', fontFamily: 'var(--font-mono)' }}>
            88.5%
          </div>
        </div>
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '10px',
            padding: '12px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#94A3B8' }}>Giờ tập trung (Pomodoro)</div>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#38BDF8', fontFamily: 'var(--font-mono)' }}>
            14.5h
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Minh họa cho phần Developer Workspace (Command Palette, Kanban & Git Graph).
 */
export const DeveloperShowcaseVisual: React.FC = () => {
  return (
    <div
      style={{
        padding: '22px',
        background: 'linear-gradient(155deg, rgba(99, 102, 241, 0.1) 0%, rgba(11, 15, 23, 0.95) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      {/* Command Palette Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '10px',
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
        }}
      >
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#CBD5E1' }}>
          <Search size={14} color="#38BDF8" />
          <span>&gt; Tạo branch cho Issue DEV-24...</span>
        </span>
        <kbd
          style={{
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            background: 'rgba(255,255,255,0.08)',
            color: '#2DD4BF',
          }}
        >
          Ctrl + K
        </kbd>
      </div>

      {/* SVG Git Branch Flow */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '10px',
          padding: '14px',
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', marginBottom: '8px', fontFamily: 'var(--font-mono)' }}>
          GIT WEBHOOK AUTOMATION
        </div>
        <svg viewBox="0 0 360 76" width="100%" height="76">
          <line x1="28" y1="22" x2="330" y2="22" stroke="#38BDF8" strokeWidth="2.5" />
          <path d="M 80 22 C 110 22, 110 54, 140 54 L 230 54 C 260 54, 260 22, 290 22" fill="none" stroke="#A855F7" strokeWidth="2.5" />
          <circle cx="40" cy="22" r="5" fill="#38BDF8" />
          <circle cx="80" cy="22" r="5" fill="#38BDF8" />
          <circle cx="155" cy="54" r="5" fill="#A855F7" />
          <circle cx="215" cy="54" r="5" fill="#A855F7" />
          <circle cx="290" cy="22" r="6" fill="#2DD4BF" />
          <text x="155" y="72" textAnchor="middle" fill="#C084FC" fontSize="10" fontFamily="var(--font-mono)">
            feat/kanban-dnd
          </text>
          <text x="290" y="12" textAnchor="middle" fill="#2DD4BF" fontSize="10" fontFamily="var(--font-mono)">
            Merge → Done
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {[
          { label: 'Todo', count: 4, color: '#94A3B8' },
          { label: 'In Progress', count: 2, color: '#38BDF8' },
          { label: 'Review', count: 1, color: '#C084FC' },
          { label: 'Done', count: 9, color: '#2DD4BF' },
        ].map((col) => (
          <div
            key={col.label}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              padding: '10px 8px',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '10px', fontWeight: 700, color: col.color }}>{col.label}</div>
            <div style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
              {col.count}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Minh họa cho phần Trợ lý AI BYOK (Bóc tách câu lệnh tự nhiên thành Task & Checklist).
 */
export const AiByokShowcaseVisual: React.FC = () => {
  return (
    <div
      style={{
        padding: '22px',
        background: 'linear-gradient(155deg, rgba(168, 85, 247, 0.12) 0%, rgba(15, 23, 42, 0.94) 100%)',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: '#C084FC' }}>
          <Bot size={15} /> NLP Quick-Add
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#2DD4BF', fontWeight: 600 }}>
          <KeyRound size={12} /> BYOK · 10 lượt/tháng
        </span>
      </div>

      <div
        style={{
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(192, 132, 252, 0.35)',
          fontSize: '12px',
          color: '#E2E8F0',
        }}
      >
        “Chuẩn bị demo Sprint 14 sáng thứ 6, thêm checklist test API &amp; slide báo cáo”
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#94A3B8' }}>
        <Sparkles size={13} color="#2DD4BF" />
        <span>Tự động bóc tách thành Task có cấu trúc:</span>
      </div>

      <div
        style={{
          background: 'rgba(15, 23, 42, 0.78)',
          border: '1px solid rgba(45, 212, 191, 0.3)',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700 }}>
          <span>Demo Sprint 14</span>
          <span style={{ fontSize: '10px', color: '#F59E0B' }}>Ưu tiên: Cao · Thứ 6 09:00</span>
        </div>
        {['Kiểm thử tích hợp REST API', 'Hoàn thiện slide tổng kết Sprint', 'Sinh bộ Test Case nghiệm thu'].map((sub) => (
          <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#CBD5E1' }}>
            <CheckCircle2 size={13} color="#2DD4BF" />
            <span>{sub}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
