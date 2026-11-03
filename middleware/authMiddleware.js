const jwt = require("jsonwebtoken");

// Authentication middleware
const verifyToken = (req, res, next) => {
  try {
    // 1. Read Authorization header
    const authHeader = req.headers.authorization;

    // 2. Check whether token exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. Token is required.",
      });
    }

    // 3. Extract token
    const token = authHeader.split(" ")[1];

    // 4. Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // 5. Attach user information to request
    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
    };

    // 6. Continue to next middleware or route
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

// Authorization middleware
const requireRole = (requiredRole) => {
  return (req, res, next) => {

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
      });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({
        message: "Forbidden. Insufficient permissions.",
      });
    }

    next();
  };
};
module.exports = { verifyToken, requireRole, };