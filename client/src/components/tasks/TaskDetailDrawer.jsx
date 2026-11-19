import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  CheckCircle2,
  ListChecks,
  Target,
  Milestone,
  Edit,
  Trash2,
  Check,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';

const TaskDetailDrawer = ({
  isOpen,
  onClose,
  task,
  onToggleComplete,
  onToggleChecklistItem,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !task) return null;

  const isCompleted = task.status === 'Completed';
  const goalTitle = task.goalId?.title || task.goalTitle;
  const goalColor = task.goalId?.color || task.goalColor || '#3b82f6';
  const milestoneTitle = task.milestoneId?.title || task.milestoneTitle;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onToggleComplete(task)}
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                  isCompleted
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'border-slate-300 hover:border-blue-500 bg-white'
                }`}
              >
                {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </button>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Task Details
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(task);
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
                title="Edit task"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(task);
                }}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                title="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 p-5 overflow-y-auto space-y-5">
            {/* Hierarchy Context */}
            {goalTitle ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Associated Objective
                </span>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: goalColor }} />
                  <span>{goalTitle}</span>
                  {milestoneTitle && <span className="text-slate-400 font-normal">/ {milestoneTitle}</span>}
                </div>
              </div>
            ) : (
              <span className="inline-block text-[11px] font-bold uppercase text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Independent Task (No Goal Linked)
              </span>
            )}

            {/* Title & Description */}
            <div className="space-y-2">
              <h3
                className={`text-lg font-bold ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'
                }`}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                  {task.description}
                </p>
              )}
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Priority</span>
                <div>
                  <Badge priority={task.priority} size="xs" />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Status</span>
                <div>
                  <Badge status={task.status} size="xs" />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Due Date</span>
                <p className="font-semibold text-slate-800">
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'None'}
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-200 bg-white space-y-0.5">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Time</span>
                <p className="font-semibold text-slate-800">
                  {task.estimatedTime ? `${task.estimatedTime} mins` : 'Unspecified'}
                </p>
              </div>
            </div>

            {/* Subtasks Checklist (Interactive Inline) */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <ListChecks className="w-4 h-4 text-slate-400" />
                  <span>Subtasks Checklist ({task.checklist?.length || 0})</span>
                </h4>
              </div>

              {task.checklist && task.checklist.length > 0 ? (
                <div className="space-y-1.5">
                  {task.checklist.map((item) => (
                    <label
                      key={item._id || item.text}
                      className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 hover:bg-slate-100/70 border border-slate-200 text-xs cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={(e) => onToggleChecklistItem(task, item._id, e.target.checked)}
                        className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                      <span
                        className={`truncate ${
                          item.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 font-medium'
                        }`}
                      >
                        {item.text}
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No checklist items added.</p>
              )}
            </div>

            {/* Tags */}
            {task.tags && task.tags.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold uppercase text-slate-400">Tags</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {task.tags.map((t) => (
                    <span
                      key={t}
                      className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailDrawer;
