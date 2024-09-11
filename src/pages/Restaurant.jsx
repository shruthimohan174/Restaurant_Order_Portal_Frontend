import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/RestaurantSidebar'; 
import '../styles/Restaurant.css';

const Restaurant = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [newRestaurant, setNewRestaurant] = useState({
    restaurantName: '',
    address: '',
    contactNumber: '',
    openingHours: '',
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const { user } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(`http://localhost:8082/restaurant/user/${user.id}`);
      setRestaurants(response.data);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRestaurant(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const validateForm = () => {
    const { restaurantName, address, contactNumber, openingHours } = newRestaurant;
    const phoneRegex = /^[789]\d{9}$/;
    const nameRegex = /^[A-Za-z\s]+$/; // Regex to allow only alphabets and spaces
    let isValid = true;
    let newErrors = {};
  
    if (!restaurantName.trim()) {
      newErrors.restaurantName = 'Restaurant name cannot be blank.';
      isValid = false;
    } else if (!nameRegex.test(restaurantName)) {
      newErrors.restaurantName = 'Restaurant name can only contain alphabets.';
      isValid = false;
    }
  
    if (!address.trim()) {
      newErrors.address = 'Address cannot be blank.';
      isValid = false;
    }
  
    if (contactNumber.length !== 10) {
      newErrors.contactNumber = 'Phone number must be exactly 10 digits long.';
      isValid = false;
    } else if (!phoneRegex.test(contactNumber)) {
      newErrors.contactNumber = 'Phone number must start with 7, 8, or 9.';
      isValid = false;
    }
  
    if (!openingHours.trim()) {
      newErrors.openingHours = 'Opening hours cannot be blank.';
      isValid = false;
    }
  
    setErrors(newErrors);
    return isValid;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateForm()) {
      return;
    }
  
    const formData = new FormData();
    formData.append('userId', user.id);
    Object.keys(newRestaurant).forEach(key => {
      formData.append(key, newRestaurant[key]);
    });
    formData.append('image', image);
  
    try {
      await axios.post('http://localhost:8082/restaurant/add', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('New restaurant added successfully!');
      fetchRestaurants();
      setNewRestaurant({
        restaurantName: '',
        address: '',
        contactNumber: '',
        openingHours: '',
      });
      setImage(null);
      setErrors({});
      closeModal();
    } catch (error) {
      toast.error('Failed to add restaurant');
    }
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const openModal = () => {
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <div className={`app-containerR ${sidebarOpen ? 'shifted' : ''}`}>
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="restaurant-content">
        <h2>Your Restaurants
          <button onClick={openModal} className="add-restaurant-btn">
            Add Restaurant
          </button>
        </h2>
        <div className="restaurant-list">
          {restaurants.map(restaurant => (
            <div key={restaurant.id} className="restaurant-item">
              <h3>{restaurant.restaurantName}</h3>
              <p>{restaurant.address}</p>
              <p>{restaurant.contactNumber}</p>
              <p>{restaurant.openingHours}</p>
              <img
                src={`http://localhost:8082/restaurant/${restaurant.id}/image`}
                alt={restaurant.restaurantName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'path/to/placeholder/image.jpg';
                }}
              />
            </div>
          ))}
        </div>

        {/* Modal for adding restaurant */}
        <div className={`modal ${modalOpen ? 'show' : ''}`} style={{ display: modalOpen ? 'block' : 'none' }}>
          <div className="modal-contentR">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h2>Add New Restaurant</h2>
            <form onSubmit={handleSubmit} className="restaurant-form">
              <input
                type="text"
                name="restaurantName"
                value={newRestaurant.restaurantName}
                onChange={handleInputChange}
                placeholder="Restaurant Name"
                required
              />
              {errors.restaurantName && <p className="error-message">{errors.restaurantName}</p>}
              <input
                type="text"
                name="address"
                value={newRestaurant.address}
                onChange={handleInputChange}
                placeholder="Address"
                required
              />
              {errors.address && <p className="error-message">{errors.address}</p>}
              <input
                type="text"
                name="contactNumber"
                value={newRestaurant.contactNumber}
                onChange={handleInputChange}
                placeholder="Contact Number"
                required
              />
              {errors.contactNumber && <p className="error-message">{errors.contactNumber}</p>}
              <input
                type="text"
                name="openingHours"
                value={newRestaurant.openingHours}
                onChange={handleInputChange}
                placeholder="Opening Hours"
                required
              />
              {errors.openingHours && <p className="error-message">{errors.openingHours}</p>}
              <input
                type="file"
                onChange={handleImageChange}
                accept="image/*"
                required
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="submit">Save</button>
                <button type="button" onClick={closeModal}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Restaurant;
