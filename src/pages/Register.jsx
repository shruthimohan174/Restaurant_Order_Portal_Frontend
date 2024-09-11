import React, { useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import base64 from 'base-64'; // Ensure you have this installed
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
  const [redirectAfterModal, setRedirectAfterModal] = useState(false); // New state for handling redirection
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prevState => ({ ...prevState, [name]: checked }));
    } else {
      setFormData(prevState => ({ ...prevState, [name]: value }));
    }
  };

  const validate = () => {
    const newErrors = {};
  
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.firstName)) {
      newErrors.firstName = "First name can only contain alphabets";
    }
  
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    } else if (!/^[A-Za-z]+$/.test(formData.lastName)) {
      newErrors.lastName = "Last name can only contain alphabets";
    }
  
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[a-zA-Z][a-zA-Z0-9._%+-]*@(gmail\.com|nucleusteq\.com)$/.test(formData.email)) {
      newErrors.email = "Email must be a valid @gmail.com or @nucleusteq.com and contain at least one alphabet before the '@' symbol.";
    }
  
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 5) {
      newErrors.password = "Password must be at least 5 characters long";
    } else if (!/(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])/.test(formData.password)) {
      newErrors.password = "Password must contain at least one digit, one lowercase letter, one uppercase letter, and one special character.";
    }
  
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
  
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^[789]\d{9}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Phone number must start with 7, 8, or 9 and contain exactly 10 digits.";
    }
  
    if (!formData.terms) {
      newErrors.terms = "You must agree to the terms and conditions";
    }
  
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
      toast.success('Registration successful!');
      console.log('User registered successfully:', response.data);
  
      // Set a flag to redirect after the modal
      setRedirectAfterModal(true);
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      toast.error(errorMessage);
      console.error('Error registering user:', errorMessage);
    }
  };
  
  // Use useEffect to handle redirection after modal is shown
  React.useEffect(() => {
    if (redirectAfterModal && showModal) {
      const timer = setTimeout(() => {
        setShowModal(false);
        navigate('/login');
      }, 5000);

      return () => clearTimeout(timer); // Cleanup timer on component unmount
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

      {showModal && formData.userRole === 'CUSTOMER' && (
        <div className="modal">
          <div className="modal-content">
            <h2>Congratulations!</h2>
            <p>You have received Rs. 1000 in your wallet.</p>
            <p>Redirecting to login...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
