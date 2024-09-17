import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/CartPage.css';


function CartPage() {
  const { restaurantId } = useParams();
  const { user } = useUser();
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [totalPrice, setTotalPrice] = useState(0); 

  useEffect(() => {
    if (user && user.id) {
      fetchCart();
      fetchAddresses();
    }
  }, [user, restaurantId]);

  const fetchCart = () => {
    axios.get(`http://localhost:8081/cart/user/${user.id}/restaurant/${restaurantId}`)
      .then(response => {
        setCart(response.data);
        fetchFoodItems(response.data.map(item => item.foodItemId)); 
        calculateTotalPrice(response.data); 
      })
      .catch(error => {
        console.error("Error fetching cart:", error);
      });
  };

  const fetchFoodItems = (foodItemIds) => {
    if (foodItemIds.length === 0) return;

    const requests = foodItemIds.map(id => 
      axios.get(`http://localhost:8082/foodItem/${id}`)
    );

    Promise.all(requests)
      .then(responses => {
        const items = responses.map(response => response.data);
        setFoodItems(items);
      })
      .catch(error => {
        console.error("Error fetching food items:", error);
      });
  };

  const fetchAddresses = () => {
    axios.get(`http://localhost:8080/address/user/${user.id}`)
      .then(response => {
        setAddresses(response.data);
      })
      .catch(error => {
        console.error("Error fetching addresses:", error);
      });
  };

  const handleQuantityChange = (cartId, quantityChange) => {
    axios.put(`http://localhost:8081/cart/update/${cartId}?quantityChange=${quantityChange}`)
      .then(response => {
        fetchCart();
      })
      .catch(error => {
        console.error("Error updating cart:", error);
      });
  };

  const handleRemoveFromCart = (cartId) => {
    axios.delete(`http://localhost:8081/cart/remove/${cartId}`)
      .then(response => {
        setCart(cart.filter(item => item.id !== cartId));
        calculateTotalPrice(cart.filter(item => item.id !== cartId)); 
        toast.success(response.data.message);
      })
      .catch(error => {
        console.error("Error removing item from cart:", error);
      });
  };

  const handlePlaceOrder = () => {
    if (cart.length === 0) {
      toast.error("Please add items to the cart first.");
      return;
    }

    if (!selectedAddressId) {
      toast.error("Please select a delivery address.");
      return;
    }

    const order = {
      userId: user.id,
      restaurantId: restaurantId,
      deliveryAddressId: selectedAddressId,
      cartItems: cart.map(item => ({
        foodItemId: item.foodItemId,
        quantity: item.quantity,
        price: item.price
      }))
    };

    axios.post('http://localhost:8081/orders', order)
      .then(response => {
        toast.success(response.data.message);
        setTimeout(()=>{
          navigate('/order-history');
        },4000)
        
      })
      .catch(error => {
        if (error.response && error.response.status === 400 && error.response.data.message === 'Insufficient balance in wallet to place the order.') {
          toast.error(error.response.data.message); 
        } else {
          console.error("Error placing order:", error);
          toast.error(error.response.data.message); 
        }
      });
  };

  const getFoodItemName = (foodItemId) => {
    const foodItem = foodItems.find(item => item.id === foodItemId);
    return foodItem ? foodItem.itemName : "Unknown Item";
  };

  const calculateTotalPrice = (cartItems) => {
    const total = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotalPrice(total);
  };

  return (
    <div style={{ padding: '20px' }}>
      <ToastContainer />
      <h2>Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty. Please add items to the cart.</p>
      ) : (
        <ul>
          {cart.map(item => (
            <li key={item.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
              <img src={`http://localhost:8082/foodItem/${item.foodItemId}/image`} alt={getFoodItemName(item.foodItemId)} style={{ width: '100px', marginRight: '10px' }} />
              <div>
                <p>{getFoodItemName(item.foodItemId)}</p>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <button onClick={() => handleQuantityChange(item.id, -1)}>-</button>
                  <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                  <button onClick={() => handleQuantityChange(item.id, 1)}>+</button>
                  <button onClick={() => handleRemoveFromCart(item.id)} style={{ marginLeft: '10px' }}>Remove</button>
                </div>
                <p className="total-price"> Total Price: Rs.{item.price}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
      

      <h3>Select Delivery Address</h3>
      <select value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
        <option value="">Select Address</option>
        {addresses.map(address => (
          <option key={address.id} value={address.id}>
            {address.street}, {address.city}, {address.state}
          </option>
        ))}
      </select>

      <button className='place' onClick={handlePlaceOrder} style={{ marginTop: '20px' }}>Place Order</button>
    </div>
  );
}

export default CartPage;
