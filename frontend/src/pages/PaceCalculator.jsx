import React, { useState } from 'react';

const PaceCalculator = () => {
  const [distance, setDistance] = useState('');
  const [time, setTime] = useState('');
  const [pace, setPace] = useState(null);
  const [activityType, setActivityType] = useState('running');

  const calculatePace = (e) => {
    e.preventDefault();
    const timeInMinutes = parseFloat(time);
    const distanceInKm = parseFloat(distance);
    
    if (timeInMinutes && distanceInKm) {
      const paceMinPerKm = timeInMinutes / distanceInKm;
      setPace(paceMinPerKm);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Pace Calculator</h1>
      <p className="text-gray-600 mb-6">Quickly estimate your pace, time, or distance for running, walking, or biking.</p>
      
      <form onSubmit={calculatePace} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Activity Type</label>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="running">Running</option>
            <option value="walking">Walking</option>
            <option value="biking">Biking</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Distance (km)</label>
          <input
            type="number"
            value={distance}
            onChange={(e) => setDistance(e.target.value)}
            className="w-full p-2 border rounded-md"
            step="0.01"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Time (minutes)</label>
          <input
            type="number"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-2 border rounded-md"
            step="0.01"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Calculate Pace
        </button>
      </form>

      {pace && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Results</h2>
          <p className="text-gray-700">
            Your pace is {pace.toFixed(2)} minutes per kilometer
          </p>
        </div>
      )}
    </div>
  );
};

export default PaceCalculator;