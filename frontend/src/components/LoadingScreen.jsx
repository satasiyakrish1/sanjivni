import React from 'react';

const LoadingScreen = ({ isLoading }) => {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;