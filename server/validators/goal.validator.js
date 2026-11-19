const { z } = require('zod');

const createGoalSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150, 'Title cannot exceed 150 characters'),
  description: z.string().optional().default(''),
  category: z.enum(['Learning', 'Career', 'Personal', 'Health', 'Work']).optional().default('Learning'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  startDate: z.string().or(z.date()).optional(),
  targetDate: z.string().or(z.date()),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled']).optional().default('In Progress'),
  coverImage: z.string().url().or(z.literal('')).optional().default(''),
  color: z.string().regex(/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/, 'Must be a valid hex color').optional().default('#3b82f6'),
  isPinned: z.boolean().optional().default(false),
  notes: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

const updateGoalSchema = createGoalSchema.partial().extend({
  progress: z.number().min(0).max(100).optional(),
  isArchived: z.boolean().optional(),
});

const goalQuerySchema = z.object({
  category: z.enum(['Learning', 'Career', 'Personal', 'Health', 'Work', 'All']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical', 'All']).optional(),
  status: z.enum(['Not Started', 'In Progress', 'Completed', 'On Hold', 'Cancelled', 'All']).optional(),
  isPinned: z.string().optional(),
  isArchived: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['targetDate', 'createdAt', 'priority', 'progress', 'title']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  createGoalSchema,
  updateGoalSchema,
  goalQuerySchema,
};
