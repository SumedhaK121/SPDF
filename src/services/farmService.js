/**
 * Farm Service
 * Strictly retrieves farms belonging to a supervisor.
 * Manages active batch for each farm.
 */

import farmsData from '../data/generated/farms.json' with { type: 'json' };
import { appConfig } from '../config/appConfig.js';
import { storageService } from './storageService.js';
import { createDemoBatchForFarm } from '../data/mockBatches.js';

export const farmService = {
  async getFarmsBySupervisor(supervisorId, query = '') {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.get(`${apiConfig.ENDPOINTS.FARMS}?supervisorId=${supervisorId}`)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    if (!supervisorId) return [];

    let farms = (Array.isArray(farmsData) ? farmsData : []).filter(
      f => f.supervisorId === supervisorId
    );

    if (query && query.trim()) {
      const q = query.trim().toLowerCase();
      farms = farms.filter(
        f =>
          f.farmName.toLowerCase().includes(q) ||
          f.farmerName.toLowerCase().includes(q) ||
          (f.farmCode && f.farmCode.toLowerCase().includes(q)) ||
          (f.village && f.village.toLowerCase().includes(q))
      );
    }

    return farms;
  },

  async getFarmById(farmId) {
    const all = Array.isArray(farmsData) ? farmsData : [];
    return all.find(f => f.id === farmId) || null;
  },

  /**
   * Retrieves or creates the active demo batch for a farm.
   */
  async getActiveBatchForFarm(farmId) {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.get(`${apiConfig.ENDPOINTS.BATCHES}/active?farmId=${farmId}`)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    const farm = await this.getFarmById(farmId);
    if (!farm) return null;

    // Check if custom batch is stored in AsyncStorage
    const storedBatches = (await storageService.getItem(appConfig.storageKeys.BATCHES)) || {};
    if (storedBatches[farmId]) {
      return storedBatches[farmId];
    }

    // Default: generate demo batch anchored 20 days prior
    const defaultBatch = createDemoBatchForFarm(farm);
    storedBatches[farmId] = defaultBatch;
    await storageService.setItem(appConfig.storageKeys.BATCHES, storedBatches);

    return defaultBatch;
  },
};

export default farmService;
