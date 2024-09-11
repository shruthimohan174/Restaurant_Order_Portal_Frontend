import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function RestaurantPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState({});
  const [categories, setCategories] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const { user } = useUser();

  useEffect(() => {
    axios.get(`http://localhost:8082/restaurant/${restaurantId}`)
      .then((response) => {
        setRestaurant(response.data);
      }).catch((error) => {
        console.error("Error fetching restaurant data:", error);
      });

    axios.get(`http://localhost:8082/category/restaurant/${restaurantId}`)
      .then((response) => {
        setCategories(response.data);
      }).catch((error) => {
        console.error("Error fetching categories:", error);
      });
  }, [restaurantId]);

  useEffect(() => {
    if (selectedCategoryId) {
      axios.get(`http://localhost:8082/foodItem/category/${selectedCategoryId}`)
        .then((response) => {
          setFoodItems(response.data);
        }).catch((error) => {
          console.error("Error fetching food items:", error);
        });
    } else {
      setFoodItems([]);
    }
  }, [selectedCategoryId]);

  const handleAddToCart = (foodItem) => {
    if (user && user.id) {
      axios.post('http://localhost:8081/cart/add', {
        userId: user.id,
        foodItemId: foodItem.id,
        restaurantId: restaurantId,
        price: foodItem.price
      })
        .then(response => {
          toast.success("Item added to cart.");
        })
        .catch(error => {
          console.error("Error adding item to cart:", error);
          toast.error("Error adding item to cart.");
        });
    } else {
      console.error("User ID is not available.");
      toast.error("Please log in to add items to the cart.");
    }
  };

  const handleViewCart = () => {
    navigate(`/cart/${restaurantId}`);
  };

  return (
    <div style={{ display: 'flex', padding: '20px' }}>
      <ToastContainer />
      <div style={{ flex: '1', padding: '20px', background: '#f5f5f5' }}>
        <img src={`http://localhost:8082/restaurant/${restaurantId}/image`} alt={restaurant.restaurantName} style={{ width: '100%', borderRadius: '8px' }} />
        <h1 style={{ margin: '20px 0' }}>{restaurant.restaurantName}</h1>
        <p><strong>Opening Hours:</strong> {restaurant.openingHours}</p>
        <p><strong>Address:</strong> {restaurant.address}</p>
        <button onClick={handleViewCart} style={{ marginTop: '20px' }}>View Cart</button>
      </div>

      <div style={{ flex: '2', padding: '20px' }}>
        <h3>Categories</h3>
        <ul>
          {categories.map((category) => (
            <li
              key={category.id}
              onClick={() => setSelectedCategoryId(category.id)}
              style={{ cursor: 'pointer', padding: '5px', border: '1px solid #ddd', margin: '5px 0' }}
            >
              {category.categoryName}
            </li>
          ))}
        </ul>

        <div>
          <h3>Food Items</h3>
          <ul>
            {foodItems.length > 0 ? (
              foodItems.map((foodItem) => (
                <li key={foodItem.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                  <img src={`http://localhost:8082/foodItem/${foodItem.id}/image`} alt={foodItem.itemName} style={{ width: '100px', marginRight: '10px' }} />
                  <div>
                    <p><strong>{foodItem.itemName}</strong></p>
                    <p>{foodItem.description}</p>
                    <p><strong>Price:</strong> Rs.{foodItem.price}</p>
                    <button onClick={() => handleAddToCart(foodItem)}>Add to Cart</button>
                  </div>
                </li>
              ))
            ) : (
              <p>Select a category to view food items.</p>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RestaurantPage;
