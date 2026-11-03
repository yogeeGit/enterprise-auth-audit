const express = require("express");
const router = express.Router();

const {
  verifyToken,
  requireRole,
} = require("../middleware/authMiddleware");

const {
  getAssets,
  createAsset,
  updateAssetStatus,
  deleteAsset,
} = require("../controllers/assetController");

// All asset routes require authentication
router.use(verifyToken);

// Admin and Operator: view assets
router.get("/", getAssets);

// Admin only: create asset
router.post("/", requireRole("Admin"), createAsset);

// Admin and Operator: update asset status
router.patch("/:id/status", updateAssetStatus);

// Admin only: delete asset
router.delete("/:id", requireRole("Admin"), deleteAsset);

module.exports = router;