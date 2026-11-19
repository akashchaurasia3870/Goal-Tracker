import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
} from 'lucide-react';
import MonthView from '../../components/calendar/MonthView';
import WeekView from '../../components/calendar/WeekView';
import DayView from '../../components/calendar/DayView';
import TaskModal from '../../components/tasks/TaskModal';
import TaskDetailDrawer from '../../components/tasks/TaskDetailDrawer';
import Button from '../../components/common/Button';
import calendarService from '../../services/calendar.service';
import taskService from '../../services/task.service';
import goalService from '../../services/goal.service';
import milestoneService from '../../services/milestone.service';
import { sampleTasks } from '../../data/task_data';
import { sampleGoals } from '../../data/goal_data';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Work', 'Learning', 'Personal', 'Career', 'Health'];

const CalendarPage = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState('month'); // 'month' | 'week' | 'day'

  // Data states
  const [tasks, setTasks] = useState([]);
  const [goals, setGoals] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedGoalId, setSelectedGoalId] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [prefilledDate, setPrefilledDate] = useState('');
  const [detailTask, setDetailTask] = useState(null);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      try {
        const res = await calendarService.getEvents();
        if (res.data) {
          setTasks(res.data.tasks || []);
          setGoals(res.data.goals || []);
          setMilestones(res.data.milestones || []);
        }
      } catch (err) {
        // Fallback sample data
        setTasks(sampleTasks);
        setGoals(sampleGoals);
        const extractedM = sampleGoals.flatMap((g) =>
          (g.milestones || []).map((m) => ({
            ...m,
            goalId: { title: g.title, color: g.color },
            dueDate: g.targetDate,
          }))
        );
        setMilestones(extractedM);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  // Navigation handlers
  const handlePrev = () => {
    if (calendarView === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (calendarView === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subDays(currentDate, 1));
  };

  const handleNext = () => {
    if (calendarView === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (calendarView === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addDays(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Day click opens task modal prefilled with that date
  const handleDayClick = (dayDate) => {
    setPrefilledDate(format(dayDate, 'yyyy-MM-dd'));
    setIsModalOpen(true);
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
    if (detailTask && (detailTask._id || detailTask.id) === id) {
      setDetailTask((prev) => ({ ...prev, status: nextStatus }));
    }
    toast.success(nextStatus === 'Completed' ? 'Task completed!' : 'Task reopened');
  };

  // Filter items
  const filteredTasks = tasks.filter((t) => {
    const gId = t.goalId?._id || t.goalId?.id || t.goalId;
    const matchesGoal = selectedGoalId === 'all' || gId === selectedGoalId;
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    return matchesGoal && matchesCategory && matchesStatus;
  });

  const filteredGoals = goals.filter((g) => {
    const gId = g._id || g.id;
    return selectedGoalId === 'all' || gId === selectedGoalId;
  });

  const filteredMilestones = milestones.filter((m) => {
    const gId = m.goalId?._id || m.goalId?.id || m.goalId;
    return selectedGoalId === 'all' || gId === selectedGoalId;
  });

  // Title formatting according to active view
  let headerTitle = format(currentDate, 'MMMM yyyy');
  if (calendarView === 'week') {
    const startW = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endW = endOfWeek(currentDate, { weekStartsOn: 1 });
    headerTitle = `${format(startW, 'MMM d')} – ${format(endW, 'MMM d, yyyy')}`;
  } else if (calendarView === 'day') {
    headerTitle = format(currentDate, 'MMMM d, yyyy');
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calendar Planner</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Visualize deadlines, goal milestones, and daily tasks chronologically
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setCalendarView('month')}
              className={`px-3 py-1.5 rounded-md transition ${
                calendarView === 'month'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setCalendarView('week')}
              className={`px-3 py-1.5 rounded-md transition ${
                calendarView === 'week'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setCalendarView('day')}
              className={`px-3 py-1.5 rounded-md transition ${
                calendarView === 'day'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Day
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => {
              setPrefilledDate(format(new Date(), 'yyyy-MM-dd'));
              setIsModalOpen(true);
            }}
          >
            New Task
          </Button>
        </div>
      </div>

      {/* Date Navigation & Filters Toolbar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Date Jump Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            Today
          </button>
          <div className="flex items-center">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h3 className="font-bold text-slate-900 text-base sm:text-lg ml-1">
            {headerTitle}
          </h3>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Goal Filter */}
          <select
            value={selectedGoalId}
            onChange={(e) => setSelectedGoalId(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[170px] truncate"
          >
            <option value="all">All Goals</option>
            {goals.map((g) => (
              <option key={g._id || g.id} value={g._id || g.id}>
                {g.title}
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

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Todo">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Calendar View Body */}
      {calendarView === 'month' ? (
        <MonthView
          currentDate={currentDate}
          tasks={filteredTasks}
          goals={filteredGoals}
          milestones={filteredMilestones}
          onDayClick={handleDayClick}
          onTaskClick={(t) => setDetailTask(t)}
        />
      ) : calendarView === 'week' ? (
        <WeekView
          currentDate={currentDate}
          tasks={filteredTasks}
          goals={filteredGoals}
          milestones={filteredMilestones}
          onDayClick={handleDayClick}
          onTaskClick={(t) => setDetailTask(t)}
        />
      ) : (
        <DayView
          currentDate={currentDate}
          tasks={filteredTasks}
          goals={filteredGoals}
          milestones={filteredMilestones}
          onDayClick={handleDayClick}
          onTaskClick={(t) => setDetailTask(t)}
          onToggleComplete={handleToggleComplete}
        />
      )}

      {/* Task Creation Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setPrefilledDate('');
        }}
        onSave={async (data) => {
          try {
            const res = await taskService.createTask(data);
            setTasks((prev) => [res.data, ...prev]);
          } catch {
            const local = { _id: `task_${Date.now()}`, ...data };
            setTasks((prev) => [local, ...prev]);
          }
          toast.success('Task scheduled on calendar');
        }}
        goals={goals}
        milestones={milestones}
      />

      {/* Task Detail Drawer */}
      <TaskDetailDrawer
        isOpen={!!detailTask}
        onClose={() => setDetailTask(null)}
        task={detailTask}
        onToggleComplete={handleToggleComplete}
        onToggleChecklistItem={() => {}}
        onEdit={(t) => {
          setDetailTask(null);
          // Edit action
        }}
      />
    </div>
  );
};

export default CalendarPage;
