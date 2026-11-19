import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { PomodoroProvider } from '@/context/PomodoroContext';
import { ToastProvider } from '@/context/ToastContext';
import { ToastContainer } from '@/components/common/ToastContainer';
import { PomodoroMiniBar } from '@/components/pomodoro/PomodoroMiniBar';

export const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <ToastProvider>
      <PomodoroProvider>
        <div className="app-container">
          <Sidebar isOpen={isSidebarOpen} />
          <div className="main-wrapper">
            <Header
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
            />
            <main className="page-container">
              <div key={location.pathname} className="page-enter-wrapper">
                <Outlet />
              </div>
            </main>
          </div>
          <PomodoroMiniBar />
          <ToastContainer />
        </div>
      </PomodoroProvider>
    </ToastProvider>
  );
};
