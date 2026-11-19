import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Target,
  Milestone,
  Calendar,
  Clock,
  Tag,
  ListPlus,
  Trash2,
  Plus,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const CATEGORIES = ['Work', 'Learning', 'Personal', 'Career', 'Health'];

const TaskModal = ({
  isOpen,
  onClose,
  onSave,
  editingTask,
  goals = [],
  milestones = [],
  defaultGoalId = '',
  defaultMilestoneId = '',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isStandalone, setIsStandalone] = useState(true);
  const [goalId, setGoalId] = useState('');
  const [milestoneId, setMilestoneId] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Todo');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [category, setCategory] = useState('Work');
  const [estimatedTime, setEstimatedTime] = useState(30);
  const [tagsInput, setTagsInput] = useState('');
  const [notes, setNotes] = useState('');
  const [checklist, setChecklist] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      const hasGoal = Boolean(editingTask.goalId?._id || editingTask.goalId);
      setIsStandalone(!hasGoal);
      setGoalId(editingTask.goalId?._id || editingTask.goalId || '');
      setMilestoneId(editingTask.milestoneId?._id || editingTask.milestoneId || '');
      setPriority(editingTask.priority || 'Medium');
      setStatus(editingTask.status || 'Todo');
      setDueDate(
        editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : ''
      );
      setStartDate(
        editingTask.startDate ? new Date(editingTask.startDate).toISOString().split('T')[0] : ''
      );
      setCategory(editingTask.category || 'Work');
      setEstimatedTime(editingTask.estimatedTime || 0);
      setTagsInput(Array.isArray(editingTask.tags) ? editingTask.tags.join(', ') : '');
      setNotes(editingTask.notes || '');
      setChecklist(editingTask.checklist || []);
    } else {
      setTitle('');
      setDescription('');
      if (defaultGoalId) {
        setIsStandalone(false);
        setGoalId(defaultGoalId);
        setMilestoneId(defaultMilestoneId || '');
      } else {
        setIsStandalone(true);
        setGoalId('');
        setMilestoneId('');
      }
      setPriority('Medium');
      setStatus('Todo');
      setDueDate(new Date().toISOString().split('T')[0]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setCategory('Work');
      setEstimatedTime(30);
      setTagsInput('');
      setNotes('');
      setChecklist([]);
    }
  }, [editingTask, defaultGoalId, defaultMilestoneId, isOpen]);

  // Filter milestones by selected goal
  const availableMilestones = milestones.filter(
    (m) => (m.goalId?._id || m.goalId) === goalId
  );

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklist([...checklist, { text: newChecklistText.trim(), isCompleted: false }]);
    setNewChecklistText('');
  };

  const handleRemoveChecklistItem = (idx) => {
    setChecklist(checklist.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setIsSubmitting(true);
      const formattedTags = tagsInput
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);

      await onSave({
        title: title.trim(),
        description: description.trim(),
        goalId: isStandalone ? null : goalId || null,
        milestoneId: isStandalone ? null : milestoneId || null,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        startDate: startDate ? new Date(startDate) : new Date(),
        category,
        estimatedTime: Number(estimatedTime) || 0,
        tags: formattedTags,
        notes: notes.trim(),
        checklist,
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
      title={editingTask ? 'Edit Task' : 'Create New Task'}
      subtitle="Configure task details, goal association, checklists, and deadlines"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Task Name *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Practice SELECT queries with multiple criteria"
            className="mt-1 w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />
        </div>

        {/* Association Toggle (Goal vs Independent) */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">Task Hierarchy</span>
            <div className="flex bg-white p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsStandalone(true);
                  setGoalId('');
                  setMilestoneId('');
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  isStandalone
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Independent Task
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsStandalone(false);
                  if (goals.length > 0 && !goalId) {
                    setGoalId(goals[0]._id || goals[0].id);
                  }
                }}
                className={`px-2.5 py-1 rounded-md font-medium transition ${
                  !isStandalone
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Link to Goal
              </button>
            </div>
          </div>

          {!isStandalone && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                  Goal *
                </label>
                <select
                  required={!isStandalone}
                  value={goalId}
                  onChange={(e) => {
                    setGoalId(e.target.value);
                    setMilestoneId('');
                  }}
                  className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a Goal...</option>
                  {goals.map((g) => (
                    <option key={g._id || g.id} value={g._id || g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase">
                  Milestone (Optional)
                </label>
                <select
                  value={milestoneId}
                  disabled={!goalId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  <option value="">None (Direct goal task)</option>
                  {availableMilestones.map((m) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Priority, Status, Due Date Grid */}
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
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
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

        {/* Category & Estimated Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
              Estimated Time (mins)
            </label>
            <input
              type="number"
              min="0"
              step="5"
              value={estimatedTime}
              onChange={(e) => setEstimatedTime(e.target.value)}
              placeholder="e.g. 45"
              className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Subtasks / Checklist Builder */}
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Subtasks Checklist ({checklist.length})
          </label>

          {checklist.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {checklist.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="truncate text-slate-800">{item.text}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChecklistItem(idx)}
                    className="text-slate-400 hover:text-red-600 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newChecklistText}
              onChange={(e) => setNewChecklistText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddChecklistItem();
                }
              }}
              placeholder="Add checklist subtask..."
              className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddChecklistItem}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Tags (comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="e.g. sql, backend, query-opt"
            className="mt-1 w-full px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Footer */}
        <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
          <Button variant="secondary" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" loading={isSubmitting}>
            {editingTask ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TaskModal;
