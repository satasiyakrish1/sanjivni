import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import jsPDF from 'jspdf';
import { assets } from '../assets/assets';

const MedicineSearch = () => {
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  const handleSearch = async (e, newPage = 1) => {
    e?.preventDefault();
    setPage(newPage);
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.append('query', searchQuery);
      params.append('page', newPage);
      params.append('limit', 20);

      const response = await axios.get(`${backendUrl}/api/medicine/search?${params.toString()}`);
      setMedicines(response.data.medicines);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Failed to fetch medicines. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch(null, 1);
  }, []);

  // Premium PDF design function
  const downloadPremiumPDF = (medicine) => {
    // Setup document
    const doc = new jsPDF();
    doc.setProperties({
      title: `${medicine.name} - Medical Information`,
      subject: 'Medication Information Sheet',
      author: 'Sanjivani AI Health',
      keywords: 'medication, prescription, healthcare',
      creator: 'Sanjivani AI PDF Generator'
    });
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = 0;
    
    // Create header with gradient effect
    doc.setFillColor(0, 71, 171); // Blue header
    doc.rect(0, 0, pageWidth, 35, 'F');
    
    // Add curved bottom border to header
    doc.setDrawColor(0, 51, 141);
    doc.setLineWidth(0.5);
    const curvePoints = 100;
    for (let i = 0; i < curvePoints; i++) {
      const x = (i / curvePoints) * pageWidth;
      // Create a gentle curve
      const y = 35 + Math.sin((i / curvePoints) * Math.PI) * 5;
      if (i === 0) {
        doc.moveTo(x, y);
      } else {
        doc.lineTo(x, y);
      }
    }
    doc.stroke();
    
    // Add company logo/name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('PRESCRIPTO', margin, 22);
    
    // Add document type
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('OFFICIAL MEDICATION INFORMATION', pageWidth - margin, 15, { align: 'right' });
    doc.text('CONFIDENTIAL HEALTHCARE DOCUMENT', pageWidth - margin, 22, { align: 'right' });
    
    // Add medicine name with styled box
    yPosition = 55;
    doc.setFillColor(240, 248, 255); // Light blue background
    doc.roundedRect(margin - 5, yPosition - 15, pageWidth - 2 * margin + 10, 30, 3, 3, 'F');
    
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(medicine.name.toUpperCase(), pageWidth / 2, yPosition, { align: 'center' });
    
    // Add generic name
    yPosition += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(medicine.genericName || 'N/A', pageWidth / 2, yPosition, { align: 'center' });
    
    // Add decorative element
    yPosition += 15;
    doc.setDrawColor(0, 71, 171);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    
    for (let i = 0; i < 5; i++) {
      const dotPosition = margin + ((pageWidth - 2 * margin) / 4) * i;
      doc.setFillColor(0, 71, 171);
      doc.circle(dotPosition, yPosition, 1.5, 'F');
    }
    
    // Section: General Information
    yPosition += 20;
    doc.setFillColor(0, 71, 171);
    doc.rect(margin - 5, yPosition - 5, 5, 20, 'F');
    
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('GENERAL INFORMATION', margin + 5, yPosition + 5);
    
    // Add styled box for general info
    yPosition += 15;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 45, 3, 3, 'F');
    
    // Two-column layout with icons
    const colWidth = (pageWidth - 2 * margin - 10) / 2;
    
    // First row
    yPosition += 5;
    
    // Drug Class
    doc.setFillColor(220, 230, 242);
    doc.roundedRect(margin, yPosition - 5, 8, 8, 1, 1, 'F');
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Rx', margin + 4, yPosition, { align: 'center' });
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Drug Class:', margin + 12, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.text(medicine.drugClass || 'N/A', margin + 45, yPosition);
    
    // Dosage Form
    doc.setFillColor(220, 230, 242);
    doc.roundedRect(margin + colWidth, yPosition - 5, 8, 8, 1, 1, 'F');
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Df', margin + colWidth + 4, yPosition, { align: 'center' });
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Dosage Form:', margin + colWidth + 12, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.text(medicine.dosageForm || 'N/A', margin + colWidth + 50, yPosition);
    
    // Second row
    yPosition += 15;
    
    // Strength
    doc.setFillColor(220, 230, 242);
    doc.roundedRect(margin, yPosition - 5, 8, 8, 1, 1, 'F');
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('St', margin + 4, yPosition, { align: 'center' });
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Strength:', margin + 12, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.text(medicine.strength || 'N/A', margin + 45, yPosition);
    
    // Composition
    doc.setFillColor(220, 230, 242);
    doc.roundedRect(margin + colWidth, yPosition - 5, 8, 8, 1, 1, 'F');
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('Co', margin + colWidth + 4, yPosition, { align: 'center' });
    
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Composition:', margin + colWidth + 12, yPosition);
    
    doc.setFont('helvetica', 'normal');
    doc.text(medicine.composition || 'N/A', margin + colWidth + 50, yPosition);
    
    // Section: Medical Use
    yPosition += 30;
    doc.setFillColor(0, 71, 171);
    doc.rect(margin - 5, yPosition - 5, 5, 20, 'F');
    
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICAL USE', margin + 5, yPosition + 5);
    
    // Add styled box for medical use
    yPosition += 15;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, 3, 3, 'F');
    
    // Add medical cross icon
    doc.setFillColor(220, 230, 242);
    doc.roundedRect(margin, yPosition - 3, 10, 10, 1, 1, 'F');
    doc.setDrawColor(0, 71, 171);
    doc.setLineWidth(0.5);
    doc.line(margin + 2, yPosition + 2, margin + 8, yPosition + 2);
    doc.line(margin + 5, yPosition - 1, margin + 5, yPosition + 5);
    
    // Add medical use content
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const indicationsLines = doc.splitTextToSize(
      medicine.indications || 'No information available.',
      pageWidth - 2 * margin - 15
    );
    doc.text(indicationsLines, margin + 15, yPosition);
    
    // Section: Description
    yPosition += 30 + (indicationsLines.length * 5);
    if (yPosition > pageHeight - 70) {
      doc.addPage();
      yPosition = 30;
      
      // Add mini header on new page
      doc.setFillColor(0, 71, 171);
      doc.rect(0, 0, pageWidth, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text('PRESCRIPTO - Medication Information', margin, 10);
      doc.text(medicine.name, pageWidth - margin, 10, { align: 'right' });
    }
    
    doc.setFillColor(0, 71, 171);
    doc.rect(margin - 5, yPosition - 5, 5, 20, 'F');
    
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', margin + 5, yPosition + 5);
    
    // Add styled box for description
    yPosition += 15;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 40, 3, 3, 'F');
    
    // Add description icon
    doc.setFillColor(220, 230, 242);
    doc.roundedRect(margin, yPosition - 3, 10, 10, 1, 1, 'F');
    doc.setDrawColor(0, 71, 171);
    doc.setLineWidth(0.5);
    doc.line(margin + 2, yPosition, margin + 8, yPosition);
    doc.line(margin + 2, yPosition + 3, margin + 8, yPosition + 3);
    
    // Add description content
    doc.setTextColor(80, 80, 80);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const descriptionLines = doc.splitTextToSize(
      medicine.description || 'No description available.',
      pageWidth - 2 * margin - 15
    );
    doc.text(descriptionLines, margin + 15, yPosition);
    
    // Add Bottom Disclaimer
    yPosition = pageHeight - 45;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(margin - 5, yPosition - 5, pageWidth - 2 * margin + 10, 25, 3, 3, 'F');
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('DISCLAIMER: This document is for informational purposes only and does not replace professional medical advice.', 
      pageWidth / 2, yPosition, { align: 'center' });
    doc.text('Always consult with a qualified healthcare provider for medical diagnosis and treatment.', 
      pageWidth / 2, yPosition + 5, { align: 'center' });
    
    // Add footer with design elements
    yPosition = pageHeight - 15;
    doc.setFillColor(0, 71, 171);
    doc.rect(0, yPosition - 5, pageWidth, 20, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    const today = new Date().toLocaleDateString();
    doc.text(`Generated on: ${today}`, margin, yPosition);
    doc.text('Sanjivani AI Health Systems', pageWidth / 2, yPosition, { align: 'center' });
    doc.text('Page 1', pageWidth - margin, yPosition, { align: 'right' });
    
    // Add QR code visual placeholder in bottom corner
    const qrSize = 30;
    yPosition = pageHeight - 60;
    doc.setDrawColor(0, 71, 171);
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(pageWidth - margin - qrSize, yPosition - 5, qrSize, qrSize, 3, 3, 'FD');
    
    // Add inner squares for QR code effect
    doc.setDrawColor(0, 71, 171);
    doc.setFillColor(0, 71, 171);
    const innerSize = qrSize * 0.7;
    const innerMargin = (qrSize - innerSize) / 2;
    doc.roundedRect(
      pageWidth - margin - qrSize + innerMargin, 
      yPosition - 5 + innerMargin, 
      innerSize, 
      innerSize, 
      2, 
      2, 
      'FD'
    );
    
    // Add inner white square
    doc.setFillColor(255, 255, 255);
    const coreSize = innerSize * 0.6;
    const coreMargin = (innerSize - coreSize) / 2;
    doc.roundedRect(
      pageWidth - margin - qrSize + innerMargin + coreMargin, 
      yPosition - 5 + innerMargin + coreMargin, 
      coreSize, 
      coreSize, 
      1, 
      1, 
      'F'
    );
    
    doc.setTextColor(0, 71, 171);
    doc.setFontSize(7);
    doc.text('Scan for', pageWidth - margin - qrSize/2, yPosition + qrSize + 3, { align: 'center' });
    doc.text('digital info', pageWidth - margin - qrSize/2, yPosition + qrSize + 8, { align: 'center' });
    
    // Save the PDF
    doc.save(`${medicine.name.replace(/\s+/g, '_')}_medical_info.pdf`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for medicines by name, generic name, or medical use..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {medicines.map((medicine, index) => (
          <div
            key={index}
            className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
          >
            <div className="mb-4">
              <h3 className="text-xl font-semibold mb-1">{medicine.name}</h3>
              <p className="text-gray-600">{medicine.genericName}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">General Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Drug Class:</span> {medicine.drugClass}</p>
                  <p><span className="font-medium">Dosage Form:</span> {medicine.dosageForm}</p>
                  <p><span className="font-medium">Strength:</span> {medicine.strength}</p>
                  <p><span className="font-medium">Composition:</span> {medicine.composition}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-700 mb-2">Medical Use</h4>
                <p className="text-sm text-gray-600">{medicine.indications}</p>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">Description</h4>
              <p className="text-sm text-gray-600">{medicine.description}</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => downloadPremiumPDF(medicine)}
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF
              </button>
              <button
                onClick={() => {
                  if (medicine._id) {
                    navigate(`/medicines/${medicine._id}`);
                  } else {
                    setError('Unable to view medicine details. Please try again.');
                  }
                }}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                View Full Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {medicines.length === 0 && !loading && (
        <div className="text-center text-gray-500 mt-4">
          No medicines found. Try different search terms.
        </div>
      )}
      
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={(e) => page > 1 && handleSearch(e, page - 1)}
              disabled={page === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 ${page === 1 ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="sr-only">Previous</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </button>
            
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(num => 
                num === 1 || 
                num === pagination.totalPages || 
                (num >= page - 1 && num <= page + 1)
              )
              .map((pageNum, idx, array) => {
                // Add ellipsis
                if (idx > 0 && pageNum - array[idx - 1] > 1) {
                  return (
                    <span key={`ellipsis-${pageNum}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-gray-700">
                      ...
                    </span>
                  );
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={(e) => handleSearch(e, pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 border ${
                      pageNum === page 
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })
            }
            
            <button
              onClick={(e) => page < pagination.totalPages && handleSearch(e, page + 1)}
              disabled={page === pagination.totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 ${page === pagination.totalPages ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
            >
              <span className="sr-only">Next</span>
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      )}
    </div>
  );
};

export default MedicineSearch;