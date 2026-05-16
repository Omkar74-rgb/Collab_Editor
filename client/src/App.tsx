import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './components/LoginPage';
import { Dashboard } from './components/Dashboard';
import { RoomPage } from './components/RoomPage';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');

  const handleLogin = (tok: string, user: string) => {
    localStorage.setItem('token', tok);
    localStorage.setItem('username', user);
    setToken(tok); setUsername(user);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={token ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} />
        <Route path="/" element={token ? <Dashboard token={token} /> : <Navigate to="/login" />} />
        <Route path="/room/:roomId" element={token ? <RoomPage token={token} username={username} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;