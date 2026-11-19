import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Columns3,
  AlignJustify,
  CheckCircle2,
  Trash2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import TaskItem from '../../components/tasks/TaskItem';
import TaskCard from '../../components/tasks/TaskCard';
import TaskModal from '../../components/tasks/TaskModal';
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Button from '../../components/common/Button';
import taskService from '../../services/task.service';
import goalService from '../../services/goal.service';
import milestoneService from '../../services/milestone.service';
import { sampleTasks } from '../../data/task_data';
import { sampleGoals } from '../../data/goal_data';
import toast from 'react-hot-toast';

const PRIORITIES = ['All', 'Low', 'Medium', 'High', 'Critical'];
const CATEGORIES = ['All', 'Work', 'Learning', 'Personal', 'Career', 'Health'];

const TasksPage = () => {
  const [searchParams] = useSearchParams();
  const goalQuery = searchParams.get('goalId') || 'all';

  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // View Mode: 'list' | 'board' | 'compact'
  const [viewMode, setViewMode] = useState('list');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGoalId, setSelectedGoalId] = useState(goalQuery);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [standaloneOnly, setStandaloneOnly] = useState(false);

  // Bulk selection
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [detailTask, setDetailTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load goals & milestones for dropdowns
      let gList = sampleGoals;
      try {
        const gRes = await goalService.getGoals();
        if (gRes.data && gRes.data.length > 0) gList = gRes.data;
      } catch (err) {
        console.warn('Goals offline, using sample');
      }
      setGoals(gList);

      let mList = [];
      try {
        const mRes = await milestoneService.getMilestones();
        if (mRes.data) mList = mRes.data;
      } catch (err) {
        console.warn('Milestones offline');
      }
      setMilestones(mList);

      // Load tasks
      try {
        const tRes = await taskService.getTasks();
        if (tRes.data && tRes.data.length > 0) {
          setTasks(tRes.data);
        } else {
          setTasks(sampleTasks);
        }
      } catch (err) {
        console.warn('Tasks API offline, using sample tasks');
        setTasks(sampleTasks);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle Save (Create / Update)
  const handleSaveTask = async (data) => {
    try {
      if (editingTask) {
        const id = editingTask._id || editingTask.id;
        try {
          const res = await taskService.updateTask(id, data);
          setTasks((prev) => prev.map((t) => ((t._id || t.id) === id ? res.data : t)));
          toast.success('Task updated');
        } catch {
          setTasks((prev) =>
            prev.map((t) =>
              (t._id || t.id) === id
                ? {
                    ...t,
                    ...data,
                    goalId: goals.find((g) => (g._id || g.id) === data.goalId) || null,
                    milestoneId: milestones.find((m) => (m._id || m.id) === data.milestoneId) || null,
                  }
                : t
            )
          );
          toast.success('Task updated locally');
        }
      } else {
        try {
          const res = await taskService.createTask(data);
          setTasks((prev) => [res.data, ...prev]);
          toast.success('Task created');
        } catch {
          const newT = {
            _id: `task_${Date.now()}`,
            id: `task_${Date.now()}`,
            ...data,
            goalId: goals.find((g) => (g._id || g.id) === data.goalId) || null,
            milestoneId: milestones.find((m) => (m._id || m.id) === data.milestoneId) || null,
          };
          setTasks((prev) => [newT, ...prev]);
          toast.success('Task created locally');
        }
      }
      setEditingTask(null);
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  // Toggle Complete
  const handleToggleComplete = async (task) => {
    const id = task._id || task.id;
    try {
      await taskService.toggleComplete(id);
    } catch {
      // Local fallback
    }

    const nextStatus = task.status === 'Completed' ? 'Todo' : 'Completed';
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, status: nextStatus } : t))
    );
    if (detailTask && (detailTask._id || detailTask.id) === id) {
      setDetailTask((prev) => ({ ...prev, status: nextStatus }));
    }
    toast.success(nextStatus === 'Completed' ? 'Task completed!' : 'Task reopened');
  };

  // Move status (for Kanban board columns)
  const handleMoveStatus = async (task, targetStatus) => {
    const id = task._id || task.id;
    try {
      await taskService.updateTask(id, { status: targetStatus });
    } catch {
      // Local fallback
    }
    setTasks((prev) =>
      prev.map((t) => ((t._id || t.id) === id ? { ...t, status: targetStatus } : t))
    );
    toast.success(`Moved to ${targetStatus}`);
  };

  // Toggle checklist item
  const handleToggleChecklistItem = async (task, itemId, isCompleted) => {
    const taskId = task._id || task.id;
    try {
      await taskService.toggleChecklistItem(taskId, itemId, isCompleted);
    } catch {
      // Local fallback
    }

    setTasks((prev) =>
      prev.map((t) => {
        if ((t._id || t.id) === taskId) {
          const nextChecklist = (t.checklist || []).map((c) =>
            (c._id || c.text) === itemId ? { ...c, isCompleted } : c
          );
          return { ...t, checklist: nextChecklist };
        }
        return t;
      })
    );

    if (detailTask && (detailTask._id || detailTask.id) === taskId) {
      setDetailTask((prev) => ({
        ...prev,
        checklist: (prev.checklist || []).map((c) =>
          (c._id || c.text) === itemId ? { ...c, isCompleted } : c
        ),
      }));
    }
  };

  // Duplicate task
  const handleDuplicate = async (task) => {
    const duplicated = {
      ...task,
      _id: `task_${Date.now()}`,
      id: `task_${Date.now()}`,
      title: `${task.title} (Copy)`,
      status: 'Todo',
      completedAt: null,
    };
    try {
      await taskService.createTask(duplicated);
    } catch {
      // Local fallback
    }
    setTasks((prev) => [duplicated, ...prev]);
    toast.success('Task duplicated');
  };

  // Delete task confirm
  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      const id = deletingTask._id || deletingTask.id;
      try {
        await taskService.deleteTask(id);
      } catch {
        // Local removal
      }
      setTasks((prev) => prev.filter((t) => (t._id || t.id) !== id));
      if (detailTask && (detailTask._id || detailTask.id) === id) {
        setDetailTask(null);
      }
      toast.success('Task deleted');
      setDeletingTask(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Multi-select bulk actions
  const handleToggleSelectTask = (task, isChecked) => {
    const id = task._id || task.id;
    if (isChecked) {
      setSelectedTaskIds([...selectedTaskIds, id]);
    } else {
      setSelectedTaskIds(selectedTaskIds.filter((tid) => tid !== id));
    }
  };

  const handleBulkComplete = async () => {
    try {
      await taskService.bulkAction(selectedTaskIds, 'complete');
    } catch {
      // Local fallback
    }
    setTasks((prev) =>
      prev.map((t) => (selectedTaskIds.includes(t._id || t.id) ? { ...t, status: 'Completed' } : t))
    );
    toast.success(`Marked ${selectedTaskIds.length} tasks completed`);
    setSelectedTaskIds([]);
  };

  const handleBulkDelete = async () => {
    try {
      await taskService.bulkAction(selectedTaskIds, 'delete');
    } catch {
      // Local fallback
    }
    setTasks((prev) => prev.filter((t) => !selectedTaskIds.includes(t._id || t.id)));
    toast.success(`Deleted ${selectedTaskIds.length} tasks`);
    setSelectedTaskIds([]);
  };

  // Filtering calculation
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const isStandalone = !t.goalId && !t.goalTitle;
    if (standaloneOnly && !isStandalone) return false;

    const gId = t.goalId?._id || t.goalId?.id || t.goalId;
    const matchesGoal = selectedGoalId === 'all' || gId === selectedGoalId;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;

    return matchesSearch && matchesGoal && matchesStatus && matchesPriority && matchesCategory;
  });

  // Kanban column buckets
  const todoTasks = filteredTasks.filter((t) => t.status === 'Todo');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  // Stats
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;
  const todoCount = tasks.filter((t) => t.status === 'Todo').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Task Management</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize goal-associated work and independent daily tasks
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'list'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('board')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'board'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board View"
            >
              <Columns3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('compact')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'compact'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Compact Dense View"
            >
              <AlignJustify className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setEditingTask(null);
              setIsModalOpen(true);
            }}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-400">Total Tasks</span>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-slate-600">To Do</span>
          <p className="text-xl font-bold text-slate-700 mt-1">{todoCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-blue-600">In Progress</span>
          <p className="text-xl font-bold text-blue-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold uppercase text-emerald-600">Completed</span>
          <p className="text-xl font-bold text-emerald-700 mt-1">{completedCount}</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks, descriptions, or tags..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>

          {/* Selectors */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Standalone Filter Button */}
            <button
              onClick={() => setStandaloneOnly(!standaloneOnly)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
                standaloneOnly
                  ? 'bg-blue-50 border-blue-200 text-blue-700'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Independent Only
            </button>

            {/* Goal Filter */}
            <select
              value={selectedGoalId}
              disabled={standaloneOnly}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[160px] truncate disabled:opacity-50"
            >
              <option value="all">All Goals</option>
              {goals.map((g) => (
                <option key={g._id || g.id} value={g._id || g.id}>
                  {g.title}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
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

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.slice(1).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Tabs (List & Compact views) */}
        {viewMode !== 'board' && (
          <div className="flex items-center gap-1.5 pt-1 text-xs overflow-x-auto">
            {['All', 'Todo', 'In Progress', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedStatus === status
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk Selection Bar (appears when 1 or more tasks selected) */}
      {selectedTaskIds.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs animate-in fade-in slide-in-from-top-1 duration-150">
          <span className="font-semibold text-blue-900">
            {selectedTaskIds.length} tasks selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkComplete}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition"
            >
              Mark Completed
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedTaskIds([])}
              className="px-2.5 py-1.5 text-slate-600 hover:text-slate-800"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main View Render */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckSquare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Tasks Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            {searchQuery || selectedStatus !== 'All' || selectedPriority !== 'All'
              ? 'No tasks match your current filters. Try resetting search or filter options.'
              : 'Add your first task to start tracking daily productivity or goal milestones.'}
          </p>
          <div className="mt-5">
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
            >
              Create First Task
            </Button>
          </div>
        </div>
      ) : viewMode === 'board' ? (
        /* Board View (Kanban 3 Columns) */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {/* Column 1: Todo */}
          <div className="bg-slate-100/70 p-3.5 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                To Do
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                {todoTasks.length}
              </span>
            </div>
            <div className="space-y-2.5 min-h-[150px]">
              {todoTasks.map((t) => (
                <TaskCard
                  key={t._id || t.id}
                  task={t}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onDelete={(task) => setDeletingTask(task)}
                  onOpenDetails={(task) => setDetailTask(task)}
                  onMoveStatus={handleMoveStatus}
                />
              ))}
            </div>
          </div>

          {/* Column 2: In Progress */}
          <div className="bg-blue-50/50 p-3.5 rounded-2xl border border-blue-200/60 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-xs uppercase tracking-wider text-blue-900">
                In Progress
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                {inProgressTasks.length}
              </span>
            </div>
            <div className="space-y-2.5 min-h-[150px]">
              {inProgressTasks.map((t) => (
                <TaskCard
                  key={t._id || t.id}
                  task={t}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onDelete={(task) => setDeletingTask(task)}
                  onOpenDetails={(task) => setDetailTask(task)}
                  onMoveStatus={handleMoveStatus}
                />
              ))}
            </div>
          </div>

          {/* Column 3: Completed */}
          <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-200/60 space-y-3">
            <div className="flex items-center justify-between pb-1">
              <span className="font-bold text-xs uppercase tracking-wider text-emerald-900">
                Completed
              </span>
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                {completedTasks.length}
              </span>
            </div>
            <div className="space-y-2.5 min-h-[150px]">
              {completedTasks.map((t) => (
                <TaskCard
                  key={t._id || t.id}
                  task={t}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(task) => {
                    setEditingTask(task);
                    setIsModalOpen(true);
                  }}
                  onDelete={(task) => setDeletingTask(task)}
                  onOpenDetails={(task) => setDetailTask(task)}
                  onMoveStatus={handleMoveStatus}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* List & Compact Views */
        <div className="space-y-2">
          {filteredTasks.map((task) => (
            <TaskItem
              key={task._id || task.id}
              task={task}
              compact={viewMode === 'compact'}
              isSelected={selectedTaskIds.includes(task._id || task.id)}
              onToggleSelect={handleToggleSelectTask}
              onToggleComplete={handleToggleComplete}
              onEdit={(t) => {
                setEditingTask(t);
                setIsModalOpen(true);
              }}
              onDelete={(t) => setDeletingTask(t)}
              onDuplicate={handleDuplicate}
              onOpenDetails={(t) => setDetailTask(t)}
            />
          ))}
        </div>
      )}

      {/* Task Create / Edit Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveTask}
        editingTask={editingTask}
        goals={goals}
        milestones={milestones}
        defaultGoalId={selectedGoalId !== 'all' ? selectedGoalId : ''}
      />

      {/* Task Inline Slide-Over Drawer */}
      <TaskDetailDrawer
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        onToggleComplete={handleToggleComplete}
        onToggleChecklistItem={handleToggleChecklistItem}
        onEdit={(t) => {
          setEditingTask(t);
          setIsModalOpen(true);
        }}
        onDelete={(t) => setDeletingTask(t)}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        message={`Are you sure you want to delete "${deletingTask?.title}"? This cannot be undone.`}
        confirmText="Delete Task"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default TasksPage;
