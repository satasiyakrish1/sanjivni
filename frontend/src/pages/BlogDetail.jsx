import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';

const BlogDetail = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await axios.get(`/api/admin/blog/posts/${id}`);
        setBlog(response.data);
        // Check if the current user has liked the blog
        // This would need to be implemented based on your auth system
        setError(null);
      } catch (err) {
        setError('Failed to fetch blog. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlog();
  }, [id]);

  const handleLike = async () => {
    try {
      await axios.post(`/api/admin/blog/posts/${id}/like`);
      // Update the blog state to reflect the new like
      setBlog(prev => ({
        ...prev,
        likes: isLiked
          ? prev.likes.filter(like => like !== 'currentUserId') // Remove like
          : [...prev.likes, 'currentUserId'] // Add like
      }));
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to like blog:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await axios.post(`/api/admin/blog/${id}/comment`, { content: comment });
      setBlog(prev => ({
        ...prev,
        comments: [...prev.comments, response.data]
      }));
      setComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-4">{error}</div>;
  if (!blog) return <div className="text-center py-4">Blog not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl">{blog.title}</CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              {blog.userImage && (
                <img
                  src={blog.userImage}
                  alt={blog.userName}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span>{blog.userName}</span>
            </div>
            <span className="text-muted-foreground">
              {new Date(blog.createdAt).toLocaleDateString()}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="secondary">{blog.category}</Badge>
            {blog.tags.map(tag => (
              <Badge key={tag} variant="outline">{tag}</Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none mb-8">
            {blog.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-8">
            <Button
              variant={isLiked ? "secondary" : "outline"}
              onClick={handleLike}
              className="flex items-center gap-2"
            >
              <span>❤️</span>
              <span>{blog.likes.length} likes</span>
            </Button>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Comments ({blog.comments.length})</h3>
            
            <form onSubmit={handleComment} className="space-y-4">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="w-full"
              />
              <Button type="submit" disabled={!comment.trim()}>
                Post Comment
              </Button>
            </form>

            <div className="space-y-4">
              {blog.comments.map((comment, index) => (
                <Card key={index}>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{comment.userName}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p>{comment.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BlogDetail;