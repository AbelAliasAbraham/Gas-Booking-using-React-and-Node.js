// src/Footer.jsx

import React from 'react';

const Footer = () => {
  // Get the current year dynamically
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <p>&copy; {currentYear} Gas Booking System. All rights reserved.</p>
        <p>Contact us: support@gasbooking.com</p>
      </div>
    </footer>
  );
};

export default Footer;