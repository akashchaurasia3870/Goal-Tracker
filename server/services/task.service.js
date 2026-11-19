const Task = require('../models/Task');
const Milestone = require('../models/Milestone');
const Goal = require('../models/Goal');
const ActivityLog = require('../models/ActivityLog');
const MilestoneService = require('./milestone.service');

class TaskService {
  /**
   * Recalculate milestone progress and task counts
   */
  static async syncMilestoneProgress(milestoneId) {
    if (!milestoneId) return;

    const tasks = await Task.find({ milestoneId, isArchived: false });
    const tasksCount = tasks.length;
    const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;

    const progress = tasksCount > 0 ? Math.round((completedTasksCount / tasksCount) * 100) : 0;
    const updateData = { tasksCount, completedTasksCount, progress };

    // Rule 8: When all required tasks within a milestone are completed, automatically mark the milestone as completed
    if (tasksCount > 0 && completedTasksCount === tasksCount) {
      updateData.status = 'Completed';
      updateData.completedAt = new Date();
    } else if (tasksCount > 0 && completedTasksCount < tasksCount) {
      const current = await Milestone.findById(milestoneId);
      if (current && current.status === 'Completed') {
        updateData.status = 'In Progress';
      }
    }

    const updatedMilestone = await Milestone.findByIdAndUpdate(milestoneId, { $set: updateData }, { new: true });
    if (updatedMilestone && updatedMilestone.goalId) {
      await MilestoneService.recalculateGoalProgress(updatedMilestone.goalId);
    }
  }

  /**
   * Validate goal and milestone hierarchy ownership
   */
  static async validateHierarchy(userId, goalId, milestoneId) {
    if (goalId) {
      const goal = await Goal.findOne({ _id: goalId, userId });
      if (!goal) {
        const err = new Error('Selected goal does not exist or does not belong to you');
        err.statusCode = 404;
        throw err;
      }
    }

    if (milestoneId) {
      const milestone = await Milestone.findOne({ _id: milestoneId, userId });
      if (!milestone) {
        const err = new Error('Selected milestone does not exist or does not belong to you');
        err.statusCode = 404;
        throw err;
      }
      if (goalId && milestone.goalId.toString() !== goalId.toString()) {
        const err = new Error('The selected milestone does not belong to the selected goal');
        err.statusCode = 400;
        throw err;
      }
    }
  }

  /**
   * Create a new task
   */
  static async createTask(userId, data) {
    await TaskService.validateHierarchy(userId, data.goalId, data.milestoneId);

    const task = await Task.create({
      ...data,
      userId,
      goalId: data.goalId || null,
      milestoneId: data.milestoneId || null,
      completedAt: data.status === 'Completed' ? new Date() : undefined,
    });

    await ActivityLog.create({
      userId,
      action: 'TASK_CREATED',
      entityType: 'TASK',
      entityId: task._id,
      details: { title: task.title, goalId: task.goalId, milestoneId: task.milestoneId },
    });

    if (task.milestoneId) {
      await TaskService.syncMilestoneProgress(task.milestoneId);
    }

    return task;
  }

  /**
   * Get all tasks with filtering, search, and sorting
   */
  static async getTasks(userId, query = {}) {
    const filter = { userId };

    if (query.isArchived !== undefined) {
      filter.isArchived = query.isArchived === 'true';
    } else {
      filter.isArchived = false;
    }

    if (query.isStandalone === 'true') {
      filter.goalId = null;
      filter.milestoneId = null;
    } else {
      if (query.goalId) filter.goalId = query.goalId;
      if (query.milestoneId) filter.milestoneId = query.milestoneId;
    }

    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }

    if (query.priority && query.priority !== 'All') {
      filter.priority = query.priority;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.isMyDay === 'true') {
      filter.isMyDay = true;
    }

    if (query.search && query.search.trim()) {
      filter.$or = [
        { title: { $regex: query.search.trim(), $options: 'i' } },
        { description: { $regex: query.search.trim(), $options: 'i' } },
        { tags: { $in: [new RegExp(query.search.trim(), 'i')] } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder;

    return await Task.find(filter)
      .populate('goalId', 'title color category')
      .populate('milestoneId', 'title status order')
      .sort(sortOptions);
  }

  /**
   * Get single task by ID
   */
  static async getTaskById(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, userId })
      .populate('goalId', 'title color category')
      .populate('milestoneId', 'title status order');

    if (!task) {
      const err = new Error('Task not found or access denied');
      err.statusCode = 404;
      throw err;
    }
    return task;
  }

  /**
   * Update task
   */
  static async updateTask(userId, taskId, data) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      const err = new Error('Task not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    const oldMilestoneId = task.milestoneId;
    await TaskService.validateHierarchy(userId, data.goalId || task.goalId, data.milestoneId || task.milestoneId);

    if (data.status === 'Completed' && task.status !== 'Completed') {
      data.completedAt = new Date();
    } else if (data.status && data.status !== 'Completed' && task.status === 'Completed') {
      data.completedAt = null;
    }

    Object.assign(task, data);
    await task.save();

    await ActivityLog.create({
      userId,
      action: 'TASK_UPDATED',
      entityType: 'TASK',
      entityId: task._id,
      details: { title: task.title, status: task.status },
    });

    // Sync old and new milestones
    if (oldMilestoneId) {
      await TaskService.syncMilestoneProgress(oldMilestoneId);
    }
    if (task.milestoneId && task.milestoneId.toString() !== oldMilestoneId?.toString()) {
      await TaskService.syncMilestoneProgress(task.milestoneId);
    }

    return task;
  }

  /**
   * Toggle completion status
   */
  static async toggleComplete(userId, taskId) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      const err = new Error('Task not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    const isCompleting = task.status !== 'Completed';
    task.status = isCompleting ? 'Completed' : 'Todo';
    task.completedAt = isCompleting ? new Date() : null;
    await task.save();

    await ActivityLog.create({
      userId,
      action: isCompleting ? 'TASK_COMPLETED' : 'TASK_REOPENED',
      entityType: 'TASK',
      entityId: task._id,
      details: { title: task.title },
    });

    if (task.milestoneId) {
      await TaskService.syncMilestoneProgress(task.milestoneId);
    }

    return task;
  }

  /**
   * Toggle checklist item
   */
  static async toggleChecklistItem(userId, taskId, itemId, isCompleted) {
    const task = await Task.findOne({ _id: taskId, userId });
    if (!task) {
      const err = new Error('Task not found');
      err.statusCode = 404;
      throw err;
    }

    const item = task.checklist.id(itemId);
    if (!item) {
      const err = new Error('Checklist item not found');
      err.statusCode = 404;
      throw err;
    }

    item.isCompleted = isCompleted;
    await task.save();

    return task;
  }

  /**
   * Delete task
   */
  static async deleteTask(userId, taskId) {
    const task = await Task.findOneAndDelete({ _id: taskId, userId });
    if (!task) {
      const err = new Error('Task not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    await ActivityLog.create({
      userId,
      action: 'TASK_DELETED',
      entityType: 'TASK',
      entityId: task._id,
      details: { title: task.title },
    });

    if (task.milestoneId) {
      await TaskService.syncMilestoneProgress(task.milestoneId);
    }

    return { message: 'Task deleted successfully' };
  }

  /**
   * Bulk action on multiple tasks
   */
  static async bulkAction(userId, { taskIds, action, payload }) {
    const tasks = await Task.find({ _id: { $in: taskIds }, userId });
    const affectedMilestoneIds = new Set();

    tasks.forEach((t) => {
      if (t.milestoneId) affectedMilestoneIds.add(t.milestoneId.toString());
    });

    if (action === 'complete') {
      await Task.updateMany(
        { _id: { $in: taskIds }, userId },
        { $set: { status: 'Completed', completedAt: new Date() } }
      );
    } else if (action === 'reopen') {
      await Task.updateMany(
        { _id: { $in: taskIds }, userId },
        { $set: { status: 'Todo', completedAt: null } }
      );
    } else if (action === 'delete') {
      await Task.deleteMany({ _id: { $in: taskIds }, userId });
    } else if (action === 'setPriority' && payload?.priority) {
      await Task.updateMany(
        { _id: { $in: taskIds }, userId },
        { $set: { priority: payload.priority } }
      );
    } else if (action === 'setCategory' && payload?.category) {
      await Task.updateMany(
        { _id: { $in: taskIds }, userId },
        { $set: { category: payload.category } }
      );
    }

    // Sync all affected milestones
    for (const mId of affectedMilestoneIds) {
      await TaskService.syncMilestoneProgress(mId);
    }

    return { message: `Bulk action '${action}' applied to ${taskIds.length} tasks` };
  }
}

module.exports = TaskService;
