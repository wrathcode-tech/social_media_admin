import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import AdminShell from './components/layout/AdminShell';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import PostsPage from './pages/PostsPage';
import ReelsPage from './pages/ReelsPage';
import StoriesPage from './pages/StoriesPage';
import CommentsPage from './pages/CommentsPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import AdsPage from './pages/AdsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import FinancePage from './pages/FinancePage';
import LogsPage from './pages/LogsPage';
import SettingsPage from './pages/SettingsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AdminShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="users/:userId" element={<UserDetailPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="posts" element={<PostsPage />} />
                <Route path="reels" element={<ReelsPage />} />
                <Route path="stories" element={<StoriesPage />} />
                <Route path="comments" element={<CommentsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="ads" element={<AdsPage />} />
                <Route path="analytics" element={<AnalyticsPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="logs" element={<LogsPage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </ToastProvider>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
