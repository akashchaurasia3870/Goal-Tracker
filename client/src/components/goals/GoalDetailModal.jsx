import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Calendar,
  Milestone,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import ProgressBar from '../common/ProgressBar';
import Button from '../common/Button';

const GoalDetailModal = ({ isOpen, onClose, goal, onEdit }) => {
  const navigate = useNavigate();
  if (!goal) return null;

  const now = new Date();
  const target = new Date(goal.targetDate);
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  const isOverdue = goal.status !== 'Completed' && diffDays < 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={goal.title}
      subtitle={`Goal details and stage breakdown (${goal.category})`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        {/* Top Badges & Timeline Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="blue">{goal.category}</Badge>
            <Badge priority={goal.priority} />
            <Badge status={goal.status} />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>
              Target: {new Date(goal.targetDate).toLocaleDateString()}
            </span>
            {isOverdue ? (
              <span className="text-rose-600 font-bold ml-1">
                ({Math.abs(diffDays)} days overdue)
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold ml-1">
                ({diffDays} days left)
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <div className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
            {goal.description}
          </div>
        )}

        {/* Progress Summary Card */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-slate-800">Overall Goal Progress</span>
            <span className="font-bold text-blue-600 text-base">{goal.progress || 0}%</span>
          </div>
          <ProgressBar value={goal.progress || 0} color="blue" height="h-2.5" />
          <p className="text-xs text-slate-400">
            Completion updates dynamically as linked milestones and tasks are finished.
          </p>
        </div>

        {/* Milestones Hierarchy Breakdown */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Milestone className="w-4 h-4 text-indigo-500" />
              <span>Milestones in this Goal ({goal.milestones?.length || 0})</span>
            </h4>

            <button
              onClick={() => {
                onClose();
                navigate('/milestones');
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Manage Milestones</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {goal.milestones && goal.milestones.length > 0 ? (
            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
              {goal.milestones.map((m, idx) => (
                <div key={m.id || idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-slate-800">{m.title}</p>
                    <p className="text-[11px] text-slate-500">
                      {m.completedCount || 0} / {m.tasksCount || 0} Tasks finished
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-700">{m.progress || 0}%</span>
                    <Badge status={m.status || (m.progress === 100 ? 'Completed' : 'In Progress')} size="xs" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-500">
              No milestones added to this goal yet. Add milestones in Phase 5 to track structured stages.
            </div>
          )}
        </div>

        {/* Notes (if any) */}
        {goal.notes && (
          <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 text-xs text-slate-700 space-y-1">
            <span className="font-bold text-amber-800 uppercase tracking-wider text-[10px]">Notes & Acceptance Criteria</span>
            <p className="whitespace-pre-wrap">{goal.notes}</p>
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(goal);
            }}
          >
            Edit Goal
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default GoalDetailModal;
