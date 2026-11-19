const express = require('express');
const GoalController = require('../controllers/goal.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  createGoalSchema,
  updateGoalSchema,
  goalQuerySchema,
} = require('../validators/goal.validator');

const router = express.Router();

// All goal routes require authentication
router.use(authenticate);

router.post('/', validate(createGoalSchema), GoalController.create);
router.get('/', validate(goalQuerySchema, 'query'), GoalController.getAll);
router.get('/summary', GoalController.getSummary);
router.get('/:id', GoalController.getById);
router.put('/:id', validate(updateGoalSchema), GoalController.update);
router.delete('/:id', GoalController.delete);
router.patch('/:id/pin', GoalController.togglePin);
router.patch('/:id/archive', GoalController.toggleArchive);
router.post('/:id/duplicate', GoalController.duplicate);

module.exports = router;
