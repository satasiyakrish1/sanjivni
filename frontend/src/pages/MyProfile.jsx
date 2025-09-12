import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const MyProfile = () => {
    const [isEdit, setIsEdit] = useState(false)
    const [image, setImage] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [profileCompleteness, setProfileCompleteness] = useState(0)
    const [loginHistory, setLoginHistory] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext)
    const [verificationStatus, setVerificationStatus] = useState({ isExpired: false })
    const navigate = useNavigate()

    // Check verification status on component mount and when userData changes
    useEffect(() => {
        const checkVerificationStatus = async () => {
            if (!token || !userData?._id) return;
            
            try {
                const { data } = await axios.get(`${backendUrl}/api/verification/status`, {
                    headers: { token }
                });
                
                if (data.success) {
                    setVerificationStatus(data);
                    
                    // Update local userData if verification has expired
                    if (data.isExpired && userData.isVerified) {
                        setUserData(prev => ({
                            ...prev,
                            isVerified: false,
                            verifiedPlan: null,
                            verifiedAt: null
                        }));
                    }
                }
            } catch (error) {
                console.error('Error checking verification status:', error);
            }
        };
        
        if (userData?.isVerified) {
            checkVerificationStatus();
        }
    }, [backendUrl, token, userData?._id, userData?.isVerified, setUserData]);

    useEffect(() => {
        calculateProfileCompleteness()
    }, [userData])

    useEffect(() => {
        if (activeTab === 'activity') {
            fetchLoginHistory()
        }
    }, [activeTab, currentPage])

    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    const fetchLoginHistory = async (retryCount = 0) => {
        try {
            // Validate token before making request
            if (!token) {
                console.error('No token available');
                toast.error('Authentication required. Please login.');
                window.location.href = '/login';
                return;
            }

            setIsLoadingHistory(true);
            
            const apiUrl = `${backendUrl}/api/login-history/history?page=${currentPage}&limit=10`;
            
            const response = await axios.get(apiUrl, { 
                headers: { 
                    'token': token
                }
            });

            if (response.data.success) {
                setLoginHistory(response.data.data || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
            } else {
                throw new Error(response.data.message || 'Failed to fetch login history');
            }
        } catch (error) {
            console.error('Error fetching login history:', error);
            
            if (error.response) {
                const status = error.response.status;
                const errorData = error.response.data;
                
                if (status === 401 || status === 403) {
                    toast.error('Session expired. Please login again.');
                    window.location.href = '/login';
                } else if (status === 404) {
                    toast.error('Login history service not found. Please contact support.');
                } else if (status >= 500) {
                    toast.error('Server is currently unavailable. Please try again later.');
                } else {
                    toast.error(errorData?.message || 'Failed to fetch login history');
                }
            } else if (error.request) {
                if (retryCount < 3) {
                    const backoffTime = Math.pow(2, retryCount) * 1000;
                    setTimeout(() => fetchLoginHistory(retryCount + 1), backoffTime);
                    return;
                }
                toast.error('Network error: Please check your internet connection and try again.');
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
            
            setLoginHistory([]);
            setTotalPages(1);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    // Debug function to test the API directly
    const testLoginHistoryAPI = async () => {
        try {
            console.log('=== Testing Login History API ===');
            console.log('Backend URL:', backendUrl);
            console.log('Token exists:', !!token);
            console.log('User Data:', userData);
            
            if (!token) {
                console.error('No token available for testing');
                return;
            }
            
            // Test basic connectivity
            const healthCheck = await axios.get(`${backendUrl}/api/user/get-profile`, {
                headers: { token }
            });
            console.log('Profile API works:', healthCheck.data.success);
            
            // Now test login history
            const historyResponse = await axios.get(`${backendUrl}/api/login-history/history?page=1&limit=5`, {
                headers: { token }
            });
            console.log('Login History API Response:', historyResponse.data);
            
        } catch (error) {
            console.error('API Test Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        }
    };

    const calculateProfileCompleteness = () => {
        if (!userData) return 0
        
        const fields = [
            userData.name,
            userData.email,
            userData.phone,
            userData.gender !== 'Not Selected' ? userData.gender : null,
            userData.dob,
            userData.image !== assets.default_profile ? userData.image : null,
            userData.address?.line1,
            userData.address?.city,
            userData.address?.state,
            userData.address?.pincode
        ]
        
        const filledFields = fields.filter(field => field).length
        const percentage = Math.floor((filledFields / fields.length) * 100)
        setProfileCompleteness(percentage)
    }

    const updateUserProfileData = async () => {
        try {
            const formData = new FormData();
            
            // Add basic fields
            formData.append('name', userData.name || '');
            formData.append('phone', userData.phone || '');
            formData.append('gender', userData.gender || 'Not Selected');
            formData.append('dob', userData.dob || '');
            
            // Add address as JSON string if it exists
            if (userData.address) {
                formData.append('address', JSON.stringify(userData.address));
            }
            
            // Add skills if they exist
            if (Array.isArray(userData.skills)) {
                formData.append('skills', JSON.stringify(userData.skills));
            }
            
            // Add social links if they exist
            if (Array.isArray(userData.socialLinks)) {
                formData.append('socialLinks', JSON.stringify(userData.socialLinks));
            }
            
            // Add image if exists
            if (image) {
                formData.append('image', image);
            }

            // Debug log the form data
            console.log('Form data contents:');
            for (let [key, value] of formData.entries()) {
                console.log(key, ':', value);
            }

            console.log('Submitting profile update...');
            
            const { data } = await axios.post(
                `${backendUrl}/api/user/update-profile`, 
                formData, 
                { 
                    headers: { 
                        token,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (data.success) {
                toast.success(data.message);
                await loadUserProfileData();
                setIsEdit(false);
                setImage(false);
            } else {
                toast.error(data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Profile update error:', error);
            console.error('Error response:', error.response?.data);
            toast.error(error.response?.data?.message || error.message || 'Error updating profile');
        }
    };

    const changePassword = async () => {
        try {
            // Validation
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                return toast.error('New passwords do not match')
            }
            
            if (passwordData.newPassword.length < 6) {
                return toast.error('Password must be at least 6 characters')
            }

            const { data } = await axios.post(
                backendUrl + '/api/user/change-password', 
                passwordData, 
                { headers: { token } }
            )

            if (data.success) {
                toast.success(data.message)
                setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                })
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message || 'Failed to change password')
        }
    }

    const addSkill = () => {
        setUserData(prev => ({
            ...prev,
            skills: [...(prev.skills || []), '']
        }))
    }

    const updateSkill = (index, value) => {
        const newSkills = [...(userData.skills || [])]
        newSkills[index] = value
        setUserData(prev => ({
            ...prev,
            skills: newSkills
        }))
    }

    const removeSkill = (index) => {
        const newSkills = [...(userData.skills || [])]
        newSkills.splice(index, 1)
        setUserData(prev => ({
            ...prev,
            skills: newSkills
        }))
    }

    const initSocialLinks = () => {
        if (!userData.socialLinks) {
            setUserData(prev => ({
                ...prev,
                socialLinks: [
                    { platform: 'LinkedIn', url: '' },
                    { platform: 'Twitter', url: '' },
                    { platform: 'GitHub', url: '' },
                    { platform: 'Instagram', url: '' }
                ]
            }))
        }
    }

    const updateSocialLink = (platform, url) => {
        setUserData(prev => ({
            ...prev,
            socialLinks: {
                ...prev.socialLinks,
                [platform]: url
            }
        }))
    }

    useEffect(() => {
        if (isEdit && !userData.socialLinks) {
            initSocialLinks()
        }
    }, [isEdit])

    if (!userData) return null

    return (
        <div className='max-w-4xl mx-auto p-6 bg-white shadow-md rounded-lg'>
            <header className='mb-8'>
                <h1 className='text-2xl font-bold text-gray-800 text-center'>My Account</h1>
                <div className='flex justify-center mt-4'>
                    <div className='flex space-x-4 border-b'>
                        <button 
                            onClick={() => setActiveTab('profile')}
                            className={`pb-2 px-4 ${activeTab === 'profile' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        >
                            Profile
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')}
                            className={`pb-2 px-4 ${activeTab === 'settings' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        >
                            Settings
                        </button>
                        <button 
                            onClick={() => setActiveTab('activity')}
                            className={`pb-2 px-4 ${activeTab === 'activity' ? 'border-b-2 border-blue-500 text-blue-500' : 'text-gray-500'}`}
                        >
                            Activity
                        </button>
                    </div>
                </div>
            </header>

            {activeTab === 'profile' && (
                <div className='space-y-8'>
                    {/* Profile completeness */}
                    <div className='bg-gray-50 p-4 rounded-lg mb-6'>
                        <div className='flex justify-between items-center mb-2'>
                            <h3 className='text-sm font-medium text-gray-700'>Profile Completeness</h3>
                            <span className='text-sm font-bold'>{profileCompleteness}%</span>
                        </div>
                        <div className='w-full bg-gray-200 rounded-full h-2.5'>
                            <div 
                                className='bg-blue-500 h-2.5 rounded-full' 
                                style={{ width: `${profileCompleteness}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Verification Status */}
                    {(!userData.isVerified || verificationStatus.isExpired) && (
                        <div className='bg-blue-50 p-4 rounded-lg mb-6'>
                            <div className='flex items-center gap-3'>
                                <div className='bg-blue-100 p-2 rounded-full'>
                                    <img src={assets.info_icon} alt="Info" className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className='text-sm font-medium text-blue-700'>Verify Your Account</h3>
                                    <p className='text-xs text-blue-600 mt-1'>Get a verified badge and access to premium features by verifying your account.</p>
                                </div>
                                <button 
                                    onClick={() => navigate('/verification')} 
                                    className='ml-auto bg-blue-500 text-white text-xs px-3 py-1.5 rounded-md hover:bg-blue-600 transition'
                                >
                                    Get Verified
                                </button>
                            </div>
                        </div>
                    )}

                    <div className='flex items-center space-x-4'>
                        <label htmlFor='image' className='relative cursor-pointer'>
                            <img 
                                className='w-24 h-24 rounded-full object-cover border-2 border-gray-200' 
                                src={image ? URL.createObjectURL(image) : userData.image || assets.default_profile} 
                                alt="Profile" 
                            />
                            {isEdit && <div className='w-6 h-6 absolute bottom-0 right-0 bg-blue-500 rounded-full flex items-center justify-center'>
                                <img className='w-4 h-4' src={assets.upload_icon} alt="Upload" />
                            </div>}
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden accept="image/*" />
                        <div>
                            {isEdit
                                ? <input 
                                    className='text-xl font-medium border-b-2 border-gray-300 focus:outline-none' 
                                    type="text" 
                                    onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                    value={userData.name} 
                                  />
                                : <div className="flex items-center gap-2">
                                    <p className='text-xl font-medium'>{userData.name}</p>
                                    {userData.isVerified && !verificationStatus.isExpired && (
                                      <div className="tooltip" title={`Verified ${userData.verifiedPlan} Plan`}>
                                        <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
                                      </div>
                                    )}
                                    {verificationStatus.isExpired && (
                                      <div className="tooltip" title="Verification Expired">
                                        <img 
                                          src={assets.info_icon} 
                                          alt="Expired" 
                                          className="w-5 h-5 opacity-50"
                                          style={{ filter: 'invert(50%) sepia(100%) saturate(1000%) hue-rotate(0deg) brightness(100%) contrast(100%)' }}
                                        />
                                      </div>
                                    )}
                                  </div>
                            }
                            <p className='text-gray-500 text-sm'>{userData.email}</p>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div>
                        <h3 className='text-lg font-medium text-gray-600 mb-3'>Personal Information</h3>
                        {isEdit ? (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-500 mb-1'>Name</label>
                                    <input 
                                        className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                        type="text" 
                                        value={userData.name} 
                                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-500 mb-1'>Email</label>
                                    <input 
                                        className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                        type="email" 
                                        value={userData.email} 
                                        disabled
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-500 mb-1'>Phone</label>
                                    <input 
                                        className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                        type="tel" 
                                        value={userData.phone} 
                                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-500 mb-1'>Gender</label>
                                    <select 
                                        className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                        value={userData.gender} 
                                        onChange={(e) => setUserData({...userData, gender: e.target.value})}
                                    >
                                        <option value="Not Selected">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-500 mb-1'>Date of Birth</label>
                                    <input 
                                        className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                        type="date" 
                                        value={userData.dob} 
                                        onChange={(e) => setUserData({...userData, dob: e.target.value})}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Name</p>
                                    <p className='text-gray-700'>{userData.name || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Email</p>
                                    <p className='text-gray-700'>{userData.email}</p>
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Phone</p>
                                    <p className='text-gray-700'>{userData.phone || 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Gender</p>
                                    <p className='text-gray-700'>{userData.gender !== 'Not Selected' ? userData.gender : 'Not provided'}</p>
                                </div>
                                <div>
                                    <p className='text-sm font-medium text-gray-500'>Date of Birth</p>
                                    <p className='text-gray-700'>{userData.dob || 'Not provided'}</p>
                                </div>
                                {userData.isVerified && (
                                <div className="col-span-1 md:col-span-2 mt-2">
                                    <div className="flex items-center gap-2 bg-blue-50 p-3 rounded-md">
                                        <img src={assets.verified_icon} alt="Verified" className="w-5 h-5" />
                                        <div>
                                            <p className="text-sm font-medium text-blue-700">Verified Account</p>
                                            <p className="text-xs text-blue-600">
                                                {userData.verifiedPlan} Plan • Verified on {new Date(userData.verifiedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div>
                        <h3 className='text-lg font-medium text-gray-600 mb-3'>Address</h3>
                        {isEdit ? (
                            <div className='space-y-4'>
                                <div>
                                    <label className='block text-sm font-medium text-gray-500 mb-1'>Address Line 1</label>
                                    <input 
                                        className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                        type="text" 
                                        value={userData.address?.line1 || ''} 
                                        onChange={(e) => setUserData({
                                            ...userData, 
                                            address: {...userData.address, line1: e.target.value}
                                        })}
                                    />
                                </div>
                                <div>
                                    <label className='block text-sm font-medium text-gray-500 mb-1'>Address Line 2</label>
                                    <input 
                                        className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                        type="text" 
                                        value={userData.address?.line2 || ''} 
                                        onChange={(e) => setUserData({
                                            ...userData, 
                                            address: {...userData.address, line2: e.target.value}
                                        })}
                                    />
                                </div>
                                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-500 mb-1'>City</label>
                                        <input 
                                            className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                            type="text" 
                                            value={userData.address?.city || ''} 
                                            onChange={(e) => setUserData({
                                                ...userData, 
                                                address: {...userData.address, city: e.target.value}
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-500 mb-1'>State</label>
                                        <input 
                                            className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                            type="text" 
                                            value={userData.address?.state || ''} 
                                            onChange={(e) => setUserData({
                                                ...userData, 
                                                address: {...userData.address, state: e.target.value}
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className='block text-sm font-medium text-gray-500 mb-1'>Pincode</label>
                                        <input 
                                            className='w-full border-b-2 border-gray-300 focus:outline-none py-1' 
                                            type="text" 
                                            value={userData.address?.pincode || ''} 
                                            onChange={(e) => setUserData({
                                                ...userData, 
                                                address: {...userData.address, pincode: e.target.value}
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-2'>
                                {userData.address?.line1 ? (
                                    <>
                                        <p className='text-gray-700'>{userData.address.line1}</p>
                                        {userData.address.line2 && <p className='text-gray-700'>{userData.address.line2}</p>}
                                        <p className='text-gray-700'>
                                            {[
                                                userData.address.city,
                                                userData.address.state,
                                                userData.address.pincode
                                            ].filter(Boolean).join(', ')}
                                        </p>
                                    </>
                                ) : (
                                    <p className='text-gray-500 italic'>No address provided</p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className='flex justify-end gap-4'>
                        {isEdit ? (
                            <>
                                <button 
                                    onClick={() => setIsEdit(false)} 
                                    className='px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition'
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={updateUserProfileData} 
                                    className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition'
                                >
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <button 
                                onClick={() => setIsEdit(true)} 
                                className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition'
                            >
                                Edit Profile
                            </button>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className='space-y-8'>
                    <div>
                        <h3 className='text-lg font-medium text-gray-600 mb-4'>Change Password</h3>
                        <div className='space-y-4'>
                            <div>
                                <label className='block text-sm font-medium text-gray-500 mb-1'>Current Password</label>
                                <input 
                                    type="password" 
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-500 mb-1'>New Password</label>
                                <input 
                                    type="password" 
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className='block text-sm font-medium text-gray-500 mb-1'>Confirm New Password</label>
                                <input 
                                    type="password" 
                                    className='w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                                />
                            </div>
                            <div>
                                <button 
                                    onClick={changePassword}
                                    className='px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition'
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className='text-lg font-medium text-gray-600 mb-4'>Notification Settings</h3>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='font-medium text-gray-700'>Email Notifications</p>
                                    <p className='text-sm text-gray-500'>Receive email updates about your account</p>
                                </div>
                                <label className='relative inline-flex items-center cursor-pointer'>
                                    <input type="checkbox" className='sr-only peer' defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='font-medium text-gray-700'>Push Notifications</p>
                                    <p className='text-sm text-gray-500'>Receive notifications on your device</p>
                                </div>
                                <label className='relative inline-flex items-center cursor-pointer'>
                                    <input type="checkbox" className='sr-only peer' />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='font-medium text-gray-700'>Marketing Communications</p>
                                    <p className='text-sm text-gray-500'>Receive marketing emails and promotions</p>
                                </div>
                                <label className='relative inline-flex items-center cursor-pointer'>
                                    <input type="checkbox" className='sr-only peer' defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className='text-lg font-medium text-gray-600 mb-4'>Privacy Settings</h3>
                        <div className='space-y-3'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='font-medium text-gray-700'>Profile Visibility</p>
                                    <p className='text-sm text-gray-500'>Allow others to see your profile</p>
                                </div>
                                <label className='relative inline-flex items-center cursor-pointer'>
                                    <input type="checkbox" className='sr-only peer' defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'activity' && (
                <div className='space-y-6'>
                    <h3 className='text-lg font-medium text-gray-600 mb-4'>Login History</h3>
                    
                    {isLoadingHistory ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        </div>
                    ) : loginHistory.length > 0 ? (
                        <div className='space-y-4'>
                            {loginHistory.map((record) => (
                                <div key={record._id} className='flex items-start space-x-3 p-4 bg-gray-50 rounded-lg'>
                                    <div className='flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center'>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className='flex-grow'>
                                        <div className='flex justify-between items-start'>
                                            <div>
                                                <p className='font-medium text-gray-700'>Login from {record.deviceInfo}</p>
                                                <p className='text-sm text-gray-500'>{record.ipAddress}</p>
                                            </div>
                                            <p className='text-xs text-gray-400'>
                                                {new Date(record.loginTime).toLocaleString()}
                                            </p>
                                        </div>
                                        {record.location && (
                                            <p className='text-sm text-gray-500 mt-1'>
                                                Location: {record.location}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-8'>
                            <p className='text-gray-500'>No login history available</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className='flex justify-center items-center space-x-2 mt-6'>
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className='px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Previous
                            </button>
                            <span className='text-sm text-gray-600'>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className='px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default MyProfile