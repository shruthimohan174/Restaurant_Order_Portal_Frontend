import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaUser, FaAddressBook, FaSignOutAlt, FaBars } from 'react-icons/fa';
import '../styles/Sidebar.css';

function Sidebar({ sidebarOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const { logout } = useUser();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
      <div className="sidebar-item" onClick={() => navigate('/profile')}>
        <FaUser />
        <span>Profile</span>
      </div>
      <div className="sidebar-item" onClick={() => navigate('/address-book')}>
        <FaAddressBook />
        <span>Address Book</span>
      </div>
      <div className="sidebar-item" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </div>
    </div>
  );
}

export default Sidebar;