const mongoose = require('mongoose');

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    achievementCode: {
      type: String,
      required: true,
    },
    unlockedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

userAchievementSchema.index({ userId: 1, achievementCode: 1 }, { unique: true });

const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);
module.exports = UserAchievement;
