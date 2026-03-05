import { useState } from 'react';
import { authApi } from '../services/api';

export function useAuth() {
  const [role,        setRole]        = useState(null);
  const [loginData,   setLoginData]   = useState({ username: '', password: '', roll: '' });
  const [loginError,  setLoginError]  = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(false);

  const handleLogin = async () => {
    setLoginError('');

    // ── Student: accept any roll number, no validation needed ──
    if (role === 'student') {
      const roll = loginData.roll.trim().toUpperCase();
      if (!roll) { setLoginError('Enter your roll number.'); return; }
      // No DB or list lookup — just log them in directly.
      // The seat view will show "not allocated" if they aren't in the system.
      setCurrentUser({ role: 'student', rollNo: roll, name: roll });
      return;
    }

    // ── Admin / Staff / Developer: backend JWT ──────────────────
    if (!loginData.username || !loginData.password) {
      setLoginError('Username and password are required.');
      return;
    }

    setLoading(true);
    try {
      const { token, user } = await authApi.login(role, loginData.username, loginData.password);
      sessionStorage.setItem('exam_token', token);
      setCurrentUser({ ...user, role });
      setLoginError('');
    } catch (err) {
      setLoginError(err.message || 'Login failed. Check credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('exam_token');
    setCurrentUser(null);
    setRole(null);
    setLoginData({ username: '', password: '', roll: '' });
    setLoginError('');
  };

  return {
    role, setRole,
    loginData, setLoginData,
    loginError,
    loading,
    currentUser,
    handleLogin,
    handleLogout,
  };
}