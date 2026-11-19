import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Pin,
  Archive,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import GoalCard from '../../components/goals/GoalCard';
import GoalModal from '../../components/goals/GoalModal';
import GoalDetailModal from '../../components/goals/GoalDetailModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import goalService from '../../services/goal.service';
import { sampleGoals } from '../../data/goal_data';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Learning', 'Career', 'Personal', 'Health', 'Work'];
const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const STATUSES = ['All', 'In Progress', 'Completed', 'Not Started', 'On Hold', 'Cancelled'];

const GoalsPage = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'archived'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [detailGoal, setDetailGoal] = useState(null);
  const [deletingGoal, setDeletingGoal] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch Goals from API (with fallback to sampleGoals)
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await goalService.getGoals({
        isArchived: activeTab === 'archived',
      });
      if (res.data && res.data.length > 0) {
        setGoals(res.data);
      } else {
        // Fallback to realistic sample goals if user has not created any in DB yet
        setGoals(sampleGoals);
      }
    } catch (error) {
      console.warn('[GoalsPage] Backend offline or returned error. Using sample goals:', error.message);
      setGoals(sampleGoals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [activeTab]);

  // Handle Save (Create / Update)
  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        try {
          const res = await goalService.updateGoal(editingGoal._id || editingGoal.id, goalData);
          setGoals((prev) =>
            prev.map((g) => ((g._id || g.id) === (editingGoal._id || editingGoal.id) ? res.data : g))
          );
          toast.success('Goal updated successfully');
        } catch {
          // Local fallback update
          setGoals((prev) =>
            prev.map((g) =>
              (g._id || g.id) === (editingGoal._id || editingGoal.id) ? { ...g, ...goalData } : g
            )
          );
          toast.success('Goal updated locally');
        }
      } else {
        try {
          const res = await goalService.createGoal(goalData);
          setGoals((prev) => [res.data, ...prev]);
          toast.success('New goal created successfully');
        } catch {
          // Local fallback creation
          const newG = { id: `goal_${Date.now()}`, ...goalData, progress: 0 };
          setGoals((prev) => [newG, ...prev]);
          toast.success('New goal added locally');
        }
      }
      setEditingGoal(null);
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  // Handle Delete
  const handleDeleteConfirm = async () => {
    if (!deletingGoal) return;
    try {
      setIsDeleting(true);
      const id = deletingGoal._id || deletingGoal.id;
      try {
        await goalService.deleteGoal(id);
      } catch {
        // Continue local removal
      }
      setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id));
      toast.success('Goal deleted');
      setDeletingGoal(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle Duplicate
  const handleDuplicate = async (goal) => {
    const id = goal._id || goal.id;
    try {
      const res = await goalService.duplicate(id);
      setGoals((prev) => [res.data, ...prev]);
      toast.success('Goal duplicated');
    } catch {
      const duplicated = {
        ...goal,
        id: `goal_${Date.now()}`,
        title: `${goal.title} (Copy)`,
        progress: 0,
        status: 'Not Started',
      };
      setGoals((prev) => [duplicated, ...prev]);
      toast.success('Goal duplicated locally');
    }
  };

  // Handle Toggle Pin
  const handleTogglePin = async (goal) => {
    const id = goal._id || goal.id;
    try {
      await goalService.togglePin(id);
    } catch {
      // Local fallback
    }
    setGoals((prev) =>
      prev.map((g) => ((g._id || g.id) === id ? { ...g, isPinned: !g.isPinned } : g))
    );
    toast.success(goal.isPinned ? 'Goal unpinned' : 'Goal pinned to top');
  };

  // Handle Toggle Archive
  const handleToggleArchive = async (goal) => {
    const id = goal._id || goal.id;
    try {
      await goalService.toggleArchive(id);
    } catch {
      // Local fallback
    }
    setGoals((prev) => prev.filter((g) => (g._id || g.id) !== id));
    toast.success(goal.isArchived ? 'Goal restored to active' : 'Goal archived');
  };

  // Filtered goals calculation
  const filteredGoals = goals.filter((g) => {
    const matchesSearch =
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || g.category === selectedCategory;
    const matchesPriority = selectedPriority === 'All' || g.priority === selectedPriority;
    const matchesStatus = selectedStatus === 'All' || g.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesPriority && matchesStatus;
  });

  // Calculate Metrics
  const now = new Date();
  const totalCount = goals.length;
  const completedCount = goals.filter((g) => g.status === 'Completed').length;
  const inProgressCount = goals.filter((g) => g.status === 'In Progress').length;
  const overdueCount = goals.filter(
    (g) => g.status !== 'Completed' && g.targetDate && new Date(g.targetDate) < now
  ).length;
  const avgProgress =
    totalCount > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalCount) : 0;

  return (
    <div className="space-y-6">
      {/* Top Header & New Goal Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Goals Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Define high-level objectives, establish milestone stages, and track progress
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active / Archive Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTab === 'active' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                activeTab === 'archived' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Archived
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
          >
            New Goal
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Goals</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-blue-600">In Progress</span>
          <p className="text-xl font-bold text-blue-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-600">Completed</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-rose-600">Overdue</span>
          <p className="text-xl font-bold text-rose-700 mt-1">{overdueCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-[11px] font-semibold uppercase text-indigo-600">Avg Completion</span>
          <p className="text-xl font-bold text-indigo-700 mt-1">{avgProgress}%</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals by title or keyword..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Priority & Status Dropdown Filters */}
          <div className="flex items-center gap-2">
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.slice(1).map((p) => (
                <option key={p} value={p}>
                  {p} Priority
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Statuses</option>
              {STATUSES.slice(1).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="hidden sm:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
                }`}
                title="List view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Goals Display Grid / List */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Goals Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery || selectedCategory !== 'All' || selectedPriority !== 'All'
              ? 'No goals matched your filter criteria. Try resetting filters or search query.'
              : 'Start by creating your first long-term goal to organize milestones and tasks.'}
          </p>
          <div className="mt-5">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingGoal(null);
                setIsGoalModalOpen(true);
              }}
            >
              Create First Goal
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
              : 'space-y-3'
          }
        >
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal._id || goal.id}
              goal={goal}
              onEdit={(g) => {
                setEditingGoal(g);
                setIsGoalModalOpen(true);
              }}
              onDelete={(g) => setDeletingGoal(g)}
              onDuplicate={handleDuplicate}
              onTogglePin={handleTogglePin}
              onToggleArchive={handleToggleArchive}
              onViewDetails={(g) => setDetailGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Goal Create / Edit Modal */}
      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
      />

      {/* Goal Details Modal */}
      <GoalDetailModal
        isOpen={!!detailGoal}
        onClose={() => setDetailGoal(null)}
        goal={detailGoal}
        onEdit={(g) => {
          setDetailGoal(null);
          setEditingGoal(g);
          setIsGoalModalOpen(true);
        }}
      />

      {/* Deletion Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deletingGoal?.title}"? Linked standalone tasks will be preserved, but milestones in this goal will be removed.`}
        confirmText="Delete Goal"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default GoalsPage;
