import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { channelsAPI, questionsAPI, submissionsAPI } from '../services/api';
import { ShareModal } from '../components/ShareModal';
// import { usePushNotifications } from '../hooks/usePushNotifications';
import ChatBox from '../components/ChatBox';

export const ChannelPage = () => {
  const { slug } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  
  const [channelData, setChannelData] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [userSubmission, setUserSubmission] = useState(null);
  const [answer, setAnswer] = useState('');
  const [guestName, setGuestName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showAnswersModal, setShowAnswersModal] = useState(false);
  const [selectedQuestionAnswers, setSelectedQuestionAnswers] = useState(null);
  const [loadingAnswers, setLoadingAnswers] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [activeTab, setActiveTab] = useState('question'); // 'question', 'leaderboard', 'chat', 'history'
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

  // Initialize push notifications for this channel
  // const { permission, subscribed, isSupported, isIOS, error: pushError, subscribe, unsubscribe } = usePushNotifications(
  //   channelData?.channel?._id
  // );

  // Set default tab based on active question
  useEffect(() => {
    if (activeQuestion) {
      setActiveTab('question');
    } else {
      setActiveTab('leaderboard');
    }
  }, [activeQuestion]);

  useEffect(() => {
    loadChannelData();
  }, [slug]);

  // Countdown timer effect
  useEffect(() => {
    if (!activeQuestion || !activeQuestion.revealAt || activeQuestion.isRevealed) {
      setCountdown(null);
      return;
    }

    const calculateCountdown = () => {
      const now = new Date().getTime();
      const revealTime = new Date(activeQuestion.revealAt).getTime();
      const distance = revealTime - now;

      if (distance < 0) {
        setCountdown(null);
        // Auto-refresh when countdown reaches 0
        loadChannelData();
        return;
      }

      const hours = Math.floor(distance / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown(`${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`);
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);

    return () => clearInterval(interval);
  }, [activeQuestion]);

  const loadChannelData = async () => {
    try {
      const response = await channelsAPI.getBySlug(slug);
      setChannelData(response.data);
      
      // Load active question if exists
      if (response.data.activeQuestion) {
        setActiveQuestion(response.data.activeQuestion);
        
        // Check if user has already submitted
        if (isAuthenticated && response.data.isMember) {
          try {
            const submissionResponse = await submissionsAPI.getUserSubmission(response.data.activeQuestion._id);
            setUserSubmission(submissionResponse.data.submission);
          } catch (error) {
            // User hasn't submitted yet
          }
        }
      }
    } catch (error) {
      console.error('Failed to load channel:', error);
      setError('Channel not found');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async () => {
    if (!isAuthenticated) {
      setShowGuestForm(true);
      return;
    }

    try {
      await channelsAPI.join(slug);
      loadChannelData(); // Refresh data
      setSuccess('Successfully joined the channel!');
    } catch (error) {
      console.error('Failed to join channel:', error);
      setError(error.response?.data?.message || 'Failed to join channel');
    }
  };

  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const submissionData = {
        channelSlug: slug,
        answer: answer.trim()
      };

      if (!isAuthenticated) {
        submissionData.guestName = guestName.trim();
      }

      await submissionsAPI.submit(submissionData);
      setUserSubmission({ answer: answer.trim() });
      setAnswer('');
      setSuccess('Answer submitted successfully!');
    } catch (error) {
      console.error('Failed to submit answer:', error);
      setError(error.response?.data?.message || 'Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRevealAnswer = async () => {
    try {
      await questionsAPI.revealAnswer(activeQuestion._id);
      loadChannelData(); // Refresh to show revealed answer
      setSuccess('Answer revealed and submissions scored!');
    } catch (error) {
      console.error('Failed to reveal answer:', error);
      setError(error.response?.data?.message || 'Failed to reveal answer');
    }
  };

  const handleViewAnswers = async (questionId) => {
    setLoadingAnswers(true);
    try {
      const response = await questionsAPI.getSubmissions(questionId);
      setSelectedQuestionAnswers(response.data);
      setShowAnswersModal(true);
    } catch (error) {
      console.error('Failed to load answers:', error);
      setError(error.response?.data?.message || 'Failed to load answers');
    } finally {
      setLoadingAnswers(false);
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
          <h1 className="text-2xl font-bold text-gray-900">Channel Not Found</h1>
          <p className="text-gray-600 mt-2">The channel you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="channel-page-container">
      {/* Channel Header */}
      <div className="channel-header card">
        <div className="channel-header-top">
          <div className={`w-16 h-16 channel-avatar rounded-lg flex items-center justify-center mr-4 flex-shrink-0 ${
            channelData.channel.avatar ? 'is-emoji' : 'is-letter-fallback'
          }`}
               style={channelData.channel.avatar ? {} : { backgroundColor: '#00C9A7' }}>
            {channelData.channel.avatar ? (
              <span className="text-4xl">
                {channelData.channel.avatar}
              </span>
            ) : (
              <span className="text-white font-bold text-xl">
                {channelData.channel.name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="channel-header-info">
            <div className="flex items-center mb-2">
              {activeQuestion && (
                <div className="active-indicator mr-2"></div>
              )}
              <h1 className="channel-name">{channelData.channel.name}</h1>
            </div>
            <p className="channel-slug mb-2">/{channelData.channel.slug}</p>
            {channelData.channel.description && (
              <p className="channel-description mb-4">{channelData.channel.description}</p>
            )}
            <div className="channel-meta">
              <span className="channel-owner-name">by {channelData.channel.owner.username}</span>
              <span className="channel-meta-item">{channelData.channel.members.length} members</span>
              <span className="channel-meta-item">{channelData.channel.totalQuestions} questions</span>
            </div>
            
            {/* Notification Bell - DISABLED */}
            {/* {channelData.isMember && (
              <div className="mt-4">
                {!isSupported ? (
                  <div className="text-center">
                    <div className="bg-gray-700 border border-gray-600 text-gray-300 px-4 py-3 rounded-lg text-sm">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span>🔕</span>
                        <span className="font-medium">Notifications Unavailable</span>
                      </div>
                      {isIOS && (
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>• iOS 16.4+ required for push notifications</div>
                          <div>• Add this app to your home screen</div>
                          <div>• Open app from home screen to enable</div>
                        </div>
                      )}
                      {pushError && (
                        <div className="text-xs text-yellow-400 mt-2">
                          {pushError}
                        </div>
                      )}
                    </div>
                  </div>
                ) : !subscribed ? (
                  <button 
                    onClick={subscribe}
                    className="bg-navy-800 border-2 border-teal text-teal px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal hover:text-navy-800 transition-colors flex items-center space-x-2"
                  >
                    <span>🔔</span>
                    <span>Get Notified</span>
                  </button>
                ) : (
                  <button 
                    onClick={unsubscribe}
                    className="bg-teal text-navy-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors flex items-center space-x-2"
                  >
                    <span>🔔</span>
                    <span>Notified ✓</span>
                  </button>
                )}
                
                {permission === 'denied' && isSupported && (
                  <div className="mt-2 text-xs text-gray-400">
                    🔕 Notifications blocked - enable in browser settings
                  </div>
                )}
                
                {pushError && isSupported && (
                  <div className="mt-2 text-xs text-yellow-400">
                    ⚠️ {pushError}
                  </div>
                )}
              </div>
            )} */}
          </div>
        </div>

        {/* Join/Leave Button */}
        {!channelData.isMember && (
          <div className="mt-6">
            <button onClick={handleJoinChannel} className="btn-primary">
              Join Channel
            </button>
          </div>
        )}
      </div>

      {/* Mobile Tab Bar */}
      <div className="tab-bar">
        <button
          className={`tab-item ${activeTab === 'question' ? 'active' : ''}`}
          onClick={() => setActiveTab('question')}
        >
          <span>🧠</span>
          <span>Question</span>
          {activeQuestion && <span className="tab-badge tab-badge-red"></span>}
        </button>
        <button
          className={`tab-item ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <span>🏆</span>
          <span>Board</span>
        </button>
        <button
          className={`tab-item ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          <span>💬</span>
          <span>Chat</span>
          {hasUnreadMessages && <span className="tab-badge tab-badge-blue"></span>}
        </button>
        <button
          className={`tab-item ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span>📋</span>
          <span>History</span>
        </button>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-navy-800 border border-coral border-opacity-30 text-coral px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-navy-800 border border-teal border-opacity-30 text-teal px-4 py-3 rounded-lg mb-6">
          {success}
        </div>
      )}

      {/* Desktop Grid Layout */}
      <div className="channel-page-grid">
        {/* Left Column */}
        <div className="left-column">
          {/* Active Question */}
          {activeQuestion ? (
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="active-question-title">Active Question</h2>
                <div className="flex items-center space-x-3">
                  {activeQuestion.isRevealed && (
                    <span className="bg-navy-700 text-yellow px-3 py-1 rounded-full text-sm">
                      Answer Revealed
                    </span>
                  )}
                  <button
                    onClick={() => setShowShareModal(true)}
                    className="bg-navy-700 hover:bg-navy-600 text-teal-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                    title="Share question"
                  >
                    <span>📤</span>
                    <span>Share Question</span>
                  </button>
                </div>
              </div>

              {/* Revealed Question Banner */}
              {activeQuestion.isRevealed && (
                <div className="bg-yellow bg-opacity-10 border border-yellow border-opacity-30 rounded-lg p-4 mb-6">
                  <p className="text-yellow font-unbounded text-sm">
                    ✅ Answer revealed! See how you did.
                  </p>
                </div>
              )}
              
              <div className="question-box mb-6">
                <p className="mb-4">{activeQuestion.questionText}</p>
                
                {/* Countdown Timer */}
                {countdown && !activeQuestion.isRevealed && (
                  <div className="mb-4">
                    <p className="text-yellow font-unbounded text-sm">
                      ⏰ Reveals in: {countdown}
                    </p>
                  </div>
                )}
                
                {activeQuestion.isRevealed && (
                  <div className="bg-navy-700 border border-yellow border-opacity-30 rounded-lg p-4">
                    <p className="text-sm font-medium text-yellow mb-1">Correct Answer:</p>
                    <p className="text-yellow font-semibold">{activeQuestion.correctAnswer}</p>
                  </div>
                )}
              </div>

              {/* Submission Form */}
              {!activeQuestion.isRevealed && (channelData.isMember || !isAuthenticated) && (
                <div>
                  {userSubmission ? (
                    <div className={`border rounded-lg p-4 ${
                      activeQuestion.isRevealed 
                        ? userSubmission.isCorrect 
                          ? 'bg-green-900 bg-opacity-20 border-green-400 border-opacity-30' 
                          : 'bg-red-900 bg-opacity-20 border-red-400 border-opacity-30'
                        : 'bg-navy-700 border border-teal border-opacity-30'
                    }`}>
                      <div className="flex items-center justify-between">
                        <p className={`${activeQuestion.isRevealed 
                          ? userSubmission.isCorrect ? 'text-green-400' : 'text-red-400'
                          : 'text-teal'
                        }`}>
                          You submitted: <span className="font-semibold">{userSubmission.answer}</span>
                        </p>
                        {activeQuestion.isRevealed && (
                          <span className={`text-2xl ${
                            userSubmission.isCorrect ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {userSubmission.isCorrect ? '✅' : '❌'}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-secondary mt-1">
                        {activeQuestion.isRevealed 
                          ? (userSubmission.isCorrect ? 'Correct answer!' : 'Incorrect answer.')
                          : 'Answer will be revealed when the channel owner decides to end the question.'
                        }
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={isAuthenticated ? handleSubmitAnswer : (e) => { e.preventDefault(); setShowGuestForm(true); }} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-1 font-body">
                          Your Answer
                        </label>
                        <input
                          type="text"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          className="input-field"
                          placeholder="Enter your answer"
                          required
                          maxLength={200}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={!answer.trim() || submitting}
                        className="btn-primary"
                      >
                        {submitting ? 'Submitting...' : 'Submit Answer'}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* Owner Controls */}
              {channelData.isOwner && !activeQuestion.isRevealed && (
                <div className="mt-6 pt-6 border-t border-navy-700">
                  <h3 className="section-heading mb-4">Owner Controls</h3>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-secondary">
                        {activeQuestion.submissions.length} submissions received
                      </p>
                    </div>
                    <button
                      onClick={handleRevealAnswer}
                      className="btn-primary"
                    >
                      Reveal Answer & Score
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card">
              <h2 className="section-heading mb-4">No Active Question</h2>
              <p className="text-secondary">
                {channelData.isOwner ? (
                  <>
                    Create a new question to engage your audience.
                    <button
                      onClick={() => navigate(`/channel/${slug}/manage`)}
                      className="btn-primary ml-4"
                    >
                      Create Question
                    </button>
                  </>
                ) : (
                  'Check back later for a new question from the channel owner.'
                )}
              </p>
            </div>
          )}

          {/* Recent Questions - Desktop only */}
          {channelData.recentQuestions && channelData.recentQuestions.length > 0 && (
            <div className="card desktop-only">
              <h2 className="section-heading mb-4">Recent Questions</h2>
              <div className="space-y-4">
                {channelData.recentQuestions.map((question) => (
                  <div key={question._id} className="border-b border-navy-700 pb-4 last:border-0 last:pb-0">
                    <div className="question-box mb-3">
                      <p className="text-white font-medium">{question.questionText}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      {question.isRevealed ? (
                        <div className="bg-navy-700 border border-yellow border-opacity-30 rounded px-3 py-2">
                          <span className="text-sm font-medium text-yellow">Answer: {question.correctAnswer}</span>
                        </div>
                      ) : question.revealAt ? (
                        <div className="bg-navy-700 border border-gray-500 border-opacity-30 rounded px-3 py-2">
                          <span className="text-sm font-medium text-gray-400">
                            Reveals {new Date(question.revealAt).toLocaleDateString()} at {new Date(question.revealAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      ) : (
                        <div className="bg-navy-700 border border-gray-500 border-opacity-30 rounded px-3 py-2">
                          <span className="text-sm font-medium text-gray-400">Pending reveal</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-3">
                        <div className="text-sm text-secondary">
                          {question.correctSubmissions}/{question.totalSubmissions} correct
                        </div>
                        {channelData.isOwner && question.totalSubmissions > 0 && (
                          <button
                            onClick={() => handleViewAnswers(question._id)}
                            disabled={loadingAnswers}
                            className="text-xs bg-teal bg-opacity-20 text-teal px-2 py-1 rounded hover:bg-opacity-30 transition-colors"
                          >
                            {loadingAnswers ? 'Loading...' : 'View Answers'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="right-column">
          {/* Leaderboard - Desktop */}
          {channelData.leaderboard && channelData.leaderboard.length > 0 && (
            <div className="card leaderboard-sidebar">
              <h2 className="section-heading mb-4">Leaderboard</h2>
              <div className="space-y-3">
                {channelData.leaderboard.map((entry, index) => (
                  <div key={entry.user._id} className="leaderboard-row">
                    <span className={`leaderboard-rank ${
                      index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'text-secondary'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="leaderboard-avatar bg-navy-700 rounded-full flex items-center justify-center">
                      <span className="text-secondary text-sm font-medium">
                        {entry.user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="leaderboard-user-info">
                      <span className="leaderboard-username username-display">{entry.user.username}</span>
                      {user?.username === entry.user.username && (
                        <span className="leaderboard-you-badge">You</span>
                      )}
                    </div>
                    <div className="leaderboard-score">
                      <p className="leaderboard-points">{entry.totalScore} points</p>
                      <p className="leaderboard-correct">{entry.correctAnswers}/{entry.questionsAnswered} correct</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat - Desktop */}
          {(channelData.isMember || !isAuthenticated) && (
            <div className="chat-container desktop-only">
              <ChatBox 
                channelSlug={channelData.channel.slug}
                userName={user?.username || guestName || 'Guest'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Tab Content */}
      <div className="tab-content-wrapper">
        {/* Question Tab Content */}
        {activeTab === 'question' && (
          <div className="tab-content">
            {activeQuestion ? (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="active-question-title">Active Question</h2>
                  <div className="flex items-center space-x-3">
                    {activeQuestion.isRevealed && (
                      <span className="bg-navy-700 text-yellow px-3 py-1 rounded-full text-sm">
                        Answer Revealed
                      </span>
                    )}
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="bg-navy-700 hover:bg-navy-600 text-teal-400 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1"
                      title="Share question"
                    >
                      <span>📤</span>
                      <span>Share</span>
                    </button>
                  </div>
                </div>

                {/* Revealed Question Banner */}
                {activeQuestion.isRevealed && (
                  <div className="bg-yellow bg-opacity-10 border border-yellow border-opacity-30 rounded-lg p-4 mb-6">
                    <p className="text-yellow font-unbounded text-sm">
                      ✅ Answer revealed! See how you did.
                    </p>
                  </div>
                )}
                
                <div className="question-box mb-6">
                  <p className="mb-4">{activeQuestion.questionText}</p>
                  
                  {/* Countdown Timer */}
                  {countdown && !activeQuestion.isRevealed && (
                    <div className="mb-4">
                      <p className="text-yellow font-unbounded text-sm">
                        ⏰ Reveals in: {countdown}
                      </p>
                    </div>
                  )}
                  
                  {activeQuestion.isRevealed && (
                    <div className="bg-navy-700 border border-yellow border-opacity-30 rounded-lg p-4">
                      <p className="text-sm font-medium text-yellow mb-1">Correct Answer:</p>
                      <p className="text-yellow font-semibold">{activeQuestion.correctAnswer}</p>
                    </div>
                  )}
                </div>

                {/* Submission Form */}
                {!activeQuestion.isRevealed && (channelData.isMember || !isAuthenticated) && (
                  <div>
                    {userSubmission ? (
                      <div className={`border rounded-lg p-4 ${
                        activeQuestion.isRevealed 
                          ? userSubmission.isCorrect 
                            ? 'bg-green-900 bg-opacity-20 border-green-400 border-opacity-30' 
                            : 'bg-red-900 bg-opacity-20 border-red-400 border-opacity-30'
                          : 'bg-navy-700 border border-teal border-opacity-30'
                      }`}>
                        <div className="flex items-center justify-between">
                          <p className={`${activeQuestion.isRevealed 
                            ? userSubmission.isCorrect ? 'text-green-400' : 'text-red-400'
                            : 'text-teal'
                          }`}>
                            You submitted: <span className="font-semibold">{userSubmission.answer}</span>
                          </p>
                          {activeQuestion.isRevealed && (
                            <span className={`text-2xl ${
                              userSubmission.isCorrect ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {userSubmission.isCorrect ? '✅' : '❌'}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-secondary mt-1">
                          {activeQuestion.isRevealed 
                            ? (userSubmission.isCorrect ? 'Correct answer!' : 'Incorrect answer.')
                            : 'Answer will be revealed when the channel owner decides to end the question.'
                          }
                        </p>
                      </div>
                    ) : (
                      <form onSubmit={isAuthenticated ? handleSubmitAnswer : (e) => { e.preventDefault(); setShowGuestForm(true); }} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-white mb-1 font-body">
                            Your Answer
                          </label>
                          <input
                            type="text"
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                            className="input-field"
                            placeholder="Enter your answer"
                            required
                            maxLength={200}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={!answer.trim() || submitting}
                          className="btn-primary"
                        >
                          {submitting ? 'Submitting...' : 'Submit Answer'}
                        </button>
                      </form>
                    )}
                  </div>
                )}

                {/* Owner Controls */}
                {channelData.isOwner && !activeQuestion.isRevealed && (
                  <div className="mt-6 pt-6 border-t border-navy-700">
                    <h3 className="section-heading mb-4">Owner Controls</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-secondary">
                          {activeQuestion.submissions.length} submissions received
                        </p>
                      </div>
                      <button
                        onClick={handleRevealAnswer}
                        className="btn-primary"
                      >
                        Reveal Answer & Score
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="card">
                <h2 className="section-heading mb-4">No Active Question</h2>
                <p className="text-secondary">
                  {channelData.isOwner ? (
                    <>
                      Create a new question to engage your audience.
                      <button
                        onClick={() => navigate(`/channel/${slug}/manage`)}
                        className="btn-primary ml-4"
                      >
                        Create Question
                      </button>
                    </>
                  ) : (
                    'Check back later for a new question from the channel owner.'
                  )}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Leaderboard Tab Content */}
        {activeTab === 'leaderboard' && (
          <div className="tab-content">
            {channelData.leaderboard && channelData.leaderboard.length > 0 ? (
              <div className="card">
                <h2 className="section-heading mb-4">Leaderboard</h2>
                <div className="space-y-3">
                  {channelData.leaderboard.map((entry, index) => (
                    <div key={entry.user._id} className={`leaderboard-row ${
                      user?.username === entry.user.username ? 'bg-teal bg-opacity-10 rounded-lg' : ''
                    }`}>
                      <span className={`leaderboard-rank ${
                        index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 'text-secondary'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="leaderboard-avatar bg-navy-700 rounded-full flex items-center justify-center">
                        <span className="text-secondary text-sm font-medium">
                          {entry.user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="leaderboard-user-info">
                        <span className="leaderboard-username username-display">{entry.user.username}</span>
                        {user?.username === entry.user.username && (
                          <span className="leaderboard-you-badge">You</span>
                        )}
                      </div>
                      <div className="leaderboard-score">
                        <p className="leaderboard-points">{entry.totalScore} points</p>
                        <p className="leaderboard-correct">{entry.correctAnswers}/{entry.questionsAnswered} correct</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card">
                <h2 className="section-heading mb-4">Leaderboard</h2>
                <p className="text-secondary text-center py-8">
                  No scores yet. Be the first to answer a question!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Chat Tab Content */}
        {activeTab === 'chat' && (channelData.isMember || !isAuthenticated) && (
          <div className="tab-content">
            <div className="chat-messages">
              <ChatBox 
                channelSlug={channelData.channel.slug}
                userName={user?.username || guestName || 'Guest'}
              />
            </div>
          </div>
        )}

        {/* History Tab Content */}
        {activeTab === 'history' && (
          <div className="tab-content">
            {channelData.recentQuestions && channelData.recentQuestions.length > 0 ? (
              <div className="card">
                <h2 className="section-heading mb-4">Question History</h2>
                <div className="space-y-4">
                  {channelData.recentQuestions.map((question) => (
                    <div key={question._id} className="border-b border-navy-700 pb-4 last:border-0 last:pb-0">
                      <div className="question-box mb-3">
                        <p className="text-white font-medium">{question.questionText}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        {question.isRevealed ? (
                          <div className="bg-navy-700 border border-yellow border-opacity-30 rounded px-3 py-2">
                            <span className="text-sm font-medium text-yellow">Answer: {question.correctAnswer}</span>
                          </div>
                        ) : question.revealAt ? (
                          <div className="bg-navy-700 border border-gray-500 border-opacity-30 rounded px-3 py-2">
                            <span className="text-sm font-medium text-gray-400">
                              Reveals {new Date(question.revealAt).toLocaleDateString()} at {new Date(question.revealAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-navy-700 border border-gray-500 border-opacity-30 rounded px-3 py-2">
                            <span className="text-sm font-medium text-gray-400">Pending reveal</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-3">
                          <div className="text-sm text-secondary">
                            {question.correctSubmissions}/{question.totalSubmissions} correct
                          </div>
                          {channelData.isOwner && question.totalSubmissions > 0 && (
                            <button
                              onClick={() => handleViewAnswers(question._id)}
                              disabled={loadingAnswers}
                              className="text-xs bg-teal bg-opacity-20 text-teal px-2 py-1 rounded hover:bg-opacity-30 transition-colors"
                            >
                              {loadingAnswers ? 'Loading...' : 'View Answers'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card">
                <h2 className="section-heading mb-4">Question History</h2>
                <p className="text-secondary text-center py-8">
                  No questions yet. Check back later!
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Guest Form Modal */}
      {showGuestForm && (
        <div className="card mb-6 bg-navy-700 border-teal border-opacity-30">
          <h3 className="section-heading mb-4">Join as Guest</h3>
          <form onSubmit={handleSubmitAnswer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1 font-body">
                Your Name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="input-field"
                placeholder="Enter your name"
                required
                minLength={2}
                maxLength={30}
              />
            </div>
            <div className="flex space-x-2">
              <button
                type="submit"
                disabled={!guestName.trim() || !answer.trim()}
                className="btn-primary"
              >
                Submit Answer
              </button>
              <button
                type="button"
                onClick={() => setShowGuestForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Answers Modal */}
      {showAnswersModal && selectedQuestionAnswers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-navy-800 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-navy-700">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Question Answers</h3>
                <button
                  onClick={() => setShowAnswersModal(false)}
                  className="text-secondary hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {/* Question Info */}
              <div className="mb-6">
                <div className="question-box mb-4">
                  <p className="text-white font-medium mb-2">{selectedQuestionAnswers.question.questionText}</p>
                </div>
                <div className="bg-navy-700 border border-yellow border-opacity-30 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow mb-1">Correct Answer:</p>
                  <p className="text-yellow font-semibold">{selectedQuestionAnswers.question.correctAnswer}</p>
                </div>
                <div className="mt-2 text-sm text-secondary">
                  {selectedQuestionAnswers.question.correctSubmissions}/{selectedQuestionAnswers.question.totalSubmissions} correct answers
                </div>
              </div>

              {/* Submissions List */}
              <div className="space-y-3">
                <h4 className="font-semibold text-white mb-3">Submissions ({selectedQuestionAnswers.submissions.length})</h4>
                {selectedQuestionAnswers.submissions.map((submission, index) => (
                  <div key={index} className="bg-navy-700 border border-navy-600 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center">
                          {submission.user ? (
                            <span className="text-secondary text-sm font-medium">
                              {submission.user.username.charAt(0).toUpperCase()}
                            </span>
                          ) : (
                            <span className="text-secondary text-sm font-medium">G</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">
                            {submission.user ? submission.user.username : submission.guestName}
                          </p>
                          <p className="text-sm text-secondary">
                            {submission.user ? 'User' : 'Guest'} • {new Date(submission.submittedAt).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${
                          submission.isCorrect 
                            ? 'bg-green-900 bg-opacity-30 text-green-400' 
                            : 'bg-red-900 bg-opacity-30 text-red-400'
                        }`}>
                          {submission.isCorrect ? 'Correct' : 'Incorrect'}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-navy-600">
                      <p className="text-sm text-secondary mb-1">Answer:</p>
                      <p className="text-white font-medium">{submission.answer}</p>
                    </div>
                  </div>
                ))}
                
                {selectedQuestionAnswers.submissions.length === 0 && (
                  <div className="text-center py-8 text-secondary">
                    No submissions received for this question
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareId={activeQuestion?.shareId}
        questionText={activeQuestion?.questionText}
      />
    </div>
  );
};
