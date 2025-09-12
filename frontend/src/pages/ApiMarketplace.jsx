import React, { useState, useEffect } from 'react';

const ApiMarketplace = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    useCase: '',
    expectedVolume: ''
  });

  const [userPackages, setUserPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserPackages();
  }, []);

  const fetchUserPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to view your packages');
        return;
      }
      const response = await fetch('/api/user-packages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch packages');
      }
      const data = await response.json();
      setUserPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Failed to load packages. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
  };

  const handlePayment = async (packageType) => {
    try {
      setLoading(true);
      const orderResponse = await fetch('/api/packages/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ packageType })
      });

      const orderData = await orderResponse.json();

      const options = {
        key: process.env.RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Prescripto API',
        description: `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const verifyResponse = await fetch('/api/packages/verify-payment', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                packageType
              })
            });

            const verifyData = await verifyResponse.json();
            if (verifyData.success) {
              alert(`Payment successful! Your API key: ${verifyData.apiKey}`);
              fetchUserPackages();
            }
          } catch (error) {
            console.error('Payment verification failed:', error);
            alert('Payment verification failed');
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email
        },
        theme: {
          color: '#3B82F6'
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Error initiating payment:', error);
      alert('Error initiating payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Prescripto Booking API
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Integrate our powerful appointment booking system into your healthcare platform
          </p>
        </div>

        {/* User's Active Packages */}
        {userPackages.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-8">Your Active Packages</h2>
            {loading ? (
              <div className="text-center text-gray-600">Loading packages...</div>
            ) : error ? (
              <div className="text-center text-red-600">{error}</div>
            ) : userPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {userPackages.map((pkg) => (
                  <div key={pkg._id} className="bg-white p-6 rounded-lg shadow-md border border-blue-200">
                    <h3 className="text-xl font-semibold mb-4 capitalize">{pkg.packageType} Package</h3>
                    <div className="space-y-2">
                      <p>API Key: <span className="font-mono text-sm">{pkg.apiKey}</span></p>
                      <p>Calls Used: {pkg.callsUsed} / {pkg.monthlyCallLimit}</p>
                      <p>Valid Until: {new Date(pkg.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">API Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Seamless Integration</h3>
              <p className="text-gray-600">Easy-to-use RESTful API with comprehensive documentation</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Real-time Scheduling</h3>
              <p className="text-gray-600">Instant appointment booking and calendar synchronization</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Secure & Reliable</h3>
              <p className="text-gray-600">Enterprise-grade security with 99.9% uptime guarantee</p>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Pricing Plans</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Starter</h3>
              <p className="text-3xl font-bold mb-4">₹99<span className="text-lg font-normal">/month</span></p>
              <ul className="space-y-2 mb-6">
                <li>Up to 1,000 API calls/month</li>
                <li>Basic support</li>
                <li>Standard features</li>
              </ul>
              <button
                onClick={() => handlePayment('starter')}
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md border-2 border-blue-500">
              <h3 className="text-xl font-semibold mb-4">Professional</h3>
              <p className="text-3xl font-bold mb-4">₹299<span className="text-lg font-normal">/month</span></p>
              <ul className="space-y-2 mb-6">
                <li>Up to 10,000 API calls/month</li>
                <li>Priority support</li>
                <li>Advanced features</li>
              </ul>
              <button
                onClick={() => handlePayment('professional')}
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-4">Enterprise</h3>
              <p className="text-3xl font-bold mb-4">₹999<span className="text-lg font-normal">/month</span></p>
              <ul className="space-y-2 mb-6">
                <li>Up to 100,000 API calls/month</li>
                <li>24/7 dedicated support</li>
                <li>Custom features</li>
              </ul>
              <button
                onClick={() => handlePayment('enterprise')}
                disabled={loading}
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Purchase Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Request API Access</h2>
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-lg shadow-md">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="useCase" className="block text-sm font-medium text-gray-700">Use Case</label>
              <textarea
                id="useCase"
                name="useCase"
                value={formData.useCase}
                onChange={handleInputChange}
                rows="4"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            <div>
              <label htmlFor="expectedVolume" className="block text-sm font-medium text-gray-700">Expected Monthly Volume</label>
              <select
                id="expectedVolume"
                name="expectedVolume"
                value={formData.expectedVolume}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                <option value="">Select volume</option>
                <option value="<1000">Less than 1,000</option>
                <option value="1000-10000">1,000 - 10,000</option>
                <option value=">10000">More than 10,000</option>
              </select>
            </div>
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApiMarketplace;