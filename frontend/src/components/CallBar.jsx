import React from 'react';
import { useCall } from '../hooks/useCall';

export default function CallBar({ channelSlug, isOwner, socket }) {
  const {
    callActive,
    inCall,
    participants,
    startedBy,
    callContainerRef,
    startCall,
    joinCall,
    leaveCall,
    endCall
  } = useCall(channelSlug, isOwner, socket);

  // State A: No active call + user is OWNER
  if (!callActive && isOwner) {
    return (
      <div className="call-bar">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            🎙️ Start a voice call
          </div>
          <button 
            onClick={startCall}
            className="start-call-btn"
          >
            Start Call
          </button>
        </div>
      </div>
    );
  }

  // State B: Active call + user is MEMBER (not in call)
  if (callActive && !inCall && !isOwner) {
    return (
      <div className="call-bar">
        {/* Hidden call frame container for joining */}
        <div className="call-frame-container" ref={callContainerRef} style={{ height: '0', overflow: 'hidden' }}></div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px'
          }}>
            <span className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </span>
            <span style={{ 
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              {startedBy} is calling
            </span>
            {participants > 0 && (
              <span style={{ 
                color: '#8892A0',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                👥 {participants} in call
              </span>
            )}
          </div>
          <button 
            onClick={joinCall}
            className="join-call-btn"
          >
            Join Call
          </button>
        </div>
      </div>
    );
  }

  // State C: User is IN the call (member)
  if (callActive && inCall && !isOwner) {
    return (
      <div className="call-bar">
        <div className="call-frame-container" ref={callContainerRef}>
          {/* Daily.co iframe will be rendered here */}
        </div>
        <div style={{ 
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button 
            onClick={leaveCall}
            className="end-call-btn"
          >
            Leave Call
          </button>
        </div>
      </div>
    );
  }

  // State D: Active call + user is OWNER (not in call)
  if (callActive && !inCall && isOwner) {
    return (
      <div className="call-bar">
        {/* Hidden call frame container for auto-join */}
        <div className="call-frame-container" ref={callContainerRef} style={{ height: '0', overflow: 'hidden' }}></div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px'
          }}>
            <span className="live-badge">
              <span className="live-dot"></span>
              LIVE
            </span>
            <span style={{ 
              color: '#fff',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Your call is active
            </span>
            {participants > 0 && (
              <span style={{ 
                color: '#8892A0',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                👥 {participants} in call
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={endCall}
              className="end-call-btn"
            >
              End Call
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State E: User is IN the call (owner)
  if (callActive && inCall && isOwner) {
    return (
      <div className="call-bar">
        <div className="call-frame-container" ref={callContainerRef}>
          {/* Daily.co iframe will be rendered here */}
        </div>
        <div style={{ 
          marginTop: '12px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <button 
            onClick={endCall}
            className="end-call-btn"
          >
            End Call
          </button>
        </div>
      </div>
    );
  }

  // Default: No active call + user is member
  return null;
}
