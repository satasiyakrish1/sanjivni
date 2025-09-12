import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';
import RelatedDoctors from '../components/RelatedDoctors';
import DoctorTestimonials from '../components/DoctorTestimonials';
import BookingModeSelector from '../components/BookingModeSelector';
import axios from 'axios';
import { toast } from 'react-toastify';

// Enhanced Skeleton Loading Components
const SkeletonPulse = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

const DoctorSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Doctor Image Skeleton */}
      <div className="flex flex-col gap-3">
        <SkeletonPulse className="w-full sm:w-72 h-80 rounded-lg" />
        <div className="hidden sm:flex items-center justify-between p-3 border border-gray-100 rounded-lg">
          <SkeletonPulse className="w-8 h-8 rounded-full" />
          <div className="flex flex-col gap-1 flex-1 ml-3">
            <SkeletonPulse className="h-4 w-20" />
            <SkeletonPulse className="h-3 w-16" />
          </div>
        </div>
      </div>

      {/* Doctor Info Skeleton */}
      <div className="flex-1 border border-gray-200 rounded-lg p-8 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
        <div className="flex justify-between">
          <div className="w-3/4">
            <SkeletonPulse className="h-8 w-64 mb-2" />
            <SkeletonPulse className="h-4 w-52 mb-4" />
          </div>
          <SkeletonPulse className="h-8 w-14 rounded-full sm:hidden" />
        </div>

        <div className="mt-5">
          <SkeletonPulse className="h-5 w-20 mb-2" />
          <SkeletonPulse className="h-4 w-full mb-1" />
          <SkeletonPulse className="h-4 w-full mb-1" />
          <SkeletonPulse className="h-4 w-3/4 mb-1" />
        </div>

        {/* Additional Info Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="border border-gray-100 rounded-lg p-3">
            <SkeletonPulse className="h-3 w-24 mb-2" />
            <SkeletonPulse className="h-5 w-32" />
          </div>
          <div className="border border-gray-100 rounded-lg p-3">
            <SkeletonPulse className="h-3 w-24 mb-2" />
            <SkeletonPulse className="h-5 w-32" />
          </div>
        </div>

        <SkeletonPulse className="h-5 w-36 mt-6" />
      </div>
    </div>
  </div>
);

const DateSlotsSkeleton = () => (
  <div className="sm:ml-72 sm:pl-4 mt-8">
    <div className="flex justify-between items-center mb-4">
      <SkeletonPulse className="h-6 w-40" />
      <SkeletonPulse className="h-4 w-28" />
    </div>
    <div className="flex gap-3 overflow-x-auto pb-2">
      {[...Array(7)].map((_, index) => (
        <SkeletonPulse key={index} className="h-24 min-w-16 rounded-lg" />
      ))}
    </div>
  </div>
);

const TimeSlotsSkeleton = () => (
  <div className="sm:ml-72 sm:pl-4 mt-6">
    <SkeletonPulse className="h-5 w-32 mb-3" />
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
      {[...Array(12)].map((_, index) => (
        <SkeletonPulse key={index} className="h-12 rounded-lg" />
      ))}
    </div>
    <SkeletonPulse className="h-12 w-48 rounded-lg my-6" />
  </div>
);

const TestimonialsSkeleton = () => (
  <div className="sm:ml-72 sm:pl-4 mt-8 border-t border-gray-100 pt-8">
    <SkeletonPulse className="h-6 w-40 mb-4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...Array(2)].map((_, index) => (
        <div key={index} className="border border-gray-100 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <SkeletonPulse className="h-10 w-10 rounded-full" />
            <div className="ml-3">
              <SkeletonPulse className="h-4 w-32 mb-1" />
              <SkeletonPulse className="h-3 w-24" />
            </div>
          </div>
          <SkeletonPulse className="h-4 w-full mb-1" />
          <SkeletonPulse className="h-4 w-full mb-1" />
          <SkeletonPulse className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  </div>
);

const RelatedDoctorsSkeleton = () => (
  <div className="mt-10 border-t border-gray-100 pt-8">
    <SkeletonPulse className="h-6 w-48 mb-4" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center">
            <SkeletonPulse className="h-16 w-16 rounded-full" />
            <div className="ml-3 flex-1">
              <SkeletonPulse className="h-5 w-32 mb-1" />
              <SkeletonPulse className="h-4 w-40 mb-1" />
              <SkeletonPulse className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext);
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [docInfo, setDocInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testimonialLoading, setTestimonialLoading] = useState(true);
  const [relatedDoctorsLoading, setRelatedDoctorsLoading] = useState(true);

  const navigate = useNavigate();

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
    setLoading(false);
  };



  // Simulate loading state for testimonials and related doctors
  useEffect(() => {
    // Simulate loading states
    setTimeout(() => {
      setTestimonialLoading(false);
    }, 1500);

    setTimeout(() => {
      setRelatedDoctorsLoading(false);
    }, 2000);
  }, []);

  useEffect(() => {
    setLoading(true);
    if (doctors.length > 0) {
      fetchDocInfo();
    }
  }, [doctors, docId]);





  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Main Doctor Information Section */}
      {loading ? (
        <DoctorSkeleton />
      ) : docInfo ? (
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-72">
            {/* Doctor Image */}
            <div className="relative">
              <img
                className="w-full h-auto sm:max-w-72 rounded-xl shadow-md object-cover"
                src={docInfo.image}
                alt={docInfo.name}
              />

            </div>

            {/* Doctor Stats Cards */}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-3 flex flex-col items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Experience</p>
                <p className="font-medium text-gray-800 text-sm">{docInfo.experience}</p>
              </div>

              <div className="bg-white shadow-sm border border-gray-100 rounded-lg p-3 flex flex-col items-center">
                <div className="bg-primary bg-opacity-10 p-2 rounded-full mb-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">Patients</p>
                <p className="font-medium text-gray-800 text-sm">{docInfo.patientsCount || "500+"}</p>
              </div>
            </div>

            {/* Reviews Summary Card - Hidden on mobile */}
            <div className="hidden sm:block bg-white shadow-sm border border-gray-100 rounded-lg p-4 mt-3">
              <p className="text-sm font-medium text-gray-800 mb-3">Patient Reviews</p>
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${i < 4 ? "text-yellow-400" : "text-gray-300"}`} viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-800 ml-2">{docInfo.rating || "4.8"}</span>
                <span className="text-xs text-gray-500 ml-2">({docInfo.reviewsCount || "120"} reviews)</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center text-xs">
                  <span className="w-12">5 star</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full mx-2">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: "80%" }}></div>
                  </div>
                  <span>80%</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="w-12">4 star</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full mx-2">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: "15%" }}></div>
                  </div>
                  <span>15%</span>
                </div>
                <div className="flex items-center text-xs">
                  <span className="w-12">3 star</span>
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full mx-2">
                    <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: "5%" }}></div>
                  </div>
                  <span>5%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
              {/* Doctor Name and Credentials */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-3xl font-semibold text-gray-800">{docInfo.name}</p>
                    <img className="w-5" src={assets.verified_icon} alt="Verified" />
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-gray-600">
                    <p>{docInfo.degree} - {docInfo.speciality}</p>
                    <span className="py-0.5 px-2 bg-primary bg-opacity-10 text-xs rounded-full text-primary font-medium">{docInfo.experience}</span>
                  </div>
                </div>


              </div>

              {/* Doctor About */}
              <div className="mt-6">
                <div className="flex items-center gap-1 text-gray-800 font-medium mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  About Doctor
                </div>
                <p className="text-gray-600">{docInfo.about}</p>
              </div>

              {/* Additional Doctor Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Specialization</p>
                      <p className="font-medium text-gray-800">{docInfo.speciality}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Languages</p>
                      <p className="font-medium text-gray-800">{docInfo.languages || "English"}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="bg-primary bg-opacity-10 p-2 rounded-full mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Address</p>
                      <p className="font-medium text-gray-800">
                        {docInfo?.address?.line1}
                        {docInfo?.address?.line2 && <><br />{docInfo.address.line2}</>}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Information */}
              <div className="flex flex-wrap justify-between items-center mt-6 bg-primary bg-opacity-5 p-4 rounded-lg">
                <div>
                  <p className="text-gray-600 text-sm">Appointment Fee</p>
                  <p className="text-lg font-semibold text-gray-800">{currencySymbol}{docInfo.fees}</p>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  <div className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                    {docInfo.available ? 'Available Now' : 'Currently Unavailable'}
                  </div>
                  <div className="bg-primary bg-opacity-10 text-primary text-xs px-2 py-1 rounded-full font-medium">
                    {docInfo.consultationType || "Online & In-person"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-64">
          <p>Doctor information not found.</p>
        </div>
      )}

      {/* Booking Mode Selector */}
      {loading || !docInfo ? null : (
        <BookingModeSelector
          doctorId={docId}
          backendUrl={backendUrl}
          token={token}
          currencySymbol={currencySymbol}
          onBookingComplete={() => {
            getDoctosData();
            navigate('/my-appointments');
          }}
          docInfo={docInfo}
        />
      )}

      {/* Doctor Testimonials */}
      {loading || !docInfo ? null : (
        <div className="sm:ml-72 sm:pl-4 mt-8">
          {testimonialLoading ? (
            <TestimonialsSkeleton />
          ) : (
            <div className="border-t border-gray-100 pt-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800">Patient Testimonials</h3>
                <button className="text-primary text-sm font-medium hover:underline">View all</button>
              </div>
              <DoctorTestimonials doctorId={docId} />
            </div>
          )}
        </div>
      )}

      {/* Related Doctors */}
      {loading || !docInfo ? null : (
        <div className="mt-10">
          {relatedDoctorsLoading ? (
            <RelatedDoctorsSkeleton />
          ) : (
            <div className="border-t border-gray-100 pt-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-6">Other Doctors You Might Like</h3>
              <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
            </div>
          )}
        </div>
      )}


    </div>
  );
};

export default Appointment;