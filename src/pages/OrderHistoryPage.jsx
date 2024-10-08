import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import Sidebar from '../components/CustomerSidebar';
import '../styles/OrderHistoryPage.css';
import { toast, ToastContainer } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 

function OrderHistoryPage() {
  const { user } = useUser();
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState({});
  const [foodItems, setFoodItems] = useState({});
  const [cancellationStatus, setCancellationStatus] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (user && user.id) {
      fetchOrderHistory();
    }
  }, [user]);

  const fetchOrderHistory = () => {
    axios.get(`http://localhost:8081/orders/user/${user.id}`)
      .then(response => {
        setOrders(response.data);
        const initialCancellationStatus = {};
        response.data.forEach(order => {
          if (order.id) {
            const orderTime = new Date(order.orderTime).getTime();
            const currentTime = new Date().getTime();
            const timeDifference = (currentTime - orderTime) / 1000; 
            const canCancel = timeDifference <= 30 && order.orderStatus !== 'CANCELLED';
            initialCancellationStatus[order.id] = {
              canCancel,
              timeRemaining: canCancel ? Math.max(30 - timeDifference, 0) : 0
            };
          }
        });
        setCancellationStatus(initialCancellationStatus);

        response.data.forEach(order => {
          if (order.deliveryAddressId) {
            fetchDeliveryAddress(order.deliveryAddressId);
          }
          if (order.cartItems && order.cartItems.length > 0) {
            order.cartItems.forEach(item => {
              fetchFoodItem(item.foodItemId);
            });
          }
        });
      })
      .catch(error => {
        console.error("Error fetching order history:", error);
      });
  };

  const fetchDeliveryAddress = (addressId) => {
    axios.get(`http://localhost:8080/address/${addressId}`)
      .then(response => {
        setAddresses(prev => ({ ...prev, [addressId]: response.data }));
      })
      .catch(error => {
        console.error("Error fetching delivery address:", error);
      });
  };

  const fetchFoodItem = (foodItemId) => {
    axios.get(`http://localhost:8082/foodItem/${foodItemId}`)
      .then(response => {
        setFoodItems(prev => ({ ...prev, [foodItemId]: response.data }));
      })
      .catch(error => {
        console.error("Error fetching food item:", error);
      });
  };

  const handleCancelOrder = (orderId) => {
    console.log(`Canceling order with ID: ${orderId}`);
    const { canCancel = false } = cancellationStatus[orderId] || {};
  
    if (canCancel) {
      axios.delete(`http://localhost:8081/orders/cancel/${orderId}`)
        .then(response => {
          setCancellationStatus(prev => ({
            ...prev,
            [orderId]: { canCancel: false, timeRemaining: 0 }
          }));
          toast.success(response.data.message);
          fetchOrderHistory();
        })
        .catch(error => {          
          if (error.response && error.response.data && error.response.data.message) {
            toast.error(error.response.data.message); 
          } else {
            toast.error("Failed to cancel order."); 
          }
        });
    } else {
      toast.error("Order cannot be cancelled.");
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCancellationStatus(prev => {
        const updatedStatus = {};
        Object.keys(prev).forEach(orderId => {
          const { canCancel, timeRemaining } = prev[orderId];
          if (canCancel && timeRemaining > 0) {
            updatedStatus[orderId] = {
              canCancel: timeRemaining > 1,
              timeRemaining: timeRemaining - 1
            };
          } else {
            updatedStatus[orderId] = {
              canCancel: false,
              timeRemaining: 0
            };
          }
        });
        return updatedStatus;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [orders]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  return (
    <div className="order-history-page">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`main-content ${sidebarOpen ? 'shifted' : ''}`}>
        <div className="heading">
          <h2>Order History</h2>
        </div>
        <ul>
          {orders.map(order => (
            <li key={order.id}>
              <p>Order ID: {order.id}</p>
              <p>Total Price: Rs.{order.totalPrice}</p>
              <p>Status: {order.orderStatus}</p>
              <p>Order Time: {new Date(order.orderTime).toLocaleString()}</p>

              {addresses[order.deliveryAddressId] && (
                <p>
                  Delivery Address: {addresses[order.deliveryAddressId].street}, 
                  {addresses[order.deliveryAddressId].city}, 
                  {addresses[order.deliveryAddressId].state}
                </p>
              )}

              {cancellationStatus[order.id]?.canCancel && (
                <div>
                  <button onClick={() => handleCancelOrder(order.id)}>
                    Cancel Order ({Math.ceil(cancellationStatus[order.id].timeRemaining)}s)
                  </button>
                </div>
              )}

              <h4>Items:</h4>
              <ul>
                {order.cartItems.map(item => (
                  <li key={item.foodItemId} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                    <div>
                      {foodItems[item.foodItemId] && (
                        <>
                          <img 
                            src={`http://localhost:8082/foodItem/${item.foodItemId}/image`} 
                            alt={foodItems[item.foodItemId].itemName} 
                            style={{ width: '100px', height: '100px', marginRight: '10px' }} 
                          />
                          <p>{foodItems[item.foodItemId].itemName} - Quantity: {item.quantity}, Price: Rs.{item.price}</p>
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </div>
      <ToastContainer /> 
    </div>
  );
}

export default OrderHistoryPage;