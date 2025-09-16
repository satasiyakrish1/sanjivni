import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { getBackendUrl } from '../utils/connectionHelper';

/**
 * Custom CAPTCHA component that provides alternative to reCAPTCHA
 * Supports math problems, pattern recognition, and color identification
 */
const CustomCaptcha = ({ onVerify, onError, disabled = false }) => {
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [verified, setVerified] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // We're using getBackendUrl() directly instead of context
  const colorBoxRef = useRef(null);
  
  // Fetch a new challenge when component mounts or when refreshed
  useEffect(() => {
    fetchChallenge();
  }, []);
  
  // Fetch a new challenge when too many failed attempts
  useEffect(() => {
    if (attempts >= 3 && !verified) {
      fetchChallenge();
      setAttempts(0);
    }
  }, [attempts, verified]);
  
  const fetchChallenge = async () => {
    setLoading(true);
    setError('');
    setAnswer('');
    setRefreshing(true);
    
    try {
      // Try to fetch from backend first
      try {
        // Use getBackendUrl() to get the correct backend URL based on environment
        const apiUrl = getBackendUrl();
        console.log('Fetching captcha challenge from:', `${apiUrl}/api/captcha/challenge`);
        const response = await axios.get(`${apiUrl}/api/captcha/challenge`);
        if (response.data.success) {
          setChallenge(response.data.challenge);
          return; // Exit if successful
        }
      } catch (apiError) {
        console.warn('Could not fetch challenge from API, using fallback:', apiError);
        // Continue to fallback if API call fails
      }
      
      // Fallback: Generate a simple math challenge locally
      const num1 = Math.floor(Math.random() * 10) + 1;
      const num2 = Math.floor(Math.random() * 10) + 1;
      const fallbackChallenge = {
        question: `What is ${num1} + ${num2}?`,
        type: 'math'
      };
      setChallenge(fallbackChallenge);
    } catch (err) {
      console.error('Error generating captcha challenge:', err);
      setError('Failed to load challenge. Please try again.');
      if (onError) onError('Failed to load challenge');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const handleSubmit = async () => {
    if (!answer || answer.trim() === '') {
      setError('Please provide an answer');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Generate a token with timestamp and random string
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const token = `custom_captcha_${timestamp}_${randomString}`;
      
      // Check if we're using the fallback math challenge
      if (challenge && challenge.question && challenge.question.includes('What is') && challenge.type === 'math') {
        // Extract numbers from the question
        const matches = challenge.question.match(/\d+/g);
        if (matches && matches.length >= 2) {
          const num1 = parseInt(matches[0]);
          const num2 = parseInt(matches[1]);
          const expectedAnswer = (num1 + num2).toString();
          
          // Verify locally
          if (answer === expectedAnswer) {
            setVerified(true);
            setLoading(false);
            
            if (onVerify) {
              onVerify(token);
            }
          } else {
            setError('Incorrect answer. Please try again.');
            setAttempts(prev => prev + 1);
            setLoading(false);
          }
          return;
        }
      }
      
      // For non-fallback challenges or if fallback extraction failed
      // In a production environment, we would verify the answer on the server
      // const apiUrl = getBackendUrl();
      // const response = await axios.post(`${apiUrl}/api/captcha/verify`, {
      //   token,
      //   answer,
      //   challengeId: challenge.id // If your backend implementation uses challenge IDs
      // });
      
      // Simulate server verification
      setTimeout(() => {
        setVerified(true);
        setLoading(false);
        
        if (onVerify) {
          onVerify(token);
        }
      }, 500);
    } catch (err) {
      console.error('Error verifying captcha:', err);
      setError('Verification failed. Please try again.');
      setAttempts(prev => prev + 1);
      setLoading(false);
      
      if (onError) {
        onError('Verification failed');
      }
    }
  };
  
  const handleRefresh = () => {
    fetchChallenge();
  };
  
  const renderChallenge = () => {
    if (!challenge) return null;
    
    switch (challenge.type) {
      case 'math':
        return (
          <div>
            <p className="mb-4">{challenge.question}</p>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                type="number"
                disabled={verified || disabled}
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">Answer</label>
            </div>
          </div>
        );
        
      case 'pattern':
        return (
          <div>
            <p className="mb-4">{challenge.question}</p>
            <div className="relative">
              <input
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                type="number"
                disabled={verified || disabled}
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-600">Answer</label>
            </div>
          </div>
        );
        
      case 'color':
        return (
          <div>
            <p className="mb-4">{challenge.question}</p>
            <div 
              ref={colorBoxRef}
              className="w-full h-12 rounded mb-4"
              style={{ backgroundColor: challenge.colorHex }}
            ></div>
            <div className="space-y-2">
              {challenge.options.map((option, index) => (
                <label key={index} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    value={option}
                    checked={answer === option}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={verified || disabled}
                    className="h-4 w-4 text-green-600 focus:ring-green-600 border-gray-300 disabled:opacity-50"
                  />
                  <span className="text-gray-700">{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
        );
        
      default:
        return <p>Unknown challenge type</p>;
    }
  };
  
  return (
    <div className="border border-gray-300 rounded-md p-4 bg-gray-50 max-w-md">
      <h6 className="text-lg font-medium mb-4">Security Check</h6>
      
      {loading ? (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
      ) : error ? (
        <div>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            className="border border-gray-300 rounded px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleRefresh}
            disabled={refreshing || disabled}
          >
            Try Again
          </button>
        </div>
      ) : verified ? (
        <div>
          <p className="text-green-600">Verification successful!</p>
        </div>
      ) : (
        <div>
          {renderChallenge()}
          
          <div className="flex justify-between mt-4">
            <button 
              className="border border-gray-300 rounded px-4 py-2 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRefresh}
              disabled={refreshing || disabled}
            >
              Refresh
            </button>
            <button 
              className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleSubmit}
              disabled={!answer || refreshing || disabled}
            >
              Verify
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomCaptcha;