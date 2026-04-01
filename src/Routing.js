import React, { Suspense, memo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { lazyWithRetry } from './utils/lazyWithRetry';
import ScrollToTop from './ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminShell from './components/layout/AdminShell';

const Login = lazyWithRetry(() => import('./pages/Login'));
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'));
const UsersPage = lazyWithRetry(() => import('./pages/UsersPage'));
const UserDetailPage = lazyWithRetry(() => import('./pages/UserDetailPage'));
const PostsPage = lazyWithRetry(() => import('./pages/PostsPage'));
const ReelsPage = lazyWithRetry(() => import('./pages/ReelsPage'));
const StoriesPage = lazyWithRetry(() => import('./pages/StoriesPage'));
const CommentsPage = lazyWithRetry(() => import('./pages/CommentsPage'));
const ReportsPage = lazyWithRetry(() => import('./pages/ReportsPage'));
const NotificationsPage = lazyWithRetry(() => import('./pages/NotificationsPage'));
const AdsPage = lazyWithRetry(() => import('./pages/AdsPage'));
const AnalyticsPage = lazyWithRetry(() => import('./pages/AnalyticsPage'));
const FinancePage = lazyWithRetry(() => import('./pages/FinancePage'));
const AdPaymentRequestsPage = lazyWithRetry(() => import('./pages/AdPaymentRequestsPage'));
const LogsPage = lazyWithRetry(() => import('./pages/LogsPage'));
const SettingsPage = lazyWithRetry(() => import('./pages/SettingsPage'));

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-sm text-gray-500 dark:text-zinc-400">
      Loading…
    </div>
  );
}

const Routing = memo(function Routing() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <ToastProvider>
          <ScrollToTop />
          <Suspense fallback={<RouteFallback />}>
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
                  <Route path="finance/ad-payments" element={<AdPaymentRequestsPage />} />
                  <Route path="logs" element={<LogsPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
});

export default Routing;
