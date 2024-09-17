import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ContactUs.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ContactUsForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    message: ''
  });

  const [responseMessage, setResponseMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/user/contact-us', formData);
      toast.success(response.data.message);
    } catch (error) {
      setResponseMessage('Failed to send message. Please try again.');
      toast.error(error.response.data.message);
    }
  };

  return (
    <div className="contact-us-container">
      <h2 className="contact-us-header">Contact Us</h2>
      <form className="contact-us-form" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="name" 
          placeholder="Your Name" 
          value={formData.name} 
          onChange={handleChange} 
          required 
        />
        <input 
          type="text" 
          name="subject" 
          placeholder="Subject" 
          value={formData.subject} 
          onChange={handleChange} 
          required 
        />
        <textarea 
          name="message" 
          placeholder="Your Message" 
          value={formData.message} 
          onChange={handleChange} 
          required 
        ></textarea>
        <button type="submit">Send Message</button>
      </form>
      {responseMessage && <p className="response-message">{responseMessage}</p>}
      <ToastContainer/>
    </div>
  );
};

export default ContactUsForm;
