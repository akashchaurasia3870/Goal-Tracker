import React, { useState, useEffect } from 'react';
import {
  Sun,
  Plus,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Repeat,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
} from 'lucide-react';
import TaskItem from '../../components/tasks/TaskItem';
import TaskModal from '../../components/tasks/TaskModal';
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer';
import ProgressBar from '../../components/common/ProgressBar';
import Button from '../../components/common/Button';
import taskService from '../../services/task.service';
import recurringService from '../../services/recurring.service';
import { sampleTasks } from '../../data/task_data';
import toast from 'react-hot-toast';

const MyDayPage = () => {
  const [tasks, setTasks] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [quickTitle, setQuickTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);

  const todayDateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const loadMyDayData = async () => {
    try {
      setLoading(true);
      // Fetch from API
      try {
        const res = await taskService.getTasks();
        if (res.data) {
          const startOfToday = new Date();
          startOfToday.setHours(0, 0, 0, 0);

          const endOfToday = new Date();
          endOfToday.setHours(23, 59, 59, 999);

          const myDayList = res.data.filter((t) => {
            if (t.isMyDay) return true;
            if (!t.dueDate) return false;
            const d = new Date(t.dueDate);
            return (d >= startOfToday && d <= endOfToday) || (d < startOfToday && t.status !== 'Completed');
          });
          setTasks(myDayList.length > 0 ? myDayList : sampleTasks);
        }
      } catch (err) {
        console.warn('My Day API offline, using sample tasks');
        setTasks(sampleTasks);
      }

      // Fetch today's recurring occurrences
      try {
        const occRes = await recurringService.getOccurrences();
        if (occRes.data) {
          const today = new Date().toISOString().split('T')[0];
          const todayOcc = occRes.data.filter((o) => o.dueDate && o.dueDate.startsWith(today));
          setOccurrences(todayOcc);
        }
      } catch (err) {
        // Fallback sample recurrence for preview
        setOccurrences([
          {
            _id: 'occ_sample_1',
            title: 'Daily Code Practice & Review',
            dueDate: new Date().toISOString(),
            status: 'pending',
            category: 'Learning',
            priority: 'High',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyDayData();
  }, []);

  // Quick Add directly to My Day
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    const newTask = {
      title: quickTitle.trim(),
      dueDate: new Date().toISOString().split('T')[0],
      isMyDay: true,
      priority: 'Medium',
      status: 'Todo',
      category: 'Work',
    };

    try {
      const res = await taskService.createTask(newTask);
      setTasks((prev) => [res.data, ...prev]);
    } catch {
      // Local fallback
      const localT = {
        _id: `task_${Date.now()}`,
        id: `task_${Date.now()}`,
        ...newTask,
      };
      setTasks((prev) => [localT, ...prev]);
    }

    setQuickTitle('');
    toast.success('Task added to My Day');
  };

  // Toggle complete
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

  // Complete recurring occurrence
  const handleToggleOccurrence = async (occ) => {
    const nextStatus = occ.status === 'completed' ? 'pending' : 'completed';
    try {
      await recurringService.updateOccurrence(occ._id, nextStatus);
    } catch {}

    setOccurrences((prev) =>
      prev.map((o) => (o._id === occ._id ? { ...o, status: nextStatus } : o))
    );
    toast.success(nextStatus === 'completed' ? 'Occurrence completed!' : 'Occurrence reopened');
  };

  // Remove from My Day
  const handleRemoveFromMyDay = async (task) => {
    const id = task._id || task.id;
    try {
      await taskService.updateTask(id, { isMyDay: false });
    } catch {}
    setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
    toast.success('Removed from My Day');
  };

  // Split overdue vs today
  const startOfToday = new Date().setHours(0, 0, 0, 0);
  const overdueTasks = tasks.filter(
    (t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate).getTime() < startOfToday
  );
  const todayTasks = tasks.filter(
    (t) => !t.dueDate || new Date(t.dueDate).getTime() >= startOfToday || t.status === 'Completed'
  );

  const completedCount =
    tasks.filter((t) => t.status === 'Completed').length +
    occurrences.filter((o) => o.status === 'completed').length;
  const totalCount = tasks.length + occurrences.length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Greeting Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 sm:p-8 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-blue-100 text-xs font-semibold uppercase tracking-wider">
            <Sun className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>Daily Focus Planner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">My Day</h2>
          <p className="text-sm text-blue-100">{todayDateString}</p>
        </div>

        {/* Daily Completion Progress Widget */}
        <div className="bg-white/10 backdrop-blur-md px-5 py-3.5 rounded-xl border border-white/20 text-center sm:text-right shrink-0">
          <span className="text-xs text-blue-100 block font-medium">Daily Progress</span>
          <span className="text-2xl font-bold text-white block mt-0.5">{progressPct}%</span>
          <span className="text-[11px] text-blue-200 block">
            {completedCount} of {totalCount} completed
          </span>
        </div>
      </div>

      {/* Quick Add To My Day Input */}
      <form onSubmit={handleQuickAdd} className="relative">
        <input
          type="text"
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          placeholder="Add a task to My Day and press Enter..."
          className="w-full pl-10 pr-24 py-3 bg-white border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs transition"
        />
        <Plus className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
        >
          Add
        </button>
      </form>

      {/* Overdue Alert Section (if any overdue tasks exist) */}
      {overdueTasks.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider">
            <AlertCircle className="w-4 h-4" />
            <span>Overdue Tasks ({overdueTasks.length})</span>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task) => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsModalOpen(true);
                }}
                onOpenDetails={(t) => setDetailTask(t)}
                onToggleMyDay={handleRemoveFromMyDay}
              />
            ))}
          </div>
        </div>
      )}

      {/* Today's Recurring Task Occurrences */}
      {occurrences.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Repeat className="w-4 h-4" />
            <span>Today's Recurring Occurrences ({occurrences.length})</span>
          </div>
          <div className="space-y-2">
            {occurrences.map((occ) => {
              const isDone = occ.status === 'completed';
              return (
                <div
                  key={occ._id}
                  className={`bg-white rounded-xl border p-3 flex items-center justify-between gap-3 shadow-xs transition ${
                    isDone ? 'border-slate-200 bg-slate-50/50 opacity-75' : 'border-indigo-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleOccurrence(occ)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition shrink-0 ${
                        isDone
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 hover:border-indigo-500 bg-white'
                      }`}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                    <div>
                      <span
                        className={`text-sm font-semibold ${
                          isDone ? 'text-slate-400 line-through' : 'text-slate-900'
                        }`}
                      >
                        {occ.title}
                      </span>
                      <span className="block text-[10px] text-indigo-600 font-medium">
                        Recurring daily occurrence
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {occ.category}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Today's Scheduled Tasks */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Today's Scheduled Tasks ({todayTasks.length})
          </span>
        </div>

        {todayTasks.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-200">
            <Sparkles className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Your day is clear!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Add tasks using the input above or link tasks from your goals to focus on them today.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todayTasks.map((task) => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onToggleComplete={handleToggleComplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsModalOpen(true);
                }}
                onOpenDetails={(t) => setDetailTask(t)}
                onToggleMyDay={handleRemoveFromMyDay}
              />
            ))}
          </div>
        )}
      </div>

      {/* Task Edit Modal */}
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

export default MyDayPage;
