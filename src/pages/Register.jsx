import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import base64 from 'base-64';
import '../styles/Register.css';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    userRole: 'CUSTOMER',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [redirectAfterModal, setRedirectAfterModal] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validate = () => {
    const newErrors = {};
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const { confirmPassword, password, ...dataToSend } = formData;
      const encodedPassword = base64.encode(password);
      const dataWithEncodedPassword = { ...dataToSend, password: encodedPassword };

      const response = await axios.post('http://localhost:8080/user/register', dataWithEncodedPassword);

      if (response.data.id) {
        delete response.data.id;
      }

      setShowModal(true);
      toast.success(response.data.message );

      setRedirectAfterModal(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      console.error('Error registering user:', errorMessage);
    }
  };

  useEffect(() => {
    if (redirectAfterModal && showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        navigate('/login');
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [redirectAfterModal, showModal, navigate]);

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h1 className="titleR">Sign Up</h1>
        <input
          type="text"
          name="firstName"
          placeholder="First name"
          value={formData.firstName}
          onChange={handleChange}
          className="input"
        />
        {errors.firstName && <div className="error">{errors.firstName}</div>}
        <input
          type="text"
          name="lastName"
          placeholder="Last name"
          value={formData.lastName}
          onChange={handleChange}
          className="input"
        />
        {errors.lastName && <div className="error">{errors.lastName}</div>}
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          className="input"
        />
        {errors.email && <div className="error">{errors.email}</div>}
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="input"
        />
        {errors.password && <div className="error">{errors.password}</div>}
        <input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="input"
        />
        {errors.confirmPassword && <div className="error">{errors.confirmPassword}</div>}
        <input
          type="text"
          name="phoneNumber"
          placeholder="Phone number"
          value={formData.phoneNumber}
          onChange={handleChange}
          className="input"
        />
        {errors.phoneNumber && <div className="error">{errors.phoneNumber}</div>}
        <select
          name="userRole"
          value={formData.userRole}
          onChange={handleChange}
          className="select"
        >
          <option value="CUSTOMER">CUSTOMER</option>
          <option value="RESTAURANT_OWNER">RESTAURANT_OWNER</option>
        </select>
        <div className="checkbox">
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
          />
          <label htmlFor="terms">I agree to the terms and conditions</label>
          {errors.terms && <div className="error">{errors.terms}</div>}
        </div>
        <button type="submit" className="register-button">Submit</button>
        <p className="already-have-account">
          Already have an account? <a href="/login">Login here</a>
        </p>
      </form>
      <ToastContainer />

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Thank you for registering!</h2>
            {formData.userRole === 'CUSTOMER' ? (
              <>
                <p>Congratulations! You have been credited with Rs. 1000 in your account.</p>
                <p>Enjoy your shopping experience!</p>
              </>
            ) : (
              <p>Your registration as a Restaurant Owner is complete.</p>
            )}
            <p>Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;