import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WardManagement = () => {
    const [wards, setWards] = useState([]);
    const [emergencyCases, setEmergencyCases] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchWardData();
        fetchEmergencyCases();
        fetchWardStats();
    }, []);

    const fetchWardData = async () => {
        try {
            const response = await axios.get('/api/ward/all');
            setWards(response.data);
        } catch (error) {
            console.error('Error fetching ward data:', error);
        }
    };

    const fetchEmergencyCases = async () => {
        try {
            const response = await axios.get('/api/ward/emergency/cases');
            setEmergencyCases(response.data);
        } catch (error) {
            console.error('Error fetching emergency cases:', error);
        }
    };

    const fetchWardStats = async () => {
        try {
            const response = await axios.get('/api/ward/stats');
            setStats(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching ward stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Ward Management Dashboard</h2>
            
            {/* Ward Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats && stats.map((stat) => (
                    <div key={stat.type} className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold mb-4">{stat.type.replace('_', ' ').toUpperCase()}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-gray-600">Total Beds</p>
                                <p className="text-2xl font-bold">{stat.totalBeds}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Available</p>
                                <p className="text-2xl font-bold text-green-600">{stat.availableBeds}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-600">Occupancy Rate</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{ width: `${stat.occupancyRate}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-right">{stat.occupancyRate.toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Emergency Cases */}
            <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Emergency Cases</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left">Patient</th>
                                <th className="px-6 py-3 text-left">Severity</th>
                                <th className="px-6 py-3 text-left">Status</th>
                                <th className="px-6 py-3 text-left">Ward</th>
                                <th className="px-6 py-3 text-left">Doctor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {emergencyCases.map((emergency) => (
                                <tr key={emergency._id}>
                                    <td className="px-6 py-4">{emergency.patient?.name}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs ${emergency.severity === 'critical' ? 'bg-red-100 text-red-800' : emergency.severity === 'severe' ? 'bg-orange-100 text-orange-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {emergency.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">{emergency.status}</td>
                                    <td className="px-6 py-4">{emergency.assignedWard?.name || 'Not assigned'}</td>
                                    <td className="px-6 py-4">{emergency.assignedDoctor?.name || 'Not assigned'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Ward List */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Ward Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wards.map((ward) => (
                        <div key={ward._id} className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-lg font-semibold">{ward.name}</h4>
                                <span className={`px-3 py-1 rounded-full text-sm ${ward.type === 'ICU' ? 'bg-red-100 text-red-800' : ward.type === 'operation_theater' ? 'bg-green-100 text-green-800' : 'bg-green-100 text-green-800'}`}>
                                    {ward.type}
                                </span>
                            </div>
                            <div className="space-y-2">
                                <p className="text-gray-600">Floor: {ward.floor}</p>
                                <p className="text-gray-600">Department: {ward.department}</p>
                                <p className="text-gray-600">
                                    Beds: {ward.beds.filter(bed => bed.status === 'occupied').length} / {ward.totalBeds}
                                </p>
                            </div>
                            <div className="mt-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-green-600 h-2.5 rounded-full"
                                        style={{ width: `${ward.occupancyStatus}%` }}
                                    ></div>
                                </div>
                                <p className="text-sm text-right mt-1">{ward.occupancyStatus.toFixed(1)}% Occupied</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WardManagement;