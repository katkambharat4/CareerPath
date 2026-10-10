import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import DashboardLayout from './components/layout/DashboardLayout';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import ProfilePage from './pages/student/ProfilePage';
import SkillsPage from './pages/student/SkillsPage';
import JobListingsPage from './pages/student/JobListingsPage';
import ApplicationTimelinePage from './pages/student/ApplicationTimelinePage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagementPage from './pages/admin/StudentManagementPage';
import CompanyManagementPage from './pages/admin/CompanyManagementPage';
import JobManagementPage from './pages/admin/JobManagementPage';
import ApplicationReviewPage from './pages/admin/ApplicationReviewPage';
import PlacementsPage from './pages/admin/PlacementsPage';

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ADMIN' ? '/admin/dashboard' : '/student/dashboard'} replace />;
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Protected Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="STUDENT">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="skills" element={<SkillsPage />} />
              <Route path="jobs" element={<JobListingsPage />} />
              <Route path="applications" element={<ApplicationTimelinePage />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRole="ADMIN">
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="students" element={<StudentManagementPage />} />
              <Route path="companies" element={<CompanyManagementPage />} />
              <Route path="jobs" element={<JobManagementPage />} />
              <Route path="applications" element={<ApplicationReviewPage />} />
              <Route path="placements" element={<PlacementsPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
