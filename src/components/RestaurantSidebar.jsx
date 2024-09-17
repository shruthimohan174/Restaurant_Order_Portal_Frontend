import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { FaUser, FaUtensils, FaListAlt, FaThLarge, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import '../styles/Sidebar.css';

function RestaurantSidebar({ sidebarOpen }) {
  const navigate = useNavigate();
  const { logout, user } = useUser(); 

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
      <div className="sidebar-item" onClick={() => navigate('/restaurant')}>
        <FaUtensils />
        <span>Restaurant</span>
      </div>
      <div className="sidebar-item" onClick={() => navigate('/food-item')}>
        <FaListAlt />
        <span>Menu</span>
      </div>
      <div className="sidebar-item" onClick={() => navigate('/food-category')}>
        <FaThLarge />
        <span>Food Category</span>
      </div>
      <div className="sidebar-item" onClick={() => navigate(`/orders/${user?.restaurantId}`)}>
        <FaClipboardList />
        <span>View Orders</span>
      </div>

      <div className="sidebar-item" onClick={handleLogout}>
        <FaSignOutAlt />
        <span>Logout</span>
      </div>
    </div>
  );
}

export default RestaurantSidebar;
