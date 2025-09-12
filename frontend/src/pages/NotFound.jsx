import React from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import notFoundAnimation from '../assets/notfound-lottie.json';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <br />
      <div className="w-80 h-70">
        <Lottie animationData={notFoundAnimation} loop={true} />
      </div>
      <p className="text-2xl text-gray-600 mb-8">Oops! Page not found</p>
      <p className="text-gray-500 mb-8 max-w-md">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;