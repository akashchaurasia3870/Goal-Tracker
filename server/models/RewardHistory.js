const mongoose = require('mongoose');

const rewardHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Milestone',
    },
    goalTitle: {
      type: String,
      default: '',
    },
    milestoneTitle: {
      type: String,
      required: true,
    },
    rewardTitle: {
      type: String,
      required: true,
    },
    claimedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

rewardHistorySchema.index({ userId: 1, claimedAt: -1 });

const RewardHistory = mongoose.model('RewardHistory', rewardHistorySchema);
module.exports = RewardHistory;
