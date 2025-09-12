import React, { useContext, useEffect, useState, useRef } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate, useParams } from 'react-router-dom';
import SEO from '../components/SEO';
import { Heart, Share2, MapPin, Star, Filter, X } from 'lucide-react';
import { Player } from '@lottiefiles/react-lottie-player';
import gsap from 'gsap';

// Skeleton loader component for doctor cards
const DoctorCardSkeleton = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 rounded-full bg-gray-200"></div>
          <div className="h-4 w-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-4 h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="flex items-center gap-1 mb-4">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-4 w-10 bg-gray-200 rounded ml-1"></div>
        </div>
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="h-10 bg-gray-200 rounded-md w-full"></div>
        </div>
      </div>
    </div>
  );
};

const Doctors = () => {
  const { speciality } = useParams();
  const [filterDoc, setFilterDoc] = useState([]);
  const [showFilter, setShowFilter] = useState(false);
  const [likedDoctors, setLikedDoctors] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('relevance');
  const [loading, setLoading] = useState(true);
  const [isDataFetched, setIsDataFetched] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();
  const doctorsRef = useRef(null);
  const animationTimeoutRef = useRef(null);

  const { doctors } = useContext(AppContext);

  // Ensure data is properly fetched and handled
  useEffect(() => {
    // Check if doctors data exists and is properly formed
    if (doctors && Array.isArray(doctors) && doctors.length > 0) {
      setIsDataFetched(true);
      applyFilter(doctors);
    } else {
      // Set loading state appropriately if no data
      setLoading(true);
    }
    
    // Cleanup function for any pending timeouts
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, [doctors]);

  // This function is now separate from the useEffect for better control
  const applyFilter = (doctorsData) => {
    setLoading(true);
    
    // Clear any existing timeout to prevent race conditions
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    
    // Use a reference to avoid closure issues
    animationTimeoutRef.current = setTimeout(() => {
      try {
        // Make sure we have data to filter
        const dataToFilter = Array.isArray(doctorsData) ? doctorsData : [];
        
        if (dataToFilter.length === 0) {
          console.error("No doctors data available to filter");
          setFilterDoc([]);
          setLoading(false);
          return;
        }
        
        let filteredList = [...dataToFilter];

        // Apply speciality filter
        if (speciality) {
          filteredList = filteredList.filter(doc => 
            doc.speciality && doc.speciality.toLowerCase() === speciality.toLowerCase()
          );
        }

        // Apply search term filter
        if (searchTerm) {
          filteredList = filteredList.filter(doc =>
            (doc.name && doc.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (doc.speciality && doc.speciality.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        // Apply sorting (with null checks)
        if (sortBy === 'name') {
          filteredList.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } else if (sortBy === 'available') {
          filteredList.sort((a, b) => (b.available === true) - (a.available === true));
        }

        // Update state with filtered data
        setFilterDoc(filteredList);
      } catch (error) {
        console.error("Error filtering doctors:", error);
        setFilterDoc([]);
      } finally {
        setLoading(false);
      }
    }, 600);
  };

  // Handle filter changes separately
  useEffect(() => {
    if (isDataFetched && doctors) {
      applyFilter(doctors);
    }
  }, [speciality, searchTerm, sortBy, isDataFetched]);

  useEffect(() => {
    // Load liked doctors from localStorage
    try {
      const savedLikes = localStorage.getItem('likedDoctors');
      if (savedLikes) {
        setLikedDoctors(JSON.parse(savedLikes));
      }
    } catch (error) {
      console.error("Error loading liked doctors from localStorage:", error);
    }
  }, []);

  // GSAP animations
  useEffect(() => {
    if (!loading && doctorsRef.current && filterDoc.length > 0) {
      try {
        // Safely handle animations
        if (initialLoad) {
          // Reset any previous animations
          gsap.set([".doctors-header", ".search-controls", ".filter-sidebar", ".doctor-card"], {
            clearProps: "all"
          });
          
          // Create a GSAP timeline
          const tl = gsap.timeline({
            onComplete: () => {
              // Ensure we clear all properties after animation
              gsap.set([".doctors-header", ".search-controls", ".filter-sidebar", ".doctor-card"], {
                clearProps: "all"
              });
            }
          });
          
          // Animate the header
          tl.from(".doctors-header", {
            y: -20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
          });
          
          // Animate the search controls
          tl.from(".search-controls", {
            y: -15,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out"
          }, "-=0.3");
          
          // Animate the filter sidebar
          tl.from(".filter-sidebar", {
            x: -20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.out"
          }, "-=0.2");
          
          // Get all doctor cards
          const doctorCards = document.querySelectorAll(".doctor-card");
          if (doctorCards.length > 0) {
            // Animate each doctor card with stagger
            tl.from(doctorCards, {
              y: 30,
              opacity: 0,
              duration: 0.4,
              stagger: 0.1,
              ease: "power2.out",
              clearProps: "all"
            }, "-=0.2");
          }
          
          setInitialLoad(false);
        } else {
          // For subsequent loads (after filtering), just animate the doctor cards
          const doctorCards = document.querySelectorAll(".doctor-card");
          if (doctorCards.length > 0) {
            gsap.fromTo(doctorCards, 
              { opacity: 0, y: 15 },
              { 
                opacity: 1, 
                y: 0, 
                duration: 0.3, 
                stagger: 0.05,
                ease: "power1.out",
                clearProps: "all" // Clear properties after animation completes
              }
            );
          }
        }
      } catch (error) {
        console.error("Animation error:", error);
        // Ensure elements are visible even if animation fails
        gsap.set([".doctors-header", ".search-controls", ".filter-sidebar", ".doctor-card"], {
          opacity: 1,
          y: 0,
          x: 0,
          clearProps: "all"
        });
      }
    }
  }, [loading, filterDoc]);

  const handleLike = (e, doctorId) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      const updatedLikes = {
        ...likedDoctors,
        [doctorId]: !likedDoctors[doctorId]
      };

      // Animate the heart button
      if (!likedDoctors[doctorId]) {
        const heartButton = e.currentTarget;
        gsap.fromTo(
          heartButton,
          { scale: 1 },
          { 
            scale: 1.5, 
            duration: 0.2, 
            ease: "back.out(3)",
            onComplete: () => {
              gsap.to(heartButton, { scale: 1, duration: 0.15, clearProps: "all" });
            }
          }
        );
      }

      setLikedDoctors(updatedLikes);
      localStorage.setItem('likedDoctors', JSON.stringify(updatedLikes));
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };

  const handleShare = (e, doctor) => {
    e.stopPropagation();
    e.preventDefault();

    try {
      // Animate the share button
      const shareButton = e.currentTarget;
      gsap.fromTo(
        shareButton,
        { rotation: 0 },
        { 
          rotation: 360, 
          duration: 0.6, 
          ease: "power1.out",
          clearProps: "all" // Ensure rotation is reset after animation
        }
      );

      // Create share data for Web Share API
      const shareData = {
        title: `Dr. ${doctor.name} - ${doctor.speciality}`,
        text: `Check out Dr. ${doctor.name}, a ${doctor.speciality} on Sanjivni!`,
        url: `${window.location.origin}/appointment/${doctor._id}`
      };

      // Use Web Share API if available
      if (navigator.share) {
        navigator.share(shareData)
          .catch(err => console.log('Error sharing:', err));
      } else {
        // Fallback: copy link to clipboard
        navigator.clipboard.writeText(shareData.url)
          .then(() => {
            // Show a success message with GSAP
            const toastMessage = document.createElement('div');
            toastMessage.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-md z-50';
            toastMessage.innerText = 'Link copied to clipboard!';
            document.body.appendChild(toastMessage);
            
            gsap.fromTo(
              toastMessage, 
              { y: 50, opacity: 0 }, 
              { 
                y: 0, 
                opacity: 1, 
                duration: 0.3,
                onComplete: () => {
                  setTimeout(() => {
                    gsap.to(toastMessage, { 
                      opacity: 0, 
                      y: -20, 
                      duration: 0.3,
                      onComplete: () => toastMessage.remove()
                    });
                  }, 2000);
                }
              }
            );
          })
          .catch(err => console.log('Error copying link:', err));
      }
    } catch (error) {
      console.error("Error handling share:", error);
    }
  };

  // Safer navigation with animation - avoid reference issues
  const navigateToDoctor = (doctorId) => {
    try {
      const doctorCard = document.querySelector(`[data-doctorid="${doctorId}"]`);
      
      if (doctorCard) {
        gsap.to(doctorCard, {
          scale: 0.95,
          duration: 0.15,
          onComplete: () => {
            navigate(`/appointment/${doctorId}`);
            scrollTo(0, 0);
          }
        });
      } else {
        navigate(`/appointment/${doctorId}`);
        scrollTo(0, 0);
      }
    } catch (error) {
      console.error("Error navigating to doctor:", error);
      navigate(`/appointment/${doctorId}`);
      scrollTo(0, 0);
    }
  };

  // Customize SEO title based on speciality
  const seoTitle = speciality
    ? `${speciality} Specialists - Find and Book Appointments | Sanjivni`
    : 'Find Doctors - Book Appointments with Specialists | Sanjivni';

  // Customize SEO description based on speciality
  const seoDescription = speciality
    ? `Book appointments with trusted ${speciality} specialists. Find the best ${speciality} doctors near you with Sanjivni.`
    : 'Find and book appointments with trusted doctors and specialists. Browse by speciality and location with Sanjivni.';

  const specialties = [
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ];

  return (
    <div className="container mx-auto px-4 py-6" ref={doctorsRef}>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`doctors, specialists, ${speciality || 'medical specialists'}, appointments, healthcare, book doctor`}
        canonicalUrl={speciality ? `/doctors/${speciality}` : '/doctors'}
      />

      {/* Header */}
      <div className="mb-8 doctors-header">
        <h1 className="text-3xl font-bold text-gray-800">
          {speciality ? `${speciality} Specialists` : 'Find Your Doctor'}
        </h1>
        <p className="text-gray-600 mt-2">
          Browse through our network of trusted healthcare professionals
        </p>
      </div>

      {/* Search and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 search-controls">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search doctors by name or speciality..."
            className="w-full p-3 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button
            className="absolute right-3 top-3 text-gray-400"
            onClick={() => setSearchTerm('')}
          >
            {searchTerm && <X size={20} />}
          </button>
        </div>

        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">Sort by: Relevance</option>
            <option value="name">Sort by: Name</option>
            <option value="available">Sort by: Availability</option>
          </select>

          <button
            onClick={() => setShowFilter(!showFilter)}
            className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg md:hidden bg-white"
          >
            <Filter size={20} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className={`md:w-64 filter-sidebar ${showFilter ? 'block' : 'hidden md:block'}`}>
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-gray-800">Specialities</h3>
              <button
                onClick={() => setShowFilter(false)}
                className="md:hidden text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-2">
              <div
                onClick={() => navigate('/doctors')}
                className={`px-4 py-2 rounded-md cursor-pointer transition-all ${!speciality ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
              >
                All Specialities
              </div>

              {specialties.map((spec, index) => (
                <div
                  key={index}
                  onClick={() => speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`)}
                  className={`px-4 py-2 rounded-md cursor-pointer transition-all ${speciality === spec ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-100'}`}
                >
                  {spec}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Doctor Cards */}
        <div className="flex-1">
          {loading ? (
            // Skeleton loading state
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <DoctorCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          ) : filterDoc.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
              <Player
                autoplay
                loop
                src="https://lottie.host/4dc8731f-8b9a-429d-9f63-2c4510bb7a44/WIWbj7IcVQ.lottie"
                style={{ height: '200px', width: '200px' }}
              />
              <h3 className="text-xl font-medium text-gray-800">No doctors found</h3>
              <p className="text-gray-600 mt-2 text-center max-w-md">
                Try adjusting your search criteria or browse through all our available doctors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterDoc.map((doctor) => (
                <div
                  key={`doctor-${doctor._id || Math.random().toString(36).substring(7)}`}
                  data-doctorid={doctor._id}
                  onClick={() => navigateToDoctor(doctor._id)}
                  className="doctor-card bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative h-48 bg-blue-50">
                    <img
                      src={doctor.image || 'https://via.placeholder.com/400x300?text=Doctor+Image'}
                      alt={doctor.name || 'Doctor'}
                      className="w-full h-full object-cover"
                      onLoad={(e) => {
                        // Ensure image is visible after load
                        e.target.style.opacity = 1;
                      }}
                      onError={(e) => {
                        // Fallback for broken images
                        e.target.src = 'https://via.placeholder.com/400x300?text=Doctor+Image';
                      }}
                      style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
                    />
                    <div className="absolute top-3 right-3 flex gap-2">
                      <button
                        onClick={(e) => handleLike(e, doctor._id)}
                        className={`p-2 rounded-full ${likedDoctors[doctor._id] ? 'bg-red-500 text-white' : 'bg-white text-gray-700'} shadow-md hover:scale-105 transition-all`}
                      >
                        <Heart size={18} fill={likedDoctors[doctor._id] ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={(e) => handleShare(e, doctor)}
                        className="p-2 bg-white text-gray-700 rounded-full shadow-md hover:scale-105 transition-all"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-3 h-3 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className={`text-sm ${doctor.available ? 'text-green-600' : 'text-gray-500'}`}>
                        {doctor.available ? 'Available Now' : 'Not Available'}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{doctor.name || 'Doctor Name'}</h3>
                    <p className="text-blue-600 text-sm font-medium mb-2">{doctor.speciality || 'Specialist'}</p>

                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-2">
                      <MapPin size={16} />
                      <span>{doctor.address?.line1 || 'Location not specified'}</span>
                    </div>

                    

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Doctors;