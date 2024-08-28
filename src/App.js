// App.js
import React from 'react';
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

function App() {
  return (
    <UserProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomeSection />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/customer-dashboard" element={<CustomerDashboard />} />
          <Route path="/restaurant-dashboard" element={<RestaurantDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/address-book" element={<AddressBook />} /> 
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;