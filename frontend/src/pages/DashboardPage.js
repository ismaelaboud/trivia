import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { channelsAPI } from '../services/api';

export const DashboardPage = () => {
  const { user, updateUser } = useAuth();
  const [channels, setChannels] = useState({ owned: [], joined: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      const response = await channelsAPI.getUserChannels();
      setChannels(response.data);
    } catch (error) {
      console.error('Failed to load channels:', error);
      setError('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async (slug) => {
    try {
      await channelsAPI.join(slug);
      loadChannels(); // Refresh channels
    } catch (error) {
      console.error('Failed to join channel:', error);
      setError('Failed to join channel');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="section-heading text-white">Dashboard</h1>
        <p className="text-secondary mt-2">Manage your trivia channels and track your progress</p>
      </div>

      {error && (
        <div className="bg-navy-800 border border-coral border-opacity-30 text-coral px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mr-4">
              <span className="text-yellow font-bold text-xl">{user.totalScore}</span>
            </div>
            <div>
              <p className="text-sm text-secondary font-body">Total Score</p>
              <p className="text-lg font-semibold text-white font-body">Points</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mr-4">
              <span className="text-teal font-bold text-xl">{channels.owned.length}</span>
            </div>
            <div>
              <p className="text-sm text-secondary font-body">Channels Owned</p>
              <p className="text-lg font-semibold text-white font-body">Created</p>
            </div>
          </div>
        </div>
        
        <div className="card">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-navy-700 rounded-lg flex items-center justify-center mr-4">
              <span className="text-coral font-bold text-xl">{channels.joined.length}</span>
            </div>
            <div>
              <p className="text-sm text-secondary font-body">Channels Joined</p>
              <p className="text-lg font-semibold text-white font-body">Following</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/create-channel" className="btn-primary">
          Create New Channel
        </Link>
        <Link to="/search" className="btn-secondary">
          Discover Channels
        </Link>
      </div>

      {/* Channels You Own */}
      <div className="mb-8">
        <h2 className="section-heading text-white mb-4">Your Channels</h2>
        {channels.owned.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-secondary mb-4">You haven't created any channels yet</p>
            <Link to="/create-channel" className="btn-primary">
              Create Your First Channel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.owned.map((channel) => (
              <div key={channel._id} className="card">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${
                    channel.avatar ? 'is-emoji' : 'is-letter-fallback'
                  }`}
                       style={channel.avatar ? {} : { backgroundColor: '#00C9A7' }}>
                    {channel.avatar ? (
                      <span className="text-3xl">
                        {channel.avatar}
                      </span>
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {channel.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="card-title text-white">{channel.name}</h3>
                    <p className="text-sm text-secondary font-body">/{channel.slug}</p>
                  </div>
                </div>
                
                {channel.description && (
                  <p className="text-secondary mb-4 line-clamp-2 font-body">{channel.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-secondary font-body">{channel.totalQuestions} questions</span>
                  <span className="text-xs bg-navy-700 text-teal px-2 py-1 rounded-full">Owner</span>
                </div>
                
                <Link to={`/channel/${channel.slug}`} className="btn-outline w-full text-center">
                  Manage Channel
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Channels You've Joined */}
      <div>
        <h2 className="section-heading text-white mb-4">Channels You've Joined</h2>
        {channels.joined.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-secondary mb-4">You haven't joined any channels yet</p>
            <Link to="/search" className="btn-primary">
              Discover Channels
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {channels.joined.map((channel) => (
              <div key={channel._id} className="card">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mr-3 ${
                    channel.avatar ? 'is-emoji' : 'is-letter-fallback'
                  }`}
                       style={channel.avatar ? {} : { backgroundColor: '#00C9A7' }}>
                    {channel.avatar ? (
                      <span className="text-3xl">
                        {channel.avatar}
                      </span>
                    ) : (
                      <span className="text-white font-bold text-lg">
                        {channel.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="card-title text-white">{channel.name}</h3>
                    <p className="text-sm text-secondary font-body">by {channel.owner.username}</p>
                  </div>
                </div>
                
                {channel.description && (
                  <p className="text-secondary mb-4 line-clamp-2 font-body">{channel.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-secondary font-body">{channel.totalQuestions} questions</span>
                  <span className="text-xs bg-navy-700 text-yellow px-2 py-1 rounded-full">Member</span>
                </div>
                
                <Link to={`/channel/${channel.slug}`} className="btn-outline w-full text-center">
                  View Channel
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
