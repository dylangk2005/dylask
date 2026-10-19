import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OAuth2CallbackPage } from '@/pages/auth/OAuth2CallbackPage';
import { LandingPage } from '@/pages/landing/LandingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { StandardTasksPlaceholder } from '@/pages/standard/StandardTasksPlaceholder';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { Loader2 } from 'lucide-react';

const RootIndex = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#0B0F17',
          color: '#94A3B8',
          gap: '8px',
          fontFamily: 'var(--font-ui)',
          fontSize: '14px',
        }}
      >
        <Loader2 className="spinner" size={20} color="#2DD4BF" />
        <span>Đang nạp Dylask...</span>
      </div>
    );
  }

  return isAuthenticated ? <Navigate to="/tasks" replace /> : <LandingPage />;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Root & Landing Page */}
          <Route path="/" element={<RootIndex />} />
          <Route path="/intro" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />

          {/* Dedicated Login & Register Pages */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/oauth2/callback" element={<OAuth2CallbackPage />} />

          {/* Protected Application Workspace */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/tasks" element={<StandardTasksPlaceholder />} />
            <Route path="/my-day" element={<StandardTasksPlaceholder />} />
            <Route path="/calendar" element={<StandardTasksPlaceholder />} />
            <Route path="/planning" element={<StandardTasksPlaceholder />} />
            <Route path="/analytics" element={<StandardTasksPlaceholder />} />
            <Route path="/developer/board" element={<StandardTasksPlaceholder />} />
            <Route path="/developer/backlog" element={<StandardTasksPlaceholder />} />
            <Route path="/developer/focus" element={<StandardTasksPlaceholder />} />
            <Route path="/developer/git" element={<StandardTasksPlaceholder />} />
            <Route path="/developer/metrics" element={<StandardTasksPlaceholder />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};
