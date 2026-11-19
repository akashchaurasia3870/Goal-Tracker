import React from 'react';
import { format, isToday } from 'date-fns';
import { Target, Milestone, Clock, Calendar, CheckSquare, Plus } from 'lucide-react';
import Badge from '../common/Badge';
import TaskItem from '../tasks/TaskItem';

const DayView = ({
  currentDate,
  tasks = [],
  goals = [],
  milestones = [],
  onDayClick,
  onTaskClick,
  onToggleComplete,
}) => {
  const isCurrentDay = isToday(currentDate);

  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  const dayTasks = tasks.filter(
    (t) => t.dueDate && format(new Date(t.dueDate), 'yyyy-MM-dd') === formattedDate
  );
  const dayGoals = goals.filter(
    (g) => g.targetDate && format(new Date(g.targetDate), 'yyyy-MM-dd') === formattedDate
  );
  const dayMilestones = milestones.filter(
    (m) => m.dueDate && format(new Date(m.dueDate), 'yyyy-MM-dd') === formattedDate
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Day Title & Action */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {format(currentDate, 'EEEE')}
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">
            {format(currentDate, 'MMMM d, yyyy')}
          </h3>
        </div>

        <button
          onClick={() => onDayClick(currentDate)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add Task for Today</span>
        </button>
      </div>

      {/* Deadlines Section (if goals or milestones finish today) */}
      {(dayGoals.length > 0 || dayMilestones.length > 0) && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Strategic Deadlines Scheduled Today
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {dayGoals.map((g) => (
              <div
                key={g._id || g.id}
                className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs flex items-center gap-2.5 text-blue-900"
              >
                <Target className="w-4 h-4 text-blue-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold block truncate">{g.title}</span>
                  <span className="text-[10px] text-blue-700">Goal Target Deadline</span>
                </div>
              </div>
            ))}

            {dayMilestones.map((m) => (
              <div
                key={m._id || m.id}
                className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs flex items-center gap-2.5 text-indigo-900"
              >
                <Milestone className="w-4 h-4 text-indigo-600 shrink-0" />
                <div className="truncate">
                  <span className="font-bold block truncate">{m.title}</span>
                  <span className="text-[10px] text-indigo-700">Milestone Stage Deadline</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tasks Scheduled for this Day ({dayTasks.length})
          </span>
        </div>

        {dayTasks.length === 0 ? (
          <div className="py-12 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50">
            <CheckSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No tasks due on this date</h4>
            <p className="text-xs text-slate-500 mt-1">
              Click the button above to schedule work or click anywhere on the calendar.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayTasks.map((task) => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onOpenDetails={onTaskClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DayView;
