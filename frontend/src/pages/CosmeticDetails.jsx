import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import Lottie from 'react-lottie';
import SEO from '../components/SEO';

// Lottie animation URLs (using public CDN URLs)
const LOTTIE_URLS = {
  loading: 'https://lottie.host/10e3dd7a-3e62-499b-afed-d66133eb5b71/kn2TXAM5Oy.lottie', // loading animation
  notFound: 'https://lottie.host/10e3dd7a-3e62-499b-afed-d66133eb5b71/kn2TXAM5Oy.lottie', // not found animation
  error: 'https://lottie.host/10e3dd7a-3e62-499b-afed-d66133eb5b71/kn2TXAM5Oy.lottie' // error state animation
};

// Default placeholder image
const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/300x300?text=No+Image+Available';

const CosmeticDetails = () => {
  const { id } = useParams();
  const [cosmetic, setCosmetic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageError, setImageError] = useState(false);

  // References for GSAP animations
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const imageRef = useRef(null);
  const infoRef = useRef(null);
  const descriptionRef = useRef(null);
  const colorsRef = useRef(null);
  const tagsRef = useRef(null);

  // State to store Lottie animation data
  const [lottieData, setLottieData] = useState({
    loading: null,
    error: null,
    notFound: null
  });

  // Custom product placeholder
  const productPlaceholder = (
    <div className="w-full h-64 bg-pink-200 rounded-md flex items-center justify-center">
      <div className="text-center">
        <div className="text-xl font-medium text-gray-800">Product Image</div>
        <div className="mt-2 text-sm text-gray-600">Image not available</div>
      </div>
    </div>
  );

  // Fetch Lottie animations
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        // Fetch all animations in parallel
        const [loadingData, errorData, notFoundData] = await Promise.all([
          fetch(LOTTIE_URLS.loading).then(res => res.json()),
          fetch(LOTTIE_URLS.error).then(res => res.json()),
          fetch(LOTTIE_URLS.notFound).then(res => res.json())
        ]);

        setLottieData({
          loading: loadingData,
          error: errorData,
          notFound: notFoundData
        });
      } catch (err) {
        console.error('Error loading Lottie animations:', err);
      }
    };

    fetchAnimations();
  }, []);

  // Lottie options creation function
  const createLottieOptions = (animationData) => ({
    loop: true,
    autoplay: true,
    animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  });

  // Fetch cosmetic data
  useEffect(() => {
    const fetchCosmeticDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://makeup-api.herokuapp.com/api/v1/products/${id}.json`);
        setCosmetic(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch cosmetic details. Please try again.');
        console.error('Fetch error:', err);
      } finally {
        // Delay setting loading to false for smoother animation transitions
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchCosmeticDetails();
  }, [id]);

  // GSAP animations
  useEffect(() => {
    if (!loading && cosmetic && pageRef.current) {
      // Main container fade in
      gsap.from(pageRef.current, {
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });

      // Header animation
      gsap.from(headerRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        delay: 0.2,
        ease: "back.out(1.7)"
      });

      // Staggered content sections animation
      const contentSections = [
        imageRef.current,
        infoRef.current,
        descriptionRef.current,
        colorsRef.current,
        tagsRef.current
      ].filter(Boolean); // Filter out any null refs

      gsap.from(contentSections, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.15,
        delay: 0.4,
        ease: "power3.out"
      });
    }
  }, [loading, cosmetic]);

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  // Enhanced Skeleton loading component with pulse animation
  const EnhancedSkeletonLoading = () => (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header skeleton with gradient */}
        <div className="bg-gradient-to-r from-pink-200 to-purple-100 p-6 animate-pulse">
          <div className="h-8 bg-pink-300 rounded-md w-3/4 mb-2"></div>
          <div className="h-5 bg-pink-300 rounded-md w-1/2"></div>
        </div>

        <div className="p-6">
          {/* Two column grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
            <div className="bg-purple-50 p-5 rounded-lg border border-purple-100">
              <div className="h-6 bg-purple-200 rounded-md w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="h-4 bg-purple-200 rounded-md w-24 mr-4"></div>
                    <div className="h-4 bg-gray-200 rounded-md flex-grow"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-pink-50 p-5 rounded-lg border border-pink-100">
              <div className="h-6 bg-pink-200 rounded-md w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="h-4 bg-pink-200 rounded-md w-24 mr-4"></div>
                    <div className="h-4 bg-gray-200 rounded-md flex-grow"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Image skeleton */}
          <div className="bg-gray-100 p-5 rounded-lg border border-gray-200 mb-6 animate-pulse">
            <div className="h-64 bg-gray-200 rounded-md w-full"></div>
          </div>

          {/* Description skeleton */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6 animate-pulse">
            <div className="flex items-center mb-3">
              <div className="h-5 w-5 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-6 bg-gray-300 rounded-md w-1/3"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Error state component
  const ErrorState = ({ message }) => (
    <div className="max-w-4xl mx-auto p-4 text-center">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
        <div className="w-64 h-64 mx-auto mb-6">
          {lottieData.error && (
            <Lottie
              options={createLottieOptions(lottieData.error)}
              height={250}
              width={250}
            />
          )}
        </div>
        <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6">{message || 'We encountered an error while fetching the cosmetic details.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Not found component
  const NotFoundState = () => (
    <div className="max-w-4xl mx-auto p-4 text-center">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
        <div className="w-64 h-64 mx-auto mb-6">
          {lottieData.notFound && (
            <Lottie
              options={createLottieOptions(lottieData.notFound)}
              height={250}
              width={250}
            />
          )}
        </div>
        <h2 className="text-2xl font-bold text-purple-600 mb-4">Cosmetic Not Found</h2>
        <p className="text-gray-600 mb-6">We couldn't find the cosmetic product you're looking for.</p>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  // Render loading state
  if (loading) {
    return (
      <div className="py-8">
        <SEO title="Loading Cosmetic Details" description="Loading cosmetic product information" />
        <div className="w-64 h-64 mx-auto mb-6">
          {lottieData.loading ? (
            <Lottie
              options={createLottieOptions(lottieData.loading)}
              height={250}
              width={250}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
            </div>
          )}
        </div>
        <EnhancedSkeletonLoading />
      </div>
    );
  }

  // Render error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Render not found state
  if (!cosmetic) {
    return <NotFoundState />;
  }

  // Format price with currency
  const formatPrice = (price, currency) => {
    const currencySymbol = currency === 'USD' ? '$' : currency === 'CAD' ? 'CA$' : currency === 'GBP' ? '£' : '$';
    return `${currencySymbol}${parseFloat(price).toFixed(2)}`;
  };

  // Render color box
  const ColorBox = ({ hexValue, colorName }) => {
    return (
      <div className="flex flex-col items-center mr-3 mb-3">
        <div 
          className="w-8 h-8 rounded-full border border-gray-300 shadow-sm" 
          style={{ backgroundColor: hexValue }}
          title={colorName}
        ></div>
        <span className="text-xs mt-1 text-gray-600">{colorName}</span>
      </div>
    );
  };

  return (
    <div className="py-8" ref={pageRef}>
      <SEO 
        title={`${cosmetic.name} by ${cosmetic.brand} | Cosmetics`} 
        description={cosmetic.description || `${cosmetic.name} by ${cosmetic.brand} - ${cosmetic.category || 'Cosmetic product'}`} 
      />

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white" ref={headerRef}>
          <h1 className="text-3xl font-bold mb-2">{cosmetic.name}</h1>
          <p className="text-lg opacity-90">{cosmetic.brand}</p>
        </div>

        <div className="p-6">
          {/* Two column layout for product info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Product image */}
            <div className="bg-white p-4 rounded-lg border border-gray-200" ref={imageRef}>
              {!imageError && cosmetic.image_link ? (
                <img 
                  src={cosmetic.image_link} 
                  alt={cosmetic.name} 
                  className="w-full h-auto object-contain rounded-md shadow-sm"
                  onError={handleImageError}
                />
              ) : (
                <div className="w-full h-64 bg-pink-200 rounded-md flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-medium text-gray-800">Product Image</div>
                    <div className="mt-2 text-sm text-gray-600">Image not available</div>
                  </div>
                </div>
              )}
            </div>

            {/* Product info */}
            <div className="bg-pink-50 p-5 rounded-lg border border-pink-100" ref={infoRef}>
              <h2 className="text-xl font-semibold text-pink-700 mb-4">Product Information</h2>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Brand:</span>
                  <span className="text-gray-800">{cosmetic.brand}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Category:</span>
                  <span className="text-gray-800">{cosmetic.category || 'N/A'}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Type:</span>
                  <span className="text-gray-800">{cosmetic.product_type || 'N/A'}</span>
                </div>
                <div className="flex items-start">
                  <span className="font-medium text-gray-700 w-24">Price:</span>
                  <span className="text-gray-800">
                    {cosmetic.price ? formatPrice(cosmetic.price, cosmetic.currency || 'USD') : 'N/A'}
                  </span>
                </div>
                {cosmetic.rating && (
                  <div className="flex items-start">
                    <span className="font-medium text-gray-700 w-24">Rating:</span>
                    <div className="flex items-center">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.round(cosmetic.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">{cosmetic.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Tags/Labels */}
              {cosmetic.tag_list && cosmetic.tag_list.length > 0 && (
                <div className="mt-6" ref={tagsRef}>
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap">
                    {cosmetic.tag_list.map((tag, index) => (
                      <span 
                        key={index} 
                        className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-2 mb-2"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {cosmetic.description && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6" ref={descriptionRef}>
              <h2 className="text-xl font-semibold text-purple-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Description
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{cosmetic.description}</p>
            </div>
          )}

          {/* Product Colors */}
          {cosmetic.product_colors && cosmetic.product_colors.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6" ref={colorsRef}>
              <h2 className="text-xl font-semibold text-purple-700 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                Available Colors
              </h2>
              <div className="flex flex-wrap">
                {cosmetic.product_colors.map((color, index) => (
                  <ColorBox 
                    key={index} 
                    hexValue={color.hex_value} 
                    colorName={color.colour_name || `Color ${index + 1}`} 
                  />
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          <div className="flex flex-wrap justify-between items-center mt-8">
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
              <a 
                href={cosmetic.product_link} 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors"
              >
                View on Official Website
              </a>
              <a 
                href="/skin-analysis" 
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Analyze Your Skin
              </a>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
            >
              Back to Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CosmeticDetails;