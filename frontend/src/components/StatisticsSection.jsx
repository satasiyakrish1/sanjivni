import React, { useState, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';

const StatisticsSection = () => {
  // Static statistics data
  const statistics = [
    { id: 1, title: 'Happy Patients', value: 1000, icon: '😊' },
    { id: 2, title: 'Expert Doctors', value: 50, icon: '👨‍⚕️' },
    { id: 3, title: 'Years of Service', value: 10, icon: '⭐' },
    { id: 4, title: 'Health Tips', value: 200, icon: '💡' },
  ];

  // State to trigger animation when component is in view
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // State to hold current count values during animation
  const [counts, setCounts] = useState(statistics.map(() => 0));

  // Animate counting effect
  useEffect(() => {
    if (inView) {
      const duration = 2000; // 2 seconds for counting animation
      const startTime = Date.now();
      
      const animateCount = () => {
        const now = Date.now();
        const progress = Math.min(1, (now - startTime) / duration);
        
        const newCounts = statistics.map((stat) => {
          return Math.floor(stat.value * progress);
        });
        
        setCounts(newCounts);
        
        if (progress < 1) {
          requestAnimationFrame(animateCount);
        } else {
          // Ensure final values are exact
          setCounts(statistics.map(stat => stat.value));
        }
      };
      
      requestAnimationFrame(animateCount);
    }
  }, [inView]);

  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8 rounded-lg my-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Our Impact in Numbers</h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500">
            Transforming healthcare access across India
          </p>
        </div>

        <div ref={ref} className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {statistics.map((stat, index) => (
            <div 
              key={stat.id} 
              className="bg-white overflow-hidden shadow rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 text-center"
            >
              <div className="text-4xl mb-3">{stat.icon}</div>
              <h3 className="text-3xl font-bold text-primary mb-2">
                {formatNumber(counts[index])}+
              </h3>
              <p className="text-gray-600">{stat.title}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatisticsSection;