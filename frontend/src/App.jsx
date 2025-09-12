import React, { useState, useEffect, useContext } from 'react';
import Navbar from './components/Navbar';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Privacy from './pages/Privacy';
import Features from './pages/Features';
import About from './pages/About';
import Contact from './pages/Contact';
import Team from './pages/Team';
import Footer from './components/Footer';
import BMICalculator from './pages/BMICalculator';
import EyeTest from './pages/EyeTest';
import Medicines from './pages/Medicines';
import MedicineDetails from './pages/MedicineDetails';
import NotFound from './pages/NotFound';
import Terms from './pages/Terms';
import LoadingScreen from './components/LoadingScreen';
import { AppContext } from './context/AppContext';
import SiteMap from './pages/SiteMap';

// FAQ page
import Faq from './pages/Faq';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className='mx-4 sm:mx-[10%]'>
      <LoadingScreen isLoading={isLoading} />
      <Navbar />

      <Routes>
        {/* Public Routes */}
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<About />} />
        <Route path='/privacy' element={<Privacy />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/features' element={<Features />} />
        <Route path='/terms' element={<Terms />} />
        <Route path='/team' element={<Team />} />
        <Route path='/faq' element={<Faq />} />
        <Route path='/medicines' element={<Medicines />} />
        <Route path='/medicines/:id' element={<MedicineDetails />} />
        <Route path='/bmi-calculator' element={<BMICalculator />} />
        <Route path='/eye-test' element={<EyeTest />} />
        <Route path='/sitemap' element={<SiteMap />} />

        {/* Not Found */}
        <Route path='*' element={<NotFound />} />
      </Routes>

      <Footer />
    </div>
  );
};

export default App;
