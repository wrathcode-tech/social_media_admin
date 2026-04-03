import React, { Suspense, memo } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { lazyWithRetry } from './utils/lazyWithRetry';
import ScrollToTop from './ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminShell from './components/layout/AdminShell';
import { Skeleton } from './components/ui/Skeleton';

const Login = lazyWithRetry(() => import('./pages/Login'));
const DashboardPage = lazyWithRetry(() => import('./pages/DashboardPage'));
const UsersPage = lazyWithRetry(() => import('./pages/UsersPage'));
const UserDetailPage = lazyWithRetry(() => import('./pages/UserDetailPage'));
const PostsPage = lazyWithRetry(() => import('./pages/PostsPage'));
const PostDetailPage = lazyWithRetry(() => import('./pages/PostDetailPage'));
const ReelsPage = lazyWithRetry(() => import('./pages/ReelsPage'));
const ReelDetailPage = lazyWithRetry(() => import('./pages/ReelDetailPage'));
const StoriesPage = lazyWithRetry(() => import('./pages/StoriesPage'));
const StoryDetailPage = lazyWithRetry(() => import('./pages/StoryDetailPage'));
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
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4"
      role="status"
      aria-label="Loading page"
    >
      <div className="w-full max-w-md space-y-3">
        <Skeleton className="mx-auto h-8 w-48 rounded-lg" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="mx-auto h-4 w-5/6 rounded" />
      </div>
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
                  <Route path="posts/:postId" element={<PostDetailPage />} />
                  <Route path="posts" element={<PostsPage />} />
                  <Route path="reels/:reelId" element={<ReelDetailPage />} />
                  <Route path="reels" element={<ReelsPage />} />
                  <Route path="stories/:storyId" element={<StoryDetailPage />} />
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
