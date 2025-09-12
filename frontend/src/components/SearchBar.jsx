import React, { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)
    const [searchResults, setSearchResults] = useState([])
    const navigate = useNavigate()
    const { doctors } = useContext(AppContext)

    const handleSearch = (query) => {
        setSearchQuery(query)
        if (query.length > 0) {
            const filteredResults = doctors.filter(doctor => 
                doctor.name.toLowerCase().includes(query.toLowerCase()) ||
                doctor.speciality.toLowerCase().includes(query.toLowerCase())
            )
            setSearchResults(filteredResults.slice(0, 5))
        } else {
            setSearchResults([])
        }
    }

    return (
        <div className="relative w-full max-w-xl mx-auto mt-6">
            <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'bg-white shadow-lg' : 'bg-white/80'} rounded-full`}>
                <input
                    type="text"
                    placeholder="Search doctors or specialties..."
                    className="w-full px-6 py-3 bg-transparent outline-none rounded-full"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setIsExpanded(true)}
                    onBlur={() => setTimeout(() => setIsExpanded(false), 200)}
                />
                <button className="px-6 py-3 text-gray-600 hover:text-gray-800">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && isExpanded && (
                <div className="absolute w-full mt-2 bg-white rounded-xl shadow-lg overflow-hidden z-50">
                    {searchResults.map((result, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                                navigate(`/appointment/${result._id}`)
                                setSearchQuery('')
                                setSearchResults([])
                                scrollTo(0, 0)
                            }}
                        >
                            <img src={result.image} alt={result.name} className="w-10 h-10 rounded-full object-cover" />
                            <div>
                                <p className="font-medium text-gray-800">{result.name}</p>
                                <p className="text-sm text-gray-500">{result.speciality}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default SearchBar