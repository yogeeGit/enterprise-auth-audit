
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const app = express();
const PORT = process.env.PORT || 5000;
const {
  verifyToken,
  requireRole,
} = require("./middleware/authMiddleware");
const assetRoutes = require("./routes/assetRoutes");
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/assets", assetRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Enterprise Asset & Audit API is running",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT 1 AS result");

    res.status(200).json({
      status: "OK",
      database: "Connected",
      result: rows[0].result,
    });
  } catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(503).json({
      status: "ERROR",
      database: "Unavailable",
    });
  }
});
// Any authenticated user can access
app.get("/api/protected", verifyToken, (req, res) => {
  res.status(200).json({
    message: "You accessed a protected route",
    user: req.user,
  });
});

// Only Admin can access
app.get(
  "/api/admin",
  verifyToken,
  requireRole("Admin"),
  (req, res) => {
    res.status(200).json({
      message: "Welcome Admin",
      user: req.user,
    });
  }
);
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
