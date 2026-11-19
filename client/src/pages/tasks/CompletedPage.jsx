import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Target,
  Milestone,
  CheckSquare,
  Search,
  Calendar,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import Badge from '../../components/common/Badge';
import taskService from '../../services/task.service';
import goalService from '../../services/goal.service';
import milestoneService from '../../services/milestone.service';
import { sampleTasks } from '../../data/task_data';
import { sampleGoals } from '../../data/goal_data';
import toast from 'react-hot-toast';

const CompletedPage = () => {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'goals', 'milestones', 'tasks'
  const [searchQuery, setSearchQuery] = useState('');

  const [completedGoals, setCompletedGoals] = useState([]);
  const [completedMilestones, setCompletedMilestones] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCompletedData = async () => {
    try {
      setLoading(true);
      // Fetch goals
      try {
        const gRes = await goalService.getGoals({ status: 'Completed' });
        if (gRes.data) setCompletedGoals(gRes.data);
      } catch {
        setCompletedGoals(sampleGoals.filter((g) => g.status === 'Completed'));
      }

      // Fetch milestones
      try {
        const mRes = await milestoneService.getMilestones({ status: 'Completed' });
        if (mRes.data) setCompletedMilestones(mRes.data);
      } catch {
        const sampleM = sampleGoals.flatMap((g) =>
          (g.milestones || [])
            .filter((m) => m.status === 'Completed')
            .map((m) => ({ ...m, goalId: { title: g.title, color: g.color } }))
        );
        setCompletedMilestones(sampleM);
      }

      // Fetch tasks
      try {
        const tRes = await taskService.getTasks({ status: 'Completed' });
        if (tRes.data) setCompletedTasks(tRes.data);
      } catch {
        setCompletedTasks(sampleTasks.filter((t) => t.status === 'Completed'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompletedData();
  }, []);

  const handleReopenTask = async (task) => {
    const id = task._id || task.id;
    try {
      await taskService.toggleComplete(id);
    } catch {}
    setCompletedTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
    toast.success('Task reopened and returned to active workspace');
  };

  const handleReopenMilestone = async (m) => {
    const id = m._id || m.id;
    try {
      await milestoneService.reopenMilestone(id);
    } catch {}
    setCompletedMilestones((prev) => prev.filter((item) => (item._id || item.id) !== id));
    toast.success('Milestone stage reopened');
  };

  // Combine items for 'all' tab
  const allItems = [
    ...completedGoals.map((g) => ({
      ...g,
      type: 'goal',
      date: g.updatedAt || g.targetDate,
      icon: Target,
      color: 'bg-blue-100 text-blue-700',
    })),
    ...completedMilestones.map((m) => ({
      ...m,
      type: 'milestone',
      date: m.completedAt || m.updatedAt,
      icon: Milestone,
      color: 'bg-indigo-100 text-indigo-700',
    })),
    ...completedTasks.map((t) => ({
      ...t,
      type: 'task',
      date: t.completedAt || t.updatedAt,
      icon: CheckSquare,
      color: 'bg-emerald-100 text-emerald-700',
    })),
  ].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const filteredItems = allItems.filter((item) => {
    if (activeTab !== 'all' && item.type !== activeTab) return false;
    return (
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  });

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Completed Archive</h2>
        <p className="text-sm text-slate-500 mt-0.5">
          Review your accomplishments, completed goal stages, and finished tasks
        </p>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Tasks Finished</span>
            <p className="text-xl font-bold text-slate-900">{completedTasks.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Milestone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Milestones Reached</span>
            <p className="text-xl font-bold text-slate-900">{completedMilestones.length}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase">Goals Achieved</span>
            <p className="text-xl font-bold text-slate-900">{completedGoals.length}</p>
          </div>
        </div>
      </div>

      {/* Search and Tabs */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search completed items..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 text-xs">
            {['all', 'task', 'milestone', 'goal'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab === 'all' ? 'All Archive' : `${tab}s`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Completed Items List */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-bold text-slate-800">No completed items in this view</h4>
          <p className="text-xs text-slate-500 mt-1">
            Complete tasks, milestones, or goals to see them immortalized in this archive.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={`${item.type}-${item._id || item.id}`}
                className="bg-white rounded-xl border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {item.type}
                      </span>
                      <Badge status="Completed" size="xs" />
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate mt-0.5">{item.title}</p>
                    {item.date && (
                      <span className="text-[10px] text-slate-400 block">
                        Completed: {new Date(item.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Reopen Action for tasks and milestones */}
                {item.type === 'task' ? (
                  <button
                    onClick={() => handleReopenTask(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition shrink-0"
                    title="Reopen task"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reopen</span>
                  </button>
                ) : item.type === 'milestone' ? (
                  <button
                    onClick={() => handleReopenMilestone(item)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-medium text-slate-600 hover:bg-slate-50 transition shrink-0"
                    title="Reopen milestone"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Reopen</span>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CompletedPage;
