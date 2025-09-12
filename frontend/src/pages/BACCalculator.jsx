import React, { useState } from 'react';

const BACCalculator = () => {
  const [weight, setWeight] = useState('');
  const [gender, setGender] = useState('male');
  const [drinks, setDrinks] = useState('');
  const [hours, setHours] = useState('');
  const [bac, setBac] = useState(null);

  const calculateBAC = (e) => {
    e.preventDefault();
    
    // Constants for Widmark formula
    const genderConstant = gender === 'male' ? 0.68 : 0.55;
    const metabolismRate = 0.015; // Average metabolism rate per hour

    // Assume standard drink (14g of pure alcohol)
    const alcoholGrams = parseFloat(drinks) * 14;
    const weightInGrams = parseFloat(weight) * 1000; // Convert kg to grams
    const timeInHours = parseFloat(hours);

    // BAC = (alcohol in grams / (body weight in grams * gender constant)) * 100 - (metabolism rate * hours)
    const calculatedBAC = ((alcoholGrams / (weightInGrams * genderConstant)) * 100) - (metabolismRate * timeInHours);
    setBac(Math.max(0, calculatedBAC)); // BAC cannot be negative
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-6">Blood Alcohol Concentration (BAC) Calculator</h1>
      <p className="text-gray-600 mb-6">
        BAC is the percentage of alcohol in your blood. The legal limit for driving in the US is 0.08% for adults 21 and over.
      </p>

      <form onSubmit={calculateBAC} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Weight (kg)</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
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
          <label className="block text-gray-700 mb-2">Number of Standard Drinks</label>
          <input
            type="number"
            value={drinks}
            onChange={(e) => setDrinks(e.target.value)}
            className="w-full p-2 border rounded-md"
            step="0.5"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Hours Since First Drink</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-2 border rounded-md"
            step="0.5"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Calculate BAC
        </button>
      </form>

      {bac !== null && (
        <div className="mt-6 p-4 bg-blue-50 rounded-md">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">Results</h2>
          <p className="text-gray-700">
            Estimated BAC: {bac.toFixed(3)}%
          </p>
          <p className={`mt-2 ${bac >= 0.08 ? 'text-red-600' : 'text-green-600'}`}>
            {bac >= 0.08 ? 'Above legal limit for driving' : 'Below legal limit for driving'}
          </p>
          <p className="mt-4 text-sm text-gray-500">
            Note: This is an estimate only. Actual BAC can vary based on many factors.
          </p>
        </div>
      )}
    </div>
  );
};

export default BACCalculator;