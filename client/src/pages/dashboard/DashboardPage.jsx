import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Target,
  CheckSquare,
  Calendar,
  Trophy,
  ArrowRight,
  Plus,
  Clock,
  Sparkles,
  TrendingUp,
  Flame,
  CheckCircle2,
  Circle,
  AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import taskService from '../../services/task.service';
import goalService from '../../services/goal.service';
import achievementService from '../../services/achievement.service';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import TaskModal from '../../components/tasks/TaskModal';

const DashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  // Data states
  const [todayTasks, setTodayTasks] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [userRewards, setUserRewards] = useState({ xp: 120, level: 2, streakDays: 3 });

  // Quick Task Input
  const [quickTitle, setQuickTitle] = useState('');
  const [creatingQuick, setCreatingQuick] = useState(false);

  // Modal State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);

  // Load Dashboard Data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayRes, upcomingRes, goalsRes, rewardsRes] = await Promise.allSettled([
        taskService.getMyDayTasks(),
        taskService.getUpcomingTasks(7),
        goalService.getGoals({ status: 'In Progress', limit: 4 }),
        achievementService.getUserAchievements(),
      ]);

      if (todayRes.status === 'fulfilled' && todayRes.value) {
        setTodayTasks(Array.isArray(todayRes.value) ? todayRes.value : todayRes.value.tasks || []);
      }
      if (upcomingRes.status === 'fulfilled' && upcomingRes.value) {
        setUpcomingTasks(Array.isArray(upcomingRes.value) ? upcomingRes.value : upcomingRes.value.tasks || []);
      }
      if (goalsRes.status === 'fulfilled' && goalsRes.value) {
        setActiveGoals(Array.isArray(goalsRes.value) ? goalsRes.value : goalsRes.value.goals || []);
      }
      if (rewardsRes.status === 'fulfilled' && rewardsRes.value) {
        setUserRewards({
          xp: rewardsRes.value.xp ?? 120,
          level: rewardsRes.value.level ?? 2,
          streakDays: rewardsRes.value.streakDays ?? 3,
        });
      }
    } catch (err) {
      console.warn('Dashboard data fetch partial failure:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Quick Add Task directly into Today / Inbox
  const handleQuickAdd = async (e) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    setCreatingQuick(true);
    try {
      const newTask = await taskService.createTask({
        title: quickTitle.trim(),
        priority: 'Medium',
        status: 'Todo',
        dueDate: new Date().toISOString(),
      });
      setTodayTasks((prev) => [newTask, ...prev]);
      setQuickTitle('');
      toast.success('Task created for today!');
    } catch (err) {
      toast.error('Failed to create task');
    } finally {
      setCreatingQuick(false);
    }
  };

  // Toggle task complete
  const handleToggleTask = async (task) => {
    const newStatus = task.status === 'Done' ? 'Todo' : 'Done';
    try {
      const updated = await taskService.updateTask(task._id, { status: newStatus });
      setTodayTasks((prev) => prev.map((t) => (t._id === task._id ? updated : t)));
      toast.success(newStatus === 'Done' ? 'Task completed! +10 XP' : 'Task marked as todo');
    } catch (err) {
      toast.error('Failed to update task status');
    }
  };

  // Calculated Stats
  const completedTodayCount = todayTasks.filter((t) => t.status === 'Done').length;
  const todayProgress = todayTasks.length > 0 ? Math.round((completedTodayCount / todayTasks.length) * 100) : 0;

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Welcome & Command Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-xs flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400/20 text-amber-200 border border-amber-300/30 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                {userRewards.streakDays} Day Streak!
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}!
            </h1>
            <p className="text-sm text-indigo-100 max-w-xl">
              You have {todayTasks.length - completedTodayCount} tasks pending for today. Let's make meaningful progress on your milestones!
            </p>
          </div>

          {/* Banner Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="white"
              size="sm"
              onClick={() => setIsTaskModalOpen(true)}
              className="bg-white text-indigo-900 hover:bg-slate-50 font-bold shadow-sm"
            >
              <Plus className="w-4 h-4 mr-1 text-indigo-600" />
              New Task
            </Button>
            <Link to="/goals">
              <Button
                variant="secondary"
                size="sm"
                className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-xs font-semibold"
              >
                <Target className="w-4 h-4 mr-1" />
                Goals
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient Decorative Background Elements */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -top-10 w-48 h-48 bg-indigo-400/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Top 4 Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Focus Card */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">My Day Focus</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Sun className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900">
              {completedTodayCount} <span className="text-sm font-normal text-slate-500">/ {todayTasks.length} Done</span>
            </p>
            <span className="text-xs font-bold text-amber-600">{todayProgress}%</span>
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={todayProgress} height="h-1.5" color="bg-amber-500" />
          </div>
        </Card>

        {/* Active Goals Card */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Goals</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900">{activeGoals.length}</p>
            <Link to="/goals" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-0.5">
              Explore <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-2.5 truncate">
            {activeGoals.length > 0 ? `${activeGoals[0].title}` : 'Ready for your next ambition'}
          </p>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Upcoming (7 Days)</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900">{upcomingTasks.length}</p>
            <Link to="/upcoming" className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-0.5">
              Timeline <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-2.5">Scheduled milestones & tasks</p>
        </Card>

        {/* XP Level & Rewards */}
        <Card className="p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rewards & Level</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Trophy className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <p className="text-2xl font-bold text-slate-900">Level {userRewards.level}</p>
            <span className="text-xs font-bold text-purple-600">{userRewards.xp} XP</span>
          </div>
          <div className="mt-2.5">
            <ProgressBar progress={Math.min(100, (userRewards.xp % 100))} height="h-1.5" color="bg-purple-600" />
          </div>
        </Card>
      </div>

      {/* Main Grid: My Day Focus vs Active Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Tasks & Quick Add */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-slate-900 text-base">Today's Focus</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  {todayTasks.length} items
                </span>
              </div>
              <Link to="/my-day" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                Open My Day <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Quick Add Input Bar */}
            <form onSubmit={handleQuickAdd} className="mb-4">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white transition-all">
                <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Quick add a task for today (Press Enter)..."
                  value={quickTitle}
                  onChange={(e) => setQuickTitle(e.target.value)}
                  className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <Button
                  type="submit"
                  size="xs"
                  variant="primary"
                  loading={creatingQuick}
                  disabled={!quickTitle.trim()}
                >
                  Add
                </Button>
              </div>
            </form>

            {/* Today's Tasks List */}
            <div className="divide-y divide-slate-100">
              {todayTasks.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-2 opacity-80" />
                  No tasks scheduled for today yet. Add a quick task above or explore your goals!
                </div>
              ) : (
                todayTasks.slice(0, 5).map((task) => {
                  const isDone = task.status === 'Done';
                  return (
                    <div
                      key={task._id}
                      className="py-3 flex items-center justify-between gap-3 group hover:bg-slate-50/60 px-2 rounded-lg transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => handleToggleTask(task)}
                          className={`w-5 h-5 rounded-full flex items-center justify-center transition shrink-0 ${
                            isDone ? 'bg-emerald-500 text-white' : 'border border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                        </button>
                        <div className="truncate">
                          <p
                            className={`text-sm font-medium truncate ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                            {task.goalId?.title && (
                              <span className="text-blue-600 font-medium">{task.goalId.title}</span>
                            )}
                            {task.dueDate && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {format(new Date(task.dueDate), 'h:mm a')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <Badge priority={task.priority} size="xs" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Upcoming Horizon Preview */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">Next in Queue</h3>
              </div>
              <Link to="/upcoming" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                View All Upcoming <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {upcomingTasks.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No upcoming tasks scheduled for the next 7 days.</p>
              ) : (
                upcomingTasks.slice(0, 4).map((task) => (
                  <div key={task._id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="font-medium text-slate-800 truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 text-slate-400">
                      <span>{task.dueDate ? format(new Date(task.dueDate), 'EEE, MMM d') : 'Flexible'}</span>
                      <Badge priority={task.priority} size="xs" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column (1 Col): Active Goals & Architecture Blueprint */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-base">Active Goals</h3>
              </div>
              <Link to="/goals" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              {activeGoals.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  <Target className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                  No goals in progress. Create your first goal to unlock structured milestone tracking!
                  <div className="mt-3">
                    <Link to="/goals">
                      <Button size="xs" variant="primary">Create Goal</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                activeGoals.map((goal) => (
                  <div key={goal._id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: goal.color || '#3b82f6' }} />
                        <h4 className="text-xs font-bold text-slate-800 truncate">{goal.title}</h4>
                      </div>
                      <span className="text-xs font-bold text-slate-700 shrink-0">{goal.progress || 0}%</span>
                    </div>
                    <div className="mt-2">
                      <ProgressBar progress={goal.progress || 0} height="h-1.5" color="bg-blue-600" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <Badge size="xs" variant="default">{goal.category}</Badge>
                      {goal.targetDate && (
                        <span>Target: {format(new Date(goal.targetDate), 'MMM yyyy')}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Quick Navigation Cards */}
          <Card className="p-5 bg-gradient-to-br from-slate-900 to-indigo-950 text-white">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300">Hierarchy Flow</h4>
            <p className="text-sm font-semibold mt-1">Goal &rarr; Milestone &rarr; Task</p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Every completed task recalculates milestone progress automatically, cascading upwards to complete goals.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <Link to="/milestones" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-center text-xs font-medium transition">
                Milestones
              </Link>
              <Link to="/analytics" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-center text-xs font-medium transition">
                Analytics
              </Link>
            </div>
          </Card>
        </div>
      </div>

      {/* Global Task Creation Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={() => {
          setIsTaskModalOpen(false);
          loadDashboardData();
        }}
      />
    </div>
  );
};

export default DashboardPage;
