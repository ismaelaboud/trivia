import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { channelsAPI } from '../services/api';
import { EmojiPicker } from '../components/EmojiPicker';

export const CreateChannelPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleAvatarChange = (avatar) => {
    setFormData({
      ...formData,
      avatar
    });
    if (error) setError('');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await channelsAPI.create(formData);
      navigate(`/channel/${response.data.slug}`);
    } catch (error) {
      console.error('Failed to create channel:', error);
      setError(error.response?.data?.message || 'Failed to create channel');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const suggestedSlug = generateSlug(formData.name);

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Create Channel</h1>
        <p className="text-gray-600 mt-2">Set up your own trivia channel and start engaging your audience</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <div className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Channel Name *
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="input-field"
                placeholder="Enter channel name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.name && `URL will be: /${suggestedSlug}`}
              </p>
            </div>

            <EmojiPicker 
              value={formData.avatar}
              onChange={handleAvatarChange}
              channelName={formData.name}
            />

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                className="input-field"
                placeholder="Describe your channel (optional)"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
              />
              <p className="mt-1 text-sm text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>
          </div>
        </div>

        {/* Preview */}
        {formData.name && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="flex items-start">
              <div className={`w-12 h-12 flex items-center justify-center rounded-lg mr-3 flex-shrink-0 ${
                formData.avatar ? 'is-emoji' : 'is-letter-fallback'
              }`}
                   style={formData.avatar 
                     ? { border: '1px solid rgba(0,201,167,0.2)' } 
                     : { backgroundColor: '#00C9A7' }
                   }>
                <span className={formData.avatar ? '' : 'text-white font-bold text-lg'}>
                  {formData.avatar || formData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{formData.name}</h4>
                <p className="text-sm text-gray-600">/{suggestedSlug}</p>
                {formData.description && (
                  <p className="text-gray-600 mt-2">{formData.description}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn-outline"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="btn-primary"
          >
            {loading ? (
              <div className="flex justify-center">
                <div className="loading-spinner h-5 w-5"></div>
              </div>
            ) : (
              'Create Channel'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
