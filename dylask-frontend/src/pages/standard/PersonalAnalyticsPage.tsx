import React from 'react';
import {
  CheckCircle2,
  Flame,
  Clock,
  AlertTriangle,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { usePersonalAnalytics } from '@/hooks/usePersonalAnalytics';
import { MetricCard } from '@/components/analytics/MetricCard';
import { WeeklyBarChart } from '@/components/analytics/WeeklyBarChart';
import { CategoryDonutChart } from '@/components/analytics/CategoryDonutChart';
import type { AnalyticsRange } from '@/types/analytics';
import './analytics.css';

const RANGE_OPTIONS: { value: AnalyticsRange; label: string }[] = [
  { value: 'week', label: '7 ngày qua' },
  { value: 'month', label: '30 ngày qua' },
  { value: 'year', label: '1 năm' },
];

/**
 * Màn hình Thống Kê & Phân Tích Năng Suất Cá Nhân (PersonalAnalyticsPage).
 */
export const PersonalAnalyticsPage: React.FC = () => {
  const { range, setRange, data, isLoading, error, refresh } = usePersonalAnalytics('week');

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div>
          <h1 className="analytics-title">Thống kê năng suất cá nhân</h1>
          <div className="analytics-subtitle">
            Theo dõi tỷ lệ hoàn thành, chuỗi ngày kỷ luật và giờ tập trung Pomodoro
          </div>
        </div>

        <div className="analytics-range-tabs" role="tablist" aria-label="Khoảng thời gian thống kê">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={range === opt.value}
              className={`analytics-range-tab ${range === opt.value ? 'active' : ''}`}
              onClick={() => setRange(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && !data ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-10)',
            gap: '8px',
            color: 'var(--color-text-muted)',
          }}
        >
          <Loader2 className="spinner" size={20} color="var(--color-primary)" />
          <span>Đang tổng hợp dữ liệu năng suất...</span>
        </div>
      ) : error ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: 'var(--space-8)',
            gap: '10px',
            color: 'var(--color-danger)',
          }}
        >
          <AlertCircle size={24} />
          <span>{error}</span>
          <button type="button" className="analytics-range-tab active" onClick={() => void refresh()}>
            Thử lại
          </button>
        </div>
      ) : data ? (
        <>
          <div className="analytics-kpi-grid">
            <MetricCard
              label="Tỷ lệ hoàn thành"
              value={`${data.kpis.completionRate}%`}
              subText={`${data.kpis.totalCompleted}/${data.kpis.totalCreated} công việc đã xong`}
              icon={<CheckCircle2 size={16} color="var(--color-primary)" />}
            />

            <MetricCard
              label="Chuỗi kỷ luật"
              value={`${data.kpis.currentStreakDays} ngày`}
              subText={`Kỷ lục dài nhất: ${data.kpis.longestStreakDays} ngày`}
              icon={<Flame size={16} color="var(--priority-medium)" />}
              badgeText={data.kpis.currentStreakDays > 0 ? '🔥 Đang duy trì' : undefined}
            />

            <MetricCard
              label="Giờ tập trung (Deep Work)"
              value={`${data.kpis.totalFocusHours}h`}
              subText={`${data.kpis.pomodoroSessions} phiên Pomodoro (${data.kpis.totalFocusMinutes} phút)`}
              icon={<Clock size={16} color="var(--color-info)" />}
            />

            <MetricCard
              label="Công việc quá hạn"
              value={data.kpis.overdueTasks}
              subText="Cần ưu tiên xử lý sớm"
              icon={<AlertTriangle size={16} color="var(--color-danger)" />}
            />
          </div>

          <div className="analytics-charts-grid">
            <WeeklyBarChart trend={data.dailyTrend} />
            <CategoryDonutChart items={data.categoryBreakdown} />
          </div>

          <div className="analytics-peak-banner">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--radius)',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
                  Khung giờ vàng tập trung (Peak Focus)
                </div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text)' }}>
                  {data.peakFocusHours.slot}
                </div>
              </div>
            </div>

            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
              {data.peakFocusHours.description}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
