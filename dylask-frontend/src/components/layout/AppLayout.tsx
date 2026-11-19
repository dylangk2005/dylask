import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PomodoroProvider } from '@/context/PomodoroContext';
import { PomodoroMiniBar } from '@/components/pomodoro/PomodoroMiniBar';

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <PomodoroProvider>
      <div className="app-container">
        <Sidebar isOpen={isSidebarOpen} />
        <div className="main-wrapper">
          <Header
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          />
          <main className="page-container">
            <Outlet />
          </main>
        </div>
        <PomodoroMiniBar />
      </div>
    </PomodoroProvider>
  );
};
