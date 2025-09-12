import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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

  const API_BASE_URL = 'http://localhost:5001/api';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedSymptoms = symptoms.trim();
    
    if (!trimmedSymptoms) {
      toast.error('Please describe your symptoms to get herbal remedy suggestions.');
      return;
    }

    // Simple validation for minimum length
    if (trimmedSymptoms.length < 10) {
      toast.error('Please provide more details about your symptoms for better suggestions.');
      return;
    }

    setIsLoading(true);
    setRemedy('');
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/herbal-remedy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ symptoms: trimmedSymptoms }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get herbal remedy suggestions');
      }

      const result = await response.json();
      
      if (!result.data || !result.data.remedy) {
        throw new Error('No remedy data received from server');
      }

      setRemedy(result.data.remedy);
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

  const renderMarkdown = (content) => {
    return (
      <ReactMarkdown
        components={{
          code({node, inline, className, children, ...props}) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={vscDarkPlus}
                language={match[1]}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          a: ({node, ...props}) => (
            <a 
              {...props} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            />
          ),
          ul: ({node, ...props}) => (
            <ul className="list-disc pl-6 space-y-2 my-2" {...props} />
          ),
          ol: ({node, ...props}) => (
            <ol className="list-decimal pl-6 space-y-2 my-2" {...props} />
          ),
          h2: ({node, ...props}) => (
            <h2 className="text-2xl font-bold mt-6 mb-3 text-gray-800" {...props} />
          ),
          h3: ({node, ...props}) => (
            <h3 className="text-xl font-semibold mt-5 mb-2 text-gray-800" {...props} />
          ),
          p: ({node, ...props}) => (
            <p className="mb-4 leading-relaxed text-gray-700" {...props} />
          ),
          strong: ({node, ...props}) => (
            <strong className="font-semibold" {...props} />
          ),
          em: ({node, ...props}) => (
            <em className="italic" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

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
            <div className="relative">
              <textarea
                ref={textareaRef}
                id="symptoms"
                rows={3}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Example: I've been experiencing headaches and fatigue for the past few days. I also have trouble sleeping at night."
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-none"
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
                  : 'bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
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
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385V4.804zM10 15.384A7.962 7.962 0 0015.5 14c1.255 0 2.443.29 3.5.804v-10A7.97 7.97 0 0015.5 4c-1.67 0-3.219.51-4.5 1.385v9.999zM0 15.5a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5zm17 0a.5.5 0 01.5-.5h2a.5.5 0 010 1h-2a.5.5 0 01-.5-.5z" />
                  </svg>
                  Find Natural Remedies
                </>
              )}
            </button>
          </div>
        </form>

        {isLoading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          </div>
        )}

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
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 bg-green-100 p-2 rounded-full">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="ml-3 text-xl font-bold text-gray-900">Your Personalized Herbal Remedy</h3>
            </div>
            
            <div className="prose prose-green max-w-none">
              {renderMarkdown(remedy)}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-blue-800">Important Note</h4>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>
                        The information provided is for educational purposes only and is not intended as medical advice. 
                        Always consult with a qualified healthcare provider before starting any herbal treatment, 
                        especially if you are pregnant, nursing, have a medical condition, or are taking medications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default HerbalRemedySearch;
