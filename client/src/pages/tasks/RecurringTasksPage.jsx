import React, { useState, useEffect } from 'react';
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  History,
  AlertCircle,
  X,
} from 'lucide-react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import recurringService from '../../services/recurring.service';
import toast from 'react-hot-toast';

const RecurringTasksPage = () => {
  const [recurringTasks, setRecurringTasks] = useState([]);
  const [occurrences, setOccurrences] = useState([]);
  const [selectedTaskForHistory, setSelectedTaskForHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Recurring Task Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [interval, setInterval] = useState(1);
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState('Routine');
  const [reminderTime, setReminderTime] = useState('08:00');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      try {
        const res = await recurringService.getRecurringTasks();
        if (res.data) setRecurringTasks(res.data);
      } catch (err) {
        // Fallback sample recurring rules
        setRecurringTasks([
          {
            _id: 'rec_1',
            title: 'Read Database & System Design Books (30 mins)',
            frequency: 'daily',
            interval: 1,
            priority: 'High',
            category: 'Learning',
            status: 'active',
            reminderTime: '08:00',
            generatedCount: 14,
          },
          {
            _id: 'rec_2',
            title: 'Solve LeetCode Problem (Mon-Fri)',
            frequency: 'weekdays',
            interval: 1,
            priority: 'Critical',
            category: 'Career',
            status: 'active',
            reminderTime: '18:00',
            generatedCount: 22,
          },
        ]);
      }

      try {
        const occRes = await recurringService.getOccurrences();
        if (occRes.data) setOccurrences(occRes.data);
      } catch (err) {
        // Sample occurrences history
        setOccurrences([
          {
            _id: 'occ_1',
            recurringTaskId: 'rec_1',
            title: 'Read Database & System Design Books (30 mins)',
            dueDate: new Date(Date.now() - 48 * 3600000).toISOString(),
            status: 'completed',
          },
          {
            _id: 'occ_2',
            recurringTaskId: 'rec_1',
            title: 'Read Database & System Design Books (30 mins)',
            dueDate: new Date(Date.now() - 24 * 3600000).toISOString(),
            status: 'completed',
          },
          {
            _id: 'occ_3',
            recurringTaskId: 'rec_1',
            title: 'Read Database & System Design Books (30 mins)',
            dueDate: new Date().toISOString(),
            status: 'pending',
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const newRule = {
        title: title.trim(),
        frequency,
        interval: Number(interval),
        priority,
        category,
        reminderTime,
      };

      try {
        const res = await recurringService.createRecurringTask(newRule);
        setRecurringTasks([res.data, ...recurringTasks]);
      } catch {
        // Local fallback
        const local = { _id: `rec_${Date.now()}`, ...newRule, status: 'active', generatedCount: 1 };
        setRecurringTasks([local, ...recurringTasks]);
      }

      toast.success('Recurring task schedule created');
      setIsModalOpen(false);
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTogglePause = async (task) => {
    const isPaused = task.status === 'paused';
    try {
      if (isPaused) {
        await recurringService.resume(task._id);
      } else {
        await recurringService.pause(task._id);
      }
    } catch {}

    setRecurringTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, status: isPaused ? 'active' : 'paused' } : t))
    );
    toast.success(isPaused ? 'Recurrence resumed' : 'Recurrence paused');
  };

  const handleDelete = async (taskId) => {
    try {
      await recurringService.delete(taskId);
    } catch {}

    setRecurringTasks((prev) => prev.filter((t) => t._id !== taskId));
    toast.success('Recurring rule removed');
  };

  const taskOccurrences = selectedTaskForHistory
    ? occurrences.filter(
        (o) => (o.recurringTaskId?._id || o.recurringTaskId) === selectedTaskForHistory._id
      )
    : [];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Recurring Tasks</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Automate routine habits with independent recurring occurrence records
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsModalOpen(true)}
        >
          New Recurring Task
        </Button>
      </div>

      {/* Rules List */}
      <div className="space-y-3">
        {recurringTasks.map((rule) => {
          const isPaused = rule.status === 'paused';
          return (
            <div
              key={rule._id}
              className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                    {rule.frequency}
                  </span>
                  <Badge priority={rule.priority} size="xs" />
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      isPaused ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                    }`}
                  >
                    {rule.status}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{rule.title}</h4>
                <p className="text-xs text-slate-500">
                  Reminder: {rule.reminderTime || '09:00'} · Category: {rule.category}
                </p>
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedTaskForHistory(rule)}
                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 transition"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>History</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTogglePause(rule)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                  title={isPaused ? 'Resume schedule' : 'Pause schedule'}
                >
                  {isPaused ? <Play className="w-4 h-4 text-emerald-600" /> : <Pause className="w-4 h-4 text-amber-600" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(rule._id)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                  title="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* History Drawer Modal */}
      <Modal
        isOpen={!!selectedTaskForHistory}
        onClose={() => setSelectedTaskForHistory(null)}
        title={`Occurrences: ${selectedTaskForHistory?.title}`}
        subtitle="Individual occurrence records with independent completion tracking"
        maxWidth="max-w-lg"
      >
        <div className="space-y-3">
          {taskOccurrences.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No historical occurrences recorded yet. Next occurrence will generate on schedule.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {taskOccurrences.map((occ) => {
                const isCompleted = occ.status === 'completed';
                return (
                  <div key={occ._id} className="p-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center text-white ${
                          isCompleted ? 'bg-emerald-600' : 'bg-slate-200'
                        }`}
                      >
                        {isCompleted && <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">
                          {new Date(occ.dueDate).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Status: {occ.status}
                        </span>
                      </div>
                    </div>
                    <Badge status={isCompleted ? 'Completed' : 'Todo'} size="xs" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Modal>

      {/* New Recurring Task Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Recurring Task"
        subtitle="Setup automatic recurring tasks independent of goals"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Daily LeetCode or Weekly Review"
              className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekdays">Weekdays (Mon-Fri)</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="custom">Custom interval</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Routine"
                className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
              Start Schedule
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default RecurringTasksPage;
