const mongoose = require('mongoose');

const checklistItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  isCompleted: {
    type: Boolean,
    default: false,
  },
});

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Task must belong to a user'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      default: null,
      index: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
      default: null,
      index: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Completed'],
      default: 'Todo',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    reminder: {
      type: Date,
    },
    category: {
      type: String,
      default: 'Work',
    },
    estimatedTime: {
      type: Number, // in minutes
      default: 0,
    },
    actualTime: {
      type: Number, // in minutes
      default: 0,
    },
    tags: {
      type: [String],
      default: [],
    },
    notes: {
      type: String,
      default: '',
    },
    checklist: {
      type: [checklistItemSchema],
      default: [],
    },
    order: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    isMyDay: {
      type: Boolean,
      default: false,
    },
    myDayDate: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user querying, status, and milestone filtering
taskSchema.index({ userId: 1, isArchived: 1, status: 1 });
taskSchema.index({ userId: 1, dueDate: 1 });
taskSchema.index({ milestoneId: 1, status: 1 });
taskSchema.index({ goalId: 1, status: 1 });

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
