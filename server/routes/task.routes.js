const express = require('express');
const TaskController = require('../controllers/task.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  createTaskSchema,
  updateTaskSchema,
  checklistToggleSchema,
  bulkActionSchema,
  taskQuerySchema,
} = require('../validators/task.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createTaskSchema), TaskController.create);
router.get('/', validate(taskQuerySchema, 'query'), TaskController.getAll);
router.get('/my-day', TaskController.getMyDay);
router.get('/upcoming', TaskController.getUpcoming);
router.get('/:id', TaskController.getById);
router.put('/:id', validate(updateTaskSchema), TaskController.update);
router.delete('/:id', TaskController.delete);
router.patch('/:id/complete', TaskController.toggleComplete);
router.patch('/:id/checklist', validate(checklistToggleSchema), TaskController.toggleChecklistItem);
router.post('/bulk', validate(bulkActionSchema), TaskController.bulkAction);

module.exports = router;
