import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subText: string;
  icon: React.ReactNode;
  badgeText?: string;
}

/**
 * Thẻ hiển thị chỉ số KPI phẳng (Flat & Crisp) trên màn hình Thống kê Cá nhân.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subText,
  icon,
  badgeText,
}) => {
  return (
    <div className="analytics-metric-card">
      <div className="analytics-metric-top">
        <span>{label}</span>
        {icon}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div className="analytics-metric-value">{value}</div>
        {badgeText && <span className="analytics-streak-badge">{badgeText}</span>}
      </div>
      <div className="analytics-metric-sub">{subText}</div>
    </div>
  );
};
