import React from 'react'
import { assets } from '../assets/assets'
import SearchBar from './SearchBar'

const Header = () => {
    return (
        <div className='relative flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20 overflow-hidden'>
            

            {/* --------- Header Left --------- */}
            <div className='relative md:w-1/2 flex flex-col items-start justify-center gap-6 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
                <div className='animate-fade-in-up'>
                    <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight'>
                        Book Appointment <br />  With Trusted Doctors
                    </p>
                </div>
                
                <SearchBar />

                <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light animate-fade-in-up animation-delay-200'>
                    <img className='w-28 hover:scale-105 transition-transform duration-300' src={assets.group_profiles} alt="Trusted Doctors" />
                    <p>Simply browse through our extensive list of trusted doctors, <br className='hidden sm:block' /> schedule your appointment hassle-free.</p>
                </div>
                
                <div className='flex gap-4 animate-fade-in-up animation-delay-300'>
                    <a href='#speciality' className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-[#595959] text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'>
                        Book appointment <img className='w-3' src={assets.arrow_icon} alt="Arrow" />
                    </a>
                    <a href='#statistics' className='flex items-center gap-2 bg-transparent border-2 border-white px-8 py-3 rounded-full text-white text-sm m-auto md:m-0 hover:scale-105 transition-all duration-300'>
                        Learn More
                    </a>
                </div>
            </div>

            {/* --------- Header Right --------- */}
            <div className='md:w-1/2 relative'>
                <img className='w-full md:absolute bottom-0 h-auto rounded-lg' src={assets.header_img} alt="" />
            </div>
        </div>
    )
}

export default Header