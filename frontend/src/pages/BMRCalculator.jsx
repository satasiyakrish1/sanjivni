import React, { useState } from 'react';

const BMRCalculator = () => {
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmr, setBmr] = useState(null);

  const calculateBMR = (e) => {
    e.preventDefault();
    
    // Mifflin-St Jeor Equation
    const weightFactor = 10 * parseFloat(weight); // weight in kg
    const heightFactor = 6.25 * parseFloat(height); // height in cm
    const ageFactor = 5 * parseFloat(age);
    const genderFactor = gender === 'male' ? 5 : -161;

    const calculatedBMR = weightFactor + heightFactor - ageFactor + genderFactor;
    setBmr(calculatedBMR);
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Basal Metabolic Rate (BMR) Calculator</h1>
      <p className="text-gray-600 mb-6">
        Calculate your Basal Metabolic Rate - the amount of energy expended while at rest in a neutral environment.
      </p>

      <form onSubmit={calculateBMR} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Age (years)</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full p-2 border rounded-md"
            step="0.1"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Height (cm)</label>
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full p-2 border rounded-md"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Calculate BMR
        </button>
      </form>

      {bmr && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Results</h2>
          <p className="text-gray-700">
            Your Basal Metabolic Rate is {Math.round(bmr)} calories per day
          </p>
          <p className="mt-4 text-sm text-gray-500">
            This is the number of calories your body burns at rest to maintain vital functions like breathing, circulation, and cell production.
          </p>
        </div>
      )}
    </div>
  );
};

export default BMRCalculator;