import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';

const BMICalculator = () => {
  // Units state
  const [units, setUnits] = useState('metric'); // 'metric' or 'imperial'
  
  // Form state
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  
  // Results state
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState('');
  const [healthRisks, setHealthRisks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('bmiHistory');
    if (savedHistory) {
      setHistoryData(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (historyData.length > 0) {
      localStorage.setItem('bmiHistory', JSON.stringify(historyData));
    }
  }, [historyData]);

  const calculateBMI = () => {
    if (height && weight) {
      let bmiValue;
      
      if (units === 'metric') {
        // Convert height from cm to meters
        const heightInMeters = height / 100;
        // Calculate BMI: weight (kg) / height² (m²)
        bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
      } else {
        // Imperial formula: (weight in pounds * 703) / (height in inches)²
        bmiValue = ((weight * 703) / (height * height)).toFixed(1);
      }
      
      setBmi(bmiValue);
      
      // Determine health status based on BMI
      let currentStatus = '';
      if (bmiValue < 18.5) {
        currentStatus = 'Underweight';
        setHealthRisks(['Nutritional deficiencies', 'Weakened immune system', 'Osteoporosis risk']);
        setRecommendations(['Increase caloric intake', 'Consume protein-rich foods', 'Consider nutritional consultation']);
      } else if (bmiValue >= 18.5 && bmiValue < 25) {
        currentStatus = 'Normal';
        setHealthRisks(['Low health risks at this BMI range']);
        setRecommendations(['Maintain balanced diet', 'Regular exercise', 'Routine health check-ups']);
      } else if (bmiValue >= 25 && bmiValue < 30) {
        currentStatus = 'Overweight';
        setHealthRisks(['Higher risk of heart disease', 'Type 2 diabetes risk', 'High blood pressure']);
        setRecommendations(['Moderate calorie reduction', 'Increase physical activity', 'Regular monitoring of health markers']);
      } else {
        currentStatus = 'Obese';
        setHealthRisks(['Significantly higher cardiovascular risks', 'Sleep apnea', 'Joint problems', 'Metabolic syndrome']);
        setRecommendations(['Medical consultation recommended', 'Structured weight management plan', 'Regular exercise routine']);
      }
      
      setStatus(currentStatus);
      
      // Save to history
      const newEntry = {
        date: new Date().toLocaleDateString(),
        bmi: bmiValue,
        status: currentStatus,
        weight: weight,
        height: height,
        units: units
      };
      
      setHistoryData(prev => [newEntry, ...prev.slice(0, 9)]); // Keep only last 10 entries
    }
  };

  const resetForm = () => {
    setHeight('');
    setWeight('');
    setAge('');
    setGender('');
    setBmi(null);
    setStatus('');
    setHealthRisks([]);
    setRecommendations([]);
  };

  const clearHistory = () => {
    setHistoryData([]);
    localStorage.removeItem('bmiHistory');
  };

  const getStatusColor = (statusValue) => {
    switch(statusValue) {
      case 'Underweight': return 'text-yellow-600';
      case 'Normal': return 'text-green-600';
      case 'Overweight': return 'text-orange-600';
      case 'Obese': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <SEO 
        title="BMI Calculator - Check Your Body Mass Index | Sanjivni"
        description="Calculate your Body Mass Index (BMI) with our advanced calculator. Track your BMI history, get personalized recommendations, and understand what BMI means for your health."
        keywords="BMI calculator, body mass index, weight calculator, health calculator, BMI measurement, weight status, health recommendations"
        canonicalUrl="/bmi-calculator"
        ogType="website"
        ogImage="/images/bmi-calculator-preview.jpg"
      />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          BMI Calculator
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Calculate and track your Body Mass Index to monitor your health
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              {/* Unit Toggle */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      units === 'metric' 
                        ? 'bg-white text-gray-800 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setUnits('metric')}
                  >
                    Metric (cm/kg)
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                      units === 'imperial' 
                        ? 'bg-white text-gray-800 shadow-sm' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                    onClick={() => setUnits('imperial')}
                  >
                    Imperial (in/lb)
                  </button>
                </div>
              </div>
              
              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col">
                  <label htmlFor="height" className="mb-2 text-gray-700 font-medium">
                    Height {units === 'metric' ? '(cm)' : '(inches)'}
                  </label>
                  <input 
                    type="number" 
                    id="height"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder={`Enter height in ${units === 'metric' ? 'cm' : 'inches'}`}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="weight" className="mb-2 text-gray-700 font-medium">
                    Weight {units === 'metric' ? '(kg)' : '(lb)'}
                  </label>
                  <input 
                    type="number" 
                    id="weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder={`Enter weight in ${units === 'metric' ? 'kg' : 'lb'}`}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              {/* Optional Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="flex flex-col">
                  <label htmlFor="age" className="mb-2 text-gray-700 font-medium">
                    Age (optional)
                  </label>
                  <input 
                    type="number" 
                    id="age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="Enter your age"
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="gender" className="mb-2 text-gray-700 font-medium">
                    Gender (optional)
                  </label>
                  <select
                    id="gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={calculateBMI}
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 font-medium"
                >
                  Calculate BMI
                </button>
                <button 
                  onClick={resetForm}
                  className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
                >
                  Reset
                </button>
              </div>
            </div>
            
            {/* Results Panel */}
            {bmi && (
              <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="text-xl font-semibold">Your BMI Results</h3>
                </div>
                
                <div className="p-6">
                  <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4">
                      <svg className="w-32 h-32">
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="60" 
                          fill="none" 
                          stroke="#e5e7eb" 
                          strokeWidth="8"
                        />
                        <circle 
                          cx="64" 
                          cy="64" 
                          r="60" 
                          fill="none" 
                          stroke={
                            status === 'Normal' ? '#10b981' : 
                            status === 'Underweight' ? '#f59e0b' : 
                            status === 'Overweight' ? '#f97316' : '#ef4444'
                          }
                          strokeWidth="8"
                          strokeDasharray="377"
                          strokeDashoffset={
                            status === 'Normal' ? "188" : 
                            status === 'Underweight' ? "300" : 
                            status === 'Overweight' ? "94" : "0"
                          }
                          transform="rotate(-90 64 64)"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-3xl font-bold">{bmi}</span>
                        <span className="text-sm text-gray-500">BMI</span>
                      </div>
                    </div>
                    <div className={`text-lg font-medium mb-2 ${getStatusColor(status)}`}>
                      {status}
                    </div>
                    <p className="text-gray-600 text-center max-w-md">
                      Your BMI of <strong>{bmi}</strong> indicates you are in the <strong className={getStatusColor(status)}>{status.toLowerCase()}</strong> range.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Health Considerations</h4>
                      <ul className="space-y-2">
                        {healthRisks.map((risk, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            <span className="text-gray-600">{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-3">Recommendations</h4>
                      <ul className="space-y-2">
                        {recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            <span className="text-gray-600">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Side Panel - History & Information */}
          <div className="lg:col-span-1">
            {/* History Panel */}
            <div className="bg-white rounded-xl shadow-md mb-6">
              <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">BMI History</h3>
                {historyData.length > 0 && (
                  <button 
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="p-4">
                {historyData.length > 0 ? (
                  <div className="space-y-3">
                    {historyData.map((entry, index) => (
                      <div key={index} className="flex items-center justify-between p-2 border-b last:border-0">
                        <div>
                          <div className="text-sm text-gray-500">{entry.date}</div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{entry.bmi}</span>
                            <span className={`text-sm ${getStatusColor(entry.status)}`}>
                              {entry.status}
                            </span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          {entry.height} {entry.units === 'metric' ? 'cm' : 'in'} / {entry.weight} {entry.units === 'metric' ? 'kg' : 'lb'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No history yet. Calculate your BMI to start tracking.
                  </p>
                )}
              </div>
            </div>
            
            {/* Information Panel */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-lg font-semibold">About BMI</h3>
              </div>
              <div className="p-4 text-gray-600 text-sm space-y-3">
                <p>Body Mass Index (BMI) is a numerical value derived from your weight and height.</p>
                <p>It provides a simple way to classify weight categories that may lead to health problems.</p>
                <p>While BMI is useful for most adults 20+ years old, it has limitations:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Doesn't distinguish between fat and muscle mass</li>
                  <li>May not be accurate for athletes or elderly</li>
                  <li>Doesn't account for body fat distribution</li>
                </ul>
                
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-gray-700">BMI Categories:</h4>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                      <span className="font-medium mr-2">Below 18.5:</span>
                      <span>Underweight</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="font-medium mr-2">18.5 - 24.9:</span>
                      <span>Normal weight</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
                      <span className="font-medium mr-2">25.0 - 29.9:</span>
                      <span>Overweight</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="font-medium mr-2">30.0 and above:</span>
                      <span>Obesity</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMICalculator;