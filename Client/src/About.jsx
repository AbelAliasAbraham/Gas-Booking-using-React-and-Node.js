import React from 'react';
import Header from './Header';
import Footer from './Footer'; // ✅ Import Footer
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <>
      <Header />
      <div className="hero">
        <h1>About Gas Booking System</h1>
        <p>Our platform simplifies the process of booking gas cylinders, providing a seamless and user-friendly experience.</p>
        <Link to="/" className="cta-button">Get Started</Link>
      </div>
      <Footer /> {/* ✅ Add Footer */}
    </>
  );
};

export default About;