import React from 'react'
import { assets } from '../assets/assets'
import about_image from '../assets/about_image.png'
import SEO from '../components/SEO'

const Team = () => {
  // Team members data - keeping original data unchanged
  const founders = [
    {
      name: 'Kavita Giri',
      role: 'Team Leader',
      bio: 'Visionary health technologist passionate about natural wellness. Founded Sanjivani AI to bridge the gap between people and trusted herbal guidance.',
      image: "/Kavita.jpg"
    },
    {
      name: 'Vardhana Trivedi',
      role: 'Member',
      bio: 'Passionate about transforming healthcare accessibility, driving innovative marketing strategies that amplify Priscripto’s impact and reach within the medical ecosystem.',
      image: "/Vardhana.jpg"
    }
  ]

  const teamMembers = [
    {
      name: 'Neha Satasiya',
      role: 'Chief Technology Officer',
      bio: 'Tech innovator with expertise in health software. Oversees the technical architecture and implementation of Sanjivni\'s platform.',
      image: assets.profile_pic
    },
    {
      name: 'Drx. Vaibhav Satasiya',
      role: 'Head of Product',
      bio: 'Product strategist focused on intuitive natural wellness solutions. Leads the product roadmap and user experience design at Sanjivni.',
      image: assets.profile_pic
    },
    {
      name: 'Dr. Vikram Singh',
      role: 'Medical Advisor',
      bio: 'Specialist in integrative health. Provides guidance to ensure Sanjivani AI meets high standards of safety and reliability.',
      image: assets.profile_pic
    },
    {
      name: 'Divya Prajapati',
      role: 'Head of Operations',
      bio: 'Operations expert with a background in health operations. Ensures smooth day-to-day functioning of all Sanjivani AI services.',
      image: assets.profile_pic
    }
  ]

  // Sanjivni Project AI-Integrated Timeline
  const journeyMilestones = [
    {
      date: 'Sept 11',
      title: 'Project Kickoff & Setup',
      description: 'Finalized problem statement: "Symptom to Herbal Remedy AI Assistant". Created GitHub repo (frontend + backend). Set up Google Gemini + OpenAI API keys. AI Task: Used OpenAI to generate initial dataset (20 symptoms → remedies in JSON).'
    },
    {
      date: 'Sept 12',
      title: 'Backend API (Phase 1)',
      description: 'Built Express/Node.js API with /remedy endpoint. Integrated static JSON dataset for remedies. AI Task: Used Gemini to auto-expand dataset (50+ symptoms with herbs). Output: Simple API returns remedies for symptom.'
    },
    {
      date: 'Sept 13',
      title: 'Backend API (Phase 2)',
      description: 'Connected MongoDB/SQLite for dynamic storage. Added fuzzy matching (e.g., "sore throat" = "cough"). AI Task: OpenAI generated synonym mapping (e.g., "stomach ache" ~ "abdominal pain").'
    },
    {
      date: 'Sept 14',
      title: 'Frontend Development',
      description: 'React UI: symptom input box + result card. Show herb name, image, basic description. AI Task: Gemini generated short herbal explanations with benefits.'
    },
    {
      date: 'Sept 15',
      title: 'Dual AI Layer Enhancement',
      description: 'Flow: DB finds herb → AI refines response. Gemini: generates detailed herbal remedy text. OpenAI: adds safety note + dosage info. Combined Output = best explanation.'
    },
    {
      date: 'Sept 16',
      title: 'Testing & Refinement',
      description: 'Tested 20+ symptoms (cough, fever, headache, stomach pain, cold, etc.). Compared Gemini vs OpenAI output → kept the best parts. AI Task: Auto-summarized test feedback into improvement checklist.'
    },
    {
      date: 'Sept 17',
      title: 'Final Polishing & Deployment',
      description: 'Added disclaimer: "This is not medical advice. Consult a doctor." Improved UI (herbal icons, clean cards). Deployed: Backend (Render/Railway) + Frontend (Vercel/Netlify). AI Task: OpenAI generated a project pitch + demo script.'
    }
  ]

  return (
    <div className="px-4 sm:px-6">
      <SEO 
        title="Our Team & Journey - Sanjivni"
        description="Meet the founders and team behind Sanjivani AI and learn about our journey to bring AI-powered herbal guidance to everyone."
        keywords="Sanjivani AI team, herbal remedy founders, ai health team, natural wellness startup"
        canonicalUrl="/team"
      />

      {/* Header Section */}
      <div className="py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Our Team & Journey
        </h1>
        <div className="w-20 h-1 bg-primary mx-auto mb-4"></div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Meet the dedicated professionals behind Sanjivani AI and learn about our mission to make natural wellness accessible with AI.
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


      {/* Journey Section */}
      <div className="mb-16 bg-white py-10 rounded-lg shadow-sm">
        <div className="text-center text-2xl mb-8 text-[#707070]">
          <p>📅 SANJIVNI PROJECT <span className="text-gray-700 font-semibold">AI-INTEGRATED TIMELINE</span></p>
        </div>

        <div className="relative max-w-6xl mx-auto px-4">
          {/* Timeline line */}
          <div className="absolute left-0 md:left-1/2 transform md:-translate-x-1/2 h-full w-1 bg-primary"></div>
          
          {/* Timeline items */}
          {journeyMilestones.map((milestone, index) => (
            <div key={index} className={`relative flex flex-col md:flex-row md:items-center mb-16 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
              {/* Date bubble */}
              <div className="absolute left-0 md:left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center z-10 shadow-md">
                <span className="font-bold text-xs text-center leading-tight">{milestone.date}</span>
              </div>
              
              {/* Content */}
              <div className={`ml-20 md:ml-0 md:w-5/12 ${index % 2 === 0 ? 'md:pr-16' : 'md:pl-16'}`}>
                <div className="bg-white border border-gray-100 p-6 rounded-lg shadow-md">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{milestone.date} - {milestone.title}</h3>
                  <p className="text-gray-600">{milestone.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Timeline Summary */}
        <div className="mt-12 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-lg border border-green-200">
          <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">✅ By Sept 17th, We Delivered:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="flex items-center space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Symptom → Remedy API (DB + AI powered)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Frontend app (input → herbal suggestion)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Best AI-enhanced explanations (Gemini + OpenAI hybrid)</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-green-600 font-bold">✓</span>
              <span className="text-gray-700">Deployed live project</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vision for the Future */}
      <div className="mb-16 bg-gradient-to-r from-primary/5 to-primary/10 p-8 rounded-lg max-w-6xl mx-auto">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Our Vision for the Future</h2>
        <p className="text-gray-600 text-center max-w-3xl mx-auto">
          At Sanjivni, we envision a future where safe, effective herbal guidance is accessible to everyone. We are committed to leveraging AI to create intuitive solutions that support everyday wellness choices.
        </p>
      </div>

    </div>
  )
}

export default Team