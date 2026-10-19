/**
 * Branch Service
 * Loads branches from generated master data (branches.json).
 */

import branchesData from '../data/generated/branches.json' with { type: 'json' };
import { appConfig } from '../config/appConfig.js';

export const branchService = {
  async getBranches(query = '') {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.get(apiConfig.ENDPOINTS.BRANCHES)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    let branches = Array.isArray(branchesData) ? branchesData : [];

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      branches = branches.filter(
        b => b.name.toLowerCase().includes(q) || (b.code && b.code.toLowerCase().includes(q))
      );
    }

    return branches;
  },

  async getBranchById(branchId) {
    const branches = await this.getBranches();
    return branches.find(b => b.id === branchId) || null;
  },
};

export default branchService;
