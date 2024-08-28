import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { FaUser, FaEdit } from 'react-icons/fa';
import '../styles/Profile.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  if (!profile) {
    return <div className="loading-text">Loading...</div>;
  }

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="profile-header">
          <FaUser className="user-icon" />
          <h1 className="profile-title">User Profile</h1>
        </div>
        <div className="profile-info">
          <p className="profile-field"><strong>First Name:</strong> {profile.firstName}</p>
          <p className="profile-field"><strong>Last Name:</strong> {profile.lastName}</p>
          <p className="profile-field"><strong>Email:</strong> {profile.email}</p>
          <p className="profile-field"><strong>Phone Number:</strong> {profile.phoneNumber}</p>
          <p className="profile-field"><strong>Wallet Balance:</strong> ₹{profile.walletBalance}</p>
        </div>
        <div className="button-group">
          <button className="edit-button" onClick={handleEditClick}>
            <FaEdit /> Edit Profile
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <EditProfileForm 
              profile={profile} 
              setIsEditing={setIsEditing} 
              setProfile={setProfile} 
            />
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
};



const EditProfileForm = ({ profile, setIsEditing, setProfile }) => {
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    phoneNumber: profile.phoneNumber,
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errors = {};
    
    if (!formData.phoneNumber) {
      errors.phoneNumber = "Phone number is required";
    } else if (!/^[789]\d{9}$/.test(formData.phoneNumber)) {
      errors.phoneNumber = "Phone number must start with 7, 8, or 9 and be exactly 10 digits long";
    }

    setErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return; 
    }

    try {
      const response = await axios.put(`http://localhost:8080/user/update/${profile.id}`, formData);
      setProfile({ ...profile, ...response.data });
      setIsEditing(false);
      toast.success('Profile updated successfully!'); // Use toast for success message
    } catch (error) {
      console.error('Error updating profile:', error);
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
        <div className="button-groupP">
          <button className="submit-button" type="submit">Save Changes</button>
          <button className="cancel-button" type="button" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
