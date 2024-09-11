import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from '../components/RestaurantSidebar';
import '../styles/FoodItem.css';

const FoodItem = () => {
  const { user } = useUser();
  const [foodItems, setFoodItems] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState('');
  const [newFoodItem, setNewFoodItem] = useState({
    itemName: '',
    price: '',
    description: '',
    restaurantId: '',
    categoryId: '',
    isVeg: 'No',
    image: null
  });
  const [editFoodItem, setEditFoodItem] = useState(null);
  const [errors, setErrors] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [existingItemNames, setExistingItemNames] = useState([]);

  useEffect(() => {
    if (user && user.id) {
      fetchRestaurants(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchFoodItems(selectedRestaurant);
      fetchCategories(selectedRestaurant);
      fetchExistingItemNames(selectedRestaurant);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8082/restaurant/user/${userId}`);
      setRestaurants(response.data);
    } catch (error) {
      toast.error('Failed to fetch restaurants');
    }
  };

  const fetchCategories = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:8082/category/restaurant/${restaurantId}`);
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchFoodItems = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:8082/foodItem/restaurant/${restaurantId}`);
      setFoodItems(response.data);
    } catch (error) {
      toast.error('Failed to fetch food items');
    }
  };

  const fetchExistingItemNames = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:8082/foodItem/restaurant/${restaurantId}`);
      const itemNames = response.data.map(item => item.itemName.toLowerCase());
      setExistingItemNames(itemNames);
    } catch (error) {
      toast.error('Failed to fetch existing item names');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFoodItem(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFoodItem(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    setNewFoodItem(prev => ({ ...prev, image: e.target.files[0] }));
  };

  const validateForm = () => {
    let isValid = true;
    let newErrors = {};

    // Validate itemName
    if (!newFoodItem.itemName.trim()) {
      newErrors.itemName = 'Item name is required.';
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(newFoodItem.itemName)) {
      newErrors.itemName = 'Item name must contain only alphabets.';
      isValid = false;
    } else if (existingItemNames.includes(newFoodItem.itemName.toLowerCase())) {
      newErrors.itemName = 'An item with this name already exists in this restaurant.';
      isValid = false;
    }
    // Validate price
    if (!newFoodItem.price.trim() || isNaN(newFoodItem.price) || Number(newFoodItem.price) <= 0) {
      newErrors.price = 'Valid price is required. It should contain only numbers.';
      isValid = false;
    }

    // Validate description
    if (!newFoodItem.description.trim()) {
      newErrors.description = 'Description is required.';
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(newFoodItem.description)) {
      newErrors.description = 'Description must contain only alphabets.';
      isValid = false;
    }

    // Validate isVeg
    if (newFoodItem.isVeg !== 'Yes' && newFoodItem.isVeg !== 'No') {
      newErrors.isVeg = 'Please select if the item is vegetarian or not.';
      isValid = false;
    }

    // Validate image
    if (newFoodItem.image && !newFoodItem.image.type.startsWith('image/')) {
      newErrors.image = 'File must be an image.';
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
    formData.append('itemName', newFoodItem.itemName);
    formData.append('price', newFoodItem.price);
    formData.append('description', newFoodItem.description);
    formData.append('restaurantId', newFoodItem.restaurantId);
    formData.append('categoryId', newFoodItem.categoryId);
    formData.append('isVeg', newFoodItem.isVeg);
    if (newFoodItem.image) {
      formData.append('image', newFoodItem.image);
    }

    try {
      await axios.post('http://localhost:8082/foodItem/food/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast.success('New food item added successfully!');
      fetchFoodItems(selectedRestaurant);
      setNewFoodItem({
        itemName: '',
        price: '',
        description: '',
        restaurantId: '',
        categoryId: '',
        isVeg: 'No',
        image: null
      });
      setErrors({});
      closeModal();
    } catch (error) {
      toast.error('Food item already exists');
    }
  };

  const handleEdit = (foodItem) => {
    setEditFoodItem({
      id: foodItem.id,
      itemName: foodItem.itemName,
      price: foodItem.price,
      description: foodItem.description,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (existingItemNames.filter(name => name !== editFoodItem.itemName.toLowerCase()).includes(editFoodItem.itemName.toLowerCase())) {
      setErrors(prev => ({...prev, itemName: 'An item with this name already exists in this restaurant.'}));
      return;
    }
    try {
      const response = await axios.put(`http://localhost:8082/foodItem/update/${editFoodItem.id}`, {
        itemName: editFoodItem.itemName,
        description: editFoodItem.description,
        price: editFoodItem.price
      });

      if (response.status === 200) {
        toast.success('Food item updated successfully!');
        fetchFoodItems(selectedRestaurant);
        setEditModalOpen(false);
        setEditFoodItem(null);
      } else {
        toast.error('Failed to update food item');
      }
    } catch (error) {
      toast.error('Food item already exists for this restaurant');
    }
  };

  const handleRestaurantChange = (e) => {
    const { value } = e.target;
    setSelectedRestaurant(value);
    setNewFoodItem(prev => ({ ...prev, restaurantId: value, categoryId: '' }));
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
    <div className={`app-containerFI ${sidebarOpen ? 'shifted' : ''}`}>
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="food-item-content">
        <h2>Your Food Items
          <button onClick={openModal} className="add-food-item-btn">
            Add Food Item
          </button>
        </h2>

        {/* Dropdown for selecting restaurant */}
        <div className="restaurant-selector">
          <h3>Select Restaurant</h3>
          <select
            value={selectedRestaurant}
            onChange={handleRestaurantChange}
          >
            <option value="">Select Restaurant</option>
            {restaurants.map(restaurant => (
              <option key={restaurant.id} value={restaurant.id}>
                {restaurant.restaurantName}
              </option>
            ))}
          </select>
        </div>

        {/* Display food items */}
        <div className="food-item-list">
          {foodItems.map(foodItem => (
            <div key={foodItem.id} className="food-item-card">
              <img
                src={`http://localhost:8082/foodItem/${foodItem.id}/image`}
                alt={foodItem.itemName}
                className="food-item-card-img"
                onError={(e) => {
                  console.error(`Failed to load image for ${foodItem.itemName}`);
                  e.target.src = '../assets/homeImg.jpeg';
                }}
              />
              <div className="food-item-card-body">
                <h3>{foodItem.itemName}</h3>
                <p className="price">Rs. {foodItem.price}</p>
                <p>{foodItem.description}</p>
                <p>Vegetarian: {foodItem.isVeg ? 'Yes' : 'No'}</p>
                <button onClick={() => handleEdit(foodItem)} className="edit-btn">Edit</button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal for adding food items */}
        <div className={`modalFI ${modalOpen ? 'show' : ''}`} style={{ display: modalOpen ? 'block' : 'none' }}>
          <div className="modal-contentFI">
            <span className="close-btn" onClick={closeModal}>&times;</span>
            <h2>Add New Food Item</h2>
            <form onSubmit={handleSubmit} className="food-item-form">
              <input
                type="text"
                name="itemName"
                value={newFoodItem.itemName}
                onChange={handleInputChange}
                placeholder="Item Name"
                required
              />
              {errors.itemName && <span className="error-text">{errors.itemName}</span>}

              <input
                type="number"
                name="price"
                value={newFoodItem.price}
                onChange={handleInputChange}
                placeholder="Price"
                required
              />
              {errors.price && <span className="error-text">{errors.price}</span>}

              <textarea
                name="description"
                value={newFoodItem.description}
                onChange={handleInputChange}
                placeholder="Description"
                required
              />
              {errors.description && <span className="error-text">{errors.description}</span>}

              <select
                name="restaurantId"
                value={newFoodItem.restaurantId}
                onChange={handleRestaurantChange}
                required
              >
                <option value="">Select Restaurant</option>
                {restaurants.map(restaurant => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.restaurantName}
                  </option>
                ))}
              </select>

              {newFoodItem.restaurantId && (
                <select
                  name="categoryId"
                  value={newFoodItem.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.categoryName}
                    </option>
                  ))}
                </select>
              )}

              <select
                name="isVeg"
                value={newFoodItem.isVeg}
                onChange={handleInputChange}
                required
              >
                <option value="No">Non-Vegetarian</option>
                <option value="Yes">Vegetarian</option>
              </select>
              {errors.isVeg && <span className="error-text">{errors.isVeg}</span>}

              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {errors.image && <span className="error-text">{errors.image}</span>}

              <button type="submit">Add Food Item</button>
            </form>
          </div>
        </div>

        {/* Modal for editing food items */}
        {editFoodItem && (
          <div className={`modalFI ${editModalOpen ? 'show' : ''}`} style={{ display: editModalOpen ? 'block' : 'none' }}>
            <div className="modal-contentFI">
              <span className="close-btn" onClick={() => setEditModalOpen(false)}>&times;</span>
              <h2>Edit Food Item</h2>
              <form onSubmit={handleEditSubmit} className="food-item-form">
                <input
                  type="text"
                  name="itemName"
                  value={editFoodItem.itemName}
                  onChange={handleEditInputChange}
                  placeholder="Item Name"
                  required
                />

                <input
                  type="number"
                  name="price"
                  value={editFoodItem.price}
                  onChange={handleEditInputChange}
                  placeholder="Price"
                  required
                />

                <textarea
                  name="description"
                  value={editFoodItem.description}
                  onChange={handleEditInputChange}
                  placeholder="Description"
                  required
                />

                <button type="submit">Update Food Item</button>
              </form>
            </div>
          </div>
        )}

        <ToastContainer />
      </div>
    </div>
  );
};

export default FoodItem;
