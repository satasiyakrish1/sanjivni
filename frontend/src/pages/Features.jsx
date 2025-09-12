import React from 'react';
import { Link } from 'react-router-dom';

const Features = () => {
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }} className="flex flex-col items-center">
            {/* Header for More Features */}
            <header className='text-xl my-4'>
                <p>MORE <span className='text-gray-700 font-semibold'>FEATURES</span></p>
            </header>

            {/* MORE FEATURES ROW */}
            <div className='w-full max-w-[1200px] mb-20'>
                <div className='flex flex-col md:flex-row'>
                    <div className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>EFFICIENCY</b>
                        <p>Streamlined appointment scheduling tailored to your routine.</p>
                    </div>
                    <div className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>CONVENIENCE</b>
                        <p>Find and connect with trusted doctors near you in seconds.</p>
                    </div>
                    <div className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>PERSONALIZATION</b>
                        <p>Smart health tips, reminders, and tailored insights—just for you.</p>
                    </div>
                </div>
                <div className='flex flex-col md:flex-row'>
                    <Link to="/medical-data-dashboard" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>MDS (Medical Dashboard System)</b>
                        <p>Upload and manage your medical records in one secure, easy-to-use dashboard.</p>
                    </Link>
                    <Link to="#" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>HIRIX</b>
                        <p>Smart Hiring Dashboard for Hospital Staff and Medical Professionals.</p>
                    </Link>
                </div>
            </div>

            {/* Header for More TOOLS */}
            <header className='text-xl my-4'>
                <p>FREE <span className='text-gray-700 font-semibold'>TOOLS</span></p>
            </header>

            {/* MORE TOOLS ROW 1 */}
            <div className='w-full max-w-[1200px] mb-10'>
                <div className='flex flex-col md:flex-row'>
                    <Link to="/bmi-calculator" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>BMI CALCULATOR</b>
                        <p>Quickly assess your body fat level using your height and weight.</p>
                    </Link>
                    <Link to="/menstrual-period-calculator" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>PERIOD CYCLE TRACKER</b>
                        <p>Predict your next period and ovulation days with accuracy.</p>
                    </Link>
                    <Link to="/eye-test" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>EYE TEST TOOL</b>
                        <p>Check your vision with a quick and easy online eye test.</p>
                    </Link>
                </div>
                <div className='flex flex-col md:flex-row'>
                    <Link to="/pace-calculator" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>PACE CALCULATOR</b>
                        <p>Calculate your pace, time, or distance for running, walking, or biking.</p>
                    </Link>
                    <Link to="/bac-calculator" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>BAC CALCULATOR</b>
                        <p>Estimate blood alcohol concentration and check legal driving limits.</p>
                    </Link>
                    <Link to="/bmr-calculator" className='border w-full md:w-1/3 px-10 md:px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>BMR CALCULATOR</b>
                        <p>Calculate your Basal Metabolic Rate for better health management.</p>
                    </Link>
                </div>
            </div>

            {/* Header for WHY CHOOSE US */}
            <header className='text-xl my-4'>
                <p>WHY <span className='text-gray-700 font-semibold'>CHOOSE US</span></p>
            </header>

            {/* WHY CHOOSE US - ROW 1 */}
            <div className='w-full max-w-[1200px]'>
                <div className='flex flex-col md:flex-row'>
                    <div className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>VIRTUAL FOLLOW-UP</b>
                        <p>Quickly consult with doctors online for follow-ups, no full appointment needed.</p>
                    </div>
                    <Link to="/medical-data-dashboard" className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>MEDICAL ANALYTICS</b>
                        <p>Comprehensive dashboard for analyzing and visualizing your medical data.</p>
                    </Link>
                    <Link to="http://cloud-prescripto.vercel.app" target="_blank" rel="noopener noreferrer" className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>HEALTH RECORD VAULT</b>
                        <p>Securely store & share prescriptions, reports, and health data.</p>
                    </Link>
                </div>
            </div>

            {/* WHY CHOOSE US - ROW 2 */}
            <div className='w-full max-w-[1200px]'>
                <div className='flex flex-col md:flex-row'>
                    <div className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>MEDICAL INFO</b>
                        <p>View all medical history, reports, and diagnosis details in one place.</p>
                    </div>
                    <div className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>GOOGLE FIT INTEGRATION</b>
                        <p>Sync your fitness data directly with your health profile using Google Fit API.</p>
                    </div>
                    <div className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>BOOKING SYSTEM</b>
                        <p>Book appointments with doctors or schedule follow-ups in just a few clicks.</p>
                    </div>
                </div>
            </div>

            {/* WHY CHOOSE US - ROW 3 */}
            <div className='w-full max-w-[1200px]'>
                <div className='flex flex-col md:flex-row'>
                    <div className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>WEBINAR ACCESS</b>
                        <p>Join live health webinars and stay informed by healthcare experts.</p>
                    </div>
                    <div className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>RXMEET</b>
                        <p>Conduct virtual meetings or video consultations with your doctor directly on the platform.</p>
                    </div>
                    <Link to="/write-prescription" className='border w-full md:w-1/3 px-10 py-10 flex flex-col gap-5 text-[15px] hover:bg-primary hover:text-white transition-all duration-300 text-gray-600 cursor-pointer'>
                        <b>PRESCRIPTION MAKING</b>
                        <p>Doctors can create, update, and share prescriptions in real-time.</p>
                    </Link>
                </div>
                {/* Call to Action */}
                <div className="w-full max-w-6xl mt-8 bg-primary bg-opacity-10 rounded-lg p-8 text-center">
                    <h2 className="text-2xl font-bold mb-3">Join Our Growing Community</h2>
                    <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                        Connect with healthcare professionals, share knowledge, and stay updated with the latest in healthcare technology and practices.
                    </p>
                    <Link to="/Community" className="bg-primary text-white px-8 py-3 rounded-md hover:bg-opacity-90 transition-all font-medium">
                        Visit Now
                    </Link>
                </div>
            </div>

        </div>
    );
};

export default Features;
