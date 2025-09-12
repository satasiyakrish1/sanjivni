import React, { useState, useRef, useEffect } from 'react';
import SEO from '../components/SEO';

// Mock API function that simulates API call without requiring external API
const analyzeImage = (imageFile) => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      // Mock results that match FirstDerm API response format
      const mockResults = {
        conditions: [
          {
            name: 'Eczema',
            description: 'A condition that causes the skin to become itchy, red, dry and cracked.',
            urgency: 'Medium',
            confidence: 0.85,
            treatment: 'Moisturizers, topical corticosteroids, and avoiding triggers.',
            visit_doctor: true
          },
          {
            name: 'Contact Dermatitis',
            description: 'A red, itchy rash caused by direct contact with a substance or an allergic reaction.',
            urgency: 'Low',
            confidence: 0.72,
            treatment: 'Avoid the irritant, apply cool compresses, use anti-itch creams.',
            visit_doctor: false
          },
          {
            name: 'Psoriasis',
            description: 'A condition that causes red, flaky, crusty patches of skin covered with silvery scales.',
            urgency: 'Medium',
            confidence: 0.68,
            treatment: 'Topical treatments, light therapy, and systemic medications.',
            visit_doctor: true
          },
          {
            name: 'Seborrheic Dermatitis',
            description: 'A common skin condition that mainly affects your scalp, causing scaly patches, red skin and stubborn dandruff.',
            urgency: 'Low',
            confidence: 0.65,
            treatment: 'Medicated shampoos, creams and lotions containing antifungal agents.',
            visit_doctor: false
          },
          {
            name: 'Rosacea',
            description: 'A long-term skin condition that mainly affects the face, causing redness, visible blood vessels, and sometimes small, red, pus-filled bumps.',
            urgency: 'Low',
            confidence: 0.60,
            treatment: 'Topical medications, oral antibiotics, and lifestyle changes.',
            visit_doctor: false
          }
        ]
      };
      
      resolve(mockResults);
    }, 2000); // 2 seconds delay to simulate API call
  });
};

const SkinAnalysis = () => {
  // State variables
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [inputMethod, setInputMethod] = useState('image'); // 'image' or 'text'
  
  // Text input form state
  const [textFormData, setTextFormData] = useState({
    symptoms: '',
    duration: 'acute', // acute, subacute, chronic
    location: '',
    severity: 'mild', // mild, moderate, severe
    additionalInfo: ''
  });
  
  // References for animations
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const uploadRef = useRef(null);
  const resultsRef = useRef(null);
  const fileInputRef = useRef(null);

  // Animation effects
  useEffect(() => {
    if (pageRef.current) {
      // Use simple CSS animations instead of GSAP
      const pageElement = pageRef.current;
      const headerElement = headerRef.current;
      const uploadElement = uploadRef.current;
      
      pageElement.style.opacity = 0;
      headerElement.style.opacity = 0;
      uploadElement.style.opacity = 0;
      
      pageElement.style.transition = 'opacity 0.8s ease';
      headerElement.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      uploadElement.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      
      headerElement.style.transform = 'translateY(-30px)';
      uploadElement.style.transform = 'translateY(50px)';
      
      // Staggered animation
      setTimeout(() => {
        pageElement.style.opacity = 1;
      }, 100);
      
      setTimeout(() => {
        headerElement.style.opacity = 1;
        headerElement.style.transform = 'translateY(0)';
      }, 300);
      
      setTimeout(() => {
        uploadElement.style.opacity = 1;
        uploadElement.style.transform = 'translateY(0)';
      }, 500);
    }
  }, []);

  // Animate results when they appear
  useEffect(() => {
    if (results && resultsRef.current) {
      const element = resultsRef.current;
      element.style.opacity = 0;
      element.style.transform = 'translateY(50px)';
      element.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
      
      setTimeout(() => {
        element.style.opacity = 1;
        element.style.transform = 'translateY(0)';
      }, 100);
    }
  }, [results]);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  // Handle file drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Process the selected file
  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setError(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setPreview(null);
      setError('Please select a valid image file (JPEG, PNG, etc.)');
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Trigger file input click
  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  // Submit the image for analysis
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an image to analyze');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Call our mock API function instead of FirstDerm API
      const analysisResults = await analyzeImage(file);
      
      // Set the results
      setResults(analysisResults);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset the form
  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
    setTextFormData({
      symptoms: '',
      duration: 'acute',
      location: '',
      severity: 'mild',
      additionalInfo: ''
    });
  };
  
  // Handle text form input changes
  const handleTextInputChange = (e) => {
    const { name, value } = e.target;
    setTextFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Submit text form for analysis
  const handleTextSubmit = async (e) => {
    e.preventDefault();
    
    if (!textFormData.symptoms) {
      setError('Please describe your symptoms');
      return;
    }
    
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      // Mock text analysis result
      const analysisResults = {
        conditions: [
          {
            name: 'Eczema',
            description: 'A condition that causes the skin to become itchy, red, dry and cracked.',
            urgency: 'Medium',
            confidence: 0.82,
            treatment: 'Moisturizers, topical corticosteroids, and avoiding triggers.',
            visit_doctor: true
          },
          {
            name: 'Contact Dermatitis',
            description: 'A red, itchy rash caused by direct contact with a substance or an allergic reaction.',
            urgency: 'Low',
            confidence: 0.75,
            treatment: 'Avoid the irritant, apply cool compresses, use anti-itch creams.',
            visit_doctor: false
          },
          {
            name: 'Psoriasis',
            description: 'A condition that causes red, flaky, crusty patches of skin covered with silvery scales.',
            urgency: 'Medium',
            confidence: 0.68,
            treatment: 'Topical treatments, light therapy, and systemic medications.',
            visit_doctor: true
          }
        ]
      };
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Set the results
      setResults(analysisResults);
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Failed to analyze the symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render urgency level badge
  const UrgencyBadge = ({ level }) => {
    let colorClass = '';
    
    switch (level.toLowerCase()) {
      case 'high':
        colorClass = 'bg-red-100 text-red-800';
        break;
      case 'medium':
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case 'low':
        colorClass = 'bg-green-100 text-green-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {level}
      </span>
    );
  };

  return (
    <div className="py-8" ref={pageRef}>
      <SEO 
        title="Skin Analysis | AI Dermatology Tool" 
        description="Upload a skin image for AI analysis. Get the top 5 possible skin conditions instantly with no sign-up required." 
      />

      <div className="max-w-4xl mx-auto">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-6 text-white rounded-t-lg" ref={headerRef}>
          <h1 className="text-3xl font-bold mb-2">AI Skin Analysis</h1>
          <p className="text-lg opacity-90">
            Get instant AI analysis of skin conditions through image upload or symptom description. No sign-up required.
          </p>
          <div className="mt-4 bg-white bg-opacity-20 p-3 rounded-md">
            <p className="text-sm">
              <span className="font-bold">100% Privacy Guaranteed:</span> Your information is analyzed instantly and never stored on our servers.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-b-lg shadow-lg overflow-hidden p-6">
          {/* Input Method Toggle */}
          <div className="mb-6 flex justify-center" ref={uploadRef}>
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                onClick={() => {
                  setInputMethod('image');
                  setResults(null);
                  setError(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${inputMethod === 'image' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Image Upload
              </button>
              <button
                type="button"
                onClick={() => {
                  setInputMethod('text');
                  setResults(null);
                  setError(null);
                }}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${inputMethod === 'text' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'}`}
              >
                <svg className="w-5 h-5 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Text Description
              </button>
            </div>
          </div>
          
          {/* Upload Section */}
          <div className="mb-8" style={{ display: inputMethod === 'image' ? 'block' : 'none' }}>
            <form onSubmit={handleSubmit}>
              <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {!preview && (
                  <div className="space-y-4">
                    <div className="w-24 h-24 mx-auto">
                      <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center">
                        <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-700">Drag and drop your skin image here</h3>
                      <p className="text-sm text-gray-500 mt-1">or click to browse files</p>
                    </div>
                    <button
                      type="button"
                      onClick={onButtonClick}
                      className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Select Image
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPEG, PNG, GIF, WebP (Max size: 10MB)
                    </p>
                  </div>
                )}

                {preview && (
                  <div className="space-y-4">
                    <div className="relative w-64 h-64 mx-auto border rounded-md overflow-hidden">
                      <img 
                        src={preview} 
                        alt="Skin condition preview" 
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={handleReset}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-center">
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:bg-pink-400"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Analyzing...
                          </span>
                        ) : 'Analyze Image'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </form>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>
          
          {/* Text Description Section */}
          <div className="mb-8" style={{ display: inputMethod === 'text' ? 'block' : 'none' }}>
            <form onSubmit={handleTextSubmit}>
              <div className="bg-purple-50 border border-purple-100 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Describe Your Skin Condition</h3>
                
                {/* Symptoms Description */}
                <div className="mb-4">
                  <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">
                    Symptoms Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="symptoms"
                    name="symptoms"
                    rows="4"
                    value={textFormData.symptoms}
                    onChange={handleTextInputChange}
                    placeholder="Describe what you see (e.g., redness, itching, flaking, bumps) and how it feels"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                
                {/* Two column layout for shorter fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Duration */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={textFormData.duration}
                      onChange={handleTextInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="acute">Recent (less than 2 weeks)</option>
                      <option value="subacute">Moderate (2-6 weeks)</option>
                      <option value="chronic">Long-term (more than 6 weeks)</option>
                    </select>
                  </div>
                  
                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                      Affected Area
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={textFormData.location}
                      onChange={handleTextInputChange}
                      placeholder="e.g., face, arms, legs, scalp"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Severity */}
                  <div>
                    <label htmlFor="severity" className="block text-sm font-medium text-gray-700 mb-1">
                      Severity
                    </label>
                    <select
                      id="severity"
                      name="severity"
                      value={textFormData.severity}
                      onChange={handleTextInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                  
                  {/* Additional Information */}
                  <div>
                    <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Information
                    </label>
                    <input
                      type="text"
                      id="additionalInfo"
                      name="additionalInfo"
                      value={textFormData.additionalInfo}
                      onChange={handleTextInputChange}
                      placeholder="Any other relevant details"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                
                <div className="flex justify-center mt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors disabled:bg-pink-400"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                      </span>
                    ) : 'Analyze Symptoms'}
                  </button>
                </div>
              </div>
            </form>
            
            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
                <p className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {error}
                </p>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-8">
              <div className="w-24 h-24 mx-auto mb-4">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
              </div>
              <p className="text-gray-600">Analyzing your {inputMethod === 'image' ? 'skin image' : 'symptoms'}...</p>
              <p className="text-sm text-gray-500 mt-2">This usually takes less than 10 seconds</p>
            </div>
          )}

          {/* Results Section */}
          {!loading && results && (
            <div className="mt-8" ref={resultsRef}>
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Analysis Results
              </h2>
              
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Disclaimer:</span> This analysis is provided for informational purposes only and should not be considered a medical diagnosis. 
                  Please consult with a healthcare professional for proper evaluation and treatment.
                </p>
              </div>
              
              <div className="space-y-4">
                {results.conditions.map((condition, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-gray-800">{condition.name}</h3>
                      <UrgencyBadge level={condition.urgency} />
                    </div>
                    <p className="text-gray-600 mt-2">{condition.description}</p>
                    
                    {/* Confidence score */}
                    <div className="mt-3 flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Confidence:</span>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-purple-600 h-2.5 rounded-full" 
                          style={{ width: `${(condition.confidence * 100).toFixed(0)}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">
                        {(condition.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    {/* Treatment recommendations */}
                    {condition.treatment && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700">Recommended Treatment:</h4>
                        <p className="text-sm text-gray-600">{condition.treatment}</p>
                      </div>
                    )}
                    
                    {/* Doctor visit recommendation */}
                    {condition.visit_doctor !== undefined && (
                      <div className="mt-2 flex items-center">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${condition.visit_doctor ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {condition.visit_doctor ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                              </svg>
                              Consult a doctor
                            </>
                          ) : (
                            <>Self-care may be sufficient</>  
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex justify-between items-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  {inputMethod === 'image' ? 'Analyze Another Image' : 'Submit Another Description'}
                </button>
                
                <a 
                  href="/cosmetics"
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                >
                  Explore Cosmetic Products
                </a>
              </div>
            </div>
          )}
          
          {/* Privacy Notice */}
          <div className="mt-12 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Privacy Information</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Your information is analyzed in real-time and never stored on our servers</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>No account or sign-up required to use this service</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>We use industry-standard encryption for all data transmission</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>Analysis results are only displayed to you and not saved after you leave this page</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkinAnalysis;