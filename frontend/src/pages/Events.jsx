import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { getBackendUrl } from '../utils/connectionHelper';
import SEO from '../components/SEO';
import LoadingScreen from '../components/LoadingScreen';

const Events = () => {
  const { token, isAuthenticated } = useContext(AppContext);
  const backendUrl = getBackendUrl();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState('upcoming'); // upcoming, ongoing, completed
  
  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`${backendUrl}/api/events`, {
          params: {
            page: currentPage,
            limit: 6, // Show 6 events per page
            status: filter
          }
        });
        
        if (data.success) {
          setEvents(data.events);
          setTotalPages(data.pagination?.pages || 1);
        } else {
          setError(data.message || 'Failed to fetch events');
          toast.error(data.message || 'Failed to fetch events');
        }
      } catch (error) {
        console.error('Error fetching events:', error);
        // Enhanced error handling for 404
        if (error.response && error.response.status === 404) {
          setError('Events route not found (404). This usually means the backend is missing the /api/events route or is not deployed correctly. Please check your backend deployment and ensure the /api/events route is available.');
          toast.error('Events route not found (404). Backend may be missing /api/events.');
        } else {
          setError('Error connecting to the server. Please try again later.');
          toast.error('Error connecting to the server. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [backendUrl, currentPage, filter]);
  
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };
  
  // Format time for display
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };
  
  // Handle filter change
  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Events | Prescripto" 
        description="Browse and register for upcoming health and wellness events." 
      />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
            Health & Wellness Events
          </h1>
          <p className="mt-6 text-xl max-w-3xl mx-auto">
            Join our community events, workshops, and seminars focused on health education, wellness, and medical advancements.
          </p>
        </div>
      </div>
      
      {/* Filter Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => handleFilterChange('upcoming')}
              className={`${filter === 'upcoming' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upcoming
            </button>
            <button
              onClick={() => handleFilterChange('ongoing')}
              className={`${filter === 'ongoing' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Ongoing
            </button>
            <button
              onClick={() => handleFilterChange('completed')}
              className={`${filter === 'completed' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Past Events
            </button>
          </nav>
        </div>
      </div>
      
      {/* Events Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingScreen isLoading={loading} />
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 text-lg">No {filter} events found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event._id} className="bg-white overflow-hidden shadow rounded-lg transition-all hover:shadow-lg">
                {event.banner && (
                  <div className="h-48 w-full overflow-hidden">
                    <img 
                      src={event.banner ? `${backendUrl}${event.banner}` : '/default-banner.png'} 
                      alt={event.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{event.title}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {formatDate(event.date)} at {formatTime(event.date)}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${event.eventType === 'free' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {event.eventType === 'free' ? 'Free' : 'Paid'}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span>{event.locationType === 'online' ? 'Online Event' : event.location}</span>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-sm text-gray-500 line-clamp-3">{event.description}</p>
                  </div>
                  
                  {event.rsvpLimit > 0 && (
                    <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${Math.min(100, (event.rsvpCount / event.rsvpLimit) * 100)}%` }}
                      ></div>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.rsvpCount} / {event.rsvpLimit} spots filled
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Link 
                      to={`/events/${event._id}`}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {[...Array(totalPages).keys()].map((page) => (
                <button
                  key={page + 1}
                  onClick={() => handlePageChange(page + 1)}
                  className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page + 1 ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                >
                  {page + 1}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;