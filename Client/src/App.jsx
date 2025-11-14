// src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, AuthProvider } from './useAuth'; 
import './App.css'
import Home from './Home';
import About from './About';
import Dashboard from './Dashboard';
import LoginRegister from './LoginRegister';

// Protected Route Component
const ProtectedRoute = ( { element }) => {
  const { token } = useAuth();
  // Redirects to the login page if no token is found
  return token ? element : <Navigate to="/login" replace />; 
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ✅ Home is now the default page */}
          <Route path="/" element={<Home />} /> 
          
          {/* ✅ Login/Register page is now at /login */}
          <Route path="/login" element={<LoginRegister />} /> 
          
          {/* Other Public Route */}
          <Route path="/about" element={<About />} />
          
          {/* Protected Route */}
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;