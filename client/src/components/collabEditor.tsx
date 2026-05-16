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
    const [showChat, setShowChat] = useState(true);
    const [showShare, setShowShare] = useState(false);
    const [showOutput, setShowOutput] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [output, setOutput] = useState('');
    const [outputError, setOutputError] = useState('');
    const [outputStatus, setOutputStatus] = useState('');
    const [outputTime, setOutputTime] = useState('');
    const [outputMemory, setOutputMemory] = useState(0);
    const isRemote = useRef(false);
    const editorRef = useRef<any>(null);

    // ── Socket Events ──────────────────────────────
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

    // ── Ctrl+S to save ─────────────────────────────
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

    // ── Code change ────────────────────────────────
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

    // ── Run code ───────────────────────────────────
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

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#0f172a' }}>

            {/* ── TOOLBAR ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap',
                padding: '8px 16px', background: '#1e293b', borderBottom: '1px solid #334155',
                minHeight: '52px'
            }}>
                {/* Back button */}
                <button onClick={() => navigate('/')} style={{
                    background: '#334155', color: '#94a3b8', border: 'none',
                    padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>← Home</button>

                <span style={{ color: 'white', fontWeight: 'bold', fontSize: '14px' }}>⚡ Collab Editor</span>

                {unsaved && <span style={{ color: '#f59e0b', fontSize: '12px' }}>● unsaved</span>}

                {/* Language selector */}
                <select value={language} onChange={e => handleLanguageChange(e.target.value)} style={{
                    background: '#334155', color: 'white', border: 'none',
                    padding: '6px 10px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer'
                }}>
                    {['javascript', 'typescript', 'python', 'java', 'cpp', 'go'].map(l =>
                        <option key={l} value={l}>{l}</option>
                    )}
                </select>

                {/* Font size */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <button onClick={() => setFontSize(f => Math.max(10, f - 1))} style={{
                        background: '#334155', color: 'white', border: 'none',
                        width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer'
                    }}>−</button>
                    <span style={{ color: '#94a3b8', fontSize: '12px', minWidth: '28px', textAlign: 'center' }}>{fontSize}px</span>
                    <button onClick={() => setFontSize(f => Math.min(24, f + 1))} style={{
                        background: '#334155', color: 'white', border: 'none',
                        width: '26px', height: '26px', borderRadius: '4px', cursor: 'pointer'
                    }}>+</button>
                </div>

                {/* Run button */}
                <button onClick={handleRun} disabled={isRunning} style={{
                    background: isRunning ? '#374151' : '#059669', color: 'white', border: 'none',
                    padding: '6px 16px', borderRadius: '6px', cursor: isRunning ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold', fontSize: '13px'
                }}>
                    {isRunning ? '⏳ Running...' : '▶ Run'}
                </button>

                {/* Save button */}
                <button onClick={() => socket.emit('save-document', { roomId })} style={{
                    background: saved ? '#059669' : '#2563eb', color: 'white', border: 'none',
                    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>
                    {saved ? '✅ Saved' : '💾 Save'}
                </button>

                {/* Share button */}
                <button onClick={() => setShowShare(true)} style={{
                    background: '#7c3aed', color: 'white', border: 'none',
                    padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px'
                }}>🔗 Share</button>

                {/* Chat toggle */}
                <button onClick={() => setShowChat(c => !c)} style={{
                    background: showChat ? '#0f172a' : '#334155', color: 'white',
                    border: '1px solid #334155', padding: '6px 14px', borderRadius: '6px',
                    cursor: 'pointer', fontSize: '13px'
                }}>
                    {showChat ? '✕ Chat' : '💬 Chat'}
                </button>

                {/* Online users */}
                <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '12px' }}>{users.length} online</span>
                    {users.map(u => (
                        <span key={u.id} style={{
                            background: u.color, color: 'white', fontSize: '11px',
                            padding: '2px 10px', borderRadius: '10px'
                        }}>{u.username}</span>
                    ))}
                </div>
            </div>

            {/* ── MAIN AREA ── */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                
                {/* Editor + Output */}
                <div style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    minHeight: 0
                }}>
                    {/* Editor wrapper */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
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
                                minimap: { enabled: false },
                                automaticLayout: true,
                                wordWrap: 'on',
                                scrollBeyondLastLine: false,
                                padding: { top: 12 }
                            }}
                        />
                    </div>

                    {/* Output panel - anchored to bottom */}
                    {showOutput && (
                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '220px',
                            zIndex: 10
                        }}>
                            <OutputPanel
                                output={output}
                                error={outputError}
                                status={outputStatus}
                                time={outputTime}
                                memory={outputMemory}
                                isRunning={isRunning}
                                onClose={() => setShowOutput(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Chat Panel */}
                {showChat && (
                    <ChatPanel
                        socket={socket}
                        roomId={roomId}
                        username={username}
                        users={users}
                    />
                )}
            </div>

            {/* Share Modal */}
            {showShare && <ShareModal roomId={roomId} onClose={() => setShowShare(false)} />}
        </div>
    );
};