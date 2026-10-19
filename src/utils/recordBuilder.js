/**
 * Record Builder Utility
 * Reconstructs Broiler Records dynamically from saved transactions and batches.
 * Single source of truth: records are derived from saved transactions.
 */

import { calculateAge, formatDisplayDate } from './dateUtils.js';
import { parseSafeNumber } from './numberUtils.js';

/**
 * Builds an array of Broiler Record display objects for a given farm and batch.
 *
 * @param {Object} batch - Active batch details
 * @param {Array} transactions - All saved daily transactions for this batch (seeded + user saved)
 * @returns {Array} Array of formatted record objects, sorted descending by date (newest first)
 */
export function buildBroilerRecords(batch, transactions = []) {
  if (!batch) return [];

  // Sort chronologically ascending to compute cumulative values accurately
  const sortedAsc = [...transactions].sort((a, b) => (a.date > b.date ? 1 : -1));

  let runningCumulativeMortality = 0;
  let runningCumulativeCulls = 0;

  const records = sortedAsc.map((tx, idx) => {
    const todayMort = parseSafeNumber(tx.todayTotalMortality, 0);
    const todayCulls = parseSafeNumber(tx.totalCulls, 0);

    runningCumulativeMortality += todayMort;
    runningCumulativeCulls += todayCulls;

    const age = calculateAge(batch.startDate, tx.date);

    // Extract feed figures stored with the transaction
    const feedUsed = parseSafeNumber(tx.totalFeedConsumedToday || tx.feedUsed, 0);
    const feederFeed = parseSafeNumber(tx.totalFeederFeedToday || tx.feederFeed, 0);
    const feedReceived = parseSafeNumber(tx.feedReceived || tx.totalFeedIn, 0);
    const feedIn = parseSafeNumber(tx.feedIn || tx.totalFeedIn, 0);
    const feedOut = parseSafeNumber(tx.feedOut || tx.totalFeedOut, 0);
    const feedBalance = parseSafeNumber(tx.feedBalance || tx.totalFeedBalance, 0);

    return {
      id: tx.id || `REC-${tx.date}-${idx}`,
      transactionId: tx.id,
      date: tx.date,
      displayDate: formatDisplayDate(tx.date),
      age: age,
      chicks: parseSafeNumber(batch.noOfChicks, 0),
      soldBirds: parseSafeNumber(batch.birdsSold, 0),
      culls: todayCulls,
      mortality: todayMort,
      cumulativeMortality: runningCumulativeMortality,
      cumulativeCulls: runningCumulativeCulls,
      feedUsed: feedUsed,
      feederFeed: feederFeed,
      actualWeight: parseSafeNumber(tx.averageBodyWeight, 0),
      feedReceived: feedReceived,
      feedIn: feedIn,
      feedOut: feedOut,
      feedBalance: feedBalance,
      isSampleData: Boolean(tx.isSampleData),
      mortalityReasons: tx.mortalityReasons || [],
      feedLines: tx.feedLines || [],
      createdAt: tx.createdAt,
      farmId: tx.farmId || batch.farmId,
      farmName: tx.farmName || batch.farmName,
      batchNumber: batch.batchNumber,
    };
  });

  // Return newest first (descending) as required by §8
  return records.reverse();
}
