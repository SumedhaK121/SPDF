/**
 * API Client wrapper using Axios.
 * Installed and configured for future production API integration.
 * NOTE: In demo mode, this client is NOT invoked. All calls go through local demo services.
 */

import axios from 'axios';
import { apiConfig } from '../config/apiConfig';

export const apiClient = axios.create({
  baseURL: apiConfig.BASE_URL,
  timeout: apiConfig.TIMEOUT_MS,
  headers: apiConfig.HEADERS,
});

// Interceptor for attaching auth tokens when real backend is connected
apiClient.interceptors.request.use(
  config => {
    // In real mode: attach authorization header if token exists
    // const token = await storageService.getItem('@spbf_auth_token');
    // if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response,
  error => {
    console.warn('[apiClient] HTTP Error (expected in demo mode):', error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
