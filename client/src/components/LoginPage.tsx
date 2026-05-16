import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

interface Props { onLogin: (token: string, username: string) => void; }

export const LoginPage: React.FC<Props> = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ username:'', email:'', password:'' });
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    try {
      const url = `${API_URL}/api/auth/${isRegister ? 'register' : 'login'}`;
      const { data } = await axios.post(url, form);
      onLogin(data.token, data.user.username);
    } catch (e: any) {
      setError(e.response?.data?.error || 'Something went wrong');
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center',
                  height:'100vh', background:'#111827' }}>
      <div style={{ background:'#1F2937', padding:'40px', borderRadius:'12px',
                    width:'360px', display:'flex', flexDirection:'column', gap:'12px' }}>
        <h2 style={{ color:'white', margin:0 }}>{isRegister ? 'Register' : 'Login'}</h2>
        {isRegister && (
          <input placeholder="Username" value={form.username}
            onChange={e => setForm({...form, username: e.target.value})}
            style={{ padding:'10px', borderRadius:'6px', border:'1px solid #374151',
                     background:'#111827', color:'white' }} />
        )}
        <input placeholder="Email" value={form.email}
          onChange={e => setForm({...form, email: e.target.value})}
          style={{ padding:'10px', borderRadius:'6px', border:'1px solid #374151',
                   background:'#111827', color:'white' }} />
        <input type="password" placeholder="Password" value={form.password}
          onChange={e => setForm({...form, password: e.target.value})}
          style={{ padding:'10px', borderRadius:'6px', border:'1px solid #374151',
                   background:'#111827', color:'white' }} />
        {error && <span style={{ color:'#F87171', fontSize:'13px' }}>{error}</span>}
        <button onClick={handleSubmit}
          style={{ background:'#2563EB', color:'white', border:'none',
                   padding:'12px', borderRadius:'6px', cursor:'pointer', fontWeight:'bold' }}>
          {isRegister ? 'Create Account' : 'Login'}
        </button>
        <span style={{ color:'#9CA3AF', fontSize:'13px', textAlign:'center', cursor:'pointer' }}
          onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </span>
      </div>
    </div>
  );
};