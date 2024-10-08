import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import '../styles/AddressBook.css';
import Sidebar from '../components/CustomerSidebar'; 
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AddressBook = () => {
  const { user } = useUser();
  const [addresses, setAddresses] = useState([]);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [newAddress, setNewAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    userId: user ? user.id : null,
  });
  const [message, setMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (user) {
      try {
        const response = await axios.get(`http://localhost:8080/address/user/${user.id}`);
        console.log('Fetched addresses:', response.data);
        setAddresses(response.data);
      } catch (error) {
        console.error('Error fetching addresses:', error);
      }
    }
  };

  const handleAddAddress = async () => {
    try {
      const addressToAdd = { ...newAddress, userId: user.id };
      const response=await axios.post('http://localhost:8080/address', addressToAdd);
      setIsAddingAddress(false);
      setNewAddress({ street: '', city: '', state: '', pincode: '', userId: user.id });
      await fetchAddresses();
      toast.success(response.data.message);

      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      toast.error(error.response.data.message); 
      console.error('Error adding address:', error);
      setMessage('Error adding address. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdateAddress = async () => {
    try {
      const response= await axios.put(`http://localhost:8080/address/update/${editingAddress.id}`, editingAddress);
      setEditingAddress(null);
      fetchAddresses();
      toast.success(response.data.message);
    } catch (error) {
      toast.error(error.response.data.message); 
      console.error('Error updating address:', error);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const response=  await axios.delete(`http://localhost:8080/address/delete/${id}`)
      toast.success(response.data.message);

      fetchAddresses();
    } catch (error) {
      toast.error(error.response.data.message); 
      console.error('Error deleting address:', error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="address-book-wrapper">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`address-book-container ${sidebarOpen ? 'shifted' : ''}`}>

        <h1>Address Book</h1>
        <button className="add-button" onClick={() => setIsAddingAddress(true)}>
          <FaPlus /> Add New Address
        </button>
        {isAddingAddress && (
          <div className="address-form">
            <input
              type="text"
              placeholder="Street"
              value={newAddress.street}
              onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
            />
            <input
              type="text"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
            />
            <input
              type="text"
              placeholder="State"
              value={newAddress.state}
              onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
            />
            <input
              type="text"
              placeholder="Pincode"
              value={newAddress.pincode}
              onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
            />
            <button onClick={handleAddAddress}>Add Address</button>
            <button onClick={() => setIsAddingAddress(false)}>Cancel</button>
          </div>
        )}
        {message && <p className="message">{message}</p>}
        {addresses.length > 0 ? (
          <div className="address-list">
            {addresses.map((address) => (
              <div className="address-item" key={address.id}>
                {editingAddress && editingAddress.id === address.id ? (
                  <div className="address-form">
                    <input
                      type="text"
                      value={editingAddress.street}
                      onChange={(e) => setEditingAddress({ ...editingAddress, street: e.target.value })}
                    />
                    <input
                      type="text"
                      value={editingAddress.city}
                      onChange={(e) => setEditingAddress({ ...editingAddress, city: e.target.value })}
                    />
                    <input
                      type="text"
                      value={editingAddress.state}
                      onChange={(e) => setEditingAddress({ ...editingAddress, state: e.target.value })}
                    />
                    <input
                      type="text"
                      value={editingAddress.pincode}
                      onChange={(e) => setEditingAddress({ ...editingAddress, pincode: e.target.value })}
                    />
                    <button onClick={handleUpdateAddress}>Save</button>
                    <button onClick={() => setEditingAddress(null)}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <p><strong>Street:</strong> {address.street}</p>
                    <p><strong>City:</strong> {address.city}</p>
                    <p><strong>State:</strong> {address.state}</p>
                    <p><strong>Pincode:</strong> {address.pincode}</p>
                    <div className="button-group">
                      <button className="icon-button" onClick={() => setEditingAddress(address)}>
                        <FaEdit />
                      </button>
                      <button className="icon-button" onClick={() => handleDeleteAddress(address.id)}>
                        <FaTrash />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No addresses found.</p>
        )}
      </div>
      <ToastContainer/>
    </div>
  );
};

export default AddressBook;
