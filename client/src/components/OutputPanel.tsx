import React from 'react';

interface Props {
  output: string;
  error: string;
  status: string;
  time: string;
  memory: number;
  isRunning: boolean;
  onClose: () => void;
}

export const OutputPanel: React.FC<Props> = ({
  output, error, status, time, memory, isRunning, onClose
}) => {
  const isError = !!error || status === 'Runtime Error' || status === 'Compilation Error';

  return (
    <div style={{
      height: '220px',
      background: '#0f172a',
      borderTop: '2px solid #1e293b',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Courier New, monospace',
    }}>
      {/* Output toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '6px 16px', background: '#1e293b', borderBottom: '1px solid #334155'
      }}>
        <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 'bold' }}>OUTPUT</span>
        {status && (
          <span style={{
            fontSize: '12px', padding: '2px 8px', borderRadius: '4px',
            background: isError ? '#450a0a' : '#052e16',
            color: isError ? '#f87171' : '#4ade80'
          }}>
            {status}
          </span>
        )}
        {time && (
          <span style={{ fontSize: '12px', color: '#64748b' }}>⏱ {time}s</span>
        )}
        {memory > 0 && (
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            💾 {(memory / 1024).toFixed(1)} MB
          </span>
        )}
        <button onClick={onClose} style={{
          marginLeft: 'auto', background: 'transparent', border: 'none',
          color: '#64748b', cursor: 'pointer', fontSize: '16px'
        }}>✕</button>
      </div>

      {/* Output content */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px 16px' }}>
        {isRunning ? (
          <span style={{ color: '#60a5fa', fontSize: '13px' }}>⏳ Running...</span>
        ) : error ? (
          <pre style={{ color: '#f87171', margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}>
            {error}
          </pre>
        ) : output ? (
          <pre style={{ color: '#4ade80', margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}>
            {output}
          </pre>
        ) : (
          <span style={{ color: '#475569', fontSize: '13px' }}>No output</span>
        )}
      </div>
    </div>
  );
};