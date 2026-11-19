import React from 'react';
import type { DailyProductivityTrend } from '@/types/analytics';

interface WeeklyBarChartProps {
  trend: DailyProductivityTrend[];
}

/**
 * Biểu đồ cột SVG thuần so sánh số công việc Tạo mới vs Hoàn thành theo từng ngày.
 */
export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ trend }) => {
  const maxValue = Math.max(
    1,
    ...trend.map((d) => Math.max(d.created, d.completed))
  );

  const chartHeight = 160;

  return (
    <div className="analytics-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div className="analytics-panel-title">Xu hướng Tạo mới vs Hoàn thành</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-border-strong)' }} />
            Tạo mới
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: 'var(--color-primary)' }} />
            Hoàn thành
          </span>
        </div>
      </div>

      {trend.length === 0 ? (
        <div style={{ padding: 'var(--space-8) 0', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Chưa có dữ liệu xu hướng.
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))`,
            gap: '8px',
            alignItems: 'end',
            paddingTop: '12px',
          }}
        >
          {trend.map((item) => {
            const createdHeight = Math.round((item.created / maxValue) * chartHeight);
            const completedHeight = Math.round((item.completed / maxValue) * chartHeight);

            return (
              <div
                key={item.date}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}
                title={`${item.date}: Tạo ${item.created}, Xong ${item.completed}, Pomodoro ${item.pomodoroMinutes}p`}
              >
                <div
                  style={{
                    height: `${chartHeight}px`,
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '12px',
                      height: `${Math.max(createdHeight, item.created > 0 ? 4 : 2)}px`,
                      backgroundColor: 'var(--color-border-strong)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <div
                    style={{
                      width: '12px',
                      height: `${Math.max(completedHeight, item.completed > 0 ? 4 : 2)}px`,
                      backgroundColor: 'var(--color-primary)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                </div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                  {item.dayOfWeek.replace('Thứ ', 'T').replace('Chủ nhật', 'CN')}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
