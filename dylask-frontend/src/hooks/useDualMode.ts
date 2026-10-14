import { useState, useEffect } from 'react';

export type AppMode = 'standard' | 'developer';

export function useDualMode() {
  const [mode, setMode] = useState<AppMode>(() => {
    const saved = localStorage.getItem('dylask_app_mode');
    return (saved === 'developer' || saved === 'standard') ? saved : 'standard';
  });

  useEffect(() => {
    document.body.setAttribute('data-mode', mode);
    localStorage.setItem('dylask_app_mode', mode);
  }, [mode]);

  const toggleMode = () => {
    setMode((prev) => (prev === 'standard' ? 'developer' : 'standard'));
  };

  return { mode, setMode, toggleMode };
}
