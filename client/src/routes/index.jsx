import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import DashboardPage from '../pages/dashboard/DashboardPage';
import PlaceholderPage from '../components/common/PlaceholderPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
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
        <Route
          path="tasks"
          element={
            <PlaceholderPage
              title="Tasks Management"
              description="List, Kanban, Compact views with filters, priorities, and standalone task support."
              phase="Phase 6: Task Management"
            />
          }
        />
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
        <Route
          path="goals"
          element={
            <PlaceholderPage
              title="Goals Management"
              description="Manage long-term objectives, categories, priorities, and completion progress."
              phase="Phase 4: Goal Management"
            />
          }
        />
        <Route
          path="milestones"
          element={
            <PlaceholderPage
              title="Milestone Management"
              description="Divide goals into achievable stages with custom rewards and auto-completion."
              phase="Phase 5: Milestone Management"
            />
          }
        />
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
        <Route
          path="settings"
          element={
            <PlaceholderPage
              title="User Profile & Settings"
              description="Preferences, timezone, date formats, theme, and optional XP system toggle."
              phase="Phase 2 & Settings"
            />
          }
        />
        <Route
          path="admin"
          element={
            <PlaceholderPage
              title="Admin Panel"
              description="User accounts management, system activity logs, and global settings."
              phase="Phase 2: Authorization"
            />
          }
        />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
