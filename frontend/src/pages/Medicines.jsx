import React, { useState, useRef, useEffect } from 'react';
import MedicineSearch from '../components/MedicineSearch';
import SEO from '../components/SEO';

const Medicines = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [detectedMedicine, setDetectedMedicine] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(10); // Will be updated from backend
  const [isLoading, setIsLoading] = useState(false);

  const searchInputRef = useRef(null);
  const manualCodeRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const scannerIntervalRef = useRef(null);

  const categories = [
    'Antibiotics', 'Analgesics', 'Antivirals', 'Cardiovascular',
    'Respiratory', 'Gastrointestinal', 'Neurological', 'Dermatological'
  ];

  // Handle key presses for search input
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && document.activeElement === searchInputRef.current) {
        // Perform search when Enter is pressed in main search bar
        console.log("Searching for:", searchQuery);
        fetchMedicines(1); // Reset to first page when searching
      }

      if (e.key === 'Enter' && document.activeElement === manualCodeRef.current) {
        handleManualSearch();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [searchQuery, manualCode]);

  // Fetch medicines from backend when page or search changes
  useEffect(() => {
    fetchMedicines(currentPage);
  }, [currentPage]);

  // Clean up camera resources when component unmounts or modal closes
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // When QR modal closes, make sure camera is stopped
  useEffect(() => {
    if (!isQrModalOpen) {
      stopCamera();
    }
  }, [isQrModalOpen]);

  const fetchMedicines = async (page) => {
    setIsLoading(true);
    try {
      // Implement actual API call
      const params = new URLSearchParams({
        page,
        query: searchQuery,
        categories: selectedCategories.join(',')
      });

      // Replace with your actual API endpoint
      const response = await fetch(`/api/medicine?${params}`);
      const data = await response.json();

      // Update MedicineSearch component with results
      // This assumes your MedicineSearch component accepts props with search results
      // You may need to adjust this based on your actual implementation
      console.log("Fetched medicines for page", page, data);

      // Update pagination data from backend response
      setTotalPages(data.totalPages || 10);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching medicines:", error);
      setIsLoading(false);
    }
  };

  const toggleCategory = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleScanQR = () => {
    setIsQrModalOpen(true);
    setDetectedMedicine(null);
  };

  const activateCamera = async () => {
    try {
      setIsCameraActive(true);

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        // Start QR code scanning loop
        startQRScanner();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access the camera. Please ensure camera permissions are granted.");
      setIsCameraActive(false);
    }
  };

  const startQRScanner = () => {
    // Import QR scanner library dynamically
    // This assumes you'll add jsQR as a dependency to your project
    import('jsqr').then(({ default: jsQR }) => {
      // Clear any existing interval
      if (scannerIntervalRef.current) {
        clearInterval(scannerIntervalRef.current);
      }

      // Set up scanning interval
      scannerIntervalRef.current = setInterval(() => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext('2d');

          // Make sure video is playing
          if (video.readyState === video.HAVE_ENOUGH_DATA) {
            // Set canvas dimensions to match video
            canvas.height = video.videoHeight;
            canvas.width = video.videoWidth;

            // Draw current video frame to canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Get image data for QR code scanning
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

            // Scan for QR code in the image
            const code = jsQR(imageData.data, imageData.width, imageData.height, {
              inversionAttempts: "dontInvert",
            });

            // If QR code found
            if (code) {
              console.log("QR code detected:", code.data);

              // Stop scanner once we find a code
              clearInterval(scannerIntervalRef.current);

              // Process the QR code data
              // This would normally make an API call to look up the medicine
              fetchMedicineByCode(code.data);
            }
          }
        }
      }, 100); // Scan every 100ms
    }).catch(err => {
      console.error("Failed to load QR scanner library:", err);
      alert("Could not load QR scanner. Please try entering the code manually.");
    });
  };

  const fetchMedicineByCode = async (code) => {
    // Simulate API call to fetch medicine data
    // In production, replace with actual API call
    try {
      // Simulate network delay
      setIsLoading(true);

      // Replace with actual API endpoint
      // const response = await fetch(`/api/medicine/code/${code}`);
      // const data = await response.json();

      // For demo, simulate a response after delay
      setTimeout(() => {
        setDetectedMedicine({
          name: `Medicine for code: ${code}`,
          code: code,
          manufacturer: "Pharmaceutical Company"
        });
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching medicine by code:", error);
      setIsLoading(false);
      alert("Failed to retrieve medicine information. Please try again.");
    }
  };

  const stopCamera = () => {
    // Clear scanner interval
    if (scannerIntervalRef.current) {
      clearInterval(scannerIntervalRef.current);
    }

    // Stop video stream
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
  };

  const handleManualSearch = () => {
    if (!manualCode.trim()) return;
    fetchMedicineByCode(manualCode);
  };

  const useDetectedMedicine = () => {
    if (detectedMedicine) {
      setSearchQuery(detectedMedicine.name);
      setIsQrModalOpen(false);
      fetchMedicines(1); // Reset to first page with new search
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    // Scroll to top of results
    window.scrollTo({ top: document.querySelector('.search-results').offsetTop - 120, behavior: 'smooth' });
  };

  // SVG Icons
  const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"></circle>
      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
  );

  const QrCodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="5" height="5" rx="1"></rect>
      <rect x="16" y="3" width="5" height="5" rx="1"></rect>
      <rect x="3" y="16" width="5" height="5" rx="1"></rect>
      <path d="M21 16h-3a2 2 0 0 0-2 2v3"></path>
      <path d="M21 21v.01"></path>
      <path d="M12 7v3a2 2 0 0 1-2 2H7"></path>
      <path d="M3 12h.01"></path>
      <path d="M12 3h.01"></path>
      <path d="M12 16v.01"></path>
      <path d="M16 12h1"></path>
      <path d="M21 12v.01"></path>
      <path d="M12 21v-1"></path>
    </svg>
  );

  const FilterIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
  );

  const PillsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"></path>
      <path d="m8.5 8.5 7 7"></path>
    </svg>
  );

  const DeviceIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12" y2="18"></line>
    </svg>
  );

  const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const CameraIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
      <circle cx="12" cy="13" r="3"></circle>
    </svg>
  );

  const CheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );

  const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
  );

  const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"></polyline>
    </svg>
  );

  // Skeleton component for loading state
  const Skeleton = ({ className }) => (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );

  // Medicine card skeleton
  const MedicineCardSkeleton = () => (
    <div className="border rounded-lg p-4 mb-4">
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2 mb-3" />
      <div className="flex space-x-2 mb-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-4 w-16 rounded-full" />
      </div>
      <Skeleton className="h-16 w-full mb-3" />
      <div className="flex justify-between">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <SEO
        title="Medicines - Browse and Search Medications | Sanjivni"
        description="Search and browse through our extensive database of medications. Find information about dosage, side effects, and availability."
        keywords="medicines, medications, pharmacy, drugs, prescriptions, healthcare, medicine search"
        canonicalUrl="/medicines"
      />

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex items-center mb-2">
          <span className="text-blue-600 mr-3"><PillsIcon /></span>
          <h1 className="text-3xl font-bold">Medicine Search</h1>
        </div>
        <p className="text-gray-600">Search for medicines by name, category, or description to find detailed information.</p>
      </div>

      {/* Search Bar with QR Button */}
      <div className="relative mb-6">
        <div className="flex shadow-md rounded-lg overflow-hidden">
          <div className="flex-grow flex items-center bg-white px-4 py-3">
            <span className="text-gray-400 mr-2"><SearchIcon /></span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for medicines..."
              className="w-full focus:outline-none text-gray-700"
              ref={searchInputRef}
            />
          </div>
          <button
            onClick={handleScanQR}
            className="bg-blue-600 text-white px-4 flex items-center justify-center hover:bg-blue-700 transition-colors"
            aria-label="Scan QR Code"
          >
            <span className="mr-2"><QrCodeIcon /></span>
            <span className="hidden sm:inline">Scan QR</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="mb-8">
        <div
          className="flex items-center justify-between bg-gray-100 p-3 rounded-lg cursor-pointer"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <div className="flex items-center">
            <span className="text-gray-500 mr-2"><FilterIcon /></span>
            <span className="font-medium">Filter Medicines</span>
          </div>
          <div className="text-blue-600">
            {selectedCategories.length > 0 && (
              <span className="mr-2 text-sm bg-blue-100 px-2 py-1 rounded-full">
                {selectedCategories.length} selected
              </span>
            )}
            <span>{isFilterOpen ? '▲' : '▼'}</span>
          </div>
        </div>

        {isFilterOpen && (
          <div className="mt-3 p-4 bg-white rounded-lg shadow-md">
            <h3 className="font-medium mb-3">Categories</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {categories.map(category => (
                <div
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`p-2 text-sm rounded-lg cursor-pointer text-center transition-colors ${selectedCategories.includes(category)
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                >
                  {category}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setCurrentPage(1);
                  fetchMedicines(1);
                }}
                className="text-sm text-gray-600 hover:text-gray-800 mr-3"
              >
                Clear All
              </button>
              <button
                onClick={() => {
                  setIsFilterOpen(false);
                  setCurrentPage(1);
                  fetchMedicines(1);
                }}
                className="bg-blue-600 text-white px-4 py-1 rounded text-sm hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      <div className="bg-white rounded-lg shadow-md p-6 search-results">
        {isLoading ? (
          // Skeleton loading UI
          <div>
            <div className="flex justify-between mb-6">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-32" />
            </div>
            {[1, 2, 3].map((i) => (
              <MedicineCardSkeleton key={i} />
            ))}
            <div className="mt-8 flex justify-center space-x-2">
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
              <Skeleton className="h-8 w-8 rounded" />
            </div>
          </div>
        ) : (
          <MedicineSearch
            query={searchQuery}
            categories={selectedCategories}
            page={currentPage}
            isLoading={isLoading}
          />
        )}
      </div>

      

      {/* Popular Searches */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Popular Searches</h2>
        <div className="flex flex-wrap gap-2">
          {['Paracetamol', 'Ibuprofen', 'Amoxicillin', 'Omeprazole', 'Vitamin D', 'Atorvastatin'].map(term => (
            <button
              key={term}
              onClick={() => {
                setSearchQuery(term);
                setCurrentPage(1);
                fetchMedicines(1);
              }}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* QR Scan Modal - Optimized for Desktop & Mobile with real-time scanning */}
      {isQrModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-bold">Scan Medicine QR Code</h3>
              <button
                onClick={() => {
                  setIsQrModalOpen(false);
                  stopCamera();
                  setDetectedMedicine(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <CloseIcon />
              </button>
            </div>

            <div className="flex flex-col md:flex-row">
              {/* Left side - Camera/Scanner */}
              <div className="w-full md:w-1/2 p-6 border-r">
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Scan Medicine QR or Barcode</h4>
                  <p className="text-sm text-gray-600 mb-4">Position the QR code or barcode from your medicine in the camera view</p>
                </div>

                <div className="bg-gray-100 rounded-lg overflow-hidden mb-4 relative" style={{ minHeight: "280px" }}>
                  {isCameraActive ? (
                    <>
                      {/* Real camera view */}
                      <video
                        ref={videoRef}
                        className="absolute inset-0 h-full w-full object-cover"
                        playsInline
                      ></video>

                      {/* Canvas for processing QR code */}
                      <canvas
                        ref={canvasRef}
                        className="absolute inset-0 h-full w-full object-cover opacity-0" // Hidden but used for processing
                      ></canvas>

                      {/* Scanning overlay */}
                      <div className="absolute inset-0 pointer-events-none">
                        {isLoading ? (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="text-white text-center p-2 bg-black bg-opacity-50 rounded">
                              Processing...
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <div className="border-2 border-blue-500 w-64 h-64 relative">
                              <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500 animate-scan"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    <div className="h-64 flex items-center justify-center">
                      {isLoading ? (
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin mb-3"></div>
                          <p className="text-gray-600">Loading camera...</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-500">
                          <CameraIcon />
                          <p>Camera access required</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!isCameraActive && !detectedMedicine && !isLoading && (
                  <button
                    onClick={activateCamera}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors flex items-center justify-center"
                  >
                    <CameraIcon />
                    <span className="ml-2">Access Camera</span>
                  </button>
                )}

                {isLoading && !isCameraActive && !detectedMedicine && (
                  <div className="w-full py-2 flex justify-center">
                    <div className="animate-pulse flex space-x-4 items-center">
                      <div className="w-5 h-5 bg-blue-400 rounded-full animate-bounce"></div>
                      <div className="w-5 h-5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      <div className="w-5 h-5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                    </div>
                  </div>
                )}

                {isCameraActive && !detectedMedicine && !isLoading && (
                  <button
                    onClick={stopCamera}
                    className="w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-center mt-2"
                  >
                    <span className="ml-2">Stop Camera</span>
                  </button>
                )}

                {detectedMedicine && (
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-800 mb-1">Medicine Detected</h5>
                    <p className="text-green-700 font-bold text-lg mb-2">{detectedMedicine.name}</p>
                    <div className="flex flex-wrap text-sm text-green-600 mb-3">
                      <span className="mr-3">Code: {detectedMedicine.code}</span>
                      <span>Mfr: {detectedMedicine.manufacturer}</span>
                    </div>
                    <button
                      onClick={useDetectedMedicine}
                      className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Search This Medicine
                    </button>
                  </div>
                )}
              </div>

              {/* Right side - Alternative Methods */}
              <div className="w-full md:w-1/2 p-6">
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Enter Medicine Code Manually</h4>
                  <div className="flex">
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => setManualCode(e.target.value)}
                      placeholder="Enter medicine code or name"
                      className="border border-gray-300 rounded-l px-3 py-2 flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
                      ref={manualCodeRef}
                    />
                    <button
                      onClick={handleManualSearch}
                      className={`px-4 py-2 rounded-r flex items-center justify-center transition-colors ${isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                        } text-white`}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Search'
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">You can enter the code printed on the medicine package</p>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-4">
                  <h4 className="font-medium mb-2">Alternative Methods</h4>

                  <div className="bg-gray-50 p-3 rounded-lg mb-4">
                    <h5 className="font-medium text-sm mb-2">Copy from Physical Medicine</h5>
                    <p className="text-sm text-gray-600 mb-2">Look for these locations on your medicine packaging:</p>
                    <ul className="text-xs text-gray-600 list-disc pl-5">
                      <li>Front label - Medicine name and strength</li>
                      <li>Side panel - NDC code or product identifier</li>
                      <li>Bottom or back - Manufacturer details</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center mb-2">
                      <span className="text-blue-600 mr-2"><DeviceIcon /></span>
                      <h5 className="font-medium text-sm">Use Our Mobile App</h5>
                    </div>

                    <div className="flex items-start">
                      

                      <div>
                        <p className="text-xs text-gray-600 mb-2">Click Below for medicines directly from your phone with our app</p>
                        <div className="flex space-x-2">
                          <a href="#" className="bg-gray-800 text-white text-xs px-3 py-1 rounded">iOS</a>
                          <a
                            href="https://play.google.com/store/apps/dev?id=8452114975424851755"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-green-600 text-white text-xs px-3 py-1 rounded"
                          >
                            Android
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500">Need help? <a href="#" className="text-blue-600 hover:underline">View tutorial</a> or <a href="#" className="text-blue-600 hover:underline">contact support</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes scan {
          0% { transform: translateY(0); }
          50% { transform: translateY(256px); }
          100% { transform: translateY(0); }
        }
        .animate-scan {
          animation: scan 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default Medicines;