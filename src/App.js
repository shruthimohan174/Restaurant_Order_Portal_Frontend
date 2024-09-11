import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import Navbar from './components/Navbar';
import HomeSection from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import Profile from './pages/Profile';
import AddressBook from './pages/AddressBook';
import Restaurant from './pages/Restaurant'; 
import FoodCategory from './pages/FoodCategory';
import FoodItem from './pages/FoodItem';
import RestaurantPage from './pages/RestaurantPage';
import CartPage from './pages/CartPage'; // Import CartPage
import OrderHistoryPage from './pages/OrderHistoryPage'; // Add this line
import ViewOrdersPage from './pages/ViewOrdersPage';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <UserProvider>
      <Router>
        <Navbar toggleSidebar={toggleSidebar} />
        <div className="app-container">
          <Routes>
            <Route path="/" element={<HomeSection />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/customer-dashboard" element={
              <CustomerDashboard sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            } />
            <Route path="/restaurant-dashboard" element={
              <RestaurantDashboard sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            } />
            <Route path="/profile" element={
              <Profile sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            } />
            <Route path="/address-book" element={
              <AddressBook sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            } />
            <Route path="/restaurant" element={<Restaurant />} /> {/* Route for Restaurant */}
            <Route path="/food-category" element={<FoodCategory />} />
            <Route path="/food-item" element={<FoodItem />} />
            <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
            <Route path="/cart/:restaurantId" element={<CartPage />} />
            <Route path="/order-history" element={<OrderHistoryPage />} />
            <Route path="/orders/:restaurantId" element={<ViewOrdersPage />} />
            </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
