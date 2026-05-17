import React, { useEffect, useRef, useState, useCallback } from 'react';
import Editor, { OnChange } from '@monaco-editor/react';
import { Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { runCode } from '../services/codeRunner';
import { OutputPanel } from './OutputPanel';
import { ShareModal } from './ShareModal';
import { ChatPanel } from './ChatPanel';

interface User { id: string; username: string; color: string; }
interface Props { roomId: string; username: string; socket: Socket; }

export const CollabEditor: React.FC<Props> = ({ roomId, username, socket }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState('// Start coding here...\n');
  const [language, setLanguage] = useState('javascript');
  const [users, setUsers] = useState<User[]>([]);
  const [saved, setSaved] = useState(false);
  const [unsaved, setUnsaved] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [showChat, setShowChat] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [outputError, setOutputError] = useState('');
  const [outputStatus, setOutputStatus] = useState('');
  const [outputTime, setOutputTime] = useState('');
  const [outputMemory, setOutputMemory] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const isRemote = useRef(false);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    socket.emit('join-room', { roomId, username });
    socket.on('document-loaded', ({ content, users: u }) => { setCode(content || '// Start coding here...\n'); setUsers(u); });
    socket.on('user-joined', ({ users: u }) => setUsers(u));
    socket.on('user-left', ({ users: u }) => setUsers(u));
    socket.on('code-update', ({ content }) => { isRemote.current = true; setCode(content); });
    socket.on('language-update', ({ language: l }) => setLanguage(l));
    socket.on('document-saved', () => { setSaved(true); setUnsaved(false); setTimeout(() => setSaved(false), 2000); });
    return () => {
      ['document-loaded', 'user-joined', 'user-left', 'code-update', 'language-update', 'document-saved']
        .forEach(e => socket.off(e));
    };
  }, [roomId, username, socket]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        socket.emit('save-document', { roomId });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [socket, roomId]);

  const handleChange: OnChange = (value) => {
    if (isRemote.current) { isRemote.current = false; return; }
    const content = value || '';
    setCode(content);
    setUnsaved(true);
    socket.emit('code-change', { roomId, content });
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    socket.emit('language-change', { roomId, language: lang });
  };

  const handleRun = async () => {
    setIsRunning(true);
    setShowOutput(true);
    setOutput(''); setOutputError(''); setOutputStatus(''); setOutputTime(''); setOutputMemory(0);
    try {
      const result = await runCode(code, language);
      setOutput(result.stdout || result.compile_output || '');
      setOutputError(result.stderr || '');
      setOutputStatus(result.status.description);
      setOutputTime(result.time || '');
      setOutputMemory(result.memory || 0);
    } catch (err: any) {
      setOutputError(err.message);
      setOutputStatus('Error');
    } finally {
      setIsRunning(false);
    }
  };

  const btnStyle = (bg: string): React.CSSProperties => ({
    background: bg, color: 'white', border: 'none',
    padding: isMobile ? '6px 10px' : '6px 14px',
    borderRadius: '6px', cursor: 'pointer',
    fontSize: isMobile ? '12px' : '13px',
    whiteSpace: 'nowrap' as const,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a', overflow: 'hidden' }}>

      {/* ── TOOLBAR ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '6px',
        padding: '8px 12px', background: '#1e293b',
        borderBottom: '1px solid #334155',
        overflowX: 'auto', flexShrink: 0,
        WebkitOverflowScrolling: 'touch' as any,
      }}>
        <button onClick={() => navigate('/')} style={btnStyle('#334155')}>←</button>

        <span style={{ color: 'white', fontWeight: 'bold', fontSize: isMobile ? '13px' : '14px', whiteSpace: 'nowrap' }}>
          ⚡ {isMobile ? '' : 'Collab'}
        </span>

        {unsaved && <span style={{ color: '#f59e0b', fontSize: '11px', whiteSpace: 'nowrap' }}>●</span>}

        <select value={language} onChange={e => handleLanguageChange(e.target.value)} style={{
          background: '#334155', color: 'white', border: 'none',
          padding: '6px 8px', borderRadius: '6px',
          fontSize: isMobile ? '12px' : '13px', cursor: 'pointer'
        }}>
          {['javascript', 'typescript', 'python', 'java', 'cpp', 'go'].map(l =>
            <option key={l} value={l}>{l}</option>
          )}
        </select>

        {/* Font size — hide label on mobile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
          <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={{
            background: '#334155', color: 'white', border: 'none',
            width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
          }}>−</button>
          {!isMobile && <span style={{ color: '#94a3b8', fontSize: '12px', minWidth: '30px', textAlign: 'center' }}>{fontSize}px</span>}
          <button onClick={() => setFontSize(f => Math.min(24, f + 1))} style={{
            background: '#334155', color: 'white', border: 'none',
            width: '24px', height: '24px', borderRadius: '4px', cursor: 'pointer', fontSize: '14px'
          }}>+</button>
        </div>

        <button onClick={handleRun} disabled={isRunning} style={{
          ...btnStyle(isRunning ? '#374151' : '#059669'),
          cursor: isRunning ? 'not-allowed' : 'pointer', fontWeight: 'bold'
        }}>
          {isRunning ? '⏳' : '▶ Run'}
        </button>

        <button onClick={() => socket.emit('save-document', { roomId })} style={btnStyle(saved ? '#059669' : '#2563eb')}>
          {saved ? '✅' : '💾'}
        </button>

        <button onClick={() => setShowShare(true)} style={btnStyle('#7c3aed')}>🔗</button>

        <button onClick={() => setShowChat(c => !c)} style={{
          ...btnStyle(showChat ? '#0f172a' : '#334155'),
          border: '1px solid #334155'
        }}>💬</button>

        {/* Online users — show count on mobile, badges on desktop */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '5px', alignItems: 'center', flexShrink: 0 }}>
          {isMobile ? (
            <span style={{
              background: '#334155', color: '#94a3b8',
              fontSize: '12px', padding: '3px 8px', borderRadius: '10px'
            }}>👥 {users.length}</span>
          ) : (
            users.map(u => (
              <span key={u.id} style={{
                background: u.color, color: 'white', fontSize: '11px',
                padding: '2px 8px', borderRadius: '10px', whiteSpace: 'nowrap'
              }}>{u.username}</span>
            ))
          )}
        </div>
      </div>

      {/* ── MAIN AREA ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* Editor + Output */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          overflow: 'hidden', position: 'relative', minHeight: 0
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0,
            bottom: showOutput ? '220px' : '0px',
            transition: 'bottom 0.2s ease'
          }}>
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={handleChange}
              theme="vs-dark"
              onMount={(editor) => { editorRef.current = editor; }}
              options={{
                fontSize,
                minimap: { enabled: !isMobile },
                automaticLayout: true,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbers: isMobile ? 'off' : 'on',
              }}
            />
          </div>

          {showOutput && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              height: '220px', zIndex: 10
            }}>
              <OutputPanel
                output={output} error={outputError} status={outputStatus}
                time={outputTime} memory={outputMemory}
                isRunning={isRunning} onClose={() => setShowOutput(false)}
              />
            </div>
          )}
        </div>

        {/* Chat Panel — full screen overlay on mobile */}
        {showChat && (
          <div style={{
            ...(isMobile ? {
              position: 'fixed', inset: 0, zIndex: 100,
            } : {
              width: '280px', flexShrink: 0,
            })
          }}>
            {isMobile && (
              <button
                onClick={() => setShowChat(false)}
                style={{
                  position: 'absolute', top: '12px', right: '12px',
                  background: '#334155', color: 'white', border: 'none',
                  width: '32px', height: '32px', borderRadius: '50%',
                  cursor: 'pointer', fontSize: '16px', zIndex: 101
                }}
              >✕</button>
            )}
            <ChatPanel
              socket={socket} roomId={roomId}
              username={username} users={users}
            />
          </div>
        )}
      </div>

      {showShare && <ShareModal roomId={roomId} onClose={() => setShowShare(false)} />}
    </div>
  );
};