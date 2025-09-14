import React from 'react'
import { assets } from '../assets/assets'
import SEO from '../components/SEO'
import { Shield, Check, Heart, Calendar, Clock, Users } from 'lucide-react'

const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="About Sanjivni AI – AI-Powered Herbal Remedy Finder"
        description="Learn about Sanjivni, the AI-powered platform that blends Ayurvedic wisdom with modern AI to suggest safe, effective herbal remedies tailored to your symptoms."
        keywords="about sanjivni, herbal remedies, ayurveda, ai health, natural remedies, symptom checker"
        canonicalUrl="/about"
      />

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800">About <span className="text-primary">Sanjivni</span></h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          Transforming healthcare access through technology since 2025
        </p>
      </div>

      {/* Mission & Vision */}
      <div className="flex flex-col lg:flex-row gap-12 mb-20">
        <div className="lg:w-1/2">
          <img
            className="w-full rounded-lg shadow-lg"
            src="https://media.istockphoto.com/id/2029713341/photo/kr%C3%A4uter-der-provence.jpg?s=612x612&w=0&k=20&c=mwmHgtbnlXr3ZsFP2OKHMGrbPDIT-EJlRqUZB6d3SOc="
            alt="Sanjivni AI Platform"
          />
        </div>
        <div className="lg:w-1/2 flex flex-col justify-center gap-6">
          <h2 className="text-3xl font-bold text-gray-800">Our Mission</h2>
          <p className="text-gray-600">
            Welcome to Sanjivni, your companion for discovering safe, effective herbal and Ayurvedic remedies. We combine traditional wisdom with modern AI to guide your everyday wellness decisions.Our mission is to simplify healthcare access for everyone. By connecting patients with qualified healthcare providers through our intuitive platform, we're removing barriers to quality care and empowering individuals to take control of their health journey.
          </p>

          <h2 className="text-3xl font-bold text-gray-800 mt-6">Our Vision</h2>
          <p className="text-gray-600">
            Our vision with Sanjivni AI is to make natural wellness accessible, understandable, and personalized for everyone.
          </p>
          
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Why Choose Sanjivni</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <Calendar className="text-primary mr-2" size={24} />
              <h3 className="font-bold text-xl text-gray-800">Efficiency</h3>
            </div>
            <p className="text-gray-600">
              Streamlined appointment scheduling that fits into your busy lifestyle with smart reminders and calendar integration.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <Users className="text-primary mr-2" size={24} />
              <h3 className="font-bold text-xl text-gray-800">Convenience</h3>
            </div>
            <p className="text-gray-600">
              Access to a network of over 5,000 trusted healthcare professionals across all specialties in your area.
            </p>
          </div>

          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300">
            <div className="flex items-center mb-4">
              <Heart className="text-primary mr-2" size={24} />
              <h3 className="font-bold text-xl text-gray-800">Personalization</h3>
            </div>
            <p className="text-gray-600">
              Tailored recommendations and reminders to help you stay on top of your health with AI-powered insights.
            </p>
          </div>
        </div>
      </div>

     

      {/* Security Information */}
      <div className="mb-20 bg-gradient-to-r from-blue-50 to-teal-50 p-8 rounded-lg">
        <div className="flex items-center mb-6">
          <Shield className="text-primary mr-3" size={32} />
          <h2 className="text-3xl font-bold text-gray-800">Security & Privacy</h2>
        </div>
        <p className="text-gray-600 mb-6">
          At Sanjivni, we take your privacy and data security seriously. Our platform is built with multiple layers of protection to ensure your health information remains confidential and secure.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Data Protection</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-primary mt-1 mr-2 flex-shrink-0" size={16} />
                <span className="text-gray-600">Cloudflare-protected infrastructure and encrypted transmission</span>
              </li>
              <li className="flex items-start">
                <Check className="text-primary mt-1 mr-2 flex-shrink-0" size={16} />
                <span className="text-gray-600">End-to-end encryption for all communications</span>
              </li>
              <li className="flex items-start">
                <Check className="text-primary mt-1 mr-2 flex-shrink-0" size={16} />
                <span className="text-gray-600">Regular security reviews and penetration testing</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Privacy Controls</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <Check className="text-primary mt-1 mr-2 flex-shrink-0" size={16} />
                <span className="text-gray-600">Granular access permissions for your data</span>
              </li>
              
              <li className="flex items-start">
                <Check className="text-primary mt-1 mr-2 flex-shrink-0" size={16} />
                <span className="text-gray-600">Detailed audit logs and data export controls</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Version Information */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-8">Platform Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Current Version</h3>
            <p className="text-gray-600 mb-2">Sanjivni Platform: v1.0</p>
            <p className="text-gray-600 mb-2">Mobile App: coming soon</p>
            <p className="text-gray-600 mb-2">Provider Portal: v0.9</p>
            <p className="text-gray-500 text-sm mt-4">Last Updated: September 2025</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Coverage</h3>
            <p className="text-gray-600 mb-2">Available across India (pilot regions active)</p>
            <p className="text-gray-600 mb-2">Partnering with Ayurvedic practitioners and clinics</p>
            <p className="text-gray-600 mb-2">Growing network of verified experts</p>
            <p className="text-gray-600 mb-2">Serving early adopters and communities</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-3">Security</h3>
            <p className="text-gray-600 mb-2">End-to-end encryption</p>
            <p className="text-gray-600 mb-2">Role-based access control</p>
            <p className="text-gray-600 mb-2">Security reviews each release</p>
            <p className="text-gray-600 mb-2">Data minimization and anonymization</p>
          </div>
        </div>
      </div>

      

      {/* Contact Information */}
      <div className="bg-gray-50 p-8 rounded-lg text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Get in Touch</h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Have questions about Sanjivni? Our team is here to help you navigate your healthcare journey.
        </p>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <a href="/Contact">
            <button className="bg-primary text-white py-3 px-6 rounded-lg hover:bg-primary-dark transition-colors duration-300">
              Contact Support
            </button>
          </a>

          <a href="mailto:sanjivni@gmail.com">
            <button className="bg-white text-primary border border-primary py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-300">
              Schedule a Demo
            </button>
          </a>
        </div>
      </div>
    </div>
  )
}

export default About