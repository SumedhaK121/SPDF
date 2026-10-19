/**
 * Seed Demo Past Transactions Generator
 *
 * Requirements (§9):
 * - First farm: ~16 days of past daily transactions (clearly flagged isSampleData: true)
 * - Second farm: ~3 days of past daily transactions (clearly flagged isSampleData: true)
 * - All other farms start with 0 saved entries.
 * - Transactions contain realistic ABW, culls, reason-wise mortality, and feed consumption.
 */

import { offsetDays } from '../utils/dateUtils.js';
import { calculateFeedFigures } from '../utils/feedCalculations.js';
import { formConfig } from '../config/formConfig.js';

export function generateSeedTransactionsForFarm1(farm, batch, feedLedger) {
  const startDate = batch.startDate;
  const transactions = [];

  // 16 days of past transactions (Day 1 through Day 16)
  const daysData = [
    { day: 1, abw: 55, culls: 1, feedConsumed: 45, feedType: 'pre_starter', reasons: [{ reason: 'Other', quantity: 2 }] },
    { day: 2, abw: 72, culls: 0, feedConsumed: 55, feedType: 'pre_starter', reasons: [{ reason: 'Disease', quantity: 1 }] },
    { day: 3, abw: 92, culls: 1, feedConsumed: 68, feedType: 'pre_starter', reasons: [{ reason: 'Leg Problem', quantity: 2 }] },
    { day: 4, abw: 115, culls: 0, feedConsumed: 82, feedType: 'pre_starter', reasons: [{ reason: 'Other', quantity: 1 }, { reason: 'Disease', quantity: 1 }] },
    { day: 5, abw: 142, culls: 0, feedConsumed: 98, feedType: 'pre_starter', reasons: [{ reason: 'Disease', quantity: 2 }] },
    { day: 6, abw: 175, culls: 2, feedConsumed: 118, feedType: 'pre_starter', reasons: [{ reason: 'Attack', quantity: 3 }] },
    { day: 7, abw: 212, culls: 0, feedConsumed: 140, feedType: 'pre_starter', reasons: [{ reason: 'Heat Stress', quantity: 2 }] },
    { day: 8, abw: 255, culls: 1, feedConsumed: 165, feedType: 'starter', reasons: [{ reason: 'Other', quantity: 1 }] },
    { day: 9, abw: 305, culls: 0, feedConsumed: 195, feedType: 'starter', reasons: [{ reason: 'Leg Problem', quantity: 2 }, { reason: 'Disease', quantity: 1 }] },
    { day: 10, abw: 360, culls: 1, feedConsumed: 228, feedType: 'starter', reasons: [{ reason: 'Disease', quantity: 2 }] },
    { day: 11, abw: 420, culls: 0, feedConsumed: 265, feedType: 'starter', reasons: [{ reason: 'Heat Stress', quantity: 3 }] },
    { day: 12, abw: 488, culls: 1, feedConsumed: 305, feedType: 'starter', reasons: [{ reason: 'Attack', quantity: 1 }, { reason: 'Other', quantity: 1 }] },
    { day: 13, abw: 560, culls: 0, feedConsumed: 350, feedType: 'starter', reasons: [{ reason: 'Disease', quantity: 2 }] },
    { day: 14, abw: 640, culls: 2, feedConsumed: 400, feedType: 'starter', reasons: [{ reason: 'Leg Problem', quantity: 3 }] },
    { day: 15, abw: 725, culls: 1, feedConsumed: 450, feedType: 'finisher', reasons: [{ reason: 'Heat Stress', quantity: 2 }] },
    { day: 16, abw: 815, culls: 0, feedConsumed: 505, feedType: 'finisher', reasons: [{ reason: 'Disease', quantity: 1 }, { reason: 'Other', quantity: 2 }] },
  ];

  let cumulativeMort = 0;
  let cumulativeCulls = 0;

  daysData.forEach(d => {
    const txnDate = offsetDays(startDate, d.day);
    const dayMort = d.reasons.reduce((acc, r) => acc + r.quantity, 0);
    cumulativeMort += dayMort;
    cumulativeCulls += d.culls;

    // Build feed input object
    const todayInputs = {
      [d.feedType]: { consumed: d.feedConsumed, feederFeed: 25 },
    };

    const feedCalc = calculateFeedFigures(
      feedLedger,
      transactions,
      todayInputs,
      txnDate,
      formConfig.feedTypes
    );

    const feedLines = feedCalc.feedCards.map(c => ({
      feedTypeId: c.feedTypeId,
      feedName: c.feedName,
      totalSupply: c.totalSupply,
      feedIn: c.feedIn,
      feedOut: c.feedOut,
      totalConsumed: c.totalConsumed,
      feedBalance: c.feedBalance,
      consumed: c.feedConsumedToday,
      feederFeed: c.feederFeedToday,
    }));

    transactions.push({
      id: `TXN-SEED-${farm.id}-${d.day}`,
      branchId: farm.branchId,
      branchName: farm.branchName,
      supervisorId: farm.supervisorId,
      supervisorName: farm.supervisorName,
      farmId: farm.id,
      farmName: farm.farmName,
      batchNumber: batch.batchNumber,
      date: txnDate,
      averageBodyWeight: d.abw,
      totalCulls: d.culls,
      todayTotalMortality: dayMort,
      farmTotalMortality: cumulativeMort,
      farmTotalCulls: cumulativeCulls,
      totalFeedConsumedToday: d.feedConsumed,
      totalFeederFeedToday: 25,
      totalFeedSupply: feedCalc.summary.totalFeedSupply,
      totalFeedBalance: feedCalc.summary.totalFeedBalance,
      feedReceived: feedCalc.summary.totalFeedIn,
      feedIn: feedCalc.summary.totalFeedIn,
      feedOut: feedCalc.summary.totalFeedOut,
      mortalityReasons: d.reasons,
      feedLines: feedLines,
      isSampleData: true,
      createdAt: new Date(txnDate + 'T12:00:00Z').toISOString(),
    });
  });

  return transactions;
}

export function generateSeedTransactionsForFarm2(farm, batch, feedLedger) {
  const startDate = batch.startDate;
  const transactions = [];

  // 3 days of past transactions for farm 2
  const daysData = [
    { day: 1, abw: 50, culls: 0, feedConsumed: 40, feedType: 'pre_starter', reasons: [{ reason: 'Other', quantity: 1 }] },
    { day: 2, abw: 68, culls: 1, feedConsumed: 52, feedType: 'pre_starter', reasons: [{ reason: 'Disease', quantity: 1 }] },
    { day: 3, abw: 88, culls: 0, feedConsumed: 64, feedType: 'pre_starter', reasons: [{ reason: 'Leg Problem', quantity: 2 }] },
  ];

  let cumulativeMort = 0;
  let cumulativeCulls = 0;

  daysData.forEach(d => {
    const txnDate = offsetDays(startDate, d.day);
    const dayMort = d.reasons.reduce((acc, r) => acc + r.quantity, 0);
    cumulativeMort += dayMort;
    cumulativeCulls += d.culls;

    const todayInputs = {
      [d.feedType]: { consumed: d.feedConsumed, feederFeed: 20 },
    };

    const feedCalc = calculateFeedFigures(
      feedLedger,
      transactions,
      todayInputs,
      txnDate,
      formConfig.feedTypes
    );

    const feedLines = feedCalc.feedCards.map(c => ({
      feedTypeId: c.feedTypeId,
      feedName: c.feedName,
      totalSupply: c.totalSupply,
      feedIn: c.feedIn,
      feedOut: c.feedOut,
      totalConsumed: c.totalConsumed,
      feedBalance: c.feedBalance,
      consumed: c.feedConsumedToday,
      feederFeed: c.feederFeedToday,
    }));

    transactions.push({
      id: `TXN-SEED-${farm.id}-${d.day}`,
      branchId: farm.branchId,
      branchName: farm.branchName,
      supervisorId: farm.supervisorId,
      supervisorName: farm.supervisorName,
      farmId: farm.id,
      farmName: farm.farmName,
      batchNumber: batch.batchNumber,
      date: txnDate,
      averageBodyWeight: d.abw,
      totalCulls: d.culls,
      todayTotalMortality: dayMort,
      farmTotalMortality: cumulativeMort,
      farmTotalCulls: cumulativeCulls,
      totalFeedConsumedToday: d.feedConsumed,
      totalFeederFeedToday: 20,
      totalFeedSupply: feedCalc.summary.totalFeedSupply,
      totalFeedBalance: feedCalc.summary.totalFeedBalance,
      feedReceived: feedCalc.summary.totalFeedIn,
      feedIn: feedCalc.summary.totalFeedIn,
      feedOut: feedCalc.summary.totalFeedOut,
      mortalityReasons: d.reasons,
      feedLines: feedLines,
      isSampleData: true,
      createdAt: new Date(txnDate + 'T12:00:00Z').toISOString(),
    });
  });

  return transactions;
}
