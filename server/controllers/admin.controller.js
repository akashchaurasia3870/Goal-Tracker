const User = require('../models/User');
const Goal = require('../models/Goal');
const Milestone = require('../models/Milestone');
const Task = require('../models/Task');
const RecurringTask = require('../models/RecurringTask');
const ActivityLog = require('../models/ActivityLog');
const ApiResponse = require('../utils/apiResponse');

class AdminController {
  /**
   * Get paginated list of users with search and filter capabilities
   */
  async getUsers(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        role,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query;

      const filter = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (role && ['User', 'Admin'].includes(role)) {
        filter.role = role;
      }

      if (isActive !== undefined && isActive !== '') {
        filter.isActive = isActive === 'true';
      }

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const skip = (pageNum - 1) * limitNum;

      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      const [users, total] = await Promise.all([
        User.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires'),
        User.countDocuments(filter),
      ]);

      return ApiResponse.success(
        res,
        {
          users,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
          },
        },
        'Users fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Activate or deactivate a user account
   */
  async updateUserStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { isActive } = req.body;

      if (isActive === undefined) {
        return ApiResponse.error(res, 'isActive status boolean is required', 400);
      }

      // Safety check: Admin cannot deactivate themselves
      if (req.user._id.toString() === id && isActive === false) {
        return ApiResponse.error(res, 'You cannot deactivate your own administrative account', 400);
      }

      const user = await User.findById(id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      user.isActive = Boolean(isActive);
      await user.save();

      // Log activity
      await ActivityLog.create({
        userId: req.user._id,
        action: user.isActive ? 'USER_ACTIVATED_BY_ADMIN' : 'USER_DEACTIVATED_BY_ADMIN',
        entityType: 'USER',
        entityId: user._id,
        details: { targetEmail: user.email, newStatus: user.isActive },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return ApiResponse.success(res, user, `User account ${user.isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Promote or demote user role
   */
  async updateUserRole(req, res, next) {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!role || !['User', 'Admin'].includes(role)) {
        return ApiResponse.error(res, 'Role must be either User or Admin', 400);
      }

      // Safety check: Admin cannot demote themselves
      if (req.user._id.toString() === id && role !== 'Admin') {
        return ApiResponse.error(res, 'You cannot remove your own administrative privileges', 400);
      }

      const user = await User.findById(id);
      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      const previousRole = user.role;
      user.role = role;
      await user.save();

      // Log activity
      await ActivityLog.create({
        userId: req.user._id,
        action: 'USER_ROLE_UPDATED_BY_ADMIN',
        entityType: 'USER',
        entityId: user._id,
        details: { targetEmail: user.email, previousRole, newRole: role },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return ApiResponse.success(res, user, `User role successfully updated to ${role}`);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system-wide platform statistics
   */
  async getSystemStats(req, res, next) {
    try {
      const [
        totalUsers,
        activeUsers,
        adminUsers,
        totalGoals,
        completedGoals,
        totalMilestones,
        completedMilestones,
        totalTasks,
        completedTasks,
        totalRecurring,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ role: 'Admin' }),
        Goal.countDocuments(),
        Goal.countDocuments({ status: 'Completed' }),
        Milestone.countDocuments(),
        Milestone.countDocuments({ status: 'Completed' }),
        Task.countDocuments(),
        Task.countDocuments({ status: 'Done' }),
        RecurringTask.countDocuments(),
      ]);

      const systemHealth = {
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
        memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        platform: process.platform,
        serverTime: new Date().toISOString(),
      };

      return ApiResponse.success(
        res,
        {
          users: {
            total: totalUsers,
            active: activeUsers,
            inactive: totalUsers - activeUsers,
            admins: adminUsers,
          },
          goals: {
            total: totalGoals,
            completed: completedGoals,
            inProgress: totalGoals - completedGoals,
          },
          milestones: {
            total: totalMilestones,
            completed: completedMilestones,
          },
          tasks: {
            total: totalTasks,
            completed: completedTasks,
            pending: totalTasks - completedTasks,
            completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            recurringCount: totalRecurring,
          },
          system: systemHealth,
        },
        'System statistics retrieved successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get global audit activity logs
   */
  async getActivityLogs(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        entityType,
        action,
      } = req.query;

      const filter = {};
      if (entityType) {
        filter.entityType = entityType;
      }
      if (action) {
        filter.action = { $regex: action, $options: 'i' };
      }

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 20;
      const skip = (pageNum - 1) * limitNum;

      const [logs, total] = await Promise.all([
        ActivityLog.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum)
          .populate('userId', 'name email role avatar'),
        ActivityLog.countDocuments(filter),
      ]);

      return ApiResponse.success(
        res,
        {
          logs,
          pagination: {
            total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum) || 1,
          },
        },
        'Activity logs fetched successfully'
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AdminController();
