import { useEffect, useState } from "react";
import useAuth from "../hooks/useAuth";
import apiRequest from "../services/api";
import "../styles/Dashboard.css";

function Dashboard() {
  const { user, token, logout } = useAuth();

  const [assets, setAssets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingAssetId, setUpdatingAssetId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
const [newAssetName, setNewAssetName] = useState("");
const [newSerialNumber, setNewSerialNumber] = useState("");
const [createError, setCreateError] = useState("");
const [isCreating, setIsCreating] = useState(false);
const [deletingAssetId, setDeletingAssetId] = useState(null);
const [deleteError, setDeleteError] = useState("");
  // Fetch assets from backend
  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await apiRequest("/api/assets", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const assetList = Array.isArray(result)
        ? result
        : result.assets;

      if (!Array.isArray(assetList)) {
        throw new Error("Unexpected asset response from server.");
      }

      setAssets(assetList);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
const handleStatusChange = async (assetId, newStatus) => {
  try {
    setUpdatingAssetId(assetId);
    setActionError("");

    const result = await apiRequest(
      `/api/assets/${assetId}/status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      }
    );

    setAssets((previousAssets) =>
      previousAssets.map((asset) =>
        asset.id === assetId
          ? { ...asset, status: result.asset.status }
          : asset
      )
    );
  } catch (error) {
    setActionError(error.message);
  } finally {
    setUpdatingAssetId(null);
  }
};

const handleCreateAsset = async (event) => {
  event.preventDefault();

  try {
    setIsCreating(true);
    setCreateError("");

    const result = await apiRequest("/api/assets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        asset_name: newAssetName.trim(),
        serial_number: newSerialNumber.trim(),
      }),
    });

    setNewAssetName("");
    setNewSerialNumber("");
    setShowAddForm(false);

    await fetchAssets();
  } catch (error) {
    setCreateError(error.message);
  } finally {
    setIsCreating(false);
  }
};

const handleDeleteAsset = async (assetId) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this asset?"
  );

  if (!confirmed) return;

  try {
    setDeletingAssetId(assetId);
    setDeleteError("");

    await apiRequest(`/api/assets/${assetId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setAssets((previousAssets) =>
      previousAssets.filter((asset) => asset.id !== assetId)
    );
  } catch (error) {
    setDeleteError(error.message);
  } finally {
    setDeletingAssetId(null);
  }
};

  useEffect(() => {
    fetchAssets();
  }, []);

  // Search and filter assets
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.asset_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      asset.serial_number
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ||
      asset.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate dashboard summary
  const totalAssets = assets.length;

  const availableAssets = assets.filter(
    (asset) => asset.status === "Available"
  ).length;

  const assignedAssets = assets.filter(
    (asset) => asset.status === "Assigned"
  ).length;

  const maintenanceAssets = assets.filter(
    (asset) => asset.status === "Maintenance"
  ).length;

  return (
    <div className="dashboard-page">

      {/* Header */}
      <header className="dashboard-header">
        <div>
          <h1>Enterprise Asset Portal</h1>
          <p>Asset Management Dashboard</p>
        </div>

        <div className="user-section">
          <div className="user-details">
            <span>{user?.email}</span>
            <span className="role-label">{user?.role}</span>
          </div>

          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">

        {/* Loading and Error Messages */}
        {isLoading && (
          <p>Loading assets...</p>
        )}

        {error && (
          <div>
            <p className="form-error">{error}</p>
            <button onClick={fetchAssets}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {/* Summary Cards */}
            <section className="summary-grid">

              <div className="summary-card">
                <p>Total Assets</p>
                <h2>{totalAssets}</h2>
              </div>

              <div className="summary-card available-card">
                <p>Available</p>
                <h2>{availableAssets}</h2>
              </div>

              <div className="summary-card assigned-card">
                <p>Assigned</p>
                <h2>{assignedAssets}</h2>
              </div>

              <div className="summary-card maintenance-card">
                <p>Maintenance</p>
                <h2>{maintenanceAssets}</h2>
              </div>

            </section>

            {/* Asset Inventory */}
            <section className="inventory-section">

              <div className="inventory-heading">
                <div>
                  <h2>Asset Inventory</h2>
                  <p>View and manage company assets</p>
                </div>

                <span className="asset-count">
                  {filteredAssets.length} assets found
                </span>
                {user?.role === "Admin" && (
                    <button
                        onClick={() => {
                        setShowAddForm(!showAddForm);
                        setCreateError("");
                        }}
                    >
                        {showAddForm ? "Cancel" : "Add Asset"}
                    </button>
                    )}
              </div>
              {showAddForm && user?.role === "Admin" && (
                <form onSubmit={handleCreateAsset}>
                    <div className="form-group">
                    <label htmlFor="assetName">Asset Name</label>
                    <input
                        id="assetName"
                        type="text"
                        value={newAssetName}
                        onChange={(event) =>
                        setNewAssetName(event.target.value)
                        }
                        placeholder="Enter asset name"
                        required
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="serialNumber">Serial Number</label>
                    <input
                        id="serialNumber"
                        type="text"
                        value={newSerialNumber}
                        onChange={(event) =>
                        setNewSerialNumber(event.target.value)
                        }
                        placeholder="Enter serial number"
                        required
                    />
                    </div>

                    {createError && (
                    <p className="form-error">{createError}</p>
                    )}

                    <button type="submit" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Asset"}
                    </button>
                </form>
                )}

              {/* Search and Filter */}
              <div className="filter-section">

                <input
                  type="text"
                  placeholder="Search by asset name or serial number..."
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="Assigned">Assigned</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Retired">Retired</option>
                </select>

              </div>

              {/* Asset Table */}
              {actionError && (
              <p className="form-error">{actionError}</p>
               )}
               {deleteError && (
                <p className="form-error">{deleteError}</p>
                )}
              <div className="table-container">
                <table className="asset-table">

                  <thead>
                    <tr>
                      <th>Asset Name</th>
                      <th>Serial Number</th>
                      <th>Status</th>
                      <th>Assigned To</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredAssets.length > 0 ? (
                      filteredAssets.map((asset) => (
                        <tr key={asset.id}>
                          <td>{asset.asset_name}</td>
                          <td>{asset.serial_number}</td>

                          <td>
                            <select
                                className="status-select"
                                value={asset.status}
                                disabled={updatingAssetId === asset.id}
                                onChange={(event) =>
                                handleStatusChange(asset.id, event.target.value)
                                }
                            >
                                <option value="Available">Available</option>
                                <option value="Assigned">Assigned</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Retired">Retired</option>
                            </select>

                            {updatingAssetId === asset.id && (
                                <small>Updating...</small>
                            )}
                          </td>

                          <td>
                            {asset.assigned_to || "Unassigned"}
                          </td>
                          <td>
                            {user?.role === "Admin" ? (
                                <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                disabled={deletingAssetId === asset.id}
                                >
                                {deletingAssetId === asset.id ? "Deleting..." : "Delete"}
                                </button>
                            ) : (
                                "—"
                            )}
                            </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="empty-message">
                          No assets found.
                        </td>
                      </tr>
                    )}
                  </tbody>

                </table>
              </div>

            </section>
          </>
        )}

      </main>
    </div>
  );
}

export default Dashboard;