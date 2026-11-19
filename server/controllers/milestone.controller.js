const MilestoneService = require('../services/milestone.service');
const ApiResponse = require('../utils/apiResponse');

class MilestoneController {
  static async create(req, res, next) {
    try {
      const milestone = await MilestoneService.createMilestone(req.userId, req.body);
      return ApiResponse.created(res, milestone, 'Milestone created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const milestones = await MilestoneService.getMilestones(req.userId, req.query);
      return ApiResponse.success(res, milestones, 'Milestones retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const milestone = await MilestoneService.getMilestoneById(req.userId, req.params.id);
      return ApiResponse.success(res, milestone, 'Milestone details retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await MilestoneService.updateMilestone(req.userId, req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Milestone updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async complete(req, res, next) {
    try {
      const completed = await MilestoneService.completeMilestone(req.userId, req.params.id, req.body);
      return ApiResponse.success(res, completed, 'Milestone completed! Reward unlocked.');
    } catch (error) {
      next(error);
    }
  }

  static async reopen(req, res, next) {
    try {
      const reopened = await MilestoneService.reopenMilestone(req.userId, req.params.id);
      return ApiResponse.success(res, reopened, 'Milestone reopened successfully');
    } catch (error) {
      next(error);
    }
  }

  static async reorder(req, res, next) {
    try {
      const { direction } = req.body;
      const list = await MilestoneService.reorderMilestone(req.userId, req.params.id, direction);
      return ApiResponse.success(res, list, 'Milestones reordered');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await MilestoneService.deleteMilestone(req.userId, req.params.id);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = MilestoneController;
