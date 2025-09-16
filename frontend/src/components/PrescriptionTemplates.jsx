import React, { useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const PrescriptionTemplates = ({ onApplyTemplate }) => {
  const { backendUrl } = useContext(AppContext);
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/prescriptions/templates`);
      setTemplates(response.data.templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveAsTemplate = async (prescriptionData) => {
    try {
      await axios.post(`${backendUrl}/api/prescriptions/templates`, {
        name: templateName,
        description: templateDescription,
        medicines: prescriptionData.medicines,
        diagnosis: prescriptionData.diagnosis
      });
      setShowSaveForm(false);
      setTemplateName('');
      setTemplateDescription('');
      fetchTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Prescription Templates</h2>
        <button
          onClick={() => setShowSaveForm(!showSaveForm)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          {showSaveForm ? 'Cancel' : 'Save as Template'}
        </button>
      </div>

      {showSaveForm && (
        <div className="mb-4 p-4 border rounded-lg">
          <input
            type="text"
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          />
          <textarea
            placeholder="Template Description"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            className="w-full p-2 border rounded mb-2"
            rows="2"
          />
          <button
            onClick={saveAsTemplate}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Save Template
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((template, index) => (
          <div key={index} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </div>
              <button
                onClick={() => onApplyTemplate(template)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Apply
              </button>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-700">Diagnosis: {template.diagnosis}</p>
              <p className="text-sm font-medium mt-1">Medicines:</p>
              <ul className="list-disc list-inside text-sm text-gray-600">
                {template.medicines.map((medicine, idx) => (
                  <li key={idx}>{medicine.name} - {medicine.dosage}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          No templates available. Save your frequently used prescriptions as templates.
        </div>
      )}
    </div>
  );
};

export default PrescriptionTemplates;