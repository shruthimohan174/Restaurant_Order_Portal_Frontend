import React, { useState } from 'react';
import { FaShoppingCart, FaUserCircle } from 'react-icons/fa';
import iconImg from '../assets/icon.png';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const renderDropdownItems = () => {
    if (!user) return null;

    return user.userRole === 'CUSTOMER' ? (
      <>
        <a href="/profile" className="dropdown-item">Profile</a>
        <a href="/address-book" className="dropdown-item">Address Book</a>
        <a onClick={handleLogout} className="dropdown-item">Logout</a>
      </>
    ) : user.userRole === 'RESTAURANT_OWNER' ? (
      <>
        <a href="/profile" className="dropdown-item">Profile</a>
        <a onClick={handleLogout} className="dropdown-item">Logout</a>
      </>
    ) : null;
  };

  return (
    <header className="header-container">
      <div className="logo-container">
        <img src={iconImg} alt="Icon" className="logo-icon" />
        <h1 className="logo">FoodHub</h1>
      </div>
      <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/">Menu</a>
        <a href="/">Contact Us</a>
      </nav>
      <div className="icons">
        {user ? (
          <div className="user-menu">
            <div className="user-icon" onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              <FaUserCircle />
              <span>{user.firstName} {user.lastName}</span>
            </div>
            {isDropdownOpen && (
              <div className="dropdown">
                {renderDropdownItems()}
              </div>
            )}
          </div>
        ) : (
          <button className="login-button" onClick={() => navigate('/login')}>Login</button>
        )}
        {(user === null || user.userRole === 'CUSTOMER') && <FaShoppingCart className="icon" />}
      </div>
    </header>
  );
};

export default Navbar;
