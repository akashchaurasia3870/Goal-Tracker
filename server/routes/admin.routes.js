const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');

// Protect all routes with authentication and Admin authorization
router.use(authenticate);
router.use(authorize('Admin'));

// User management endpoints
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.patch('/users/:id/role', adminController.updateUserRole);

// System statistics & Health
router.get('/stats', adminController.getSystemStats);

// Global Audit logs
router.get('/activity-logs', adminController.getActivityLogs);

module.exports = router;
