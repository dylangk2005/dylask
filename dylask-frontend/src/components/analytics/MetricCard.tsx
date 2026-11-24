import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subText: string;
  icon: React.ReactNode;
  badgeText?: string;
  tone?: 'default' | 'primary' | 'warning' | 'danger';
  progressPercent?: number;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Thẻ hiển thị chỉ số KPI phẳng (Flat & Crisp) trên màn hình Thống kê Cá nhân.
 * Hỗ trợ thanh tiến độ mini, màu nhấn trạng thái và nút điều hướng hành động nhanh.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subText,
  icon,
  badgeText,
  tone = 'default',
  progressPercent,
  actionLabel,
  onAction,
}) => {
  return (
    <div className={`analytics-metric-card tone-${tone}`}>
      <div className="analytics-metric-top">
        <span>{label}</span>
        <span className={`analytics-icon-box tone-${tone}`}>{icon}</span>
      </div>

      <div className="analytics-metric-value-row">
        <div className="analytics-metric-value">{value}</div>
        {badgeText && <span className="analytics-streak-badge">{badgeText}</span>}
      </div>

      <div className="analytics-metric-footer">
        <div className="analytics-metric-sub">{subText}</div>
        {actionLabel && onAction && (
          <button type="button" onClick={onAction} className="analytics-card-action">
            {actionLabel}
          </button>
        )}
      </div>

      {progressPercent !== undefined && (
        <div className="analytics-mini-progress" aria-hidden="true">
          <div
            className="analytics-mini-progress-fill"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
          />
        </div>
      )}
    </div>
  );
};
