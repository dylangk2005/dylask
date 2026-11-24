import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Flame,
  Clock,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  BarChart3,
  RefreshCw,
  ArrowRight,
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
  const navigate = useNavigate();
  const { range, setRange, data, isLoading, error, refresh } = usePersonalAnalytics('week');

  const rangeLabel =
    range === 'week' ? '7 ngày qua' : range === 'month' ? '30 ngày qua' : '1 năm';

  return (
    <div className="analytics-page">
      <div className="analytics-header">
        <div className="analytics-title-block">
          <span className="analytics-icon-badge" aria-hidden="true">
            <BarChart3 size={20} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="analytics-title">Thống kê năng suất cá nhân</h1>
            <div className="analytics-subtitle">
              Theo dõi tỷ lệ hoàn thành, chuỗi ngày kỷ luật và giờ tập trung Pomodoro
            </div>
          </div>
        </div>

        <div className="analytics-header-actions">
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

          <button
            type="button"
            className="analytics-refresh-btn"
            onClick={() => void refresh()}
            title="Làm mới số liệu thống kê"
            aria-label="Làm mới số liệu thống kê"
          >
            <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      {isLoading && !data ? (
        <>
          <div className="analytics-kpi-grid">
            {[1, 2, 3, 4].map((idx) => (
              <div key={idx} className="skeleton-box" style={{ height: '112px' }} />
            ))}
          </div>
          <div className="analytics-charts-grid">
            <div className="skeleton-box" style={{ height: '250px' }} />
            <div className="skeleton-box" style={{ height: '250px' }} />
          </div>
        </>
      ) : error ? (
        <div className="analytics-error-box">
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
              subText={`${data.kpis.totalCompleted}/${data.kpis.totalCreated} việc (${rangeLabel})`}
              icon={<CheckCircle2 size={16} color="var(--color-primary)" />}
              tone="primary"
              progressPercent={data.kpis.completionRate}
            />

            <MetricCard
              label="Chuỗi kỷ luật"
              value={`${data.kpis.currentStreakDays} ngày`}
              subText={`Kỷ lục dài nhất: ${data.kpis.longestStreakDays} ngày`}
              icon={<Flame size={16} color="var(--priority-medium)" />}
              tone={data.kpis.currentStreakDays > 0 ? 'warning' : 'default'}
              badgeText={data.kpis.currentStreakDays > 0 ? 'Đang duy trì' : undefined}
            />

            <MetricCard
              label="Giờ tập trung (Deep Work)"
              value={`${data.kpis.totalFocusHours}h`}
              subText={`${data.kpis.pomodoroSessions} phiên Pomodoro (${data.kpis.totalFocusMinutes} phút)`}
              icon={<Clock size={16} color="var(--color-info)" />}
              actionLabel={data.kpis.pomodoroSessions === 0 ? 'Bắt đầu phiên →' : undefined}
              onAction={() => navigate('/my-day')}
            />

            <MetricCard
              label="Công việc quá hạn"
              value={data.kpis.overdueTasks}
              subText={
                data.kpis.overdueTasks > 0
                  ? 'Cần ưu tiên xử lý sớm'
                  : 'Mọi công việc đang đúng hạn'
              }
              icon={
                <AlertTriangle
                  size={16}
                  color={data.kpis.overdueTasks > 0 ? 'var(--color-danger)' : 'var(--color-success)'}
                />
              }
              tone={data.kpis.overdueTasks > 0 ? 'danger' : 'default'}
              actionLabel={data.kpis.overdueTasks > 0 ? 'Xử lý ngay →' : undefined}
              onAction={() => navigate('/planning')}
            />
          </div>

          <div className="analytics-charts-grid">
            <WeeklyBarChart trend={data.dailyTrend} />
            <CategoryDonutChart items={data.categoryBreakdown} />
          </div>

          <div className={`analytics-peak-banner ${data.kpis.pomodoroSessions > 0 ? 'has-data' : ''}`}>
            <div className="analytics-peak-left">
              <div className="analytics-peak-icon">
                <Sparkles size={18} />
              </div>
              <div>
                <div className="analytics-peak-kicker">
                  Khung giờ vàng tập trung (Peak Focus)
                </div>
                <div className="analytics-peak-slot">{data.peakFocusHours.slot}</div>
              </div>
            </div>

            <div className="analytics-peak-right">
              <span className="analytics-peak-desc">{data.peakFocusHours.description}</span>
              {data.kpis.pomodoroSessions === 0 && (
                <button
                  type="button"
                  className="analytics-cta-btn"
                  onClick={() => navigate('/my-day')}
                >
                  <span>Vào Pomodoro ngay</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
