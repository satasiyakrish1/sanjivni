import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const GoogleFitDashboard = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [fitnessData, setFitnessData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedView, setSelectedView] = useState('daily'); // daily, weekly, monthly

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const error = urlParams.get('error');

    if (error) {
      toast.error(decodeURIComponent(error));
      window.history.replaceState({}, '', '/google-fit');
    } else if (status === 'success') {
      toast.success('Successfully connected to Google Fit');
      window.history.replaceState({}, '', '/google-fit');
    }

    checkGoogleFitConnection();
  }, []);

  const checkGoogleFitConnection = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/google-fit/status`, {
        headers: { token }
      });
      setIsConnected(data.isConnected);
      if (data.isConnected) {
        await getFitnessData();
      }
    } catch (error) {
      console.error('Error checking Google Fit connection:', error);
      if (error.response?.data?.message === 'Not Authorized Login Again' || 
          error.response?.status === 401) {
        setIsConnected(false);
        setFitnessData(null);
        toast.warning('Your Google Fit session has expired. Please reconnect to continue.');
        window.history.replaceState({}, '', '/google-fit');
      } else {
        toast.error('Failed to check Google Fit connection status');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const connectGoogleFit = async () => {
    if (!backendUrl) {
      toast.error('Backend URL is not configured. Please contact support.');
      return;
    }
    if (!token) {
      toast.error('Authentication token not found. Please log in again.');
      return;
    }

    try {
      const { data } = await axios.get(`${backendUrl}/api/user/google-fit/auth-url`, {
        headers: { token } // Change from Authorization: `Bearer ${token}` to match what authUser.js expects
      });

      if (data && data.authUrl && typeof data.authUrl === 'string') {
        window.location.href = data.authUrl;
      } else {
        console.error('Invalid authUrl received:', data);
        toast.error('Failed to get authorization URL from server. Please try again.');
      }
    } catch (error) {
      console.error('Error connecting to Google Fit:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Failed to connect to Google Fit: ${error.response.data.message}`);
      } else {
        toast.error('Failed to connect to Google Fit. Please check your connection and try again.');
      }
    }
  };

  const getFitnessData = async () => {
    try {
      setIsLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/user/google-fit/data`, {
        headers: { token }
      });
      setFitnessData(data.fitnessData);
    } catch (error) {
      console.error('Error fetching fitness data:', error);
      if (error.response?.data?.message === 'Not Authorized Login Again' || 
          error.response?.status === 401) {
        setIsConnected(false);
        setFitnessData(null);
        toast.warning('Your Google Fit session has expired. Please reconnect to continue.');
        window.history.replaceState({}, '', '/google-fit');
      } else {
        toast.error('Failed to fetch fitness data');
        setFitnessData(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderMetricCard = (title, value, unit, icon) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <span className="text-gray-400">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-800">
        {value.toLocaleString()} <span className="text-sm text-gray-500">{unit}</span>
      </p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Fitness Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your daily activities and health metrics
        </p>
      </div>

      {!isConnected ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Connect to Google Fit
          </h3>
          <p className="text-gray-500 mb-6">
            Link your Google Fit account to view your fitness data
          </p>
          <button
            onClick={connectGoogleFit}
            className="bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors"
          >
            Connect Google Fit
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedView('daily')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedView === 'daily' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Daily
              </button>
              <button
                onClick={() => setSelectedView('weekly')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedView === 'weekly' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Weekly
              </button>
              <button
                onClick={() => setSelectedView('monthly')}
                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedView === 'monthly' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Monthly
              </button>
            </div>
            <button
              onClick={getFitnessData}
              className="text-primary hover:text-primary-dark text-sm font-medium"
            >
              Refresh Data
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading your fitness data...
            </div>
          ) : fitnessData ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {renderMetricCard('Steps', fitnessData.steps, 'steps', '👣')}
              {renderMetricCard('Calories', fitnessData.calories, 'kcal', '🔥')}
              {renderMetricCard('Active Time', fitnessData.activeMinutes, 'min', '⏱')}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No fitness data available. Please try refreshing the data.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GoogleFitDashboard;