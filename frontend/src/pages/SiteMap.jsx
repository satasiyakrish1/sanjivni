import React from 'react';

const publicRoutes = [
  { label: 'Home', path: '/' },
  { label: 'About', path: '/about' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Contact', path: '/contact' },
  { label: 'Terms & Conditions', path: '/terms' },
  { label: 'Team', path: '/team' },
];

const protectedRoutes = [
];

const SiteMap = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold text-primary mb-6 text-center">Site Map</h1>
      <p className="text-gray-600 mb-10 text-center">Overview of all main pages and routes in the application.</p>
      <div className="mb-10">
        <h2 className="text-2xl font-semibold mb-3">Public Pages</h2>
        <ul className="space-y-2">
          {publicRoutes.map((route, idx) => (
            <li key={idx} className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-green-400 rounded-full"></span>
              <span className="font-medium">{route.label}:</span>
              <span className="text-gray-700">{route.path}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-3">Other</h2>
        <ul className="space-y-2">
          <li className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-gray-400 rounded-full"></span>
            <span className="font-medium">Not Found (404):</span>
            <span className="text-gray-700">Any undefined route</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SiteMap; 