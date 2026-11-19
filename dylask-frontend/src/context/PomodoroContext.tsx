import React, { useState, useCallback, useMemo } from 'react';
import { PomodoroContext } from './pomodoro-context';
import { usePomodoroTimer } from '@/hooks/usePomodoroTimer';
import type { PomodoroSessionResult } from '@/types/task';

/**
 * Provider toàn cục cho đồng hồ Pomodoro, giúp bộ đếm chạy liên tục
 * ngay cả khi người dùng chuyển giữa các trang (/tasks, /calendar, /my-day).
 */
export const PomodoroProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lastRecordedSession, setLastRecordedSession] = useState<PomodoroSessionResult | null>(null);

  const handleSessionRecorded = useCallback((result: PomodoroSessionResult) => {
    setLastRecordedSession(result);
  }, []);

  const timer = usePomodoroTimer(handleSessionRecorded);

  const value = useMemo(
    () => ({
      ...timer,
      lastRecordedSession,
    }),
    [timer, lastRecordedSession]
  );

  return <PomodoroContext.Provider value={value}>{children}</PomodoroContext.Provider>;
};
