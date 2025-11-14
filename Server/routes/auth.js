const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Ensure this path is correct

const router = express.Router();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{6,}$/;

// Register
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Input Validation (Correctly kept here for the RAW password)
    if (!name || name.length < 3) return res.status(400).json({ message: "Name must be at least 3 characters" });
    if (!emailRegex.test(email)) return res.status(400).json({ message: "Invalid email format" });
    if (!/^[0-9]{10}$/.test(phone)) return res.status(400).json({ message: "Phone must be 10 digits" });
    if (!passwordRegex.test(password)) return res.status(400).json({ message: "Password must be 6+ chars, 1 number, 1 special char" });

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(400).json({ message: `Account already exists with this ${existingUser.email === email ? "email" : "phone number"}` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, phone, password: hashedPassword });
    await newUser.save();
    res.json({ message: "✅ User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err); 
    res.status(500).json({ message: "Server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ message: "Email/Phone and password required" });

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(400).json({ message: "User not found. Please register first." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid password" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ message: "✅ Login successful", token, user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) return res.status(400).json({ message: "Email or Phone is required" });

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(400).json({ message: "Account not found" });

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "15m" });
    // Note: In a production app, you would typically email this token to the user's email address.
    res.json({ message: "Reset token generated. Use it to reset password.", resetToken });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Get User Details (Endpoint for Token Validation)
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("name email phone");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    // Catches expired/invalid token
    res.status(401).json({ message: "Invalid or expired token" });
  }
});

module.exports = router;