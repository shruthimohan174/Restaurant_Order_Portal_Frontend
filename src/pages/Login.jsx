import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useUser } from '../context/UserContext'; 
import '../styles/Login.css'; 
import base64 from 'base-64'; 
const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { login } = useUser(); 

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const encodedPassword = base64.encode(formData.password); 
      const dataToSend = { ...formData, password: encodedPassword }; 

      const response = await axios.post('http://localhost:8080/user/login', dataToSend);
      const user = response.data;
      login(user);  
      console.log(user);
      navigate(user.userRole === 'CUSTOMER' ? '/customer-dashboard' : '/restaurant-dashboard');
      toast.success('Login successful!');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      toast.error(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="titleL">Login</h1>
        <input
          className="input"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />
        {errors.email && <div className="error">{errors.email}</div>}
        <input
          className="input"
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <div className="error">{errors.password}</div>}
        <button className="login-button" type="submit">Submit</button>
        <p className="create-account">
          Create an account? <a href="/register">Click here</a>
        </p>
      </form>
      <ToastContainer />
    </div>
  );
};

export default Login;
