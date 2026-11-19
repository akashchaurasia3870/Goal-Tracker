import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  Milestone,
  CheckSquare,
  Sun,
  CalendarDays,
  Repeat,
  Calendar,
  CheckCircle2,
  BarChart3,
  Bell,
  Settings,
  ShieldCheck,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/my-day', label: 'My Day', icon: Sun, badge: 'Today' },
  { path: '/upcoming', label: 'Upcoming', icon: CalendarDays },
  { path: '/tasks', label: 'All Tasks', icon: CheckSquare },
  { path: '/recurring', label: 'Recurring Tasks', icon: Repeat },
  { path: '/goals', label: 'Goals', icon: Target },
  { path: '/milestones', label: 'Milestones', icon: Milestone },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/completed', label: 'Completed', icon: CheckCircle2 },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/admin', label: 'Admin Panel', icon: ShieldCheck },
];

const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-200 gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
          T
        </div>
        <div>
          <h1 className="font-bold text-slate-900 text-base leading-tight">TaskFlow</h1>
          <p className="text-xs text-slate-500 font-medium">Goal-Based Management</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Pro Tip / Status */}
      <div className="p-4 border-t border-slate-200 text-xs text-slate-500 bg-slate-50">
        <p className="font-semibold text-slate-700">Hierarchy Flow</p>
        <p className="mt-0.5 text-slate-500">Goal &rarr; Milestones &rarr; Tasks</p>
      </div>
    </aside>
  );
};

export default Sidebar;
