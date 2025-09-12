import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';

const MenstrualPeriodCalculator = () => {
  // Form state
  const [lastPeriodDate, setLastPeriodDate] = useState('');
  const [cycleLength, setCycleLength] = useState(28); // Default cycle length
  const [periodLength, setPeriodLength] = useState(5); // Default period length
  
  // Results state
  const [predictions, setPredictions] = useState([]);
  const [historyData, setHistoryData] = useState([]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('menstrualHistory');
    if (savedHistory) {
      setHistoryData(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    if (historyData.length > 0) {
      localStorage.setItem('menstrualHistory', JSON.stringify(historyData));
    }
  }, [historyData]);

  const calculatePredictions = () => {
    if (lastPeriodDate) {
      const startDate = new Date(lastPeriodDate);
      const results = [];
      
      // Calculate next 12 periods
      for (let i = 0; i < 12; i++) {
        const periodStartDate = new Date(startDate);
        periodStartDate.setDate(periodStartDate.getDate() + (cycleLength * i));
        
        const periodEndDate = new Date(periodStartDate);
        periodEndDate.setDate(periodEndDate.getDate() + (periodLength - 1));
        
        // Calculate fertile window (typically 12-16 days before next period)
        const nextPeriodStart = new Date(startDate);
        nextPeriodStart.setDate(nextPeriodStart.getDate() + (cycleLength * (i + 1)));
        
        const fertileWindowEnd = new Date(nextPeriodStart);
        fertileWindowEnd.setDate(fertileWindowEnd.getDate() - 11);
        
        const fertileWindowStart = new Date(fertileWindowEnd);
        fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);
        
        // Calculate ovulation day (typically 14 days before next period)
        const ovulationDay = new Date(nextPeriodStart);
        ovulationDay.setDate(ovulationDay.getDate() - 14);
        
        results.push({
          periodStart: formatDate(periodStartDate),
          periodEnd: formatDate(periodEndDate),
          fertileWindowStart: formatDate(fertileWindowStart),
          fertileWindowEnd: formatDate(fertileWindowEnd),
          ovulationDay: formatDate(ovulationDay),
          month: periodStartDate.toLocaleString('default', { month: 'long', year: 'numeric' })
        });
      }
      
      setPredictions(results);
      
      // Save to history
      const newEntry = {
        date: new Date().toLocaleDateString(),
        lastPeriod: formatDate(new Date(lastPeriodDate)),
        cycleLength: cycleLength,
        periodLength: periodLength
      };
      
      setHistoryData(prev => [newEntry, ...prev.slice(0, 9)]); // Keep only last 10 entries
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const resetForm = () => {
    setLastPeriodDate('');
    setCycleLength(28);
    setPeriodLength(5);
    setPredictions([]);
  };

  const clearHistory = () => {
    setHistoryData([]);
    localStorage.removeItem('menstrualHistory');
  };

  // Group predictions by month
  const groupedPredictions = predictions.reduce((acc, prediction) => {
    const month = prediction.month;
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(prediction);
    return acc;
  }, {});

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <SEO 
        title="Menstrual Period Calculator - Track Your Cycle | Sanjivni"
        description="Plan ahead with our Menstrual Period Calculator. Track your cycle, predict your next 12 periods, and identify fertile windows for better health management."
        keywords="menstrual calculator, period tracker, menstrual cycle, period calendar, fertility window, ovulation calculator"
        canonicalUrl="/menstrual-period-calculator"
        ogType="website"
        ogImage="/images/menstrual-calculator-preview.jpg"
      />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Menstrual Period Calculator
        </h1>
        <p className="text-center text-gray-600 mb-2">
          The functioning of this tool and the content on this page have been verified by iCliniq medical review team.
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Calculator Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-6">
              <p className="text-gray-600 mb-6">
                Wondering when you will get your next menstrual periods? Well, The Menstrual Period Calculator knows it all. 
                This easy tracking tool helps you to map your menstrual cycle for 12 months.
              </p>
              
              {/* Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col">
                  <label htmlFor="lastPeriod" className="mb-2 text-gray-700 font-medium">
                    Last Period Start Date
                  </label>
                  <input 
                    type="date" 
                    id="lastPeriod"
                    value={lastPeriodDate}
                    onChange={(e) => setLastPeriodDate(e.target.value)}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="cycleLength" className="mb-2 text-gray-700 font-medium">
                    Cycle Length (days)
                  </label>
                  <select
                    id="cycleLength"
                    value={cycleLength}
                    onChange={(e) => setCycleLength(Number(e.target.value))}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 15 }, (_, i) => i + 21).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col">
                  <label htmlFor="periodLength" className="mb-2 text-gray-700 font-medium">
                    Period Length (days)
                  </label>
                  <select
                    id="periodLength"
                    value={periodLength}
                    onChange={(e) => setPeriodLength(Number(e.target.value))}
                    className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 2).map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4">
                <button 
                  onClick={calculatePredictions}
                  className="flex-1 bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition-all duration-300 font-medium"
                >
                  Calculate Cycle
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
            {predictions.length > 0 && (
              <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden">
                <div className="bg-gray-50 p-4 border-b">
                  <h3 className="text-xl font-semibold">Your Menstrual Calendar</h3>
                </div>
                
                <div className="p-6">
                  <p className="text-gray-600 mb-6">
                    A period-free picnic or a beach trip or a social event can well be planned with the help of this tool. 
                    Religious obligations can well be fulfilled without any hassles.
                  </p>
                  
                  <div className="space-y-6">
                    {Object.keys(groupedPredictions).map((month, monthIndex) => (
                      <div key={monthIndex} className="border-b pb-4 last:border-0 last:pb-0">
                        <h4 className="font-semibold text-lg text-gray-800 mb-3">{month}</h4>
                        <div className="space-y-4">
                          {groupedPredictions[month].map((prediction, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="bg-pink-50 p-3 rounded-lg">
                                <div className="text-sm text-pink-600 font-medium mb-1">Period</div>
                                <div className="text-gray-800">
                                  {prediction.periodStart} - {prediction.periodEnd}
                                </div>
                              </div>
                              <div className="bg-purple-50 p-3 rounded-lg">
                                <div className="text-sm text-purple-600 font-medium mb-1">Fertile Window</div>
                                <div className="text-gray-800">
                                  {prediction.fertileWindowStart} - {prediction.fertileWindowEnd}
                                </div>
                              </div>
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <div className="text-sm text-blue-600 font-medium mb-1">Ovulation Day</div>
                                <div className="text-gray-800">{prediction.ovulationDay}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
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
                <h3 className="text-lg font-semibold">Calculation History</h3>
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
                      <div key={index} className="flex flex-col p-2 border-b last:border-0">
                        <div className="text-sm text-gray-500">{entry.date}</div>
                        <div className="font-medium">Last period: {entry.lastPeriod}</div>
                        <div className="text-sm text-gray-600">
                          Cycle: {entry.cycleLength} days / Period: {entry.periodLength} days
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No history yet. Calculate your cycle to start tracking.
                  </p>
                )}
              </div>
            </div>
            
            {/* Information Panel */}
            <div className="bg-white rounded-xl shadow-md">
              <div className="bg-gray-50 p-4 border-b">
                <h3 className="text-lg font-semibold">About Menstrual Cycles</h3>
              </div>
              <div className="p-4 text-gray-600 text-sm space-y-3">
                <p>The menstrual cycle is the monthly hormonal cycle a female's body goes through to prepare for pregnancy.</p>
                <p>Understanding your cycle can help with:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Planning events and activities</li>
                  <li>Tracking fertility windows</li>
                  <li>Monitoring reproductive health</li>
                  <li>Preparing for potential symptoms</li>
                </ul>
                
                <div className="mt-6 pt-4 border-t">
                  <h4 className="font-semibold mb-2 text-gray-700">Cycle Phases:</h4>
                  <div className="space-y-2">
                    <div className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-pink-500 mt-1 mr-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Menstrual Phase:</span>
                        <span className="ml-1">When bleeding occurs (typically 3-7 days)</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-orange-500 mt-1 mr-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Follicular Phase:</span>
                        <span className="ml-1">When the body prepares to release an egg</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1 mr-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Ovulation:</span>
                        <span className="ml-1">When an egg is released (most fertile time)</span>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-3 h-3 rounded-full bg-purple-500 mt-1 mr-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Luteal Phase:</span>
                        <span className="ml-1">Post-ovulation until next period</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="italic text-gray-500">"Plans are of little importance, but planning is essential." - Winston Churchill</p>
                </div>
                
                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-gray-500">
                    Note: This calculator provides estimates based on average cycle patterns. 
                    Individual cycles may vary. For medical concerns, please consult a healthcare provider.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenstrualPeriodCalculator;