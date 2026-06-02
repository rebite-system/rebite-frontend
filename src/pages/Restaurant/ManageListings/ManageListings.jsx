import { useEffect, useState } from "react";
import "./ManageListings.css";
import api from "../../../api/axios";

function ManageListings() {
  const [listings, setListings] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    quantity: "",
    pickup_from: "",
    pickup_until: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchListings();
  }, []);
  useEffect(() => {
  const hasPendingAI = listings.some(
    (item) =>
      item.status === "active" &&
      !item.ai_priority_level
  );

  if (!hasPendingAI) return;

  const interval = setInterval(() => {
    fetchListings();
  }, 5000);

  return () => clearInterval(interval);
}, [listings]);

  async function fetchListings() {
    try {
      setLoading(true);

      const res = await api.get("/foods");
      const data = res.data.data?.data || res.data.data || [];

      const sortedData = [...data].sort((a, b) => {
        return getBadgeRank(a) - getBadgeRank(b);
      });

      setListings(sortedData);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setMessage("Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }

  function cleanTime(time) {
    return time ? time.slice(0, 5) : "";
  }

  function formatTime(from, until) {
    if (!from && !until) return "—";

    return `${from ? from.slice(0, 5) : "—"} – ${
      until ? until.slice(0, 5) : "—"
    }`;
  }

  function formatCategory(category) {
    const names = {
      cooked_meals: "Cooked Meals",
      bakery: "Bread & Bakery",
      vegetables_fruits: "Vegetables & Fruits",
      dairy: "Dairy Products",
      other: "Other",
    };

    return names[category] || "No category";
  }

  function getPickupDeadline(item) {
    if (!item.pickup_until) return null;

    const baseDate = item.created_at ? new Date(item.created_at) : new Date();

    const [untilH, untilM] = item.pickup_until
      .slice(0, 5)
      .split(":")
      .map(Number);

    const deadline = new Date(baseDate);
    deadline.setHours(untilH, untilM, 0, 0);

    if (item.pickup_from) {
      const [fromH, fromM] = item.pickup_from
        .slice(0, 5)
        .split(":")
        .map(Number);

      const start = new Date(baseDate);
      start.setHours(fromH, fromM, 0, 0);

      if (deadline < start) {
        deadline.setDate(deadline.getDate() + 1);
      }
    }

    return deadline;
  }

  function isExpired(item) {
    const deadline = getPickupDeadline(item);
    return deadline ? deadline <= new Date() : false;
  }

  function getBadge(item) {
    if (item.status === "reserved") return "Reserved";
    if (item.status === "expired" || isExpired(item)) return "Expired";

    const priority = item.ai_priority_level?.toLowerCase();

    if (priority === "high") return "High";
    if (priority === "medium") return "Medium";
    if (priority === "low") return "Low";

    if (item.status === "collected") return "Collected";

    return "Low";
  }

  function getBadgeRank(item) {
    const badge = getBadge(item);

    if (badge === "High") return 1;
    if (badge === "Medium") return 2;
    if (badge === "Low") return 3;
    if (badge === "Collected") return 4;
    if (badge === "Reserved") return 5;
    if (badge === "Expired") return 6;

    return 99;
  }

  function getExpiryDateTime(from, until) {
    const now = new Date();

    const [fromHour, fromMinute] = from.split(":").map(Number);
    const [untilHour, untilMinute] = until.split(":").map(Number);

    const expiryDate = new Date(now);
    expiryDate.setHours(untilHour, untilMinute, 0, 0);

    if (
      untilHour < fromHour ||
      (untilHour === fromHour && untilMinute <= fromMinute)
    ) {
      expiryDate.setDate(expiryDate.getDate() + 1);
    }

    const y = expiryDate.getFullYear();
    const m = String(expiryDate.getMonth() + 1).padStart(2, "0");
    const d = String(expiryDate.getDate()).padStart(2, "0");
    const h = String(expiryDate.getHours()).padStart(2, "0");
    const min = String(expiryDate.getMinutes()).padStart(2, "0");

    return `${y}-${m}-${d} ${h}:${min}:00`;
  }

  function openEditForm(item) {
    setEditItem(item);

    setForm({
      title: item.title || "",
      category: item.category || "",
      quantity: item.quantity || "",
      pickup_from: cleanTime(item.pickup_from),
      pickup_until: cleanTime(item.pickup_until),
      notes: item.notes || "",
    });

    setErrors({});
    setMessage("");
  }

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  }

  function validate() {
    const newErrors = {};

    if (!form.title.trim()) newErrors.title = "Food name is required";

    if (!form.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (Number(form.quantity) <= 0) {
      newErrors.quantity = "Quantity must be more than 0";
    }

    if (!form.pickup_from) newErrors.pickup_from = "Pickup start time is required";
    if (!form.pickup_until) newErrors.pickup_until = "Pickup end time is required";

    return newErrors;
  }

  async function handleSave(e) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      const expiry = getExpiryDateTime(form.pickup_from, form.pickup_until);

      const res = await api.put(`/food/${editItem.id}`, {
        title: form.title,
        category: form.category,
        quantity: form.quantity,
        pickup_from: form.pickup_from,
        pickup_until: form.pickup_until,
        expiry,
        notes: form.notes,
      });

      setListings((prev) =>
        prev
          .map((item) => (item.id === editItem.id ? res.data.data : item))
          .sort((a, b) => getBadgeRank(a) - getBadgeRank(b))
      );

      setEditItem(null);
      setMessage("Listing updated successfully 💚");
    } catch (err) {
      console.log(err.response?.data || err.message);

      setErrors({
        general:
          err.response?.data?.message ||
          "Update failed. Please try again.",
      });
    }
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/food/${id}`);

      setListings((prev) => prev.filter((item) => item.id !== id));

      setDeleteId(null);
      setMessage("Listing deleted successfully.");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setMessage("Delete failed. Please try again.");
    }
  }

  const activeCount = listings.filter((item) => {
    const badge = getBadge(item);
    return badge === "High" || badge === "Medium" || badge === "Low";
  }).length;

  const totalPortions = listings.reduce((sum, item) => {
    return sum + Number(item.quantity || 0);
  }, 0);

  return (
    <div className="manage-menu">
      <div className="mm-header">
        <div>
          <p className="mm-kicker">Restaurant listings</p>
          <h1 className="mm-title">Manage Listings</h1>
          <p className="mm-sub">
            Edit, track, or remove your surplus food listings.
          </p>
        </div>

        <button className="mm-refresh-icon" onClick={fetchListings} title="Refresh">
          ↻
        </button>
      </div>

      {message && <div className="mm-message">{message}</div>}

      <div className="mm-stats">
        <div className="mm-stat">
          <span className="mm-stat-num">{activeCount}</span>
          <span className="mm-stat-lbl">Active Listings</span>
        </div>

        <div className="mm-stat">
          <span className="mm-stat-num">{listings.length}</span>
          <span className="mm-stat-lbl">Total Records</span>
        </div>

        <div className="mm-stat">
          <span className="mm-stat-num">{totalPortions}</span>
          <span className="mm-stat-lbl">Total Portions</span>
        </div>
      </div>

      {loading ? (
        <div className="mm-empty">
          <div className="mm-empty-title">Loading listings...</div>
        </div>
      ) : listings.length === 0 ? (
        <div className="mm-empty">
          <div className="mm-empty-icon">📦</div>
          <div className="mm-empty-title">No listings yet</div>
          <div className="mm-empty-sub">
            Add your first surplus food listing.
          </div>
        </div>
      ) : (
        <div className="mm-table">
          <div className="mm-table-header">
            <span>Food</span>
            <span>Category</span>
            <span>Portions</span>
            <span>Pickup</span>
            <span>Status</span>
            <span>Notes</span>
            <span>Actions</span>
          </div>

          {listings.map((item) => {
            const badge = getBadge(item);

            return (
              <div key={item.id} className="mm-row">
                <div>
                  <span className="mm-item-name">{item.title}</span>
                </div>

                <span className="mm-category">
                  {formatCategory(item.category)}
                </span>

                <span className="mm-portions">
                  {item.quantity} portions
                </span>

                <span className="mm-time">
                  🕐 {formatTime(item.pickup_from, item.pickup_until)}
                </span>

                <span className={`priority-badge ${badge.toLowerCase()}`}>
                  {badge}
                </span>

                <span className="mm-notes">{item.notes || "—"}</span>

                <span className="mm-actions">
                  <button className="mm-edit-btn" onClick={() => openEditForm(item)}>
                    Edit
                  </button>

                  <button className="mm-delete-btn" onClick={() => setDeleteId(item.id)}>
                    Delete
                  </button>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {editItem && (
        <div className="mm-overlay" onClick={() => setEditItem(null)}>
          <div className="mm-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="mm-modal-title">Edit Listing</h2>

            {errors.general && <div className="mm-error-box">{errors.general}</div>}

            <form onSubmit={handleSave} className="mm-form">
              <div className="mm-field">
                <label className="mm-label">Food Name</label>
                <input
                  className="mm-input"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                />
                {errors.title && <p className="mm-error">{errors.title}</p>}
              </div>

              <div className="mm-field">
                <label className="mm-label">Category</label>
                <select
                  className="mm-input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="cooked_meals">Cooked Meals</option>
                  <option value="bakery">Bread & Bakery</option>
                  <option value="vegetables_fruits">Vegetables & Fruits</option>
                  <option value="dairy">Dairy Products</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="mm-field">
                <label className="mm-label">Number of Portions</label>
                <input
                  className="mm-input"
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min="1"
                />
                {errors.quantity && <p className="mm-error">{errors.quantity}</p>}
              </div>

              <div className="mm-row-fields">
                <div className="mm-field">
                  <label className="mm-label">Pickup From</label>
                  <input
                    className="mm-input"
                    type="time"
                    name="pickup_from"
                    value={form.pickup_from}
                    onChange={handleChange}
                  />
                  {errors.pickup_from && (
                    <p className="mm-error">{errors.pickup_from}</p>
                  )}
                </div>

                <div className="mm-field">
                  <label className="mm-label">Pickup Until</label>
                  <input
                    className="mm-input"
                    type="time"
                    name="pickup_until"
                    value={form.pickup_until}
                    onChange={handleChange}
                  />
                  {errors.pickup_until && (
                    <p className="mm-error">{errors.pickup_until}</p>
                  )}
                </div>
              </div>

              <div className="mm-field">
                <label className="mm-label">Notes</label>
                <textarea
                  className="mm-input mm-textarea"
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="mm-modal-actions">
                <button
                  type="button"
                  className="mm-btn-secondary"
                  onClick={() => setEditItem(null)}
                >
                  Cancel
                </button>

                <button type="submit" className="mm-btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="mm-overlay" onClick={() => setDeleteId(null)}>
          <div className="mm-modal mm-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="mm-confirm-icon">Delete</div>

            <h2 className="mm-modal-title">Delete Listing?</h2>

            <p className="mm-confirm-sub">
              This listing will be removed permanently.
            </p>

            <div className="mm-modal-actions">
              <button className="mm-btn-secondary" onClick={() => setDeleteId(null)}>
                Cancel
              </button>

              <button className="mm-btn-danger" onClick={() => handleDelete(deleteId)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageListings;