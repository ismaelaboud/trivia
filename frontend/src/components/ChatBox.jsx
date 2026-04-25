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
    <div className="bg-[#112236] border border-[rgba(0,201,167,0.15)] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-[#162D44] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-unbounded text-sm">💬 Channel Chat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#00C9A7] rounded-full animate-pulse"></div>
          <span className="text-[#A8B8C8] font-plus-jakarta-sans text-xs">
            {connected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        className="h-[380px] overflow-y-auto p-4 scroll-smooth"
        style={{
          scrollbarWidth: 'thin',
          scrollbarColor: '#00C9A7 #162D44'
        }}
      >
        <div className="space-y-3">
          {messages.map((message, index) => (
            <div key={message._id || index} className="space-y-1">
              {message.type === 'system' ? (
                <div className="text-center italic text-[#A8B8C8] text-xs">
                  {message.text}
                </div>
              ) : (
                <div className="flex gap-3 items-start">
                  {/* Avatar */}
                  <div className="w-8 h-8 bg-[#00C9A7] rounded-full flex items-center justify-center flex-shrink-0">
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
                            ? 'text-[#FFE66D]' 
                            : 'text-[#00C9A7]'
                        }`}
                      >
                        {message.senderName}
                      </span>
                      <span className="text-[#A8B8C8] text-xs">
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
      </div>

      {/* Input Area */}
      <div className="bg-[#162D44] border-t border-[rgba(0,201,167,0.1)] px-4 py-3">
        <div className="flex gap-2 items-center">
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
              className="w-full bg-[#0D1B2A] border border-[rgba(0,201,167,0.2)] rounded-full px-4 py-2 text-white placeholder-[#A8B8C8] font-plus-jakarta-sans text-sm focus:outline-none focus:border-[#00C9A7] disabled:opacity-50"
            />
            {inputText.length > 400 && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8B8C8] text-xs">
                {inputText.length}/500
              </span>
            )}
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!connected || !inputText.trim()}
            className="w-9 h-9 bg-[#00C9A7] rounded-full flex items-center justify-center text-navy hover:bg-[#00B596] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className="text-navy"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
