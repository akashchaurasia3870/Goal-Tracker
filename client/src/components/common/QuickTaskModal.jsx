import React, { useState } from 'react';
import { Plus, Target, Milestone, Calendar, Tag, AlertCircle } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';
import { sampleGoals } from '../../data/goal_data';
import toast from 'react-hot-toast';

const QuickTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [dueDate, setDueDate] = useState('');
  const [category, setCategory] = useState('Work');
  const [isStandalone, setIsStandalone] = useState(true);
  const [selectedGoalId, setSelectedGoalId] = useState('');
  const [selectedMilestoneId, setSelectedMilestoneId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected goal milestones
  const selectedGoal = sampleGoals.find((g) => g.id === selectedGoalId);
  const availableMilestones = selectedGoal?.milestones || [];

  const handleGoalChange = (goalId) => {
    setSelectedGoalId(goalId);
    setSelectedMilestoneId('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Task title is required');
      return;
    }

    setIsSubmitting(true);

    const newTask = {
      id: `task_${Date.now()}`,
      title: title.trim(),
      description: description.trim(),
      priority,
      status: 'Todo',
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      category,
      goalId: isStandalone ? null : selectedGoalId || null,
      milestoneId: isStandalone ? null : selectedMilestoneId || null,
      createdAt: new Date().toISOString(),
    };

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        isStandalone
          ? 'Independent task created!'
          : `Task linked to ${selectedGoal?.title || 'Goal'} created!`
      );
      if (onTaskCreated) onTaskCreated(newTask);
      // Reset form
      setTitle('');
      setDescription('');
      setPriority('Medium');
      setDueDate('');
      setIsStandalone(true);
      setSelectedGoalId('');
      setSelectedMilestoneId('');
      onClose();
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Task"
      subtitle="Quickly add an independent task or link it directly into a Goal & Milestone"
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Task Name *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Practice SQL joins or Review project proposal"
            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Task Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Description
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant notes or acceptance criteria..."
            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Priority & Due Date & Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Work">Work</option>
              <option value="Learning">Learning</option>
              <option value="Career">Career</option>
              <option value="Personal">Personal</option>
              <option value="Health">Health</option>
            </select>
          </div>
        </div>

        {/* Hierarchy Association Options */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">Task Association</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsStandalone(true)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  isStandalone
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Independent Task
              </button>
              <button
                type="button"
                onClick={() => setIsStandalone(false)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  !isStandalone
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Link to Goal
              </button>
            </div>
          </div>

          {!isStandalone && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150">
              {/* Goal Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Target Goal *
                </label>
                <select
                  required={!isStandalone}
                  value={selectedGoalId}
                  onChange={(e) => handleGoalChange(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a Goal...</option>
                  {sampleGoals.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Milestone Picker */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Milestone (Optional)
                </label>
                <select
                  value={selectedMilestoneId}
                  disabled={!selectedGoalId || availableMilestones.length === 0}
                  onChange={(e) => setSelectedMilestoneId(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">No Milestone (Direct to Goal)</option>
                  {availableMilestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Submit Actions */}
        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting} icon={Plus}>
            Create Task
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default QuickTaskModal;
