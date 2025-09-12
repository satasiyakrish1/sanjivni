import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import SEO from '../components/SEO'
import StatisticsSection from '../components/StatisticsSection'
import HealthTips from '../components/HealthTips'
import HerbalRemedySearch from '../components/HerbalRemedySearch'
import ConnectionTroubleshooter from '../components/ConnectionTroubleshooter'

const Home = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Sanjivani AI – Book Appointments With Trusted Doctors"
        description="Book appointments with trusted doctors, browse medicines, and manage your health with Sanjivni's easy-to-use platform."
        keywords="doctors, appointments, medicines, healthcare, prescriptions, medical, health, book appointment"
        canonicalUrl="/"
      />
      <div className="container mx-auto px-4 space-y-8">
        <div className="pt-6">
          <Header />
        </div>
        
        {/* Hero Section with Herbal Remedy Search */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 md:p-10 mb-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Natural Herbal Remedies
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Discover natural solutions for your health concerns with our AI-powered herbal remedy finder
            </p>
            <div className="max-w-3xl mx-auto">
              <HerbalRemedySearch />
            </div>
          </div>
        </div>
        
        
        <div id="statistics">
          <StatisticsSection />
        </div>
        
        
        <HealthTips />
        <Banner />
      </div>
      <ConnectionTroubleshooter />
    </div>
  )
}

export default Home