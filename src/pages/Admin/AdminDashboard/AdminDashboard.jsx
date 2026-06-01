import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import api from "../../../api/axios";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({});
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  async function fetchDashboard() {
    try {
      const dashboardRes = await api.get("/admin/dashboard");
      const usersRes = await api.get("/admin/users");

      setDashboard(dashboardRes.data || {});
      setUsers(usersRes.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load dashboard");
    }
  }

  async function handleApprove(id) {
    try {
      await api.post(`/admin/approve/${id}`);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Approve failed");
    }
  }

  async function handleReject(id) {
    try {
      await api.post(`/admin/reject/${id}`);
      fetchDashboard();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    }
  }

  function formatMoney(value) {
    return Number(value || 0).toLocaleString("en-US", {
      maximumFractionDigits: 0,
    });
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getUserStatus(user) {
    if (user.is_banned) return "Rejected";
    if (user.is_approved === 0 || user.is_approved === false) return "Pending";
    return "Active";
  }

  const normalUsers = users.filter((user) => user.role !== "admin");

  const allPendingRequests = normalUsers.filter(
    (u) =>
      (u.role === "restaurant" || u.role === "charity") &&
      (u.is_approved === 0 || u.is_approved === false)
  );

  const recentUsers = normalUsers.slice(0, 5);
  const pendingRequests = allPendingRequests.slice(0, 5);

  const chartData = [
    {
      name: "Users",
      value: normalUsers.length,
    },
    {
      name: "Food",
      value: dashboard.total_food || 0,
    },
    {
      name: "Claims",
      value: dashboard.total_claims || 0,
    },
    {
      name: "Donations",
      value: dashboard.total_donations || 0,
    },
  ];

  const pieData = [
    {
      name: "Claims",
      value: dashboard.total_claims || 0,
      color: "#22c55e",
    },
    {
      name: "Donations",
      value: dashboard.total_donations || 0,
      color: "#f59e0b",
    },
    {
      name: "Food",
      value: dashboard.total_food || 0,
      color: "#2d5016",
    },
  ];

  return (
    <div className="admin-dashboard">
      <div className="ad-header">
        <div>
          <h1 className="ad-title">Dashboard</h1>

          <p className="ad-sub">
            Welcome back! Monitor users, donations, food listings, and pending
            approvals.
          </p>
        </div>
      </div>

      <div className="ad-stats">
        <div className="ad-stat-card">
          <div className="ad-stat-icon" style={{ background: "#d4e8c2" }}>
            👥
          </div>

          <div>
            <div className="ad-stat-num">{normalUsers.length}</div>
            <div className="ad-stat-lbl">Total Users</div>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon" style={{ background: "#fef9e7" }}>
            📋
          </div>

          <div>
            <div className="ad-stat-num">{allPendingRequests.length}</div>
            <div className="ad-stat-lbl">Pending Requests</div>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon" style={{ background: "#d4e8c2" }}>
            🍽️
          </div>

          <div>
            <div className="ad-stat-num">{dashboard.total_food || 0}</div>
            <div className="ad-stat-lbl">Food Listings</div>
          </div>
        </div>

        <div className="ad-stat-card">
          <div className="ad-stat-icon" style={{ background: "#fef9e7" }}>
            💰
          </div>

          <div>
            <div className="ad-stat-num">
              {formatMoney(dashboard.total_amount)} EGP
            </div>
            <div className="ad-stat-lbl">Donations</div>
          </div>
        </div>
      </div>

      <div className="ad-charts">
        <div className="ad-chart-card">
          <div className="ad-chart-header">
            <h2 className="ad-chart-title">Platform Statistics</h2>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#2d5016"
                strokeWidth={2.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="ad-chart-card">
          <div className="ad-chart-header">
            <h2 className="ad-chart-title">Activity Distribution</h2>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>

              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="ad-table-section">
        <div className="ad-table-header">
          <h2 className="ad-section-title">Recent Users</h2>

          <button
            className="ad-view-all"
            onClick={() => navigate("/admin/users")}
          >
            View All →
          </button>
        </div>

        <div className="ad-table">
          <div className="ad-table-head ad-users-head">
            <span>Name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Status</span>
            <span>Joined</span>
          </div>

          {recentUsers.length === 0 ? (
            <div className="ad-empty-row">No users found</div>
          ) : (
            recentUsers.map((user) => (
              <div key={user.id} className="ad-table-row ad-users-row">
                <span className="ad-user-name">{user.name}</span>
                <span className="ad-user-email">{user.email}</span>
                <span className="ad-user-role">{user.role}</span>

                <span>
                  <span
                    className={`ad-status ${
                      getUserStatus(user) === "Active"
                        ? "active"
                        : getUserStatus(user) === "Pending"
                        ? "pending"
                        : "inactive"
                    }`}
                  >
                    {getUserStatus(user)}
                  </span>
                </span>

                <span className="ad-user-joined">
                  {formatDate(user.created_at)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="ad-table-section">
        <div className="ad-table-header">
          <h2 className="ad-section-title">Pending Registration Requests</h2>

          <button
            className="ad-view-all"
            onClick={() => navigate("/admin/registration-requests")}
          >
            View All →
          </button>
        </div>

        <div className="ad-table">
          <div className="ad-table-head ad-requests-head">
            <span>Name</span>
            <span>Type</span>
            <span>Email</span>
            <span>Joined</span>
            <span>Actions</span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="ad-empty-row">No pending requests</div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.id} className="ad-table-row ad-requests-row">
                <span className="ad-user-name">{req.name}</span>

                <span className="ad-user-role">
                  {req.role === "charity" ? "Charity" : "Restaurant"}
                </span>

                <span className="ad-user-email">{req.email}</span>

                <span className="ad-user-joined">
                  {formatDate(req.created_at)}
                </span>

                <span className="ad-row-actions">
                  <button
                    className="ad-approve-btn"
                    onClick={() => handleApprove(req.id)}
                  >
                    ✓ Approve
                  </button>

                  <button
                    className="ad-reject-btn"
                    onClick={() => handleReject(req.id)}
                  >
                    ✕ Reject
                  </button>
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;