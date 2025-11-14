// middleware/auth.js
const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  let token;

  // Check for token in 'Authorization: Bearer <token>' header
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Attach the user ID to the request object
      req.userId = decoded.id; 
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

module.exports = { protect };