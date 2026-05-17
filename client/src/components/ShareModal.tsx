import React, { useState } from 'react';

interface Props { roomId: string; onClose: () => void; }

export const ShareModal: React.FC<Props> = ({ roomId, onClose }) => {
  const [copied, setCopied] = useState('');
  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '16px',
    }}>
      <div style={{
        background: '#1e293b', borderRadius: '16px', padding: '24px',
        width: '100%', maxWidth: '480px', border: '1px solid #334155',
        boxSizing: 'border-box',
      }}>
        <h3 style={{ color: 'white', margin: '0 0 20px', fontSize: '18px' }}>🔗 Share This Room</h3>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
            ROOM ID
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input readOnly value={roomId} style={{
              flex: 1, minWidth: 0, background: '#0f172a', border: '1px solid #334155',
              color: '#e2e8f0', padding: '10px 12px', borderRadius: '8px',
              fontFamily: 'Courier New', fontSize: '13px', outline: 'none',
            }} />
            <button onClick={() => handleCopy(roomId, 'id')} style={{
              background: copied === 'id' ? '#059669' : '#334155',
              color: 'white', border: 'none', padding: '10px 14px',
              borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px'
            }}>{copied === 'id' ? '✅' : 'Copy'}</button>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ color: '#94a3b8', fontSize: '11px', display: 'block', marginBottom: '6px', letterSpacing: '0.05em' }}>
            SHAREABLE LINK
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input readOnly value={shareUrl} style={{
              flex: 1, minWidth: 0, background: '#0f172a', border: '1px solid #334155',
              color: '#e2e8f0', padding: '10px 12px', borderRadius: '8px',
              fontSize: '12px', outline: 'none',
            }} />
            <button onClick={() => handleCopy(shareUrl, 'url')} style={{
              background: copied === 'url' ? '#059669' : '#2563eb',
              color: 'white', border: 'none', padding: '10px 14px',
              borderRadius: '8px', cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '13px'
            }}>{copied === 'url' ? '✅' : '📋 Copy'}</button>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: '100%', background: 'transparent', color: '#94a3b8',
          border: '1px solid #334155', padding: '10px',
          borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
        }}>Close</button>
      </div>
    </div>
  );
};