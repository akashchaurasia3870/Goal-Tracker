const cron = require('node-cron');
const RecurringService = require('../services/recurring.service');
const Task = require('../models/Task');
const NotificationService = require('../services/notification.service');

const initCronJobs = () => {
  console.log('[Scheduler] Initializing automated recurring task & alert jobs...');

  // Run initial occurrence check on startup
  RecurringService.generateOccurrencesForDate(new Date())
    .then((count) => {
      if (count > 0) {
        console.log(`[Scheduler] Startup check generated ${count} recurring task occurrences.`);
      }
    })
    .catch((err) => console.error('[Scheduler Error] Startup occurrence generation failed:', err.message));

  // Daily Cron Job at midnight: "0 0 * * *"
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('[Scheduler] Running daily midnight recurrence generation...');
      const generated = await RecurringService.generateOccurrencesForDate(new Date());
      console.log(`[Scheduler] Daily occurrences generated: ${generated}`);

      // Check for overdue tasks and dispatch alerts
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const overdueTasks = await Task.find({
        status: { $ne: 'Completed' },
        dueDate: { $lt: new Date() },
        isArchived: false,
      }).limit(50);

      for (const t of overdueTasks) {
        await NotificationService.createNotification({
          userId: t.userId,
          title: 'Overdue Task Alert',
          message: `Task "${t.title}" is overdue. Reschedule or complete it in My Day.`,
          type: 'overdue',
          entityType: 'TASK',
          entityId: t._id,
        }).catch(() => {});
      }
    } catch (error) {
      console.error('[Scheduler Error]', error.message);
    }
  });
};

module.exports = initCronJobs;
