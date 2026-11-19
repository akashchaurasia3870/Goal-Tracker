const RecurringTask = require('../models/RecurringTask');
const TaskOccurrence = require('../models/TaskOccurrence');
const ActivityLog = require('../models/ActivityLog');

class RecurringService {
  /**
   * Helper to determine if a date matches recurrence rule
   */
  static isMatchForDate(rule, date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);

    const start = new Date(rule.startDate);
    start.setHours(0, 0, 0, 0);
    if (d < start) return false;

    if (rule.endDate) {
      const end = new Date(rule.endDate);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }

    const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayOfMonth = d.getDate();

    switch (rule.frequency) {
      case 'daily':
        return true;
      case 'weekdays':
        return dayOfWeek >= 1 && dayOfWeek <= 5;
      case 'weekly':
        if (rule.selectedWeekdays && rule.selectedWeekdays.length > 0) {
          return rule.selectedWeekdays.includes(dayOfWeek);
        }
        return dayOfWeek === start.getDay();
      case 'monthly':
        if (rule.dayOfMonth) {
          return dayOfMonth === rule.dayOfMonth;
        }
        return dayOfMonth === start.getDate();
      case 'custom': {
        const diffDays = Math.round((d - start) / (1000 * 60 * 60 * 24));
        const interval = rule.interval || 1;
        return diffDays >= 0 && diffDays % interval === 0;
      }
      default:
        return false;
    }
  }

  /**
   * Generate occurrences for a specific date (idempotent)
   */
  static async generateOccurrencesForDate(targetDate = new Date()) {
    const activeRules = await RecurringTask.find({ status: 'active' });
    const target = new Date(targetDate);
    target.setHours(0, 0, 0, 0);

    let generatedCount = 0;

    for (const rule of activeRules) {
      if (rule.occurrencesLimit && rule.generatedCount >= rule.occurrencesLimit) {
        continue;
      }

      if (RecurringService.isMatchForDate(rule, target)) {
        try {
          await TaskOccurrence.findOneAndUpdate(
            { recurringTaskId: rule._id, dueDate: target },
            {
              $setOnInsert: {
                userId: rule.userId,
                recurringTaskId: rule._id,
                title: rule.title,
                dueDate: target,
                status: 'pending',
                priority: rule.priority,
                category: rule.category,
              },
            },
            { upsert: true, new: true }
          );

          await RecurringTask.findByIdAndUpdate(rule._id, { $inc: { generatedCount: 1 } });
          generatedCount++;
        } catch (err) {
          // If already exists due to unique index, ignore (idempotency guaranteed)
        }
      }
    }

    return generatedCount;
  }

  /**
   * Create recurring task rule & seed immediate occurrence
   */
  static async createRecurringTask(userId, data) {
    const recurringTask = await RecurringTask.create({
      ...data,
      userId,
    });

    await ActivityLog.create({
      userId,
      action: 'RECURRING_TASK_CREATED',
      entityType: 'RECURRING',
      entityId: recurringTask._id,
      details: { title: recurringTask.title, frequency: recurringTask.frequency },
    });

    // Generate occurrence for today if matching
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (RecurringService.isMatchForDate(recurringTask, today)) {
      await TaskOccurrence.findOneAndUpdate(
        { recurringTaskId: recurringTask._id, dueDate: today },
        {
          $setOnInsert: {
            userId,
            recurringTaskId: recurringTask._id,
            title: recurringTask.title,
            dueDate: today,
            status: 'pending',
            priority: recurringTask.priority,
            category: recurringTask.category,
          },
        },
        { upsert: true }
      );
    }

    return recurringTask;
  }

  /**
   * Get all recurring tasks
   */
  static async getRecurringTasks(userId) {
    return await RecurringTask.find({ userId }).sort({ createdAt: -1 });
  }

  /**
   * Get occurrences for a user (history and today)
   */
  static async getOccurrences(userId, query = {}) {
    const filter = { userId };
    if (query.recurringTaskId) {
      filter.recurringTaskId = query.recurringTaskId;
    }
    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      filter.dueDate = {};
      if (query.startDate) filter.dueDate.$gte = new Date(query.startDate);
      if (query.endDate) filter.dueDate.$lte = new Date(query.endDate);
    }

    return await TaskOccurrence.find(filter)
      .populate('recurringTaskId', 'frequency interval reminderTime')
      .sort({ dueDate: -1 });
  }

  /**
   * Complete, skip, or reopen an individual occurrence
   */
  static async updateOccurrenceStatus(userId, occurrenceId, status, notes = '') {
    const occurrence = await TaskOccurrence.findOne({ _id: occurrenceId, userId });
    if (!occurrence) {
      const err = new Error('Occurrence not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    occurrence.status = status;
    occurrence.completedAt = status === 'completed' ? new Date() : undefined;
    if (notes) occurrence.notes = notes;
    await occurrence.save();

    await ActivityLog.create({
      userId,
      action: `OCCURRENCE_${status.toUpperCase()}`,
      entityType: 'RECURRING',
      entityId: occurrence._id,
      details: { title: occurrence.title, dueDate: occurrence.dueDate },
    });

    return occurrence;
  }

  /**
   * Pause recurring task
   */
  static async pause(userId, id) {
    const task = await RecurringTask.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'paused' } },
      { new: true }
    );
    if (!task) {
      const err = new Error('Recurring task not found');
      err.statusCode = 404;
      throw err;
    }
    return task;
  }

  /**
   * Resume recurring task
   */
  static async resume(userId, id) {
    const task = await RecurringTask.findOneAndUpdate(
      { _id: id, userId },
      { $set: { status: 'active' } },
      { new: true }
    );
    if (!task) {
      const err = new Error('Recurring task not found');
      err.statusCode = 404;
      throw err;
    }
    return task;
  }

  /**
   * Delete recurring task & future occurrences
   */
  static async delete(userId, id) {
    const task = await RecurringTask.findOneAndDelete({ _id: id, userId });
    if (!task) {
      const err = new Error('Recurring task not found');
      err.statusCode = 404;
      throw err;
    }

    // Delete future uncompleted occurrences
    await TaskOccurrence.deleteMany({
      recurringTaskId: id,
      dueDate: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      status: 'pending',
    });

    return { message: 'Recurring task and pending occurrences removed' };
  }
}

module.exports = RecurringService;
