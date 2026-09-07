import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hasFlaggedRequestsAccess } from '../utils/helpers';
import { queryAPI, requestAPI } from '../services/api';
import '../styles/Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadQueryCount, setUnreadQueryCount] = useState(0);
  const [flaggedRequestCount, setFlaggedRequestCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadQueryCount();
      // Poll every 30 seconds for new queries
      const interval = setInterval(fetchUnreadQueryCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    if (user && hasFlaggedRequestsAccess(user?.role)) {
      fetchFlaggedRequestCount();
      // Poll every 30 seconds for flagged requests
      const interval = setInterval(fetchFlaggedRequestCount, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadQueryCount = async () => {
    try {
      const response = await queryAPI.getAll({ type: 'received', status: 'pending' });
      setUnreadQueryCount(response.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch unread query count:', err);
    }
  };

  const fetchFlaggedRequestCount = async () => {
    try {
      const response = await requestAPI.getFlagged();
      setFlaggedRequestCount(response.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch flagged request count:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMobile = () => {
    if (window.innerWidth <= 768) {
      setMobileOpen(false);
    }
  };

  // Employee menu items
  const employeeMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '' },
    { path: '/requests', label: 'All Requests', icon: '' },
    { path: '/create-request', label: 'Create Request', icon: '' },
    { path: '/queries', label: 'Queries', icon: '' },
    { path: '/profile', label: 'My Profile', icon: '' }
  ];

  // Other roles menu items
  const otherRolesMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '' },
    { path: '/requests', label: 'All Requests', icon: '' },
    ...(hasFlaggedRequestsAccess(user?.role) 
      ? [{ path: '/flagged-requests', label: 'Flagged Requests', icon: '' }] 
      : []),
    ...(user?.role === 'CEO' 
      ? [{ path: '/user-management', label: 'User Management', icon: '' }] 
      : []),
    { path: '/queries', label: 'Queries', icon: '' },
    { path: '/profile', label: 'My Profile', icon: '' }
  ];

  const menuItems = user?.role === 'Employee' ? employeeMenu : otherRolesMenu;

  return (
    <>
      {/* Mobile Menu Button */}
      {window.innerWidth <= 768 && (
        <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
          ☰
        </button>
      )}

      {/* Mobile Overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <div className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">NexaFlow</div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={closeMobile}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              {item.label}
              {item.path === '/queries' && unreadQueryCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: '#e53e3e',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}
                >
                  {unreadQueryCount}
                </span>
              )}
              {item.path === '/flagged-requests' && flaggedRequestCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: '#e53e3e',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    minWidth: '20px',
                    textAlign: 'center'
                  }}
                >
                  {flaggedRequestCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
