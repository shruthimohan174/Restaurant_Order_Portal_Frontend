import React from 'react';
import '../styles/Home.css'
import homeImg from '../assets/homeImg.jpeg';

const HomeSection = () => {
  return (
    <section className="hero-container">
      <div className="hero-text">
        <p className="subtitle">Are you hungry?</p>
        <h2 className="title">Don't wait!</h2>
        <p className="description">Order your favorite food from the best restaurants near you</p>
        <button>Order Now</button>
      </div>
      <img className="hero-image" src={homeImg} alt="New Collection" />
    </section>
  );
};

export default HomeSection;
