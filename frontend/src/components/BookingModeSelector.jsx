import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';

const BookingModeSelector = ({ 
  doctorId, 
  backendUrl, 
  token, 
  currencySymbol, 
  onBookingComplete,
  docInfo 
}) => {
  const [bookingMode, setBookingMode] = useState('default');
  const [customSlots, setCustomSlots] = useState([]);
  const [emergencyFee, setEmergencyFee] = useState(0);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [isEmergency, setIsEmergency] = useState(false);

  // Default slot booking state
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(true);

  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  useEffect(() => {
    fetchDoctorBookingMode();
  }, [doctorId]);

  const fetchDoctorBookingMode = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/doctor/booking-mode/${doctorId}`);
      
      if (data.success) {
        setBookingMode(data.bookingMode);
        setCustomSlots(data.customSlots || []);
        setEmergencyFee(data.emergencyFee || 0);
        
        if (data.bookingMode === 'default') {
          getAvailableSlots();
        }
      } else {
        toast.error(data.message || 'Failed to load booking mode');
      }
    } catch (error) {
      console.error('Error fetching booking mode:', error);
      toast.error('Failed to load booking information');
      // Fallback to default mode
      setBookingMode('default');
      getAvailableSlots();
    } finally {
      setLoading(false);
    }
  };

  const getAvailableSlots = async () => {
    setSlotsLoading(true);
    setDocSlots([]);

    // Getting current date
    let today = new Date();

    for (let i = 0; i < 7; i++) {
      // Getting date with index 
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);

      // Setting end time of the date with index
      let endTime = new Date();
      endTime.setDate(today.getDate() + i);
      endTime.setHours(21, 0, 0, 0);

      // Setting hours 
      if (today.getDate() === currentDate.getDate()) {
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10);
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10);
        currentDate.setMinutes(0);
      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        const slotDate = day + "_" + month + "_" + year;
        const slotTime = formattedTime;

        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          });
        }

        // Increment current time by 30 minutes
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      setDocSlots(prev => ([...prev, timeSlots]));
    }

    setTimeout(() => {
      setSlotsLoading(false);
    }, 800);
  };

  const [queue, setQueue] = useState([]);
  const [showQueue, setShowQueue] = useState(false);

  const fetchDoctorQueue = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/user/doctor-queue/${doctorId}`, { headers: { token } });
      if (data.success) {
        setQueue(data.queue);
        setShowQueue(true);
      } else {
        toast.error(data.message || 'Failed to fetch queue');
      }
    } catch (error) {
      console.error('Queue fetch error:', error);
      toast.error('Failed to fetch doctor\'s queue');
    }
  };

  const handleInstantBooking = async (isEmergencyBooking = false) => {
    if (!token) {
      toast.warning('Login to book appointment');
      return;
    }

    setBookingLoading(true);
    setIsEmergency(isEmergencyBooking);
    
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { 
          docId: doctorId, 
          slotDate: 'instant', 
          slotTime: 'instant',
          isEmergency: isEmergencyBooking,
          bookingMode: 'instant'
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        // Fetch the updated queue after booking
        await fetchDoctorQueue();
        onBookingComplete && onBookingComplete();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Instant booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCustomSlotBooking = async (slot) => {
    if (!token) {
      toast.warning('Login to book appointment');
      return;
    }

    setSelectedSlot(slot);
    setShowConfirmModal(true);
  };

  const confirmCustomSlotBooking = async () => {
    setBookingLoading(true);
    
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { 
          docId: doctorId, 
          slotDate: 'custom', 
          slotTime: selectedSlot.startTime,
          customSlotId: selectedSlot.id,
          bookingMode: 'custom'
        },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setShowConfirmModal(false);
        onBookingComplete && onBookingComplete();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Custom slot booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleDefaultSlotBooking = () => {
    if (!token) {
      toast.warning('Login to book appointment');
      return;
    }

    if (!slotTime) {
      toast.warning('Please select a time slot');
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmDefaultSlotBooking = async () => {
    setBookingLoading(true);
    const date = docSlots[slotIndex][0].datetime;

    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();

    const slotDate = day + "_" + month + "_" + year;

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId: doctorId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        setShowConfirmModal(false);
        onBookingComplete && onBookingComplete();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Default slot booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setBookingLoading(false);
    }
  };

  const getFormattedDateTime = () => {
    if (bookingMode === 'custom' && selectedSlot) {
      return `Custom slot: ${selectedSlot.startTime} - ${selectedSlot.endTime}`;
    }
    
    if (bookingMode === 'default' && docSlots.length && docSlots[slotIndex] && docSlots[slotIndex][0]) {
      const date = docSlots[slotIndex][0].datetime;
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()} at ${slotTime}`;
    }
    
    return 'Instant booking';
  };

  const getBookingFee = () => {
    if (bookingMode === 'instant') {
      return isEmergency ? emergencyFee : docInfo.fees;
    }
    
    if (bookingMode === 'custom' && selectedSlot) {
      return selectedSlot.price;
    }
    
    return docInfo.fees;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="sm:ml-72 sm:pl-4 mt-8">
      <div className="p-6 bg-white shadow-sm rounded-xl border border-gray-100">
        {/* Mode-specific UI */}
        {bookingMode === 'instant' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Booking Available</h3>
              <p className="text-gray-600">Book the next available slot instantly</p>
            </div>

            {/* Current Queue List */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-gray-900">Current Queue</h4>
                <button 
                  onClick={fetchDoctorQueue}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              
              {showQueue ? (
                queue.length > 0 ? (
                  <div className="space-y-2">
                    {queue.map((patient, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                        <span className={`text-sm ${patient.isCompleted ? 'line-through text-gray-400' : ''}`}>
                          {patient.patientName}
                        </span>
                        <div className="flex items-center gap-2">
                          {patient.isEmergency && (
                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Emergency</span>
                          )}
                          {patient.isCompleted ? (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Completed</span>
                          ) : (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">#{patient.position}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-3 text-gray-500">
                    <p>No patients in queue. You'll be first!</p>
                  </div>
                )
              ) : (
                <div className="text-center py-3">
                  <button 
                    onClick={fetchDoctorQueue}
                    className="text-sm text-primary hover:underline"
                  >
                    Click to view current queue
                  </button>
                </div>
              )}
            </div>

            {/* Booking Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => handleInstantBooking(false)}
                disabled={bookingLoading}
                className="w-full bg-primary text-white font-medium px-6 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:bg-opacity-70 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Book Next Available Slot
                <span className="text-sm opacity-90">({currencySymbol}{docInfo.fees})</span>
              </button>

              <button
                onClick={() => handleInstantBooking(true)}
                disabled={bookingLoading}
                className="w-full bg-red-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-red-700 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:bg-opacity-70 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Emergency Booking
                <span className="text-sm opacity-90">({currencySymbol}{emergencyFee})</span>
              </button>
            </div>
          </div>
        )}

        {bookingMode === 'custom' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Custom Time Slots</h3>
              <p className="text-gray-600">Select from available custom time slots</p>
            </div>

            {customSlots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No custom slots available</p>
                <p className="text-sm">Please check back later or contact the doctor</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {customSlots.map((slot) => (
                  <div
                    key={slot.id}
                    onClick={() => handleCustomSlotBooking(slot)}
                    className="border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {slot.startTime} - {slot.endTime}
                        </p>
                        <p className="text-sm text-gray-500">
                          {slot.isPaymentRequired ? 'Payment Required' : 'Free'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-primary">
                          {currencySymbol}{slot.price}
                        </p>
                      </div>
                    </div>
                    <button className="w-full bg-primary text-white text-sm py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                      Book This Slot
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {bookingMode === 'default' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select Date & Time</h3>
              <p className="text-gray-600">Choose your preferred appointment time</p>
            </div>

            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {/* Calendar Section */}
                <div className="mb-6">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Select Date</p>
                  <div className="flex gap-3 items-center w-full overflow-x-auto pb-2">
                    {docSlots.length && docSlots.map((item, index) => {
                      if (item.length === 0) return null;

                      const date = item[0].datetime;
                      const today = new Date();
                      const isToday = date.getDate() === today.getDate() &&
                        date.getMonth() === today.getMonth() &&
                        date.getFullYear() === today.getFullYear();

                      return (
                        <div
                          onClick={() => setSlotIndex(index)}
                          key={index}
                          className={`text-center py-3 px-2 min-w-20 border rounded-xl cursor-pointer transition-all duration-200 ${
                            slotIndex === index
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'border-gray-200 hover:border-primary bg-white'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">{daysOfWeek[date.getDay()]}</p>
                          <p className="text-xl font-medium">{date.getDate()}</p>
                          <p className="text-xs opacity-80">{months[date.getMonth()]}</p>
                          {isToday && <div className="text-xs mt-1 font-medium">Today</div>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Time Selection */}
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Select Time</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {docSlots.length && docSlots[slotIndex].length > 0 ? (
                      docSlots[slotIndex].map((item, index) => (
                        <div
                          onClick={() => setSlotTime(item.time)}
                          key={index}
                          className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            item.time === slotTime
                              ? 'bg-primary text-white shadow-sm'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-primary'
                          }`}
                        >
                          <p className={`text-sm font-medium ${item.time === slotTime ? 'text-white' : 'text-gray-800'}`}>
                            {item.time.toLowerCase()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full py-10 text-center">
                        <p className="text-gray-500 font-medium">No available slots for this date</p>
                        <p className="text-gray-400 text-sm mt-1">Please select another date</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Book Appointment Button */}
                <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    {slotTime ? (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span>Selected: <span className="font-medium text-gray-800">{getFormattedDateTime()}</span></span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                        </div>
                        <span>Please select a time slot</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleDefaultSlotBooking}
                    disabled={!slotTime}
                    className="bg-primary text-white font-medium px-8 py-3 rounded-lg hover:bg-opacity-90 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm disabled:bg-opacity-70 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Book Appointment
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Appointment</h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            <div className="bg-primary bg-opacity-5 p-4 rounded-lg mb-5">
              <div className="flex items-center mb-4">
                <div className="h-12 w-12 rounded-full bg-primary bg-opacity-10 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Appointment with</p>
                  <p className="font-semibold text-gray-900">{docInfo?.name}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Date & Time</p>
                  <p className="font-medium text-gray-800">{getFormattedDateTime()}</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500">Fee</p>
                  <p className="font-medium text-gray-800">{currencySymbol}{getBookingFee()}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-4">
              <div className="mb-4 text-sm text-gray-600">
                <p>Your appointment will be confirmed immediately.</p>
                <p className="mt-1">You can cancel or reschedule up to 2 hours before.</p>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={bookingMode === 'custom' ? confirmCustomSlotBooking : confirmDefaultSlotBooking}
                  disabled={bookingLoading}
                  className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-opacity-90 disabled:opacity-70 transition-colors flex items-center justify-center min-w-24"
                >
                  {bookingLoading ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Confirming...
                    </>
                  ) : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingModeSelector;