/**
 * Connection Diagnostic Utility
 * 
 * This utility provides functions to diagnose connection issues between
 * the frontend and backend applications.
 */

import axios from 'axios';
import { getBackendUrl } from './connectionHelper';

/**
 * Tests the connection to the backend server and provides detailed diagnostics
 * @returns {Promise<Object>} - Diagnostic results
 */
export const diagnoseConnection = async () => {
  const backendUrl = getBackendUrl();
  const results = {
    success: false,
    backendUrl,
    timestamp: new Date().toISOString(),
    endpoints: {},
    recommendations: []
  };

  try {
    // Test root endpoint
    try {
      const rootResponse = await axios.get(backendUrl, { timeout: 10000 });
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
      
      // Add recommendation based on error
      if (error.code === 'ECONNREFUSED') {
        results.recommendations.push('Backend server appears to be down or not running. Check if the server is started.');
      } else if (error.code === 'ECONNABORTED') {
        results.recommendations.push('Connection timed out. The backend server might be overloaded or too slow to respond.');
      }
    }

    // Test health endpoint
    try {
      const healthResponse = await axios.get(`${backendUrl}/health`, { timeout: 10000 });
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

    // Test API endpoint
    try {
      const apiResponse = await axios.get(`${backendUrl}/api/doctor/list`, { timeout: 10000 });
      results.endpoints.api = {
        success: true,
        status: apiResponse.status,
        data: apiResponse.data.success
      };
    } catch (error) {
      results.endpoints.api = {
        success: false,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      };
      
      // Check for CORS issues
      if (error.message.includes('CORS')) {
        results.recommendations.push('CORS issue detected. Check that your frontend origin is allowed in the backend CORS configuration.');
      }
    }

    // Overall success if at least one endpoint is successful
    results.success = Object.values(results.endpoints).some(endpoint => endpoint.success);
    
    // Add general recommendations
    if (!results.success) {
      results.recommendations.push('Check if the backend URL is correct in your .env file.');
      results.recommendations.push('Try using the local proxy by setting VITE_USE_LOCAL_PROXY=true in your .env file.');
      results.recommendations.push('Verify that the backend server is running and accessible.');
    }
    
    return results;
  } catch (error) {
    results.error = error.message;
    return results;
  }
};

/**
 * Checks if the current environment is properly configured
 * @returns {Object} - Configuration status
 */
export const checkEnvironmentConfig = () => {
  const isProduction = import.meta.env.PROD;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const useLocalProxy = import.meta.env.VITE_USE_LOCAL_PROXY === 'true';
  
  return {
    isProduction,
    backendUrl,
    useLocalProxy,
    isConfigured: Boolean(backendUrl),
    recommendations: [
      !backendUrl ? 'VITE_BACKEND_URL is not set in your .env file.' : '',
      isProduction && useLocalProxy ? 'Local proxy should not be used in production.' : '',
      !isProduction && !useLocalProxy ? 'Consider enabling local proxy for development to avoid CORS issues.' : ''
    ].filter(Boolean)
  };
};

/**
 * Attempts to fix common connection issues automatically
 * @returns {Promise<Object>} - Fix results
 */
export const attemptConnectionFix = async () => {
  const backendUrl = getBackendUrl();
  const results = {
    success: false,
    fixes: []
  };
  
  // Try with different timeout values
  try {
    const response = await axios.get(`${backendUrl}/api/doctor/list`, { timeout: 30000 });
    if (response.status === 200) {
      results.success = true;
      results.fixes.push('Increased request timeout to 30 seconds');
    }
  } catch (error) {
    // Try with local proxy if not already using it
    if (!import.meta.env.VITE_USE_LOCAL_PROXY) {
      results.fixes.push('Consider enabling the local proxy by setting VITE_USE_LOCAL_PROXY=true in your .env file');
    }
    
    // Check if backend URL has trailing slash and suggest fix
    if (backendUrl.endsWith('/')) {
      results.fixes.push('Backend URL has a trailing slash which might cause issues with some endpoints');
    }
  }
  
  return results;
};