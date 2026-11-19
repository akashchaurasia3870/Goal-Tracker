const Task = require('../models/Task');
const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');
const ApiResponse = require('../utils/apiResponse');

class CalendarController {
  static async getEvents(req, res, next) {
    try {
      const { start, end } = req.query;
      const dateFilter = {};

      if (start && end) {
        dateFilter.$gte = new Date(start);
        dateFilter.$lte = new Date(end);
      }

      // 1. Tasks within date range
      const taskQuery = { userId: req.userId, isArchived: false };
      if (start && end) {
        taskQuery.dueDate = dateFilter;
      } else {
        taskQuery.dueDate = { $exists: true, $ne: null };
      }

      const tasks = await Task.find(taskQuery)
        .populate('goalId', 'title color category')
        .populate('milestoneId', 'title status order');

      // 2. Goal deadlines within date range
      const goalQuery = { userId: req.userId, isArchived: false };
      if (start && end) {
        goalQuery.targetDate = dateFilter;
      }
      const goals = await Goal.find(goalQuery).select('title category priority targetDate status color progress');

      // 3. Milestone deadlines within date range
      const milestoneQuery = { userId: req.userId };
      if (start && end) {
        milestoneQuery.dueDate = dateFilter;
      } else {
        milestoneQuery.dueDate = { $exists: true, $ne: null };
      }
      const milestones = await Milestone.find(milestoneQuery)
        .populate('goalId', 'title color')
        .select('title priority dueDate status progress reward');

      return ApiResponse.success(res, { tasks, goals, milestones }, 'Calendar events retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = CalendarController;
