/**
 * Feed Service
 * Manages feed ledgers for batches and farms.
 */

import { appConfig } from '../config/appConfig.js';
import { storageService } from './storageService.js';
import { createDemoFeedLedger } from '../data/mockFeedLedger.js';

export const feedService = {
  async getFeedLedger(batch) {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.get(`${apiConfig.ENDPOINTS.FEED_LEDGER}?batchId=${batch.id}`)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    if (!batch) return [];

    const allLedgers = (await storageService.getItem(appConfig.storageKeys.FEED_LEDGER)) || {};
    if (allLedgers[batch.id]) {
      return allLedgers[batch.id];
    }

    // Default seeded feed ledger with receipts + tomorrow's late feed entry
    const initialLedger = createDemoFeedLedger(batch);
    allLedgers[batch.id] = initialLedger;
    await storageService.setItem(appConfig.storageKeys.FEED_LEDGER, allLedgers);

    return initialLedger;
  },

  async addFeedLedgerEntry(batchId, entry) {
    const allLedgers = (await storageService.getItem(appConfig.storageKeys.FEED_LEDGER)) || {};
    const ledger = allLedgers[batchId] || [];
    ledger.push(entry);
    allLedgers[batchId] = ledger;
    await storageService.setItem(appConfig.storageKeys.FEED_LEDGER, allLedgers);
    return entry;
  },
};

export default feedService;
