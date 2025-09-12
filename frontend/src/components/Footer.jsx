import React, { useState } from 'react';
import { assets } from '../assets/assets';
import { Mail, Phone, Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(false);
  
  // Try to access environment variables safely with fallbacks
  const facebookUrl = import.meta.env.REACT_APP_FACEBOOK_URL || "https://facebook.com/satasiyakrish1";
  const twitterUrl = import.meta.env.REACT_APP_TWITTER_URL || "https://twitter.com/satasiyakrish1";
  const instagramUrl = import.meta.env.REACT_APP_INSTAGRAM_URL || "https://instagram.com/satasiyakrish1";
  const linkedinUrl = import.meta.env.REACT_APP_LINKEDIN_URL || "https://linkedin.com/in/satasiyakrish1";

  // Handle email input changes
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    setIsEmailValid(emailRegex.test(value));
    if (subscribeStatus) setSubscribeStatus('');
  };

  // Handle subscription form submission
  const handleSubscribe = (e) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!email || !emailRegex.test(email)) {
      setIsEmailValid(false);
      setSubscribeStatus('Please enter a valid email address');
      return;
    }
    // No network request; just show success and reset
    setSubscribeStatus('Thank you for subscribing!');
    setIsEmailValid(false);
    setEmail('');
  };

  return (
    <footer className="bg-gray-50">
      <div className="md:mx-10">
        {/* Main Footer Content */}
        <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
          {/* Company Info */}
          <div>
            <img className="mb-5 w-40" src={assets.logo} alt="Sanjivani AI Logo" />
            <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Sanjivani AI is an AI-powered herbal remedy finder that helps you discover natural 
            solutions for your health. By simply entering your symptoms, Sanjivani AI instantly suggests the best herbal and Ayurvedic remedies tailored to your needs.
            </p>
            {/* Social Media Icons */}

            <div className="flex space-x-4 mt-5">
              <a href={facebookUrl} className="text-gray-500 hover:text-blue-600 transition-colors duration-300">
                <Facebook size={18} />
              </a>
              <a href={twitterUrl} className="text-gray-500 hover:text-blue-400 transition-colors duration-300">
                <Twitter size={18} />
              </a>
              <a href={instagramUrl} className="text-gray-500 hover:text-pink-600 transition-colors duration-300">
                <Instagram size={18} />
              </a>
              <a href={linkedinUrl} className="text-gray-500 hover:text-blue-800 transition-colors duration-300">
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <p className="text-xl font-medium mb-5">COMPANY</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li><a href="/team" className="hover:text-gray-800">Our Team</a></li>
              <li><a href="/Privacy" className="hover:text-gray-800">Privacy policy</a></li>
              <li><a href="/faq" className="hover:text-gray-800">FAQ</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
            <ul className="flex flex-col gap-2 text-gray-600">
              <li className="flex items-center">
                <Phone size={16} className="mr-2" />
                <span>+91 90543 09266</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="mr-2" />
                <a href="mailto:sanjivni@gmail.com" className="hover:text-gray-800">sanjivni@gmail.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription - Fixed Alignment */}
        <div className="w-full border-t border-gray-200 pt-8 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-4 md:mb-0 text-sm">
              <h3 className="font-medium text-gray-800">Subscribe to our newsletter</h3>
              <p className="text-gray-600">Get the latest updates directly to your inbox</p>
            </div>
            <div className="w-full md:w-auto flex justify-center md:justify-end">
              <form onSubmit={handleSubscribe} className="flex w-full max-w-md">
                <input
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  className={`bg-blue-600 whitespace-nowrap text-white px-4 py-2 rounded-r-md transition-colors duration-300 text-sm ${
                    !isEmailValid ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                  }`}
                  disabled={!isEmailValid}
                >
                  Subscribe
                </button>
              </form>
            </div>
          </div>
          {/* Subscription Status Message */}
          {subscribeStatus && (
            <div className={`text-center mt-3 text-sm ${
              subscribeStatus.includes('Thank you') ? 'text-green-600' : 'text-red-500'
            }`}>
              {subscribeStatus}
            </div>
          )}
          {!subscribeStatus && email && (
            <div className={`text-center mt-3 text-sm ${isEmailValid ? 'text-green-600' : 'text-red-500'}`}>
              {isEmailValid ? 'Looks good!' : 'Please enter a valid email address'}
            </div>
          )}
        </div>

        {/* Copyright */}
        <div>
          <hr />
          <div className="flex flex-col sm:flex-row items-center justify-between py-5 text-sm">
            <p className="text-left w-full sm:w-auto">Copyright {currentYear} @Team Sanjivani AI - All Right Reserved.</p>
            <a href="/sitemap" className="mt-2 sm:mt-0 inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition">Site Map</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;