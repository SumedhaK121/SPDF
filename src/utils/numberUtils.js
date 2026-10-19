/**
 * Number Utility Functions
 * Safe parsing, validation and formatting for poultry metrics.
 */

/**
 * Safely parses a string or number into a valid float. Returns defaultVal if invalid.
 */
export function parseSafeNumber(val, defaultVal = 0) {
  if (val === null || val === undefined || val === '') return defaultVal;
  const num = Number(val);
  return Number.isFinite(num) ? num : defaultVal;
}

/**
 * Checks if a value is a strictly positive integer (> 0).
 */
export function isPositiveInteger(val) {
  if (val === null || val === undefined || val === '') return false;
  const str = String(val).trim();
  if (!/^\d+$/.test(str)) return false;
  const num = parseInt(str, 10);
  return num > 0;
}

/**
 * Checks if a value is a non-negative integer (>= 0).
 */
export function isNonNegativeInteger(val) {
  if (val === null || val === undefined || val === '') return false;
  const str = String(val).trim();
  if (!/^\d+$/.test(str)) return false;
  const num = parseInt(str, 10);
  return num >= 0;
}

/**
 * Checks if a value is a valid positive number (> 0, allows decimals).
 */
export function isPositiveNumber(val) {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return Number.isFinite(num) && num > 0;
}

/**
 * Checks if a value is a valid non-negative number (>= 0, allows decimals).
 */
export function isNonNegativeNumber(val) {
  if (val === null || val === undefined || val === '') return false;
  const num = Number(val);
  return Number.isFinite(num) && num >= 0;
}

/**
 * Formats a number with commas for thousands.
 * E.g., 4467 -> "4,467"
 */
export function formatNumber(val, decimals = 0) {
  const num = parseSafeNumber(val, 0);
  if (decimals > 0) {
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }
  return Math.round(num).toLocaleString('en-IN');
}
