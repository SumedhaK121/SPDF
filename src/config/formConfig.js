/**
 * Form Configuration & Business Rules
 * All business rule flags, sample feed types, and mortality reasons live here.
 */

export const formConfig = {
  // CRITICAL RULE: Entries are made on a daily basis only. Transaction date is always today.
  // Backdated and future-dated entries are strictly prohibited.
  ALLOW_BACKDATED_ENTRY: false,

  // Mortality total mode:
  // 'derived': Total mortality is calculated as sum of reason rows (default, matches website)
  // 'entered': User enters total mortality, and rows must sum up to that exact total
  MORTALITY_TOTAL_MODE: 'derived',

  // Whether reason rows are required if mortality > 0
  REQUIRE_MORTALITY_REASONS: true,

  // Units
  units: {
    weight: 'g', // Average Body Weight in grams
    feed: 'kg',   // Feed amount in kg
    birdCount: 'birds',
    currency: '₹',
  },

  // 4 types of feeds present for all farmers across all supervisors/branches
  feedTypes: [
    { id: 'pre_starter', name: 'Pre-Starter', defaultBagWeightKg: 50 },
    { id: 'starter', name: 'Starter', defaultBagWeightKg: 50 },
    { id: 'finisher', name: 'Finisher', defaultBagWeightKg: 50 },
    { id: 'post_finisher', name: 'Post-Finisher', defaultBagWeightKg: 50 },
  ],

  // Sample mortality reasons (configurable sample list, not official company list)
  mortalityReasons: [
    'Attack',
    'Disease',
    'Heat Stress',
    'Leg Problem',
    'Other',
  ],

  // Official notes from website screenshots
  notes: {
    feedNote: 'Note: If Feed Received after transaction date it will not show in Broiler Record.',
    lateFeedHint: '⚠️ Later Feed Excluded: Feed received after this transaction date is excluded from balance per company rules.',
    alreadyEnteredNotice: 'Already entered for this day. Only one transaction per farm per day is allowed.',
    farmRequiredNotice: 'Please select a farm from the dropdown above to view and fill the daily transaction form.',
  },

  // Field constraints
  constraints: {
    minWeightGrams: 1,
    maxWeightGrams: 5000,
    minCulls: 0,
    maxCullsPerDay: 500,
    maxMortalityQty: 10000,
  },
};

export default formConfig;
