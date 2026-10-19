/**
 * Application Configuration
 * Contains global app flags, demo credentials, and data mode settings.
 */

export const appConfig = {
  appName: 'SPBF Broiler Management',
  version: '1.0.0-demo',
  tagline: 'SPBF PoultryFlo Mobile Supervisor Portal',

  // DATA_MODE controls whether the app runs offline with local storage or connects to API
  // 'demo': offline mock service layer with AsyncStorage persistence
  // 'api': real backend mode (Axios calls - throws 'API not configured' in demo)
  DATA_MODE: 'demo',

  // Demo credentials - explicitly labelled as demo/fictional
  demoAuth: {
    username: 'demo',
    password: 'Demo@123',
    alternateUsername: 'E1870',
    notice: 'DEMO LOGIN — not real authentication. Used for supervisor demonstration only.',
  },

  // Storage keys for AsyncStorage
  storageKeys: {
    AUTH_SESSION: '@spbf_auth_session',
    ACTIVE_SELECTION: '@spbf_active_selection',
    TRANSACTIONS: '@spbf_daily_transactions',
    FEED_LEDGER: '@spbf_feed_ledger',
    BATCHES: '@spbf_batches',
    APP_INITIALIZED: '@spbf_demo_initialized_v1',
  },

  // Anchor date offset for stable batch age calculation in demo (batch started 20 days prior)
  DEMO_BATCH_AGE_DAYS: 20,
};

export default appConfig;
