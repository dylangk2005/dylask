/**
 * Kiểu dữ liệu mức độ ưu tiên công việc theo quy chuẩn Standard Mode.
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Trạng thái của công việc: chưa làm ('todo') hoặc đã hoàn thành ('done').
 */
export type TaskStatus = 'todo' | 'done';

/**
 * Chu kỳ lặp lại định kỳ của công việc.
 */
export type RecurringPattern = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY';

/**
 * Mục danh sách kiểm tra con (Checklist item / subtask).
 */
export interface ChecklistItem {
  id: number;
  title: string;
  isCompleted: boolean;
  position: number;
  createdAt: string;
}

/**
 * Dữ liệu tóm tắt công việc hiển thị trên danh sách bảng và bộ lọc.
 */
export interface TaskSummary {
  id: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  isMyDay?: boolean;
  categoryName?: string | null;
  totalChecklists: number;
  completedChecklists: number;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Dữ liệu chi tiết toàn diện của công việc bao gồm cả danh sách các mục kiểm tra con.
 */
export interface TaskDetail {
  id: number;
  title: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  isMyDay?: boolean;
  categoryName?: string | null;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern | null;
  recurringInterval?: number;
  recurringUntil?: string | null;
  reminderMinutesBefore?: number | null;
  checklists: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

/**
 * Payload gửi lên khi tạo mới công việc.
 */
export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  categoryName?: string | null;
  checklistTitles?: string[];
}

/**
 * Payload gửi lên khi cập nhật nội dung công việc.
 */
export interface UpdateTaskPayload {
  title: string;
  description?: string | null;
  priority?: TaskPriority;
  dueDate?: string | null;
  categoryName?: string | null;
}

/**
 * Payload cập nhật nhanh trạng thái hoàn thành ('todo' / 'done').
 */
export interface UpdateStatusPayload {
  status: TaskStatus;
}

/**
 * Payload tạo mới mục danh sách kiểm tra con.
 */
export interface CreateChecklistPayload {
  title: string;
}

/**
 * Payload cập nhật mục danh sách kiểm tra con.
 */
export interface UpdateChecklistPayload {
  title?: string;
  isCompleted?: boolean;
  position?: number;
}

/**
 * Tham số bộ lọc và phân trang khi truy vấn danh sách công việc.
 */
export interface TaskFilterParams {
  mode?: string;
  category?: string;
  filter?: 'today' | 'upcoming' | 'overdue';
  search?: string;
  status?: TaskStatus;
  page?: number;
  size?: number;
  sort?: string;
}

/**
 * Thẻ công việc hiển thị trên lưới Lịch trình (Calendar View).
 */
export interface CalendarTask {
  id: number;
  title: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern | null;
  categoryName?: string | null;
}

/**
 * Payload cấu hình quy tắc lặp lại định kỳ cho công việc.
 */
export interface SetRecurringPayload {
  pattern: RecurringPattern;
  interval: number;
  until?: string | null;
  reminderMinutesBefore?: number | null;
}

/**
 * Cấu hình lặp lại định kỳ trả về từ backend.
 */
export interface RecurringConfig {
  id: number;
  recurringPattern: RecurringPattern | null;
  recurringInterval: number;
  recurringUntil?: string | null;
  reminderMinutesBefore?: number | null;
}

/**
 * Công việc trong danh sách Kế hoạch hôm nay (My Day).
 */
export interface MyDayTask {
  id: number;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  pomodoroSessionsCompleted: number;
  pomodoroTotalMinutes: number;
  dueDate?: string | null;
  categoryName?: string | null;
}

/**
 * Công việc được gợi ý thông minh để thêm vào My Day.
 */
export interface MyDaySuggestion {
  id: number;
  title: string;
  priority: TaskPriority;
  dueDate?: string | null;
  reason: string;
}

/**
 * Dữ liệu phản hồi tổng hợp cho trang Kế hoạch hôm nay (My Day).
 */
export interface MyDayResponse {
  date: string;
  tasks: MyDayTask[];
  suggestions: MyDaySuggestion[];
}

/**
 * Payload thêm/gỡ công việc khỏi My Day.
 */
export interface ToggleMyDayPayload {
  isMyDay: boolean;
}

/**
 * Kết quả sau khi cập nhật trạng thái My Day.
 */
export interface ToggleMyDayResponse {
  id: number;
  isMyDay: boolean;
  myDayDate?: string | null;
}

/**
 * Kết quả sau khi hoàn thành 1 phiên Pomodoro 25 phút.
 */
export interface PomodoroSessionResult {
  taskId: number;
  pomodoroSessionsCompleted: number;
  pomodoroTotalMinutes: number;
}

