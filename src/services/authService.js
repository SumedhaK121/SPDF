/**
 * Authentication Service
 *
 * In Demo Mode: Validates credentials against appConfig.demoAuth and stores session in storageService.
 * In API Mode: Throws "API not configured" with TODO for Axios endpoint.
 */

import { appConfig } from '../config/appConfig';
import { storageService } from './storageService';

export const authService = {
  async login(username, password) {
    if (appConfig.DATA_MODE === 'api') {
      // TODO: Future API integration with apiClient.post(apiConfig.ENDPOINTS.LOGIN, { username, password })
      throw new Error('API not configured. Please switch DATA_MODE to "demo" in appConfig.js.');
    }

    // Simulate realistic network delay for demo
    await new Promise(res => setTimeout(res, 400));

    const cleanUser = String(username || '').trim();
    const cleanPass = String(password || '').trim();

    if (!cleanUser || !cleanPass) {
      throw new Error('Username and Password are required.');
    }

    const { demoAuth } = appConfig;
    const isUserMatch =
      cleanUser.toLowerCase() === demoAuth.username.toLowerCase() ||
      cleanUser.toLowerCase() === demoAuth.alternateUsername.toLowerCase();
    const isPassMatch = cleanPass === demoAuth.password;

    if (!isUserMatch || !isPassMatch) {
      throw new Error('Invalid credentials. Use demo / Demo@123 for demo access.');
    }

    const sessionUser = {
      username: cleanUser,
      employeeId: cleanUser.toUpperCase() === 'E1870' ? 'E1870' : 'E1870',
      displayName: 'Demo Supervisor (E1870)',
      role: 'Supervisor',
      isDemoSession: true,
      loginTimestamp: new Date().toISOString(),
    };

    await storageService.setItem(appConfig.storageKeys.AUTH_SESSION, sessionUser);
    return sessionUser;
  },

  async getCurrentSession() {
    return await storageService.getItem(appConfig.storageKeys.AUTH_SESSION);
  },

  async logout() {
    await storageService.removeItem(appConfig.storageKeys.AUTH_SESSION);
    await storageService.removeItem(appConfig.storageKeys.ACTIVE_SELECTION);
    return true;
  },
};

export default authService;
