import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const { user } = useAuth();

  return (
    <div className="header">
      <div className="header-user-info">
        <div className="user-name">{user?.name}</div>
        <div className="user-role">{user?.role}</div>
      </div>
    </div>
  );
};

export default Header;
