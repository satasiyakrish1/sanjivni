import React from 'react';
import { useNavigate } from 'react-router-dom';

const TopDoctors = () => {
    const navigate = useNavigate();

    // Static doctor data
    const doctors = [
        {
            id: 1,
            name: 'Dr. Sarah Johnson',
            speciality: 'Cardiologist',
            available: true,
            image: 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-3543.jpg'
        },
        {
            id: 2,
            name: 'Dr. Michael Chen',
            speciality: 'Neurologist',
            available: true,
            image: 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-3543.jpg'
        },
        {
            id: 3,
            name: 'Dr. Emily Wilson',
            speciality: 'Pediatrician',
            available: false,
            image: 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-3543.jpg'
        },
        {
            id: 4,
            name: 'Dr. Robert Taylor',
            speciality: 'Dermatologist',
            available: true,
            image: 'https://img.freepik.com/free-photo/doctor-with-his-arms-crossed-white-background_1368-3543.jpg'
        }
    ];

    return (
        <div className='flex flex-col items-center gap-4 my-16 text-[#262626] md:mx-10'>
            <h1 className='text-3xl font-medium'>Trusted Doctors</h1>
            <p className='sm:w-1/3 text-center text-sm'>Simply browse through our extensive list of trusted doctors.</p>
            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-5 gap-y-6 px-3 sm:px-0'>
                {doctors.map((doctor) => (
                    <div 
                        key={doctor.id} 
                        className='border border-[#C9D8FF] rounded-xl overflow-hidden hover:translate-y-[-10px] transition-all duration-500'
                    >
                        <img 
                            className='w-full h-48 object-cover bg-[#EAEFFF]' 
                            src={doctor.image} 
                            alt={doctor.name} 
                        />
                        <div className='p-4'>
                            <div className={`flex items-center gap-2 text-sm ${doctor.available ? 'text-green-500' : 'text-gray-500'}`}>
                                <span className={`w-2 h-2 rounded-full ${doctor.available ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                <span>{doctor.available ? 'Available' : 'Not Available'}</span>
                            </div>
                            <p className='text-[#262626] text-lg font-medium mt-1'>{doctor.name}</p>
                            <p className='text-[#5C5C5C] text-sm'>{doctor.speciality}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button 
                className='bg-[#EAEFFF] text-gray-600 px-12 py-3 rounded-full mt-10 hover:bg-[#D9E2FF] transition-colors'
            >
                View All Doctors
            </button>
        </div>
    );
};

export default TopDoctors;