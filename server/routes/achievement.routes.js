const express = require('express');
const AchievementController = require('../controllers/achievement.controller');
const { authenticate } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/', AchievementController.getAchievements);
router.get('/rewards', AchievementController.getRewards);
router.post('/rewards', AchievementController.claimReward);

module.exports = router;
