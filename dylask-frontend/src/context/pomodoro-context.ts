import { createContext } from 'react';
import type { MyDayTask, PomodoroSessionResult } from '@/types/task';
import type { PomodoroPhase } from '@/hooks/usePomodoroTimer';

export interface PomodoroContextValue {
  activeTask: MyDayTask | null;
  setActiveTask: (task: MyDayTask | null) => void;
  phase: PomodoroPhase;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  completedInCycle: number;
  soundEnabled: boolean;
  lastRecordedSession: PomodoroSessionResult | null;
  toggleSound: () => void;
  startForTask: (task: MyDayTask) => void;
  toggleRun: () => void;
  resetTimer: () => void;
  switchPhase: (nextPhase: PomodoroPhase) => void;
}

export const PomodoroContext = createContext<PomodoroContextValue | undefined>(undefined);
