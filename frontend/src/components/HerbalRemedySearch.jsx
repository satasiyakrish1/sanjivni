import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import AIResponse from './AIResponse';
import { apiFallback } from '../utils/connectionHelper';

const HerbalRemedySearch = () => {
  const [symptoms, setSymptoms] = useState('');
  const [remedy, setRemedy] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const resultRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-resize textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [symptoms]);

  // Scroll to result when remedy is loaded
  useEffect(() => {
    if (remedy && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [remedy]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedSymptoms = symptoms.trim();
    
    if (!trimmedSymptoms) {
      toast.error('Please describe your symptoms to get herbal remedy suggestions.');
      return;
    }

    if (trimmedSymptoms.length < 10) {
      toast.error('Please provide more details about your symptoms for better suggestions.');
      return;
    }

    setIsLoading(true);
    setRemedy('');
    setError('');

    try {
      const payload = await apiFallback('/api/herbal-remedy', {
        method: 'POST',
        data: { symptoms: trimmedSymptoms },
        timeout: 30000
      });

      if (!payload?.data?.remedy) {
        throw new Error('No remedy data received from server');
      }

      setRemedy(payload.data.remedy);
      setError('');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      const errorMessage = error.message || 'An error occurred while generating remedy suggestions';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setSymptoms('');
    setRemedy('');
    setError('');
  };

  const Skeleton = () => (
    <div className="mt-8">
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/4 my-6"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          <div className="h-4 bg-gray-200 rounded w-3/5"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Herbal Remedy Finder</h2>
          <p className="text-lg text-gray-600">
            Describe your symptoms to receive personalized herbal remedy suggestions
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <label htmlFor="symptoms" className="sr-only">Describe your symptoms</label>
            <div className="relative" id="symptoms">
              <textarea
                ref={textareaRef}
                id="symptoms"
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've been experiencing headaches and fatigue for the past few days. I also have trouble sleeping at night."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary/60 transition-all duration-200 resize-none"
                disabled={isLoading}
                aria-label="Describe your symptoms"
              />
              {symptoms && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Clear input"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Be as detailed as possible for better recommendations
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || !symptoms.trim()}
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium text-white transition-all ${
                isLoading || !symptoms.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
              }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385V4.804zM10 15.384A7.962 7.962 0 0015.5 14c1.255 0 2.443.29 3.5.804v-10A7.97 7.97 0 0015.5 4c-1.67 0-3.219.51-4.5 1.385v9.999zM0 15.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" />
                  </svg>
                  Find Natural Remedies
                </>
              )}
            </button>
          </div>
        </form>

        {isLoading && <Skeleton />}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {remedy && (
          <div ref={resultRef} className="mt-8 transition-all duration-300 ease-in-out">
            <AIResponse content={remedy} title="Your Personalized Herbal Remedy" />
            <div className="mt-6">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
                <h4 className="text-sm font-medium text-blue-800">Note</h4>
                <p className="mt-1 text-sm text-blue-700">
                  These suggestions are informational and not a medical diagnosis.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HerbalRemedySearch;
