/**
 * Mock Active Batches Data Generator
 *
 * For each farm, generates ONE active demo batch:
 * - batchNumber: 'B-2026-01'
 * - startDate: 20 days prior to today (anchored so ages remain realistic)
 * - noOfChicks: 4,500
 * - birdsSold: 0
 * - saleWeight: 0
 * - medicineAmount: 1,250
 */

import { getTodayDateString, offsetDays } from '../utils/dateUtils.js';
import { appConfig } from '../config/appConfig.js';

/**
 * Creates an active demo batch for a farm.
 */
export function createDemoBatchForFarm(farm) {
  const today = getTodayDateString();
  const startDate = offsetDays(today, -appConfig.DEMO_BATCH_AGE_DAYS);

  return {
    id: `BATCH-${farm.id}`,
    farmId: farm.id,
    farmName: farm.farmName,
    farmCode: farm.farmCode,
    batchNumber: 'B-2026-01',
    startDate: startDate,
    noOfChicks: 4500,
    birdsSold: 0,
    saleWeight: 0,
    medicineAmount: 1250,
    feedIssuedKg: 0,
    isSampleData: true,
  };
}
