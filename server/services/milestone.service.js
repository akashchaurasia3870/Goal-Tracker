const Milestone = require('../models/Milestone');
const Goal = require('../models/Goal');
const ActivityLog = require('../models/ActivityLog');

class MilestoneService {
  /**
   * Recalculate parent Goal progress based on its milestones
   */
  static async recalculateGoalProgress(goalId) {
    const milestones = await Milestone.find({
      goalId,
      status: { $ne: 'Cancelled' },
    });

    if (milestones.length === 0) return;

    const totalProgress = milestones.reduce((sum, m) => sum + (m.progress || 0), 0);
    const avgProgress = Math.round(totalProgress / milestones.length);

    const allCompleted = milestones.every((m) => m.status === 'Completed');
    const updateData = { progress: avgProgress };
    if (allCompleted && milestones.length > 0) {
      updateData.status = 'Completed';
    }

    await Goal.findByIdAndUpdate(goalId, { $set: updateData });
  }

  /**
   * Create milestone under a goal
   */
  static async createMilestone(userId, data) {
    // Validate parent goal exists and belongs to the user
    const goal = await Goal.findOne({ _id: data.goalId, userId });
    if (!goal) {
      const err = new Error('Parent goal not found or does not belong to you');
      err.statusCode = 404;
      throw err;
    }

    // Determine default order
    if (data.order === undefined || data.order === 0) {
      const count = await Milestone.countDocuments({ goalId: data.goalId });
      data.order = count + 1;
    }

    const milestone = await Milestone.create({
      ...data,
      userId,
    });

    await ActivityLog.create({
      userId,
      action: 'MILESTONE_CREATED',
      entityType: 'MILESTONE',
      entityId: milestone._id,
      details: { title: milestone.title, goalId: goal._id, goalTitle: goal.title },
    });

    await MilestoneService.recalculateGoalProgress(goal._id);

    return milestone;
  }

  /**
   * Get milestones with filters
   */
  static async getMilestones(userId, query = {}) {
    const filter = { userId };

    if (query.goalId) {
      filter.goalId = query.goalId;
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

    return await Milestone.find(filter)
      .populate('goalId', 'title color category')
      .sort({ goalId: 1, order: 1 });
  }

  /**
   * Get single milestone by ID
   */
  static async getMilestoneById(userId, milestoneId) {
    const milestone = await Milestone.findOne({ _id: milestoneId, userId }).populate(
      'goalId',
      'title color category targetDate'
    );
    if (!milestone) {
      const err = new Error('Milestone not found or access denied');
      err.statusCode = 404;
      throw err;
    }
    return milestone;
  }

  /**
   * Update milestone
   */
  static async updateMilestone(userId, milestoneId, data) {
    const milestone = await Milestone.findOne({ _id: milestoneId, userId });
    if (!milestone) {
      const err = new Error('Milestone not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    // If goalId changed, validate new parent goal
    if (data.goalId && data.goalId.toString() !== milestone.goalId.toString()) {
      const newGoal = await Goal.findOne({ _id: data.goalId, userId });
      if (!newGoal) {
        const err = new Error('Target goal not found or does not belong to you');
        err.statusCode = 404;
        throw err;
      }
    }

    // Auto mark completed if progress reached 100%
    if (data.progress === 100 && milestone.status !== 'Completed') {
      data.status = 'Completed';
      data.completedAt = new Date();
    }

    Object.assign(milestone, data);
    await milestone.save();

    await ActivityLog.create({
      userId,
      action: 'MILESTONE_UPDATED',
      entityType: 'MILESTONE',
      entityId: milestone._id,
      details: { title: milestone.title, status: milestone.status, progress: milestone.progress },
    });

    await MilestoneService.recalculateGoalProgress(milestone.goalId);

    return milestone;
  }

  /**
   * Mark milestone as Completed with optional custom completion notes & reward claim
   */
  static async completeMilestone(userId, milestoneId, { completionNotes, claimReward }) {
    const milestone = await Milestone.findOne({ _id: milestoneId, userId });
    if (!milestone) {
      const err = new Error('Milestone not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    milestone.status = 'Completed';
    milestone.progress = 100;
    milestone.completedAt = new Date();
    if (completionNotes) {
      milestone.completionNotes = completionNotes;
    }
    if (claimReward && milestone.reward) {
      milestone.rewardClaimed = true;
    }

    await milestone.save();

    await ActivityLog.create({
      userId,
      action: 'MILESTONE_COMPLETED',
      entityType: 'MILESTONE',
      entityId: milestone._id,
      details: {
        title: milestone.title,
        reward: milestone.reward,
        rewardClaimed: milestone.rewardClaimed,
      },
    });

    await MilestoneService.recalculateGoalProgress(milestone.goalId);

    return milestone;
  }

  /**
   * Reopen a completed milestone
   */
  static async reopenMilestone(userId, milestoneId) {
    const milestone = await Milestone.findOne({ _id: milestoneId, userId });
    if (!milestone) {
      const err = new Error('Milestone not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    milestone.status = 'In Progress';
    milestone.completedAt = undefined;
    milestone.rewardClaimed = false;

    await milestone.save();

    await ActivityLog.create({
      userId,
      action: 'MILESTONE_REOPENED',
      entityType: 'MILESTONE',
      entityId: milestone._id,
      details: { title: milestone.title },
    });

    await MilestoneService.recalculateGoalProgress(milestone.goalId);

    return milestone;
  }

  /**
   * Reorder milestone within goal (swap with neighbor)
   */
  static async reorderMilestone(userId, milestoneId, direction) {
    const current = await Milestone.findOne({ _id: milestoneId, userId });
    if (!current) {
      const err = new Error('Milestone not found');
      err.statusCode = 404;
      throw err;
    }

    const sortOrder = direction === 'up' ? { order: -1 } : { order: 1 };
    const operator = direction === 'up' ? { $lt: current.order } : { $gt: current.order };

    const neighbor = await Milestone.findOne({
      goalId: current.goalId,
      order: operator,
    }).sort(sortOrder);

    if (neighbor) {
      const tempOrder = current.order;
      current.order = neighbor.order;
      neighbor.order = tempOrder;

      await current.save();
      await neighbor.save();
    }

    return await Milestone.find({ goalId: current.goalId }).sort({ order: 1 });
  }

  /**
   * Delete milestone
   */
  static async deleteMilestone(userId, milestoneId) {
    const milestone = await Milestone.findOneAndDelete({ _id: milestoneId, userId });
    if (!milestone) {
      const err = new Error('Milestone not found or access denied');
      err.statusCode = 404;
      throw err;
    }

    await ActivityLog.create({
      userId,
      action: 'MILESTONE_DELETED',
      entityType: 'MILESTONE',
      entityId: milestone._id,
      details: { title: milestone.title },
    });

    await MilestoneService.recalculateGoalProgress(milestone.goalId);

    return { message: 'Milestone deleted successfully' };
  }
}

module.exports = MilestoneService;
