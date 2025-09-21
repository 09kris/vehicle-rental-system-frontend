// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/admin/adminDeshboard'
import AgentDashboard from './components/agent/AgentDashboard';
import { AuthProvider, useAuth } from './context/AuthContext';

// Admin Protected Route
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated() && user?.user_type === 'admin' ? children : <Navigate to="/login" />;
};

// Agent Protected Route
const AgentRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  return isAuthenticated() && user?.user_type === 'agent' ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Dashboard */}
            <Route 
              path="/admin-dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />

            {/* Agent Dashboard */}
            <Route 
              path="/agent-dashboard" 
              element={
                <AgentRoute>
                  <AgentDashboard />
                </AgentRoute>
              } 
            />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
