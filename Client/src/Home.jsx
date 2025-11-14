import React from 'react';
import Header from './Header';
import Footer from './Footer'; // ✅ Import Footer
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <>
      <Header />
      <div className="hero">
        <h1>Welcome to Gas Booking System</h1>
        <p>Book your gas cylinders with ease and convenience.</p>
        <Link to="/" className="cta-button">Get Started</Link>
      </div>
      <Footer /> {/* ✅ Add Footer */}
    </>
  );
};

export default Home;