// src/useAuth.jsx

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  // Function to validate token with the backend
  const validateToken = useCallback(async () => {
    if (!token) {
      return null;
    }
    try {
      const res = await fetch("http://localhost:5000/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.user) {
        return data.user;
      } else {
        // Use the local logout function if token is invalid
        return null;
      }
    } catch (err) {
      console.error("Error validating token:", err);
      // Use the local logout function if fetch fails
      return null;
    }
  }, [token]); 

  const login = (newToken) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    navigate('/dashboard'); 
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    // ✅ FIX: Logout redirects to the correct login page
    navigate('/login', { replace: true }); 
  };

  // The rest of the useEffect logic to clear token if invalid...
  useEffect(() => {
    if (token) {
      validateToken().then(user => {
        if (!user) {
          // If validation fails, clear token and redirect to login
          localStorage.removeItem('token');
          setToken(null);
          navigate('/login', { replace: true });
        }
      });
    }
  }, [token, navigate, validateToken]);

  const value = { token, login, logout, validateToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};