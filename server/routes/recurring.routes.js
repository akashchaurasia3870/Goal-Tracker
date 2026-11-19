const express = require('express');
const RecurringController = require('../controllers/recurring.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  createRecurringTaskSchema,
  updateRecurringTaskSchema,
  occurrenceStatusSchema,
} = require('../validators/recurring.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createRecurringTaskSchema), RecurringController.create);
router.get('/', RecurringController.getAll);
router.get('/occurrences', RecurringController.getOccurrences);
router.patch('/occurrences/:id', validate(occurrenceStatusSchema), RecurringController.updateOccurrence);
router.patch('/:id/pause', RecurringController.pause);
router.patch('/:id/resume', RecurringController.resume);
router.delete('/:id', RecurringController.delete);

module.exports = router;
