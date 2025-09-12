import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { getBackendUrl } from '../utils/connectionHelper';
import SEO from '../components/SEO';
import LoadingScreen from '../components/LoadingScreen';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, isAuthenticated, userData, currencySymbol } = useContext(AppContext);
  const backendUrl = getBackendUrl();
  
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRsvp, setUserRsvp] = useState(null);
  const [showRsvpForm, setShowRsvpForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  
  // Fetch event details
  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setLoading(true);
        const headers = token ? { token } : {};
        const { data } = await axios.get(`${backendUrl}/api/events/${id}`, { headers });
        
        if (data.success) {
          setEvent(data.event);
          if (data.event.userRsvp) {
            setUserRsvp(data.event.userRsvp);
          }
        } else {
          setError(data.message || 'Failed to fetch event details');
          toast.error(data.message || 'Failed to fetch event details');
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
        setError('Error connecting to the server. Please try again later.');
        toast.error('Error connecting to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventDetails();
  }, [backendUrl, id, token]);
  
  // Pre-fill form data if user is logged in
  useEffect(() => {
    if (userData && isAuthenticated) {
      setFormData({
        name: userData.name || '',
        email: userData.email || '',
        phone: userData.phone || ''
      });
    }
  }, [userData, isAuthenticated]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Calculate event duration in hours and minutes
  const formatDuration = (minutes) => {
    if (!minutes) return '';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    let result = '';
    if (hours > 0) {
      result += `${hours} hour${hours > 1 ? 's' : ''}`;
    }
    if (remainingMinutes > 0) {
      result += `${hours > 0 ? ' ' : ''}${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
    }
    
    return result;
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Add additionalInfo to formData if not present
  useEffect(() => {
    if (!formData.additionalInfo) {
      setFormData(prev => ({
        ...prev,
        additionalInfo: {}
      }));
    }
  }, [formData]);
  
  // Handle RSVP form submission
  const handleRsvpSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to RSVP for this event');
      navigate('/login');
      return;
    }
    
    try {
      setPaymentProcessing(true);
      const { data } = await axios.post(
        `${backendUrl}/api/events/${id}/rsvp`,
        formData,
        { headers: { token } }
      );
      
      if (data.success) {
        if (event.eventType === 'free') {
          // For free events, show success message and update UI
          toast.success('RSVP confirmed successfully!');
          setUserRsvp(data.rsvp);
          setShowRsvpForm(false);
        } else {
          // For paid events, handle payment options
          if (data.paymentOptions) {
            handlePaymentOptions(data);
          } else {
            toast.success('RSVP created. Please complete payment.');
            setUserRsvp(data.rsvp);
          }
        }
      } else {
        toast.error(data.message || 'Failed to create RSVP');
      }
    } catch (error) {
      console.error('Error creating RSVP:', error);
      toast.error(error.response?.data?.message || 'Error connecting to the server');
    } finally {
      setPaymentProcessing(false);
    }
  };
  
  // Handle payment options
  const handlePaymentOptions = (data) => {
    const { paymentOptions, rsvp } = data;
    setUserRsvp(rsvp);
    
    // Store RSVP ID for payment processing
    localStorage.setItem('current_rsvp_id', rsvp._id);
    
    // Show payment method selection
    setShowRsvpForm(false);
  };
  
  // Process Razorpay payment
  const handleRazorpayPayment = async () => {
    if (!event || !userRsvp) return;
    
    try {
      setPaymentProcessing(true);
      
      // Create Razorpay order
      const { data } = await axios.post(
        `${backendUrl}/api/events/${event._id}/payment/razorpay`,
        {},
        { headers: { token } }
      );
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment order');
      }
      
      const { order, eventDetails } = data;
      
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          document.body.appendChild(script);
        });
      }
      
      // Configure Razorpay options
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: 'Prescripto',
        description: `Payment for ${eventDetails.title}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            // Verify payment
            const verifyData = await axios.post(
              `${backendUrl}/api/events/${event._id}/payment/razorpay/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature
              },
              { headers: { token } }
            );
            
            if (verifyData.data.success) {
              toast.success('Payment successful! Your RSVP is confirmed.');
              // Refresh event details to update RSVP status
              const { data: refreshData } = await axios.get(
                `${backendUrl}/api/events/${id}`,
                { headers: { token } }
              );
              
              if (refreshData.success) {
                setEvent(refreshData.event);
                setUserRsvp(refreshData.userRsvp);
              }
            } else {
              toast.error(verifyData.data.message || 'Payment verification failed');
            }
          } catch (error) {
            console.error('Payment verification error:', error);
            toast.error('Payment verification failed. Please contact support.');
          } finally {
            setPaymentProcessing(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            setPaymentProcessing(false);
          }
        }
      };
      
      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (error) {
      console.error('Razorpay payment error:', error);
      toast.error(error.response?.data?.message || 'Payment initialization failed');
      setPaymentProcessing(false);
    }
  };
  
  // Process Stripe payment
  const handleStripePayment = async () => {
    if (!event || !userRsvp) return;
    
    try {
      setPaymentProcessing(true);
      
      // Create Stripe checkout session
      const { data } = await axios.post(
        `${backendUrl}/api/events/${event._id}/payment/stripe`,
        {},
        { headers: { token } }
      );
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to create payment session');
      }
      
      // Redirect to Stripe checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Stripe payment error:', error);
      toast.error(error.response?.data?.message || 'Payment initialization failed');
      setPaymentProcessing(false);
    }
  };
  
  // Handle RSVP cancellation
  const handleCancelRsvp = async () => {
    if (!isAuthenticated || !userRsvp) return;
    
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/events/${id}/rsvp/cancel`,
        {},
        { headers: { token } }
      );
      
      if (data.success) {
        toast.success('RSVP cancelled successfully');
        setUserRsvp(null);
      } else {
        toast.error(data.message || 'Failed to cancel RSVP');
      }
    } catch (error) {
      console.error('Error cancelling RSVP:', error);
      toast.error(error.response?.data?.message || 'Error connecting to the server');
    }
  };
  
  // Add event to calendar
  const handleAddToCalendar = async () => {
    if (!isAuthenticated || !userRsvp) return;
    
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/events/${id}/calendar`,
        {},
        { headers: { token } }
      );
      
      if (data.success) {
        // Open calendar URL in new tab
        window.open(data.calendarUrl, '_blank');
      } else {
        toast.error(data.message || 'Failed to generate calendar link');
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      toast.error(error.response?.data?.message || 'Error connecting to the server');
    }
  };
  
  // Determine RSVP button text and state
  const getRsvpButtonText = () => {
    if (!event) return 'RSVP';
    
    if (userRsvp) {
      if (userRsvp.status === 'confirmed') return 'RSVP Confirmed';
      if (userRsvp.status === 'pending') return 'Complete Payment';
      return 'RSVP Again';
    }
    
    if (event.rsvpLimit > 0 && event.rsvpCount >= event.rsvpLimit) {
      return 'Event Full';
    }
    
    return event.eventType === 'free' ? 'RSVP Now' : `RSVP (${currencySymbol}${event.price})`;
  };
  
  // Determine if RSVP button should be disabled
  const isRsvpButtonDisabled = () => {
    if (!event) return true;
    if (event.status === 'completed' || event.status === 'cancelled') return true;
    if (event.rsvpLimit > 0 && event.rsvpCount >= event.rsvpLimit && !userRsvp) return true;
    if (userRsvp && userRsvp.status === 'confirmed') return true;
    return false;
  };
  
  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }
  
  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Event Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The event you are looking for does not exist or has been removed.'}</p>
          <button
            onClick={() => navigate('/events')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Back to Events
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title={`${event.title} | Prescripto Events`} 
        description={event.description.substring(0, 160)} 
      />
      
      {/* Event Banner */}
      {event.banner && (
        <div className="w-full h-64 md:h-96 bg-gray-200 overflow-hidden">
          <img 
            src={event.banner ? `${backendUrl}${event.banner}` : '/default-banner.png'}
            alt={event.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Event Details */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Organized by Prescripto
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${event.status === 'upcoming' ? 'bg-green-100 text-green-800' : event.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                    {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDate(event.date)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Time</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatTime(event.date)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Duration</dt>
                    <dd className="mt-1 text-sm text-gray-900">{formatDuration(event.duration)}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Location Type</dt>
                    <dd className="mt-1 text-sm text-gray-900 capitalize">{event.locationType}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {event.locationType === 'online' ? (
                        userRsvp && userRsvp.status === 'confirmed' ? (
                          <a 
                            href={event.meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            {event.meetingLink || 'Meeting link will be available soon'}
                          </a>
                        ) : (
                          'Meeting link will be available after RSVP confirmation'
                        )
                      ) : (
                        event.location
                      )}
                    </dd>
                  </div>
                  {event.eventType === 'paid' && (
                    <div className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">Price</dt>
                      <dd className="mt-1 text-sm text-gray-900">{currencySymbol}{event.price}</dd>
                    </div>
                  )}
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Availability</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {event.rsvpLimit > 0 ? (
                        <>
                          <span className={event.rsvpCount >= event.rsvpLimit ? 'text-red-600' : 'text-green-600'}>
                            {event.rsvpCount} / {event.rsvpLimit} spots filled
                          </span>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${event.rsvpCount >= event.rsvpLimit ? 'bg-red-600' : 'bg-green-600'}`} 
                              style={{ width: `${Math.min(100, (event.rsvpCount / event.rsvpLimit) * 100)}%` }}
                            ></div>
                          </div>
                        </>
                      ) : (
                        'Unlimited spots available'
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <div className="mt-3 prose prose-blue text-gray-700">
                  {event.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {/* RSVP Section */}
          <div className="mt-8 lg:mt-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg sticky top-4">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg font-medium text-gray-900">RSVP for this Event</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {event.eventType === 'free' ? 'This is a free event' : `This is a paid event (${currencySymbol}${event.price})`}
                </p>
              </div>
              
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                {userRsvp ? (
                  <div>
                    <div className={`rounded-md ${userRsvp.status === 'confirmed' ? 'bg-green-50' : 'bg-yellow-50'} p-4 mb-4`}>
                      <div className="flex">
                        <div className="flex-shrink-0">
                          {userRsvp.status === 'confirmed' ? (
                            <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="ml-3">
                          <h3 className={`text-sm font-medium ${userRsvp.status === 'confirmed' ? 'text-green-800' : 'text-yellow-800'}`}>
                            {userRsvp.status === 'confirmed' ? 'RSVP Confirmed' : 'RSVP Pending'}
                          </h3>
                          <div className={`mt-2 text-sm ${userRsvp.status === 'confirmed' ? 'text-green-700' : 'text-yellow-700'}`}>
                            <p>
                              {userRsvp.status === 'confirmed' 
                                ? 'Your spot is reserved for this event.' 
                                : 'Your RSVP is pending payment confirmation.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {userRsvp.status === 'pending' && event.eventType === 'paid' && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Complete your payment</h4>
                        <div className="space-y-3">
                          {event.paymentIntegration && (
                            <>
                              <button
                                onClick={handleRazorpayPayment}
                                disabled={paymentProcessing}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                {paymentProcessing ? 'Processing...' : 'Pay with Razorpay'}
                              </button>
                              <button
                                onClick={handleStripePayment}
                                disabled={paymentProcessing}
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                {paymentProcessing ? 'Processing...' : 'Pay with Stripe'}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-3">
                      {userRsvp.status === 'confirmed' && (
                        <button
                          onClick={handleAddToCalendar}
                          className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Add to Calendar
                        </button>
                      )}
                      
                      <button
                        onClick={handleCancelRsvp}
                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Cancel RSVP
                      </button>
                    </div>
                  </div>
                ) : showRsvpForm ? (
                  <form onSubmit={handleRsvpSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => setShowRsvpForm(false)}
                        className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={paymentProcessing}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        {paymentProcessing ? 'Processing...' : 'Submit RSVP'}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">
                      {event.rsvpLimit > 0 && event.rsvpCount >= event.rsvpLimit
                        ? 'This event is fully booked.'
                        : `Join us for this ${event.eventType} event. ${event.rsvpLimit > 0 ? `${event.rsvpLimit - event.rsvpCount} spots remaining.` : ''}`}
                    </p>
                    
                    <button
                      onClick={() => isAuthenticated ? setShowRsvpForm(true) : navigate('/login')}
                      disabled={isRsvpButtonDisabled()}
                      className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${isRsvpButtonDisabled() ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
                    >
                      {getRsvpButtonText()}
                    </button>
                    
                    {!isAuthenticated && (
                      <p className="text-xs text-gray-500 text-center mt-2">
                        You need to be logged in to RSVP for this event.
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              {/* Share Event */}
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-sm font-medium text-gray-900">Share this event</h3>
                <div className="mt-3 flex space-x-2">
                  <button
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join us for ${event.title}`)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    LinkedIn
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success('Link copied to clipboard!');
                    }}
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;