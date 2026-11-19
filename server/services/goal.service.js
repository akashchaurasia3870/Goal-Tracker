const Goal = require('../models/Goal');
const ActivityLog = require('../models/ActivityLog');

class GoalService {
  /**
   * Create a new goal
   */
  static async createGoal(userId, data) {
    const goal = await Goal.create({
      ...data,
      userId,
    });

    await ActivityLog.create({
      userId,
      action: 'GOAL_CREATED',
      entityType: 'GOAL',
      entityId: goal._id,
      details: { title: goal.title, category: goal.category },
    });

    return goal;
  }

  /**
   * Get all goals for user with filters and search
   */
  static async getGoals(userId, query = {}) {
    const filter = { userId };

    if (query.isArchived !== undefined) {
      filter.isArchived = query.isArchived === 'true';
    } else {
      filter.isArchived = false; // Default: hide archived goals
    }

    if (query.isPinned !== undefined) {
      filter.isPinned = query.isPinned === 'true';
    }

    if (query.category && query.category !== 'All') {
      filter.category = query.category;
    }

    if (query.status && query.status !== 'All') {
      filter.status = query.status;
    }

    if (query.priority && query.priority !== 'All') {
      filter.priority = query.priority;
    }

    if (query.search && query.search.trim()) {
      filter.$or = [
        { title: { $regex: query.search.trim(), $options: 'i' } },
        { description: { $regex: query.search.trim(), $options: 'i' } },
      ];
    }

    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.order === 'asc' ? 1 : -1;
    const sortOptions = {};

    // Pinned goals appear first by default
    sortOptions.isPinned = -1;
    sortOptions[sortBy] = sortOrder;

    const goals = await Goal.find(filter).sort(sortOptions);

    // Annotate with dynamic status (e.g. overdue check)
    const now = new Date();
    return goals.map((goal) => {
      const g = goal.toObject();
      g.isOverdue = g.status !== 'Completed' && new Date(g.targetDate) < now;
      return g;
    });
  }

  /**
   * Get single goal by ID with ownership check
   */
  static async getGoalById(userId, goalId) {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      const err = new Error('Goal not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    const g = goal.toObject();
    const now = new Date();
    g.isOverdue = g.status !== 'Completed' && new Date(g.targetDate) < now;
    g.daysRemaining = Math.ceil((new Date(g.targetDate) - now) / (1000 * 60 * 60 * 24));

    return g;
  }

  /**
   * Update goal
   */
  static async updateGoal(userId, goalId, data) {
    // If progress reaches 100%, optionally set status to Completed
    if (data.progress === 100 && (!data.status || data.status === 'In Progress')) {
      data.status = 'Completed';
    }

    const goal = await Goal.findOneAndUpdate(
      { _id: goalId, userId },
      { $set: data },
      { new: true, runValidators: true }
    );

    if (!goal) {
      const err = new Error('Goal not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    await ActivityLog.create({
      userId,
      action: 'GOAL_UPDATED',
      entityType: 'GOAL',
      entityId: goal._id,
      details: { title: goal.title, status: goal.status, progress: goal.progress },
    });

    return goal;
  }

  /**
   * Delete goal
   */
  static async deleteGoal(userId, goalId) {
    const goal = await Goal.findOneAndDelete({ _id: goalId, userId });
    if (!goal) {
      const err = new Error('Goal not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    await ActivityLog.create({
      userId,
      action: 'GOAL_DELETED',
      entityType: 'GOAL',
      entityId: goal._id,
      details: { title: goal.title },
    });

    return { message: 'Goal deleted successfully' };
  }

  /**
   * Toggle Pin status
   */
  static async togglePin(userId, goalId) {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      const err = new Error('Goal not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    goal.isPinned = !goal.isPinned;
    await goal.save();

    return goal;
  }

  /**
   * Toggle Archive status
   */
  static async toggleArchive(userId, goalId) {
    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) {
      const err = new Error('Goal not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    goal.isArchived = !goal.isArchived;
    await goal.save();

    await ActivityLog.create({
      userId,
      action: goal.isArchived ? 'GOAL_ARCHIVED' : 'GOAL_RESTORED',
      entityType: 'GOAL',
      entityId: goal._id,
      details: { title: goal.title },
    });

    return goal;
  }

  /**
   * Duplicate goal
   */
  static async duplicateGoal(userId, goalId) {
    const original = await Goal.findOne({ _id: goalId, userId });
    if (!original) {
      const err = new Error('Goal not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    const duplicated = await Goal.create({
      userId,
      title: `${original.title} (Copy)`,
      description: original.description,
      category: original.category,
      priority: original.priority,
      startDate: new Date(),
      targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default +30 days
      status: 'Not Started',
      color: original.color,
      progress: 0,
      notes: original.notes,
      tags: original.tags,
    });

    await ActivityLog.create({
      userId,
      action: 'GOAL_DUPLICATED',
      entityType: 'GOAL',
      entityId: duplicated._id,
      details: { originalId: original._id, newTitle: duplicated.title },
    });

    return duplicated;
  }

  /**
   * Goal metrics overview
   */
  static async getSummary(userId) {
    const goals = await Goal.find({ userId, isArchived: false });
    const now = new Date();

    const total = goals.length;
    const completed = goals.filter((g) => g.status === 'Completed').length;
    const inProgress = goals.filter((g) => g.status === 'In Progress').length;
    const overdue = goals.filter((g) => g.status !== 'Completed' && new Date(g.targetDate) < now).length;
    const avgProgress = total > 0 ? Math.round(goals.reduce((acc, g) => acc + (g.progress || 0), 0) / total) : 0;

    return {
      total,
      completed,
      inProgress,
      overdue,
      avgProgress,
    };
  }
}

module.exports = GoalService;
