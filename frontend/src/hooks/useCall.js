import { useState, useEffect } from 'react';
import { API_URL } from '../config/api';

export function useCall(channelSlug, isOwner, socket) {
  const [callActive, setCallActive] = useState(false);
  const [roomUrl, setRoomUrl] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [startedBy, setStartedBy] = useState(null);
  
  // Check for active call on mount
  useEffect(() => {
    fetch(`${API_URL}/api/calls/active/${channelSlug}`)
      .then(r => r.json())
      .then(data => {
        if (data.active) {
          setCallActive(true);
          setRoomUrl(data.roomUrl);
          setStartedBy(data.startedBy);
        }
      })
      .catch(err => console.error('Error checking active call:', err));
  }, [channelSlug]);
  
  // Listen for call events via socket
  useEffect(() => {
    if (!socket) return;
    
    socket.on('call_started', ({ roomUrl, startedBy }) => {
      setCallActive(true);
      setRoomUrl(roomUrl);
      setStartedBy(startedBy);
    });
    
    socket.on('call_ended', () => {
      setCallActive(false);
      setRoomUrl(null);
      setInCall(false);
      setStartedBy(null);
    });
    
    socket.on('participant_joined', () => {
      setParticipants(p => p + 1);
    });
    
    socket.on('participant_left', () => {
      setParticipants(p => Math.max(0, p - 1));
    });
    
    return () => {
      socket.off('call_started');
      socket.off('call_ended');
      socket.off('participant_joined');
      socket.off('participant_left');
    };
  }, [socket]);
  
  const startCall = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${API_URL}/api/calls/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ channelSlug })
        }
      );
      const data = await res.json();
      
      if (data.roomUrl) {
        setCallActive(true);
        setRoomUrl(data.roomUrl);
        setStartedBy('You');
        
        // KEY FIX: directly join using the URL 
        // returned from API — do NOT rely on 
        // state since setRoomUrl is async and 
        // roomUrl state won't be updated yet
        // when joinCall() runs
        await joinCallWithUrl(data.roomUrl);
      }
    } catch (err) {
      console.error('Start call failed:', err);
    }
  };
  
  const joinCallWithUrl = async (url) => {
    if (!url) {
      console.error('No call URL available');
      return;
    }
    // Open Daily.co room in new tab
    window.open(url, '_blank');
    setInCall(true);
    socket?.emit('call_joined', { channelSlug });
  };
  
  const joinCall = async () => {
    await joinCallWithUrl(roomUrl);
  };
  
  const leaveCall = async () => {
    setInCall(false);
    socket?.emit('call_left', { channelSlug });
  };
  
  const endCall = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/calls/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ channelSlug })
      });
      setInCall(false);
      setCallActive(false);
      setRoomUrl(null);
      setStartedBy(null);
    } catch (err) {
      console.error('Error ending call:', err);
    }
  };
  
  return {
    callActive,
    inCall,
    participants,
    startedBy,
    startCall,
    joinCall,
    leaveCall,
    endCall
  };
}
