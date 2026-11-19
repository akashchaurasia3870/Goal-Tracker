const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');
const ApiResponse = require('../utils/apiResponse');

class AnalyticsController {
  static async getOverview(req, res, next) {
    try {
      const userId = req.userId;
      const now = new Date();

      // 1. Goal stats
      const goals = await Goal.find({ userId, isArchived: false });
      const totalGoals = goals.length;
      const completedGoals = goals.filter((g) => g.status === 'Completed').length;
      const activeGoals = goals.filter((g) => g.status === 'In Progress').length;
      const avgGoalProgress = totalGoals > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / totalGoals) : 0;

      // 2. Milestone stats
      const milestones = await Milestone.find({ userId });
      const totalMilestones = milestones.length;
      const completedMilestones = milestones.filter((m) => m.status === 'Completed').length;

      // 3. Task stats
      const tasks = await Task.find({ userId, isArchived: false });
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
      const pendingTasks = tasks.filter((t) => t.status !== 'Completed').length;
      const overdueTasks = tasks.filter(
        (t) => t.status !== 'Completed' && t.dueDate && new Date(t.dueDate) < now
      ).length;
      const overallTaskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      // 4. Daily completion trend (last 7 or 14 days)
      const daysCount = parseInt(req.query.days, 10) || 7;
      const trendData = [];
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

        const count = tasks.filter((t) => {
          if (t.status !== 'Completed' || !t.completedAt) return false;
          return t.completedAt.toISOString().split('T')[0] === dayStr;
        }).length;

        trendData.push({
          date: dayLabel,
          completed: count,
        });
      }

      // 5. Tasks by status
      const statusData = [
        { name: 'To Do', value: tasks.filter((t) => t.status === 'Todo').length, color: '#94a3b8' },
        { name: 'In Progress', value: tasks.filter((t) => t.status === 'In Progress').length, color: '#3b82f6' },
        { name: 'Completed', value: completedTasks, color: '#10b981' },
      ];

      // 6. Tasks by category
      const categoriesMap = {};
      tasks.forEach((t) => {
        const cat = t.category || 'Other';
        categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
      });
      const categoryColors = ['#3b82f6', '#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];
      const categoryData = Object.entries(categoriesMap).map(([name, value], idx) => ({
        name,
        value,
        color: categoryColors[idx % categoryColors.length],
      }));

      // 7. Goal progress bars
      const goalProgressData = goals.slice(0, 6).map((g) => ({
        id: g._id,
        title: g.title,
        progress: g.progress || 0,
        color: g.color || '#3b82f6',
        category: g.category,
      }));

      return ApiResponse.success(res, {
        summary: {
          totalGoals,
          activeGoals,
          completedGoals,
          avgGoalProgress,
          totalMilestones,
          completedMilestones,
          totalTasks,
          completedTasks,
          pendingTasks,
          overdueTasks,
          overallTaskCompletionRate,
        },
        trendData,
        statusData,
        categoryData,
        goalProgressData,
      }, 'Analytics overview retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AnalyticsController;
