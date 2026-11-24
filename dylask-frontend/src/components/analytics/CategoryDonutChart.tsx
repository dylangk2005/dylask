import React, { useState } from 'react';
import type { CategoryShare } from '@/types/analytics';

interface CategoryDonutChartProps {
  items: CategoryShare[];
}

/**
 * Biểu đồ Donut vẽ bằng SVG thuần (stroke-dasharray) thể hiện tỷ trọng theo danh mục.
 * Hỗ trợ tương tác hover giữa lát biểu đồ và danh sách chú thích.
 */
export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ items }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const size = 164;
  const strokeWidth = 22;
  const radius = (size - 28) / 2;
  const circumference = 2 * Math.PI * radius;

  const totalTasks = items.reduce((sum, item) => sum + item.taskCount, 0);

  if (items.length === 0 || totalTasks === 0) {
    return (
      <div className="analytics-panel">
        <div className="analytics-panel-title">Phân bổ theo danh mục</div>
        <div className="analytics-empty-chart">
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

  const activeItem = hoveredIndex !== null ? items[hoveredIndex] : null;

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <div className="analytics-panel-title">Phân bổ theo danh mục</div>
        <span className="analytics-panel-meta">{items.length} danh mục</span>
      </div>

      <div className="analytics-donut-body">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label="Biểu đồ tròn phân bổ danh mục"
          className="analytics-donut-svg"
        >
          <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            {segments.map(({ item, segmentLength, dashOffset }, idx) => {
              const isHovered = hoveredIndex === idx;
              const isDimmed = hoveredIndex !== null && !isHovered;
              return (
                <circle
                  key={`${item.categoryId}-${item.name}`}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={`${segmentLength} ${circumference}`}
                  strokeDashoffset={dashOffset}
                  opacity={isDimmed ? 0.4 : 1}
                  style={{ transition: 'stroke-width 0.18s ease, opacity 0.18s ease', cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </g>
          <text
            x="50%"
            y="47%"
            textAnchor="middle"
            fill="var(--color-text)"
            fontSize="20"
            fontWeight="700"
            fontFamily="var(--font-mono)"
          >
            {activeItem ? `${activeItem.percentage}%` : totalTasks}
          </text>
          <text
            x="50%"
            y="62%"
            textAnchor="middle"
            fill="var(--color-text-muted)"
            fontSize="11"
          >
            {activeItem ? activeItem.name : 'công việc'}
          </text>
        </svg>

        <div className="analytics-donut-legend">
          {items.map((item, idx) => {
            const isHovered = hoveredIndex === idx;
            return (
              <div
                key={`${item.categoryId}-${item.name}-legend`}
                className={`analytics-donut-legend-row ${isHovered ? 'active' : ''}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="analytics-donut-legend-top">
                  <div className="analytics-donut-legend-name-wrap">
                    <span
                      className="analytics-donut-swatch"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="analytics-donut-legend-name">{item.name}</span>
                  </div>
                  <span className="analytics-donut-legend-count">
                    {item.taskCount} ({item.percentage}%)
                  </span>
                </div>
                <div className="analytics-donut-track" aria-hidden="true">
                  <div
                    className="analytics-donut-fill"
                    style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
