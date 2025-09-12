import React, { useState } from 'react';

const Blog = () => {
    const [activeCategory, setActiveCategory] = useState('all');
    
    // Sample blog categories
    const categories = [
        { id: 'all', name: 'All Posts' },
        { id: 'health-tips', name: 'Health Tips' },
        { id: 'tech', name: 'Healthcare Tech' },
        { id: 'wellness', name: 'Wellness' },
        { id: 'medical', name: 'Medical Updates' }
    ];
    
    // Sample featured post
    const featuredPost = {
        id: 1,
        title: "The Future of Telemedicine in 2025",
        excerpt: "Explore how AI, VR, and new technologies are revolutionizing remote healthcare experiences.",
        author: "Dr. Sarah Johnson",
        date: "April 10, 2025",
        category: "tech",
        readTime: "8 min read",
        image: "/api/placeholder/800/400"
    };
    
    // Sample blog posts
    const blogPosts = [
        {
            id: 2,
            title: "10 Essential Health Tips for Remote Workers",
            excerpt: "Working from home? Follow these key practices to maintain your physical and mental health.",
            author: "Dr. Michael Chen",
            date: "April 5, 2025",
            category: "health-tips",
            readTime: "6 min read",
            image: "/api/placeholder/400/250"
        },
        {
            id: 3,
            title: "Understanding Your Blood Test Results",
            excerpt: "A comprehensive guide to interpreting common blood test parameters and what they mean for your health.",
            author: "Dr. Lisa Williams",
            date: "March 28, 2025",
            category: "medical",
            readTime: "12 min read",
            image: "/api/placeholder/400/250"
        },
        {
            id: 4,
            title: "Mindfulness Techniques for Busy Professionals",
            excerpt: "Simple mindfulness practices that can be incorporated into your daily routine for better mental health.",
            author: "Emma Roberts, Wellness Coach",
            date: "March 25, 2025",
            category: "wellness",
            readTime: "5 min read",
            image: "/api/placeholder/400/250"
        },
        {
            id: 5,
            title: "How AI is Transforming Medical Diagnostics",
            excerpt: "Recent advances in artificial intelligence are revolutionizing how doctors diagnose and treat diseases.",
            author: "Dr. James Wilson",
            date: "March 20, 2025",
            category: "tech",
            readTime: "10 min read",
            image: "/api/placeholder/400/250"
        },
        {
            id: 6,
            title: "Seasonal Allergies: Prevention and Treatment",
            excerpt: "Expert advice on managing seasonal allergies with both medical and natural approaches.",
            author: "Dr. Patricia Garcia",
            date: "March 15, 2025",
            category: "health-tips",
            readTime: "7 min read",
            image: "/api/placeholder/400/250"
        }
    ];
    
    // Filter posts based on active category
    const filteredPosts = activeCategory === 'all' 
        ? blogPosts 
        : blogPosts.filter(post => post.category === activeCategory);

    return (
        <div className="flex flex-col items-center px-4 py-8 font-sans">
            <header className="w-full max-w-6xl mb-10 text-center">
                <h1 className="text-4xl font-bold mb-2">Health & Wellness Blog</h1>
                <p className="text-gray-600 text-lg max-w-3xl mx-auto">
                    Expert insights, tips, and the latest updates in healthcare technology and practices
                </p>
            </header>
            
            {/* Category Navigation */}
            <div className="w-full max-w-6xl mb-12">
                <div className="flex flex-wrap justify-center gap-2 md:gap-6">
                    {categories.map(category => (
                        <button 
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)} 
                            className={`px-5 py-2 rounded-full transition-all ${
                                activeCategory === category.id 
                                    ? 'bg-primary text-white' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Featured Post */}
            <div className="w-full max-w-6xl mb-16">
                <div className="relative overflow-hidden rounded-xl shadow-lg group">
                    <img 
                        src={featuredPost.image} 
                        alt={featuredPost.title} 
                        className="w-full h-96 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                        <span className="text-primary bg-white px-3 py-1 rounded-full text-sm font-medium inline-block mb-3 w-max">
                            Featured
                        </span>
                        <h2 className="text-3xl font-bold text-white mb-2">{featuredPost.title}</h2>
                        <p className="text-white/90 text-lg mb-4 max-w-2xl">{featuredPost.excerpt}</p>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center mr-3">
                                    <span className="text-gray-600 font-medium">{featuredPost.author.split(' ').map(n => n[0]).join('')}</span>
                                </div>
                                <div>
                                    <p className="text-white font-medium">{featuredPost.author}</p>
                                    <p className="text-white/75 text-sm">{featuredPost.date} • {featuredPost.readTime}</p>
                                </div>
                            </div>
                            <button className="bg-primary text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all">
                                Read Article
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Latest Posts */}
            <div className="w-full max-w-6xl mb-16">
                <h2 className="text-2xl font-bold mb-8">
                    {activeCategory === 'all' ? 'Latest Articles' : `${categories.find(c => c.id === activeCategory).name}`}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map(post => (
                        <div key={post.id} className="border rounded-xl overflow-hidden hover:shadow-lg transition-all">
                            <div className="overflow-hidden">
                                <img 
                                    src={post.image} 
                                    alt={post.title} 
                                    className="w-full h-52 object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                            <div className="p-6">
                                <span className="text-sm font-medium text-primary mb-2 inline-block">
                                    {categories.find(c => c.id === post.category).name}
                                </span>
                                <h3 className="text-xl font-bold mb-3 hover:text-primary transition-colors cursor-pointer">
                                    {post.title}
                                </h3>
                                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-500">
                                        {post.date} • {post.readTime}
                                    </div>
                                    <button className="text-primary font-medium hover:underline">
                                        Read More
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                
                {filteredPosts.length === 0 && (
                    <div className="text-center py-16">
                        <p className="text-gray-500 text-lg">No articles found in this category.</p>
                    </div>
                )}
                
                <div className="mt-10 text-center">
                    <button className="border border-primary text-primary px-8 py-3 rounded-md hover:bg-primary hover:text-white transition-all">
                        Load More Articles
                    </button>
                </div>
            </div>
            
            {/* Newsletter Subscription */}
            <div className="w-full max-w-6xl bg-primary bg-opacity-10 rounded-lg p-8 text-center">
                <h2 className="text-2xl font-bold mb-3">Stay Updated with Health Insights</h2>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                    Subscribe to our newsletter and receive the latest health tips, medical updates, and wellness advice directly in your inbox.
                </p>
                <div className="flex max-w-md mx-auto">
                    <input 
                        type="email" 
                        placeholder="Your email address" 
                        className="flex-1 px-4 py-3 rounded-l-md border-y border-l focus:outline-none"
                    />
                    <button className="bg-primary text-white px-6 py-3 rounded-r-md hover:bg-opacity-90 transition-all">
                        Subscribe
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Blog;