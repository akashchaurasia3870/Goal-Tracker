const express = require('express');
const UserController = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  updateProfileSchema,
  changePasswordSchema,
  updateSettingsSchema,
} = require('../validators/auth.validator');

const router = express.Router();

// All user routes require authentication
router.use(authenticate);

router.get('/profile', UserController.getProfile);
router.put('/profile', validate(updateProfileSchema), UserController.updateProfile);
router.put('/change-password', validate(changePasswordSchema), UserController.changePassword);
router.get('/settings', UserController.getSettings);
router.put('/settings', validate(updateSettingsSchema), UserController.updateSettings);
router.get('/activity-logs', UserController.getActivityLogs);

module.exports = router;
