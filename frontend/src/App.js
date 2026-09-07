import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CreateRequest from './pages/CreateRequest';
import AllRequests from './pages/AllRequests';
import RequestDetails from './pages/RequestDetails';
import FlaggedRequests from './pages/FlaggedRequests';
import Queries from './pages/Queries';
import History from './pages/History';
import Profile from './pages/Profile';
import UserManagement from './pages/UserManagement';

// Styles
import './styles/App.css';
import './styles/Auth.css';
import './styles/Sidebar.css';
import './styles/Header.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />

          {/* Private Routes */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function AppLayout() {
  return (
    <div className="app-container">
      <Sidebar />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-request" element={<CreateRequest />} />
          <Route path="/requests" element={<AllRequests />} />
          <Route path="/requests/:id" element={<RequestDetails />} />
          <Route path="/flagged-requests" element={<FlaggedRequests />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/queries" element={<Queries />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
