const GoalService = require('../services/goal.service');
const ApiResponse = require('../utils/apiResponse');

class GoalController {
  static async create(req, res, next) {
    try {
      const goal = await GoalService.createGoal(req.userId, req.body);
      return ApiResponse.created(res, goal, 'Goal created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const goals = await GoalService.getGoals(req.userId, req.query);
      return ApiResponse.success(res, goals, 'Goals retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const goal = await GoalService.getGoalById(req.userId, req.params.id);
      return ApiResponse.success(res, goal, 'Goal details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await GoalService.updateGoal(req.userId, req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Goal updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await GoalService.deleteGoal(req.userId, req.params.id);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async togglePin(req, res, next) {
    try {
      const goal = await GoalService.togglePin(req.userId, req.params.id);
      return ApiResponse.success(res, goal, `Goal ${goal.isPinned ? 'pinned' : 'unpinned'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async toggleArchive(req, res, next) {
    try {
      const goal = await GoalService.toggleArchive(req.userId, req.params.id);
      return ApiResponse.success(res, goal, `Goal ${goal.isArchived ? 'archived' : 'restored'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  static async duplicate(req, res, next) {
    try {
      const duplicated = await GoalService.duplicateGoal(req.userId, req.params.id);
      return ApiResponse.created(res, duplicated, 'Goal duplicated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getSummary(req, res, next) {
    try {
      const summary = await GoalService.getSummary(req.userId);
      return ApiResponse.success(res, summary, 'Goal summary retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GoalController;
