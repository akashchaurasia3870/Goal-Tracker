const Notification = require('../models/Notification');

class NotificationService {
  static async createNotification({ userId, title, message, type = 'system', entityType = 'SYSTEM', entityId }) {
    return await Notification.create({
      userId,
      title,
      message,
      type,
      entityType,
      entityId,
    });
  }

  static async getNotifications(userId, limit = 50) {
    const list = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return { notifications: list, unreadCount };
  }

  static async markAsRead(userId, id) {
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }
    return notification;
  }

  static async markAllAsRead(userId) {
    await Notification.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
    return { message: 'All notifications marked as read' };
  }

  static async delete(userId, id) {
    const notification = await Notification.findOneAndDelete({ _id: id, userId });
    if (!notification) {
      const err = new Error('Notification not found');
      err.statusCode = 404;
      throw err;
    }
    return { message: 'Notification deleted' };
  }
}

module.exports = NotificationService;
