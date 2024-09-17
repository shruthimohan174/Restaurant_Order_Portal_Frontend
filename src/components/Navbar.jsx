import React from 'react';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import iconImg from '../assets/icon.png';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Navbar.css';

const Navbar = ({ toggleSidebar }) => {
  const { user } = useUser();
  const navigate = useNavigate();

  const handleUserIconClick = () => {
    if (user) {
      if (user.userRole === 'CUSTOMER') {
        navigate('/customer-dashboard');
      } else if (user.userRole === 'RESTAURANT_OWNER') {
        navigate('/restaurant-dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="header-container">
      <div className="logo-container">
        <img src={iconImg} alt="Icon" className="logo-icon" />
        <h1 className="logo">FoodHub</h1>
      </div>

        <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/contact-us">Contact Us</a>
            </nav>
      <div className="icons">
        {user ? (
          <div className="user-menu" onClick={handleUserIconClick}>
            <FaUser className="user-iconN" />
            <span>{user.firstName} {user.lastName}</span>
          </div>
        ) : (
          <button className="login-button" onClick={() => navigate('/login')}>Login</button>
        )}
        {(user === null || user.userRole === 'CUSTOMER') }
      </div>
    </header>
  );
};

export default Navbar;
