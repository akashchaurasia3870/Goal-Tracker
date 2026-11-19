const User = require('../models/User');
const UserSettings = require('../models/UserSettings');
const ActivityLog = require('../models/ActivityLog');

class UserService {
  static async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    const settings = await UserSettings.findOne({ userId });
    return { user, settings };
  }

  static async updateProfile(userId, updateData) {
    const allowedFields = ['name', 'avatar'];
    const update = {};
    for (const key of allowedFields) {
      if (updateData[key] !== undefined) {
        update[key] = updateData[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, update, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    await ActivityLog.create({
      userId,
      action: 'PROFILE_UPDATED',
      entityType: 'USER',
      entityId: user._id,
      details: update,
    });

    return user;
  }

  static async getSettings(userId) {
    let settings = await UserSettings.findOne({ userId });
    if (!settings) {
      settings = await UserSettings.create({ userId });
    }
    return settings;
  }

  static async updateSettings(userId, settingsData) {
    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { $set: settingsData },
      { new: true, upsert: true, runValidators: true }
    );

    await ActivityLog.create({
      userId,
      action: 'SETTINGS_UPDATED',
      entityType: 'SETTINGS',
      entityId: settings._id,
    });

    return settings;
  }

  static async getUserActivityLogs(userId, limit = 20) {
    return await ActivityLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = UserService;
