/**
 * Broiler Record Display Configuration
 * Configures the fields and layout for Broiler Records.
 * Single configuration point to match future company records specification.
 */

export const recordConfig = {
  // Ordered fields displayed on Broiler Record cards and details
  recordFields: [
    { key: 'date', label: 'Date', type: 'date', highlight: true },
    { key: 'age', label: 'Age', suffix: ' days', highlight: true },
    { key: 'chicks', label: 'Chicks', type: 'number' },
    { key: 'soldBirds', label: 'Sold Birds', type: 'number' },
    { key: 'culls', label: 'Culls', type: 'number' },
    { key: 'mortality', label: 'Mortality', type: 'number', highlight: true },
    { key: 'cumulativeMortality', label: 'Cumulative Mortality', type: 'number' },
    { key: 'feedUsed', label: 'Feed Used', suffix: ' kg' },
    { key: 'feederFeed', label: 'Feeder Feed', suffix: ' kg' },
    { key: 'actualWeight', label: 'Actual Weight (ABW)', suffix: ' g', highlight: true },
    { key: 'feedReceived', label: 'Feed Received', suffix: ' kg' },
    { key: 'feedIn', label: 'Feed In', suffix: ' kg' },
    { key: 'feedOut', label: 'Feed Out', suffix: ' kg' },
    { key: 'feedBalance', label: 'Feed Balance', suffix: ' kg' },
  ],

  // Summary fields displayed on collapsed card view
  cardPreviewFields: [
    'date',
    'age',
    'chicks',
    'mortality',
    'cumulativeMortality',
    'feedUsed',
    'actualWeight',
    'feedBalance',
  ],

  // Sorting and filtering defaults
  defaultSort: 'desc', // Newest first
};

export default recordConfig;
