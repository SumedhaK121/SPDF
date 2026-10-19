/**
 * Mock Feed Ledger Data Generator
 *
 * Requirements (§6 & §9):
 * 1. Pre-Starter received at batch start (Day 0)
 * 2. Starter received on Day 9
 * 3. Finisher received on Day 17
 * 4. ONE EXTRA Finisher receipt dated TOMORROW to demonstrate the late-feed exclusion rule!
 */

import { offsetDays, getTodayDateString } from '../utils/dateUtils.js';

export function createDemoFeedLedger(batch) {
  const startDate = batch.startDate;
  const today = getTodayDateString();
  const tomorrow = offsetDays(today, 1);

  return [
    {
      id: `FEED-REC-01-${batch.id}`,
      batchId: batch.id,
      farmId: batch.farmId,
      date: startDate, // Day 0
      feedTypeId: 'pre_starter',
      feedName: 'Pre-Starter',
      type: 'RECEIPT',
      quantityKg: 1200,
      notes: 'Initial chick placement feed supply',
      isSampleData: true,
    },
    {
      id: `FEED-REC-02-${batch.id}`,
      batchId: batch.id,
      farmId: batch.farmId,
      date: offsetDays(startDate, 9), // Day 9
      feedTypeId: 'starter',
      feedName: 'Starter',
      type: 'RECEIPT',
      quantityKg: 2800,
      notes: 'Phase 2 starter feed delivery',
      isSampleData: true,
    },
    {
      id: `FEED-REC-03-${batch.id}`,
      batchId: batch.id,
      farmId: batch.farmId,
      date: offsetDays(startDate, 17), // Day 17
      feedTypeId: 'finisher',
      feedName: 'Finisher',
      type: 'RECEIPT',
      quantityKg: 3500,
      notes: 'Phase 3 finisher feed delivery',
      isSampleData: true,
    },
    {
      // CRITICAL DEMO ITEM: Feed received tomorrow!
      // Must be excluded from today's Daily Transaction balance per company policy (§6).
      id: `FEED-REC-LATE-${batch.id}`,
      batchId: batch.id,
      farmId: batch.farmId,
      date: tomorrow,
      feedTypeId: 'finisher',
      feedName: 'Finisher',
      type: 'RECEIPT',
      quantityKg: 2500,
      notes: 'Scheduled delivery for tomorrow — demonstrates company late-feed exclusion rule',
      isSampleData: true,
    },
  ];
}
