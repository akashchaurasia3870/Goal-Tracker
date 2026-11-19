const TaskService = require('../services/task.service');
const ApiResponse = require('../utils/apiResponse');

class TaskController {
  static async create(req, res, next) {
    try {
      const task = await TaskService.createTask(req.userId, req.body);
      return ApiResponse.created(res, task, 'Task created successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getAll(req, res, next) {
    try {
      const tasks = await TaskService.getTasks(req.userId, req.query);
      return ApiResponse.success(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const task = await TaskService.getTaskById(req.userId, req.params.id);
      return ApiResponse.success(res, task, 'Task retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await TaskService.updateTask(req.userId, req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Task updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async toggleComplete(req, res, next) {
    try {
      const task = await TaskService.toggleComplete(req.userId, req.params.id);
      return ApiResponse.success(
        res,
        task,
        `Task marked as ${task.status === 'Completed' ? 'completed' : 'todo'}`
      );
    } catch (error) {
      next(error);
    }
  }

  static async toggleChecklistItem(req, res, next) {
    try {
      const { itemId, isCompleted } = req.body;
      const task = await TaskService.toggleChecklistItem(req.userId, req.params.id, itemId, isCompleted);
      return ApiResponse.success(res, task, 'Checklist item updated');
    } catch (error) {
      next(error);
    }
  }

  static async bulkAction(req, res, next) {
    try {
      const result = await TaskService.bulkAction(req.userId, req.body);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await TaskService.deleteTask(req.userId, req.params.id);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;
