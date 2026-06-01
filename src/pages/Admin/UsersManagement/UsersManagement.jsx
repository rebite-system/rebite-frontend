import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./UsersManagement.css";

function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [loading, setLoading] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(user) {
    setSelectedUser({
      id: user.id,
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      location: user.location || "",
      role: user.role || "charity",
      is_approved: user.is_approved === 1 || user.is_approved === true,
      is_banned: user.is_banned === 1 || user.is_banned === true,
    });

    setShowEditModal(true);
  }

  function closeEditModal() {
    setSelectedUser(null);
    setShowEditModal(false);
  }

  function handleEditChange(e) {
    const { name, value, type, checked } = e.target;

    setSelectedUser((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSaveUser() {
    try {
      await api.put(`/admin/users/${selectedUser.id}`, selectedUser);
      closeEditModal();
      fetchUsers();
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert(err.response?.data?.message || "Update failed");
    }
  }

  async function toggleBan(user) {
    const isBanned = user.is_banned === 1 || user.is_banned === true;

    try {
      await api.post(isBanned ? `/admin/unban/${user.id}` : `/admin/ban/${user.id}`);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Action failed");
    }
  }

  function getStatus(user) {
    if (user.is_banned === 1 || user.is_banned === true) return "Inactive";
    if (user.is_approved === 0 || user.is_approved === false) return "Pending";
    return "Active";
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  const filtered = users
    .filter((u) => u.role !== "admin")
    .filter((u) => {
      const q = search.toLowerCase();

      const status = getStatus(u).toLowerCase();

      const matchSearch =
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q);

      const matchRole =
        roleFilter === "All Roles" || u.role === roleFilter.toLowerCase();

      const matchStatus =
        statusFilter === "All Status" ||
        status === statusFilter.toLowerCase();

      return matchSearch && matchRole && matchStatus;
    });

  return (
    <div className="users-management">
      <div className="um-header">
        <div>
          <h1 className="um-title">Users Management</h1>
          <p className="um-sub">
            View, search, edit, activate, and deactivate platform users.
          </p>
        </div>
      </div>

      <div className="um-filters">
        <div className="um-search">
          <span>🔍</span>

          <input
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button className="um-clear-search" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <select
          className="um-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option>All Roles</option>
          <option>Charity</option>
          <option>Restaurant</option>
        </select>

        <select
          className="um-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All Status</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Inactive</option>
        </select>
      </div>

      <div className="um-table-wrapper">
        <div className="um-table">
          <div className="um-table-head">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined On</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="um-empty">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="um-empty">No users found</div>
          ) : (
            filtered.map((user) => {
              const isBanned = user.is_banned === 1 || user.is_banned === true;
              const status = getStatus(user);

              return (
                <div key={user.id} className="um-table-row">
                  <span className="um-user-name">{user.name}</span>

                  <span className="um-user-email">{user.email}</span>

                  <span className="um-user-role">{user.role}</span>

                  <span>
                    <div className={`um-status ${status.toLowerCase()}`}>
                      {status}
                    </div>
                  </span>

                  <span className="um-user-joined">
                    {formatDate(user.created_at)}
                  </span>

                  <span className="um-actions">
                    <button
                      className="um-edit-btn"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>

                    <button
                      className={`um-toggle-btn ${
                        isBanned ? "activate" : "deactivate"
                      }`}
                      onClick={() => toggleBan(user)}
                    >
                      {isBanned ? "Unban" : "Ban"}
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="um-table-footer">
          Showing {filtered.length} users
        </div>
      </div>

      {showEditModal && selectedUser && (
        <div className="um-overlay" onClick={closeEditModal}>
          <div className="um-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="um-modal-title">Edit User</h2>
            <p className="um-modal-sub">
              Update user account information and access status.
            </p>

            <div className="um-form-grid">
              <div className="um-field">
                <label className="um-label">Name</label>
                <input
                  className="um-input"
                  name="name"
                  value={selectedUser.name}
                  onChange={handleEditChange}
                />
              </div>

              <div className="um-field">
                <label className="um-label">Email</label>
                <input
                  className="um-input"
                  name="email"
                  type="email"
                  value={selectedUser.email}
                  onChange={handleEditChange}
                />
              </div>

              <div className="um-field">
                <label className="um-label">Phone</label>
                <input
                  className="um-input"
                  name="phone"
                  value={selectedUser.phone}
                  onChange={handleEditChange}
                />
              </div>

              <div className="um-field">
                <label className="um-label">Location</label>
                <input
                  className="um-input"
                  name="location"
                  value={selectedUser.location}
                  onChange={handleEditChange}
                />
              </div>

              <div className="um-field">
                <label className="um-label">Role</label>
                <select
                  className="um-input"
                  name="role"
                  value={selectedUser.role}
                  onChange={handleEditChange}
                >
                  <option value="charity">Charity</option>
                  <option value="restaurant">Restaurant</option>
                  <option value="donor">donor</option>
                </select>
              </div>

              <div className="um-field">
                <label className="um-label">Account Flags</label>

                <label className="um-check-row">
                  <input
                    type="checkbox"
                    name="is_approved"
                    checked={selectedUser.is_approved}
                    onChange={handleEditChange}
                  />
                  Approved account
                </label>

                <label className="um-check-row">
                  <input
                    type="checkbox"
                    name="is_banned"
                    checked={selectedUser.is_banned}
                    onChange={handleEditChange}
                  />
                  Banned account
                </label>
              </div>
            </div>

            <div className="um-modal-actions">
              <button className="um-btn-secondary" onClick={closeEditModal}>
                Cancel
              </button>

              <button className="um-btn-primary" onClick={handleSaveUser}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersManagement;