import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import RestaurantSidebar from '../components/RestaurantSidebar';
import '../styles/ViewOrdersPage.css';

function ViewOrdersPage() {
  const { user } = useUser();
  const [restaurants, setRestaurants] = useState([]);
  const [orders, setOrders] = useState([]);
  const [foodItems, setFoodItems] = useState({});
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRestaurants(user.id);
    }
  }, [user]);

  const fetchRestaurants = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:8082/restaurant/user/${userId}`);
      setRestaurants(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      setLoading(false);
    }
  };

  const fetchOrders = async (restaurantId) => {
    try {
      const response = await axios.get(`http://localhost:8081/orders/restaurant/${restaurantId}`);
      setOrders(response.data);
      response.data.forEach(order => {
        if (order.cartItems && order.cartItems.length > 0) {
          order.cartItems.forEach(item => {
            fetchFoodItem(item.foodItemId);
          });
        }
      });
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const fetchFoodItem = async (foodItemId) => {
    try {
      const response = await axios.get(`http://localhost:8082/foodItem/${foodItemId}`);
      setFoodItems(prev => ({ ...prev, [foodItemId]: response.data }));
    } catch (error) {
      console.error("Error fetching food item:", error);
    }
  };

  const handleRestaurantClick = (restaurantId) => {
    setSelectedRestaurant(restaurantId);
    fetchOrders(restaurantId);
  };

  const handleCompleteOrder = async (orderId) => {
    try {
      await axios.post(`http://localhost:8081/orders/complete/${orderId}/user/${user.id}`);
      fetchOrders(selectedRestaurant); 
    } catch (error) {
      console.error("Error completing order:", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <RestaurantSidebar sidebarOpen={sidebarOpen} />
      <div style={{ marginLeft: sidebarOpen ? '350px' : '0', flex: 1 }}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">View Orders</h1>
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Restaurants</h2>
            {restaurants.length === 0 ? (
              <p>No restaurants found.</p>
            ) : (
              <ul className="list-disc pl-5">
                {restaurants.map((restaurant) => (
                  <li key={restaurant.id} className="mb-2 cursor-pointer text-blue-500 hover:underline" onClick={() => handleRestaurantClick(restaurant.id)}>
                    {restaurant.restaurantName}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedRestaurant && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Orders for Restaurant</h2>
              {orders.length === 0 ? (
                <p>No orders found for this restaurant.</p>
              ) : (
                <div className="grid gap-6">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white shadow-md rounded-lg p-6">
                      <h3 className="text-lg font-semibold mb-2">Order: {order.id}</h3>
                      <p className="mb-2"><strong>Status:</strong> {order.orderStatus}</p>
                      <p className="mb-2"><strong>Total Price:</strong> Rs.{order.totalPrice}</p>
                      <p className="mb-2"><strong>Order Time:</strong> {new Date(order.orderTime).toLocaleString()}</p>
                      <h4 className="text-md font-semibold mt-4 mb-2">Order Items:</h4>
                      <ul className="list-disc pl-5">
                        {order.cartItems.map((item, index) => (
                          <li key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                            <div>
                              {foodItems[item.foodItemId] ? (
                                <>
                                  <img 
                                    src={`http://localhost:8082/foodItem/${item.foodItemId}/image`} 
                                    alt={foodItems[item.foodItemId].itemName} 
                                    style={{ width: '100px', height: '100px', marginRight: '10px' }} 
                                  />
                                  <p>{foodItems[item.foodItemId].itemName} - Quantity: {item.quantity}, Price: Rs.{item.price}</p>
                                </>
                              ) : (
                                <p>Loading item details...</p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {order.orderStatus !== 'COMPLETED' && order.orderStatus !== 'CANCELLED' && (
                        <button   className='completed'
                          onClick={() => handleCompleteOrder(order.id)}
                        
                        >
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewOrdersPage;
