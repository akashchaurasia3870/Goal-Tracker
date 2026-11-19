const mongoose = require('mongoose');

const userSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
    dateFormat: {
      type: String,
      enum: ['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY'],
      default: 'YYYY-MM-DD',
    },
    defaultTaskView: {
      type: String,
      enum: ['list', 'board', 'compact'],
      default: 'list',
    },
    defaultReminderTime: {
      type: String,
      default: '09:00',
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'light',
    },
    weekStartDay: {
      type: String,
      enum: ['monday', 'sunday', 'saturday'],
      default: 'monday',
    },
    xpEnabled: {
      type: Boolean,
      default: true,
    },
    notifications: {
      emailAlerts: { type: Boolean, default: true },
      taskReminders: { type: Boolean, default: true },
      milestoneUpdates: { type: Boolean, default: true },
      goalDeadlines: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
module.exports = UserSettings;
