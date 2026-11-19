const UserService = require('../services/user.service');
const AuthService = require('../services/auth.service');
const ApiResponse = require('../utils/apiResponse');

class UserController {
  static async getProfile(req, res, next) {
    try {
      const data = await UserService.getProfile(req.userId);
      return ApiResponse.success(res, data, 'User profile retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req, res, next) {
    try {
      const updatedUser = await UserService.updateProfile(req.userId, req.body);
      return ApiResponse.success(res, updatedUser, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.userId, currentPassword, newPassword);
      return ApiResponse.success(res, null, result.message);
    } catch (error) {
      next(error);
    }
  }

  static async getSettings(req, res, next) {
    try {
      const settings = await UserService.getSettings(req.userId);
      return ApiResponse.success(res, settings, 'Settings retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async updateSettings(req, res, next) {
    try {
      const updatedSettings = await UserService.updateSettings(req.userId, req.body);
      return ApiResponse.success(res, updatedSettings, 'Settings updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async getActivityLogs(req, res, next) {
    try {
      const limit = parseInt(req.query.limit, 10) || 20;
      const logs = await UserService.getUserActivityLogs(req.userId, limit);
      return ApiResponse.success(res, logs, 'Activity logs retrieved');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
