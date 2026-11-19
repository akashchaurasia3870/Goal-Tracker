import React from 'react';
import {
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ListChecks,
  AlertCircle,
  ArrowRight,
  MoreVertical,
} from 'lucide-react';
import Badge from '../common/Badge';

const TaskCard = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onOpenDetails,
  onMoveStatus,
}) => {
  const isCompleted = task.status === 'Completed';
  const isOverdue =
    !isCompleted && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const goalTitle = task.goalId?.title || task.goalTitle;
  const goalColor = task.goalId?.color || task.goalColor || '#3b82f6';
  const milestoneTitle = task.milestoneId?.title || task.milestoneTitle;

  const totalChecklist = task.checklist?.length || 0;
  const completedChecklist = task.checklist?.filter((i) => i.isCompleted)?.length || 0;

  return (
    <div
      className={`bg-white rounded-xl border p-3.5 space-y-3 transition-all duration-150 shadow-xs hover:border-slate-300 hover:shadow-sm ${
        isCompleted ? 'border-slate-200 bg-slate-50/50 opacity-80' : 'border-slate-200'
      }`}
    >
      {/* Top Row: Goal / Milestone pill & Priority Badge */}
      <div className="flex items-center justify-between gap-1.5">
        {goalTitle ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[170px]">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: goalColor }} />
            <span className="truncate">{goalTitle}</span>
          </span>
        ) : (
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
            Independent
          </span>
        )}
        <Badge priority={task.priority} size="xs" />
      </div>

      {/* Title & Description */}
      <div className="cursor-pointer space-y-1" onClick={() => onOpenDetails(task)}>
        <h4
          className={`font-semibold text-sm leading-snug ${
            isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 hover:text-blue-600 transition'
          }`}
        >
          {task.title}
        </h4>
        {task.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{task.description}</p>
        )}
      </div>

      {/* Checklist Progress Bar (if items exist) */}
      {totalChecklist > 0 && (
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ListChecks className="w-3 h-3 text-slate-400" />
              <span>Subtasks</span>
            </span>
            <span className="font-semibold text-slate-700">
              {completedChecklist}/{totalChecklist}
            </span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
            <div
              className="bg-blue-600 h-1 rounded-full transition-all"
              style={{ width: `${Math.round((completedChecklist / totalChecklist) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: Due Date & Quick Status Controls */}
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        {task.dueDate ? (
          <div
            className={`flex items-center gap-1 text-[11px] ${
              isOverdue ? 'text-rose-600 font-semibold' : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400">No due date</span>
        )}

        {/* Quick Transition Action */}
        <div className="flex items-center gap-1">
          {task.status !== 'In Progress' && task.status !== 'Completed' && (
            <button
              onClick={() => onMoveStatus(task, 'In Progress')}
              className="px-2 py-0.5 text-[11px] font-medium text-blue-600 hover:bg-blue-50 rounded transition"
            >
              Start &rarr;
            </button>
          )}

          <button
            onClick={() => onToggleComplete(task)}
            className={`p-1 rounded-md transition ${
              isCompleted
                ? 'text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
            title={isCompleted ? 'Reopen task' : 'Mark task complete'}
          >
            <Check className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
