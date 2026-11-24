import React, { useMemo, useState } from 'react';
import type { DailyProductivityTrend } from '@/types/analytics';

interface WeeklyBarChartProps {
  trend: DailyProductivityTrend[];
}

function formatDayShort(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

/**
 * Biểu đồ cột SVG/CSS so sánh công việc Tạo mới vs Hoàn thành theo thời gian.
 * Tự co giãn độ rộng cột khi xem 7 ngày / 30 ngày / 1 năm, có trục Y và hover tooltip.
 */
export const WeeklyBarChart: React.FC<WeeklyBarChartProps> = ({ trend }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxValue = useMemo(
    () => Math.max(2, ...trend.map((d) => Math.max(d.created, d.completed))),
    [trend]
  );

  const summary = useMemo(
    () =>
      trend.reduce(
        (acc, d) => ({
          created: acc.created + d.created,
          completed: acc.completed + d.completed,
        }),
        { created: 0, completed: 0 }
      ),
    [trend]
  );

  const chartHeight = 160;
  const isDense = trend.length > 14;
  const barWidth = isDense ? 6 : 14;
  const labelStep = isDense ? Math.ceil(trend.length / 7) : 1;
  const hoveredItem = hoveredIdx !== null ? trend[hoveredIdx] : null;

  const yTicks = [maxValue, Math.round(maxValue / 2), 0];

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <div>
          <div className="analytics-panel-title">Xu hướng Tạo mới vs Hoàn thành</div>
          <div className="analytics-panel-meta">
            {hoveredItem ? (
              <span className="analytics-hover-readout">
                <strong>{formatDayShort(hoveredItem.date)}</strong>: Tạo {hoveredItem.created} · Xong{' '}
                {hoveredItem.completed}
                {hoveredItem.pomodoroMinutes > 0
                  ? ` · ${hoveredItem.pomodoroMinutes}p tập trung`
                  : ''}
              </span>
            ) : (
              <span>
                Tổng kỳ: <strong>{summary.created}</strong> tạo mới ·{' '}
                <strong>{summary.completed}</strong> hoàn thành
              </span>
            )}
          </div>
        </div>

        <div className="analytics-legend-inline">
          <span className="analytics-legend-item">
            <span className="analytics-legend-swatch created" />
            Tạo mới
          </span>
          <span className="analytics-legend-item">
            <span className="analytics-legend-swatch completed" />
            Hoàn thành
          </span>
        </div>
      </div>

      {trend.length === 0 ? (
        <div className="analytics-empty-chart">Chưa có dữ liệu xu hướng.</div>
      ) : (
        <div className="analytics-bar-layout">
          {/* Trục Y */}
          <div className="analytics-y-axis" style={{ height: `${chartHeight}px` }} aria-hidden="true">
            {yTicks.map((tick, idx) => (
              <span key={`${tick}-${idx}`}>{tick}</span>
            ))}
          </div>

          <div className="analytics-bar-plot-area">
            {/* Đường lưới ngang mờ */}
            <div
              aria-hidden="true"
              className="analytics-bar-gridlines"
              style={{ height: `${chartHeight}px` }}
            >
              {[0, 1, 2].map((line) => (
                <div key={line} className="analytics-bar-gridline" />
              ))}
            </div>

            <div
              className="analytics-bar-columns"
              style={{
                gridTemplateColumns: `repeat(${trend.length}, minmax(0, 1fr))`,
                gap: isDense ? '3px' : '8px',
              }}
            >
              {trend.map((item, idx) => {
                const createdHeight = Math.round((item.created / maxValue) * chartHeight);
                const completedHeight = Math.round((item.completed / maxValue) * chartHeight);
                const isHovered = hoveredIdx === idx;
                const showLabel = idx % labelStep === 0 || idx === trend.length - 1;
                const xLabel = isDense
                  ? formatDayShort(item.date)
                  : item.dayOfWeek.replace('Thứ ', 'T').replace('Chủ nhật', 'CN');

                return (
                  <div
                    key={item.date}
                    className={`analytics-bar-col ${isHovered ? 'hovered' : ''}`}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    title={`${item.date}: Tạo ${item.created}, Xong ${item.completed}, Pomodoro ${item.pomodoroMinutes}p`}
                  >
                    <div
                      className="analytics-bar-pair"
                      style={{ height: `${chartHeight}px`, gap: isDense ? '2px' : '5px' }}
                    >
                      <div className="analytics-bar-slot">
                        {!isDense && item.created > 0 && (
                          <span className="analytics-bar-num muted">{item.created}</span>
                        )}
                        <div
                          className={`analytics-bar created ${item.created === 0 ? 'zero' : ''}`}
                          style={{
                            width: `${barWidth}px`,
                            height: item.created > 0 ? `${Math.max(createdHeight, 6)}px` : '3px',
                          }}
                        />
                      </div>

                      <div className="analytics-bar-slot">
                        {!isDense && item.completed > 0 && (
                          <span className="analytics-bar-num primary">{item.completed}</span>
                        )}
                        <div
                          className={`analytics-bar completed ${item.completed === 0 ? 'zero' : ''}`}
                          style={{
                            width: `${barWidth}px`,
                            height: item.completed > 0 ? `${Math.max(completedHeight, 6)}px` : '3px',
                          }}
                        />
                      </div>
                    </div>

                    <div className="analytics-bar-xlabel">{showLabel ? xLabel : ''}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
