import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { StandardTasksPlaceholder } from '@/pages/standard/StandardTasksPlaceholder';

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Navigate to="/tasks" replace />} />
          <Route path="tasks" element={<StandardTasksPlaceholder />} />
          <Route path="my-day" element={<StandardTasksPlaceholder />} />
          <Route path="calendar" element={<StandardTasksPlaceholder />} />
          <Route path="planning" element={<StandardTasksPlaceholder />} />
          <Route path="analytics" element={<StandardTasksPlaceholder />} />
          <Route path="developer/board" element={<StandardTasksPlaceholder />} />
          <Route path="developer/backlog" element={<StandardTasksPlaceholder />} />
          <Route path="developer/focus" element={<StandardTasksPlaceholder />} />
          <Route path="developer/git" element={<StandardTasksPlaceholder />} />
          <Route path="developer/metrics" element={<StandardTasksPlaceholder />} />
          <Route path="settings" element={<StandardTasksPlaceholder />} />
          <Route path="*" element={<Navigate to="/tasks" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
