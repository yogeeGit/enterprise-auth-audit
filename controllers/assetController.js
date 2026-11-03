const pool = require("../config/db");

// GET /api/assets
// Admin and Operator can view assets
const getAssets = async (req, res) => {
  try {
    const [assets] = await pool.execute(
      `SELECT
         a.id,
         a.asset_name,
         a.serial_number,
         a.status,
         a.assigned_to_user_id,
         a.created_at,
         a.updated_at,
         u.email AS assigned_to_email
       FROM assets a
       LEFT JOIN users u
         ON a.assigned_to_user_id = u.id
       ORDER BY a.id DESC`
    );

    return res.status(200).json({
      count: assets.length,
      assets,
    });
  } catch (error) {
    console.error("Get assets error:", error.message);

    return res.status(500).json({
      message: "Failed to retrieve assets",
    });
  }
};

// POST /api/assets
// Admin only
const createAsset = async (req, res) => {
  const { asset_name, serial_number } = req.body || {};

  if (
    typeof asset_name !== "string" ||
    typeof serial_number !== "string" ||
    !asset_name.trim() ||
    !serial_number.trim()
  ) {
    return res.status(400).json({
      message: "Asset name and serial number are required",
    });
  }

  const assetName = asset_name.trim();
  const serialNumber = serial_number.trim();

  if (assetName.length > 255 || serialNumber.length > 100) {
    return res.status(400).json({
      message: "Asset name or serial number is too long",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.execute(
      `INSERT INTO assets (asset_name, serial_number)
       VALUES (?, ?)`,
      [assetName, serialNumber]
    );

    await connection.execute(
      `INSERT INTO audit_logs (user_id, action)
       VALUES (?, ?)`,
      [
        req.user.id,
        `Created asset: ${assetName} (${serialNumber})`,
      ]
    );

    await connection.commit();

    return res.status(201).json({
      message: "Asset created successfully",
      asset: {
        id: result.insertId,
        asset_name: assetName,
        serial_number: serialNumber,
        status: "Available",
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Create asset error:", error.message);

    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        message: "Serial number already exists",
      });
    }

    return res.status(500).json({
      message: "Failed to create asset",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// PATCH /api/assets/:id/status
// Admin and Operator can update status
const updateAssetStatus = async (req, res) => {
  const assetId = Number(req.params.id);
  const { status } = req.body || {};

  const allowedStatuses = [
    "Available",
    "Assigned",
    "Maintenance",
    "Retired",
  ];

  if (!Number.isSafeInteger(assetId) || assetId <= 0) {
    return res.status(400).json({
      message: "Invalid asset ID",
    });
  }

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid asset status",
      allowedStatuses,
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [assets] = await connection.execute(
      "SELECT id, asset_name, status FROM assets WHERE id = ? FOR UPDATE",
      [assetId]
    );

    if (assets.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const asset = assets[0];

    await connection.execute(
      "UPDATE assets SET status = ? WHERE id = ?",
      [status, assetId]
    );

    await connection.execute(
      `INSERT INTO audit_logs (user_id, action)
       VALUES (?, ?)`,
      [
        req.user.id,
        `Updated asset ${asset.asset_name} (${asset.id}) status from ${asset.status} to ${status}`,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Asset status updated successfully",
      asset: {
        id: asset.id,
        asset_name: asset.asset_name,
        previous_status: asset.status,
        status,
      },
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Update asset status error:", error.message);

    return res.status(500).json({
      message: "Failed to update asset status",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

// DELETE /api/assets/:id
// Admin only
const deleteAsset = async (req, res) => {
  const assetId = Number(req.params.id);

  if (!Number.isSafeInteger(assetId) || assetId <= 0) {
    return res.status(400).json({
      message: "Invalid asset ID",
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const [assets] = await connection.execute(
      "SELECT id, asset_name, serial_number FROM assets WHERE id = ? FOR UPDATE",
      [assetId]
    );

    if (assets.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        message: "Asset not found",
      });
    }

    const asset = assets[0];

    await connection.execute(
      "DELETE FROM assets WHERE id = ?",
      [assetId]
    );

    await connection.execute(
      `INSERT INTO audit_logs (user_id, action)
       VALUES (?, ?)`,
      [
        req.user.id,
        `Deleted asset: ${asset.asset_name} (${asset.serial_number})`,
      ]
    );

    await connection.commit();

    return res.status(200).json({
      message: "Asset deleted successfully",
      deletedAssetId: assetId,
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Delete asset error:", error.message);

    return res.status(500).json({
      message: "Failed to delete asset",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

module.exports = {
  getAssets,
  createAsset,
  updateAssetStatus,
  deleteAsset,
};