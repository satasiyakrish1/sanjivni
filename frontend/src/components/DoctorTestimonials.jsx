import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';

const DoctorTestimonials = ({ doctorId }) => {
    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalTestimonials, setTotalTestimonials] = useState(0);
    const [itemsPerPage] = useState(5);
    const [formData, setFormData] = useState({
        rating: 5,
        content: ''
    });
    const { token, backendUrl } = useContext(AppContext);

    useEffect(() => {
        fetchTestimonials();
    }, [doctorId, currentPage]);

    const fetchTestimonials = async () => {
        try {
            const response = await axios.get(`${backendUrl}/api/testimonials/doctor/${doctorId}?page=${currentPage}&limit=${itemsPerPage}`);
            setTestimonials(response.data.data);
            setTotalTestimonials(response.data.total);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching testimonials:', error);
            setLoading(false);
        }
    };

    const [submitting, setSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.warning('Please login to submit a testimonial');
            return;
        }

        setSubmitting(true);
        try {
            // Validate token before submission
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                const expTime = tokenData.exp * 1000; // Convert to milliseconds
                
                if (expTime < Date.now()) {
                    toast.error('Session expired. Please login again.');
                    return;
                }
            } catch (error) {
                console.error('Invalid token:', error);
                toast.error('Invalid session. Please login again.');
                return;
            }

            const response = await axios.post(
                `${backendUrl}/api/testimonials/submit`,
                { ...formData, doctorId },
                { 
                    headers: { token },
                    timeout: 15000 // 15 seconds timeout
                }
            );
            
            if (response.data.success) {
                toast.success('Testimonial submitted successfully! Waiting for approval.');
                setShowForm(false);
                setFormData({ rating: 5, content: '' });
                fetchTestimonials();
            } else {
                toast.error(response.data.message || 'Failed to submit testimonial');
            }
        } catch (error) {
            console.error('Error submitting testimonial:', error);
            if (error.response?.status === 401) {
                toast.error('Authentication failed. Please login again.');
            } else if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.code === 'ECONNABORTED') {
                toast.error('Request timed out. Please try again.');
            } else {
                toast.error('Failed to submit testimonial. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = ({ rating }) => {
        return (
            <div className="flex">
                {[...Array(5)].map((_, index) => (
                    <svg
                        key={index}
                        className={`h-5 w-5 ${index < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                    >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                ))}
            </div>
        );
    };

    if (loading) {
        return <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>;
    }

    return (
        <div className="mt-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Patient Testimonials</h3>
                {token && !showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors"
                    >
                        Write a Review
                    </button>
                )}
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="mb-8 bg-gray-50 p-6 rounded-lg">
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                        <div className="flex gap-2">
                            {[5, 4, 3, 2, 1].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, rating: num })}
                                    className={`p-2 rounded ${formData.rating === num ? 'bg-yellow-400 text-white' : 'bg-gray-200'}`}
                                >
                                    {num} ⭐
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                            className="w-full p-2 border rounded-md"
                            rows="4"
                            required
                            maxLength="1000"
                            placeholder="Share your experience with this doctor..."
                        ></textarea>
                    </div>
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-primary text-white px-4 py-2 rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            )}

            {testimonials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No testimonials yet. Be the first to review!</p>
            ) : (
                <>
                    <div className="space-y-6">
                        {testimonials.map((testimonial) => (
                        <div key={testimonial._id} className="bg-white p-6 rounded-lg shadow-sm border">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-medium text-lg">{testimonial.patientName}</h4>
                                    <StarRating rating={testimonial.rating} />
                                </div>
                                <span className="text-sm text-gray-500">
                                    {new Date(testimonial.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-700">{testimonial.content}</p>
                        </div>
                        ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="mt-6 flex justify-center items-center gap-4">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 rounded ${currentPage === 1 ? 'bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {Math.ceil(totalTestimonials / itemsPerPage)}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(totalTestimonials / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(totalTestimonials / itemsPerPage)}
                            className={`px-4 py-2 rounded ${currentPage === Math.ceil(totalTestimonials / itemsPerPage) ? 'bg-gray-200' : 'bg-green-600 text-white hover:bg-green-700'}`}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default DoctorTestimonials;