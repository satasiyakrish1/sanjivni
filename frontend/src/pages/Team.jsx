import React from 'react'
import { assets } from '../assets/assets'
import about_image from '../assets/about_image.png'
import SEO from '../components/SEO'

const Team = () => {
  // Team members data - keeping original data unchanged
  const founders = [
    {
      name: 'Krish Satasiya',
      role: 'Founder & CEO',
      bio: 'Visionary healthcare technologist with a passion for making healthcare accessible to all. Founded Prescripto to bridge the gap between patients and healthcare providers.',
      image: about_image
    },
    {
      name: 'Dhruv Panchal',
      role: 'Co-Founder & CMO',
      bio: 'Passionate about transforming healthcare accessibility, driving innovative marketing strategies that amplify Priscripto’s impact and reach within the medical ecosystem.',
      image: assets.dhruv
    }
  ]

  const teamMembers = [
    {
      name: 'Neha Satasiya',
      role: 'Chief Technology Officer',
      bio: 'Tech innovator with expertise in healthcare software development. Oversees the technical architecture and implementation of Prescripto\'s platform.',
      image: assets.doc3
    },
    {
      name: 'Drx. Vaibhav Satasiya',
      role: 'Head of Product',
      bio: 'Product strategist focused on creating intuitive healthcare solutions. Leads the product roadmap and user experience design at Prescripto.',
      image: assets.doc4
    },
    {
      name: 'Dr. Vikram Singh',
      role: 'Medical Advisor',
      bio: 'Specialist in digital health integration. Provides clinical guidance to ensure Prescripto meets the highest standards of medical care.',
      image: assets.doc5
    },
    {
      name: 'Divya Prajapati',
      role: 'Head of Operations',
      bio: 'Operations expert with a background in healthcare management. Ensures smooth day-to-day functioning of all Prescripto services.',
      image: assets.doc6
    }
  ]

  // Journey milestones - keeping original data unchanged
  const journeyMilestones = [
    {
      year: '2024',
      title: 'API & Service Marketplace',
      description: 'Launched the API Marketplace to enable third-party developers to build on the Prescripto platform, fostering innovation in healthcare technology solutions.'
    },
    {
      year: '2025',
      title: 'Looking Forward',
      description: 'Prescripto continues to evolve with a focus on AI-driven healthcare solutions, telemedicine advancements, and expanding access to underserved communities across India.'
    }
  ]

  return (
    <div className="px-4 sm:px-6">
      <SEO 
        title="Our Team & Journey - Prescripto"
        description="Meet the founders and team behind Prescripto and learn about our journey to revolutionize healthcare access in India."
        keywords="Prescripto team, healthcare founders, medical technology team, healthcare journey, health tech startup"
        canonicalUrl="/team"
      />

      {/* Header Section */}
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Our Team & Journey
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Meet the dedicated professionals behind Prescripto and learn about our mission to transform healthcare accessibility in India.
        </p>
      </div>

      {/* Founders Section */}
      <div className="mb-16 bg-white py-10 rounded-lg shadow-sm">
        <div className="text-center text-2xl mb-8 text-[#707070]">
          <p>OUR <span className="text-gray-700 font-semibold">FOUNDERS</span></p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto px-4">
          {founders.map((founder, index) => (
            <div key={index} className="flex flex-col items-center bg-white border border-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              <img 
                src={founder.image} 
                alt={founder.name} 
                className="w-40 h-40 rounded-full object-cover mb-6 border-4 border-gray-50 shadow-md"
              />
              <h3 className="text-xl font-semibold text-gray-800">{founder.name}</h3>
              <p className="text-primary font-medium mb-3">{founder.role}</p>
              <p className="text-gray-600 text-center">{founder.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Team Members Section */}
      <div className="mb-16">
        <div className="text-center text-2xl mb-8 text-[#707070]">
          <p>OUR <span className="text-gray-700 font-semibold">TEAM</span></p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {teamMembers.map((member, index) => (
            <div key={index} className="flex flex-col items-center bg-white border border-gray-100 p-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300">
              
              <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
              <p className="text-primary font-medium mb-2 text-sm">{member.role}</p>
              <p className="text-gray-600 text-center text-sm">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Journey Section */}
      <div className="mb-16 bg-white py-10 rounded-lg shadow-sm">
        <div className="text-center text-2xl mb-8 text-[#707070]">
          <p>OUR <span className="text-gray-700 font-semibold">JOURNEY</span></p>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-primary"></div>
          
          {/* Timeline items */}
          {journeyMilestones.map((milestone, index) => (
            <div key={index} className={`relative flex flex-col md:flex-row md:items-center mb-16 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              {/* Year bubble */}
              <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center z-10 shadow-md">
                <span className="font-bold">{milestone.year.slice(-2)}</span>
              </div>
              
              {/* Content */}
              <div className={`ml-20 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                <div className="bg-white border border-gray-100 p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{milestone.year} - {milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vision for the Future */}
      <div className="mb-16 bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-lg max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Our Vision for the Future</h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto">
          At Prescripto, we envision a future where quality healthcare is accessible to everyone, regardless of location or socioeconomic status. We are committed to leveraging technology to create innovative solutions that address the unique challenges of healthcare delivery in India and beyond. Our journey continues as we work towards building a healthier, more connected world.
        </p>
      </div>

      {/* Partners and Clients Section */}
      <div className="mb-16 bg-white py-10 rounded-lg shadow-sm">
        <div className="text-center text-2xl mb-8 text-[#707070]">
          <p>OUR <span className="text-gray-700 font-semibold">PARTNERS & CLIENTS</span></p>
        </div>

        <div className="mb-8">
          <p className="text-gray-600 text-center max-w-3xl mx-auto mb-10">
            We're proud to collaborate with leading hospitals and healthcare institutions that share our vision of improving healthcare accessibility and quality.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto px-4">
            {/* Hospital Partners - keeping original content */}
            <div className="flex flex-col items-center bg-white border border-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <img src={assets.hospital1} alt="City Hospital" className="w-32 h-32 object-contain mb-3" />
              <p className="text-primary font-medium text-sm">ExploitXplorers</p>
            </div>
            
            <div className="flex flex-col items-center bg-white border border-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <img src={assets.hospital2} alt="BOX Crafts Pvt. Ltd." className="w-32 h-32 object-contain mb-3" />
              <p className="text-primary font-medium text-sm">BOXCrafts Pvt. Ltd.</p>
            </div>
            
            <div className="flex flex-col items-center bg-white border border-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <img src={assets.hospital3} alt="Shiv Medic" className="w-32 h-32 object-contain mb-3" />
              <p className="text-primary font-medium text-sm">Shiv Medico</p>
            </div>
            
            <div className="flex flex-col items-center bg-white border border-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <img src={assets.hospital4} alt="Satyam Medical" className="w-32 h-32 object-contain mb-3" />
              <p className="text-primary font-medium text-sm">Satyam Medical's</p>
            </div>
            
            <div className="flex flex-col items-center bg-white border border-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <img src={assets.hospital5} alt="Sundaram Clinic" className="w-32 h-32 object-contain mb-3" />
              <p className="text-primary font-medium text-sm">Sundaram Clinic</p>
            </div>
            
            <div className="flex flex-col items-center bg-white border border-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300">
              <img src={assets.hospital6} alt="Shivam Laboratoires" className="w-32 h-32 object-contain mb-3" />
              <p className="text-primary font-medium text-sm">Shivam MediLabs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Team