const { z } = require('zod');

const createRecurringTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional().default(''),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']).optional().default('Medium'),
  category: z.string().optional().default('Routine'),
  frequency: z.enum(['daily', 'weekdays', 'weekly', 'monthly', 'custom']).default('daily'),
  interval: z.number().min(1).optional().default(1),
  selectedWeekdays: z.array(z.number().min(0).max(6)).optional().default([]),
  dayOfMonth: z.number().min(1).max(31).optional(),
  startDate: z.string().or(z.date()).optional(),
  endDate: z.string().or(z.date()).optional(),
  occurrencesLimit: z.number().min(1).optional(),
  reminderTime: z.string().optional().default('09:00'),
  timezone: z.string().optional().default('UTC'),
  tags: z.array(z.string()).optional().default([]),
});

const updateRecurringTaskSchema = createRecurringTaskSchema.partial().extend({
  status: z.enum(['active', 'paused', 'stopped']).optional(),
});

const occurrenceStatusSchema = z.object({
  status: z.enum(['pending', 'completed', 'skipped']),
  notes: z.string().optional(),
});

module.exports = {
  createRecurringTaskSchema,
  updateRecurringTaskSchema,
  occurrenceStatusSchema,
};
