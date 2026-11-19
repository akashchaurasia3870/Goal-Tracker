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
  Trophy,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { sampleGoals } from '../../data/goal_data';

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
  { path: '/achievements', label: 'Rewards & XP', icon: Trophy },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/notifications', label: 'Notifications', icon: Bell },
  { path: '/settings', label: 'Settings', icon: Settings },
  { path: '/admin', label: 'Admin Panel', icon: ShieldCheck },
];

const Sidebar = ({ isCollapsed, onToggleCollapse, mobileOpen, onCloseMobile }) => {
  const content = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 sm:px-5 border-b border-slate-200">
        <NavLink to="/" onClick={onCloseMobile} className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-sm shrink-0">
            T
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden transition-all duration-200">
              <h1 className="font-bold text-slate-900 text-base leading-tight">TaskFlow</h1>
              <p className="text-[11px] text-slate-500 font-medium">Goal-Based Management</p>
            </div>
          )}
        </NavLink>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={onCloseMobile}
              title={isCollapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center ${
                  isCollapsed ? 'justify-center px-2' : 'justify-between px-3'
                } py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </div>
              {!isCollapsed && item.badge && (
                <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Pinned Active Goals Preview (when expanded) */}
      {!isCollapsed && (
        <div className="px-3 py-3 border-t border-slate-100 text-xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
            Active Goals
          </p>
          <div className="space-y-1">
            {sampleGoals.slice(0, 2).map((goal) => (
              <NavLink
                key={goal.id}
                to="/goals"
                onClick={onCloseMobile}
                className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 text-slate-700 transition"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: goal.color }} />
                  <span className="truncate">{goal.title}</span>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                  {goal.progress}%
                </span>
              </NavLink>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Collapse Toggle */}
      <div className="hidden lg:flex items-center justify-between p-3 border-t border-slate-200 bg-slate-50">
        {!isCollapsed && (
          <div className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Hierarchy Flow</span>
            <p className="text-[10px] text-slate-400">Goal &rarr; Stage &rarr; Task</p>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition ml-auto"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-200 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* Mobile Offcanvas Drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Drawer Container */}
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white shadow-xl animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
