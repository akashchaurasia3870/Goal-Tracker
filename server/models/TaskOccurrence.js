const mongoose = require('mongoose');

const taskOccurrenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recurringTaskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecurringTask',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    category: {
      type: String,
      default: 'Routine',
    },
    completedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index ensuring idempotent generation for a recurring task on a given date!
taskOccurrenceSchema.index({ recurringTaskId: 1, dueDate: 1 }, { unique: true });
taskOccurrenceSchema.index({ userId: 1, dueDate: 1, status: 1 });

const TaskOccurrence = mongoose.model('TaskOccurrence', taskOccurrenceSchema);
module.exports = TaskOccurrence;
