const express = require('express');
const CalendarController = require('../controllers/calendar.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', CalendarController.getEvents);

module.exports = router;
