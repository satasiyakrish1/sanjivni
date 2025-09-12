import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router-dom';

const Blogs = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

  const categories = ['Health Tips', 'Medical News', 'Patient Stories', 'Healthcare Technology', 'Wellness'];
  const allTags = [...new Set(blogs.flatMap(blog => blog.tags))];

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const response = await axios.get('/api/admin/blog/posts?status=published');
        setBlogs(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to fetch blogs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || blog.category === selectedCategory;
    const matchesTag = !selectedTag || blog.tags.includes(selectedTag);
    return matchesSearch && matchesCategory && matchesTag;
  });

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Blog Posts</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          type="text"
          placeholder="Search blogs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="md:w-1/3"
        />

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedTag} onValueChange={setSelectedTag}>
          <SelectTrigger className="md:w-1/4">
            <SelectValue placeholder="Filter by tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Tags</SelectItem>
            {allTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlogs.map(blog => (
          <Link to={`/blog/${blog._id}`} key={blog._id}>
            <Card className="h-full hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{blog.title}</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="secondary">{blog.category}</Badge>
                  {blog.tags.map(tag => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {blog.content.length > 150 
                    ? `${blog.content.substring(0, 150)}...` 
                    : blog.content}
                </p>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>By {blog.userName}</span>
                  <div className="flex items-center gap-2">
                    <span>❤️ {blog.likes.length}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Blogs;