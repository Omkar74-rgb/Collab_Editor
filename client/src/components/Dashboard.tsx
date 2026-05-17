import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

interface Room { roomId: string; title: string; language: string; updatedAt: string; }
interface Props { token: string; }

export const Dashboard: React.FC<Props> = ({ token }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [recentRooms, setRecentRooms] = useState<Room[]>([]);
  const [joinId, setJoinId] = useState('');
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const headers = { Authorization: `Bearer ${token}` };
  const API = `${API_URL}/api/documents`;

  const fetchRooms = async () => {
    try {
      const [myRooms, recent] = await Promise.all([
        axios.get(API, { headers }),
        axios.get(`${API}/recent`, { headers }),
      ]);
      setRooms(myRooms.data);
      setRecentRooms(recent.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, []);

  const createRoom = async () => {
    const { data } = await axios.post(API, { title: 'Untitled', language: 'javascript' }, { headers });
    navigate(`/room/${data.roomId}`);
  };

  const deleteRoom = async (roomId: string) => {
    await axios.delete(`${API}/${roomId}`, { headers });
    setRooms(prev => prev.filter(r => r.roomId !== roomId));
  };

  const renameRoom = async (roomId: string) => {
    await axios.patch(`${API}/${roomId}/title`, { title: editTitle }, { headers });
    setRooms(prev => prev.map(r => r.roomId === roomId ? { ...r, title: editTitle } : r));
    setEditingRoom(null);
  };

  const RoomCard = ({ room, showActions = false }: { room: Room; showActions?: boolean }) => (
    <div style={{
      background: '#1e293b',
      border: `1px solid ${showActions ? '#334155' : '#1e40af'}`,
      borderRadius: '12px', padding: '16px',
      display: 'flex', flexDirection: 'column', gap: '10px',
    }}>
      <div style={{ flex: 1 }}>
        {editingRoom === room.roomId ? (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <input
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && renameRoom(room.roomId)}
              autoFocus
              style={{
                flex: 1, minWidth: '120px', background: '#0f172a',
                border: '1px solid #2563eb', color: 'white',
                padding: '6px 10px', borderRadius: '6px',
                fontSize: '14px', outline: 'none',
              }}
            />
            <button onClick={() => renameRoom(room.roomId)} style={{
              background: '#2563eb', color: 'white', border: 'none',
              padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
            }}>Save</button>
            <button onClick={() => setEditingRoom(null)} style={{
              background: '#334155', color: 'white', border: 'none',
              padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
            }}>Cancel</button>
          </div>
        ) : (
          <>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: '15px' }}>{room.title}</div>
            <div style={{ color: '#64748b', fontSize: '12px', marginTop: '4px' }}>
              {room.language} • {showActions ? 'Last edited' : 'Last visited'} {new Date(room.updatedAt).toLocaleDateString()}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(`/room/${room.roomId}`)} style={{
          flex: 1, background: showActions ? '#2563eb' : '#059669',
          color: 'white', border: 'none', padding: '8px 16px',
          borderRadius: '6px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold'
        }}>Open</button>

        {showActions && (
          <>
            <button onClick={() => { setEditingRoom(room.roomId); setEditTitle(room.title); }} style={{
              background: '#334155', color: '#94a3b8', border: 'none',
              padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>✏️</button>
            <button onClick={() => deleteRoom(room.roomId)} style={{
              background: '#450a0a', color: '#f87171', border: 'none',
              padding: '8px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px'
            }}>🗑️</button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', padding: '20px 16px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px'
        }}>
          <h1 style={{ color: 'white', margin: 0, fontSize: '24px' }}>⚡ Collab Editor</h1>
          <button onClick={() => { localStorage.clear(); window.location.href = '/login'; }} style={{
            background: 'transparent', color: '#64748b',
            border: '1px solid #334155', padding: '8px 16px',
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
          }}>Logout</button>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
          <button onClick={createRoom} style={{
            background: '#2563eb', color: 'white', border: 'none',
            padding: '12px 20px', borderRadius: '8px', cursor: 'pointer',
            fontWeight: 'bold', fontSize: '15px', whiteSpace: 'nowrap'
          }}>+ New Room</button>

          <div style={{ display: 'flex', gap: '8px', flex: 1, minWidth: '200px' }}>
            <input
              placeholder="Paste Room ID to join..."
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && joinId && navigate(`/room/${joinId}`)}
              style={{
                flex: 1, background: '#1e293b', border: '1px solid #334155',
                color: 'white', padding: '12px 14px', borderRadius: '8px',
                fontSize: '14px', outline: 'none', minWidth: 0,
              }}
            />
            <button onClick={() => joinId && navigate(`/room/${joinId}`)} style={{
              background: '#059669', color: 'white', border: 'none',
              padding: '12px 16px', borderRadius: '8px',
              cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap'
            }}>Join</button>
          </div>
        </div>

        {loading ? (
          <p style={{ color: '#475569', textAlign: 'center' }}>Loading...</p>
        ) : (
          <>
            {/* My Rooms */}
            <h2 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px', letterSpacing: '0.08em' }}>
              MY ROOMS
            </h2>
            {rooms.length === 0 ? (
              <div style={{
                background: '#1e293b', border: '1px dashed #334155',
                borderRadius: '12px', padding: '40px 20px',
                textAlign: 'center', color: '#475569', marginBottom: '24px'
              }}>
                No rooms yet. Create one to get started!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {rooms.map(room => <RoomCard key={room.roomId} room={room} showActions />)}
              </div>
            )}

            {/* Recently Joined */}
            {recentRooms.length > 0 && (
              <>
                <h2 style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px', letterSpacing: '0.08em' }}>
                  RECENTLY JOINED
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {recentRooms.map(room => <RoomCard key={room.roomId} room={room} />)}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};