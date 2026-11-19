const AchievementService = require('../services/achievement.service');
const ApiResponse = require('../utils/apiResponse');

class AchievementController {
  static async getAchievements(req, res, next) {
    try {
      const data = await AchievementService.getUserAchievements(req.userId);
      return ApiResponse.success(res, data, 'Achievements and progression retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getRewards(req, res, next) {
    try {
      const rewards = await AchievementService.getClaimedRewards(req.userId);
      return ApiResponse.success(res, rewards, 'Claimed rewards retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async claimReward(req, res, next) {
    try {
      const reward = await AchievementService.claimReward(req.userId, req.body);
      return ApiResponse.created(res, reward, 'Reward claimed successfully');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AchievementController;
