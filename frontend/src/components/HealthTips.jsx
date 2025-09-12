import React, { useState, useEffect } from 'react'

const HealthTips = () => {
    const [currentTip, setCurrentTip] = useState(0)

    const healthTips = [
        {
            title: 'Stay Hydrated',
            description: 'Drink at least 8 glasses of water daily to maintain good health.',
            icon: '💧'
        },
        {
            title: 'Regular Exercise',
            description: '30 minutes of daily exercise can significantly improve your health.',
            icon: '🏃‍♂️'
        },
        {
            title: 'Balanced Diet',
            description: 'Include fruits, vegetables, and whole grains in your daily meals.',
            icon: '🥗'
        },
        {
            title: 'Adequate Sleep',
            description: 'Get 7-9 hours of quality sleep every night for better health.',
            icon: '😴'
        },
        {
            title: 'Mental Wellness',
            description: 'Practice meditation or mindfulness for better mental health.',
            icon: '🧘‍♂️'
        }
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % healthTips.length)
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 py-16 px-4">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-medium text-center mb-8 text-gray-800">Daily Health Tips</h2>
                
                <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg p-6">
                    {/* Tips Carousel */}
                    <div className="transition-all duration-500 ease-in-out transform"
                         style={{ transform: `translateX(-${currentTip * 100}%)` }}>
                        <div className="flex">
                            {healthTips.map((tip, index) => (
                                <div key={index} className="w-full flex-shrink-0 px-4">
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-4xl mb-4">{tip.icon}</span>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">{tip.title}</h3>
                                        <p className="text-gray-600">{tip.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Dots */}
                    <div className="flex justify-center mt-6 gap-2">
                        {healthTips.map((_, index) => (
                            <button
                                key={index}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentTip ? 'bg-blue-500 w-4' : 'bg-gray-300'}`}
                                onClick={() => setCurrentTip(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default HealthTips