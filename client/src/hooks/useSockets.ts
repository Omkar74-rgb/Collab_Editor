import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSocket(token: string | null) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;
    socketRef.current = io('http://localhost:5000', { auth: { token } });
    return () => { socketRef.current?.disconnect(); };
  }, [token]);

  return socketRef;
}