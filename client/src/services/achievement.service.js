import api from './api';

export const achievementService = {
  async getAchievements() {
    return await api.get('/achievements');
  },

  async getClaimedRewards() {
    return await api.get('/achievements/rewards');
  },

  async claimReward(payload) {
    return await api.post('/achievements/rewards', payload);
  },
};

export default achievementService;
