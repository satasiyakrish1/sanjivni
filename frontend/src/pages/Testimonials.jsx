import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { getBackendUrl } from '../utils/connectionHelper';
import axios from 'axios';
import { FaStar } from 'react-icons/fa';

const Testimonials = () => {
  const navigate = useNavigate();
  const { user } = useContext(AppContext);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newTestimonial, setNewTestimonial] = useState({
    content: '',
    rating: 5
  });

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${getBackendUrl()}/api/testimonial/doctor/${user?.appointmentDetails?.doctorId}`);
      setTestimonials(response.data.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch testimonials');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.appointmentDetails?.doctorId) {
      fetchTestimonials();
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${getBackendUrl()}/api/testimonial/submit`,
        {
          doctorId: user.appointmentDetails.doctorId,
          ...newTestimonial
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      alert('Testimonial submitted successfully!');
      setNewTestimonial({ content: '', rating: 5 });
      fetchTestimonials();
    } catch (err) {
      setError('Failed to submit testimonial');
    }
  };

  const StarRating = ({ rating, onRatingChange }) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, index) => {
          const ratingValue = index + 1;
          return (
            <FaStar
              key={index}
              className={`cursor-pointer ${ratingValue <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
              onClick={() => onRatingChange(ratingValue)}
            />
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Doctor Testimonials</h1>

      {user?.appointmentDetails?.doctorId && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Write a Testimonial</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating
              </label>
              <StarRating
                rating={newTestimonial.rating}
                onRatingChange={(rating) =>
                  setNewTestimonial((prev) => ({ ...prev, rating }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Review
              </label>
              <textarea
                value={newTestimonial.content}
                onChange={(e) =>
                  setNewTestimonial((prev) => ({
                    ...prev,
                    content: e.target.value
                  }))
                }
                className="w-full p-2 border rounded-md"
                rows="4"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Submit Testimonial
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div
            key={testimonial._id}
            className="bg-white rounded-lg shadow-md p-6"
          >
            <div className="flex items-center mb-4">
              <div>
                <p className="font-semibold">{testimonial.patientName}</p>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, index) => (
                    <FaStar
                      key={index}
                      className={`${index < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="text-gray-600">{testimonial.content}</p>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(testimonial.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonials;