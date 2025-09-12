import React from 'react';
import { specialityData } from '../assets/assets';

const SpecialityMenu = () => {
    return (
        <div id='speciality' className='flex flex-col items-center gap-4 py-16 text-[#262626]'>
            <h1 className='text-3xl font-medium'>Our Specialities</h1>
            <p className='sm:w-1/3 text-center text-sm'>Explore our healthcare services and find the right care for your needs.</p>
            <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
                {specialityData.map((item, index) => (
                    <div 
                        className='flex flex-col items-center text-xs flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500 cursor-default'
                        key={index}
                    >
                        <img 
                            className='w-16 sm:w-24 mb-2' 
                            src={item.image} 
                            alt={item.speciality} 
                        />
                        <p>{item.speciality}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SpecialityMenu;