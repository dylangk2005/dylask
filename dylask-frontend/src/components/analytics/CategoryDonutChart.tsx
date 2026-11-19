import React from 'react';
import type { CategoryShare } from '@/types/analytics';

interface CategoryDonutChartProps {
  items: CategoryShare[];
}

/**
 * Biểu đồ Donut vẽ bằng SVG thuần (stroke-dasharray) thể hiện tỷ trọng theo danh mục.
 */
export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ items }) => {
  const size = 160;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalTasks = items.reduce((sum, item) => sum + item.taskCount, 0);

  if (items.length === 0 || totalTasks === 0) {
    return (
      <div className="analytics-panel">
        <div className="analytics-panel-title">Phân bổ theo danh mục</div>
        <div style={{ padding: 'var(--space-8) 0', textAlign: 'center', fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
          Chưa có công việc nào trong khoảng thời gian này.
        </div>
      </div>
    );
  }

  const segments = items.reduce<
    Array<{ item: CategoryShare; segmentLength: number; dashOffset: number; nextAcc: number }>
  >((acc, item) => {
    const prevAcc = acc.length > 0 ? acc[acc.length - 1].nextAcc : 0;
    const segmentLength = (item.percentage / 100) * circumference;
    const dashOffset = -((prevAcc / 100) * circumference);
    acc.push({ item, segmentLength, dashOffset, nextAcc: prevAcc + item.percentage });
    return acc;
  }, []);

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-title">Phân bổ theo danh mục</div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap', padding: 'var(--space-2) 0' }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="Biểu đồ tròn phân bổ danh mục">
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {segments.map(({ item, segmentLength, dashOffset }) => (
              <circle
                key={`${item.categoryId}-${item.name}`}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={item.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${segmentLength} ${circumference}`}
                strokeDashoffset={dashOffset}
              />
            ))}
          </g>
          <text
            x="50%"
            y="48%"
            textAnchor="middle"
            fill="var(--color-text)"
            fontSize="20"
            fontWeight="700"
            fontFamily="var(--font-family-mono)"
          >
            {totalTasks}
          </text>
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize="11"
          >
            công việc
          </text>
        </svg>

        <div style={{ flex: 1, minWidth: '160px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {items.map((item) => (
            <div
              key={`${item.categoryId}-${item.name}-legend`}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-sm)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '2px',
                    backgroundColor: item.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ color: 'var(--color-text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {item.name}
                </span>
              </div>
              <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                {item.taskCount} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
