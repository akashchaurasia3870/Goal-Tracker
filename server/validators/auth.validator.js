const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['User', 'Admin']).optional().default('User'),
});

const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
  avatar: z.string().url('Avatar must be a valid URL').or(z.literal('')).optional(),
});

const updateSettingsSchema = z.object({
  timezone: z.string().optional(),
  dateFormat: z.enum(['YYYY-MM-DD', 'DD/MM/YYYY', 'MM/DD/YYYY']).optional(),
  defaultTaskView: z.enum(['list', 'board', 'compact']).optional(),
  defaultReminderTime: z.string().optional(),
  theme: z.enum(['light', 'dark', 'system']).optional(),
  weekStartDay: z.enum(['monday', 'sunday', 'saturday']).optional(),
  xpEnabled: z.boolean().optional(),
  notifications: z
    .object({
      emailAlerts: z.boolean().optional(),
      taskReminders: z.boolean().optional(),
      milestoneUpdates: z.boolean().optional(),
      goalDeadlines: z.boolean().optional(),
    })
    .optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema,
  updateSettingsSchema,
};
