const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Body parser for JSON
app.use(cors()); // Enable CORS for client requests

// Default/Health Check Route
app.get('/', (req, res) => {
  res.send('Gas Booking System API is running.');
});

// Routes
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);
const bookingRoutes = require("./routes/booking"); // ✅ NEW: Import Booking Routes
app.use("/api/booking", bookingRoutes); // ✅ NEW: Use Booking Routes

// MongoDB connection
// Removed deprecated options: { useNewUrlParser: true, useUnifiedTopology: true }
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Connection Failed:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));