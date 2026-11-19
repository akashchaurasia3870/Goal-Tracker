const express = require('express');
const MilestoneController = require('../controllers/milestone.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  createMilestoneSchema,
  updateMilestoneSchema,
  completeMilestoneSchema,
  reorderMilestoneSchema,
  milestoneQuerySchema,
} = require('../validators/milestone.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createMilestoneSchema), MilestoneController.create);
router.get('/', validate(milestoneQuerySchema, 'query'), MilestoneController.getAll);
router.get('/:id', MilestoneController.getById);
router.put('/:id', validate(updateMilestoneSchema), MilestoneController.update);
router.delete('/:id', MilestoneController.delete);
router.patch('/:id/complete', validate(completeMilestoneSchema), MilestoneController.complete);
router.patch('/:id/reopen', MilestoneController.reopen);
router.patch('/:id/reorder', validate(reorderMilestoneSchema), MilestoneController.reorder);

module.exports = router;
