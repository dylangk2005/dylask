import { useState, useEffect, useRef, useCallback } from 'react';
import { taskApi } from '@/api/task.api';
import type { MyDayTask, PomodoroSessionResult } from '@/types/task';

export type PomodoroPhase = 'work' | 'shortBreak' | 'longBreak';

const PHASE_DURATION_SECONDS: Record<PomodoroPhase, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

/**
 * Phát âm thanh chuông nhẹ bằng Web Audio API khi hoàn thành một phiên Pomodoro.
 */
function playGentleChime() {
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.18);

    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.85);
  } catch {
    // Bỏ qua nếu trình duyệt chặn autoplay audio
  }
}

/**
 * Hiển thị thông báo trình duyệt nếu người dùng đã cấp quyền.
 */
function notifyBrowser(title: string, body: string) {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
}

/**
 * Custom hook điều khiển đồng hồ Pomodoro (25p làm việc / 5p nghỉ ngắn / 15p nghỉ dài sau mỗi 4 phiên).
 * Sử dụng Web Worker inline để đếm giây chính xác ngay cả khi chuyển tab.
 */
export function usePomodoroTimer(onSessionRecorded?: (result: PomodoroSessionResult) => void) {
  const [activeTask, setActiveTask] = useState<MyDayTask | null>(null);
  const [phase, setPhase] = useState<PomodoroPhase>('work');
  const [secondsLeft, setSecondsLeft] = useState<number>(PHASE_DURATION_SECONDS.work);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedInCycle, setCompletedInCycle] = useState<number>(0);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const workerRef = useRef<Worker | null>(null);
  const phaseRef = useRef<PomodoroPhase>(phase);
  const activeTaskRef = useRef<MyDayTask | null>(activeTask);
  const completedInCycleRef = useRef<number>(completedInCycle);
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const onSessionRecordedRef = useRef(onSessionRecorded);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    activeTaskRef.current = activeTask;
  }, [activeTask]);

  useEffect(() => {
    completedInCycleRef.current = completedInCycle;
  }, [completedInCycle]);

  useEffect(() => {
    onSessionRecordedRef.current = onSessionRecorded;
  }, [onSessionRecorded]);

  const handlePhaseComplete = useCallback(async () => {
    setIsRunning(false);
    if (soundEnabledRef.current) {
      playGentleChime();
    }

    const currentPhase = phaseRef.current;
    const task = activeTaskRef.current;

    if (currentPhase === 'work') {
      const nextCount = completedInCycleRef.current + 1;
      setCompletedInCycle(nextCount);

      if (task) {
        try {
          const result = await taskApi.completePomodoro(task.id);
          onSessionRecordedRef.current?.(result);
        } catch (err) {
          console.error('Lỗi ghi nhận phiên Pomodoro:', err);
        }
      }

      // Cứ 4 phiên làm việc -> chuyển sang nghỉ dài 15 phút (TC-POMO-05)
      const nextPhase: PomodoroPhase = nextCount % 4 === 0 ? 'longBreak' : 'shortBreak';
      setPhase(nextPhase);
      setSecondsLeft(PHASE_DURATION_SECONDS[nextPhase]);
      notifyBrowser(
        'Hoàn thành 1 phiên Pomodoro!',
        nextPhase === 'longBreak'
          ? 'Tuyệt vời! Bạn đã xong 4 phiên, hãy nghỉ dài 15 phút.'
          : 'Hãy nghỉ ngắn 5 phút trước khi tiếp tục.'
      );
    } else {
      setPhase('work');
      setSecondsLeft(PHASE_DURATION_SECONDS.work);
      notifyBrowser('Hết giờ nghỉ!', 'Sẵn sàng cho phiên tập trung 25 phút tiếp theo.');
    }
  }, []);

  // Khởi tạo Web Worker đếm nhịp 1 giây không bị bóp nghẽn khi tab ẩn (TC-POMO-06)
  useEffect(() => {
    const workerCode = `
      let timerId = null;
      self.onmessage = function(e) {
        if (e.data === 'start') {
          if (timerId) clearInterval(timerId);
          timerId = setInterval(() => self.postMessage('tick'), 1000);
        } else if (e.data === 'stop') {
          if (timerId) {
            clearInterval(timerId);
            timerId = null;
          }
        }
      };
    `;
    const blob = new Blob([workerCode], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    const worker = new Worker(workerUrl);
    workerRef.current = worker;

    worker.onmessage = () => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          worker.postMessage('stop');
          void handlePhaseComplete();
          return 0;
        }
        return prev - 1;
      });
    };

    return () => {
      worker.terminate();
      URL.revokeObjectURL(workerUrl);
      workerRef.current = null;
    };
  }, [handlePhaseComplete]);

  useEffect(() => {
    if (!workerRef.current) return;
    workerRef.current.postMessage(isRunning ? 'start' : 'stop');
  }, [isRunning]);

  const startForTask = useCallback((task: MyDayTask) => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
    setActiveTask(task);
    setPhase('work');
    setSecondsLeft(PHASE_DURATION_SECONDS.work);
    setIsRunning(true);
  }, []);

  const toggleRun = useCallback(() => {
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
      void Notification.requestPermission();
    }
    setIsRunning((prev) => !prev);
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(PHASE_DURATION_SECONDS[phaseRef.current]);
  }, []);

  const switchPhase = useCallback((nextPhase: PomodoroPhase) => {
    setIsRunning(false);
    setPhase(nextPhase);
    setSecondsLeft(PHASE_DURATION_SECONDS[nextPhase]);
  }, []);

  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  return {
    activeTask,
    setActiveTask,
    phase,
    secondsLeft,
    totalSeconds: PHASE_DURATION_SECONDS[phase],
    isRunning,
    completedInCycle,
    soundEnabled,
    toggleSound,
    startForTask,
    toggleRun,
    resetTimer,
    switchPhase,
  };
}
