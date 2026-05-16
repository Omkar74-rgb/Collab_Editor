import { Server, Socket } from 'socket.io';
import DocumentModel from '../models/Document';

const activeRooms = new Map<string, string>();
const roomUsers = new Map<string, Map<string, { username: string; color: string }>>();
const USER_COLORS = ['#F87171','#60A5FA','#34D399','#FBBF24','#A78BFA','#F472B6'];

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {

    socket.on('join-room', async ({ roomId, username }) => {
      socket.join(roomId);

      if (!activeRooms.has(roomId)) {
        const doc = await DocumentModel.findOne({ roomId });
        activeRooms.set(roomId, doc?.content || '');
      }

      if (!roomUsers.has(roomId)) roomUsers.set(roomId, new Map());
      const color = USER_COLORS[roomUsers.get(roomId)!.size % USER_COLORS.length];
      roomUsers.get(roomId)!.set(socket.id, { username, color });

      socket.emit('document-loaded', {
        content: activeRooms.get(roomId),
        users: Array.from(roomUsers.get(roomId)!.entries()).map(([id, u]) => ({ id, ...u }))
      });

      socket.to(roomId).emit('user-joined', {
        socketId: socket.id, username, color,
        users: Array.from(roomUsers.get(roomId)!.entries()).map(([id, u]) => ({ id, ...u }))
      });
    });

    socket.on('code-change', ({ roomId, content }) => {
      activeRooms.set(roomId, content);
      socket.to(roomId).emit('code-update', { content });
    });

    socket.on('cursor-move', ({ roomId, position }) => {
      const rooms = roomUsers.get(roomId);
      if (rooms?.has(socket.id)) {
        socket.to(roomId).emit('cursor-update', {
          socketId: socket.id, position, ...rooms.get(socket.id)
        });
      }
    });

    socket.on('save-document', async ({ roomId }) => {
      const content = activeRooms.get(roomId) || '';
      await DocumentModel.findOneAndUpdate({ roomId }, { content });
      socket.emit('document-saved');
    });

    socket.on('language-change', ({ roomId, language }) => {
      socket.to(roomId).emit('language-update', { language });
    });

    // ── CHAT ─────────────────────────────────────────
    socket.on('send-message', ({ roomId, message, username }) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    io.to(roomId).emit('receive-message', { message, username, timestamp, socketId: socket.id });
    });

    socket.on('disconnecting', () => {
      socket.rooms.forEach(roomId => {
        roomUsers.get(roomId)?.delete(socket.id);
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          users: Array.from(roomUsers.get(roomId)?.entries() || []).map(([id, u]) => ({ id, ...u }))
        });
        if (roomUsers.get(roomId)?.size === 0) {
          roomUsers.delete(roomId);
          activeRooms.delete(roomId);
        }
      });
    });
  });
}