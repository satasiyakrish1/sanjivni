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
  // Check if we're in a production environment
  const isProduction = import.meta.env.PROD;
  
  try {
    if (isProduction) {
      // First check if a specific backend URL is provided in environment variables
      const configuredUrl = import.meta.env.VITE_BACKEND_URL;
      
      // If a valid URL is configured, use it (after removing any trailing slash)
      if (configuredUrl && configuredUrl !== 'auto') {
        const formattedUrl = configuredUrl.replace(/\/$/, '');
        try {
          new URL(formattedUrl);
          console.log(`Using configured backend URL: ${formattedUrl}`);
          return formattedUrl;
        } catch (e) {
          console.warn(`Invalid backend URL format: ${formattedUrl}. Will try auto-detection.`);
          // Continue to auto-detection if URL is invalid
        }
      }
      
      // Auto-detection: Try to derive backend URL from current origin
      // This works when frontend and backend are on the same domain but different paths/subdomains
      const currentOrigin = window.location.origin;
      
      // Option 1: Same domain, different path (e.g., example.com and example.com/api)
      const sameDomainUrl = `${currentOrigin}/api`;
      
      // Option 2: API subdomain (e.g., app.example.com and api.example.com)
      const apiSubdomainUrl = currentOrigin.replace(/\/\/([^\.]+)\./i, '//api.');
      
      // Option 3: Backend subdomain (e.g., app.example.com and backend.example.com)
      const backendSubdomainUrl = currentOrigin.replace(/\/\/([^\.]+)\./i, '//backend.');
      
      // Option 4: Use the production URL from render.com
      const renderUrl = 'https://prescripto.live';
      
      console.log('Auto-detecting backend URL in production environment');
      return renderUrl; // Default to the known production URL
    } else {
      // For local development, check if we should use the proxy
      const useProxy = import.meta.env.VITE_USE_LOCAL_PROXY === 'true';
      
      if (useProxy) {
        // Use local proxy to avoid CORS issues during development
        return 'http://localhost:3001';
      } else {
        // Direct connection to local backend
        return 'http://localhost:4000';
      }
    }
  } catch (error) {
    // If there's any error in determining the URL, log it and return a default
    console.error('Error determining backend URL:', error);
    return isProduction 
      ? 'https://prescripto.live' // Use the new production URL as fallback
      : 'http://localhost:4000';
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

  // Add browser and environment info for better diagnostics
  results.diagnostics = {
    userAgent: navigator.userAgent,
    environment: import.meta.env.MODE,
    viteEnv: {
      backendUrl: import.meta.env.VITE_BACKEND_URL,
      useLocalProxy: import.meta.env.VITE_USE_LOCAL_PROXY === 'true'
    }
  };
  
  try {
    // Test root endpoint
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

    // Test health endpoint
    try {
      const healthResponse = await axios.get(`${backendUrl}/health`, { timeout });
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

    // Overall success if at least one endpoint is successful
    results.success = Object.values(results.endpoints).some(endpoint => endpoint.success);
    
    return results;
  } catch (error) {
    results.error = error.message;
    return results;
  }
};

/**

/**
 * Creates a proxy URL for the backend server
 * @param {string} backendUrl - The URL of the backend server
 * @returns {string} - The proxy URL
 */
export const createProxyUrl = (backendUrl) => {
  // If running locally, use the local proxy server
  if (window.location.hostname === 'localhost') {
    return 'http://localhost:3001';
  }
  
  // Otherwise, use the backend URL directly
  return backendUrl;
};

/**
 * Creates an axios instance with enhanced retry capability and connection error handling
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Object} - Axios instance with retry capability
 */
export const createAxiosWithRetry = (maxRetries = 3, timeout = 15000) => {
  // Get the backend URL
  const baseURL = getBackendUrl();
  
  // Create axios instance with improved configuration
  const instance = axios.create({
    baseURL,
    timeout,
    headers: {
      'Content-Type': 'application/json'
    },
    // Validate status to handle a wider range of successful responses
    validateStatus: (status) => status >= 200 && status < 300
  });

  // Add request interceptor for connection status logging
  instance.interceptors.request.use(config => {
    // Log request for debugging
    console.log(`Request to ${config.url} initiated`);
    // Add timestamp to track request duration
    config.metadata = { startTime: new Date() };
    return config;
  }, error => {
    console.error('Request configuration error:', error.message);
    return Promise.reject(error);
  });

  // Add response interceptor for retry logic and error handling
  instance.interceptors.response.use(
    response => {
      // Calculate request duration for performance monitoring
      const duration = new Date() - response.config.metadata.startTime;
      console.log(`Request to ${response.config.url} completed in ${duration}ms`);
      return response;
    }, 
    async (error) => {
      const config = error.config;
      
      // Initialize retry count if not set
      if (!config || !config.retry) {
        config.retry = 0;
      }

      // Format error message for better debugging
      const errorMessage = error.response
        ? `Error ${error.response.status}: ${error.response.statusText}`
        : error.message || 'Unknown connection error';
      
      console.error(`Request failed: ${errorMessage}. Attempt: ${config.retry + 1}/${maxRetries + 1}`);

      // Check if we should retry based on error type
      const shouldRetry = (
        // Retry on network errors (no response)
        !error.response ||
        // Retry on server errors
        (error.response && error.response.status >= 500) ||
        // Retry on timeout errors
        error.code === 'ECONNABORTED' ||
        // Retry on network-related errors
        ['ECONNRESET', 'ETIMEDOUT', 'ENOTFOUND', 'ENETUNREACH'].includes(error.code)
      );

      if (config.retry < maxRetries && shouldRetry) {
        // Increase retry count
        config.retry += 1;
        
        // Implement exponential backoff with jitter for better retry distribution
        const delay = Math.min(
          1000 * Math.pow(2, config.retry) + Math.random() * 1000,
          8000 // Cap at 8 seconds
        );
        
        console.log(`Retrying request in ${Math.round(delay)}ms...`);
        
        // Create new promise to handle retry
        const delayRetry = new Promise(resolve => {
          setTimeout(resolve, delay);
        });
        
        // Wait for delay and retry request
        await delayRetry;
        return instance(config);
      }
      
      // If we've run out of retries, format a more helpful error message
      if (error.response) {
        error.message = `Server responded with status ${error.response.status}: ${error.response.statusText}`;
      } else if (error.code === 'ECONNABORTED') {
        error.message = `Network error: Request timeout after ${timeout}ms. The backend server at ${baseURL} is not responding.`;
      } else if (!navigator.onLine) {
        error.message = 'Network error: You appear to be offline. Please check your internet connection.';
      } else {
        error.message = `Network error: Unable to connect to the backend server at ${baseURL}. Please check your internet connection or server status.`;
      }
      
      return Promise.reject(error);
    }
  );

  return instance;
};

// Create a default axios instance with enhanced retry for use throughout the app
export const api = createAxiosWithRetry();

/**
 * Checks if the backend server is reachable
 * @param {string} url - URL to check
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<boolean>} - True if server is reachable
 */
export const isServerReachable = async (url = null, timeout = 5000) => {
  const backendUrl = url || getBackendUrl();
  try {
    // Use a HEAD request for efficiency
    await axios({
      method: 'HEAD',
      url: backendUrl,
      timeout
    });
    return true;
  } catch (error) {
    console.warn(`Server at ${backendUrl} is not reachable: ${error.message}`);
    return false;
  }
};

/**
 * Fallback mechanism for critical API requests
 * Attempts multiple strategies to connect to the backend
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Request options
 * @returns {Promise<Object>} - API response
 */
export const apiFallback = async (endpoint, options = {}) => {
  const { method = 'GET', data = null, params = null, timeout = 20000 } = options;
  
  // Try with the primary API instance first
  try {
    const response = await api({
      url: endpoint,
      method,
      data,
      params,
      timeout
    });
    return response.data;
  } catch (primaryError) {
    console.warn(`Primary API request failed: ${primaryError.message}. Trying fallback options...`);
    
    // Try with increased timeout
    try {
      console.log('Attempting with increased timeout...');
      const response = await axios({
        url: `${getBackendUrl()}${endpoint}`,
        method,
        data,
        params,
        timeout: 30000 // Extended timeout
      });
      return response.data;
    } catch (timeoutError) {
      // Try with alternative backend URL if in development
      if (!import.meta.env.PROD) {
        try {
          console.log('Attempting with alternative development URL...');
          const altUrl = 'http://localhost:3001'; // Local proxy fallback
          const response = await axios({
            url: `${altUrl}${endpoint}`,
            method,
            data,
            params,
            timeout
          });
          return response.data;
        } catch (altError) {
          console.error('All fallback attempts failed');
        }
      }
      
      // If all attempts fail, throw a comprehensive error
      const error = new Error(
        `Connection failed after multiple attempts. Please check if the backend server is running and accessible.`
      );
      error.originalError = primaryError;
      error.fallbackAttempts = 2;
      throw error;
    }
  }
};

// Export a function to add auth token to requests
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};