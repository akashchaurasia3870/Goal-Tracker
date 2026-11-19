import React, { useState, useRef, useEffect } from 'react';
import {
  Check,
  Calendar,
  Clock,
  Tag,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Sun,
  ListChecks,
  AlertCircle,
  Target,
} from 'lucide-react';
import Badge from '../common/Badge';

const TaskItem = ({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
  onDuplicate,
  onToggleMyDay,
  onOpenDetails,
  isSelected = false,
  onToggleSelect,
  compact = false,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const isCompleted = task.status === 'Completed';
  const isOverdue =
    !isCompleted && task.dueDate && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const goalTitle = task.goalId?.title || task.goalTitle;
  const goalColor = task.goalId?.color || task.goalColor || '#3b82f6';
  const milestoneTitle = task.milestoneId?.title || task.milestoneTitle;

  const totalChecklist = task.checklist?.length || 0;
  const completedChecklist = task.checklist?.filter((item) => item.isCompleted)?.length || 0;

  return (
    <div
      className={`group bg-white rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 ${
        compact ? 'p-2.5 text-xs' : 'p-3.5 sm:p-4 text-sm'
      } ${
        isCompleted
          ? 'border-slate-200 bg-slate-50/50 opacity-75'
          : isSelected
          ? 'border-blue-400 bg-blue-50/30 shadow-xs'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      {/* Left: Checkbox & Multi-select & Title */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {/* Multi-select box (visible on hover or when selected) */}
        {onToggleSelect && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onToggleSelect(task, e.target.checked)}
            className="w-3.5 h-3.5 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer hidden group-hover:block transition"
          />
        )}

        {/* Completion Checkbox Pill */}
        <button
          type="button"
          onClick={() => onToggleComplete(task)}
          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white'
              : 'border-slate-300 hover:border-blue-500 bg-white'
          }`}
          title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
        </button>

        {/* Task Title & Details */}
        <div
          className="space-y-0.5 flex-1 min-w-0 cursor-pointer"
          onClick={() => onOpenDetails && onOpenDetails(task)}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`font-medium truncate ${
                isCompleted ? 'text-slate-400 line-through' : 'text-slate-800'
              }`}
            >
              {task.title}
            </span>

            {/* Hierarchy Pill */}
            {goalTitle ? (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[140px]">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: goalColor }} />
                <span className="truncate">{goalTitle}</span>
                {milestoneTitle && <span className="text-slate-400 font-normal">/ {milestoneTitle}</span>}
              </span>
            ) : (
              <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                Independent
              </span>
            )}

            {/* Checklist progress badge */}
            {totalChecklist > 0 && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                <ListChecks className="w-3 h-3 text-slate-400" />
                <span>
                  {completedChecklist}/{totalChecklist}
                </span>
              </span>
            )}
          </div>

          {!compact && task.description && (
            <p className="text-xs text-slate-400 truncate max-w-xl">{task.description}</p>
          )}
        </div>
      </div>

      {/* Right: Priority, Due Date, Tags, Menu */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Badge priority={task.priority} size="xs" />

        {/* Due Date Indicator */}
        {task.dueDate && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-md ${
              isOverdue
                ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200'
                : 'text-slate-500'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span className="hidden sm:inline">
              {new Date(task.dueDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        )}

        {/* Menu Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-100 transition"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(task);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
              >
                <Edit className="w-3.5 h-3.5 text-slate-400" />
                <span>Edit Task</span>
              </button>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(task);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Duplicate</span>
              </button>

              {onToggleMyDay && (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onToggleMyDay(task);
                  }}
                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{task.isMyDay ? 'Remove from My Day' : 'Add to My Day'}</span>
                </button>
              )}

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(task);
                }}
                className="w-full text-left px-3 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
