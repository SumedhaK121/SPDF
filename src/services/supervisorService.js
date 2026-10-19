/**
 * Supervisor Service
 * Strictly filters supervisors belonging to a chosen branch.
 */

import supervisorsData from '../data/generated/supervisors.json' with { type: 'json' };
import { appConfig } from '../config/appConfig.js';

export const supervisorService = {
  async getSupervisorsByBranch(branchId, query = '') {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.get(`${apiConfig.ENDPOINTS.SUPERVISORS}?branchId=${branchId}`)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    if (!branchId) return [];

    let supervisors = (Array.isArray(supervisorsData) ? supervisorsData : []).filter(
      s => s.branchId === branchId
    );

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      supervisors = supervisors.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          (s.employeeId && s.employeeId.toLowerCase().includes(q))
      );
    }

    return supervisors;
  },

  async getSupervisorById(supervisorId) {
    const all = Array.isArray(supervisorsData) ? supervisorsData : [];
    return all.find(s => s.id === supervisorId) || null;
  },
};

export default supervisorService;
