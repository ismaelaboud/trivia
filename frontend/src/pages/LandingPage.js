import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, guestLogin } = useAuth();
  const navigate = useNavigate();
  const [guestUsername, setGuestUsername] = useState('');
  const [showGuestLogin, setShowGuestLogin] = useState(false);

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    try {
      await guestLogin(guestUsername);
      navigate('/dashboard');
    } catch (error) {
      console.error('Guest login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="hero-heading text-white mb-6">
            Daily Trivia for
            <span className="text-teal"> Everyone</span>
          </h1>
          <p className="text-xl text-secondary mb-8 max-w-3xl mx-auto">
            Create your own trivia channels, post daily questions, and build a community 
            around the topics you love. Perfect for educators, content creators, and quiz masters.
          </p>
          
          {!isAuthenticated ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/register" className="btn-primary text-lg px-8 py-3">
                Start Creating
              </Link>
              <Link to="/search" className="btn-secondary text-lg px-8 py-3">
                Explore Channels
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link to="/dashboard" className="btn-primary text-lg px-8 py-3">
                Go to Dashboard
              </Link>
              <Link to="/search" className="btn-secondary text-lg px-8 py-3">
                Discover Channels
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="card-title text-white mb-2">Create Channels</h3>
            <p className="text-secondary">
              Set up your own trivia channels with custom names, descriptions, and invite links
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="card-title text-white mb-2">Daily Questions</h3>
            <p className="text-secondary">
              Post questions with hidden answers, then reveal them to automatically score submissions
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="card-title text-white mb-2">Track Progress</h3>
            <p className="text-secondary">
              Built-in leaderboards and score tracking for every channel
            </p>
          </div>
        </div>
      </div>

      {/* Guest Access Section */}
      {!isAuthenticated && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card bg-gradient-to-r from-navy-700 to-navy-800 border-teal border-opacity-30">
            <div className="text-center">
              <h2 className="section-heading text-white mb-4">
                Try as a Guest
              </h2>
              <p className="text-secondary mb-6">
                Want to test it out? Join as a guest with just a username - no account required!
              </p>
              
              {!showGuestLogin ? (
                <button
                  onClick={() => setShowGuestLogin(true)}
                  className="btn-outline"
                >
                  Continue as Guest
                </button>
              ) : (
                <form onSubmit={handleGuestLogin} className="max-w-sm mx-auto">
                  <input
                    type="text"
                    placeholder="Enter your username"
                    value={guestUsername}
                    onChange={(e) => setGuestUsername(e.target.value)}
                    className="input-field mb-4"
                    required
                    minLength={2}
                    maxLength={30}
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="btn-primary flex-1"
                    >
                      Join as Guest
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowGuestLogin(false)}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="section-heading text-white mb-4">
            Ready to Start Your Trivia Channel?
          </h2>
          <p className="text-lg text-secondary mb-8">
            Join thousands of trivia enthusiasts and create engaging daily quizzes
          </p>
          {!isAuthenticated && (
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
