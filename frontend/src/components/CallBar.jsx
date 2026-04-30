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

  // Always render the container div in the DOM
  const renderCallContainer = () => (
    <div
      ref={callContainerRef}
      style={{
        display: inCall ? 'block' : 'none',
        width: '100%',
        height: inCall ? '420px' : '0px',
        borderRadius: '10px',
        overflow: 'hidden',
        background: '#0D1B2A',
        marginTop: inCall ? '12px' : '0'
      }}
    />
  );

  // State A: No active call + user is OWNER
  if (!callActive && isOwner) {
    return (
      <div className="call-bar">
        {renderCallContainer()}
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
        {renderCallContainer()}
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
        {renderCallContainer()}
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
        {renderCallContainer()}
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
        {renderCallContainer()}
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
  return (
    <div className="call-bar">
      {renderCallContainer()}
    </div>
  );
}
