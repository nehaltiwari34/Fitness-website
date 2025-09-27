import React from 'react';
import { Link } from 'react-router-dom';
import '../css/About.css';

const About = () => {
    return (
        <div className="about-container">
            <div className="about-hero">
                <div className="container">
                    <h1>About FitTrack</h1>
                    <p className="hero-subtitle">Your personal fitness companion for a healthier lifestyle</p>
                </div>
            </div>

            <div className="about-content">
                <div className="container">
                    <section className="mission-section">
                        <h2>Our Mission</h2>
                        <p>
                            At FitTrack, we believe that everyone deserves access to personalized fitness guidance 
                            and tools that make health journey enjoyable and effective. Our mission is to empower 
                            individuals to transform their health, one habit at a time.
                        </p>
                    </section>

                    <section className="story-section">
                        <h2>Our Story</h2>
                        <p>
                            FitTrack was born from a passion for both technology and fitness. As computer science 
                            students and fitness enthusiasts, we noticed a gap in the market for truly personalized, 
                            accessible fitness solutions that combine expert guidance with cutting-edge technology.
                        </p>
                        <p>
                            What started as a university project has evolved into a comprehensive platform that 
                            helps thousands of users achieve their fitness goals through tailored workout plans, 
                            personalized nutrition guidance, and a supportive community.
                        </p>
                    </section>

                    <section className="technology-section">
                        <h2>The Technology</h2>
                        <p>
                            FitTrack is built using modern web technologies to ensure a fast, responsive, 
                            and reliable experience:
                        </p>
                        
                        <div className="tech-grid">
                            <div className="tech-category">
                                <h3>Frontend</h3>
                                <ul>
                                    <li>React.js</li>
                                    <li>React Router</li>
                                    <li>Context API</li>
                                    <li>Axios</li>
                                    <li>CSS3 with Variables</li>
                                </ul>
                            </div>
                            
                            <div className="tech-category">
                                <h3>Backend</h3>
                                <ul>
                                    <li>Node.js</li>
                                    <li>Express.js</li>
                                    <li>MongoDB with Mongoose</li>
                                    <li>JWT Authentication</li>
                                    <li>RESTful APIs</li>
                                </ul>
                            </div>
                            
                            <div className="tech-category">
                                <h3>Deployment</h3>
                                <ul>
                                    <li>Vercel/Netlify (Frontend)</li>
                                    <li>Heroku/Render (Backend)</li>
                                    <li>MongoDB Atlas (Database)</li>
                                    <li>GitHub Actions (CI/CD)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="developer-section">
                        <h2>Meet the Developer</h2>
                        <div className="developer-card">
                            <div className="developer-info">
                                <h3>John Doe</h3>
                                <p className="developer-title">Computer Science & Engineering Student</p>
                                <p>
                                    John is a passionate developer with expertise in full-stack web development 
                                    and a deep interest in health and fitness technology. He developed FitTrack 
                                    to combine his technical skills with his commitment to helping others live 
                                    healthier lives.
                                </p>
                                <p>
                                    When not coding, John can be found weightlifting, running, or experimenting 
                                    with new healthy recipes in the kitchen.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="contact-section">
                        <h2>Contact for Opportunities</h2>
                        <p>Interested in collaborating or have opportunities to discuss? I'd love to hear from you!</p>
                        <div className="contact-info">
                            <p><strong>Email:</strong> john.doe@fittrack.com</p>
                            <p><strong>GitHub:</strong> github.com/johndoe</p>
                            <p><strong>LinkedIn:</strong> linkedin.com/in/johndoe</p>
                        </div>
                    </section>

                    <div className="about-actions">
                        <Link to="/signup" className="btn btn-primary">Get Started Today</Link>
                        <Link to="/contact" className="btn btn-outline">Contact Us</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;