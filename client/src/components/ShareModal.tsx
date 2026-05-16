import React, { useState } from 'react';

interface Props {
  roomId: string;
  onClose: () => void;
}

export const ShareModal: React.FC<Props> = ({ roomId, onClose }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#1e293b', borderRadius: '12px', padding: '28px',
        width: '480px', border: '1px solid #334155'
      }}>
        <h3 style={{ color: 'white', margin: '0 0 20px' }}>🔗 Share This Room</h3>

        {/* Room ID */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
            ROOM ID
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input readOnly value={roomId} style={{
              flex: 1, background: '#0f172a', border: '1px solid #334155',
              color: '#e2e8f0', padding: '8px 12px', borderRadius: '6px',
              fontFamily: 'Courier New', fontSize: '13px'
            }} />
            <button onClick={handleCopyId} style={{
              background: '#334155', color: 'white', border: 'none',
              padding: '8px 14px', borderRadius: '6px', cursor: 'pointer'
            }}>Copy ID</button>
          </div>
        </div>

        {/* Full URL */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
            SHAREABLE LINK
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input readOnly value={shareUrl} style={{
              flex: 1, background: '#0f172a', border: '1px solid #334155',
              color: '#e2e8f0', padding: '8px 12px', borderRadius: '6px', fontSize: '12px'
            }} />
            <button onClick={handleCopy} style={{
              background: copied ? '#059669' : '#2563eb', color: 'white',
              border: 'none', padding: '8px 14px', borderRadius: '6px', cursor: 'pointer',
              transition: 'background 0.2s'
            }}>
              {copied ? '✅ Copied!' : '📋 Copy'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{
            background: 'transparent', color: '#94a3b8', border: '1px solid #334155',
            padding: '8px 20px', borderRadius: '6px', cursor: 'pointer'
          }}>Close</button>
        </div>
      </div>
    </div>
  );
};