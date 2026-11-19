const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'Award',
    },
    category: {
      type: String,
      enum: ['tasks', 'goals', 'milestones', 'consistency'],
      default: 'tasks',
    },
    requiredCount: {
      type: Number,
      required: true,
    },
    xpReward: {
      type: Number,
      default: 50,
    },
    tier: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Bronze',
    },
  },
  {
    timestamps: true,
  }
);

const Achievement = mongoose.model('Achievement', achievementSchema);
module.exports = Achievement;
