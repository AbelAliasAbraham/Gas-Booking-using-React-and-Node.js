// src/Header.jsx

import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from './useAuth'; 

const Header = () => {
  const { token, logout, validateToken } = useAuth();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Memoized function to check and validate the token
  const checkAuth = useCallback(async () => {
    if (token) {
      const user = await validateToken();
      setIsAuthenticated(!!user);
    } else {
      setIsAuthenticated(false);
    }
  }, [token, validateToken]);

  // Check and validate the token on route change
  useEffect(() => {
    checkAuth();
  }, [checkAuth, location.pathname]);

  const getClassName = (path) => 
    location.pathname === path ? 'active' : '';

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <header>
      <nav>
        <ul>
          {/* Home link points to the root path '/' */}
          <li><Link to="/" className={getClassName('/')}>Home</Link></li>
          <li><Link to="/about" className={getClassName('/about')}>About</Link></li>
          
          <li id="auth-link">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={getClassName('/dashboard')}>Dashboard</Link>
                <a href="#" id="logout" onClick={handleLogout} className="logout-item">Logout</a>
              </>
            ) : (
              // ✅ FIX: Login link now correctly points to /login
              <Link to="/login" className={getClassName('/login')}>Login</Link>
            )}
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;