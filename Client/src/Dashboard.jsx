// src/Dashboard.jsx

import React, { useState, useEffect, useCallback } from 'react';
import Header from './Header';
import Footer from './Footer'
import { useAuth } from './useAuth'; 

const Dashboard = () => {
  const { token, logout } = useAuth();
  
  // State for Account Details
  const [accountDetails, setAccountDetails] = useState({
    name: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
  });
  const [isLoading, setIsLoading] = useState(true);

  // State for Booking and History
  const [paymentMethod, setPaymentMethod] = useState('cash'); // Default payment method
  const [bookingHistory, setBookingHistory] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  // --- Function to Fetch History (Cached with useCallback) ---
  const fetchBookingHistory = useCallback(async () => {
    if (!token) return;
    setIsHistoryLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/booking/history", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.ok && data.history) {
        setBookingHistory(data.history);
      } else {
        setBookingHistory([]);
      }
    } catch (err) {
      console.error("Dashboard: Error fetching history:", err);
      setBookingHistory([]);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [token]);

  // --- Initial Data Load (Account Details & History) ---
  useEffect(() => {
    async function loadInitialData() {
      if (!token) return; 

      // 1. Fetch Account Details
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok && data.user) {
          setAccountDetails({
            name: data.user.name, email: data.user.email, phone: data.user.phone,
          });
        } else {
          console.log("Dashboard: Invalid token, logging out");
          logout(); 
        }
      } catch (err) {
        console.error("Dashboard: Error fetching account details:", err);
        logout();
      } finally {
        setIsLoading(false);
      }
      
      // 2. Fetch Booking History
      fetchBookingHistory();
    }

    loadInitialData();
  }, [token, logout, fetchBookingHistory]);


  // --- Handle cylinder booking form submission ---
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    const cylinderType = e.target['cylinder-type'].value;
    
    if (!paymentMethod) {
      alert("Please select a payment method.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/booking/book", {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ cylinderType, paymentMethod }) 
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message + 
              ` (Type: ${data.booking.type}, Payment: ${paymentMethod}, Status: ${data.booking.status})`);
        // Refresh history after successful booking
        fetchBookingHistory(); 
      } else {
        alert(`Booking Failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Booking submission error:", error);
      alert("An unexpected error occurred during booking.");
    }
  };

  // --- Render Method ---
  return (
    <>
      <Header />
      <div className="hero dashboard-hero">
        <h1>Welcome to Your Dashboard</h1>
        <div className="wrapper">
          
          {/* Book a Cylinder Card */}
          <div className="card">
            <h2>Book a Cylinder</h2>
            <form id="booking-form" onSubmit={handleBookingSubmit}>
              <label htmlFor="cylinder-type">Select Cylinder Type</label>
              <select id="cylinder-type" required>
                <option value="5kg">5kg Cylinder</option>
                <option value="14.2kg">14.2kg Cylinder</option>
                <option value="19kg">19kg Cylinder</option>
              </select>
              
              {/* Payment Method Selection */}
              <div style={{ textAlign: 'left', marginTop: '15px', marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px' }}>Payment Method:</label>
                <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                  <label>
                    <input 
                      type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'}
                      onChange={() => setPaymentMethod('cash')}
                      style={{ width: 'auto', marginRight: '5px' }}
                    /> Cash on Delivery
                  </label>
                  <label>
                    <input 
                      type="radio" name="payment" value="card" checked={paymentMethod === 'card'}
                      onChange={() => setPaymentMethod('card')}
                      style={{ width: 'auto', marginRight: '5px' }}
                    /> Card (Online)
                  </label>
                </div>
              </div>

              <button type="submit">Book Now</button>
            </form>
          </div>

          {/* Booking History Card */}
          <div className="card">
            <h2>Booking History</h2>
            <div id="booking-history" style={{ maxHeight: '200px', overflowY: 'auto', padding: '10px 0' }}>
              {isHistoryLoading ? (
                <p>Loading booking history...</p>
              ) : bookingHistory.length === 0 ? (
                <p>No bookings yet.</p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                  {bookingHistory.map(booking => (
                    <li key={booking.id} style={{ borderBottom: '1px solid #eee', marginBottom: '10px', paddingBottom: '10px' }}>
                      <strong>{booking.type}</strong> ({booking.payment.toUpperCase()})
                      <br/>
                      <small>Booked: {booking.bookedOn}</small>
                      <br/>
                      <span style={{ color: booking.status === 'Pending' ? 'orange' : 'green', fontWeight: 'bold' }}>Status: {booking.status}</span>
                      <br/>
                      <small>Delivery by: {booking.deliveredBy}</small>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <button onClick={fetchBookingHistory} disabled={isHistoryLoading}>
              {isHistoryLoading ? 'Loading...' : 'Refresh History'}
            </button>
          </div>

          {/* Account Details Card */}
          <div className="card">
            <h2>Account Details</h2>
            <div id="account-details">
              {isLoading ? (
                <p>Loading account details...</p>
              ) : (
                <>
                  <p id="account-name">Name: {accountDetails.name}</p>
                  <p id="account-email">Email: {accountDetails.email}</p>
                  <p id="account-phone">Phone: {accountDetails.phone}</p>
                </>
              )}
            </div>
            <button>Edit Account</button>
          </div>
        </div>
      </div>
      <Footer /> {/* ✅ Add Footer */}
    </>
  );
};

export default Dashboard;