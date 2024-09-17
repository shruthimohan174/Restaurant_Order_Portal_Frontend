import React from 'react';
import RestaurantSidebar from '../components/RestaurantSidebar';
import '../styles/RestaurantDashboard.css';

function RestaurantDashboard({ sidebarOpen, toggleSidebar }) {
  return (
    <div className="dashboard-container">
      <RestaurantSidebar sidebarOpen={sidebarOpen} />
      <div className={`dashboard-content ${sidebarOpen ? 'shifted' : ''}`}>
        <h1 className="welcome-heading">Welcome to your restaurant dashboard!</h1>
      </div>
    </div>
  );
}

export default RestaurantDashboard;
