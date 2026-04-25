import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export function useChat(channelSlug, userName) {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const socketRef = useRef(null);
  
  useEffect(() => {
    // Load message history
    fetch(`${API_URL}/api/chat/${channelSlug}`)
      .then(r => r.json())
      .then(data => setMessages(data))
      .catch(err => console.error('Error loading chat history:', err));
    
    // Connect socket
    const socket = io(API_URL);
    socketRef.current = socket;
    
    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_channel', { 
        channelSlug, 
        userName 
      });
    });
    
    socket.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    
    socket.on('system_message', (msg) => {
      setMessages(prev => [...prev, {
        ...msg, 
        type: 'system'
      }]);
    });
    
    socket.on('disconnect', () => {
      setConnected(false);
    });
    
    return () => socket.disconnect();
  }, [channelSlug, userName]);
  
  const sendMessage = (text) => {
    if (socketRef.current && connected) {
      socketRef.current.emit('send_message', {
        channelSlug,
        text,
        senderName: userName,
        senderId: null // pass user id if logged in
      });
    }
  };
  
  return { 
    messages, 
    connected, 
    sendMessage, 
    onlineCount 
  };
}
