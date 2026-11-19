import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Target,
  Milestone,
  CheckSquare,
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import ProgressBar from '../../components/common/ProgressBar';
import analyticsService from '../../services/analytics.service';
import { sampleGoals } from '../../data/goal_data';
import { sampleTasks } from '../../data/task_data';

const fallbackOverview = {
  summary: {
    totalGoals: 2,
    activeGoals: 2,
    completedGoals: 0,
    avgGoalProgress: 33,
    totalMilestones: 4,
    completedMilestones: 1,
    totalTasks: 3,
    completedTasks: 1,
    pendingTasks: 2,
    overdueTasks: 0,
    overallTaskCompletionRate: 33,
  },
  trendData: [
    { date: 'Mon', completed: 2 },
    { date: 'Tue', completed: 4 },
    { date: 'Wed', completed: 3 },
    { date: 'Thu', completed: 6 },
    { date: 'Fri', completed: 5 },
    { date: 'Sat', completed: 7 },
    { date: 'Sun', completed: 4 },
  ],
  statusData: [
    { name: 'To Do', value: 1, color: '#94a3b8' },
    { name: 'In Progress', value: 1, color: '#3b82f6' },
    { name: 'Completed', value: 1, color: '#10b981' },
  ],
  categoryData: [
    { name: 'Learning', value: 2, color: '#3b82f6' },
    { name: 'Career', value: 1, color: '#6366f1' },
    { name: 'Personal', value: 1, color: '#10b981' },
  ],
  goalProgressData: [
    { id: '1', title: 'Learn MySQL Database Mastery', progress: 41, color: '#3b82f6', category: 'Learning' },
    { id: '2', title: 'Build Full-Stack MERN TaskFlow', progress: 25, color: '#10b981', category: 'Career' },
  ],
};

const AnalyticsPage = () => {
  const [data, setData] = useState(fallbackOverview);
  const [timeRange, setTimeRange] = useState('7'); // '7', '14', '30'
  const [loading, setLoading] = useState(true);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await analyticsService.getOverview({ days: timeRange });
      if (res.data) {
        setData(res.data);
      }
    } catch (err) {
      setData(fallbackOverview);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const { summary, trendData, statusData, categoryData, goalProgressData } = data;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Header & Range Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Productivity Analytics</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Visualize your velocity, task trends, and goal achievement momentum
          </p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
          {[
            { label: 'Last 7 Days', value: '7' },
            { label: 'Last 14 Days', value: '14' },
            { label: 'Last 30 Days', value: '30' },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setTimeRange(item.value)}
              className={`px-3 py-1.5 rounded-md transition ${
                timeRange === item.value
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Goals</span>
          <p className="text-2xl font-black text-slate-900">{summary.totalGoals}</p>
          <span className="text-[11px] text-slate-500 block">
            Avg {summary.avgGoalProgress}% completion
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase text-indigo-600">Milestones</span>
          <p className="text-2xl font-black text-indigo-700">{summary.completedMilestones}</p>
          <span className="text-[11px] text-slate-500 block">
            of {summary.totalMilestones} stages reached
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase text-emerald-600">Tasks Finished</span>
          <p className="text-2xl font-black text-emerald-700">{summary.completedTasks}</p>
          <span className="text-[11px] text-slate-500 block">
            {summary.overallTaskCompletionRate}% velocity
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-semibold uppercase text-rose-600">Overdue Tasks</span>
          <p className="text-2xl font-black text-rose-700">{summary.overdueTasks}</p>
          <span className="text-[11px] text-slate-500 block">
            {summary.pendingTasks} pending tasks
          </span>
        </div>
      </div>

      {/* Charts Grid: Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart: Daily Completion Trend */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Daily Task Completion Trend</h3>
              <p className="text-xs text-slate-500">Number of tasks finished day by day</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#3b82f6' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Doughnut Chart: Tasks by Status */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Task Status Breakdown</h3>
            <p className="text-xs text-slate-500">Distribution across active workflow</p>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Charts Grid: Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Tasks by Category</h3>
            <p className="text-xs text-slate-500">Volume distribution across work, learning, personal</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} margin={{ top: 5, right: 10, bottom: 5, left: -25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goal Completion Progress Breakdown */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Strategic Goals Momentum</h3>
            <p className="text-xs text-slate-500">Live progress tracking across active objectives</p>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-60 pr-1">
            {goalProgressData.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">No active goals found.</p>
            ) : (
              goalProgressData.map((goal) => (
                <div key={goal.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goal.color }} />
                      <span className="font-semibold text-slate-800 truncate">{goal.title}</span>
                    </div>
                    <span className="font-bold text-slate-700 shrink-0">{goal.progress}%</span>
                  </div>
                  <ProgressBar value={goal.progress} color="blue" height="h-2" />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
