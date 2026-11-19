const UserAchievement = require('../models/UserAchievement');
const RewardHistory = require('../models/RewardHistory');
const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');
const UserSettings = require('../models/UserSettings');

const DEFAULT_ACHIEVEMENTS = [
  {
    code: 'FIRST_TASK',
    title: 'First Step',
    description: 'Completed your very first task',
    category: 'tasks',
    requiredCount: 1,
    tier: 'Bronze',
    xpReward: 50,
  },
  {
    code: 'TASKS_10',
    title: 'Productivity Builder',
    description: 'Completed 10 tasks',
    category: 'tasks',
    requiredCount: 10,
    tier: 'Bronze',
    xpReward: 100,
  },
  {
    code: 'TASKS_100',
    title: 'TaskFlow Centurion',
    description: 'Completed 100 tasks across goals & independent work',
    category: 'tasks',
    requiredCount: 100,
    tier: 'Gold',
    xpReward: 500,
  },
  {
    code: 'FIRST_MILESTONE',
    title: 'Milestone Conqueror',
    description: 'Successfully reached and completed your first goal milestone stage',
    category: 'milestones',
    requiredCount: 1,
    tier: 'Silver',
    xpReward: 150,
  },
  {
    code: 'FIRST_GOAL',
    title: 'Goal Achiever',
    description: 'Completed your first full strategic goal',
    category: 'goals',
    requiredCount: 1,
    tier: 'Silver',
    xpReward: 300,
  },
  {
    code: 'GOALS_5',
    title: 'Master of Objectives',
    description: 'Accomplished 5 strategic goals',
    category: 'goals',
    requiredCount: 5,
    tier: 'Gold',
    xpReward: 1000,
  },
  {
    code: 'STREAK_7',
    title: '7-Day Consistency',
    description: 'Completed tasks 7 days in a row',
    category: 'consistency',
    requiredCount: 7,
    tier: 'Silver',
    xpReward: 250,
  },
];

class AchievementService {
  /**
   * Calculate User Level based on XP
   */
  static calculateLevel(xp = 0) {
    // Level formula: Level = Math.floor(Math.sqrt(xp / 100)) + 1
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const levelXP = xp - currentLevelBaseXP;
    const xpNeeded = nextLevelXP - currentLevelBaseXP;
    const progress = Math.min(100, Math.round((levelXP / xpNeeded) * 100));

    return {
      level,
      currentXP: xp,
      nextLevelXP,
      progress,
    };
  }

  /**
   * Get user achievements with real progress calculations
   */
  static async getUserAchievements(userId) {
    const settings = await UserSettings.findOne({ userId });
    const isXpEnabled = settings ? settings.xpEnabled : true;

    // Fetch real metrics
    const completedTasksCount = await Task.countDocuments({ userId, status: 'Completed' });
    const completedGoalsCount = await Goal.countDocuments({ userId, status: 'Completed' });
    const completedMilestonesCount = await Milestone.countDocuments({
      userId,
      status: 'Completed',
    });

    const unlocked = await UserAchievement.find({ userId });
    const unlockedMap = new Map(unlocked.map((u) => [u.achievementCode, u.unlockedAt]));

    let totalXP = 0;

    const list = DEFAULT_ACHIEVEMENTS.map((item) => {
      let currentCount = 0;
      if (item.category === 'tasks') currentCount = completedTasksCount;
      else if (item.category === 'goals') currentCount = completedGoalsCount;
      else if (item.category === 'milestones') currentCount = completedMilestonesCount;
      else if (item.category === 'consistency') currentCount = Math.min(item.requiredCount, completedTasksCount);

      const isUnlocked = unlockedMap.has(item.code) || currentCount >= item.requiredCount;
      if (isUnlocked) {
        totalXP += item.xpReward;
      }

      return {
        ...item,
        isUnlocked,
        unlockedAt: unlockedMap.get(item.code) || (isUnlocked ? new Date() : null),
        currentCount: Math.min(item.requiredCount, currentCount),
        progress: Math.min(100, Math.round((currentCount / item.requiredCount) * 100)),
      };
    });

    // Base XP from tasks, milestones, and goals
    totalXP += completedTasksCount * 20;
    totalXP += completedMilestonesCount * 100;
    totalXP += completedGoalsCount * 500;

    const levelProgression = AchievementService.calculateLevel(totalXP);

    return {
      achievements: list,
      xpEnabled: isXpEnabled,
      progression: levelProgression,
    };
  }

  /**
   * Get claimed rewards history
   */
  static async getClaimedRewards(userId) {
    return await RewardHistory.find({ userId }).sort({ claimedAt: -1 });
  }

  /**
   * Record a claimed reward
   */
  static async claimReward(userId, { milestoneId, rewardTitle, milestoneTitle, goalTitle }) {
    return await RewardHistory.create({
      userId,
      milestoneId,
      rewardTitle,
      milestoneTitle,
      goalTitle,
    });
  }
}

module.exports = AchievementService;
