import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import ContentPlanner from './pages/ContentPlanner';
import Kanban from './pages/Kanban';
import UserManagement from './pages/UserManagement';
import DashboardLayout from './layouts/DashboardLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import Settings from './pages/Settings';
import InputAkun from './pages/InputAkun';
import ContentReport from './pages/ContentReport';
import TeamManagement from './pages/TeamManagement';

// Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Superadmin Route Wrapper
const SuperadminRoute = ({ children }) => {
  const { isAuthenticated, isSuperadmin } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (!isSuperadmin()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="planner" element={<ContentPlanner />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="kanban" element={<Kanban />} />
            <Route path="settings" element={<Settings />} />
            <Route path="input-akun" element={<InputAkun />} />
            <Route path="content-report" element={<ContentReport />} />

            {/* Superadmin Only */}
            <Route path="users" element={
              <SuperadminRoute>
                <UserManagement />
              </SuperadminRoute>
            } />
            <Route path="teams" element={
              <SuperadminRoute>
                <TeamManagement />
              </SuperadminRoute>
            } />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
