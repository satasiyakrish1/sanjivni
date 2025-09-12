/**
 * Connection Helper Utility for Frontend Application
 * 
 * This utility provides functions to help manage connections between the frontend
 * and backend, with features for handling connection issues, retries, and environment detection.
 */

import axios from 'axios';

/**
 * Determines the appropriate backend URL based on the current environment
 * with improved error handling and fallback options
 * @returns {string} - The backend URL to use
 */
export const getBackendUrl = () => {
  const isProduction = import.meta.env.PROD;
  
  try {
    if (isProduction) {
      const configuredUrl = import.meta.env.VITE_BACKEND_URL;
      if (configuredUrl && configuredUrl !== 'auto') {
        const formattedUrl = configuredUrl.replace(/\/$/, '');
        try {
          new URL(formattedUrl);
          console.log(`Using configured backend URL: ${formattedUrl}`);
          return formattedUrl;
        } catch (e) {
          console.warn(`Invalid backend URL format: ${formattedUrl}. Will use default.`);
        }
      }
      // Default production backend base (no trailing slash)
      return 'https://prescripto.live';
    } else {
      // Local development backend base (matches backend/server.js PORT 5001)
      return 'http://localhost:5001';
    }
  } catch (error) {
    console.error('Error determining backend URL:', error);
    return isProduction 
      ? 'https://prescripto.live'
      : 'http://localhost:5001';
  }
};

/**
 * Tests the connection to the backend server with comprehensive diagnostics
 * @param {string} customBackendUrl - Optional custom URL to test (overrides default)
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<Object>} - Connection test results with detailed diagnostics
 */
export const testBackendConnection = async (customBackendUrl, timeout = 15000) => {
  const backendUrl = customBackendUrl || getBackendUrl();
  const results = {
    success: false,
    endpoints: {},
    error: null,
    networkInfo: {
      online: navigator.onLine,
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      timestamp: new Date().toISOString()
    },
    diagnostics: {}
  };

  results.diagnostics = {
    userAgent: navigator.userAgent,
    environment: import.meta.env.MODE,
    viteEnv: {
      backendUrl: import.meta.env.VITE_BACKEND_URL
    }
  };
  
  try {
    try {
      const rootResponse = await axios.get(backendUrl, { timeout });
      results.endpoints.root = {
        success: true,
        status: rootResponse.status,
        data: rootResponse.data
      };
    } catch (error) {
      results.endpoints.root = {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }

    try {
      const healthResponse = await axios.get(`${backendUrl}/api/health`, { timeout });
      results.endpoints.health = {
        success: true,
        status: healthResponse.status,
        data: healthResponse.data
      };
    } catch (error) {
      results.endpoints.health = {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
    }

    results.success = Object.values(results.endpoints).some(endpoint => endpoint.success);
    
    return results;
  } catch (error) {
    results.error = error.message;
    return results;
  }
};

/**
 * Creates a proxy URL for the backend server
 * @param {string} backendUrl - The URL of the backend server
 * @returns {string} - The proxy URL
 */
export const createProxyUrl = (backendUrl) => {
  // For local dev we call backend directly on 5001; otherwise use provided URL
  return backendUrl;
};

/**
 * Creates an axios instance with enhanced retry capability and connection error handling
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Object} - Axios instance with retry capability
 */
export const createAxiosWithRetry = (maxRetries = 3, timeout = 15000) => {
  const baseURL = getBackendUrl();
  
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    },
    validateStatus: (status) => status >= 200 && status < 300
  });

  instance.interceptors.request.use(config => {
    config.metadata = { startTime: new Date() };
    return config;
  }, error => {
    return Promise.reject(error);
  });

  instance.interceptors.response.use(
    response => {
      return response;
    }, 
    async (error) => {
      const config = error.config || {};
      if (config.retry == null) config.retry = 0;

      const shouldRetry = (
        !error.response ||
        (error.response && error.response.status >= 500) ||
        error.code === 'ECONNABORTED' ||
        ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH', 'ECONNREFUSED'].includes(error.code)
      );

      if (config.retry < maxRetries && shouldRetry) {
        config.retry += 1;
        const delay = Math.min(1000 * Math.pow(2, config.retry) + Math.random() * 1000, 8000);
        await new Promise(r => setTimeout(r, delay));
        return instance(config);
      }

      if (error.response) {
        error.message = `Server responded with status ${error.response.status}: ${error.response.statusText}`;
      } else if (error.code === 'ECONNABORTED') {
        error.message = `Network error: Request timeout after ${timeout}ms. The backend server at ${baseURL} is not responding.`;
      } else if (!navigator.onLine) {
        error.message = 'Network error: You appear to be offline. Please check your internet connection.';
      } else {
        error.message = `Network error: Unable to connect to the backend server at ${baseURL}. Please ensure it is running.`;
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

export const api = createAxiosWithRetry();

export const isServerReachable = async (url = null, timeout = 5000) => {
  const backendUrl = url || getBackendUrl();
  try {
    await axios({ method: 'HEAD', url: backendUrl, timeout });
    return true;
  } catch (error) {
    return false;
  }
};

export const apiFallback = async (endpoint, options = {}) => {
  const { method = 'GET', data = null, params = null, timeout = 20000 } = options;
  try {
    const response = await api({ url: endpoint, method, data, params, timeout });
    return response.data;
  } catch (primaryError) {
    // Try direct call to backend base URL
    try {
      const response = await axios({ url: `${getBackendUrl()}${endpoint}`, method, data, params, timeout: 30000 });
      return response.data;
    } catch (e) {
      const error = new Error('Connection failed after multiple attempts. Please check if the backend server is running and accessible.');
      error.originalError = primaryError;
      throw error;
    }
  }
};

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};