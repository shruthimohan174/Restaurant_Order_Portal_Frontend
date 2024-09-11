import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaEdit } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/FoodCategory.css';
import Sidebar from '../components/RestaurantSidebar';
import { useUser } from '../context/UserContext';

function FoodCategory() {
  const { restaurantId } = useUser();
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [newCategory, setNewCategory] = useState({ restaurantId: '', categoryName: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (restaurantId) {
      setNewCategory(prev => ({ ...prev, restaurantId }));
      fetchCategories(restaurantId);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchCategories(restaurantId);
    fetchRestaurants();
  }, [restaurantId]);

  const fetchCategories = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:8082/category`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories', error);
      toast.error('Error fetching categories');
    }
  };

  const fetchRestaurants = async () => {
    const userId = JSON.parse(localStorage.getItem('user')).id;
    try {
      const response = await axios.get(`http://localhost:8082/restaurant/user/${userId}`);
      setRestaurants(response.data);
    } catch (error) {
      console.error('Error fetching restaurants', error);
      toast.error('Error fetching restaurants');
    }
  };

  const handleInputChange = (e) => {
    setNewCategory({ ...newCategory, [e.target.name]: e.target.value });
  };

  const handleDropdownChange = (e) => {
    setNewCategory({ ...newCategory, restaurantId: e.target.value });
  };

  const validateCategory = (category) => {
    if (!category.restaurantId) {
      return "Restaurant ID is required";
    }
    if (!category.categoryName.trim()) {
      return "Category name is required";
    }
    if (!/^[A-Za-z\s]+$/.test(category.categoryName)) {
      return "Category name must contain only alphabets";
    }
    return '';
  };

  const handleAddCategory = async () => {
    const errorMessage = validateCategory(newCategory);

    if (errorMessage) {
      setValidationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setValidationError('');
    try {
      await axios.post('http://localhost:8082/category/add', newCategory);
      fetchCategories(newCategory.restaurantId);
      setShowAddForm(false);
      toast.success('Category added successfully!');
    } catch (error) {
      console.error('Error adding category', error);
      toast.error('Category already exists for this restaurant');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategory({ restaurantId: category.restaurantId, categoryName: category.categoryName });
    setShowEditForm(true);
    setShowAddForm(false);
  };

  const handleUpdateCategory = async () => {
    const errorMessage = validateCategory(newCategory);

    if (errorMessage) {
      setValidationError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setValidationError('');
    try {
      await axios.put(`http://localhost:8082/category/update/${editingCategory.id}`, newCategory);
      fetchCategories(newCategory.restaurantId);
      setShowEditForm(false);
      toast.success('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category', error);
      toast.error('Category already exists for this restaurant');
    }
  };

  return (
    <div className="food-category-container">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="food-category-content">
        <h2>Food Categories</h2>
    
        <button className="add-category-button" onClick={() => setShowAddForm(!showAddForm)}>
          <FaPlus /> Add Category
        </button>
    
        {showAddForm && (
          <div className="form-container">
            <div className="add-category-form">
              <h3>Add New Category</h3>
              <select
                name="restaurantId"
                value={newCategory.restaurantId}
                onChange={handleDropdownChange}
              >
                <option value="">Select Restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.restaurantName} {/* Updated field name */}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="categoryName"
                placeholder="Category Name"
                value={newCategory.categoryName}
                onChange={handleInputChange}
              />
              {validationError && <p className="validation-error">{validationError}</p>}
              <button className="submit-category-button" onClick={handleAddCategory}>
                Add Category
              </button>
              <button className="cancel-button" onClick={() => setShowAddForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
    
        {showEditForm && (
          <div className="form-container">
            <div className="edit-category-form">
              <h3>Edit Category</h3>
              <select
                name="restaurantId"
                value={newCategory.restaurantId}
                onChange={handleDropdownChange}
              >
                <option value="">Select Restaurant</option>
                {restaurants.map((restaurant) => (
                  <option key={restaurant.id} value={restaurant.id}>
                    {restaurant.restaurantName} {/* Updated field name */}
                  </option>
                ))}
              </select>
              <input
                type="text"
                name="categoryName"
                placeholder="Category Name"
                value={newCategory.categoryName}
                onChange={handleInputChange}
              />
              {validationError && <p className="validation-error">{validationError}</p>}
              <button className="submit-category-button" onClick={handleUpdateCategory}>
                Update Category
              </button>
              <button className="cancel-button" onClick={() => setShowEditForm(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
    
        <table className="category-table">
          <thead>
            <tr>
              <th>Restaurant Name</th>
              <th>Category</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id}>
                <td>{restaurants.find(r => r.id === category.restaurantId)?.restaurantName}</td> {/* Updated field name */}
                <td>{category.categoryName}</td>
                <td>
                  <button className="edit-icon-button" onClick={() => handleEditCategory(category)}>
                    <FaEdit />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    
      <ToastContainer />
    </div>
  );
}

export default FoodCategory;
