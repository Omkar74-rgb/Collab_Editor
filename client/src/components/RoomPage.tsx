import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { CollabEditor } from './collabEditor';
import axios from 'axios';

interface Props { token: string; username: string; }

export const RoomPage: React.FC<Props> = ({ token, username }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const s = io('http://localhost:5000', { auth: { token } });
    setSocket(s);

    // Track this room as recently joined
    if (roomId) {
      axios.post(`http://localhost:5000/api/documents/recent/${roomId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {}); // silently fail
    }

    return () => { s.disconnect(); };
  }, [token, roomId]);

  if (!socket || !roomId) return (
    <div style={{ 
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: '#0f172a', color: 'white' 
    }}>
      Connecting...
    </div>
  );

  return <CollabEditor roomId={roomId} username={username} socket={socket} />;
};