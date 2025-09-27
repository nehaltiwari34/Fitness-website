import React from 'react'

const Community = () => {
  return (
    <div className="community-page">
      <div className="page-header">
        <h1>Community & Learning</h1>
        <p>Connect with others and expand your fitness knowledge</p>
      </div>

      <div className="community-sections">
        <div className="section-card">
          <h3>Blog & Articles</h3>
          <p>Read the latest fitness tips and research</p>
          <div className="article-list">
            <div className="article-item">
              <h4>5 Benefits of High-Intensity Interval Training</h4>
              <p>Learn how HIIT can transform your fitness routine...</p>
            </div>
            <div className="article-item">
              <h4>Nutrition for Muscle Recovery</h4>
              <p>Discover the best foods to eat after your workouts...</p>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3>Video Tutorials</h3>
          <p>Watch exercise demonstrations and tutorials</p>
          <div className="video-grid">
            <div className="video-item">
              <h4>Proper Squat Form</h4>
              <p>5 min • Beginner</p>
            </div>
            <div className="video-item">
              <h4>Deadlift Mastery</h4>
              <p>8 min • Advanced</p>
            </div>
          </div>
        </div>

        <div className="section-card">
          <h3>Community Forums</h3>
          <p>Connect with other fitness enthusiasts</p>
          <div className="forum-preview">
            <div className="forum-thread">
              <h4>Share your progress stories!</h4>
              <p>24 comments • 5 hours ago</p>
            </div>
            <div className="forum-thread">
              <h4>Best home workout equipment?</h4>
              <p>18 comments • 1 day ago</p>
            </div>
          </div>
        </div>
      </div>

      <div className="motivation-section">
        <h2>Daily Motivation</h2>
        <blockquote className="motivation-quote">
          "The only bad workout is the one that didn't happen."
          <footer>- Unknown</footer>
        </blockquote>
      </div>
    </div>
  )
}

export default Community