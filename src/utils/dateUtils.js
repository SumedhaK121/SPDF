/**
 * Date Utility Functions
 * Enforces local device date formatting and age calculations.
 */

/**
 * Returns today's date formatted as YYYY-MM-DD using local device timezone.
 */
export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a YYYY-MM-DD string into user-friendly display date: "DD MMM YYYY"
 * E.g., "2026-10-19" -> "19 Oct 2026"
 */
export function formatDisplayDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[monthIndex] || parts[1];

  return `${day} ${monthName} ${year}`;
}

/**
 * Formats a Date object or YYYY-MM-DD string into "DD/MM/YYYY" (website style)
 */
export function formatWebsiteDate(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Calculates Age in days between batch placement date and record date.
 * Assumption: Placement day = Age 0 (or day 1 depending on convention, default 0).
 */
export function calculateAge(batchStartDate, recordDate) {
  if (!batchStartDate || !recordDate) return 0;
  
  const start = new Date(batchStartDate + 'T00:00:00');
  const record = new Date(recordDate + 'T00:00:00');
  
  const diffTime = record.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Returns a YYYY-MM-DD string offset by a number of days.
 */
export function offsetDays(dateStr, dayDelta) {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + dayDelta);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Returns true if dateStr matches today's date in local time.
 */
export function isToday(dateStr) {
  return dateStr === getTodayDateString();
}

/**
 * Returns true if dateStr is strictly before today.
 */
export function isPastDate(dateStr) {
  return dateStr < getTodayDateString();
}

/**
 * Returns true if dateStr is strictly after today.
 */
export function isFutureDate(dateStr) {
  return dateStr > getTodayDateString();
}

/**
 * Compares two YYYY-MM-DD date strings.
 * Returns negative if a < b, 0 if equal, positive if a > b.
 */
export function compareDates(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
