import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
        <p className="text-gray-700 font-medium">Analyzing data...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;