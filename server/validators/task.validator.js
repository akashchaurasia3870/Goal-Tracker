const { z } = require('zod');

const checklistItemValidator = z.object({
  _id: z.string().optional(),
  text: z.string().min(1, 'Checklist item text cannot be empty'),
  isCompleted: z.boolean().optional().default(false),
});

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required').max(200, 'Title cannot exceed 200 characters'),
  description: z.string().optional().default(''),
  goalId: z.string().nullable().optional(),
  milestoneId: z.string().nullable().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  status: z.enum(['Todo', 'In Progress', 'Completed']).optional().default('Todo'),
  startDate: z.string().or(z.date()).optional(),
  dueDate: z.string().or(z.date()).optional(),
  reminder: z.string().or(z.date()).optional(),
  category: z.string().optional().default('Work'),
  estimatedTime: z.number().min(0).optional().default(0),
  actualTime: z.number().min(0).optional().default(0),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().default(''),
  checklist: z.array(checklistItemValidator).optional().default([]),
  isMyDay: z.boolean().optional().default(false),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  order: z.number().optional(),
  isArchived: z.boolean().optional(),
});

const statusUpdateSchema = z.object({
  status: z.enum(['Todo', 'In Progress', 'Completed']),
});

const checklistToggleSchema = z.object({
  itemId: z.string().min(1, 'Checklist item ID is required'),
  isCompleted: z.boolean(),
});

const bulkActionSchema = z.object({
  taskIds: z.array(z.string()).min(1, 'At least one task must be selected'),
  action: z.enum(['complete', 'reopen', 'delete', 'setPriority', 'setCategory']),
  payload: z.record(z.any()).optional(),
});

const taskQuerySchema = z.object({
  goalId: z.string().optional(),
  milestoneId: z.string().optional(),
  isStandalone: z.string().optional(), // 'true' for independent tasks
  status: z.enum(['Todo', 'In Progress', 'Completed', 'All']).optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical', 'All']).optional(),
  category: z.string().optional(),
  isArchived: z.string().optional(),
  isMyDay: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['dueDate', 'priority', 'status', 'createdAt', 'title']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
});

module.exports = {
  createTaskSchema,
  updateTaskSchema,
  statusUpdateSchema,
  checklistToggleSchema,
  bulkActionSchema,
  taskQuerySchema,
};
