import React, { useState, useEffect } from 'react';
import '../styles/Home.css';
import homeImg from '../assets/homeImg.jpeg';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation

const HomeSection = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const restaurantsPerPage = 3;
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:8082/restaurant');
        setRestaurants(response.data);
      } catch (error) {
        console.error('Error fetching restaurants:', error);
      }
    };

    fetchRestaurants();
  }, []);

  const indexOfLastRestaurant = currentPage * restaurantsPerPage;
  const indexOfFirstRestaurant = indexOfLastRestaurant - restaurantsPerPage;
  const currentRestaurants = restaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleRestaurantClick = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`); // Navigate to the restaurant page
  };

  const renderRestaurantCards = () => {
    return currentRestaurants.map((restaurant) => (
      <div 
        className="restaurant-card" 
        key={restaurant.id} 
        onClick={() => handleRestaurantClick(restaurant.id)} // Add click handler
        style={{ cursor: 'pointer' }} // Change cursor to pointer on hover
      >
        <img
          src={`http://localhost:8082/restaurant/${restaurant.id}/image`}
          alt={restaurant.restaurantName}
          className="restaurant-image"
        />
        <div className="restaurant-info">
          <h3 className="restaurant-name">{restaurant.restaurantName}</h3>
          <p className="restaurant-address">{restaurant.address}</p>
          <p className="restaurant-contact">{restaurant.contactNumber}</p>
          <p className="restaurant-hours">{restaurant.openingHours}</p>
        </div>
      </div>
    ));
  };

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(restaurants.length / restaurantsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div>
      <section className="hero-container">
        <div className="hero-text">
          <p className="subtitle">Are you hungry?</p>
          <h2 className="title">Don't wait!</h2>
          <p className="description">Order your favorite food from the best restaurants near you</p>
          <button>Order Now</button>
        </div>
        <img className="hero-image" src={homeImg} alt="New Collection" />
      </section>

      <section className="restaurant-section">
        <h2 className="section-title">Orders From Our Handpicked Favorites</h2>
        <div className="restaurant-list">
          {renderRestaurantCards()}
        </div>
        {/* Pagination can be enabled if required */}
      </section>
    </div>
  );
};

export default HomeSection;
