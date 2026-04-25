import React, { useState } from 'react';

export const EmojiPicker = ({ value, onChange, channelName }) => {
  const [selectedEmoji, setSelectedEmoji] = useState(value || '');

  const emojis = [
    '🌍', '🏆', '⚽', '🎮', '💻', '🔬',
    '📚', '🎵', '🎨', '🍕', '✈️', '💡',
    '🕌', '⚡', '🧠', '🏋️', '🎭', '📷',
    '🐾', '🌿', '💰', '🔥', '🎯', '🚀'
  ];

  const handleEmojiSelect = (emoji) => {
    setSelectedEmoji(emoji);
    onChange(emoji);
  };

  const getAvatarPreview = () => {
    if (selectedEmoji) {
      return selectedEmoji;
    }
    if (channelName) {
      return channelName.charAt(0).toUpperCase();
    }
    return '?';
  };

  return (
    <div className="space-y-4">
      {/* Avatar Preview */}
      <div className="flex flex-col items-center">
        <div 
          className={`w-16 h-16 flex items-center justify-center rounded-xl ${
            selectedEmoji ? 'is-emoji' : 'is-letter-fallback'
          }`}
          style={selectedEmoji 
            ? { border: '1px solid rgba(0,201,167,0.2)' } 
            : { backgroundColor: '#00C9A7' }
          }
        >
          <span className={selectedEmoji ? '' : 'text-white'} style={{ fontSize: '28px' }}>
            {getAvatarPreview()}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">Channel Avatar Preview</p>
      </div>

      {/* Emoji Grid */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Choose Channel Icon
        </label>
        <div className="grid grid-cols-6 gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiSelect(emoji)}
              className={`
                w-11 h-11 flex items-center justify-center rounded-lg text-[22px]
                transition-colors duration-150 cursor-pointer
                ${selectedEmoji === emoji 
                  ? 'border-2 border-teal-500 bg-teal-100' 
                  : 'bg-[#162D44] hover:bg-[rgba(0,201,167,0.15)]'
                }
              `}
              style={{
                backgroundColor: selectedEmoji === emoji 
                  ? 'rgba(0,201,167,0.2)' 
                  : selectedEmoji !== emoji ? '#162D44' : undefined
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
