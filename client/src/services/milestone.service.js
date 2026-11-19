import api from './api';

export const milestoneService = {
  async getMilestones(params = {}) {
    return await api.get('/milestones', { params });
  },

  async getMilestoneById(id) {
    return await api.get(`/milestones/${id}`);
  },

  async createMilestone(data) {
    return await api.post('/milestones', data);
  },

  async updateMilestone(id, data) {
    return await api.put(`/milestones/${id}`, data);
  },

  async deleteMilestone(id) {
    return await api.delete(`/milestones/${id}`);
  },

  async completeMilestone(id, payload = {}) {
    return await api.patch(`/milestones/${id}/complete`, payload);
  },

  async reopenMilestone(id) {
    return await api.patch(`/milestones/${id}/reopen`);
  },

  async reorderMilestone(id, direction) {
    return await api.patch(`/milestones/${id}/reorder`, { direction });
  },
};

export default milestoneService;
