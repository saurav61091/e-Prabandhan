import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Layout Components
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Components
import Login from '../components/auth/Login';
import Register from '../components/auth/Register';
import ForgotPassword from '../components/auth/ForgotPassword';

// Dashboard Components
import MainDashboard from '../components/dashboard/MainDashboard';
import DepartmentDashboard from '../components/dashboard/DepartmentDashboard';
import UserDashboard from '../components/dashboard/UserDashboard';

// Document Components
import DocumentList from '../components/documents/DocumentList';
import DocumentView from '../components/documents/DocumentView';
import DocumentUpload from '../components/documents/DocumentUpload';

// Notesheet Components
import NotesheetList from '../components/notesheet/NotesheetList';
import NotesheetContainer from '../components/notesheet/NotesheetContainer';
import NotesheetCreate from '../components/notesheet/NotesheetCreate';

// Search Components
import GlobalSearch from '../components/search/GlobalSearch';
import DocumentSearch from '../components/search/DocumentSearch';
import UserSearch from '../components/search/UserSearch';

// Report Components
import UserReport from '../components/reports/UserReport';
import DepartmentReport from '../components/reports/DepartmentReport';
import DocumentReport from '../components/reports/DocumentReport';

// Settings Components
import Settings from '../components/settings/Settings';
import Profile from '../components/settings/Profile';

const AppRoutes = () => {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // Protected Route Component
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" />;
    }
    return children;
  };

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
      </Route>

      {/* Main App Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Routes */}
        <Route index element={<MainDashboard />} />
        <Route path="dashboard">
          <Route path="department" element={<DepartmentDashboard />} />
          <Route path="user" element={<UserDashboard />} />
        </Route>

        {/* Document Routes */}
        <Route path="documents">
          <Route index element={<DocumentList />} />
          <Route path="view/:id" element={<DocumentView />} />
          <Route path="upload" element={<DocumentUpload />} />
          <Route path="search" element={<DocumentSearch />} />
        </Route>

        {/* Notesheet Routes */}
        <Route path="notesheets">
          <Route index element={<NotesheetList />} />
          <Route path="create" element={<NotesheetCreate />} />
          <Route path=":id" element={<NotesheetContainer />} />
        </Route>

        {/* Search Routes */}
        <Route path="search">
          <Route index element={<GlobalSearch />} />
          <Route path="documents" element={<DocumentSearch />} />
          <Route path="users" element={<UserSearch />} />
        </Route>

        {/* Report Routes */}
        <Route path="reports">
          <Route path="users" element={<UserReport />} />
          <Route path="departments" element={<DepartmentReport />} />
          <Route path="documents" element={<DocumentReport />} />
        </Route>

        {/* Settings Routes */}
        <Route path="settings">
          <Route index element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      {/* 404 Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
