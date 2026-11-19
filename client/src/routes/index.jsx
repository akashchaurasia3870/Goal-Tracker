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
import TasksPage from '../pages/tasks/TasksPage';
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
        <Route
          path="my-day"
          element={
            <PlaceholderPage
              title="My Day"
              description="Daily task planner inspired by Google Tasks with overdue & today's focus."
              phase="Phase 7: Daily Productivity"
            />
          }
        />
        <Route
          path="upcoming"
          element={
            <PlaceholderPage
              title="Upcoming Tasks"
              description="Future tasks grouped by Today, Tomorrow, This Week, Next Week, and Later."
              phase="Phase 7: Daily Productivity"
            />
          }
        />
        <Route path="tasks" element={<TasksPage />} />
        <Route
          path="recurring"
          element={
            <PlaceholderPage
              title="Recurring Tasks"
              description="Manage daily, weekday, weekly, monthly and custom recurring occurrences."
              phase="Phase 7: Daily Productivity"
            />
          }
        />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="milestones" element={<MilestonesPage />} />
        <Route
          path="calendar"
          element={
            <PlaceholderPage
              title="Calendar Management"
              description="Monthly, weekly, and daily calendar views with drag-and-drop rescheduling."
              phase="Phase 8: Calendar"
            />
          }
        />
        <Route
          path="completed"
          element={
            <PlaceholderPage
              title="Completed Archive"
              description="Review past achievements and completed goals, milestones, and tasks."
              phase="Phase 6: Task Management"
            />
          }
        />
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
        <Route
          path="notifications"
          element={
            <PlaceholderPage
              title="Notification Center"
              description="Reminders, overdue alerts, and milestone accomplishment notifications."
              phase="Phase 7 & 10"
            />
          }
        />
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
