/**
 * Broiler Record Service
 * Single Source of Truth: Reconstructs broiler record history directly from saved transactions.
 */

import { farmService } from './farmService.js';
import { transactionService } from './transactionService.js';
import { buildBroilerRecords } from '../utils/recordBuilder.js';
import { appConfig } from '../config/appConfig.js';

export const broilerRecordService = {
  /**
   * Rebuilds and retrieves broiler records for a farm and batch.
   */
  async getBroilerRecords(farmId, batchNumber, filter = {}) {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.get(`${apiConfig.ENDPOINTS.BROILER_RECORDS}?farmId=${farmId}&batch=${batchNumber}`)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    if (!farmId) return [];

    const batch = await farmService.getActiveBatchForFarm(farmId);
    if (!batch) return [];

    const effectiveBatchNumber = batchNumber || batch.batchNumber;
    const transactions = await transactionService.getTransactionsByBatch(farmId, effectiveBatchNumber);

    let records = buildBroilerRecords(batch, transactions);

    // Apply optional date-range filter (From / To)
    if (filter.fromDate) {
      records = records.filter(r => r.date >= filter.fromDate);
    }
    if (filter.toDate) {
      records = records.filter(r => r.date <= filter.toDate);
    }

    return records;
  },

  /**
   * Retrieves single record details by id.
   */
  async getBroilerRecordDetails(recordId, farmId, batchNumber) {
    const records = await this.getBroilerRecords(farmId, batchNumber);
    return records.find(r => r.id === recordId || r.transactionId === recordId) || null;
  },
};

export default broilerRecordService;
