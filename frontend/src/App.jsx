import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Dark Mode side effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Simple route guards
  const PrivateRoute = ({ children, allowedRole }) => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token || !userStr) {
      return <Navigate to="/login" replace />;
    }

    try {
      const user = JSON.parse(userStr);
      if (allowedRole && user.role !== allowedRole) {
        return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />;
      }
    } catch (e) {
      return <Navigate to="/login" replace />;
    }

    return children;
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage darkMode={darkMode} setDarkMode={setDarkMode} />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Private Routes */}
        <Route 
          path="/admin" 
          element={
            <PrivateRoute allowedRole="admin">
              <AdminDashboard darkMode={darkMode} setDarkMode={setDarkMode} />
            </PrivateRoute>
          } 
        />
        <Route 
          path="/student" 
          element={
            <PrivateRoute allowedRole="student">
              <StudentDashboard darkMode={darkMode} setDarkMode={setDarkMode} />
            </PrivateRoute>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
