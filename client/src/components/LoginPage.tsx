import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface Props { onLogin: (token: string, username: string) => void; }

export const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!form.email.trim()) { setError('Email is required'); return; }
    if (!form.email.includes('@')) { setError('Please enter a valid email address'); return; }
    if (!form.password) { setError('Password is required'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (isRegister) {
      if (!form.username.trim()) { setError('Username is required'); return; }
      if (form.username.length < 3) { setError('Username must be at least 3 characters'); return; }
    }

    setLoading(true);
    try {
      const url = `${API_URL}/api/auth/${isRegister ? 'register' : 'login'}`;
      const { data } = await axios.post(url, form);
      onLogin(data.token, data.user.username);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: '#0f172a',
    border: '1px solid #334155',
    color: 'white',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: '#0f172a', padding: '16px',
    }}>
      <div style={{
        background: '#1e293b', padding: '32px 28px', borderRadius: '16px',
        width: '100%', maxWidth: '400px', border: '1px solid #334155',
        boxSizing: 'border-box',
      }}>
        <h1 style={{ color: 'white', margin: '0 0 4px', fontSize: '24px', textAlign: 'center' }}>
          ⚡ Collab Editor
        </h1>
        <p style={{ color: '#64748b', textAlign: 'center', margin: '0 0 28px', fontSize: '14px' }}>
          {isRegister ? 'Create your account' : 'Welcome back'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {isRegister && (
            <input
              placeholder="Username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              style={inputStyle}
            />
          )}
          <input
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={inputStyle}
          />

          {error && (
            <div style={{
              background: '#450a0a', border: '1px solid #dc2626',
              color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: loading ? '#374151' : '#2563eb',
              color: 'white', border: 'none', padding: '13px',
              borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold', fontSize: '15px', width: '100%',
            }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>

          <p
            style={{ color: '#60a5fa', fontSize: '14px', textAlign: 'center', cursor: 'pointer', margin: 0 }}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
          </p>
        </div>
      </div>
    </div>
  );
};