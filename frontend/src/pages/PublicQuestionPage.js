import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../config/api';

const API_BASE_URL = `${API_URL}/api`;

// Update document meta tags for social sharing
const updateMetaTags = (question) => {
  if (!question) return;
  
  const shareUrl = `${window.location.origin}/q/${question.shareId}`;
  
  // Update title
  document.title = 'Can you answer this question? 🧠 - Questly';
  
  // Update or create meta tags
  const updateMetaTag = (property, content) => {
    let tag = document.querySelector(`meta[property="${property}"]`) || 
              document.querySelector(`meta[name="${property}"]`);
    if (!tag) {
      tag = document.createElement('meta');
      tag.setAttribute(property.includes('og:') ? 'property' : 'name', property);
      document.head.appendChild(tag);
    }
    tag.setAttribute('content', content);
  };
  
  updateMetaTag('og:title', 'Can you answer this question? 🧠');
  updateMetaTag('og:description', `${question.questionText} — Answer on Questly`);
  updateMetaTag('og:image', `${window.location.origin}/og-preview.png`);
  updateMetaTag('og:url', shareUrl);
  updateMetaTag('twitter:card', 'summary_large_image');
  updateMetaTag('twitter:title', 'Can you answer this question? 🧠');
  updateMetaTag('twitter:description', `${question.questionText} — Answer on Questly`);
  updateMetaTag('twitter:image', `${window.location.origin}/og-preview.png`);
};

export function PublicQuestionPage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [guestName, setGuestName] = useState('');
  const [answer, setAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    fetchQuestion();
  }, [shareId]);

  useEffect(() => {
    if (question) {
      updateMetaTags(question);
    }
  }, [question]);

  useEffect(() => {
    if (question && question.revealAt && !question.isRevealed) {
      const timer = setInterval(() => {
        const now = new Date();
        const revealTime = new Date(question.revealAt);
        const diff = revealTime - now;
        
        if (diff <= 0) {
          setTimeLeft(null);
          clearInterval(timer);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeLeft(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [question]);

  const fetchQuestion = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/questions/share/${shareId}`);
      if (!response.ok) {
        throw new Error('Question not found');
      }
      const data = await response.json();
      setQuestion(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user && !guestName.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (!answer.trim()) {
      setError('Please enter an answer');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/questions/${question._id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answer: answer.trim(),
          guestName: user ? null : guestName.trim()
        }),
        credentials: 'include'
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit answer');
      }

      setSubmissionResult({
        success: true,
        message: 'Answer submitted successfully!'
      });

      // Refresh question data
      await fetchQuestion();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-white">Loading question...</div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Question not found</div>
          <button 
            onClick={() => navigate('/')}
            className="text-teal-400 hover:text-teal-300"
          >
            Return to Questly
          </button>
        </div>
      </div>
    );
  }

  const hasSubmitted = question.submissions?.some(sub => 
    (user && sub.user?._id === user.id) || 
    (!user && sub.guestName?.toLowerCase() === guestName.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-navy-900">
      {/* Header */}
      <div className="bg-navy-800 border-b border-navy-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🧠</div>
            <span className="text-xl font-bold text-white">Questly</span>
          </div>
          {user ? (
            <div className="flex items-center space-x-4">
              <span className="text-white">{user.username}</span>
              <button 
                onClick={() => navigate('/dashboard')}
                className="text-teal-400 hover:text-teal-300 text-sm"
              >
                Dashboard
              </button>
            </div>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="text-teal-400 hover:text-teal-300"
            >
              Login
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Channel Info */}
        <div className="bg-navy-800 rounded-lg p-4 mb-6 border border-navy-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{question.channel.emoji || '📡'}</span>
            <div>
              <h3 className="text-white font-semibold">{question.channel.name}</h3>
              <p className="text-gray-400 text-sm">/{question.channel.slug}</p>
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-navy-800 rounded-lg p-6 border border-navy-700">
          <div className="mb-6">
            <h2 className="text-xl text-white mb-4">Question</h2>
            <div className="bg-navy-900 rounded-lg p-4 border border-navy-600">
              <p className="text-white text-lg">{question.questionText}</p>
            </div>
          </div>

          {/* Timer */}
          {timeLeft && (
            <div className="flex items-center space-x-2 text-yellow-400 mb-6">
              <Clock className="w-4 h-4" />
              <span className="text-sm">Reveals in {timeLeft}</span>
            </div>
          )}

          {/* Answer Form */}
          {!question.isRevealed && !hasSubmitted && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {!user && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Your Name (if guest)
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                    placeholder="Enter your name"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Your Answer
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-4 py-2 bg-navy-900 border border-navy-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-teal-400"
                  placeholder="Enter your answer"
                  required
                />
              </div>

              {error && (
                <div className="text-red-400 text-sm">{error}</div>
              )}

              {submissionResult?.success && (
                <div className="text-green-400 text-sm">{submissionResult.message}</div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-teal-400 text-navy-900 font-semibold py-3 rounded-lg hover:bg-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </button>
            </form>
          )}

          {/* Already Submitted */}
          {hasSubmitted && !question.isRevealed && (
            <div className="text-center py-6">
              <div className="text-yellow-400 mb-2">✅</div>
              <p className="text-white">You already submitted an answer</p>
              <p className="text-gray-400 text-sm mt-2">
                Check back later to see if you got it right!
              </p>
            </div>
          )}

          {/* Revealed Answer */}
          {question.isRevealed && (
            <div className="space-y-4">
              <div className="bg-navy-900 rounded-lg p-4 border border-navy-600">
                <h3 className="text-white font-semibold mb-2">Correct Answer:</h3>
                <p className="text-teal-400 text-lg">{question.correctAnswer}</p>
              </div>

              {/* User's result if they submitted */}
              {hasSubmitted && (
                <div className="text-center py-4">
                  {(() => {
                    const userSubmission = question.submissions.find(sub => 
                      (user && sub.user?._id === user.id) || 
                      (!user && sub.guestName?.toLowerCase() === guestName.toLowerCase())
                    );
                    
                    return userSubmission?.isCorrect ? (
                      <div className="flex items-center justify-center space-x-2 text-green-400">
                        <CheckCircle className="w-6 h-6" />
                        <span>You got it right! 🎉</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2 text-red-400">
                        <XCircle className="w-6 h-6" />
                        <span>Not quite right, but good try!</span>
                      </div>
                    );
                  })()}
                </div>
              )}

              <div className="text-center text-gray-400 text-sm">
                {question.totalSubmissions} submissions • {question.correctSubmissions} correct
              </div>
            </div>
          )}

          {/* Login prompt for guests */}
          {!user && !hasSubmitted && (
            <div className="mt-6 text-center text-gray-400 text-sm">
              Already have an account?{' '}
              <button 
                onClick={() => navigate('/login')}
                className="text-teal-400 hover:text-teal-300"
              >
                Login to track your score
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
