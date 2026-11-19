import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  CheckCircle2,
  RotateCcw,
  Gift,
  MoreVertical,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown,
  Check,
  Target,
} from 'lucide-react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';

const MilestoneCard = ({
  milestone,
  onComplete,
  onReopen,
  onEdit,
  onDelete,
  onReorder,
  canMoveUp = false,
  canMoveDown = false,
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

  const isCompleted = milestone.status === 'Completed';
  const goalTitle = milestone.goalId?.title || milestone.goalTitle || 'Parent Goal';
  const goalColor = milestone.goalId?.color || milestone.goalColor || '#3b82f6';

  return (
    <div
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden shadow-xs hover:shadow-sm ${
        isCompleted
          ? 'border-emerald-200 bg-emerald-50/10'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Section: Reorder, Order Tag, Title, Parent Goal, Priority */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {/* Reorder Buttons & Index */}
          <div className="flex flex-col items-center justify-center shrink-0 text-slate-400 bg-slate-50 border border-slate-200 rounded-lg p-1">
            <button
              onClick={() => onReorder(milestone, 'up')}
              disabled={!canMoveUp}
              className="p-0.5 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400"
              title="Move stage up"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-bold font-mono text-slate-600 px-1">
              #{milestone.order || 1}
            </span>
            <button
              onClick={() => onReorder(milestone, 'down')}
              disabled={!canMoveDown}
              className="p-0.5 hover:text-slate-800 disabled:opacity-20 disabled:hover:text-slate-400"
              title="Move stage down"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 flex-1 min-w-0">
            {/* Parent Goal Pill & Badges */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: goalColor }} />
                <span className="truncate max-w-[150px]">{goalTitle}</span>
              </span>
              <Badge priority={milestone.priority} size="xs" />
              <Badge status={milestone.status} size="xs" />
            </div>

            {/* Title & Description */}
            <h4
              className={`font-bold text-sm sm:text-base leading-snug truncate ${
                isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'
              }`}
            >
              {milestone.title}
            </h4>

            {milestone.description && (
              <p className="text-xs text-slate-500 line-clamp-1">{milestone.description}</p>
            )}

            {/* Reward Pill (if any) */}
            {milestone.reward && (
              <div className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Gift className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-medium text-[11px]">
                  Reward: {milestone.reward}{' '}
                  {milestone.rewardClaimed && (
                    <span className="text-emerald-700 font-bold">(Claimed)</span>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Progress, Due Date, Actions */}
        <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
          {/* Progress & Task Counts */}
          <div className="w-36 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                {milestone.completedTasksCount || 0}/{milestone.tasksCount || 0} tasks
              </span>
              <span className="font-bold text-slate-800 text-xs">
                {milestone.progress || 0}%
              </span>
            </div>
            <ProgressBar
              value={milestone.progress || 0}
              color={isCompleted ? 'emerald' : 'blue'}
              height="h-1.5"
            />
          </div>

          {/* Action Complete / Reopen Button */}
          {isCompleted ? (
            <button
              onClick={() => onReopen(milestone)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition"
              title="Reopen milestone"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reopen</span>
            </button>
          ) : (
            <button
              onClick={() => onComplete(milestone)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition"
              title="Mark stage completed"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Complete</span>
            </button>
          )}

          {/* Dropdown Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(milestone);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-400" />
                  <span>Edit Stage</span>
                </button>

                <div className="my-1 border-t border-slate-100" />

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(milestone);
                  }}
                  className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MilestoneCard;
