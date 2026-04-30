import { useState, useEffect, useRef } from 'react';
import DailyIframe from '@daily-co/daily-js';
import { API_URL } from '../config/api';

export function useCall(channelSlug, isOwner, socket) {
  const [callActive, setCallActive] = useState(false);
  const [roomUrl, setRoomUrl] = useState(null);
  const [inCall, setInCall] = useState(false);
  const [participants, setParticipants] = useState(0);
  const [callFrame, setCallFrame] = useState(null);
  const [startedBy, setStartedBy] = useState(null);
  const callContainerRef = useRef(null);
  
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
      if (callFrame) callFrame.destroy();
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
  }, [socket, callFrame]);
  
  const startCall = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/calls/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ channelSlug })
      });
      const data = await res.json();
      if (data.roomUrl) {
        setCallActive(true);
        setRoomUrl(data.roomUrl);
      }
    } catch (err) {
      console.error('Error starting call:', err);
    }
  };
  
  const joinCall = async () => {
    if (!roomUrl || !callContainerRef.current) return;
    
    try {
      const frame = DailyIframe.createFrame(
        callContainerRef.current,
        {
          iframeStyle: {
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: '10px'
          },
          showLeaveButton: true,
          showFullscreenButton: true,
          theme: {
            colors: {
              accent: '#00C9A7',
              accentText: '#0D1B2A',
              background: '#112236',
              backgroundAccent: '#162D44',
              baseText: '#FFFFFF',
              border: 'rgba(0,201,167,0.2)',
            }
          }
        }
      );
      
      await frame.join({ url: roomUrl });
      setCallFrame(frame);
      setInCall(true);
      
      frame.on('left-meeting', () => {
        setInCall(false);
        frame.destroy();
        setCallFrame(null);
      });
      
      // Notify others via socket
      socket?.emit('call_joined', { channelSlug });
    } catch (err) {
      console.error('Error joining call:', err);
    }
  };
  
  const leaveCall = async () => {
    if (callFrame) {
      await callFrame.leave();
      callFrame.destroy();
      setCallFrame(null);
    }
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
      if (callFrame) {
        await callFrame.leave();
        callFrame.destroy();
        setCallFrame(null);
      }
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
    callContainerRef,
    startCall,
    joinCall,
    leaveCall,
    endCall
  };
}
