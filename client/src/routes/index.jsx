import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import ProtectedRoute from '../components/common/ProtectedRoute';
import DashboardPage from '../pages/dashboard/DashboardPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import SettingsPage from '../pages/settings/SettingsPage';
import GoalsPage from '../pages/goals/GoalsPage';
import MilestonesPage from '../pages/milestones/MilestonesPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import CompletedPage from '../pages/tasks/CompletedPage';
import AchievementsPage from '../pages/rewards/AchievementsPage';
import TasksPage from '../pages/tasks/TasksPage';
import MyDayPage from '../pages/tasks/MyDayPage';
import UpcomingPage from '../pages/tasks/UpcomingPage';
import RecurringTasksPage from '../pages/tasks/RecurringTasksPage';
import NotificationsPage from '../pages/notifications/NotificationsPage';
import PlaceholderPage from '../components/common/PlaceholderPage';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="my-day" element={<MyDayPage />} />
        <Route path="upcoming" element={<UpcomingPage />} />
        <Route path="tasks" element={<TasksPage />} />
        <Route path="recurring" element={<RecurringTasksPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="milestones" element={<MilestonesPage />} />
        <Route path="calendar" element={<CalendarPage />} />
        <Route path="completed" element={<CompletedPage />} />
        <Route path="achievements" element={<AchievementsPage />} />
        <Route
          path="analytics"
          element={
            <PlaceholderPage
              title="Productivity Analytics"
              description="Productivity reports, Recharts trends, completion rates, and stats."
              phase="Phase 10: Analytics"
            />
          }
        />
        <Route path="notifications" element={<NotificationsPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="admin"
          element={
            <ProtectedRoute requiredRole="Admin">
              <PlaceholderPage
                title="Admin Management Panel"
                description="Manage user directory, activate/deactivate accounts, system audit trail, and global preferences."
                phase="Admin Protected Area"
              />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Catch-all Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
