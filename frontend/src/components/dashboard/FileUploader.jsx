import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';

const FileUploader = ({ onFileUpload, isLoading }) => {
  const [filePreview, setFilePreview] = useState(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    maxFiles: 1,
    onDrop: acceptedFiles => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        
        // Create file preview
        const fileInfo = {
          name: selectedFile.name,
          size: (selectedFile.size / 1024).toFixed(2) + ' KB',
          type: selectedFile.type
        };
        setFilePreview(fileInfo);
        
        // Pass file to parent component
        onFileUpload(selectedFile);
      }
    }
  });

  return (
    <div className="mb-10 max-w-2xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-green-700">Upload Medical Data</h2>
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive ? 'border-green-600 bg-green-50' : 'border-gray-300 hover:border-green-500'}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          {isDragActive ? (
            <p className="text-green-600">Drop the file here...</p>
          ) : (
            <div>
              <p className="text-gray-600 mb-1">Drag & drop a file here, or click to select</p>
              <p className="text-sm text-gray-500">Supported formats: CSV, XLSX, JSON</p>
            </div>
          )}
        </div>
      </div>

      {/* File Preview */}
      {filePreview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-700 mb-2">File Details:</h3>
          <p><span className="font-medium">Name:</span> {filePreview.name}</p>
          <p><span className="font-medium">Size:</span> {filePreview.size}</p>
          <p><span className="font-medium">Type:</span> {filePreview.type}</p>
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="mt-4 flex justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;