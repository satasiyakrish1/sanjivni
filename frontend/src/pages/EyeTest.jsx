import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';

const EyeTest = () => {
  // State for test navigation
  const [currentTest, setCurrentTest] = useState('intro');
  const [darkMode, setDarkMode] = useState(false);
  const [results, setResults] = useState({
    visionSharpness: null,
    colorBlindness: null,
    astigmatism: null,
    contrastSensitivity: null
  });

  // Vision Sharpness Test State
  const [selectedRow, setSelectedRow] = useState(null);
  
  // Color Blindness Test State
  const [colorAnswers, setColorAnswers] = useState({
    plate1: '',
    plate2: '',
    plate3: ''
  });
  
  // Astigmatism Test State
  const [astigmatismResult, setAstigmatismResult] = useState(null);
  
  // Contrast Sensitivity Test State
  const [contrastAnswers, setContrastAnswers] = useState({
    box1: '',
    box2: '',
    box3: ''
  });

  // Apply dark mode
  useEffect(() => {
    document.body.classList.toggle('dark-mode', darkMode);
    return () => document.body.classList.remove('dark-mode');
  }, [darkMode]);

  // Vision Sharpness Test Data
  const snellenRows = [
    { id: 1, size: 'text-6xl', letters: 'E', rating: '20/200' },
    { id: 2, size: 'text-5xl', letters: 'FP', rating: '20/100' },
    { id: 3, size: 'text-4xl', letters: 'TOZ', rating: '20/70' },
    { id: 4, size: 'text-3xl', letters: 'LPED', rating: '20/50' },
    { id: 5, size: 'text-2xl', letters: 'PECFD', rating: '20/40' },
    { id: 6, size: 'text-xl', letters: 'EDFCZP', rating: '20/30' },
    { id: 7, size: 'text-lg', letters: 'FELOPZD', rating: '20/25' },
    { id: 8, size: 'text-base', letters: 'DEFPOTEC', rating: '20/20' },
    { id: 9, size: 'text-sm', letters: 'LEFODPCT', rating: '20/15' },
  ];

  // Color Blindness Test Data
  const ishiharaPlates = [
    { id: 'plate1', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Ishihara_9.png', correctAnswer: '74', description: 'Normal vision sees 74, red-green color blindness may see 21' },
    { id: 'plate2', image: 'https://cdn-beaai.nitrocdn.com/DsHNrqyidSdrnEUwxpnDFmLjguAlTfrt/assets/images/optimized/rev-c1bc9c5/colormax.org/wp-content/uploads/2015/08/colorblind-test-image3.jpg', correctAnswer: '26', description: 'Normal vision sees 29, red-green color blindness may see 70' },
    { id: 'plate3', image: 'https://cdn-beaai.nitrocdn.com/DsHNrqyidSdrnEUwxpnDFmLjguAlTfrt/assets/images/optimized/rev-c1bc9c5/colormax.org/wp-content/uploads/2015/08/colorblind-test-image10.jpg', correctAnswer: '12', description: 'Normal vision sees 12, red-green color blindness may have difficulty' }
  ];

  // Contrast Sensitivity Test Data
  const contrastBoxes = [
    { id: 'box1', contrast: 'bg-gray-100 text-gray-300', number: '5', difficulty: 'High Contrast' },
    { id: 'box2', contrast: 'bg-gray-100 text-gray-200', number: '3', difficulty: 'Medium Contrast' },
    { id: 'box3', contrast: 'bg-gray-100 text-gray-200', number: '8', difficulty: 'Low Contrast' }
  ];

  // Handle vision sharpness selection
  const handleRowSelect = (rowId) => {
    setSelectedRow(rowId);
    setResults(prev => ({ ...prev, visionSharpness: snellenRows.find(row => row.id === rowId).rating }));
  };

  // Handle color blindness answers
  const handleColorAnswer = (plateId, answer) => {
    setColorAnswers(prev => ({ ...prev, [plateId]: answer }));
  };

  // Handle astigmatism result
  const handleAstigmatismResult = (result) => {
    setAstigmatismResult(result);
    setResults(prev => ({ ...prev, astigmatism: result }));
  };

  // Handle contrast sensitivity answers
  const handleContrastAnswer = (boxId, answer) => {
    setContrastAnswers(prev => ({ ...prev, [boxId]: answer }));
  };

  // Evaluate color blindness results
  const evaluateColorBlindness = () => {
    const correctAnswers = ishiharaPlates.filter(plate => 
      colorAnswers[plate.id] === plate.correctAnswer
    ).length;
    
    let result;
    if (correctAnswers === 3) {
      result = 'Normal color vision';
    } else if (correctAnswers === 2) {
      result = 'Mild color vision deficiency';
    } else if (correctAnswers === 1) {
      result = 'Moderate color vision deficiency';
    } else {
      result = 'Significant color vision deficiency';
    }
    
    setResults(prev => ({ ...prev, colorBlindness: result }));
    return result;
  };

  // Evaluate contrast sensitivity results
  const evaluateContrastSensitivity = () => {
    const correctAnswers = contrastBoxes.filter(box => 
      contrastAnswers[box.id] === box.number
    ).length;
    
    let result;
    if (correctAnswers === 3) {
      result = 'Excellent contrast sensitivity';
    } else if (correctAnswers === 2) {
      result = 'Good contrast sensitivity';
    } else if (correctAnswers === 1) {
      result = 'Fair contrast sensitivity';
    } else {
      result = 'Poor contrast sensitivity';
    }
    
    setResults(prev => ({ ...prev, contrastSensitivity: result }));
    return result;
  };

  // Navigate to next test
  const nextTest = () => {
    switch(currentTest) {
      case 'intro':
        setCurrentTest('visionSharpness');
        break;
      case 'visionSharpness':
        setCurrentTest('colorBlindness');
        break;
      case 'colorBlindness':
        evaluateColorBlindness();
        setCurrentTest('astigmatism');
        break;
      case 'astigmatism':
        setCurrentTest('contrastSensitivity');
        break;
      case 'contrastSensitivity':
        evaluateContrastSensitivity();
        setCurrentTest('results');
        break;
      default:
        setCurrentTest('intro');
    }
  };

  // Navigate to previous test
  const prevTest = () => {
    switch(currentTest) {
      case 'colorBlindness':
        setCurrentTest('visionSharpness');
        break;
      case 'astigmatism':
        setCurrentTest('colorBlindness');
        break;
      case 'contrastSensitivity':
        setCurrentTest('astigmatism');
        break;
      case 'results':
        setCurrentTest('contrastSensitivity');
        break;
      default:
        setCurrentTest('intro');
    }
  };

  // Reset all tests
  const resetTests = () => {
    setCurrentTest('intro');
    setSelectedRow(null);
    setColorAnswers({ plate1: '', plate2: '', plate3: '' });
    setAstigmatismResult(null);
    setContrastAnswers({ box1: '', box2: '', box3: '' });
    setResults({
      visionSharpness: null,
      colorBlindness: null,
      astigmatism: null,
      contrastSensitivity: null
    });
  };

  return (
    <div className={`min-h-screen pb-16 transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      <SEO 
        title="Eye Test - Check Your Vision Online | Sanjivni"
        description="Test your vision with our online eye tests. Check visual acuity, color blindness, astigmatism, and contrast sensitivity from the comfort of your home."
        keywords="eye test, vision test, online eye exam, color blindness test, astigmatism test, contrast sensitivity, visual acuity"
        canonicalUrl="/eye-test"
        ogType="website"
        ogImage="/images/eye-test-preview.jpg"
      />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-center">
            Online Eye Test
          </h1>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`px-4 py-2 rounded-lg ${darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'}`}
          >
            {darkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
        </div>
        
        <div className={`bg-${darkMode ? 'gray-800' : 'white'} rounded-xl shadow-md p-6 mb-8 transition-colors duration-300`}>
          {/* Test Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm">Progress</span>
              <span className="text-sm">
                {currentTest === 'intro' ? '0' : 
                 currentTest === 'visionSharpness' ? '1' :
                 currentTest === 'colorBlindness' ? '2' :
                 currentTest === 'astigmatism' ? '3' :
                 currentTest === 'contrastSensitivity' ? '4' : '5'}/5
              </span>
            </div>
            <div className="w-full bg-gray-300 rounded-full h-2.5">
              <div 
                className="bg-primary h-2.5 rounded-full transition-all duration-500" 
                style={{ width: 
                  currentTest === 'intro' ? '0%' : 
                  currentTest === 'visionSharpness' ? '20%' :
                  currentTest === 'colorBlindness' ? '40%' :
                  currentTest === 'astigmatism' ? '60%' :
                  currentTest === 'contrastSensitivity' ? '80%' : '100%' 
                }}
              ></div>
            </div>
          </div>

          {/* Introduction */}
          {currentTest === 'intro' && (
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome to the Online Eye Test</h2>
              <p className="mb-6">This test includes four different assessments to check various aspects of your vision:</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-2">Vision Sharpness Test</h3>
                  <p>Similar to a Snellen chart at the eye doctor, this test checks how clearly you can see at different distances.</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-2">Color Blindness Test</h3>
                  <p>Using Ishihara plates, this test checks your ability to distinguish between different colors.</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-2">Astigmatism Check</h3>
                  <p>This test helps identify if you might have astigmatism, a common vision condition.</p>
                </div>
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <h3 className="font-semibold mb-2">Contrast Sensitivity</h3>
                  <p>Tests your ability to distinguish objects from their background under varying contrast conditions.</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Before You Begin:</h3>
                <ul className="text-left list-disc pl-6 space-y-2">
                  <li>If you wear glasses or contacts, keep them on for the test</li>
                  <li>Sit approximately 2 feet (arm's length) from your screen</li>
                  <li>Make sure your screen brightness is adjusted comfortably</li>
                  <li>Take the test in a well-lit room</li>
                </ul>
              </div>
              
              <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg mb-6">
                <p><strong>Important:</strong> This online test is not a replacement for a professional eye examination. If you experience vision problems, please consult an eye care professional.</p>
              </div>
              
              <button 
                onClick={nextTest}
                className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-all duration-300 font-medium"
              >
                Start Test
              </button>
            </div>
          )}

          {/* Vision Sharpness Test */}
          {currentTest === 'visionSharpness' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Vision Sharpness Test</h2>
              <p className="mb-6 text-center">Select the last row where you can clearly read all the letters.</p>
              
              <div className="flex flex-col items-center mb-8 space-y-8">
                {snellenRows.map((row) => (
                  <div key={row.id} className="text-center">
                    <div 
                      className={`${row.size} font-mono tracking-wider mb-2 cursor-pointer ${selectedRow === row.id ? 'text-primary font-bold' : ''}`}
                      onClick={() => handleRowSelect(row.id)}
                    >
                      {row.letters}
                    </div>
                    <div className="text-xs">{row.id}</div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button 
                  onClick={prevTest}
                  className={`px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-100 transition-all duration-300`}
                >
                  Back
                </button>
                <button 
                  onClick={nextTest}
                  className={`px-4 py-2 ${selectedRow ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-lg transition-all duration-300`}
                  disabled={!selectedRow}
                >
                  Next Test
                </button>
              </div>
            </div>
          )}

          {/* Color Blindness Test */}
          {currentTest === 'colorBlindness' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Color Blindness Test</h2>
              <p className="mb-6 text-center">Enter the number you see in each plate. If you don't see a number, enter 0.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {ishiharaPlates.map((plate) => (
                  <div key={plate.id} className="flex flex-col items-center">
                    <img 
                      src={plate.image} 
                      alt={`Ishihara plate ${plate.id}`} 
                      className="w-48 h-48 object-contain mb-4 rounded-full"
                    />
                    <input 
                      type="text" 
                      value={colorAnswers[plate.id]}
                      onChange={(e) => handleColorAnswer(plate.id, e.target.value)}
                      placeholder="Enter number"
                      className={`p-2 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} rounded-lg text-center w-24`}
                      maxLength={2}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button 
                  onClick={prevTest}
                  className={`px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-100 transition-all duration-300`}
                >
                  Previous Test
                </button>
                <button 
                  onClick={nextTest}
                  className={`px-4 py-2 ${Object.values(colorAnswers).every(answer => answer !== '') ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-lg transition-all duration-300`}
                  disabled={!Object.values(colorAnswers).every(answer => answer !== '')}
                >
                  Next Test
                </button>
              </div>
            </div>
          )}

          {/* Astigmatism Test */}
          {currentTest === 'astigmatism' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Astigmatism Test</h2>
              <p className="mb-6 text-center">Look at the lines below. Do any appear darker, blurrier, or stand out more than others?</p>
              
              <div className="flex justify-center mb-8">
                <div className="relative w-64 h-64">
                  {[...Array(12)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute top-1/2 left-1/2 w-full h-0.5 bg-current transform -translate-x-1/2 -translate-y-1/2"
                      style={{ transform: `translate(-50%, -50%) rotate(${i * 15}deg)` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-center mb-8">
                <p className="mb-4">Select your result:</p>
                <div className="flex space-x-4">
                  <button 
                    onClick={() => handleAstigmatismResult('No signs of astigmatism')}
                    className={`px-4 py-2 rounded-lg ${astigmatismResult === 'No signs of astigmatism' ? 'bg-primary text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    All lines look the same
                  </button>
                  <button 
                    onClick={() => handleAstigmatismResult('Possible astigmatism')}
                    className={`px-4 py-2 rounded-lg ${astigmatismResult === 'Possible astigmatism' ? 'bg-primary text-white' : darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
                  >
                    Some lines look different
                  </button>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <button 
                  onClick={prevTest}
                  className={`px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-100 transition-all duration-300`}
                >
                  Previous Test
                </button>
                <button 
                  onClick={nextTest}
                  className={`px-4 py-2 ${astigmatismResult ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-lg transition-all duration-300`}
                  disabled={!astigmatismResult}
                >
                  Next Test
                </button>
              </div>
            </div>
          )}

          {/* Contrast Sensitivity Test */}
          {currentTest === 'contrastSensitivity' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Contrast Sensitivity Test</h2>
              <p className="mb-6 text-center">Try to identify the number in each box. Enter 0 if you cannot see a number.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                {contrastBoxes.map((box) => (
                  <div key={box.id} className="flex flex-col items-center">
                    <div className={`${box.contrast} w-32 h-32 flex items-center justify-center text-4xl font-bold rounded-lg mb-4`}>
                      {box.number}
                    </div>
                    <p className="text-sm mb-2">{box.difficulty}</p>
                    <input 
                      type="text" 
                      value={contrastAnswers[box.id]}
                      onChange={(e) => handleContrastAnswer(box.id, e.target.value)}
                      placeholder="Enter number"
                      className={`p-2 border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} rounded-lg text-center w-24`}
                      maxLength={1}
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button 
                  onClick={prevTest}
                  className={`px-4 py-2 border ${darkMode ? 'border-gray-600 text-gray-300' : 'border-gray-300 text-gray-700'} rounded-lg hover:bg-gray-100 transition-all duration-300`}
                >
                  Previous Test
                </button>
                <button 
                  onClick={nextTest}
                  className={`px-4 py-2 ${Object.values(contrastAnswers).every(answer => answer !== '') ? 'bg-primary text-white' : 'bg-gray-300 text-gray-500 cursor-not-allowed'} rounded-lg transition-all duration-300`}
                  disabled={!Object.values(contrastAnswers).every(answer => answer !== '')}
                >
                  See Results
                </button>
              </div>
            </div>
          )}

          {/* Results */}
          {currentTest === 'results' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-center">Your Eye Test Results</h2>
              
              <div className={`p-4 rounded-lg mb-8 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
                <p className="text-center mb-4"><strong>Disclaimer:</strong> These results are not a substitute for a professional eye examination. Please consult with an eye care professional for a comprehensive assessment.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h3 className="font-semibold text-lg mb-2">Vision Sharpness</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{results.visionSharpness || 'Not tested'}</p>
                  <p className="text-sm">
                    {results.visionSharpness === '20/20' ? 'You have normal vision sharpness.' :
                     results.visionSharpness && parseInt(results.visionSharpness.split('/')[1]) < 20 ? 'Your vision sharpness is better than average.' :
                     results.visionSharpness && parseInt(results.visionSharpness.split('/')[1]) > 20 ? 'Your vision sharpness is below average.' :
                     'Not enough information to evaluate.'}
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h3 className="font-semibold text-lg mb-2">Color Vision</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{results.colorBlindness || 'Not tested'}</p>
                  <p className="text-sm">
                    {results.colorBlindness === 'Normal color vision' ? 'You correctly identified all color test plates.' :
                     results.colorBlindness === 'Mild color vision deficiency' ? 'You may have a mild color vision deficiency.' :
                     results.colorBlindness === 'Moderate color vision deficiency' ? 'You may have a moderate color vision deficiency.' :
                     results.colorBlindness === 'Significant color vision deficiency' ? 'You may have a significant color vision deficiency.' :
                     'Not enough information to evaluate.'}
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h3 className="font-semibold text-lg mb-2">Astigmatism</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{results.astigmatism || 'Not tested'}</p>
                  <p className="text-sm">
                    {results.astigmatism === 'No signs of astigmatism' ? 'You reported that all lines in the test appeared equally clear.' :
                     results.astigmatism === 'Possible astigmatism' ? 'You reported that some lines appeared darker or blurrier than others, which may indicate astigmatism.' :
                     'Not enough information to evaluate.'}
                  </p>
                </div>
                
                <div className={`p-6 rounded-lg shadow-md ${darkMode ? 'bg-gray-700' : 'bg-white'}`}>
                  <h3 className="font-semibold text-lg mb-2">Contrast Sensitivity</h3>
                  <p className="text-2xl font-bold text-primary mb-2">{results.contrastSensitivity || 'Not tested'}</p>
                  <p className="text-sm">
                    {results.contrastSensitivity === 'Excellent contrast sensitivity' ? 'You correctly identified all numbers, even at low contrast levels.' :
                     results.contrastSensitivity === 'Good contrast sensitivity' ? 'You correctly identified most numbers at different contrast levels.' :
                     results.contrastSensitivity === 'Fair contrast sensitivity' ? 'You had some difficulty identifying numbers at lower contrast levels.' :
                     results.contrastSensitivity === 'Poor contrast sensitivity' ? 'You had significant difficulty identifying numbers at various contrast levels.' :
                     'Not enough information to evaluate.'}
                  </p>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-blue-50 text-blue-800 mb-8">
                <h3 className="font-semibold mb-2">What to do next?</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Schedule a comprehensive eye exam with an optometrist or ophthalmologist</li>
                  <li>If you wear glasses or contacts, ensure your prescription is up to date</li>
                  <li>Take regular breaks when using digital screens (follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds)</li>
                  <li>Protect your eyes from UV exposure with quality sunglasses</li>
                </ul>
              </div>
              
              <div className="flex justify-center">
                <button 
                  onClick={resetTests}
                  className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-all duration-300 font-medium"
                >
                  Restart Tests
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EyeTest;