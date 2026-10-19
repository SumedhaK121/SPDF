/**
 * Daily Transaction Service
 * Manages saving and querying daily transactions with queue-based concurrency safety.
 */

import { appConfig } from '../config/appConfig.js';
import { formConfig } from '../config/formConfig.js';
import { storageService } from './storageService.js';
import { validateDailyTransaction } from '../utils/validation.js';
import { isToday } from '../utils/dateUtils.js';
import { parseSafeNumber } from '../utils/numberUtils.js';

// Async save queue to serialize rapid concurrent calls (prevents race conditions from double taps)
let saveQueuePromise = Promise.resolve();

export const transactionService = {
  /**
   * Retrieves all daily transactions from storage.
   */
  async getAllTransactions() {
    const txns = await storageService.getItem(appConfig.storageKeys.TRANSACTIONS);
    return Array.isArray(txns) ? txns : [];
  },

  /**
   * Retrieves daily transactions for a specific farm and batch.
   */
  async getTransactionsByBatch(farmId, batchNumber) {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.get(`${apiConfig.ENDPOINTS.TRANSACTIONS}?farmId=${farmId}&batch=${batchNumber}`)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    const all = await this.getAllTransactions();
    return all.filter(
      tx => tx.farmId === farmId && (!batchNumber || tx.batchNumber === batchNumber)
    );
  },

  /**
   * Retrieves metrics from the most recent transaction prior to currentDate.
   */
  async getYesterdayMetrics(farmId, batchNumber, currentDate) {
    const farmTxns = await this.getTransactionsByBatch(farmId, batchNumber);
    // Find earlier transactions sorted newest first
    const earlier = farmTxns
      .filter(tx => tx.date < currentDate)
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    if (earlier.length === 0) {
      return { yesterdayABW: '-', yesterdayMortality: '-' };
    }

    const last = earlier[0];
    return {
      yesterdayABW: last.averageBodyWeight ? `${last.averageBodyWeight} g` : '-',
      yesterdayMortality: last.todayTotalMortality !== undefined ? String(last.todayTotalMortality) : '-',
    };
  },

  /**
   * Saves a new Daily Transaction with queue protection and multi-layer validation.
   */
  async saveDailyTransaction(payload, context = {}) {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API call: apiClient.post(apiConfig.ENDPOINTS.TRANSACTIONS, payload)
      throw new Error('API not configured. Switch DATA_MODE to "demo".');
    }

    // Chain execution to save queue to serialize multiple submissions
    return new Promise((resolve, reject) => {
      saveQueuePromise = saveQueuePromise
        .then(async () => {
          try {
            const allTransactions = await this.getAllTransactions();

            // Layer 1: Today-Only Rule Enforcement (§6)
            if (!formConfig.ALLOW_BACKDATED_ENTRY && !isToday(payload.transactionDate)) {
              throw new Error(
                'Entries are allowed for today only. Backdated and future transactions are strictly blocked.'
              );
            }

            // Layer 2: One Transaction per Farm per Batch per Day (§6)
            const duplicate = allTransactions.find(
              tx =>
                tx.farmId === payload.farmId &&
                tx.date === payload.transactionDate &&
                (!payload.batchNumber || tx.batchNumber === payload.batchNumber)
            );

            if (duplicate) {
              throw new Error(formConfig.notes.alreadyEnteredNotice);
            }

            // Layer 3: Comprehensive form validation (§7)
            const validation = validateDailyTransaction(payload, {
              ...context,
              existingTransactions: allTransactions,
            });

            if (!validation.isValid) {
              const errorMsg = validation.summaryErrors.join('\n') || 'Validation failed. Please check inputs.';
              throw new Error(errorMsg);
            }

            // Calculate cumulative totals
            const farmTxns = allTransactions.filter(
              tx => tx.farmId === payload.farmId && (!payload.batchNumber || tx.batchNumber === payload.batchNumber)
            );
            const priorMortality = farmTxns.reduce((acc, t) => acc + parseSafeNumber(t.todayTotalMortality, 0), 0);
            const priorCulls = farmTxns.reduce((acc, t) => acc + parseSafeNumber(t.totalCulls, 0), 0);

            const todayMortality = validation.totalMortality;
            const todayCulls = validation.totalCulls;

            const newTxId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            const newTransaction = {
              id: newTxId,
              branchId: payload.branchId,
              branchName: payload.branchName,
              supervisorId: payload.supervisorId,
              supervisorEmployeeId: payload.supervisorEmployeeId,
              supervisorName: payload.supervisorName,
              farmId: payload.farmId,
              farmName: payload.farmName,
              farmCode: payload.farmCode,
              batchNumber: payload.batchNumber,
              date: payload.transactionDate,
              averageBodyWeight: parseSafeNumber(payload.averageBodyWeight, 0),
              totalCulls: todayCulls,
              todayTotalMortality: todayMortality,
              farmTotalMortality: priorMortality + todayMortality,
              farmTotalCulls: priorCulls + todayCulls,
              totalFeedConsumedToday: parseSafeNumber(payload.totalFeedConsumedToday, 0),
              totalFeederFeedToday: parseSafeNumber(payload.totalFeederFeedToday, 0),
              totalFeedSupply: parseSafeNumber(payload.totalFeedSupply, 0),
              totalFeedBalance: parseSafeNumber(payload.totalFeedBalance, 0),
              feedReceived: parseSafeNumber(payload.feedReceived, 0),
              feedIn: parseSafeNumber(payload.feedIn, 0),
              feedOut: parseSafeNumber(payload.feedOut, 0),
              mortalityReasons: payload.mortalityRows
                .filter(r => r.reason && parseSafeNumber(r.quantity, 0) > 0)
                .map(r => ({
                  reason: r.reason,
                  quantity: parseInt(String(r.quantity).trim(), 10),
                })),
              feedLines: payload.feedLines || [],
              isSampleData: false, // User saved transaction
              createdAt: new Date().toISOString(),
            };

            allTransactions.push(newTransaction);
            await storageService.setItem(appConfig.storageKeys.TRANSACTIONS, allTransactions);

            resolve(newTransaction);
          } catch (err) {
            reject(err);
          }
        })
        .catch(err => {
          reject(err);
        });
    });
  },
};

export default transactionService;
