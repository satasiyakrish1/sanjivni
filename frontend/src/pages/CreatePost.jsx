import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

const CreatePost = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        tags: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userId = localStorage.getItem('userId');
            if (!userId) {
                setError('Please login to create a post');
                return;
            }

            const response = await fetch('/api/community/create-post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    ...formData,
                    userId,
                    tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
                })
            });

            const data = await response.json();
            if (data.success) {
                navigate('/community');
            } else {
                setError(data.message || 'Failed to create post');
            }
        } catch (err) {
            setError('Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <SEO title="Create Post - Medical Community" description="Share your medical knowledge and experiences with the community" />
            
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Create a Post</h1>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter your post title"
                        />
                    </div>

                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                            Content
                        </label>
                        <textarea
                            id="content"
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows="6"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Share your medical knowledge or experience..."
                        />
                    </div>

                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter tags separated by commas (e.g., cardiology, research, case-study)"
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate('/community')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;