import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import jsPDF from 'jspdf';
import { useNavigate } from 'react-router-dom';
import PatientHistory from './PatientHistory';

const PrescriptionForm = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [patientDetails, setPatientDetails] = useState({
    name: '',
    age: '',
    gender: '',
    weight: '',
    bp: '',
    diagnosis: ''
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${backendUrl}/api/medicine/search?query=${searchQuery}`);
      setSearchResults(response.data.medicines);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const addMedicine = async (medicine) => {
    // Check for medicine interactions before adding
    if (selectedMedicines.length > 0) {
      try {
        const response = await axios.post(`${backendUrl}/api/medicine/check-interactions`, {
          medicines: [...selectedMedicines.map(m => m.name), medicine.name]
        });

        if (response.data.hasInteractions) {
          // Format interaction details for display
          const interactionDetails = response.data.interactions
            .filter(interaction => interaction.severity !== 'none')
            .map(interaction => `${interaction.medicine1} + ${interaction.medicine2}: ${interaction.interactionText}`)
            .join('\n\n');
            
          const confirmAdd = window.confirm(
            `Warning: Potential interaction detected between ${medicine.name} and existing medications.\n\nInteraction details:\n${interactionDetails || 'Details not available'}\n\nDo you still want to add this medicine?`
          );
          if (!confirmAdd) return;
        }
      } catch (error) {
        console.error('Error checking medicine interactions:', error);
      }
    }

    setSelectedMedicines([...selectedMedicines, {
      ...medicine,
      dosage: '',
      duration: '',
      instructions: ''
    }]);
    setSearchResults([]);
    setSearchQuery('');
  };

  const updateMedicineDetails = (index, field, value) => {
    const updatedMedicines = [...selectedMedicines];
    updatedMedicines[index] = { ...updatedMedicines[index], [field]: value };
    setSelectedMedicines(updatedMedicines);
  };

  const removeMedicine = (index) => {
    setSelectedMedicines(selectedMedicines.filter((_, i) => i !== index));
  };

  const handlePatientDetailsChange = (field, value) => {
    setPatientDetails({ ...patientDetails, [field]: value });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Add custom fonts
    doc.setFont('helvetica', 'bold');

    // Header with improved styling
    doc.setFontSize(24);
    doc.setTextColor(0, 48, 135); // Rich blue color
    doc.text('PRESCRIPTO', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);
    doc.setTextColor(70, 70, 70);
    doc.text('Medical Prescription', pageWidth / 2, yPos, { align: 'center' });

    // Add current date
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, yPos);

    // Patient Details with improved layout
    yPos += 20;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 48, 135);
    doc.text('Patient Information', margin, yPos);

    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(40, 40, 40);

    // Create two-column layout for patient details
    const leftCol = margin;
    const rightCol = pageWidth / 2 + 10;

    doc.text(`Name: ${patientDetails.name}`, leftCol, yPos);
    doc.text(`Age: ${patientDetails.age}`, rightCol, yPos);
    
    yPos += 8;
    doc.text(`Gender: ${patientDetails.gender}`, leftCol, yPos);
    doc.text(`Weight: ${patientDetails.weight} kg`, rightCol, yPos);
    
    yPos += 8;
    doc.text(`Blood Pressure: ${patientDetails.bp}`, leftCol, yPos);

    // Diagnosis with background highlight
    yPos += 15;
    doc.setDrawColor(0, 48, 135);
    doc.setFillColor(240, 244, 248);
    doc.rect(margin - 2, yPos - 4, pageWidth - 2 * margin + 4, 12, 'F');
    doc.setTextColor(0, 48, 135);
    doc.setFont('helvetica', 'bold');
    doc.text('Diagnosis:', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40, 40, 40);
    doc.text(patientDetails.diagnosis, margin + 45, yPos);

    // Medicines section with improved formatting
    yPos += 20;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 48, 135);
    doc.text('Prescribed Medicines', margin, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    selectedMedicines.forEach((medicine, index) => {
      // Add medicine number with circle
      yPos += 12;
      doc.setDrawColor(0, 48, 135);
      doc.setFillColor(0, 48, 135);
      doc.circle(margin + 3, yPos - 3, 3, 'F');
      doc.setTextColor(40, 40, 40);
      doc.text(`${medicine.name} (${medicine.strength})`, margin + 10, yPos);

      // Medicine details with improved indentation and icons
      yPos += 7;
      doc.setTextColor(70, 70, 70);
      doc.text(`⏱ Dosage: ${medicine.dosage}`, margin + 10, yPos);
      yPos += 7;
      doc.text(`📅 Duration: ${medicine.duration}`, margin + 10, yPos);
      yPos += 7;
      doc.text(`ℹ️ Instructions: ${medicine.instructions}`, margin + 10, yPos);
    });

    // Footer with line separator
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, footerY - 10, pageWidth - margin, footerY - 10);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text('Generated by Sanjivani AI Healthcare System', pageWidth / 2, footerY, { align: 'center' });

    // Save the PDF with formatted name
    const fileName = `prescription_${patientDetails.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  };

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleSubmit = async () => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      const prescriptionData = {
        patientDetails,
        medicines: selectedMedicines,
        date: new Date().toISOString()
      };
  
      await axios.post(`${backendUrl}/api/prescriptions`, prescriptionData);
      generatePDF();
      navigate('/my-prescriptions');
    } catch (error) {
      console.error('Error saving prescription:', error);
      setSaveError('Failed to save prescription. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Write Prescription</h1>
      
      {/* Patient History Component */}
      <PatientHistory patientName={patientDetails.name} />
      
      {/* Patient Details */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Patient Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Patient Name"
            value={patientDetails.name}
            onChange={(e) => handlePatientDetailsChange('name', e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Age"
            value={patientDetails.age}
            onChange={(e) => handlePatientDetailsChange('age', e.target.value)}
            className="p-2 border rounded"
          />
          <select
            value={patientDetails.gender}
            onChange={(e) => handlePatientDetailsChange('gender', e.target.value)}
            className="p-2 border rounded"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input
            type="text"
            placeholder="Weight (kg)"
            value={patientDetails.weight}
            onChange={(e) => handlePatientDetailsChange('weight', e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Blood Pressure"
            value={patientDetails.bp}
            onChange={(e) => handlePatientDetailsChange('bp', e.target.value)}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Diagnosis"
            value={patientDetails.diagnosis}
            onChange={(e) => handlePatientDetailsChange('diagnosis', e.target.value)}
            className="p-2 border rounded"
          />
        </div>
      </div>

      {/* Medicine Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Add Medicines</h2>
        <form onSubmit={handleSearch} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for medicines..."
              className="flex-1 p-2 border rounded"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Search
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-4 max-h-40 overflow-y-auto border rounded p-2">
            {searchResults.map((medicine, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                onClick={() => addMedicine(medicine)}
              >
                <div>
                  <p className="font-medium">{medicine.name}</p>
                  <p className="text-sm text-gray-600">{medicine.genericName}</p>
                </div>
                <button
                  className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    addMedicine(medicine);
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Selected Medicines */}
        <div className="space-y-4">
          {selectedMedicines.map((medicine, index) => (
            <div key={index} className="border rounded p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-medium">{medicine.name}</h3>
                  <p className="text-sm text-gray-600">{medicine.genericName}</p>
                </div>
                <button
                  onClick={() => removeMedicine(index)}
                  className="text-red-500 hover:text-red-600"
                >
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Dosage (e.g., 1-0-1)"
                  value={medicine.dosage}
                  onChange={(e) => updateMedicineDetails(index, 'dosage', e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g., 7 days)"
                  value={medicine.duration}
                  onChange={(e) => updateMedicineDetails(index, 'duration', e.target.value)}
                  className="p-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Instructions"
                  value={medicine.instructions}
                  onChange={(e) => updateMedicineDetails(index, 'instructions', e.target.value)}
                  className="p-2 border rounded"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        {saveError && (
          <div className="text-red-500 mr-auto">{saveError}</div>
        )}
        <button
          onClick={generatePDF}
          className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          disabled={isSaving}
        >
          Generate PDF
        </button>
        <button
          onClick={handleSubmit}
          className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
          disabled={selectedMedicines.length === 0 || !patientDetails.name || isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Prescription'}
        </button>
      </div>
    </div>
  );
};

export default PrescriptionForm;