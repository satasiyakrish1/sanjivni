import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { gsap } from 'gsap';
import Lottie from 'react-lottie';
import { AppContext } from '../context/AppContext';
import SEO from '../components/SEO';

// Lottie animation URLs (using public CDN URLs)
const LOTTIE_URLS = {
  medicineLoading: 'https://lottie.host/10e3dd7a-3e62-499b-afed-d66133eb5b71/kn2TXAM5Oy.lottie', // pill bottle loading animation
  medicineNotFound: 'https://lottie.host/10e3dd7a-3e62-499b-afed-d66133eb5b71/kn2TXAM5Oy.lottie', // empty medical file animation
  error: 'https://lottie.host/10e3dd7a-3e62-499b-afed-d66133eb5b71/kn2TXAM5Oy.lottie' // error state animation
};

const MedicineDetails = () => {
  const { id } = useParams();
  const { backendUrl } = useContext(AppContext);
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // References for GSAP animations
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const infoRef = useRef(null);
  const descriptionRef = useRef(null);
  const indicationsRef = useRef(null);
  const contraindicationsRef = useRef(null);
  const warningsRef = useRef(null);
  const sideEffectsRef = useRef(null);
  const precautionsRef = useRef(null);
  const interactionsRef = useRef(null);

  // State to store Lottie animation data
  const [lottieData, setLottieData] = useState({
    loading: null,
    error: null,
    notFound: null
  });

  // Fetch Lottie animations
  useEffect(() => {
    const fetchAnimations = async () => {
      try {
        // Fetch all animations in parallel
        const [loadingData, errorData, notFoundData] = await Promise.all([
          fetch(LOTTIE_URLS.medicineLoading).then(res => res.json()),
          fetch(LOTTIE_URLS.error).then(res => res.json()),
          fetch(LOTTIE_URLS.medicineNotFound).then(res => res.json())
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

  // Fetch medicine data
  useEffect(() => {
    const fetchMedicineDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${backendUrl}/api/medicine/${id}`);
        setMedicine(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch medicine details. Please try again.');
        console.error('Fetch error:', err);
      } finally {
        // Delay setting loading to false for smoother animation transitions
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      }
    };

    fetchMedicineDetails();
  }, [id, backendUrl]);

  // GSAP animations
  useEffect(() => {
    if (!loading && medicine && pageRef.current) {
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
        infoRef.current,
        descriptionRef.current,
        indicationsRef.current,
        contraindicationsRef.current,
        warningsRef.current,
        sideEffectsRef.current,
        precautionsRef.current,
        interactionsRef.current
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
  }, [loading, medicine]);

  // Enhanced Skeleton loading component with pulse animation
  const EnhancedSkeletonLoading = () => (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header skeleton with gradient */}
        <div className="bg-gradient-to-r from-gray-200 to-gray-100 p-6 animate-pulse">
          <div className="h-8 bg-gray-300 rounded-md w-3/4 mb-2"></div>
          <div className="h-5 bg-gray-300 rounded-md w-1/2"></div>
        </div>

        <div className="p-6">
          {/* Two column grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 animate-pulse">
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
              <div className="h-6 bg-blue-200 rounded-md w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="h-4 bg-blue-200 rounded-md w-24 mr-4"></div>
                    <div className="h-4 bg-gray-200 rounded-md flex-grow"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-cyan-50 p-5 rounded-lg border border-cyan-100">
              <div className="h-6 bg-cyan-200 rounded-md w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="flex items-start">
                    <div className="h-4 bg-cyan-200 rounded-md w-24 mr-4"></div>
                    <div className="h-4 bg-gray-200 rounded-md flex-grow"></div>
                  </div>
                ))}
              </div>
            </div>
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

          {/* Indications skeleton */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6 animate-pulse">
            <div className="flex items-center mb-3">
              <div className="h-5 w-5 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-6 bg-gray-300 rounded-md w-2/5"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-4/5"></div>
            </div>
            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <div className="h-5 bg-blue-200 rounded-md w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md w-full"></div>
              <div className="h-4 bg-gray-200 rounded-md w-5/6 mt-2"></div>
            </div>
          </div>

          {/* Warning skeleton */}
          <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 mb-6 animate-pulse">
            <div className="flex items-center mb-3">
              <div className="h-5 w-5 rounded-full bg-amber-300 mr-2"></div>
              <div className="h-6 bg-amber-200 rounded-md w-1/3"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <div key={item} className="flex">
                  <div className="h-4 w-4 rounded-full bg-amber-300 mr-2 flex-shrink-0 mt-1"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Side effects skeleton */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6 animate-pulse">
            <div className="flex items-center mb-3">
              <div className="h-5 w-5 rounded-full bg-gray-300 mr-2"></div>
              <div className="h-6 bg-gray-300 rounded-md w-1/3"></div>
            </div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex">
                  <div className="h-4 w-4 rounded-full bg-gray-300 mr-2 flex-shrink-0 mt-1"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center animate-pulse">
          <div className="h-10 bg-gray-300 rounded-lg w-24"></div>
          <div className="h-10 bg-blue-300 rounded-lg w-24"></div>
        </div>
      </div>
    </div>
  );

  // If Lottie animations haven't loaded yet, show the enhanced skeleton loading
  if (!lottieData.loading && loading) {
    return (
      <div className="py-8 px-4 bg-gray-50 min-h-screen">
        <EnhancedSkeletonLoading />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8 px-4 bg-gray-50 min-h-screen">
        <div className="flex justify-center mb-6">
          {lottieData.loading && (
            <div className="w-32 h-32">
              <Lottie options={createLottieOptions(lottieData.loading)} />
            </div>
          )}
        </div>
        <EnhancedSkeletonLoading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="w-64 h-64 mb-6">
          {lottieData.error && <Lottie options={createLottieOptions(lottieData.error)} />}
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Oops! Something went wrong</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <div className="w-64 h-64 mb-6">
          {lottieData.notFound && <Lottie options={createLottieOptions(lottieData.notFound)} />}
        </div>
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Medicine Not Found</h2>
          <p className="text-gray-700 mb-6">
            The medicine you're looking for doesn't exist or may have been removed.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 bg-gray-50 min-h-screen" ref={pageRef}>
      <SEO
        title={`${medicine.name} - Medicine Details | Prescripto`}
        description={`Detailed information about ${medicine.name}, including dosage, composition, and medical uses.`}
        keywords={`${medicine.name}, ${medicine.genericName}, medicine details, prescription, dosage`}
        canonicalUrl={`/medicines/${id}`}
      />

      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-6 text-white" ref={headerRef}>
          <h1 className="text-3xl font-bold mb-2">{medicine.name}</h1>
          <p className="text-xl opacity-90">{medicine.genericName}</p>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* General & Clinical Info Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" ref={infoRef}>
            <div className="bg-blue-50 p-5 rounded-lg border border-blue-100">
              <h2 className="text-xl font-semibold mb-4 text-blue-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                General Information
              </h2>
              <div className="space-y-3">
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-28">Drug Class:</span>
                  <span className="text-gray-800">{medicine.drugClass}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-28">Dosage Form:</span>
                  <span className="text-gray-800">{medicine.dosageForm}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-28">Strength:</span>
                  <span className="text-gray-800">{medicine.strength}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-28">Composition:</span>
                  <span className="text-gray-800">{medicine.composition}</span>
                </p>
              </div>
            </div>

            <div className="bg-cyan-50 p-5 rounded-lg border border-cyan-100">
              <h2 className="text-xl font-semibold mb-4 text-cyan-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
                </svg>
                Clinical Information
              </h2>
              <div className="space-y-3">
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-28">Pharmacology:</span>
                  <span className="text-gray-800">{medicine.clinicalPharmacology}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-28">Storage:</span>
                  <span className="text-gray-800">{medicine.storage}</span>
                </p>
                <p className="flex items-start">
                  <span className="font-medium text-gray-700 w-28">Pregnancy:</span>
                  <span className="text-gray-800">{medicine.pregnancy}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6" ref={descriptionRef}>
            <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
              </svg>
              Description
            </h2>
            <p className="text-gray-700 leading-relaxed">{medicine.description}</p>
          </div>

          {/* Indications & Usage Section */}
          <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6" ref={indicationsRef}>
            <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12zm-1-5a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd"></path>
              </svg>
              Indications & Usage
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">{medicine.indications}</p>

            <div className="mt-4 bg-blue-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-blue-800">Administration</h3>
              <p className="text-gray-700 leading-relaxed">{medicine.usage}</p>
            </div>
          </div>

          {/* Contraindications Section */}
          {medicine.contraindications && (
            <div className="bg-red-50 p-5 rounded-lg border border-red-100 mb-6" ref={contraindicationsRef}>
              <h2 className="text-xl font-semibold mb-3 text-red-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                Contraindications
              </h2>
              <p className="text-gray-700 leading-relaxed">{medicine.contraindications}</p>
            </div>
          )}

          {/* Warnings Section */}
          {medicine.warnings && medicine.warnings.length > 0 && (
            <div className="bg-amber-50 p-5 rounded-lg border border-amber-100 mb-6" ref={warningsRef}>
              <h2 className="text-xl font-semibold mb-3 text-amber-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                </svg>
                Warnings
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {medicine.warnings.map((warning, index) => (
                  <li key={index} className="leading-relaxed">{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Side Effects Section */}
          {medicine.sideEffects && medicine.sideEffects.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6" ref={sideEffectsRef}>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z"></path>
                  <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd"></path>
                </svg>
                Side Effects
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {medicine.sideEffects.map((effect, index) => (
                  <li key={index} className="leading-relaxed">{effect}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Precautions Section */}
          {medicine.precautions && medicine.precautions.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6" ref={precautionsRef}>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                </svg>
                Precautions
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {medicine.precautions.map((precaution, index) => (
                  <li key={index} className="leading-relaxed">{precaution}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Drug Interactions Section */}
          {medicine.interactions && medicine.interactions.length > 0 && (
            <div className="bg-white p-5 rounded-lg border border-gray-200" ref={interactionsRef}>
              <h2 className="text-xl font-semibold mb-3 text-gray-800 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z"></path>
                </svg>
                Drug Interactions
              </h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                {medicine.interactions.map((interaction, index) => (
                  <li key={index} className="leading-relaxed">{interaction}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-300 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd"></path>
            </svg>
            Back
          </button>

          <a
            href={`/medicines/${id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd"></path>
            </svg>
            Print
          </a>
        </div>
      </div>
    </div>
  );
};

export default MedicineDetails;