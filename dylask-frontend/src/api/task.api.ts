import { api } from '@/api/client';
import type { PageResponse } from '@/types/api';
import type {
  CalendarTask,
  ChecklistItem,
  CreateChecklistPayload,
  CreateTaskPayload,
  MyDayResponse,
  PomodoroSessionResult,
  RecurringConfig,
  SetRecurringPayload,
  TaskDetail,
  TaskFilterParams,
  TaskSummary,
  ToggleMyDayPayload,
  ToggleMyDayResponse,
  UpdateChecklistPayload,
  UpdateStatusPayload,
  UpdateTaskPayload,
} from '@/types/task';

/**
 * API Client phục vụ tương tác với các endpoint công việc và danh sách kiểm tra con (Task & Checklists).
 */
export const taskApi = {
  /**
   * Lấy danh sách công việc theo bộ lọc đa chiều và phân trang.
   */
  getTasks: (params: TaskFilterParams = {}): Promise<PageResponse<TaskSummary>> => {
    const query = new URLSearchParams();
    if (params.mode) query.set('mode', params.mode);
    if (params.category) query.set('category', params.category);
    if (params.filter) query.set('filter', params.filter);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page !== undefined) query.set('page', params.page.toString());
    if (params.size !== undefined) query.set('size', params.size.toString());
    if (params.sort) query.set('sort', params.sort);

    const queryString = query.toString();
    const endpoint = queryString ? `/tasks?${queryString}` : '/tasks';
    return api.get<PageResponse<TaskSummary>>(endpoint);
  },

  /**
   * Lấy chi tiết một công việc cùng danh sách các mục kiểm tra con.
   */
  getTaskById: (id: number): Promise<TaskDetail> => {
    return api.get<TaskDetail>(`/tasks/${id}`);
  },

  /**
   * Tạo công việc mới.
   */
  createTask: (payload: CreateTaskPayload): Promise<TaskSummary> => {
    return api.post<TaskSummary>('/tasks', payload);
  },

  /**
   * Cập nhật thông tin chi tiết của công việc.
   */
  updateTask: (id: number, payload: UpdateTaskPayload): Promise<TaskDetail> => {
    return api.put<TaskDetail>(`/tasks/${id}`, payload);
  },

  /**
   * Đổi trạng thái hoàn thành ('todo' <-> 'done').
   */
  updateStatus: (id: number, payload: UpdateStatusPayload): Promise<TaskSummary> => {
    return api.patch<TaskSummary>(`/tasks/${id}/status`, payload);
  },

  /**
   * Xóa vĩnh viễn công việc và toàn bộ checklists con liên quan.
   */
  deleteTask: (id: number): Promise<void> => {
    return api.delete<void>(`/tasks/${id}`);
  },

  /**
   * Thêm mục kiểm tra con mới vào công việc.
   */
  addChecklist: (taskId: number, payload: CreateChecklistPayload): Promise<ChecklistItem> => {
    return api.post<ChecklistItem>(`/tasks/${taskId}/checklists`, payload);
  },

  /**
   * Đảo ngược trạng thái hoàn thành của mục kiểm tra con.
   */
  toggleChecklist: (taskId: number, checklistId: number): Promise<ChecklistItem> => {
    return api.patch<ChecklistItem>(`/tasks/${taskId}/checklists/${checklistId}/toggle`);
  },

  /**
   * Cập nhật nội dung hoặc thứ tự mục kiểm tra con.
   */
  updateChecklist: (
    taskId: number,
    checklistId: number,
    payload: UpdateChecklistPayload
  ): Promise<ChecklistItem> => {
    return api.put<ChecklistItem>(`/tasks/${taskId}/checklists/${checklistId}`, payload);
  },

  /**
   * Xóa một mục kiểm tra con.
   */
  deleteChecklist: (taskId: number, checklistId: number): Promise<void> => {
    return api.delete<void>(`/tasks/${taskId}/checklists/${checklistId}`);
  },

  /**
   * Lấy danh sách công việc trong khoảng thời gian cho Calendar View.
   */
  getCalendarTasks: (startDate: string, endDate: string): Promise<CalendarTask[]> => {
    const query = new URLSearchParams({ startDate, endDate });
    return api.get<CalendarTask[]>(`/tasks/calendar?${query.toString()}`);
  },

  /**
   * Cấu hình quy tắc lặp lại định kỳ cho công việc.
   */
  setRecurring: (taskId: number, payload: SetRecurringPayload): Promise<RecurringConfig> => {
    return api.put<RecurringConfig>(`/tasks/${taskId}/recurring`, payload);
  },

  /**
   * Hủy bỏ quy tắc lặp lại định kỳ của công việc.
   */
  clearRecurring: (taskId: number): Promise<RecurringConfig> => {
    return api.delete<RecurringConfig>(`/tasks/${taskId}/recurring`);
  },

  /**
   * Lấy danh sách công việc trọng tâm hôm nay và gợi ý thông minh (My Day).
   */
  getMyDay: (): Promise<MyDayResponse> => {
    return api.get<MyDayResponse>('/tasks/my-day');
  },

  /**
   * Thêm hoặc gỡ công việc khỏi Kế hoạch hôm nay (My Day).
   */
  toggleMyDay: (taskId: number, payload: ToggleMyDayPayload): Promise<ToggleMyDayResponse> => {
    return api.patch<ToggleMyDayResponse>(`/tasks/${taskId}/my-day`, payload);
  },

  /**
   * Ghi nhận hoàn thành 1 phiên Pomodoro 25 phút cho công việc.
   */
  completePomodoro: (taskId: number): Promise<PomodoroSessionResult> => {
    return api.post<PomodoroSessionResult>(`/tasks/${taskId}/pomodoro/complete`);
  },
};

