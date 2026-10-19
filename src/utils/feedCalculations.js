/**
 * Feed Ledger Calculations & Late-Feed Filtering
 *
 * Enforces company rule from website:
 * "If Feed Received after transaction date it will not show in Broiler Record."
 *
 * Formulas (Assumed per project brief - to be confirmed with company):
 * - Total Supply = Sum of feed receipts with receiptDate <= transactionDate
 * - Feed IN      = Sum of feed receipts with receiptDate === transactionDate
 * - Feed Out     = Sum of feed dispatches/returns with date <= transactionDate
 * - Total Consumed = Cumulative feed consumed from earlier saved records + today's input
 * - Feed Balance = Total Supply - Feed Out - Total Consumed
 */

import { parseSafeNumber } from './numberUtils.js';

/**
 * Calculates feed figures for each feed type up to the specified transaction date.
 *
 * @param {Array} feedLedgerItems - Complete ledger of feed receipts/transfers for this batch
 * @param {Array} pastTransactions - Earlier saved daily transactions for this farm/batch
 * @param {Object} todayInputs - Map of { [feedTypeId]: { consumed, feederFeed } }
 * @param {string} transactionDate - YYYY-MM-DD date of current transaction
 * @param {Array} feedTypes - Configured list of feed types (e.g. Pre-Starter, Starter, Finisher)
 */
export function calculateFeedFigures(
  feedLedgerItems = [],
  pastTransactions = [],
  todayInputs = {},
  transactionDate = '',
  feedTypes = []
) {
  let hasExcludedLateFeed = false;
  let totalExcludedLateFeedKg = 0;

  // Calculate cumulative feed consumed in past transactions per feed type
  const pastConsumedByType = {};
  pastTransactions.forEach(tx => {
    // Only count transactions on or before the transaction date
    if (tx.date < transactionDate) {
      if (Array.isArray(tx.feedLines)) {
        tx.feedLines.forEach(line => {
          const typeId = line.feedTypeId || line.feedName;
          const qty = parseSafeNumber(line.consumed, 0);
          pastConsumedByType[typeId] = (pastConsumedByType[typeId] || 0) + qty;
        });
      } else if (tx.feedUsed) {
        // Fallback for legacy single-feed records
        const fallbackType = feedTypes[0]?.id || 'starter';
        pastConsumedByType[fallbackType] = (pastConsumedByType[fallbackType] || 0) + parseSafeNumber(tx.feedUsed, 0);
      }
    }
  });

  const feedCards = feedTypes.map(feedType => {
    const typeId = feedType.id;
    const typeName = feedType.name;

    // Filter ledger entries for this feed type
    const relevantLedger = feedLedgerItems.filter(
      item => (item.feedTypeId === typeId || item.feedName === typeName)
    );

    let totalSupply = 0;
    let feedIn = 0;
    let feedOut = 0;
    let typeExcludedLateFeed = 0;

    relevantLedger.forEach(entry => {
      const entryDate = entry.date;
      const qty = parseSafeNumber(entry.quantityKg, 0);

      if (entry.type === 'IN' || entry.type === 'RECEIPT') {
        if (entryDate <= transactionDate) {
          totalSupply += qty;
          if (entryDate === transactionDate) {
            feedIn += qty;
          }
        } else {
          // Received strictly AFTER transaction date -> EXCLUDED
          hasExcludedLateFeed = true;
          typeExcludedLateFeed += qty;
          totalExcludedLateFeedKg += qty;
        }
      } else if (entry.type === 'OUT' || entry.type === 'TRANSFER_OUT') {
        if (entryDate <= transactionDate) {
          feedOut += qty;
        }
      }
    });

    const pastConsumed = pastConsumedByType[typeId] || 0;
    const todayConsumed = parseSafeNumber(todayInputs[typeId]?.consumed, 0);
    const todayFeederFeed = parseSafeNumber(todayInputs[typeId]?.feederFeed, 0);

    const totalConsumed = pastConsumed + todayConsumed;
    const feedBalance = totalSupply - feedOut - totalConsumed;

    return {
      feedTypeId: typeId,
      feedName: typeName,
      totalSupply,
      feedIn,
      feedOut,
      totalConsumed,
      feedBalance,
      feedConsumedToday: todayConsumed,
      feederFeedToday: todayFeederFeed,
      excludedLateFeedKg: typeExcludedLateFeed,
    };
  });

  // Calculate totals across all feed types for the summary fields
  const totalFeedSupply = feedCards.reduce((acc, c) => acc + c.totalSupply, 0);
  const totalFeedConsumed = feedCards.reduce((acc, c) => acc + c.totalConsumed, 0);
  const totalFeedIn = feedCards.reduce((acc, c) => acc + c.feedIn, 0);
  const totalFeedOut = feedCards.reduce((acc, c) => acc + c.feedOut, 0);
  const totalFeedBalance = feedCards.reduce((acc, c) => acc + c.feedBalance, 0);
  const totalFeedUsedToday = feedCards.reduce((acc, c) => acc + c.feedConsumedToday, 0);
  const totalFeederFeedToday = feedCards.reduce((acc, c) => acc + c.feederFeedToday, 0);

  return {
    feedCards,
    summary: {
      totalFeedSupply,
      totalFeedConsumed,
      totalFeedIn,
      totalFeedOut,
      totalFeedBalance,
      totalFeedUsedToday,
      totalFeederFeedToday,
    },
    hasExcludedLateFeed,
    totalExcludedLateFeedKg,
  };
}
