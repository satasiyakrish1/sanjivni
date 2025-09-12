import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { assets } from '../assets/assets';
import SEO from '../components/SEO';
import Lottie from 'react-lottie'; // Import Lottie

// Define animation data directly in the component
const donationAnimationData = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Donation Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Heart",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 100], e: [120, 120] },
            { t: 30, s: [120, 120], e: [100, 100] },
            { t: 60, s: [100, 100] }
          ]
        }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              d: 1,
              ks: {
                a: 0,
                k: {
                  c: true,
                  v: [
                    [0, -30],
                    [30, 0],
                    [0, 30],
                    [-30, 0]
                  ],
                  i: [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0]
                  ],
                  o: [
                    [0, 0],
                    [0, 0],
                    [0, 0],
                    [0, 0]
                  ]
                }
              }
            },
            {
              ty: "fl",
              c: { a: 0, k: [0.941, 0.329, 0.329] },
              o: { a: 0, k: 100 },
              r: 1
            }
          ]
        }
      ]
    }
  ]
};

const successAnimationData = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 200,
  h: 200,
  nm: "Success Animation",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Check Mark",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] }
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ind: 0,
              ty: "sh",
              d: 1,
              ks: {
                a: 1,
                k: [
                  {
                    t: 0,
                    s: {
                      c: false,
                      v: [[-40, 0], [-40, 0], [0, 0]],
                      i: [[0, 0], [0, 0], [0, 0]],
                      o: [[0, 0], [0, 0], [0, 0]]
                    },
                    e: {
                      c: false,
                      v: [[-40, 0], [0, 40], [40, -40]],
                      i: [[0, 0], [0, 0], [0, 0]],
                      o: [[0, 0], [0, 0], [0, 0]]
                    }
                  },
                  { t: 30 }
                ]
              }
            },
            {
              ty: "st",
              c: { a: 0, k: [0.173, 0.784, 0.345] },
              o: { a: 0, k: 100 },
              w: { a: 0, k: 10 },
              lc: 2,
              lj: 2
            }
          ]
        }
      ]
    }
  ]
};

const Donation = () => {
  const { backendUrl, token, currencySymbol } = useContext(AppContext);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Donation form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    amount: 500, // Default amount
    message: ''
  });

  // Predefined donation amounts
  const donationAmounts = [100, 500, 1000, 2000, 5000];

  // Lottie animation options
  const donationAnimationOptions = {
    loop: true,
    autoplay: true,
    animationData: donationAnimationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  const successAnimationOptions = {
    loop: false,
    autoplay: true,
    animationData: successAnimationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  // Reset success state after showing animation
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle amount selection
  const handleAmountSelect = (amount) => {
    setFormData(prevState => ({
      ...prevState,
      amount
    }));
  };

  // Handle donation submission
  const handleDonation = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.name || !formData.email || !formData.amount) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);

      // Create order with Razorpay
      const orderData = {
        amount: formData.amount,
        currency: 'INR',
        receipt: `donation_${Date.now()}`,
        notes: {
          name: formData.name,
          email: formData.email,
          message: formData.message
        }
      };

      // Call backend to create order
      const response = await axios.post(`${backendUrl}/api/user/create-donation`, orderData, {
        headers: token ? { token } : {}
      });

      if (response.data.success) {
        initializeRazorpay(response.data.order);
      } else {
        toast.error(response.data.message || 'Failed to process donation');
      }
    } catch (error) {
      console.error('Donation error:', error);
      toast.error(error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Initialize Razorpay payment
  const initializeRazorpay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: 'Prescripto Donation',
      description: 'Support our healthcare mission',
      order_id: order.id,
      handler: async (response) => {
        try {
          // Verify payment with backend
          const verifyResponse = await axios.post(
            `${backendUrl}/api/user/verify-donation`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            },
            { headers: token ? { token } : {} }
          );

          if (verifyResponse.data.success) {
            setShowSuccess(true);
            toast.success('Thank you for your donation!');
            // Reset form
            setFormData({
              name: '',
              email: '',
              amount: 500,
              message: ''
            });
          } else {
            toast.error('Payment verification failed');
          }
        } catch (error) {
          console.error('Payment verification error:', error);
          toast.error('Payment verification failed');
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
  };

  // Generate QR code for donation using Razorpay
  const generateQRCode = async (orderId) => {
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/get-qr-code`,
        { orderId },
        { headers: token ? { token } : {} }
      );
      if (response.data.success) {
        setQrCode(response.data.qrCode);
      }
    } catch (error) {
      console.error('QR code generation error:', error);
      toast.error('Failed to generate QR code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Donate to Prescripto - Support Healthcare Innovation"
        description="Support Prescripto's mission to make healthcare accessible to all. Your donation helps us improve and expand our services."
        keywords="donate, healthcare donation, support healthcare, Prescripto donation"
        canonicalUrl="/donation"
      />

      {/* Success Animation Modal */}
      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
            <div className="w-64 h-64 mx-auto">
              <Lottie options={successAnimationOptions} />
            </div>
            <h3 className="text-2xl font-bold text-green-600 mt-4">Thank You!</h3>
            <p className="text-gray-600 mt-2">Your generous donation will help make healthcare accessible for all.</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="w-40 h-40 mx-auto mb-6">
          <Lottie options={donationAnimationOptions} />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Make a <span className="text-primary">Difference</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Your donation helps us make quality healthcare accessible to everyone
        </p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
        {/* Donation Form */}
        <div className="bg-white p-8 rounded-2xl shadow-xl md:col-span-3 border border-blue-100">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Make a Donation</h2>

          <form onSubmit={handleDonation} className="space-y-6">
            {/* Amount Selection */}
            <div>
              <label className="block text-gray-700 mb-3 font-medium">Select Amount*</label>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {donationAmounts.map(amount => (
                  <button
                    key={amount}
                    type="button"
                    className={`py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 ${formData.amount === amount
                      ? 'bg-primary text-white shadow-lg ring-2 ring-blue-300'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    onClick={() => handleAmountSelect(amount)}
                  >
                    {currencySymbol || '₹'}{amount.toLocaleString()}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 mb-2 text-sm font-medium">Custom Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    {currencySymbol || '₹'}
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    className="w-full p-3 pl-8 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    min="1"
                  />
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 font-medium">Your Name*</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Email Address*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  required
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2 font-medium">Message (Optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows="3"
                  placeholder="Share why you're supporting our cause..."
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-4 rounded-xl hover:bg-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                <>
                  <img src={assets.razorpay_logo} alt="Razorpay" className="h-5 mr-3" />
                  Donate Now
                </>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              Secured by Razorpay. Your transaction is 100% secure.
            </p>
          </form>
        </div>

        {/* Impact Card */}
        <div className="md:col-span-2">
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-100 h-full">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Your Impact</h3>

            <div className="space-y-4">
              <div className="flex items-start p-3 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0 bg-primary rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-primary">₹500</h4>
                  <p className="text-sm text-gray-600">Helps provide telemedicine access to 5 patients in remote areas</p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0 bg-primary rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-primary">₹1,000</h4>
                  <p className="text-sm text-gray-600">Supports development of new healthcare accessibility features</p>
                </div>
              </div>

              <div className="flex items-start p-3 bg-blue-50 rounded-xl">
                <div className="flex-shrink-0 bg-primary rounded-full p-2 mr-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <div>
                  <h4 className="font-medium text-primary">₹5,000</h4>
                  <p className="text-sm text-gray-600">Funds community health workshops and educational initiatives</p>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-semibold text-gray-800 mb-2">Our Promise</h4>
              <p className="text-sm text-gray-600">
                Every donation, regardless of size, makes a difference in our mission to revolutionize healthcare access in India. We guarantee 100% of your donation goes directly to our programs.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-center">
              <div className="flex space-x-4">
                {/* Cloudflare Trust Badge */}
                <div className="h-12 w-32 bg-white rounded flex items-center justify-center p-2">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Cloudflare_Logo.svg/2560px-Cloudflare_Logo.svg.png"
                    alt="Cloudflare"
                    className="h-8 object-contain"
                  />
                </div>

                {/* Norton Logo */}
                <div className="h-12 w-32 bg-white rounded flex items-center justify-center p-2">
                  <img
                    src="https://1000logos.net/wp-content/uploads/2021/12/Norton-Logo.png"
                    alt="Norton"
                    className="h-8 object-contain"
                  />
                </div>

                {/* TrustedSite Badge */}
                <div className="h-12 w-32 bg-white rounded flex items-center justify-center p-2">
                  <img
                    src="https://s3.amazonaws.com/integrated-apps/wprxednh/jawcrebq.png"
                    data-type="212"
                    data-width="120"
                    data-height="50"
                    alt="TrustedSite"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-6xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">What Our Donors Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <p className="text-gray-600 mb-4">"Donating to Prescripto was easy and I love knowing my contribution is making healthcare more accessible."</p>
            <div className="font-medium">- Priya S.</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <p className="text-gray-600 mb-4">"I donate monthly to support Prescripto's mission. Their transparency about how funds are used is impressive."</p>
            <div className="font-medium">- Rajesh M.</div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <div className="flex mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg key={star} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              ))}
            </div>
            <p className="text-gray-600 mb-4">"After seeing the impact Prescripto has in rural communities, donating was an easy decision. Their work is life-changing."</p>
            <div className="font-medium">- Anjali K.</div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto mt-16">
        <h2 className="text-2xl font-semibold mb-8 text-center text-gray-800">Frequently Asked Questions</h2>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <h3 className="font-medium text-lg text-gray-800 mb-2">Is my donation tax-deductible?</h3>
            <p className="text-gray-600">Yes, Prescripto is a registered non-profit organization, and all donations are eligible for tax deduction under Section 80G of the Income Tax Act.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <h3 className="font-medium text-lg text-gray-800 mb-2">How are donations used?</h3>
            <p className="text-gray-600">Your donations directly support our healthcare initiatives, technology development, community outreach programs, and operational costs to ensure sustainable impact.</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
            <h3 className="font-medium text-lg text-gray-800 mb-2">Can I make a recurring donation?</h3>
            <p className="text-gray-600">Yes, you can set up monthly, quarterly, or annual recurring donations through our payment gateway for sustained support.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donation;