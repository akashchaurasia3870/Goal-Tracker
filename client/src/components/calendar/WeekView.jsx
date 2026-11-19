import React from 'react';
import {
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameDay,
  isToday,
} from 'date-fns';
import { Plus, Target, Milestone, Check, Clock } from 'lucide-react';
import Badge from '../common/Badge';

const WeekView = ({
  currentDate,
  tasks = [],
  goals = [],
  milestones = [],
  onDayClick,
  onTaskClick,
}) => {
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
  const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {days.map((day) => {
        const isCurrentDay = isToday(day);
        const dayTasks = tasks.filter((t) => t.dueDate && isSameDay(new Date(t.dueDate), day));
        const dayGoals = goals.filter((g) => g.targetDate && isSameDay(new Date(g.targetDate), day));
        const dayMilestones = milestones.filter(
          (m) => m.dueDate && isSameDay(new Date(m.dueDate), day)
        );

        return (
          <div
            key={day.toISOString()}
            className={`bg-white rounded-2xl border p-3 flex flex-col min-h-[300px] shadow-xs ${
              isCurrentDay ? 'border-blue-300 ring-2 ring-blue-100' : 'border-slate-200'
            }`}
          >
            {/* Day Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={`text-base font-bold ${
                    isCurrentDay ? 'text-blue-600' : 'text-slate-800'
                  }`}
                >
                  {format(day, 'MMM d')}
                </span>
              </div>

              <button
                type="button"
                onClick={() => onDayClick(day)}
                className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-slate-50 transition"
                title="Add task"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* List of Deadlines and Tasks */}
            <div className="space-y-2 flex-1 overflow-y-auto">
              {/* Goal Deadlines */}
              {dayGoals.map((g) => (
                <div
                  key={g._id || g.id}
                  className="p-2 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-900 space-y-0.5"
                >
                  <div className="flex items-center gap-1 font-bold text-[10px] text-blue-700 uppercase">
                    <Target className="w-3 h-3" />
                    <span>Goal Target</span>
                  </div>
                  <p className="font-semibold truncate">{g.title}</p>
                </div>
              ))}

              {/* Milestone Deadlines */}
              {dayMilestones.map((m) => (
                <div
                  key={m._id || m.id}
                  className="p-2 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-0.5"
                >
                  <div className="flex items-center gap-1 font-bold text-[10px] text-indigo-700 uppercase">
                    <Milestone className="w-3 h-3" />
                    <span>Milestone Deadline</span>
                  </div>
                  <p className="font-semibold truncate">{m.title}</p>
                </div>
              ))}

              {/* Tasks */}
              {dayTasks.map((t) => {
                const isDone = t.status === 'Completed';
                return (
                  <div
                    key={t._id || t.id}
                    onClick={() => onTaskClick(t)}
                    className={`p-2.5 rounded-xl border text-xs cursor-pointer transition space-y-1.5 ${
                      isDone
                        ? 'border-slate-200 bg-slate-50 opacity-60 line-through'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <Badge priority={t.priority} size="xs" />
                      <span className="text-[10px] font-semibold text-slate-400">
                        {t.category}
                      </span>
                    </div>
                    <p className="font-medium text-slate-800 leading-snug">{t.title}</p>
                  </div>
                );
              })}

              {dayTasks.length === 0 && dayGoals.length === 0 && dayMilestones.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-300 italic">No tasks</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;
