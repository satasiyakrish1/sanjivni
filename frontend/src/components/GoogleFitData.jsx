import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const GoogleFitData = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [fitnessData, setFitnessData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkGoogleFitConnection();
  }, []);

  const checkGoogleFitConnection = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/google-fit/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsConnected(data.isConnected);
      if (data.isConnected) {
        getFitnessData();
      }
    } catch (error) {
      console.error('Error checking Google Fit connection:', error);
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
        headers: { Authorization: `Bearer ${token}` }
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
      const { data } = await axios.get(`${backendUrl}/api/user/google-fit/data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFitnessData(data.fitnessData);
    } catch (error) {
      console.error('Error fetching fitness data:', error);
      toast.error('Failed to fetch fitness data');
    }
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Fitness Activity</h2>
        {!isConnected && (
          <button
            onClick={connectGoogleFit}
            className="bg-primary text-white px-4 py-2 rounded-full text-sm hover:bg-opacity-90"
          >
            Connect Google Fit
          </button>
        )}
      </div>

      {isConnected && fitnessData ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Steps Today</p>
            <p className="text-2xl font-semibold text-gray-800">
              {fitnessData.steps.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Calories Burned</p>
            <p className="text-2xl font-semibold text-gray-800">
              {fitnessData.calories} kcal
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Active Minutes</p>
            <p className="text-2xl font-semibold text-gray-800">
              {fitnessData.activeMinutes} min
            </p>
          </div>
        </div>
      ) : isConnected ? (
        <div className="text-center py-8 text-gray-500">Loading fitness data...</div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Connect your Google Fit account to see your fitness activity
        </div>
      )}
    </div>
  );
};

export default GoogleFitData;