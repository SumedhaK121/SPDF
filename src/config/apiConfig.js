/**
 * API Configuration
 * NOTE: In demo mode, this is NOT called.
 * It provides placeholder endpoints and configuration for future company API integration.
 */

export const apiConfig = {
  // Placeholder only - no company backend exists for this demo.
  BASE_URL: 'https://api.spbf-poultryflo.placeholder.internal/v1',
  TIMEOUT_MS: 15000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Client-App': 'SPBF-Mobile-Demo',
  },
  ENDPOINTS: {
    LOGIN: '/auth/login',
    BRANCHES: '/branches',
    SUPERVISORS: '/supervisors',
    FARMS: '/farms',
    BATCHES: '/batches',
    FEED_LEDGER: '/feed/ledger',
    TRANSACTIONS: '/daily-transactions',
    BROILER_RECORDS: '/broiler-records',
  },
};

export default apiConfig;
