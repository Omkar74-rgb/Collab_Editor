import React, { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';

interface Message {
  socketId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface Props {
  socket: Socket;
  roomId: string;
  username: string;
  users: { id: string; username: string; color: string }[];
}

export const ChatPanel: React.FC<Props> = ({ socket, roomId, username, users }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    socket.on('receive-message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { socket.off('receive-message'); };
  }, [socket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit('send-message', { roomId, message: input.trim(), username });
    setInput('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const getUserColor = (socketId: string) => {
    return users.find(u => u.id === socketId)?.color || '#94a3b8';
  };

  return (
    <div style={{
      width: '280px', background: '#0f172a', borderLeft: '1px solid #1e293b',
      display: 'flex', flexDirection: 'column', height: '100%'
    }}>
      {/* Chat header */}
      <div style={{
        padding: '12px 16px', background: '#1e293b',
        borderBottom: '1px solid #334155',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}>
        <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>💬 Room Chat</span>
        <span style={{
          marginLeft: 'auto', background: '#334155', color: '#94a3b8',
          fontSize: '11px', padding: '2px 8px', borderRadius: '10px'
        }}>
          {users.length} online
        </span>
      </div>

      {/* Online users */}
      <div style={{
        padding: '8px 12px', borderBottom: '1px solid #1e293b',
        display: 'flex', flexWrap: 'wrap', gap: '6px'
      }}>
        {users.map(u => (
          <span key={u.id} style={{
            background: u.color, color: 'white', fontSize: '11px',
            padding: '2px 8px', borderRadius: '10px'
          }}>
            {u.username} {u.username === username ? '(you)' : ''}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.length === 0 && (
          <span style={{ color: '#475569', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
            No messages yet. Say hi! 👋
          </span>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.username === username;
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                <span style={{ color: getUserColor(msg.socketId), fontSize: '11px', fontWeight: 'bold' }}>
                  {isMe ? 'You' : msg.username}
                </span>
                <span style={{ color: '#475569', fontSize: '10px' }}>{msg.timestamp}</span>
              </div>
              <div style={{
                background: isMe ? '#1d4ed8' : '#1e293b',
                color: 'white', padding: '8px 12px', borderRadius: isMe ? '12px 12px 0 12px' : '12px 12px 12px 0',
                fontSize: '13px', maxWidth: '210px', wordBreak: 'break-word', lineHeight: '1.4'
              }}>
                {msg.message}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{ padding: '12px', borderTop: '1px solid #1e293b', display: 'flex', gap: '8px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Type a message..."
          style={{
            flex: 1, background: '#1e293b', border: '1px solid #334155',
            color: 'white', padding: '8px 10px', borderRadius: '8px',
            fontSize: '13px', outline: 'none'
          }}
        />
        <button onClick={sendMessage} style={{
          background: '#2563eb', color: 'white', border: 'none',
          padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '16px'
        }}>➤</button>
      </div>
    </div>
  );
};