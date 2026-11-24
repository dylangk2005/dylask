import type { CalendarTask } from '@/types/task';

export const DAY_SHORT_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

/**
 * Chuyển đối tượng Date sang khóa YYYY-MM-DD theo múi giờ cục bộ.
 */
export function toLocalDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Định dạng hiển thị ngày thân thiện kiểu Việt Nam (vd: "Thứ Ba, 24/11/2026").
 */
export function formatVietnameseDateLabel(date: Date): string {
  const dayNames = [
    'Chủ nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];
  const dayName = dayNames[date.getDay()];
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dayName}, ${dd}/${mm}/${date.getFullYear()}`;
}

/**
 * Kiểm tra công việc trên lịch đã quá hạn hay chưa (so với đầu ngày hôm nay để tránh đánh dấu sai trong ngày).
 */
export function isCalendarTaskOverdue(task: CalendarTask): boolean {
  if (!task.dueDate || task.status === 'done') return false;
  const dueKey = toLocalDateKey(new Date(task.dueDate));
  const todayKey = toLocalDateKey(new Date());
  return dueKey < todayKey;
}

/**
 * Lấy nhãn ưu tiên tiếng Việt tương ứng với priority của công việc.
 */
export function getPriorityLabel(priority: CalendarTask['priority']): string {
  switch (priority) {
    case 'high':
      return 'Cao';
    case 'low':
      return 'Thấp';
    default:
      return 'Vừa';
  }
}
