import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Verification = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [paymentLoading, setPaymentLoading] = useState(false);
    
    const { backendUrl, token, userData } = useContext(AppContext);
    const navigate = useNavigate();
    
    // Fetch verification plans
    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const { data } = await axios.get(`${backendUrl}/api/verification/plans`);
                if (data.success) {
                    const plansArray = Object.entries(data.plans).map(([key, value]) => ({
                        id: key,
                        ...value
                    }));
                    setPlans(plansArray);
                } else {
                    toast.error(data.message || 'Failed to fetch verification plans');
                }
            } catch (error) {
                console.error(error);
                toast.error('Error fetching verification plans');
            } finally {
                setLoading(false);
            }
        };
        
        const checkVerificationStatus = async () => {
            if (!token || !userData?._id) return;
            
            try {
                const { data } = await axios.get(`${backendUrl}/api/verification/status`, {
                    headers: { token }
                });
                
                if (data.success) {
                    setVerificationStatus(data);
                }
            } catch (error) {
                console.error('Error checking verification status:', error);
            }
        };
        
        fetchPlans();
        checkVerificationStatus();
    }, [backendUrl, token, userData]);
    
    // Handle plan selection
    const handleSelectPlan = (plan) => {
        setSelectedPlan(plan);
    };
    
    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
        return new Promise((resolve, reject) => {
            if (typeof window.Razorpay !== 'undefined') {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error('Failed to load Razorpay script'));
            document.head.appendChild(script);
        });
    };
    
    // Handle payment
    const handlePayment = async () => {
        if (!selectedPlan || !token || !userData?._id) {
            toast.error('Please select a plan first');
            return;
        }
        
        // Debug logging
        console.log('Payment Debug Info:', {
            selectedPlan,
            userId: userData._id,
            token: token ? 'Token exists' : 'No token',
            backendUrl,
            planType: selectedPlan.id
        });
        
        setPaymentLoading(true);
        
        try {
            // Load Razorpay script first
            await loadRazorpayScript();
            console.log('Razorpay script loaded successfully');
            
            // Create order with detailed logging
            console.log('Creating order with payload:', {
                userId: userData._id,
                planType: selectedPlan.id
            });
            
            const response = await axios.post(
                `${backendUrl}/api/verification/create-order`,
                { 
                    userId: userData._id, 
                    planType: selectedPlan.id,
                    amount: selectedPlan.price * 100, // Convert to paise if needed
                    currency: 'INR'
                },
                { 
                    headers: { 
                        token,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            console.log('Order creation response:', response.data);
            
            if (!response.data || !response.data.success) {
                console.error('Order creation failed:', response.data);
                toast.error(response.data?.message || 'Failed to create payment order');
                return;
            }
            
            // Get Razorpay Key ID
            const razorpayKeyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
            console.log('Razorpay Key ID:', razorpayKeyId ? 'Available' : 'Missing');
            
            if (!razorpayKeyId) {
                toast.error('Payment configuration error. Please contact support.');
                return;
            }
            
            // Validate order data
            if (!response.data.order || !response.data.order.id) {
                console.error('Invalid order data:', response.data);
                toast.error('Invalid order data received. Please try again.');
                return;
            }
            
            console.log('Razorpay order data:', response.data.order);
            
            // Configure Razorpay options
            const options = {
                key: razorpayKeyId,
                amount: response.data.order.amount,
                currency: response.data.order.currency || 'INR',
                name: 'Sanjivni',
                description: `${selectedPlan.name} - Profile Verification`,
                order_id: response.data.order.id,
                handler: function(paymentResponse) {
                    console.log('Payment success response:', paymentResponse);
                    verifyPayment(paymentResponse);
                },
                prefill: {
                    name: userData.name || '',
                    email: userData.email || '',
                    contact: userData.phone || ''
                },
                theme: {
                    color: '#5fff7a'
                },
                modal: {
                    ondismiss: function() {
                        console.log('Payment modal dismissed');
                        setPaymentLoading(false);
                    }
                }
            };
            
            console.log('Razorpay options:', options);
            
            // Initialize Razorpay
            const razorpay = new window.Razorpay(options);
            
            razorpay.on('payment.failed', function(response) {
                console.error('Payment failed:', response);
                toast.error(`Payment failed: ${response.error?.description || 'Unknown error'}`);
                setPaymentLoading(false);
            });
            
            razorpay.open();
            
        } catch (error) {
            console.error('Error processing payment:', error);
            console.error('Error details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                config: error.config
            });
            
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
                navigate('/login');
            } else if (error.response?.status === 403) {
                toast.error('Access denied. Please check your permissions.');
            } else if (error.response?.status === 404) {
                toast.error('API endpoint not found. Please check your backend configuration.');
            } else if (error.response?.status >= 500) {
                toast.error('Server error. Please try again later.');
            } else {
                toast.error(error.response?.data?.message || 'Error processing payment. Please try again.');
            }
            
            setPaymentLoading(false);
        }
    };
    
    // Verify payment with backend
    const verifyPayment = async (response) => {
        try {
            const { data } = await axios.post(
                `${backendUrl}/api/verification/verify-payment`,
                {
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_signature: response.razorpay_signature
                },
                { headers: { token } }
            );
            
            if (data.success) {
                toast.success('Verification successful! Your profile is now verified.');
                setVerificationStatus(data);
                setTimeout(() => {
                    navigate('/my-profile');
                }, 2000);
            } else {
                toast.error(data.message || 'Verification failed. Please contact support.');
            }
        } catch (error) {
            console.error('Error during payment verification:', error);
            toast.error('Error verifying payment. Please contact support.');
        } finally {
            setPaymentLoading(false);
        }
    };
    
    // If user is already verified
    if (verificationStatus?.isVerified) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                <div className="max-w-md mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800 mb-3">Profile Verified!</h2>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm font-medium mb-4">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {verificationStatus.verifiedPlan} Plan
                        </div>
                        <p className="text-gray-600 mb-6">
                            Verified on {new Date(verificationStatus.verifiedAt).toLocaleDateString()}
                        </p>
                        <button 
                            onClick={() => navigate('/my-profile')} 
                            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300 transform hover:scale-105"
                        >
                            Go to Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="text-center mb-16">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-6">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                        Get <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">Verified</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Join our verified community and earn trust with the blue verification badge. 
                        Get enhanced visibility and priority support.
                    </p>
                </div>
                
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-500 rounded-full animate-spin animation-delay-150"></div>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Plans Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            {plans.map((plan, index) => (
                                <div 
                                    key={plan.id} 
                                    className={`relative bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 transform hover:-translate-y-2 hover:shadow-2xl cursor-pointer ${
                                        selectedPlan?.id === plan.id ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                                    } ${index === 1 ? 'md:scale-105 border-2 border-blue-200' : ''}`}
                                    onClick={() => handleSelectPlan(plan)}
                                >
                                    {index === 1 && (
                                        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center py-2 text-sm font-semibold">
                                            Most Popular
                                        </div>
                                    )}
                                    
                                    <div className={`p-8 ${index === 1 ? 'pt-12' : ''}`}>
                                        <div className="text-center">
                                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
                                            <div className="flex items-center justify-center mb-4">
                                                <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                                                    ₹{plan.price}
                                                </span>
                                            </div>
                                            <p className="text-gray-600 mb-8 h-12">{plan.description}</p>
                                        </div>
                                        
                                        <div className="space-y-4 mb-8">
                                            {[
                                                'Blue Verification Badge',
                                                'Enhanced Profile Visibility',
                                                'Priority Customer Support',
                                                'Trust & Credibility Boost'
                                            ].map((feature, featureIndex) => (
                                                <div key={featureIndex} className="flex items-center">
                                                    <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mr-3">
                                                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <span className="text-gray-700">{feature}</span>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <button 
                                            className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                                                selectedPlan?.id === plan.id 
                                                    ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg' 
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSelectPlan(plan);
                                            }}
                                        >
                                            {selectedPlan?.id === plan.id ? (
                                                <div className="flex items-center justify-center">
                                                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    Selected
                                                </div>
                                            ) : (
                                                'Select Plan'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Debug Information (Remove in production) */}
                        {process.env.NODE_ENV === 'development' && (
                            <div className="bg-gray-100 rounded-xl p-6 mb-8 max-w-md mx-auto">
                                <h3 className="text-lg font-semibold mb-4">Debug Information:</h3>
                                <div className="space-y-2 text-sm">
                                    <div>Backend URL: {backendUrl || 'Not set'}</div>
                                    <div>Token: {token ? '✓ Available' : '✗ Missing'}</div>
                                    <div>User ID: {userData?._id || 'Not available'}</div>
                                    <div>User Email: {userData?.email || 'Not available'}</div>
                                    <div>Razorpay Key: {import.meta.env.VITE_RAZORPAY_KEY_ID ? '✓ Available' : '✗ Missing'}</div>
                                    <div>Selected Plan: {selectedPlan?.id || 'None'}</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Payment Section */}
                        {selectedPlan && (
                            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Complete Your Verification</h3>
                                    <p className="text-gray-600">Selected: {selectedPlan.name}</p>
                                </div>
                                
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-gray-700">Plan Cost</span>
                                        <span className="text-2xl font-bold text-gray-800">₹{selectedPlan.price}</span>
                                    </div>
                                    <div className="text-sm text-gray-600 mb-4">
                                        • Instant verification upon payment
                                        • Blue badge visible immediately
                                        • All features activated
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={handlePayment}
                                    disabled={paymentLoading}
                                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {paymentLoading ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            Pay Securely - ₹{selectedPlan.price}
                                        </div>
                                    )}
                                </button>
                                
                                <div className="mt-4 text-center">
                                    <p className="text-sm text-gray-500">
                                        🔒 Secure payment powered by Razorpay
                                    </p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Verification;