const NotificationService = require('../services/notification.service');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  static async getAll(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 50;
      const data = await NotificationService.getNotifications(req.userId, limit);
      return ApiResponse.success(res, data, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async markRead(req, res, next) {
    try {
      const notification = await NotificationService.markAsRead(req.userId, req.params.id);
      return ApiResponse.success(res, notification, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllRead(req, res, next) {
    try {
      const result = await NotificationService.markAllAsRead(req.userId);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      const result = await NotificationService.delete(req.userId, req.params.id);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;
