import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const PatientHistory = ({ patientName }) => {
  const { backendUrl } = useContext(AppContext);
  const [prescriptionHistory, setPrescriptionHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPatientHistory = async () => {
    if (!patientName) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${backendUrl}/api/prescriptions/history/${encodeURIComponent(patientName)}`);
      setPrescriptionHistory(response.data.prescriptions);
    } catch (err) {
      setError('Failed to fetch patient history');
      console.error('Error fetching patient history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Patient History</h2>
        <button
          onClick={fetchPatientHistory}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={!patientName || isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch History'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {prescriptionHistory.length > 0 ? (
        <div className="space-y-4">
          {prescriptionHistory.map((prescription, index) => (
            <div key={index} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">Date: {new Date(prescription.date).toLocaleDateString()}</p>
                  <p className="text-gray-600">Diagnosis: {prescription.diagnosis}</p>
                </div>
                <span className="text-sm text-gray-500">#{prescription.id}</span>
              </div>
              
              <div className="mt-3">
                <p className="font-medium mb-2">Prescribed Medicines:</p>
                <ul className="list-disc list-inside space-y-1">
                  {prescription.medicines.map((medicine, idx) => (
                    <li key={idx} className="text-gray-700">
                      {medicine.name} - {medicine.dosage}
                      <span className="text-gray-500 text-sm"> ({medicine.duration})</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 text-sm text-gray-600">
                <p>BP: {prescription.bp}</p>
                <p>Weight: {prescription.weight} kg</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          {patientName ? 
            'No prescription history found' : 
            'Enter patient name to view history'}
        </div>
      )}
    </div>
  );
};

export default PatientHistory;