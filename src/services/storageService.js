/**
 * Storage Service
 * Robust wrapper over @react-native-async-storage/async-storage.
 * Includes in-memory fallback for testing environments (Node.js) and error resilience.
 */

let AsyncStorageImpl = null;
try {
  AsyncStorageImpl = require('@react-native-async-storage/async-storage').default;
} catch (e) {
  // Fallback for Node environments or headless tests
  AsyncStorageImpl = null;
}

// In-memory fallback map
const memoryStore = new Map();

export const storageService = {
  async getItem(key) {
    try {
      if (AsyncStorageImpl && typeof AsyncStorageImpl.getItem === 'function') {
        const val = await AsyncStorageImpl.getItem(key);
        return val ? JSON.parse(val) : null;
      }
      const memVal = memoryStore.get(key);
      return memVal ? JSON.parse(memVal) : null;
    } catch (err) {
      console.warn(`[storageService] Error getting key "${key}":`, err.message);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      const serialized = JSON.stringify(value);
      if (AsyncStorageImpl && typeof AsyncStorageImpl.setItem === 'function') {
        await AsyncStorageImpl.setItem(key, serialized);
      }
      memoryStore.set(key, serialized);
      return true;
    } catch (err) {
      console.error(`[storageService] Error setting key "${key}":`, err.message);
      return false;
    }
  },

  async removeItem(key) {
    try {
      if (AsyncStorageImpl && typeof AsyncStorageImpl.removeItem === 'function') {
        await AsyncStorageImpl.removeItem(key);
      }
      memoryStore.delete(key);
      return true;
    } catch (err) {
      console.warn(`[storageService] Error removing key "${key}":`, err.message);
      return false;
    }
  },

  async clear() {
    try {
      if (AsyncStorageImpl && typeof AsyncStorageImpl.clear === 'function') {
        await AsyncStorageImpl.clear();
      }
      memoryStore.clear();
      return true;
    } catch (err) {
      console.warn('[storageService] Error clearing storage:', err.message);
      return false;
    }
  },

  /**
   * Helper to inspect in-memory store during unit tests
   */
  _getMemoryStore() {
    return memoryStore;
  },
};

export default storageService;
