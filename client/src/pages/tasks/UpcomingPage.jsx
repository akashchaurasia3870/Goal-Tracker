import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Calendar,
  AlertTriangle,
  Clock,
  Target,
  Milestone,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import TaskItem from '../../components/tasks/TaskItem';
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer';
import TaskModal from '../../components/tasks/TaskModal';
import taskService from '../../services/task.service';
import goalService from '../../services/goal.service';
import { sampleTasks } from '../../data/task_data';
import { sampleGoals } from '../../data/goal_data';
import toast from 'react-hot-toast';

const UpcomingPage = () => {
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadUpcomingData = async () => {
    try {
      setLoading(true);
      try {
        const res = await taskService.getTasks();
        if (res.data) setTasks(res.data);
      } catch (err) {
        setTasks(sampleTasks);
      }

      try {
        const gRes = await goalService.getGoals();
        if (gRes.data) setGoals(gRes.data);
      } catch (err) {
        setGoals(sampleGoals);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUpcomingData();
  }, []);

  const handleToggleComplete = async (task) => {
    const id = task._id || task.id;
    try {
      await taskService.toggleComplete(id);
    } catch {}

    const nextStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, status: nextStatus } : t))
    );
    toast.success(nextStatus === 'Completed' ? 'Completed!' : 'Reopened');
  };

  // Group into timeframe buckets
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfTomorrow = startOfToday + 24 * 60 * 60 * 1000;
  const endOfTomorrow = startOfTomorrow + 24 * 60 * 60 * 1000 - 1;
  const endOfWeek = startOfToday + 7 * 24 * 60 * 60 * 1000;
  const endOfNextWeek = startOfToday + 14 * 24 * 60 * 60 * 1000;

  const buckets = {
    overdue: [],
    today: [],
    tomorrow: [],
    thisWeek: [],
    nextWeek: [],
    later: [],
  };

  tasks.forEach((t) => {
    if (!t.dueDate) {
      buckets.later.push(t);
      return;
    }
    const d = new Date(t.dueDate).getTime();
    if (d < startOfToday && t.status !== 'Completed') {
      buckets.overdue.push(t);
    } else if (d >= startOfToday && d < startOfTomorrow) {
      buckets.today.push(t);
    } else if (d >= startOfTomorrow && d <= endOfTomorrow) {
      buckets.tomorrow.push(t);
    } else if (d > endOfTomorrow && d <= endOfWeek) {
      buckets.thisWeek.push(t);
    } else if (d > endOfWeek && d <= endOfNextWeek) {
      buckets.nextWeek.push(t);
    } else {
      buckets.later.push(t);
    }
  });

  const bucketConfig = [
    { key: 'overdue', label: 'Overdue', color: 'text-rose-700 bg-rose-50 border-rose-200' },
    { key: 'today', label: 'Today', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { key: 'tomorrow', label: 'Tomorrow', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
    { key: 'thisWeek', label: 'This Week', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { key: 'nextWeek', label: 'Next Week', color: 'text-slate-700 bg-slate-50 border-slate-200' },
    { key: 'later', label: 'Later & Unscheduled', color: 'text-slate-600 bg-slate-50 border-slate-200' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Upcoming Timeline</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Plan future work chronologically across tasks, milestones, and goal target dates
        </p>
      </div>

      {/* Goal Target Deadlines Callout */}
      {goals.length > 0 && (
        <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
            <Target className="w-4 h-4 text-blue-600" />
            <span>Target Goal Deadlines</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {goals.map((g) => (
              <div
                key={g._id || g.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2 truncate">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: g.color }} />
                  <span className="font-semibold text-slate-800 truncate">{g.title}</span>
                </div>
                <span className="text-[11px] text-slate-500 shrink-0 font-medium">
                  {g.targetDate ? new Date(g.targetDate).toLocaleDateString() : 'No date'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Timeframe Buckets */}
      <div className="space-y-6">
        {bucketConfig.map(({ key, label, color }) => {
          const items = buckets[key];
          if (items.length === 0 && key === 'overdue') return null;

          return (
            <div key={key} className="space-y-2.5">
              <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${color}`}>
                    {label}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {items.length} {items.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
              </div>

              {items.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-2">No tasks scheduled for this period.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((task) => (
                    <TaskItem
                      key={task._id || task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onEdit={(t) => {
                        setEditingTask(t);
                        setIsModalOpen(true);
                      }}
                      onOpenDetails={(t) => setDetailTask(t)}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={(data) => {
          setTasks((prev) =>
            prev.map((t) =>
              (t._id || t.id) === (editingTask._id || editingTask.id) ? { ...t, ...data } : t
            )
          );
        }}
        editingTask={editingTask}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        onToggleComplete={handleToggleComplete}
        onToggleChecklistItem={() => {}}
        onEdit={(t) => {
          setEditingTask(t);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
};

export default UpcomingPage;
