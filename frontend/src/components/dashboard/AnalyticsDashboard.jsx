import React from 'react';
import { Bar, Pie, Line } from 'react-chartjs-2';

const AnalyticsDashboard = ({ analysisResults }) => {
  if (!analysisResults) return null;
  
  const { topMedicines, monthlySales, inventoryStatus, doctorPatterns } = analysisResults;
  
  // Prepare chart data
  const topMedicinesChart = {
    labels: topMedicines.map(item => item.name),
    datasets: [
      {
        label: 'Prescription Count',
        data: topMedicines.map(item => item.count),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
          'rgba(255, 99, 132, 0.6)'
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(255, 99, 132, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const monthlySalesChart = {
    labels: monthlySales.map(item => item.month),
    datasets: [
      {
        label: 'Monthly Sales',
        data: monthlySales.map(item => item.amount),
        fill: false,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        tension: 0.1
      }
    ]
  };

  const inventoryStatusChart = {
    labels: inventoryStatus.map(item => item.name),
    datasets: [
      {
        label: 'Stock Level',
        data: inventoryStatus.map(item => item.stock),
        backgroundColor: 'rgba(255, 99, 132, 0.6)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }
    ]
  };

  const doctorPatternsChart = {
    labels: doctorPatterns.map(item => item.name),
    datasets: [
      {
        label: 'Prescriptions',
        data: doctorPatterns.map(item => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Calculate total sales
  const totalSales = monthlySales.reduce((sum, item) => sum + item.amount, 0).toFixed(2);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-6 text-center text-blue-800">Data Analysis Results</h2>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Total Records</h3>
          <p className="text-3xl font-bold text-blue-600">{topMedicines.reduce((sum, item) => sum + item.count, 0)}</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Top Medicine</h3>
          <p className="text-3xl font-bold text-green-600">
            {topMedicines.length > 0 ? topMedicines[0].name : 'N/A'}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-purple-600">
            ${totalSales}
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Low Stock Alert</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {inventoryStatus.length > 0 ? inventoryStatus.length : 0}
          </p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Medicines Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Most Prescribed Medicines</h3>
          <div className="h-80">
            <Bar 
              data={topMedicinesChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false }
                }
              }} 
            />
          </div>
        </div>
        
        {/* Monthly Sales Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Sales Trend</h3>
          <div className="h-80">
            <Line 
              data={monthlySalesChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          </div>
        </div>
        
        {/* Inventory Status Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Low Stock Inventory</h3>
          <div className="h-80">
            <Bar 
              data={inventoryStatusChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y'
              }} 
            />
          </div>
        </div>
        
        {/* Doctor Patterns Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Doctor Prescription Patterns</h3>
          <div className="h-80">
            <Pie 
              data={doctorPatternsChart} 
              options={{
                responsive: true,
                maintainAspectRatio: false
              }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;