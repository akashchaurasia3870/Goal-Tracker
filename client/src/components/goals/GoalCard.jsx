import React, { useState, useRef, useEffect } from 'react';
import {
  Calendar,
  Pin,
  MoreVertical,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  Milestone,
} from 'lucide-react';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';

const GoalCard = ({
  goal,
  onEdit,
  onDelete,
  onDuplicate,
  onTogglePin,
  onToggleArchive,
  onViewDetails,
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

  const isOverdue =
    goal.status !== 'Completed' &&
    goal.targetDate &&
    new Date(goal.targetDate) < new Date();

  const formattedTargetDate = goal.targetDate
    ? new Date(goal.targetDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No date';

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Top Accent Color Bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: goal.color || '#3b82f6' }} />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Header Row: Category, Priority, Pin, Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="blue" size="xs">
              {goal.category}
            </Badge>
            <Badge priority={goal.priority} size="xs" />
            <Badge status={goal.status} size="xs" />
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Pin Toggle */}
            <button
              type="button"
              onClick={() => onTogglePin(goal)}
              className={`p-1 rounded-md transition ${
                goal.isPinned
                  ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                  : 'text-slate-300 hover:text-slate-600 hover:bg-slate-100 opacity-0 group-hover:opacity-100'
              }`}
              title={goal.isPinned ? 'Unpin goal' : 'Pin goal to top'}
            >
              <Pin className={`w-3.5 h-3.5 ${goal.isPinned ? 'fill-amber-500' : ''}`} />
            </button>

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
                <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-30 text-xs animate-in fade-in zoom-in-95 duration-100">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onViewDetails(goal);
                    }}
                    className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(goal);
                    }}
                    className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                  >
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                    <span>Edit Goal</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDuplicate(goal);
                    }}
                    className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                  >
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Duplicate</span>
                  </button>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onToggleArchive(goal);
                    }}
                    className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-slate-700 hover:bg-slate-50"
                  >
                    <Archive className="w-3.5 h-3.5 text-slate-400" />
                    <span>{goal.isArchived ? 'Restore Goal' : 'Archive'}</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(goal);
                    }}
                    className="w-full text-left px-3.5 py-1.5 flex items-center gap-2 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Goal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 cursor-pointer" onClick={() => onViewDetails(goal)}>
          <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-blue-600 transition">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {goal.description}
            </p>
          )}
        </div>

        {/* Milestone Count Pill & Hierarchy Badge */}
        {goal.milestones && goal.milestones.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 w-fit">
            <Milestone className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-medium">
              {goal.milestones.filter((m) => m.status === 'Completed').length} /{' '}
              {goal.milestones.length} Milestones
            </span>
          </div>
        )}

        {/* Progress Bar Section */}
        <div className="space-y-1 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Progress</span>
            <span className="font-bold text-slate-800">{goal.progress || 0}%</span>
          </div>
          <ProgressBar value={goal.progress || 0} color="blue" height="h-2" />
        </div>

        {/* Target Deadline Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Target: {formattedTargetDate}</span>
          </div>

          {isOverdue && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
              <AlertTriangle className="w-3 h-3" />
              <span>Overdue</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalCard;
