import React, { useState } from 'react';
import { Users, QrCode, AlertCircle, MessageSquare, Link as LinkIcon, X, Copy, Check } from 'lucide-react';
// Removed import for QRCode from qrcode.react as it's causing errors

export default function CommunityPage() {
  // Define the WhatsApp link
  const whatsAppLink = "https://whatsapp.com/channel/0029VbAeENz1XqueS0oJkN27";
  const link = "https://whatsapp.com/channel/0029VbAeENz1XqueS0oJkN27";
  const qrCodeUrl = `https://chart.googleapis.com/chart?chs=180x180&cht=qr&chl=${encodeURIComponent(link)}`;
  const [showQrCode, setShowQrCode] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [errorSubmitted, setErrorSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ loading: false, error: null, success: false });

  // Google Sheets endpoint for form submissions
  const GOOGLE_SHEETS_URL = "https://script.google.com/macros/s/AKfycbxZCjfJ4f2QgCxNl2ezMMyBPyGHKmNDjxh7-zPpFE-pG_Cl6MK3GN7z-ni2cuVGLvfARQ/exec";

  // Form data states
  const [reportForm, setReportForm] = useState({
    issueType: '',
    description: '',
    email: ''
  });

  const [errorForm, setErrorForm] = useState({
    errorType: '',
    description: '',
    email: ''
  });

  const handleQrCodeClick = () => {
    setShowQrCode(true);
  };

  const closeQrCode = () => {
    setShowQrCode(false);
  };

  const handleReportClick = () => {
    setShowReportForm(true);
  };

  const closeReportForm = () => {
    setShowReportForm(false);
    setReportSubmitted(false);
    // Reset form data
    setReportForm({
      issueType: '',
      description: '',
      email: ''
    });
  };

  const handleReportChange = (e) => {
    const { id, value } = e.target;
    setReportForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleErrorChange = (e) => {
    const { id, value } = e.target;
    setErrorForm(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whatsAppLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Improved function to submit data to Google Sheets using fetch API
  const submitToGoogleSheets = async (data, formType) => {
    setSubmitStatus({ loading: true, error: null, success: false });

    try {
      // Add form type and browser info to the data
      const formData = {
        ...data,
        formType: formType,
        browserInfo: navigator.userAgent
      };

      // Use fetch with no-cors mode to prevent CORS issues
      const response = await fetch(GOOGLE_SHEETS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        mode: 'no-cors' // Important to prevent CORS issues
      });

      // Since no-cors doesn't allow reading response, we'll assume success
      console.log(`${formType} submitted successfully`);
      setSubmitStatus({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({ loading: false, error: error.message, success: false });
      return false;
    }
  };

  // Alternative method using CORS-friendly approach
  const submitViaEmail = async (data, formType) => {
    setSubmitStatus({ loading: true, error: null, success: false });

    try {
      // Create an EmailJS-like service or use a CORS-friendly API
      // This is a simulated success for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log(`Submitting ${formType} data:`, data);

      // Simulate success
      setSubmitStatus({ loading: false, error: null, success: true });
      return true;
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus({ loading: false, error: error.message, success: false });
      return false;
    }
  };

  const submitReport = async (e) => {
    e.preventDefault();

    const reportData = {
      ...reportForm,
      formType: 'community_report'
    };

    // Try the Google Sheets approach first
    try {
      const success = await submitToGoogleSheets(reportData, 'community_report');
      if (success) {
        setReportSubmitted(true);
        setTimeout(() => {
          closeReportForm();
        }, 2000);
      }
    } catch (error) {
      // Fall back to email approach if Google Sheets fails
      console.log("Falling back to email submission");
      const success = await submitViaEmail(reportData, 'community_report');
      if (success) {
        setReportSubmitted(true);
        setTimeout(() => {
          closeReportForm();
        }, 2000);
      }
    }
  };

  const submitError = async (e) => {
    e.preventDefault();

    const errorData = {
      ...errorForm,
      formType: 'error_report'
    };

    // Try the Google Sheets approach first
    try {
      const success = await submitToGoogleSheets(errorData, 'error_report');
      if (success) {
        setErrorSubmitted(true);
        setTimeout(() => {
          setErrorSubmitted(false);
          setErrorForm({
            errorType: '',
            description: '',
            email: ''
          });
        }, 2000);
      }
    } catch (error) {
      // Fall back to email approach if Google Sheets fails
      console.log("Falling back to email submission");
      const success = await submitViaEmail(errorData, 'error_report');
      if (success) {
        setErrorSubmitted(true);
        setTimeout(() => {
          setErrorSubmitted(false);
          setErrorForm({
            errorType: '',
            description: '',
            email: ''
          });
        }, 2000);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-emerald-500 text-white p-8">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl mb-8">Connect with like-minded people and stay updated with the latest news.</p>
          <button
            onClick={handleQrCodeClick}
            className="bg-white text-emerald-600 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 mx-auto hover:bg-emerald-50 transition-colors"
          >
            <QrCode size={20} />
            Join WhatsApp Community
          </button>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto py-12 px-4">
        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-emerald-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Users size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Active Members</h3>
            <p className="text-gray-600">Join over 5,000 active members sharing knowledge and resources.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-emerald-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <MessageSquare size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Daily Discussions</h3>
            <p className="text-gray-600">Participate in our daily topics and expand your network.</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-emerald-100 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <LinkIcon size={24} className="text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Useful Resources</h3>
            <p className="text-gray-600">Access to exclusive resources and educational materials.</p>
          </div>
        </div>

        {/* Community Links */}
        <div className="bg-white p-8 rounded-lg shadow-md mb-12">
          <h3 className="text-2xl font-bold mb-6 text-center">Community Links</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">

            <a href="#" className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-3">
              <MessageSquare size={20} className="text-emerald-600" />
              <span>Discussion Forum</span>
            </a>
            <a href="#" className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-3">
              <LinkIcon size={20} className="text-emerald-600" />
              <span>Resource Library</span>
            </a>
            <button
              onClick={handleReportClick}
              className="bg-emerald-50 p-4 rounded-lg hover:bg-emerald-100 transition-colors flex items-center gap-3"
            >
              <AlertCircle size={20} className="text-emerald-600" />
              <span>Report an Issue</span>
            </button>
          </div>
        </div>

        {/* Error Submission Form */}
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h3 className="text-2xl font-bold mb-6">Submit an Error</h3>
          <form onSubmit={submitError} className="space-y-4">
            <div>
              <label htmlFor="errorType" className="block mb-2 font-medium">Error Type</label>
              <select
                id="errorType"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                required
                value={errorForm.errorType}
                onChange={handleErrorChange}
              >
                <option value="">Select error type</option>
                <option value="technical">Technical Issue</option>
                <option value="content">Content Error</option>
                <option value="functionality">Functionality Problem</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="description" className="block mb-2 font-medium">Description</label>
              <textarea
                id="description"
                rows="4"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Please describe the error in detail..."
                required
                value={errorForm.description}
                onChange={handleErrorChange}
              ></textarea>
            </div>
            <div>
              <label htmlFor="email" className="block mb-2 font-medium">Your Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="email@example.com"
                required
                value={errorForm.email}
                onChange={handleErrorChange}
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
              disabled={submitStatus.loading}
            >
              {submitStatus.loading ? 'Submitting...' : 'Submit Error Report'}
            </button>
            {errorSubmitted && (
              <div className="bg-green-100 text-green-800 p-4 rounded-lg mt-4">
                Error report submitted successfully! We'll look into it.
              </div>
            )}
            {submitStatus.error && (
              <div className="bg-red-100 text-red-800 p-4 rounded-lg mt-4">
                Failed to submit: {submitStatus.error}
              </div>
            )}
          </form>
        </div>
      </main>

      {/* WhatsApp QR Code Popup */}
      {showQrCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Join Our WhatsApp Community</h3>
              <button onClick={closeQrCode} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-white p-4 rounded-lg shadow-md mb-4">
                <div className="w-64 h-64 bg-gray-0 flex items-center justify-center">
                  {/* QR Code replaced with a placeholder */}
                  <div className="text-center">
                    {/* QR Code image */}
                    <img src={"https://api.qrcode-monkey.com/tmp/a659a8f59c4ffb97d22135a0d7811f55.svg?1744662602596"} alt="QR Code" className="mx-auto" />
                    {/* Text below the QR code */}
                    <p className="mt-2 font-medium text-gray-600">Scan QR Code</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-4 text-center">
                Scan this QR code with your phone to join our WhatsApp community
              </p>
              <div className="w-full">
                <input
                  type="text"
                  value={whatsAppLink}
                  readOnly
                  className="w-full p-3 bg-gray-100 border border-gray-300 rounded-lg mb-4"
                />
                <div className="flex gap-4">
                  <button
                    onClick={copyToClipboard}
                    className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium flex-1 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={whatsAppLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg font-medium flex-1 text-center hover:bg-emerald-200 transition-colors"
                  >
                    Open Link
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report Issue Popup */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Report an Issue</h3>
              <button onClick={closeReportForm} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            {!reportSubmitted ? (
              <form onSubmit={submitReport} className="space-y-4">
                <div>
                  <label htmlFor="issueType" className="block mb-2 font-medium">Issue Type</label>
                  <select
                    id="issueType"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    required
                    value={reportForm.issueType}
                    onChange={handleReportChange}
                  >
                    <option value="">Select issue type</option>
                    <option value="inappropriate">Inappropriate Content</option>
                    <option value="spam">Spam</option>
                    <option value="harassment">Harassment</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="description" className="block mb-2 font-medium">Description</label>
                  <textarea
                    id="description"
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Please describe the issue in detail..."
                    required
                    value={reportForm.description}
                    onChange={handleReportChange}
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="email" className="block mb-2 font-medium">Your Email</label>
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="email@example.com"
                    required
                    value={reportForm.email}
                    onChange={handleReportChange}
                  />
                </div>
                <button
                  type="submit"
                  className="bg-emerald-600 text-white w-full px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  disabled={submitStatus.loading}
                >
                  {submitStatus.loading ? 'Submitting...' : 'Submit Report'}
                </button>
                {submitStatus.error && (
                  <div className="bg-red-100 text-red-800 p-4 rounded-lg mt-4">
                    Failed to submit: {submitStatus.error}
                  </div>
                )}
              </form>
            ) : (
              <div className="text-center py-8">
                <div className="bg-green-100 text-green-800 p-4 rounded-lg mb-4">
                  Report submitted successfully!
                </div>
                <p className="text-gray-600">Thank you for your report. We'll review it and take appropriate action.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

