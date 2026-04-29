import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { channelsAPI, questionsAPI } from '../services/api';
import { ShareModal } from '../components/ShareModal';

export const ChannelManagePage = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [channelData, setChannelData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [revealAt, setRevealAt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedQuestionForShare, setSelectedQuestionForShare] = useState(null);

  useEffect(() => {
    loadChannelData();
    loadQuestions();
  }, [slug]);

  const loadChannelData = async () => {
    try {
      const response = await channelsAPI.getBySlug(slug);
      if (!response.data.isOwner) {
        setError('You do not have permission to manage this channel');
        return;
      }
      setChannelData(response.data);
    } catch (error) {
      console.error('Failed to load channel:', error);
      setError('Channel not found or access denied');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const response = await questionsAPI.getChannelQuestions(slug);
      setQuestions(response.data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const questionData = {
        channelSlug: slug,
        questionText: questionText.trim(),
        correctAnswer: correctAnswer.trim()
      };

      if (revealAt) {
        questionData.revealAt = revealAt;
      }

      await questionsAPI.create(questionData);
      
      setQuestionText('');
      setCorrectAnswer('');
      setRevealAt('');
      setShowCreateForm(false);
      setSuccess('Question created successfully!');
      loadQuestions();
    } catch (error) {
      console.error('Failed to create question:', error);
      setError(error.response?.data?.message || 'Failed to create question');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await questionsAPI.delete(questionId);
      setSuccess('Question deleted successfully!');
      loadQuestions();
    } catch (error) {
      console.error('Failed to delete question:', error);
      setError(error.response?.data?.message || 'Failed to delete question');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!channelData) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">{error || 'Channel not found'}</p>
          <button onClick={() => navigate(`/channel/${slug}`)} className="btn-primary mt-4">
            Back to Channel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-channel-page">
      {/* Header */}
      <div className="mb-8">
        {/* Back Arrow */}
        <button 
          onClick={() => navigate(`/channel/${slug}`)} 
          className="flex items-center text-teal hover:text-teal-dark transition-colors duration-200 mb-4"
        >
          <span className="text-xl mr-2">←</span>
          <span className="text-sm font-medium">BACK TO CHANNEL</span>
        </button>
        
        {/* Page Title */}
        <h1 className="text-white font-heading text-xl mb-2">Manage Channel</h1>
        <p className="text-teal font-body text-xs">{channelData.channel.name}</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="success-banner mb-6">
          {success}
        </div>
      )}

      {/* Create Question Section */}
      <div className="card mb-3">
        <div className="questions-section-header">
          <h2 className="questions-heading">Questions</h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="create-question-btn"
          >
            {showCreateForm ? 'Cancel' : '+ CREATE'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateQuestion} className="bg-navy-700 rounded-lg p-6 mb-6 border border-teal border-opacity-15">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Question Text
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Enter your question..."
                  required
                  maxLength={500}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Correct Answer
                </label>
                <input
                  type="text"
                  value={correctAnswer}
                  onChange={(e) => setCorrectAnswer(e.target.value)}
                  className="input-field"
                  placeholder="Enter the correct answer..."
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-1">
                  Auto Reveal Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={revealAt}
                  onChange={(e) => setRevealAt(e.target.value)}
                  className="input-field"
                  min={new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)}
                />
                <p className="text-xs text-gray-400 mt-1">
                  The answer will reveal automatically at this time. Members will be notified.
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  disabled={!questionText.trim() || !correctAnswer.trim() || submitting}
                  className="btn-primary"
                >
                  {submitting ? 'Creating...' : 'Create Question'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Questions List */}
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4 text-gray-500">?</div>
              <div className="text-gray-400">
                No questions yet. Create your first question to get started!
              </div>
            </div>
          ) : (
            questions.map((question) => (
              <div key={question._id} className="question-card">
                <div className="question-card-inner">
                  <div className="question-card-top">
                    <p className="question-text">{question.questionText}</p>
                    {question.isActive && (
                      <button
                        onClick={() => {
                          setSelectedQuestionForShare(question);
                          setShowShareModal(true);
                        }}
                        className="share-btn"
                        title="Share question"
                      >
                        📤 Share
                      </button>
                    )}
                  </div>
                  
                  <div className="question-answer">
                    <span>Answer:</span> <span className="question-answer-value">{question.correctAnswer}</span>
                  </div>
                  
                  <div className="question-card-footer">
                    <span className="submissions-count">{question.submissions?.length || 0} submissions</span>
                    <div className="flex gap-2">
                      {question.isActive && (
                        <span className="status-badge active">Active</span>
                      )}
                      {question.isRevealed && (
                        <span className="status-badge revealed">Revealed</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    {!question.isActive && !question.isRevealed && (
                      <button
                        onClick={() => questionsAPI.activate(question._id).then(() => {
                          setSuccess('Question activated!');
                          loadQuestions();
                        })}
                        className="btn-primary text-sm"
                      >
                        Activate
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="btn-destructive text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Channel Stats */}
      <div className="channel-stats">
        <h2>Channel Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="stat-value">{channelData.channel.members.length}</div>
            <div className="stat-label">Total Members</div>
          </div>
          <div className="text-center">
            <div className="stat-value">{channelData.channel.totalQuestions}</div>
            <div className="stat-label">Total Questions</div>
          </div>
          <div className="text-center">
            <div className="stat-value">{questions.filter(q => q.isActive).length}</div>
            <div className="stat-label">Active Questions</div>
          </div>
        </div>
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareId={selectedQuestionForShare?.shareId}
        questionText={selectedQuestionForShare?.questionText}
      />
    </div>
  );
};
