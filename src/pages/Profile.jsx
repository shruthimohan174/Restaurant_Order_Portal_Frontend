import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { FaUser, FaEdit, FaPlus } from 'react-icons/fa';
import '../styles/Profile.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import base64 from 'base-64';
import SidebarCustomer from '../components/CustomerSidebar'; 
import SidebarRestaurant from '../components/RestaurantSidebar'; 

const Profile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingMoney, setIsAddingMoney] = useState(false); 
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/user/${user.id}`);
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleAddMoneyClick = () => {
    setIsAddingMoney(true);
  };

  if (!profile) {
    return <div className="loading-text">Loading...</div>;
  }

  const SidebarComponent = user.userRole === 'CUSTOMER' ? SidebarCustomer : SidebarRestaurant;

  return (
    <div className="profile-wrapper">
      <SidebarComponent sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div className={`profile-container ${sidebarOpen ? 'shifted' : ''}`}>
        <div className="profile-header">
          <FaUser className="user-icon" />
          <h1 className="profile-title">User Profile</h1>
        </div>
        <div className="profile-info">
          <p className="profile-field"><strong>First Name:</strong> {profile.firstName}</p>
          <p className="profile-field"><strong>Last Name:</strong> {profile.lastName}</p>
          <p className="profile-field"><strong>Email:</strong> {profile.email}</p>
          <p className="profile-field"><strong>Phone Number:</strong> {profile.phoneNumber}</p>
          {user.userRole === 'CUSTOMER' && (
            <p className="profile-field"><strong>Wallet Balance:</strong> ₹{profile.walletBalance}</p>
          )}
        </div>
        <div className="button-groupP">
          <button className="edit-button" onClick={handleEditClick}>
            <FaEdit /> Edit Profile
          </button>
          {user.userRole === 'CUSTOMER' && (
            <button className="add-money-button" onClick={handleAddMoneyClick}>
              <FaPlus /> Add Money
            </button>
          )}
        </div>
      </div>
      <>
        {isEditing && (
          <div className="modalP">
            <div className="modal-contentP">
              <EditProfileForm 
                profile={profile} 
                setIsEditing={setIsEditing} 
                setProfile={setProfile} 
              />
            </div>
          </div>
        )}
        {isAddingMoney && (
          <div className="modalP">
            <div className="modal-contentP">
              <AddMoneyForm
                userId={user.id}
                setIsAddingMoney={setIsAddingMoney}
                setProfile={setProfile}
              />
            </div>
          </div>
        )}
      </>
      <ToastContainer />
    </div>
  );
};

const AddMoneyForm = ({ userId, setIsAddingMoney, setProfile }) => {
  const [amount, setAmount] = useState('');

  const handleChange = (e) => {
    setAmount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`http://localhost:8080/user/${userId}/addWallet`, amount, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setProfile(prevProfile => ({
        ...prevProfile,
        walletBalance: prevProfile.walletBalance + parseFloat(amount)
      }));
      setIsAddingMoney(false);
      toast.success(response.data.message);
    } catch (error) {
      console.error('Error adding money to wallet:', error);
      toast.error(error.response?.data?.message || 'Failed to add money to wallet. Please try again.');
    }
  };

  return (
    <div className="add-money-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Add Money to Wallet</h2>
        <div className="form-field">
          <label htmlFor="amount">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <div className="button-groupP">
          <button className="submit-buttonP" type="submit">Add Money</button>
          <button className="cancel-buttonP" type="button" onClick={() => setIsAddingMoney(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const EditProfileForm = ({ profile, setIsEditing, setProfile }) => {
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber,
    password: '', 
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};

    if (!formData.firstName) {
      errors.firstName = "First name is required";
    }

    if (!formData.lastName) {
      errors.lastName = "Last name is required";
    }

    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[789]\d{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must start with 7, 8, or 9 and be exactly 10 digits long";
    }

    if (formData.password && !/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=]).{5,}$/.test(formData.password)) {
      errors.password = "Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character.";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      const encodedPassword = base64.encode(formData.password);
      const dataToSend = { ...formData, password: encodedPassword };
      const response = await axios.put(`http://localhost:8080/user/update/${profile.id}`, dataToSend);
      setProfile({ ...profile, ...response.data });
      setIsEditing(false);
      toast.success(response.data.message );
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile. Please try again.');
    }
  };

  return (
    <div className="edit-profile-container">
      <form className="form" onSubmit={handleSubmit}>
        <h2>Edit Profile</h2>
        <div className="form-field">
          <label htmlFor="firstName">First Name:</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
          {errors.firstName && <div className="error-message">{errors.firstName}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="lastName">Last Name:</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
          {errors.lastName && <div className="error-message">{errors.lastName}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
          {errors.phoneNumber && <div className="error-message">{errors.phoneNumber}</div>}
        </div>
        <div className="form-field">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <div className="error-message">{errors.password}</div>}
        </div>
        <div className="button-groupP">
          <button className="submit-buttonP" type="submit">Update</button>
          <button className="cancel-buttonP" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
