/**
 * Validation Logic for Daily Transaction Form
 * Enforces business rules in form validation before saving.
 */

import { formConfig } from '../config/formConfig.js';
import { isToday } from './dateUtils.js';
import { isNonNegativeInteger, isNonNegativeNumber, isPositiveNumber, parseSafeNumber } from './numberUtils.js';
import { validateMortality } from './mortalityCalculations.js';

/**
 * Validates a Daily Transaction payload before saving.
 *
 * @param {Object} formData
 * @param {Object} context - { activeSupervisor, activeBranch, activeBatch, existingTransactions }
 * @returns {Object} { isValid, errors: { [field]: msg }, summaryErrors: string[] }
 */
export function validateDailyTransaction(formData, context = {}) {
  const errors = {};
  const summaryErrors = [];

  const {
    farmId,
    farm,
    transactionDate,
    averageBodyWeight,
    totalCulls,
    enteredMortalityTotal,
    mortalityRows = [],
    feedInputs = {},
    birdBalance = Infinity,
  } = formData;

  const {
    activeSupervisor,
    activeBranch,
    activeBatch,
    existingTransactions = [],
  } = context;

  // 1. Farm Selection Validation
  if (!farmId || !farm) {
    errors.farmId = 'Farm selection is required.';
    summaryErrors.push('Please select a farm before submitting.');
  } else {
    // Validate farm belongs to active supervisor and branch
    if (activeSupervisor && farm.supervisorId !== activeSupervisor.id && farm.supervisorEmployeeId !== activeSupervisor.employeeId) {
      errors.farmId = 'Selected farm does not belong to the active supervisor.';
      summaryErrors.push('Farm does not match selected supervisor.');
    }
    if (activeBranch && farm.branchId !== activeBranch.id) {
      errors.farmId = 'Selected farm does not belong to the active branch.';
      summaryErrors.push('Farm does not match selected branch.');
    }
  }

  // 2. Transaction Date Rule (Strict Today-only check §6)
  if (!formConfig.ALLOW_BACKDATED_ENTRY) {
    if (!isToday(transactionDate)) {
      errors.transactionDate = 'Entries can only be made for today. Past or future dates are strictly prohibited.';
      summaryErrors.push('Transaction date must be today.');
    }
  }

  // 3. One Transaction per Farm per Batch per Day Rule (§6)
  const duplicateEntry = existingTransactions.find(
    tx => tx.farmId === farmId && tx.date === transactionDate && (!activeBatch || tx.batchNumber === activeBatch.batchNumber)
  );
  if (duplicateEntry) {
    errors.duplicate = formConfig.notes.alreadyEnteredNotice;
    summaryErrors.push(formConfig.notes.alreadyEnteredNotice);
  }

  // 4. Average Body Weight (Required, > 0)
  if (averageBodyWeight === undefined || averageBodyWeight === null || String(averageBodyWeight).trim() === '') {
    errors.averageBodyWeight = 'Average body Weight is required.';
    summaryErrors.push('Average body Weight is required.');
  } else if (!isPositiveNumber(averageBodyWeight)) {
    errors.averageBodyWeight = 'Average body Weight must be a positive number (> 0).';
    summaryErrors.push('Average body Weight must be greater than 0.');
  } else {
    const abw = parseSafeNumber(averageBodyWeight);
    if (abw > formConfig.constraints.maxWeightGrams) {
      errors.averageBodyWeight = `Average body Weight cannot exceed ${formConfig.constraints.maxWeightGrams} g.`;
      summaryErrors.push(`Average body Weight is unusually high (max ${formConfig.constraints.maxWeightGrams} g).`);
    }
  }

  // 5. Total Culls (Optional/default 0, whole number >= 0)
  if (totalCulls !== undefined && totalCulls !== null && String(totalCulls).trim() !== '') {
    if (!isNonNegativeInteger(totalCulls)) {
      errors.totalCulls = 'Total Culls must be a non-negative whole number (≥ 0).';
      summaryErrors.push('Total Culls must be a valid whole number.');
    } else {
      const cullsNum = parseSafeNumber(totalCulls, 0);
      if (cullsNum > formConfig.constraints.maxCullsPerDay) {
        errors.totalCulls = `Total Culls cannot exceed ${formConfig.constraints.maxCullsPerDay} in a single day.`;
        summaryErrors.push('Total Culls exceeds maximum allowed.');
      }
    }
  }

  // 6. Mortality Validation (Derived vs Entered, Reasons, Bird balance)
  const cullsNum = parseSafeNumber(totalCulls, 0);
  const mortValidation = validateMortality(
    mortalityRows,
    enteredMortalityTotal,
    formConfig.MORTALITY_TOTAL_MODE,
    birdBalance,
    cullsNum
  );

  if (!mortValidation.isValid) {
    errors.mortality = mortValidation.errors[0] || 'Invalid mortality distribution.';
    errors.mortalityRows = mortValidation.rowErrors;
    mortValidation.errors.forEach(err => summaryErrors.push(err));
  }

  // 7. Feed inputs validation (optional, >= 0 if provided)
  if (feedInputs && typeof feedInputs === 'object') {
    for (const [typeId, inputs] of Object.entries(feedInputs)) {
      if (inputs.consumed !== undefined && inputs.consumed !== null && String(inputs.consumed).trim() !== '') {
        if (!isNonNegativeNumber(inputs.consumed)) {
          errors[`feed_consumed_${typeId}`] = 'Feed consumed must be a non-negative number.';
          summaryErrors.push(`Feed Consumed for ${typeId} must be ≥ 0.`);
        }
      }
      if (inputs.feederFeed !== undefined && inputs.feederFeed !== null && String(inputs.feederFeed).trim() !== '') {
        if (!isNonNegativeNumber(inputs.feederFeed)) {
          errors[`feed_feeder_${typeId}`] = 'Feeder feed must be a non-negative number.';
          summaryErrors.push(`Feeder Feed for ${typeId} must be ≥ 0.`);
        }
      }
    }
  }

  return {
    isValid: summaryErrors.length === 0,
    errors,
    summaryErrors,
    totalMortality: mortValidation.totalMortality,
    totalCulls: cullsNum,
  };
}
