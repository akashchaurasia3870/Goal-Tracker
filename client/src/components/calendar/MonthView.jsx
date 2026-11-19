import React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { Plus, Target, Milestone, Check } from 'lucide-react';

const priorityColorMap = {
  Critical: 'bg-red-500',
  High: 'bg-amber-500',
  Medium: 'bg-blue-500',
  Low: 'bg-slate-400',
};

const MonthView = ({
  currentDate,
  tasks = [],
  goals = [],
  milestones = [],
  onDayClick,
  onTaskClick,
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDayHeaders = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Weekday Column Headers */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center text-xs font-bold uppercase tracking-wider text-slate-500 py-2.5">
        {weekDayHeaders.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 auto-rows-[minmax(110px,auto)] divide-x divide-y divide-slate-100">
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          // Find tasks for this day
          const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));
          // Find goals with target date on this day
          const dayGoals = goals.filter((g) => g.targetDate && isSameDay(new Date(g.targetDate), day));
          // Find milestones with due date on this day
          const dayMilestones = milestones.filter(
            (m) => m.dueDate && isSameDay(new Date(m.dueDate), day)
          );

          return (
            <div
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`p-1.5 sm:p-2 flex flex-col justify-between group transition cursor-pointer min-h-[110px] ${
                !isCurrentMonth ? 'bg-slate-50/50 text-slate-300' : 'bg-white hover:bg-slate-50/70'
              }`}
            >
              {/* Day Header & Plus Button */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                    isCurrentDay
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isCurrentMonth
                      ? 'text-slate-800'
                      : 'text-slate-400'
                  }`}
                >
                  {format(day, 'd')}
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDayClick(day);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-600 transition"
                  title="Add task on this day"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Items in this Day */}
              <div className="space-y-1 flex-1 overflow-hidden">
                {/* Goal Deadlines */}
                {dayGoals.map((g) => (
                  <div
                    key={g._id || g.id}
                    className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 truncate"
                    title={`Goal Target: ${g.title}`}
                  >
                    <Target className="w-2.5 h-2.5 shrink-0 text-blue-600" />
                    <span className="truncate">{g.title}</span>
                  </div>
                ))}

                {/* Milestone Deadlines */}
                {dayMilestones.map((m) => (
                  <div
                    key={m._id || m.id}
                    className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800 truncate"
                    title={`Milestone Deadline: ${m.title}`}
                  >
                    <Milestone className="w-2.5 h-2.5 shrink-0 text-indigo-600" />
                    <span className="truncate">{m.title}</span>
                  </div>
                ))}

                {/* Tasks Due on this day */}
                {dayTasks.slice(0, 3).map((t) => {
                  const isDone = t.status === 'Completed';
                  const dotColor = priorityColorMap[t.priority] || 'bg-blue-500';

                  return (
                    <div
                      key={t._id || t.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(t);
                      }}
                      className={`flex items-center gap-1.5 text-[11px] px-1.5 py-0.5 rounded transition truncate cursor-pointer ${
                        isDone
                          ? 'bg-slate-100 text-slate-400 line-through'
                          : 'bg-slate-50 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                      <span className="truncate">{t.title}</span>
                    </div>
                  );
                })}

                {dayTasks.length > 3 && (
                  <span className="text-[10px] font-semibold text-slate-400 block px-1">
                    +{dayTasks.length - 3} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
