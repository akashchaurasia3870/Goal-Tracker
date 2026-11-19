const mongoose = require('mongoose');

const recurringTaskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Recurring task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
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
    frequency: {
      type: String,
      enum: ['daily', 'weekdays', 'weekly', 'monthly', 'custom'],
      default: 'daily',
    },
    interval: {
      type: Number, // e.g. every 2 weeks or every 3 days
      default: 1,
      min: 1,
    },
    selectedWeekdays: {
      type: [Number], // 0 = Sunday, 1 = Monday, ... 6 = Saturday
      default: [],
    },
    dayOfMonth: {
      type: Number, // 1 to 31
      min: 1,
      max: 31,
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    occurrencesLimit: {
      type: Number, // maximum total occurrences to generate
    },
    generatedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'paused', 'stopped'],
      default: 'active',
    },
    reminderTime: {
      type: String, // e.g. "08:00"
      default: '09:00',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

recurringTaskSchema.index({ userId: 1, status: 1 });

const RecurringTask = mongoose.model('RecurringTask', recurringTaskSchema);
module.exports = RecurringTask;
