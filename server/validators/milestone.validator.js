const { z } = require('zod');

const createMilestoneSchema = z.object({
  goalId: z.string().min(1, 'Goal ID is required'),
  title: z.string().min(2, 'Title must be at least 2 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().optional().default(''),
  startDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled']).optional().default('In Progress'),
  order: z.number().optional().default(0),
  reward: z.string().optional().default(''),
  notes: z.string().optional().default(''),
});

const updateMilestoneSchema = createMilestoneSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
  rewardClaimed: z.boolean().optional(),
});

const completeMilestoneSchema = z.object({
  completionNotes: z.string().optional().default(''),
  claimReward: z.boolean().optional().default(true),
});

const reorderMilestoneSchema = z.object({
  direction: z.enum(['up', 'down']),
});

const milestoneQuerySchema = z.object({
  goalId: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical', 'All']).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled', 'All']).optional(),
  search: z.string().optional(),
});

module.exports = {
  createMilestoneSchema,
  updateMilestoneSchema,
  completeMilestoneSchema,
  reorderMilestoneSchema,
  milestoneQuerySchema,
};
