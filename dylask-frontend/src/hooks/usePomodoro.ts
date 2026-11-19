import { useContext } from 'react';
import { PomodoroContext, type PomodoroContextValue } from '@/context/pomodoro-context';

/**
 * Hook truy cập đồng hồ Pomodoro toàn cục từ bất kỳ component nào trong workspace.
 */
export function usePomodoro(): PomodoroContextValue {
  const ctx = useContext(PomodoroContext);
  if (!ctx) {
    throw new Error('usePomodoro phải được sử dụng bên trong PomodoroProvider');
  }
  return ctx;
}
