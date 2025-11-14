// backend/routes/booking.js

const express = require("express");
const jwt = require("jsonwebtoken");
const Booking = require("../models/Booking");

const router = express.Router();

// Middleware to protect routes and extract userId (Assuming this is already defined)
const protect = (req, res, next) => {
  const token = req.headers.authorization?.split("Bearer ")[1];
  if (!token) return res.status(401).json({ message: "No token provided, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; 
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
};

// POST /api/booking/book - Book a new cylinder (UPDATED)
router.post("/book", protect, async (req, res) => {
  try {
    const { cylinderType, paymentMethod } = req.body;
    
    if (!cylinderType || !['5kg', '14.2kg', '19kg'].includes(cylinderType)) {
      return res.status(400).json({ message: "Invalid cylinder type selected." });
    }
    if (!paymentMethod || !['cash', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: "Invalid payment method selected." });
    }

    // ✅ CALCULATE AND SAVE DELIVERY DATE (e.g., 3 days from now)
    const bookingTime = new Date();
    const deliveryDate = new Date(bookingTime);
    deliveryDate.setDate(deliveryDate.getDate() + 3); // Estimate delivery 3 days later

    const newBooking = new Booking({
      userId: req.userId,
      cylinderType,
      paymentMethod,
      bookingDate: bookingTime,
      deliveryDate: deliveryDate, // ✅ Save the calculated date
      status: 'Pending', // Default status is saved
    });

    await newBooking.save();

    res.status(201).json({ 
      message: "Cylinder booked successfully!",
      booking: {
        type: newBooking.cylinderType,
        payment: newBooking.paymentMethod,
        date: newBooking.bookingDate.toISOString().split('T')[0],
        deliveredBy: newBooking.deliveryDate.toISOString().split('T')[0], // Return saved date
        status: newBooking.status
      }
    });

  } catch (err) {
    console.error("Booking error:", err);
    res.status(500).json({ message: "Server error during booking." });
  }
});

// GET /api/booking/history - Get all bookings for the authenticated user (UPDATED)
router.get("/history", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.userId })
                                  .sort({ bookingDate: -1 }); 

    if (bookings.length === 0) {
      return res.status(200).json({ message: "No bookings found.", bookings: [] });
    }

    // ✅ Map data from the saved document (no recalculation needed)
    const history = bookings.map(booking => {
      return {
        id: booking._id,
        type: booking.cylinderType,
        payment: booking.paymentMethod,
        status: booking.status,
        bookedOn: booking.bookingDate.toISOString().split('T')[0],
        deliveredBy: booking.deliveryDate.toISOString().split('T')[0], // Retrieve saved date
      };
    });

    res.status(200).json({ history });
  } catch (err) {
    console.error("Error fetching booking history:", err);
    res.status(500).json({ message: "Server error while fetching history." });
  }
});

module.exports = router;