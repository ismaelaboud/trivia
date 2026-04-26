import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { API_URL, SOCKET_URL } from '../config/api';

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
    
    // Connect socket with proper configuration
    const socket = io(SOCKET_URL, {
      transports: ['polling'],  // polling ONLY for now
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 30000,
      forceNew: true
    });
    
    socketRef.current = socket;
    
    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setConnected(true);
      socket.emit('join_channel', { 
        channelSlug, 
        userName 
      });
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket error:', err.message);
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
