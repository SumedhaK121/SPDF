/**
 * Mortality Calculations & Multi-Reason Breakdown Logic
 * Supports both 'derived' mode (default, total = sum of rows) and 'entered' mode (user types total).
 */

import { isPositiveInteger, parseSafeNumber } from './numberUtils.js';

/**
 * Calculates live mortality breakdown summary:
 * - totalMortality: effective total mortality for the day
 * - distributedMortality: sum of quantities across valid reason rows
 * - remainingMortality: difference between total and distributed (in entered mode)
 * - isBalanced: boolean indicating if distribution is valid and complete
 */
export function calculateMortalitySummary(rows = [], enteredTotal = 0, mode = 'derived') {
  let distributed = 0;

  rows.forEach(r => {
    if (isPositiveInteger(r.quantity)) {
      distributed += parseInt(String(r.quantity).trim(), 10);
    }
  });

  if (mode === 'entered') {
    const hasEntered = enteredTotal !== undefined && enteredTotal !== null && String(enteredTotal).trim() !== '';
    const total = hasEntered ? parseSafeNumber(enteredTotal, 0) : distributed;
    const remaining = total - distributed;
    const isBalanced = total >= 0 && remaining === 0;
    return {
      totalMortality: total,
      distributedMortality: distributed,
      remainingMortality: remaining,
      isBalanced: isBalanced,
    };
  }

  // 'derived' mode (default, website behavior: total = sum of rows)
  return {
    totalMortality: distributed,
    distributedMortality: distributed,
    remainingMortality: 0,
    isBalanced: true,
  };
}

/**
 * Validates mortality rows against business rules:
 * 1. If mortality is 0, no rows are required.
 * 2. Each row with quantity must have a reason, and vice-versa.
 * 3. Quantities must be positive integers (> 0).
 * 4. No duplicate reasons allowed across rows.
 * 5. In 'entered' mode: sum must equal enteredTotal exactly.
 * 6. Total mortality + culls must not exceed available birds.
 */
export function validateMortality(rows = [], enteredTotal = null, mode = 'derived', availableBirds = Infinity, culls = 0) {
  const errors = [];
  const rowErrors = {};
  const seenReasons = new Set();
  let totalDistributed = 0;

  // Validate individual rows
  rows.forEach((row, idx) => {
    const hasQty = row.quantity !== undefined && row.quantity !== null && String(row.quantity).trim() !== '';
    const hasReason = Boolean(row.reason && String(row.reason).trim() !== '');

    if (hasQty && !hasReason) {
      rowErrors[idx] = 'Please select a reason for this quantity.';
      errors.push(`Row ${idx + 1}: Reason is required when quantity is entered.`);
    } else if (!hasQty && hasReason) {
      rowErrors[idx] = 'Quantity must be entered.';
      errors.push(`Row ${idx + 1}: Quantity is required when reason is selected.`);
    } else if (hasQty && hasReason) {
      if (!isPositiveInteger(row.quantity)) {
        rowErrors[idx] = 'Quantity must be a positive whole number (> 0).';
        errors.push(`Row ${idx + 1}: Quantity must be a positive whole number.`);
      } else {
        const qty = parseInt(String(row.quantity).trim(), 10);
        totalDistributed += qty;

        const reasonKey = String(row.reason).trim().toLowerCase();
        if (seenReasons.has(reasonKey)) {
          rowErrors[idx] = `Duplicate reason "${row.reason}". Each reason can only be used once.`;
          errors.push(`Row ${idx + 1}: Reason "${row.reason}" is duplicated.`);
        } else {
          seenReasons.add(reasonKey);
        }
      }
    }
  });

  // Mode-specific validation
  let finalTotal = totalDistributed;
  const hasEntered = enteredTotal !== null && enteredTotal !== undefined && String(enteredTotal).trim() !== '';

  if (mode === 'entered' && hasEntered) {
    const parsedEntered = parseSafeNumber(enteredTotal, 0);
    if (!Number.isInteger(parsedEntered) || parsedEntered < 0) {
      errors.push('Total mortality must be a non-negative whole number.');
    } else {
      finalTotal = parsedEntered;
      if (totalDistributed !== parsedEntered) {
        errors.push(
          `Mortality reasons sum (${totalDistributed}) must exactly equal total mortality (${parsedEntered}). Remaining: ${parsedEntered - totalDistributed}.`
        );
      }
    }
  } else {
    finalTotal = totalDistributed;
  }

  // Bird Balance check
  const parsedCulls = parseSafeNumber(culls, 0);
  if (finalTotal + parsedCulls > availableBirds) {
    errors.push(
      `Total mortality (${finalTotal}) + culls (${parsedCulls}) = ${finalTotal + parsedCulls} exceeds available birds (${availableBirds}).`
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
    rowErrors,
    totalMortality: finalTotal,
    distributedMortality: totalDistributed,
  };
}

/**
 * Returns a list of reasons already selected in other rows
 */
export function getUsedReasons(rows = [], excludeIndex = -1) {
  const used = [];
  rows.forEach((r, idx) => {
    if (idx !== excludeIndex && r.reason) {
      used.push(r.reason);
    }
  });
  return used;
}
