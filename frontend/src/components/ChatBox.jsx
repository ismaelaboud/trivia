import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../hooks/useChat';

const ChatBox = ({ channelSlug, userName }) => {
  const [inputText, setInputText] = useState('');
  const { messages, connected, sendMessage } = useChat(channelSlug, userName);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (text && text.length <= 500) {
      sendMessage(text);
      setInputText('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <span>💬 Channel Chat</span>
        <span className="connected-dot">
          {connected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>
      
      {/* Messages Area */}
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={message._id || index}>
            {message.type === 'system' ? (
              <div className="text-center italic text-secondary text-xs">
                {message.text}
              </div>
            ) : (
              <div className="flex gap-3 items-start">
                {/* Avatar */}
                <div className="w-8 h-8 bg-teal rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-navy font-unbounded text-sm font-bold">
                    {message.senderInitial}
                  </span>
                </div>
                
                {/* Message Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span 
                      className={`font-plus-jakarta-sans font-semibold text-sm ${
                        message.senderName === userName 
                          ? 'text-yellow' 
                          : 'text-teal'
                      }`}
                    >
                      {message.senderName}
                    </span>
                    <span className="text-secondary text-xs">
                      {formatTime(message.createdAt)}
                    </span>
                  </div>
                  <div className="text-white font-plus-jakarta-sans text-sm leading-relaxed break-words">
                    {message.text}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input Bar */}
      <div className="chat-input-bar">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            maxLength={500}
            disabled={!connected}
            className="chat-input"
          />
          {inputText.length > 400 && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary text-xs">
              {inputText.length}/500
            </span>
          )}
        </div>
        <button
          onClick={handleSendMessage}
          disabled={!connected || !inputText.trim()}
          className="chat-send-btn"
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
