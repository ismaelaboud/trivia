import React from 'react';
import { useCall } from '../hooks/useCall';

export default function CallBar({ 
  channelSlug, isOwner, socket 
}) {
  const {
    callActive, inCall, participants,
    startedBy, startCall,
    joinCall, leaveCall, endCall
  } = useCall(channelSlug, isOwner, socket);

  return (
    <div className="call-bar">
      
      {/* State A: No call, owner */}
      {!callActive && isOwner && (
        <div className="call-bar-row">
          <span>🎙️ Start a voice call</span>
          <button 
            onClick={startCall}
            className="start-call-btn"
          >
            Start Call
          </button>
        </div>
      )}
      
      {/* State B: Call active, member not in call */}
      {callActive && !inCall && !isOwner && (
        <div className="call-bar-row">
          <div className="call-bar-left">
            <span className="live-badge">
              <span className="live-dot" />
              LIVE
            </span>
            <span className="call-info">
              {startedBy} is calling
            </span>
            {participants > 0 && (
              <span className="participants-count">
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
      )}
      
      {/* State C: Member in call */}
      {inCall && !isOwner && (
        <div className="call-bar-row" 
          style={{ justifyContent: 'center' }}>
          <button 
            onClick={leaveCall}
            className="end-call-btn"
          >
            Leave Call
          </button>
        </div>
      )}
      
      {/* State D: Owner, call active, not in call */}
      {callActive && !inCall && isOwner && (
        <div className="call-bar-row">
          <div className="call-bar-left">
            <span className="live-badge">
              <span className="live-dot" />
              LIVE
            </span>
            <span className="call-info">
              Your call is active
            </span>
            {participants > 0 && (
              <span className="participants-count">
                👥 {participants} in call
              </span>
            )}
          </div>
          <button 
            onClick={endCall}
            className="end-call-btn"
          >
            End Call
          </button>
        </div>
      )}
      
      {/* State E: Owner in call */}
      {inCall && isOwner && (
        <div className="call-bar-row"
          style={{ justifyContent: 'center' }}>
          <button 
            onClick={endCall}
            className="end-call-btn"
          >
            End Call
          </button>
        </div>
      )}
      
    </div>
  );
}
