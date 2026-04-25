import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { channelsAPI } from '../services/api';

export const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => {
        performSearch(searchQuery);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  const performSearch = async (query, page = 1) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await channelsAPI.search(query, page);
      setSearchResults(response.data.channels);
      setPagination(response.data.pagination);
      setHasSearched(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async (slug) => {
    try {
      await channelsAPI.join(slug);
      // Refresh search results to update join status
      performSearch(searchQuery, pagination?.page || 1);
    } catch (error) {
      console.error('Failed to join channel:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="section-heading">Discover Channels</h1>
        <p className="text-secondary mt-2">Find trivia channels to join and test your knowledge</p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search for channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field search-input"
          />
          <div className="search-icon">
            <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="loading-spinner"></div>
        </div>
      )}

      {/* Search Results */}
      {!loading && hasSearched && (
        <div>
          {searchResults.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-navy-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No channels found</h3>
              <p className="text-secondary">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-secondary">
                  Found {pagination?.total || 0} channels
                </p>
              </div>
              
              {searchResults.map((channel) => (
                <div key={channel._id} className="card">
                  <div className="flex items-start">
                    <div className="w-16 h-16 channel-avatar rounded-lg flex items-center justify-center mr-4 flex-shrink-0">
                      <span className="font-bold text-xl">
                        {channel.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="channel-name">{channel.name}</h3>
                          <p className="channel-slug mb-2">/{channel.slug}</p>
                          
                          {channel.description && (
                            <p className="channel-description mb-3 line-clamp-2">{channel.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-sm channel-meta">
                            <span>by {channel.owner.username}</span>
                            <span>{channel.members.length} members</span>
                            <span>{channel.totalQuestions} questions</span>
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          <Link
                            to={`/channel/${channel.slug}`}
                            className="btn-outline text-sm whitespace-nowrap"
                          >
                            View Channel
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-8">
                  <button
                    onClick={() => performSearch(searchQuery, pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  <span className="text-secondary">
                    Page {pagination.page} of {pagination.pages}
                  </span>
                  
                  <button
                    onClick={() => performSearch(searchQuery, pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Popular Channels (when no search) */}
      {!hasSearched && !loading && (
        <div>
          <h2 className="section-heading mb-4">Popular Channels</h2>
          <div className="card text-center py-12">
            <p className="text-secondary mb-4">Start searching to discover channels</p>
            <p className="text-sm text-secondary">Try searching for topics like "tech", "science", or "movies"</p>
          </div>
        </div>
      )}
    </div>
  );
};
