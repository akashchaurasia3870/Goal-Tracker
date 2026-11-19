import React, { useState, useEffect } from 'react';
import { Milestone, Target, Calendar, Gift, AlertCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const MilestoneModal = ({
  isOpen,
  onClose,
  onSave,
  editingMilestone,
  goals = [],
  defaultGoalId = '',
}) => {
  const [goalId, setGoalId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [reward, setReward] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingMilestone) {
      setGoalId(editingMilestone.goalId?._id || editingMilestone.goalId || '');
      setTitle(editingMilestone.title || '');
      setDescription(editingMilestone.description || '');
      setPriority(editingMilestone.priority || 'Medium');
      setDueDate(
        editingMilestone.dueDate
          ? new Date(editingMilestone.dueDate).toISOString().split('T')[0]
          : ''
      );
      setReward(editingMilestone.reward || '');
      setNotes(editingMilestone.notes || '');
    } else {
      setGoalId(defaultGoalId || (goals[0]?._id || goals[0]?.id || ''));
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setReward('');
      setNotes('');
    }
  }, [editingMilestone, defaultGoalId, goals, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !goalId) return;

    try {
      setIsSubmitting(true);
      await onSave({
        goalId,
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        reward: reward.trim(),
        notes: notes.trim(),
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingMilestone ? 'Edit Milestone' : 'Add New Milestone'}
      subtitle="Divide your goal into an achievable, structured milestone stage"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Parent Goal Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Parent Goal *
          </label>
          <select
            required
            value={goalId}
            onChange={(e) => setGoalId(e.target.value)}
            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a Goal...</option>
            {goals.map((g) => (
              <option key={g._id || g.id} value={g._id || g.id}>
                {g.title} ({g.category})
              </option>
            ))}
          </select>
        </div>

        {/* Milestone Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Milestone Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., SQL Basics · CRUD Operations · Joins"
            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Scope of this stage and what needs to be achieved..."
            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Priority & Due Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Milestone Custom Reward */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <Gift className="w-3.5 h-3.5 text-amber-500" />
            <span>Completion Reward (Optional)</span>
          </label>
          <input
            type="text"
            value={reward}
            onChange={(e) => setReward(e.target.value)}
            placeholder="e.g., Watch a movie, buy something nice, or personal celebration"
            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-[11px] text-slate-400 mt-1">
            Motivate yourself upon completing this specific milestone.
          </p>
        </div>

        {/* Footer */}
        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
            {editingMilestone ? 'Update Milestone' : 'Create Milestone'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MilestoneModal;
