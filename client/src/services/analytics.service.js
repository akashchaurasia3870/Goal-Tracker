import api from './api';

export const analyticsService = {
  async getOverview(params = {}) {
    return await api.get('/analytics/overview', { params });
  },
};

export default analyticsService;
