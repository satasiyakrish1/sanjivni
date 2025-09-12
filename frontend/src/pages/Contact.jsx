import React, { useState } from 'react'
import { assets } from '../assets/assets'
import SEO from '../components/SEO'
import { MapPin, Phone, Mail, Users, Clock, MessageCircle, CheckCircle } from 'lucide-react'

const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })

  // Define the email address for the form directly
  // Replace "your-actual-email@example.com" with your actual email address
  const contactEmail = import.meta.env.VITE_CONTACT_EMAIL;


  // Handle form input changes
  const handleChange = (e) => {
    const { id, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }))
  }

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault()
    // Form is being submitted by the formsubmit.co service
    // but we'll show the success message immediately for demonstration
    setFormSubmitted(true)

    // Reset form after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false)
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      })
    }, 5000)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <SEO
        title="Contact Sanjivani - Get in Touch With Our Team"
        description="Have questions or need assistance? Contact the Sanjivani team for support with herbal remedies, appointments, medicines, or any other needs."
        keywords="contact prescripto, healthcare support, customer service, help, contact us, healthcare assistance"
        canonicalUrl="/contact"
      />

      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-800">Contact <span className="text-primary">Sanjivni</span></h1>
        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
          We're here to help with all your healthcare needs
        </p>
      </div>

      {/* Contact Information and Form */}
      <div className="flex flex-col lg:flex-row gap-12 mb-20">
        {/* Left Column - Image and Contact Info */}
        <div className="lg:w-1/2">
          <div className="rounded-lg overflow-hidden shadow-lg mb-10">
            <img
              className="w-full"
              src={assets.about}
              alt="Sanjivani Contact Support"
            />
          </div>

          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Get In Touch</h2>

            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-700">Our Headquarters</h3>
                  <p className="text-gray-600 mt-1">
                    Ahmedabad, Gujarat 380015<br />
                    India
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Phone className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-700">Phone</h3>
                  <p className="text-gray-600 mt-1">
                    Support: +91 90543 09266<br />
                    Customer Service: +91 90543 09266
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Mail className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-700">Email</h3>
                  <p className="text-gray-600 mt-1">
                    General Inquiries: info@sanjivani.com<br />
                    Support: support@sanjivani.com<br />
                    Careers: careers@sanjivani.com
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="text-primary mt-1 mr-3 flex-shrink-0" size={20} />
                <div>
                  <h3 className="font-semibold text-gray-700">Hours of Operation</h3>
                  <p className="text-gray-600 mt-1">
                    Customer Support: 24/7<br />
                    Office Hours: Monday - Friday, 9:00 AM - 6:00 PM IST
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Contact Form */}
        <div className="lg:w-1/2">
          <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h2>

            {formSubmitted ? (
              <div className="bg-green-50 p-6 rounded-lg border border-green-100 text-center">
                <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
                <h3 className="text-xl font-bold text-green-700 mb-2">Message Sent Successfully!</h3>
                <p className="text-green-600">
                  Thank you for contacting Sanjivni. Our team will get back to you shortly.
                </p>
              </div>
            ) : (
              <form
                action={`https://formsubmit.co/${contactEmail}`}
                method="POST"
                className="space-y-6"
                onSubmit={handleSubmit}
              >
                {/* FormSubmit Configuration */}
                <input type="hidden" name="_subject" value="New Sanjivani Contact Form Submission" />
                <input type="hidden" name="_captcha" value="false" />
                <input type="hidden" name="_next" value="https://yourwebsite.com/thank-you" />
                <input type="text" name="_honey" style={{ display: 'none' }} />

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Your name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Your phone number"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="support">Technical Support</option>
                    <option value="appointment">Appointment Issues</option>
                    <option value="billing">Billing Inquiries</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="6"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-dark transition-colors duration-300"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Career Section */}
      <div className="mb-20">
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-8 rounded-lg">
          <div className="flex items-center mb-6">
            <Users className="text-primary mr-3" size={32} />
            <h2 className="text-3xl font-bold text-gray-800">Careers at Prescripto</h2>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-2/3">
              <p className="text-gray-600 mb-6">
                Join our team of innovators who are passionate about transforming healthcare through technology. At Prescripto, we're building solutions that make healthcare more accessible, efficient, and personalized for everyone.
              </p>
              <p className="text-gray-600 mb-6">
                We offer competitive benefits, a flexible work environment, and opportunities for professional growth. If you're excited about making a difference in healthcare, we'd love to hear from you.
              </p>
              <div className="mt-8">
                <button className="bg-white text-primary border border-primary font-medium py-3 px-8 rounded-md hover:bg-gray-50 transition-colors duration-300">
                  Explore Job Openings
                </button>
              </div>
            </div>

            <div className="md:w-1/3 bg-white p-6 rounded-lg shadow-md">
              <h3 className="font-bold text-xl text-gray-800 mb-4">Current Openings</h3>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-gray-600">Senior Full Stack Developer</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-gray-600">UX/UI Designer</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-gray-600">Healthcare Data Analyst</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-gray-600">Product Manager</span>
                </li>
                <li className="flex items-center">
                  <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                  <span className="text-gray-600">Customer Success Specialist</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">Frequently Asked Questions</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-3">How quickly can I get a response?</h3>
            <p className="text-gray-600">
              We aim to respond to all inquiries within 24 hours. For urgent matters, please call our support line for immediate assistance.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-3">I'm having trouble with the app. Where can I get help?</h3>
            <p className="text-gray-600">
              For technical support, please email support@prescripto.com or use the form above. Be sure to include details about your device and the issue you're experiencing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-3">How do I change or cancel my appointment?</h3>
            <p className="text-gray-600">
              You can manage your appointments directly through the Prescripto app or website. If you need assistance, contact our support team.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <h3 className="font-bold text-lg text-gray-800 mb-3">Do you have partnership opportunities?</h3>
            <p className="text-gray-600">
              Yes! We're always looking to collaborate with healthcare providers and organizations. Please email partnerships@prescripto.com to discuss potential opportunities.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contact