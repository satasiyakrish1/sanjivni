import React, { useState, useEffect, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { toast } from 'react-toastify';

/**
 * A wrapper component for Google reCAPTCHA with enhanced error handling and loading states
 */
const ReCaptchaWrapper = ({ onChange, className = '' }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const recaptchaRef = useRef(null);

  useEffect(() => {
    // Set a timeout to check if reCAPTCHA is still loading after 5 seconds
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('reCAPTCHA is taking too long to load');
        setError('loading-timeout');
      }
    }, 5000);

    // Check if the reCAPTCHA script failed to load
    const handleScriptError = (event) => {
      if (event.target && event.target.src && event.target.src.includes('recaptcha')) {
        console.error('reCAPTCHA script failed to load:', event);
        setLoading(false);
        setError('script-load-failed');
      }
    };

    window.addEventListener('error', handleScriptError, true);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('error', handleScriptError, true);
    };
  }, [loading]);

  const handleChange = (token) => {
    if (token) {
      console.log('reCAPTCHA verified successfully');
      setError(null);
    }
    onChange(token);
  };

  const handleExpired = () => {
    toast.info('reCAPTCHA has expired. Please verify again.');
    onChange('');
  };

  const handleError = (err) => {
    console.error('reCAPTCHA error occurred:', err);
    setLoading(false);
    setError('verification-error');
    toast.error('Error with reCAPTCHA. Please refresh the page or try a different browser.');
    onChange('');
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const getErrorMessage = () => {
    switch (error) {
      case 'loading-timeout':
        return 'reCAPTCHA is taking longer than expected to load. Please check your internet connection.';
      case 'script-load-failed':
        return 'Failed to load reCAPTCHA. Please try refreshing the page or check your internet connection.';
      case 'verification-error':
        return 'Error verifying reCAPTCHA. Please try again or use a different browser.';
      default:
        return 'An error occurred with reCAPTCHA. Please refresh the page.';
    }
  };

  return (
    <div className={`recaptcha-wrapper ${className}`}>
      {loading && (
        <div className="mb-2 text-sm text-gray-500">Loading reCAPTCHA...</div>
      )}
      
      <ReCAPTCHA
        ref={recaptchaRef}
        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        onChange={handleChange}
        onExpired={handleExpired}
        onErrored={handleError}
        onLoad={handleLoad}
      />
      
      {error && (
        <div className="mt-2 text-xs text-red-500">
          {getErrorMessage()}
        </div>
      )}
      
      <div className="mt-2 text-xs text-gray-500">
        Having trouble? Try using a different browser or check your internet connection.
      </div>
    </div>
  );
};

export default ReCaptchaWrapper;