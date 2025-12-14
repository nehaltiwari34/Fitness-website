import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import '../css/ExerciseDetail.css';

const ExerciseDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const [exercise, setExercise] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [commentLoading, setCommentLoading] = useState(false);

    useEffect(() => {
        fetchExerciseData();
    }, [id]);

    const fetchExerciseData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/workouts/exercises/${id}`);
            if (response.data.success) {
                setExercise(response.data.exercise);
                setComments(response.data.exercise.comments || []);
            }
        } catch (error) {
            console.error('Error fetching exercise:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        try {
            setCommentLoading(true);
            const response = await api.post('/workouts/comments', {
                content: newComment,
                targetType: 'exercise',
                targetId: id
            });

            if (response.data.success) {
                setComments(prev => [response.data.comment, ...prev]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
            alert('Failed to add comment. Please try again.');
        } finally {
            setCommentLoading(false);
        }
    };

    const handleLikeComment = async (commentId) => {
        try {
            const response = await api.post(`/workouts/comments/${commentId}/like`);
            if (response.data.success) {
                // Update local comments state
                setComments(prev => prev.map(comment => 
                    comment._id === commentId 
                        ? { ...comment, likes: response.data.likes }
                        : comment
                ));
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    if (loading) {
        return (
            <div className="exercise-detail-container">
                <div className="loading-spinner-large"></div>
                <p>Loading exercise details...</p>
            </div>
        );
    }

    if (!exercise) {
        return (
            <div className="exercise-detail-container">
                <div className="error-state">
                    <h2>Exercise Not Found</h2>
                    <p>The exercise you're looking for doesn't exist.</p>
                    <Link to="/exercises" className="btn-primary">
                        Back to Exercises
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="exercise-detail-container">
            {/* Breadcrumb */}
            <nav className="breadcrumb">
                <Link to="/workouts">Workouts</Link>
                <span> / </span>
                <Link to="/exercises">Exercises</Link>
                <span> / </span>
                <span>{exercise.name}</span>
            </nav>

            {/* Exercise Header */}
            <div className="exercise-header">
                <div className="exercise-media">
                    {exercise.videoUrl ? (
                        <div className="video-player">
                            <iframe
                                src={exercise.videoUrl.replace('watch?v=', 'embed/')}
                                title={exercise.name}
                                allowFullScreen
                            ></iframe>
                        </div>
                    ) : (
                        <img 
                            src={exercise.imageUrl || '/assets/exercise-placeholder.jpg'} 
                            alt={exercise.name}
                            className="exercise-image-large"
                        />
                    )}
                </div>

                <div className="exercise-info">
                    <div className="exercise-title-section">
                        <h1>{exercise.name}</h1>
                        <div className="exercise-badges">
                            <span className={`difficulty-badge ${exercise.difficulty?.toLowerCase()}`}>
                                {exercise.difficulty}
                            </span>
                            <span className="category-badge">{exercise.category}</span>
                        </div>
                    </div>

                    <p className="exercise-description-detailed">
                        {exercise.description}
                    </p>

                    <div className="exercise-specs">
                        <div className="spec-grid">
                            {exercise.sets && (
                                <div className="spec-item">
                                    <span className="spec-label">Sets & Reps</span>
                                    <span className="spec-value">{exercise.sets} × {exercise.reps}</span>
                                </div>
                            )}
                            {exercise.duration && (
                                <div className="spec-item">
                                    <span className="spec-label">Duration</span>
                                    <span className="spec-value">{exercise.duration} seconds</span>
                                </div>
                            )}
                            {exercise.rest && (
                                <div className="spec-item">
                                    <span className="spec-label">Rest Time</span>
                                    <span className="spec-value">{exercise.rest} seconds</span>
                                </div>
                            )}
                            {exercise.calories && (
                                <div className="spec-item">
                                    <span className="spec-label">Calories</span>
                                    <span className="spec-value">~{exercise.calories} cal/set</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {exercise.targets && exercise.targets.length > 0 && (
                        <div className="target-muscles">
                            <h3>Target Muscles</h3>
                            <div className="muscle-tags">
                                {exercise.targets.map((muscle, index) => (
                                    <span key={index} className="muscle-tag">{muscle}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {exercise.equipment && exercise.equipment.length > 0 && (
                        <div className="equipment-needed">
                            <h3>Equipment Needed</h3>
                            <div className="equipment-tags">
                                {exercise.equipment.map((item, index) => (
                                    <span key={index} className="equipment-tag">{item}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="exercise-actions-detailed">
                        <button className="btn-primary large">
                            Add to Workout
                        </button>
                        <button className="btn-outline large">
                            Save as Favorite
                        </button>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            {exercise.instructions && exercise.instructions.length > 0 && (
                <div className="instructions-section">
                    <h2>Instructions</h2>
                    <ol className="instructions-list">
                        {exercise.instructions.map((instruction, index) => (
                            <li key={index} className="instruction-item">
                                {instruction}
                            </li>
                        ))}
                    </ol>
                </div>
            )}

            {/* Comments Section */}
            <div className="comments-section">
                <h2>Community Discussion</h2>
                
                {/* Add Comment */}
                <div className="add-comment">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your experience with this exercise..."
                        rows="3"
                        className="comment-textarea"
                    />
                    <div className="comment-actions">
                        <button 
                            onClick={handleAddComment}
                            disabled={!newComment.trim() || commentLoading}
                            className="btn-primary"
                        >
                            {commentLoading ? 'Posting...' : 'Post Comment'}
                        </button>
                    </div>
                </div>

                {/* Comments List */}
                <div className="comments-list">
                    {comments.length > 0 ? (
                        comments.map(comment => (
                            <CommentItem 
                                key={comment._id} 
                                comment={comment} 
                                onLike={handleLikeComment}
                            />
                        ))
                    ) : (
                        <div className="no-comments">
                            <p>No comments yet. Be the first to share your experience!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Related Exercises */}
            {exercise.relatedExercises && exercise.relatedExercises.length > 0 && (
                <div className="related-exercises">
                    <h2>Related Exercises</h2>
                    <div className="related-grid">
                        {exercise.relatedExercises.map(relatedExercise => (
                            <Link 
                                key={relatedExercise._id}
                                to={`/exercise/${relatedExercise._id}`}
                                className="related-exercise-card"
                            >
                                <img 
                                    src={relatedExercise.imageUrl || '/assets/exercise-placeholder.jpg'} 
                                    alt={relatedExercise.name}
                                />
                                <h4>{relatedExercise.name}</h4>
                                <span className="related-category">{relatedExercise.category}</span>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Comment Component
const CommentItem = ({ comment, onLike }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [newReply, setNewReply] = useState('');
    const { user } = useAuth();

    const handleLike = () => {
        onLike(comment._id);
    };

    const isLikedByUser = user && comment.likes.includes(user._id);

    return (
        <div className="comment-item">
            <div className="comment-header">
                <div className="comment-author">
                    <img 
                        src={comment.userId?.profile?.picture || '/assets/default-avatar.png'} 
                        alt={comment.userId?.name}
                        className="comment-avatar"
                    />
                    <div className="author-info">
                        <strong>{comment.userId?.name}</strong>
                        <span className="comment-time">
                            {new Date(comment.createdAt).toLocaleDateString()} at{' '}
                            {new Date(comment.createdAt).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
            </div>

            <div className="comment-content">
                <p>{comment.content}</p>
            </div>

            <div className="comment-actions">
                <button 
                    onClick={handleLike}
                    className={`like-btn ${isLikedByUser ? 'liked' : ''}`}
                >
                    ❤️ {comment.likes?.length || 0}
                </button>
                <button 
                    onClick={() => setShowReplies(!showReplies)}
                    className="reply-btn"
                >
                    💬 {comment.replies?.length || 0} replies
                </button>
            </div>

            {/* Replies */}
            {showReplies && comment.replies && comment.replies.length > 0 && (
                <div className="replies-section">
                    {comment.replies.map(reply => (
                        <div key={reply._id} className="reply-item">
                            <div className="comment-author">
                                <img 
                                    src={reply.userId?.profile?.picture || '/assets/default-avatar.png'} 
                                    alt={reply.userId?.name}
                                    className="comment-avatar small"
                                />
                                <div className="author-info">
                                    <strong>{reply.userId?.name}</strong>
                                    <span className="comment-time">
                                        {new Date(reply.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <p>{reply.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExerciseDetail;