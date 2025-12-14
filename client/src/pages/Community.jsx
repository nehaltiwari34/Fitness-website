// src/pages/Community.jsx - COMPLETE DYNAMIC VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../utils/api';
import '../css/Community.css';

const Community = () => {
    const { user } = useAuth();
    const { socket, isConnected } = useSocket();
    
    const [activeTab, setActiveTab] = useState('feed');
    const [communityData, setCommunityData] = useState(null);
    const [posts, setPosts] = useState([]);
    const [articles, setArticles] = useState([]);
    const [challenges, setChallenges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [realTimeUpdates, setRealTimeUpdates] = useState(0);

    // Fetch real community data
    const fetchCommunityData = useCallback(async () => {
        if (!user) return;
        
        try {
            setLoading(true);
            console.log('💬 Fetching real community data...');
            
            const [postsResponse, articlesResponse, challengesResponse] = await Promise.all([
                api.get('/community/posts'),
                api.get('/community/articles'),
                api.get('/community/challenges')
            ]);

            if (postsResponse.data.success) {
                setPosts(postsResponse.data.posts || []);
            }

            if (articlesResponse.data.success) {
                setArticles(articlesResponse.data.articles || []);
            }

            if (challengesResponse.data.success) {
                setChallenges(challengesResponse.data.challenges || []);
            }

            console.log('✅ Real community data loaded');
        } catch (error) {
            console.error('❌ Community data fetch error:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchCommunityData();
        }
    }, [user, fetchCommunityData]);

    // Real-time updates
    useEffect(() => {
        if (socket) {
            socket.on('newPost', (data) => {
                console.log('📢 New post received:', data);
                setRealTimeUpdates(prev => prev + 1);
                setPosts(prev => [data.post, ...prev]);
            });

            socket.on('newComment', (data) => {
                console.log('💬 New comment received:', data);
                setRealTimeUpdates(prev => prev + 1);
                // Update posts with new comments
                setPosts(prev => prev.map(post => 
                    post._id === data.postId 
                        ? { ...post, comments: [...(post.comments || []), data.comment] }
                        : post
                ));
            });

            socket.on('likeUpdate', (data) => {
                console.log('❤️ Like update received:', data);
                setRealTimeUpdates(prev => prev + 1);
                setPosts(prev => prev.map(post => 
                    post._id === data.postId 
                        ? { ...post, likes: data.likes, hasLiked: data.hasLiked }
                        : post
                ));
            });

            return () => {
                socket.off('newPost');
                socket.off('newComment');
                socket.off('likeUpdate');
            };
        }
    }, [socket]);

    const handleCreatePost = async () => {
        if (!newPost.trim()) return;

        try {
            const response = await api.post('/community/posts', {
                content: newPost,
                type: 'text'
            });

            if (response.data.success) {
                setNewPost('');
                fetchCommunityData(); // Refresh posts
            }
        } catch (error) {
            console.error('Create post error:', error);
            alert('Failed to create post');
        }
    };

    const handleLikePost = async (postId) => {
        try {
            const response = await api.post(`/community/posts/${postId}/like`);
            if (response.data.success) {
                // Update local state immediately for better UX
                setPosts(prev => prev.map(post => 
                    post._id === postId 
                        ? { 
                            ...post, 
                            likes: response.data.likes,
                            hasLiked: response.data.hasLiked 
                        }
                        : post
                ));
            }
        } catch (error) {
            console.error('Like post error:', error);
        }
    };

    const handleAddComment = async (postId, comment) => {
        try {
            const response = await api.post(`/community/posts/${postId}/comments`, {
                content: comment
            });

            if (response.data.success) {
                fetchCommunityData(); // Refresh to get updated comments
            }
        } catch (error) {
            console.error('Add comment error:', error);
        }
    };

    const handleJoinChallenge = async (challengeId) => {
        try {
            const response = await api.post(`/community/challenges/${challengeId}/join`);
            if (response.data.success) {
                alert('Challenge joined successfully!');
                fetchCommunityData();
            }
        } catch (error) {
            console.error('Join challenge error:', error);
            alert('Failed to join challenge');
        }
    };

    if (loading) {
        return (
            <div className="community-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading community data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="community-container">
            {/* Header */}
            <div className="community-header">
                <h1>Fitness Community</h1>
                <p>Connect, share, and grow with fellow fitness enthusiasts</p>
                <div className="community-stats">
                    <span className="stat">
                        <strong>{posts.length}</strong> Posts
                    </span>
                    <span className="stat">
                        <strong>{challenges.length}</strong> Active Challenges
                    </span>
                    <span className="stat">
                        <strong>{articles.length}</strong> Articles
                    </span>
                </div>
            </div>

            {/* Connection Status */}
            <div className="connection-status">
                <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
                    {isConnected ? '🔌 Live' : '🔴 Offline'}
                </div>
                <span>Real-time community updates {isConnected ? 'active' : 'paused'}</span>
                {realTimeUpdates > 0 && (
                    <span className="update-badge">{realTimeUpdates} updates</span>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="community-nav">
                <button 
                    className={`nav-btn ${activeTab === 'feed' ? 'active' : ''}`}
                    onClick={() => setActiveTab('feed')}
                >
                    📰 Feed
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'challenges' ? 'active' : ''}`}
                    onClick={() => setActiveTab('challenges')}
                >
                    🏆 Challenges
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'articles' ? 'active' : ''}`}
                    onClick={() => setActiveTab('articles')}
                >
                    📚 Articles
                </button>
                <button 
                    className={`nav-btn ${activeTab === 'discussions' ? 'active' : ''}`}
                    onClick={() => setActiveTab('discussions')}
                >
                    💬 Discussions
                </button>
            </div>

            {/* Feed Tab */}
            {activeTab === 'feed' && (
                <FeedTab 
                    posts={posts}
                    newPost={newPost}
                    setNewPost={setNewPost}
                    onCreatePost={handleCreatePost}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    user={user}
                />
            )}

            {/* Challenges Tab */}
            {activeTab === 'challenges' && (
                <ChallengesTab 
                    challenges={challenges}
                    onJoinChallenge={handleJoinChallenge}
                    user={user}
                />
            )}

            {/* Articles Tab */}
            {activeTab === 'articles' && (
                <ArticlesTab 
                    articles={articles}
                />
            )}

            {/* Discussions Tab */}
            {activeTab === 'discussions' && (
                <DiscussionsTab 
                    posts={posts.filter(post => post.type === 'discussion')}
                    onLikePost={handleLikePost}
                    onAddComment={handleAddComment}
                    user={user}
                />
            )}
        </div>
    );
};

// Feed Tab Component
const FeedTab = ({ posts, newPost, setNewPost, onCreatePost, onLikePost, onAddComment, user }) => {
    const [commentInputs, setCommentInputs] = useState({});

    const handleCommentChange = (postId, value) => {
        setCommentInputs(prev => ({
            ...prev,
            [postId]: value
        }));
    };

    const handleSubmitComment = (postId) => {
        const comment = commentInputs[postId];
        if (comment && comment.trim()) {
            onAddComment(postId, comment);
            setCommentInputs(prev => ({
                ...prev,
                [postId]: ''
            }));
        }
    };

    return (
        <div className="feed-tab">
            {/* Create Post */}
            <div className="create-post-card">
                <div className="post-header">
                    <img 
                        src={user?.profile?.picture || '/default-avatar.png'} 
                        alt={user?.name}
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <h4>{user?.name}</h4>
                        <span>Share your fitness journey...</span>
                    </div>
                </div>
                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind? Share your workout achievements, ask questions, or motivate others!"
                    className="post-input"
                    rows="3"
                />
                <div className="post-actions">
                    <button 
                        onClick={onCreatePost}
                        disabled={!newPost.trim()}
                        className="btn-primary"
                    >
                        Post
                    </button>
                </div>
            </div>

            {/* Posts Feed */}
            <div className="posts-feed">
                {posts.length > 0 ? (
                    posts.map(post => (
                        <PostCard 
                            key={post._id}
                            post={post}
                            onLikePost={onLikePost}
                            commentInput={commentInputs[post._id] || ''}
                            onCommentChange={(value) => handleCommentChange(post._id, value)}
                            onSubmitComment={() => handleSubmitComment(post._id)}
                            currentUser={user}
                        />
                    ))
                ) : (
                    <div className="no-posts">
                        <div className="no-posts-icon">📝</div>
                        <h3>No Posts Yet</h3>
                        <p>Be the first to share your fitness journey with the community!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Post Card Component
const PostCard = ({ post, onLikePost, commentInput, onCommentChange, onSubmitComment, currentUser }) => {
    const [showComments, setShowComments] = useState(false);

    return (
        <div className="post-card">
            <div className="post-header">
                <img 
                    src={post.user?.profile?.picture || '/default-avatar.png'} 
                    alt={post.user?.name}
                    className="user-avatar"
                />
                <div className="user-info">
                    <h4>{post.user?.name}</h4>
                    <span className="post-time">
                        {new Date(post.createdAt).toLocaleDateString()} • 
                        {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            </div>

            <div className="post-content">
                <p>{post.content}</p>
                {post.image && (
                    <img src={post.image} alt="Post" className="post-image" />
                )}
            </div>

            <div className="post-stats">
                <span>{post.likes || 0} likes</span>
                <span>{post.comments?.length || 0} comments</span>
            </div>

            <div className="post-actions">
                <button 
                    onClick={() => onLikePost(post._id)}
                    className={`action-btn ${post.hasLiked ? 'liked' : ''}`}
                >
                    {post.hasLiked ? '❤️' : '🤍'} Like
                </button>
                <button 
                    onClick={() => setShowComments(!showComments)}
                    className="action-btn"
                >
                    💬 Comment
                </button>
                <button className="action-btn">
                    🔄 Share
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="comments-section">
                    {/* Add Comment */}
                    <div className="add-comment">
                        <img 
                            src={currentUser?.profile?.picture || '/default-avatar.png'} 
                            alt={currentUser?.name}
                            className="user-avatar small"
                        />
                        <div className="comment-input-container">
                            <input
                                type="text"
                                value={commentInput}
                                onChange={(e) => onCommentChange(e.target.value)}
                                placeholder="Write a comment..."
                                className="comment-input"
                                onKeyPress={(e) => e.key === 'Enter' && onSubmitComment()}
                            />
                            <button 
                                onClick={onSubmitComment}
                                disabled={!commentInput.trim()}
                                className="comment-submit"
                            >
                                Post
                            </button>
                        </div>
                    </div>

                    {/* Comments List */}
                    <div className="comments-list">
                        {post.comments?.map((comment, index) => (
                            <div key={index} className="comment">
                                <img 
                                    src={comment.user?.profile?.picture || '/default-avatar.png'} 
                                    alt={comment.user?.name}
                                    className="user-avatar small"
                                />
                                <div className="comment-content">
                                    <div className="comment-header">
                                        <strong>{comment.user?.name}</strong>
                                        <span className="comment-time">
                                            {new Date(comment.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <p>{comment.content}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Challenges Tab Component
const ChallengesTab = ({ challenges, onJoinChallenge, user }) => {
    const userChallenges = user?.community?.joinedChallenges || [];

    return (
        <div className="challenges-tab">
            <div className="section-header">
                <h2>Community Challenges</h2>
                <p>Join challenges to stay motivated and compete with others</p>
            </div>

            <div className="challenges-grid">
                {challenges.length > 0 ? (
                    challenges.map(challenge => {
                        const isJoined = userChallenges.includes(challenge._id);
                        const progress = challenge.participants?.find(p => p.userId === user?._id)?.progress || 0;
                        
                        return (
                            <div key={challenge._id} className="challenge-card">
                                <div className="challenge-header">
                                    <h3>{challenge.title}</h3>
                                    <span className={`challenge-status ${challenge.status}`}>
                                        {challenge.status}
                                    </span>
                                </div>
                                
                                <p className="challenge-description">{challenge.description}</p>
                                
                                <div className="challenge-stats">
                                    <div className="stat">
                                        <span>🏆</span>
                                        <span>{challenge.participants?.length || 0} Participants</span>
                                    </div>
                                    <div className="stat">
                                        <span>⏱️</span>
                                        <span>{challenge.duration} days</span>
                                    </div>
                                    <div className="stat">
                                        <span>🎯</span>
                                        <span>{challenge.goal}</span>
                                    </div>
                                </div>

                                {isJoined ? (
                                    <div className="challenge-progress">
                                        <div className="progress-header">
                                            <span>Your Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div 
                                                className="progress-fill"
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                        <button className="btn-outline" disabled>
                                            Joined
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => onJoinChallenge(challenge._id)}
                                        className="btn-primary"
                                    >
                                        Join Challenge
                                    </button>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="no-challenges">
                        <div className="no-data-icon">🏆</div>
                        <h3>No Active Challenges</h3>
                        <p>Check back later for new community challenges!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Articles Tab Component
const ArticlesTab = ({ articles }) => {
    return (
        <div className="articles-tab">
            <div className="section-header">
                <h2>Fitness Articles & Tutorials</h2>
                <p>Learn from expert content and improve your fitness knowledge</p>
            </div>

            <div className="articles-grid">
                {articles.length > 0 ? (
                    articles.map(article => (
                        <div key={article._id} className="article-card">
                            <div className="article-image">
                                <img src={article.image || '/default-article.jpg'} alt={article.title} />
                                <span className="article-category">{article.category}</span>
                            </div>
                            <div className="article-content">
                                <h3>{article.title}</h3>
                                <p className="article-excerpt">{article.excerpt}</p>
                                <div className="article-meta">
                                    <span>By {article.author}</span>
                                    <span>{new Date(article.publishedAt).toLocaleDateString()}</span>
                                    <span>📖 {article.readTime} min read</span>
                                </div>
                                <button className="btn-outline">Read Article</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-articles">
                        <div className="no-data-icon">📚</div>
                        <h3>No Articles Available</h3>
                        <p>Articles will be posted here soon!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Discussions Tab Component
const DiscussionsTab = ({ posts, onLikePost, onAddComment, user }) => {
    const discussionPosts = posts.filter(post => post.type === 'discussion');

    return (
        <div className="discussions-tab">
            <div className="section-header">
                <h2>Fitness Discussions</h2>
                <p>Ask questions and discuss fitness topics with the community</p>
            </div>

            <div className="discussions-list">
                {discussionPosts.length > 0 ? (
                    discussionPosts.map(post => (
                        <div key={post._id} className="discussion-card">
                            <div className="discussion-header">
                                <div className="user-info">
                                    <img 
                                        src={post.user?.profile?.picture || '/default-avatar.png'} 
                                        alt={post.user?.name}
                                        className="user-avatar"
                                    />
                                    <div>
                                        <h4>{post.user?.name}</h4>
                                        <span className="post-time">
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <span className="discussion-tag">{post.tags?.[0] || 'General'}</span>
                            </div>
                            
                            <h3 className="discussion-title">{post.title}</h3>
                            <p className="discussion-content">{post.content}</p>
                            
                            <div className="discussion-stats">
                                <span>❤️ {post.likes || 0}</span>
                                <span>💬 {post.comments?.length || 0} answers</span>
                                <span>👁️ {post.views || 0} views</span>
                            </div>
                            
                            <div className="discussion-actions">
                                <button 
                                    onClick={() => onLikePost(post._id)}
                                    className={`action-btn ${post.hasLiked ? 'liked' : ''}`}
                                >
                                    {post.hasLiked ? '❤️' : '🤍'} Like
                                </button>
                                <button className="action-btn">💬 Answer</button>
                                <button className="action-btn">🔔 Follow</button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="no-discussions">
                        <div className="no-data-icon">💬</div>
                        <h3>No Discussions Yet</h3>
                        <p>Start a discussion by asking a question or sharing your insights!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
