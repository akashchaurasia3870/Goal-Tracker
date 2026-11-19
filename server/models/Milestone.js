const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Milestone must belong to a user'],
      index: true,
    },
    goalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Goal',
      required: [true, 'Milestone must belong to a goal'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    status: {
      type: String,
      enum: ['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
      default: 'In Progress',
    },
    order: {
      type: Number,
      default: 0,
    },
    reward: {
      type: String,
      trim: true,
      default: '', // e.g. "Watch a movie", "Buy a new gadget", "Personal celebration"
    },
    rewardClaimed: {
      type: Boolean,
      default: false,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    tasksCount: {
      type: Number,
      default: 0,
    },
    completedTasksCount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
    },
    completionNotes: {
      type: String,
      default: '',
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

// Compound indexes for ordering and goal querying
milestoneSchema.index({ goalId: 1, order: 1 });
milestoneSchema.index({ userId: 1, status: 1 });

const Milestone = mongoose.model('Milestone', milestoneSchema);
module.exports = Milestone;
