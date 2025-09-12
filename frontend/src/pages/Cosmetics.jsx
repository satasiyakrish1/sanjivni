import React from 'react';
import { Link } from 'react-router-dom';
import CosmeticSearch from '../components/CosmeticSearch';
import SEO from '../components/SEO';

const Cosmetics = () => {
  return (
    <div className="py-8">
      <SEO 
        title="Cosmetics Search | Sanjivni" 
        description="Search and explore cosmetic products from top brands. Find makeup, skincare, and beauty products with detailed information." 
      />
      
      {/* Skin Analysis Banner */}
      <div className="mb-8 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
          <div className="text-white mb-4 md:mb-0">
            <h2 className="text-2xl font-bold mb-2">AI Skin Analysis</h2>
            <p className="opacity-90 mb-3">Upload a skin image for instant AI analysis. Get the top 5 possible skin conditions with no sign-up required.</p>
            <p className="text-sm bg-white bg-opacity-20 p-2 rounded-md inline-block">
              <span className="font-bold">100% Privacy Guaranteed</span> - Your images are never stored
            </p>
          </div>
          <Link 
            to="/skin-analysis" 
            className="px-6 py-3 bg-white text-purple-700 font-bold rounded-md hover:bg-gray-100 transition-colors shadow-md"
          >
            Try Skin Analysis
          </Link>
        </div>
      </div>
      
      <CosmeticSearch />
    </div>
  );
};


export default Cosmetics;