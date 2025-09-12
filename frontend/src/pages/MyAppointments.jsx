import React, { useContext, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import { assets } from '../assets/assets'
import jsPDF from 'jspdf'
import GoogleFitData from '../components/GoogleFitData'
import 'leaflet/dist/leaflet.css'

const MyAppointments = () => {
    const { backendUrl, token, currencySymbol } = useContext(AppContext)
    const navigate = useNavigate()

    const [appointments, setAppointments] = useState([])
    const [payment, setPayment] = useState('')
    const [loading, setLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [activeTab, setActiveTab] = useState('upcoming') // 'upcoming', 'past', 'cancelled'

    // Map related states
    const [showMap, setShowMap] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [searchResults, setSearchResults] = useState(null)
    const mapRef = useRef(null)
    const mapContainerRef = useRef(null)
    const markerRef = useRef(null)
    
    // Google Drive popup state
    const [showDrivePopup, setShowDrivePopup] = useState(false)
    const [currentAppointment, setCurrentAppointment] = useState(null)
    const [pdfBlob, setPdfBlob] = useState(null)
    const [isUploading, setIsUploading] = useState(false)

    const appointmentsPerPage = 5

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

    // Function to create Google Calendar URL
    const createGoogleCalendarUrl = (appointment) => {
        try {
            // Parse the date from slot format (DD_MM_YYYY)
            const dateArray = appointment.slotDate.split('_');
            const day = parseInt(dateArray[0], 10);
            const month = parseInt(dateArray[1], 10) - 1; // JS months are 0-indexed
            const year = parseInt(dateArray[2], 10);

            // Validate the year (should be a 4-digit number)
            if (year < 1000 || year > 9999) {
                console.error('Invalid year format:', year);
                return '#'; // Return empty link if year is invalid
            }

            // Parse the time
            const timeStr = appointment.slotTime;
            const [time, period] = timeStr.split(' ');
            const [hoursStr, minutesStr] = time.split(':');
            const hours = parseInt(hoursStr, 10);
            const minutes = parseInt(minutesStr, 10);

            // Create JavaScript Date objects
            const startDate = new Date(year, month, day);

            // Set hours and minutes
            let hour24 = hours;
            if (period === 'PM' && hour24 < 12) hour24 += 12;
            if (period === 'AM' && hour24 === 12) hour24 = 0;

            startDate.setHours(hour24, minutes, 0);

            // Create end date (1 hour after start)
            const endDate = new Date(startDate);
            endDate.setHours(startDate.getHours() + 1);

            // Format for Google Calendar
            const formatForCalendar = (date) => {
                return date.getFullYear().toString() +
                    (date.getMonth() + 1).toString().padStart(2, '0') +
                    date.getDate().toString().padStart(2, '0') +
                    'T' +
                    date.getHours().toString().padStart(2, '0') +
                    date.getMinutes().toString().padStart(2, '0') +
                    '00';
            };

            const startDateStr = formatForCalendar(startDate);
            const endDateStr = formatForCalendar(endDate);

            // Create event details
            const eventTitle = `Appointment with Dr. ${appointment.docData.name}`;
            const eventLocation = `${appointment.docData.address.line1}, ${appointment.docData.address.line2}`;
            const eventDescription = `Appointment with ${appointment.docData.name} (${appointment.docData.speciality})`;

            // For debugging - log the created date strings
            console.log('Start date string:', startDateStr);
            console.log('End date string:', endDateStr);
            console.log('Original date parts:', { day, month: month + 1, year });

            // Create Google Calendar URL
            const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(eventTitle)}&dates=${startDateStr}/${endDateStr}&details=${encodeURIComponent(eventDescription)}&location=${encodeURIComponent(eventLocation)}&sf=true&output=xml`;

            return googleCalendarUrl;
        } catch (error) {
            console.error('Error creating Google Calendar URL:', error);
            return '#'; // Return empty link if there's an error
        }
    };


    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        try {
            setLoading(true)
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
            setAppointments(data.appointments.reverse())
            setLoading(false)
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
            setLoading(false)
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })

            if (data.success) {
                toast.success(data.message)
                getUserAppointments()
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(backendUrl + "/api/user/verifyRazorpay", response, { headers: { token } });
                    if (data.success) {
                        navigate('/my-appointments')
                        getUserAppointments()
                    }
                } catch (error) {
                    console.log(error)
                    toast.error(error.response?.data?.message || error.message)
                }
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-razorpay', { appointmentId }, { headers: { token } })
            if (data.success) {
                initPay(data.order)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        try {
            const { data } = await axios.post(backendUrl + '/api/user/payment-stripe', { appointmentId }, { headers: { token } })
            if (data.success) {
                const { session_url } = data
                window.location.replace(session_url)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response?.data?.message || error.message)
        }
    }

    // Function to save appointment PDF to Google Drive
    const handleSaveToDrive = async (appointment) => {
        try {
            toast.info('Preparing to upload to Google Drive...');
            
            // First generate the PDF blob
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let yPos = 20;

            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Appointment Details', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Add doctor info
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Doctor Information', margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${appointment.docData.name}`, margin, yPos);
            yPos += 8;
            doc.text(`Speciality: ${appointment.docData.speciality}`, margin, yPos);
            yPos += 8;
            doc.text('Address:', margin, yPos);
            yPos += 8;
            doc.text(`${appointment.docData.address.line1}`, margin, yPos);
            yPos += 8;
            doc.text(`${appointment.docData.address.line2}`, margin, yPos);
            yPos += 15;

            // Add appointment details
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Appointment Details', margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Date: ${slotDateFormat(appointment.slotDate)}`, margin, yPos);
            yPos += 8;
            doc.text(`Time: ${appointment.slotTime}`, margin, yPos);
            yPos += 8;
            doc.text(`Status: ${appointment.isCompleted ? 'Completed' : appointment.cancelled ? 'Cancelled' : 'Scheduled'}`, margin, yPos);
            yPos += 15;

            // Add payment details
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Payment Details', margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Payment Status: ${appointment.payment ? 'Paid' : 'Not Paid'}`, margin, yPos);
            yPos += 8;
            if (appointment.payment) {
                // Check if payment details exist in the payment object
                const paymentMethod = appointment.payment.method || appointment.paymentMethod || 'Online Payment';
                const amount = appointment.payment.amount || appointment.fees || '';
                const transactionId = appointment.payment.transactionId || appointment.transactionId || 'N/A';

                doc.text(`Payment Method: ${paymentMethod}`, margin, yPos);
                yPos += 8;
                doc.text(`Amount: ${currencySymbol}${amount}`, margin, yPos);
                yPos += 8;
                doc.text(`Transaction ID: ${transactionId}`, margin, yPos);
                yPos += 8;
            }

            // Add footer
            yPos = doc.internal.pageSize.getHeight() - 20;
            doc.setFontSize(10);
            doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, yPos, { align: 'center' });

            // Get the PDF as a blob
            const pdfBlob = doc.output('blob');
            
            // Set the current appointment and PDF blob for the popup
            setCurrentAppointment(appointment);
            setPdfBlob(pdfBlob);
            
            // Show the Google Drive popup
            setShowDrivePopup(true);
            
        } catch (error) {
            console.error('Error preparing PDF for Google Drive:', error);
            toast.error('Failed to prepare PDF for Google Drive: ' + (error.message || 'Unknown error'));
        }
    };
    
    // Function to handle the actual upload to Google Drive via backend
    const uploadToDriveViaBackend = async () => {
        try {
            if (!pdfBlob || !currentAppointment) {
                toast.error('No PDF or appointment data available');
                return;
            }
            
            // Set uploading state to true
            setIsUploading(true);
            
            // Create a File object from the blob
            const file = new File([pdfBlob], `Appointment_${currentAppointment._id}.pdf`, { type: 'application/pdf' });
            
            // Create FormData and append the file
            const formData = new FormData();
            formData.append('pdfFile', file);
            
            toast.info('Uploading to Google Drive...');
            const res = await fetch(backendUrl + '/api/upload-to-drive', {
                method: 'POST',
                body: formData,
            });
            
            const result = await res.json();
            
            if (result.success) {
                toast.success(`Uploaded to Google Drive successfully!`);
                // Close the popup
                setShowDrivePopup(false);
                // Open the link in a new tab
                window.open(result.driveLink, '_blank');
            } else {
                // Handle error from backend
                toast.error(result.error || 'Failed to upload to Google Drive');
                console.error('Google Drive upload error:', result.error);
            }
        } catch (error) {
            toast.error('Error uploading to Google Drive: ' + (error.message || 'Unknown error'));
            console.error('Google Drive upload exception:', error);
        } finally {
            // Reset uploading state
            setIsUploading(false);
        }
    };
    
    // Function to generate and download appointment details as PDF
    const downloadAppointmentPDF = (appointment) => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let yPos = 20;

            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('Appointment Details', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Add doctor info
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Doctor Information', margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Name: ${appointment.docData.name}`, margin, yPos);
            yPos += 8;
            doc.text(`Speciality: ${appointment.docData.speciality}`, margin, yPos);
            yPos += 8;
            doc.text('Address:', margin, yPos);
            yPos += 8;
            doc.text(`${appointment.docData.address.line1}`, margin, yPos);
            yPos += 8;
            doc.text(`${appointment.docData.address.line2}`, margin, yPos);
            yPos += 15;

            // Add appointment details
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Appointment Details', margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Date: ${slotDateFormat(appointment.slotDate)}`, margin, yPos);
            yPos += 8;
            doc.text(`Time: ${appointment.slotTime}`, margin, yPos);
            yPos += 8;
            doc.text(`Status: ${appointment.isCompleted ? 'Completed' : appointment.cancelled ? 'Cancelled' : 'Scheduled'}`, margin, yPos);
            yPos += 15;

            // Add payment details
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Payment Details', margin, yPos);
            yPos += 10;

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text(`Payment Status: ${appointment.payment ? 'Paid' : 'Not Paid'}`, margin, yPos);
            yPos += 8;
            if (appointment.payment) {
                // Check if payment details exist in the payment object
                const paymentMethod = appointment.payment.method || appointment.paymentMethod || 'Online Payment';
                const amount = appointment.payment.amount || appointment.fees || '';
                const transactionId = appointment.payment.transactionId || appointment.transactionId || 'N/A';

                doc.text(`Payment Method: ${paymentMethod}`, margin, yPos);
                yPos += 8;
                doc.text(`Amount: ${currencySymbol}${amount}`, margin, yPos);
                yPos += 8;
                doc.text(`Transaction ID: ${transactionId}`, margin, yPos);
                yPos += 8;
            }

            // Add footer
            yPos = doc.internal.pageSize.getHeight() - 20;
            doc.setFontSize(10);
            doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, yPos, { align: 'center' });

            // Save the PDF
            doc.save(`Appointment_${appointment._id}.pdf`);
            toast.success('Appointment details downloaded successfully');
        } catch (error) {
            console.log(error);
            toast.error('Failed to download appointment details');
        }
    };

    // Function to generate and download all appointments as PDF
    const downloadAllAppointmentsPDF = () => {
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            let yPos = 20;

            // Add title
            doc.setFontSize(18);
            doc.setFont('helvetica', 'bold');
            doc.text('All Appointments Summary', pageWidth / 2, yPos, { align: 'center' });
            yPos += 15;

            // Filter appointments based on active tab
            const filteredAppointments = filterAppointmentsByTab(appointments, activeTab);

            // Loop through all appointments
            filteredAppointments.forEach((appointment, index) => {
                // Check if we need a new page
                if (yPos > 250) {
                    doc.addPage();
                    yPos = 20;
                }

                // Add appointment separator if not first appointment
                if (index > 0) {
                    doc.setDrawColor(200, 200, 200);
                    doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
                    yPos += 10;
                }

                // Add doctor name and speciality
                doc.setFontSize(14);
                doc.setFont('helvetica', 'bold');
                doc.text(`${appointment.docData.name} - ${appointment.docData.speciality}`, margin, yPos);
                yPos += 10;

                // Add appointment details
                doc.setFontSize(12);
                doc.setFont('helvetica', 'normal');
                doc.text(`Date: ${slotDateFormat(appointment.slotDate)} | Time: ${appointment.slotTime}`, margin, yPos);
                yPos += 8;

                // Add status
                let status = 'Scheduled';
                if (appointment.isCompleted) status = 'Completed';
                if (appointment.cancelled) status = 'Cancelled';

                doc.text(`Status: ${status}`, margin, yPos);
                yPos += 8;

                // Add payment status
                doc.text(`Payment: ${appointment.payment ? 'Paid' : 'Not Paid'}`, margin, yPos);
                yPos += 20;
            });

            // Add footer
            yPos = doc.internal.pageSize.getHeight() - 20;
            doc.setFontSize(10);
            doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, yPos, { align: 'center' });

            // Save the PDF
            doc.save(`All_Appointments_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('All appointments downloaded successfully');
        } catch (error) {
            console.log(error);
            toast.error('Failed to download appointments');
        }
    };

    // Add this function near the other download functions
    const downloadPkpass = async (appointmentId) => {
        try {
            const response = await fetch(`${backendUrl}/api/wallet/appointments/${appointmentId}/pass`);
            if (!response.ok) throw new Error('Failed to download pass');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `appointment-${appointmentId}.pkpass`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            toast.error('Could not download pass.');
        }
    };

    // Filter appointments based on active tab
    const filterAppointmentsByTab = (appointments, tab) => {
        const today = new Date();

        switch (tab) {
            case 'upcoming':
                return appointments.filter(appointment => {
                    // Not cancelled and not completed
                    return !appointment.cancelled && !appointment.isCompleted;
                });
            case 'past':
                return appointments.filter(appointment => {
                    // Completed appointments
                    return appointment.isCompleted;
                });
            case 'cancelled':
                return appointments.filter(appointment => {
                    // Cancelled appointments
                    return appointment.cancelled;
                });
            default:
                return appointments;
        }
    };

    // Get current appointments based on pagination
    const getCurrentAppointments = () => {
        const filteredAppointments = filterAppointmentsByTab(appointments, activeTab);
        const indexOfLastAppointment = currentPage * appointmentsPerPage;
        const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
        return filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);
    };

    // Calculate total pages
    const totalPages = Math.ceil(filterAppointmentsByTab(appointments, activeTab).length / appointmentsPerPage);

    // Handle page changes
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Initialize Leaflet map
    const initializeMap = () => {
        // Import Leaflet dynamically to avoid SSR issues
        import('leaflet').then(L => {
            // Check if the map already exists
            if (mapRef.current) {
                mapRef.current.remove();
            }

            // Create a new map
            const map = L.map(mapContainerRef.current).setView([20.5937, 78.9629], 5); // Default center on India

            // Add the OpenStreetMap tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            // Store the map reference
            mapRef.current = map;
        });
    };

    // Search location using OpenStreetMap Nominatim API
    const searchLocation = async () => {
        if (!searchQuery.trim()) {
            toast.error('Please enter a location to search');
            return;
        }

        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                setSearchResults({
                    lat: parseFloat(result.lat),
                    lon: parseFloat(result.lon),
                    displayName: result.display_name
                });

                // Update map to show the location
                updateMapLocation(parseFloat(result.lat), parseFloat(result.lon), result.display_name);
            } else {
                toast.error('No results found for your search query');
            }
        } catch (error) {
            console.error('Error searching location:', error);
            toast.error('Failed to search location');
        }
    };

    // Update map with new location
    const updateMapLocation = (lat, lon, displayName) => {
        import('leaflet').then(L => {
            if (!mapRef.current) return;

            // Update map view
            mapRef.current.setView([lat, lon], 16);

            // Remove previous marker if exists
            if (markerRef.current) {
                mapRef.current.removeLayer(markerRef.current);
            }

            // Add marker
            const marker = L.marker([lat, lon]).addTo(mapRef.current)
                .bindPopup(displayName)
                .openPopup();

            // Store marker reference
            markerRef.current = marker;

            // Show toast notification
            toast.success('Location found! Click "Open in Google Maps" to navigate.');
        });
    };

    // Open location in Google Maps
    const openInGoogleMaps = () => {
        if (!searchResults) return;

        const { lat, lon } = searchResults;
        window.open(`https://www.google.com/maps?q=${lat},${lon}`, '_blank');
    };

    // Utility to detect Android
    const isAndroid = () => /android/i.test(navigator.userAgent);

    // Add downloadGooglePkpass function
    const downloadGooglePkpass = async (appointmentId) => {
        try {
            console.log('Downloading Google Wallet pass for appointment:', appointmentId);
            toast.info('Generating Google Wallet pass...');
            
            const response = await fetch(`${backendUrl}/api/wallet/appointments/${appointmentId}/google-pass`);
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);
                throw new Error(`Failed to download pass: ${response.status} ${errorText}`);
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success && data.passUrl) {
                // Open the Google Wallet pass URL in a new tab
                console.log('Opening Google Wallet pass URL:', data.passUrl);
                window.open(data.passUrl, '_blank');
                toast.success('Google Wallet pass generated successfully!');
            } else {
                console.error('Invalid response data:', data);
                toast.error(data.message || 'Could not generate Google Wallet pass.');
            }
        } catch (error) {
            console.error('Error generating Google Wallet pass:', error);
            toast.error(`Could not generate Google Wallet pass: ${error.message}`);
        }
    };

    useEffect(() => {
        if (token) {
            getUserAppointments();
        }
    }, [token]);

    // Reset to page 1 when changing tabs
    useEffect(() => {
        setCurrentPage(1);
    }, [activeTab]);

    // Initialize map when showMap changes to true
    useEffect(() => {
        if (showMap) {
            // Small delay to ensure the DOM element exists
            setTimeout(() => {
                initializeMap();
            }, 100);
        }
    }, [showMap]);

    // Clean up map on component unmount
    useEffect(() => {
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
            }
        };
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">My Appointments</h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowMap(!showMap)}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {showMap ? 'Hide Map' : 'Find Location'}
                    </button>
                    <button
                        onClick={downloadAllAppointmentsPDF}
                        className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-all flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Export All PDF
                    </button>
                </div>
            </div>

            {/* Map section */}
            {showMap && (
                <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h2 className="text-lg font-semibold mb-3">Find Location on Map</h2>
                    <div className="flex flex-col md:flex-row gap-3 mb-4">
                        <input
                            type="text"
                            placeholder="Search for a hospital or clinic (e.g. JAMKANDORNA CITY HOSPITAL)"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="flex-1 p-2 border rounded-md"
                        />
                        <button
                            onClick={searchLocation}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-all"
                        >
                            Search
                        </button>
                        {searchResults && (
                            <button
                                onClick={openInGoogleMaps}
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-all flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Open in Google Maps
                            </button>
                        )}
                    </div>
                    <div
                        ref={mapContainerRef}
                        className="h-64 rounded-md border border-gray-200"
                    ></div>
                    {searchResults && (
                        <div className="mt-2 text-sm text-gray-600">
                            <p><strong>Found:</strong> {searchResults.displayName}</p>
                            <p><strong>Coordinates:</strong> {searchResults.lat}, {searchResults.lon}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Tab navigation */}
            <div className="flex border-b mb-6">
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'upcoming' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('upcoming')}
                >
                    Upcoming
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'past' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('past')}
                >
                    Past
                </button>
                <button
                    className={`py-2 px-4 font-medium ${activeTab === 'cancelled' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('cancelled')}
                >
                    Cancelled
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            ) : getCurrentAppointments().length === 0 ? (
                <div className="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-600">No {activeTab} appointments found</h3>
                    <p className="mt-1 text-gray-500">You don't have any {activeTab} appointments at the moment.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-6">
                        {getCurrentAppointments().map((item, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all">
                                <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4">
                                    <div className="flex justify-center md:justify-start">
                                        <img className="w-36 h-36 object-cover rounded-lg shadow" src={item.docData.image} alt={item.docData.name} />
                                    </div>

                                    <div className="flex-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="text-gray-800 text-lg font-semibold">{item.docData.name}</p>
                                            {item.isCompleted && (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-600">Completed</span>
                                            )}
                                            {item.cancelled && (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-600">Cancelled</span>
                                            )}
                                            {!item.cancelled && !item.isCompleted && (
                                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">Upcoming</span>
                                            )}
                                        </div>
                                        <p className="text-primary font-medium">{item.docData.speciality}</p>

                                        <div className="mt-3 flex items-center">
                                            <div className="bg-primary/10 p-2 rounded-full mr-3">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Date & Time</p>
                                                <p className="text-gray-700 font-medium">{slotDateFormat(item.slotDate)} | {item.slotTime}</p>
                                            </div>
                                        </div>

                                        <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                                            <p className="text-gray-700 font-medium">Address:</p>
                                            <p className="text-gray-600">{item.docData.address.line1}</p>
                                            <p className="text-gray-600">{item.docData.address.line2}</p>

                                            {/* Add button to find this location on map */}
                                            <button
                                                onClick={() => {
                                                    setShowMap(true);
                                                    setSearchQuery(`${item.docData.address.line1}, ${item.docData.address.line2}`);
                                                    // Small delay to ensure map is initialized
                                                    setTimeout(() => {
                                                        searchLocation();
                                                    }, 300);
                                                }}
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Find on map
                                            </button>
                                        </div>

                                        {/* Add to Google Calendar Button */}
                                        {!item.cancelled && !item.isCompleted && (
                                            <a
                                                href={createGoogleCalendarUrl(item)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-3 flex items-center justify-center gap-2 py-2 px-4 bg-blue-50 text-blue-600 border border-blue-200 rounded-md hover:bg-blue-100 transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                                                    <path d="M19,4H17V3a1,1,0,0,0-2,0V4H9V3A1,1,0,0,0,7,3V4H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V7A3,3,0,0,0,19,4Zm1,15a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V10H20Z" />
                                                </svg>
                                                Add to Google Calendar
                                            </a>
                                        )}

                                    </div>

                                    <div className="flex flex-col gap-2 justify-end">
                                        {!item.cancelled && !item.payment && !item.isCompleted && payment !== item._id && (
                                            <button
                                                onClick={() => setPayment(item._id)}
                                                className="w-full py-2 border border-primary rounded-md text-primary font-medium hover:bg-primary hover:text-white transition-all duration-300"
                                            >
                                                Pay Online
                                            </button>
                                        )}

                                        {!item.cancelled && !item.payment && !item.isCompleted && payment === item._id && (
                                            <>
                                                <button
                                                    onClick={() => appointmentStripe(item._id)}
                                                    className="w-full py-2 px-4 border rounded-md hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                                                >
                                                    <img className="max-w-20 max-h-5" src={assets.stripe_logo} alt="Stripe" />
                                                </button>

                                                <button
                                                    onClick={() => appointmentRazorpay(item._id)}
                                                    className="w-full py-2 px-4 border rounded-md hover:bg-gray-50 transition-all duration-300 flex items-center justify-center"
                                                >
                                                    <img className="max-w-20 max-h-5" src={assets.razorpay_logo} alt="Razorpay" />
                                                </button>
                                            </>
                                        )}

                                        {!item.cancelled && item.payment && !item.isCompleted && (
                                            <>
                                                <div className="w-full py-2 border rounded-md text-center text-green-600 bg-green-50 font-medium">
                                                    Paid
                                                </div>

                                                <button
                                                    onClick={() => downloadAppointmentPDF(item)}
                                                    className="w-full py-2 border rounded-md text-gray-600 font-medium hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Download Details
                                                </button>
                                            </>
                                        )}

                                        {item.isCompleted && (
                                            <>
                                            <button
                                                onClick={() => downloadAppointmentPDF(item)}
                                                className="w-full py-2 border rounded-md text-gray-600 font-medium hover:bg-primary hover:text-white transition-all duration-300 flex items-center justify-center gap-2 mb-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Details
                                            </button>
                                            <button
                                                onClick={() => handleSaveToDrive(item)}
                                                className="w-full py-2 border rounded-md text-blue-600 font-medium hover:bg-blue-600 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                                                </svg>
                                                Save to Drive
                                            </button>
                                            </>
                                        )}

                                        {(item.payment || item.isCompleted) && (
                                            <button
                                                onClick={() => downloadPkpass(item._id)}
                                                className="w-full py-2 border rounded-md text-black font-medium hover:bg-yellow-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                                                style={{ background: '#f7e600', borderColor: '#f7e600' }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Pass
                                            </button>
                                        )}
                                        {isAndroid() && (item.payment || item.isCompleted) && (
                                            <button
                                                onClick={() => downloadGooglePkpass(item._id)}
                                                className="w-full py-2 border rounded-md text-white font-medium bg-green-600 hover:bg-green-700 transition-all duration-300 flex items-center justify-center gap-2"
                                                style={{ marginTop: 8 }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download for Google Wallet
                                            </button>
                                        )}

                                        {!item.cancelled && !item.isCompleted && (
                                            <button
                                                onClick={() => cancelAppointment(item._id)}
                                                className="w-full py-2 border rounded-md text-red-600 font-medium hover:bg-red-600 hover:text-white transition-all duration-300"
                                            >
                                                Cancel Appointment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center mt-6">
                            <nav className="flex items-center space-x-1">
                                <button
                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                    disabled={currentPage === 1}
                                    className={`px-3 py-1 rounded-md ${currentPage === 1
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Previous
                                </button>

                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePageChange(index + 1)}
                                        className={`px-3 py-1 rounded-md ${currentPage === index + 1
                                            ? 'bg-primary text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}

                                <button
                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                    disabled={currentPage === totalPages}
                                    className={`px-3 py-1 rounded-md ${currentPage === totalPages
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    )}
                </>
            )}
            <GoogleFitData />
            
            {/* Google Drive Popup */}
            {showDrivePopup && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                {/* Google Drive Logo */}
                                <svg className="h-6 w-6 mr-2" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                                </svg>
                                <h3 className="text-lg font-semibold text-gray-900">Save to Google Drive</h3>
                            </div>
                            <button
                                onClick={() => setShowDrivePopup(false)}
                                className="text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUploading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <div className="bg-blue-50 p-4 rounded-lg mb-5">
                            <div className="flex items-center mb-4">
                                <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mr-3 border border-gray-200">
                                    {/* Google Drive Icon */}
                                    <svg className="h-8 w-8" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                        <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                                        <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#00ac47"/>
                                        <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ea4335"/>
                                        <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                                        <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                                        <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Save appointment details to</p>
                                    <p className="font-semibold text-gray-900">Google Drive</p>
                                </div>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <p className="text-sm text-gray-600 mb-2">This will save your appointment details as a PDF file to your Google Drive account.</p>
                                <p className="text-sm text-gray-600">You'll be able to access it anytime from your Google Drive.</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDrivePopup(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isUploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={uploadToDriveViaBackend}
                                className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-colors flex items-center"
                                style={{ backgroundColor: '#4285F4', borderColor: '#4285F4' }}
                                onMouseOver={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#3367D6')}
                                onMouseOut={(e) => !isUploading && (e.currentTarget.style.backgroundColor = '#4285F4')}
                                disabled={isUploading}
                            >
                                {isUploading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        {/* Google Drive Icon */}
                                        <svg className="h-4 w-4 mr-2" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                                            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#ffffff"/>
                                            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44a9.06 9.06 0 0 0 -1.2 4.5h27.5z" fill="#ffffff"/>
                                            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.502l5.852 11.5z" fill="#ffffff"/>
                                            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#ffffff"/>
                                            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#ffffff"/>
                                            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffffff"/>
                                        </svg>
                                        Save to Drive
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MyAppointments