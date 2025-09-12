import React, { useState, useEffect } from 'react';
import { diagnoseConnection, checkEnvironmentConfig, attemptConnectionFix } from '../utils/connectionDiagnostic';
import { getBackendUrl } from '../utils/connectionHelper';

const ConnectionTroubleshooter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [envConfig, setEnvConfig] = useState(null);
  const [fixResults, setFixResults] = useState(null);
  const [backendUrl, setBackendUrl] = useState('');

  useEffect(() => {
    setBackendUrl(getBackendUrl());
    setEnvConfig(checkEnvironmentConfig());
  }, []);

  const runDiagnostics = async () => {
    setIsLoading(true);
    setDiagnosticResults(null);
    setFixResults(null);
    
    try {
      const results = await diagnoseConnection();
      setDiagnosticResults(results);
    } catch (error) {
      console.error('Error running diagnostics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const attemptFix = async () => {
    setIsLoading(true);
    setFixResults(null);
    
    try {
      const results = await attemptConnectionFix();
      setFixResults(results);
      
      // If fix was successful, run diagnostics again to confirm
      if (results.success) {
        const diagResults = await diagnoseConnection();
        setDiagnosticResults(diagResults);
      }
    } catch (error) {
      console.error('Error attempting fix:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Connection Issue?
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl p-4 w-96 max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Connection Troubleshooter</h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Connection Status:</p>
            <div className="bg-gray-100 p-2 rounded text-sm">
              {backendUrl ? 'Connected to backend server' : 'Not connected'}
            </div>
          </div>
          
          {envConfig && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-1">Environment Configuration:</p>
              <ul className="text-xs text-gray-600 list-disc pl-5">
                <li>Mode: {envConfig.isProduction ? 'Production' : 'Development'}</li>
                <li>Local Proxy: {envConfig.useLocalProxy ? 'Enabled' : 'Disabled'}</li>
                {envConfig.recommendations.length > 0 && (
                  <li className="mt-1">
                    <span className="font-semibold text-amber-600">Recommendations:</span>
                    <ul className="list-disc pl-4 mt-1">
                      {envConfig.recommendations.map((rec, i) => (
                        <li key={i} className="text-amber-600">{rec}</li>
                      ))}
                    </ul>
                  </li>
                )}
              </ul>
            </div>
          )}
          
          <div className="flex space-x-2 mb-4">
            <button
              onClick={runDiagnostics}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 px-4 rounded disabled:opacity-50"
            >
              {isLoading ? 'Running...' : 'Run Diagnostics'}
            </button>
            
            <button
              onClick={attemptFix}
              disabled={isLoading || !diagnosticResults || diagnosticResults.success}
              className="bg-green-500 hover:bg-green-600 text-white text-sm py-2 px-4 rounded disabled:opacity-50"
            >
              Attempt Fix
            </button>
          </div>
          
          {diagnosticResults && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-1">
                Diagnostic Results: 
                <span className={diagnosticResults.success ? 'text-green-500' : 'text-red-500'}>
                  {diagnosticResults.success ? ' Connected' : ' Failed'}
                </span>
              </p>
              
              <div className="text-xs">
                <p className="font-semibold mt-2">Endpoint Status:</p>
                <ul className="list-disc pl-5">
                  {Object.entries(diagnosticResults.endpoints).map(([name, result]) => (
                    <li key={name} className={result.success ? 'text-green-600' : 'text-red-600'}>
                      {name}: {result.success ? 'Success' : `Failed - ${result.error}`}
                    </li>
                  ))}
                </ul>
                
                {diagnosticResults.recommendations.length > 0 && (
                  <>
                    <p className="font-semibold mt-2">Recommendations:</p>
                    <ul className="list-disc pl-5">
                      {diagnosticResults.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            </div>
          )}
          
          {fixResults && (
            <div className="mb-4">
              <p className="text-sm font-semibold mb-1">
                Fix Attempt: 
                <span className={fixResults.success ? 'text-green-500' : 'text-amber-500'}>
                  {fixResults.success ? ' Successful' : ' Partial'}
                </span>
              </p>
              
              {fixResults.fixes.length > 0 && (
                <>
                  <p className="text-xs font-semibold mt-1">Applied Fixes:</p>
                  <ul className="text-xs list-disc pl-5">
                    {fixResults.fixes.map((fix, i) => (
                      <li key={i}>{fix}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-4 border-t pt-2">
            <p className="font-semibold">Common Solutions:</p>
            <ul className="list-disc pl-5 mt-1">
              <li>Check if the backend server is running</li>
              <li>Verify your internet connection</li>
              <li>Try enabling the local proxy in development</li>
              <li>Check CORS configuration in the backend</li>
              <li>Ensure environment variables are correctly set</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectionTroubleshooter;