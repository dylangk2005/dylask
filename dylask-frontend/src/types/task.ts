/**
 * Kiểu dữ liệu mức độ ưu tiên công việc theo quy chuẩn Standard Mode.
 */
export type TaskPriority = 'low' | 'medium' | 'high';

/**
 * Trạng thái của công việc: chưa làm ('todo') hoặc đã hoàn thành ('done').
 */
export type TaskStatus = 'todo' | 'done';

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

