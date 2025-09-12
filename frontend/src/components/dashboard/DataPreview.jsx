import React from 'react';

const DataPreview = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-8 bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-medium text-gray-800 mb-4">Data Preview</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {Object.keys(data[0]).slice(0, 5).map((header, index) => (
                <th key={index} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.slice(0, 5).map((row, rowIndex) => (
              <tr key={rowIndex}>
                {Object.keys(data[0]).slice(0, 5).map((header, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {row[header]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {data.length > 5 && (
          <p className="mt-2 text-sm text-gray-500 text-right">Showing 5 of {data.length} records</p>
        )}
      </div>
    </div>
  );
};

export default DataPreview;