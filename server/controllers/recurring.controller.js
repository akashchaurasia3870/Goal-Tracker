const RecurringService = require('../services/recurring.service');
const ApiResponse = require('../utils/apiResponse');

class RecurringController {
  static async create(req, res, next) {
    try {
      const task = await RecurringService.createRecurringTask(req.userId, req.body);
      return ApiResponse.created(res, task, 'Recurring task created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const list = await RecurringService.getRecurringTasks(req.userId);
      return ApiResponse.success(res, list, 'Recurring tasks retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async getOccurrences(req, res, next) {
    try {
      const occurrences = await RecurringService.getOccurrences(req.userId, req.query);
      return ApiResponse.success(res, occurrences, 'Occurrences retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateOccurrence(req, res, next) {
    try {
      const { status, notes } = req.body;
      const occurrence = await RecurringService.updateOccurrenceStatus(
        req.userId,
        req.params.id,
        status,
        notes
      );
      return ApiResponse.success(res, occurrence, `Occurrence status set to ${status}`);
    } catch (error) {
      next(error);
    }
  }

  static async pause(req, res, next) {
    try {
      const task = await RecurringService.pause(req.userId, req.params.id);
      return ApiResponse.success(res, task, 'Recurring task paused');
    } catch (error) {
      next(error);
    }
  }

  static async resume(req, res, next) {
    try {
      const task = await RecurringService.resume(req.userId, req.params.id);
      return ApiResponse.success(res, task, 'Recurring task resumed');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await RecurringService.delete(req.userId, req.params.id);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = RecurringController;
