import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const PasswordChangeForm = ({ token, backendUrl, onClose }) => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validatePasswords = () => {
        if (passwords.newPassword.length < 8) {
            toast.error('New password must be at least 8 characters long');
            return false;
        }
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error('New passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords()) return;

        try {
            setLoading(true);
            const { data } = await axios.post(
                `${backendUrl}/api/user/change-password`,
                passwords,
                { headers: { token } }
            );

            if (data.success) {
                toast.success('Password updated successfully');
                onClose();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Password change error:', error);
            toast.error(error.response?.data?.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Current Password</label>
                    <input
                        type="password"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">New Password</label>
                    <input
                        type="password"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={passwords.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-600 focus:ring-green-600"
                        required
                    />
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PasswordChangeForm;