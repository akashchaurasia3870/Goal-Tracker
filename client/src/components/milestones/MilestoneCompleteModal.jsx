import React, { useState } from 'react';
import { Gift, CheckCircle2, Sparkles, MessageSquare } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const MilestoneCompleteModal = ({ isOpen, onClose, milestone, onConfirm }) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [claimReward, setClaimReward] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!milestone) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await onConfirm(milestone, {
        completionNotes: completionNotes.trim(),
        claimReward,
      });
      setCompletionNotes('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4 text-center">
        {/* Celebration Header */}
        <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <Sparkles className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">Milestone Completed!</h3>
          <p className="text-xs text-slate-500 mt-1">
            Congratulations on finishing <strong className="text-slate-800">"{milestone.title}"</strong>
          </p>
        </div>

        {/* Reward Card (if defined) */}
        {milestone.reward ? (
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-left space-y-2">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Milestone Reward
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800">{milestone.reward}</p>
            <div className="flex items-center gap-2 pt-1 border-t border-amber-200/60">
              <input
                id="claim-reward"
                type="checkbox"
                checked={claimReward}
                onChange={(e) => setClaimReward(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <label htmlFor="claim-reward" className="text-xs text-slate-700 cursor-pointer font-medium">
                Claim this reward now
              </label>
            </div>
          </div>
        ) : null}

        {/* Completion Notes */}
        <div className="text-left space-y-1">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>Completion Reflection Notes</span>
          </label>
          <textarea
            rows={3}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="What went well? Any key takeaways or challenges conquered?"
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="success" size="sm" loading={isSubmitting} icon={CheckCircle2}>
            Mark as Completed
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MilestoneCompleteModal;
