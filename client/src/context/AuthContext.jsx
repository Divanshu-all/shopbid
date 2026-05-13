import { createContext, useContext, useState } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('shopbid_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('shopbid_token', data.token);
      localStorage.setItem('shopbid_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  // ── Google OAuth login ──────────────────────────────────────────────
  // Called from Login.jsx after fetching userInfo from Google's /userinfo endpoint.
  // Sends { name, email, picture, sub } to the backend, which finds-or-creates
  // the user and returns the same { token, user } shape as normal login.
  const googleLogin = async (googleUser) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/google', {
        name:    googleUser.name,
        email:   googleUser.email,
        picture: googleUser.picture,
        googleId: googleUser.sub,        // unique Google user ID
      });
      localStorage.setItem('shopbid_token', data.token);
      localStorage.setItem('shopbid_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Google login failed' };
    } finally {
      setLoading(false);
    }
  };
  // ───────────────────────────────────────────────────────────────────

  const register = async (name, email, password, role) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', { name, email, password, role });
      localStorage.setItem('shopbid_token', data.token);
      localStorage.setItem('shopbid_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true, user: data.user };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('shopbid_token');
    localStorage.removeItem('shopbid_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, googleLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
