import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./FoodWasteMonitoring.css";

function FoodWasteMonitoring() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWaste, setSelectedWaste] = useState(null);

  useEffect(() => {
    fetchFoodWaste();
  }, []);

  async function fetchFoodWaste() {
    try {
      setLoading(true);
      const res = await api.get("/foods");
      const data = res.data.data?.data || res.data.data || res.data || [];
      setRecords(data);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load food waste data");
    } finally {
      setLoading(false);
    }
  }

  function formatCategory(category) {
    const names = {
      cooked_meals: "Cooked Meals",
      bakery: "Bread & Bakery",
      vegetables_fruits: "Vegetables & Fruits",
      dairy: "Dairy Products",
      other: "Other",
    };

    return names[category] || category || "Other";
  }

  function formatTime(time) {
    if (!time) return "—";
    return time.slice(0, 5);
  }

  function getPickupDeadline(record) {
    if (!record.pickup_until) return null;

    const baseDate = record.created_at ? new Date(record.created_at) : new Date();

    const [untilH, untilM] = record.pickup_until.slice(0, 5).split(":").map(Number);

    const deadline = new Date(baseDate);
    deadline.setHours(untilH, untilM, 0, 0);

    if (record.pickup_from) {
      const [fromH, fromM] = record.pickup_from.slice(0, 5).split(":").map(Number);

      const start = new Date(baseDate);
      start.setHours(fromH, fromM, 0, 0);

      if (deadline < start) {
        deadline.setDate(deadline.getDate() + 1);
      }
    }

    return deadline;
  }

  function getHoursLeft(record) {
    const deadline = getPickupDeadline(record);
    if (!deadline) return null;

    return (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  }

  function isExpired(record) {
    const hoursLeft = getHoursLeft(record);
    return hoursLeft !== null && hoursLeft <= 0;
  }

  function getTimeLeftText(record) {
    const deadline = getPickupDeadline(record);
    if (!deadline) return "—";

    const diffMs = deadline.getTime() - new Date().getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes <= 0) {
      const ago = Math.abs(diffMinutes);
      const h = Math.floor(ago / 60);
      const m = ago % 60;

      if (h === 0) return `Expired ${m}m ago`;
      return `Expired ${h}h ${m}m ago`;
    }

    const h = Math.floor(diffMinutes / 60);
    const m = diffMinutes % 60;

    if (h === 0) return `${m}m left`;
    return `${h}h ${m}m left`;
  }

function formatPickupWindow(record) {
  const from = formatTime(record.pickup_from);
  const until = formatTime(record.pickup_until);

  return `${from} → ${until}`;
}

  function getCurrentPriority(record) {
    if (isExpired(record)) return "Expired";

    const hoursLeft = getHoursLeft(record);

    if (hoursLeft === null) return "N/A";
    if (hoursLeft <= 3) return "High";
    if (hoursLeft <= 10) return "Medium";
    return "Low";
  }

  function getPriorityClass(record) {
    return getCurrentPriority(record).toLowerCase();
  }

  function getPriorityScore(record) {
    const priority = getCurrentPriority(record);

    if (priority === "Expired") return "N/A";
    if (priority === "High") return 90;
    if (priority === "Medium") return 60;
    if (priority === "Low") return 20;

    return 0;
  }

  function getPriorityReason(record) {
    const priority = getCurrentPriority(record);

    if (priority === "Expired") return "Pickup deadline has passed.";
    if (priority === "High") return "Less than 3 hours remaining.";
    if (priority === "Medium") return "Between 4 and 10 hours remaining.";
    if (priority === "Low") return "More than 10 hours remaining.";

    return "No analysis available.";
  }

  function getRecommendedAction(record) {
    const priority = getCurrentPriority(record);

    if (priority === "Expired") return "Remove from available listings.";
    if (priority === "High") return "Prioritize immediate pickup.";
    if (priority === "Medium") return "Arrange pickup soon.";
    if (priority === "Low") return "Normal monitoring.";

    return "No recommendation.";
  }

  const totalQuantity = records.reduce((acc, r) => acc + Number(r.quantity || 0), 0);

  const restaurantsCount = [
    ...new Set(records.map((r) => r.restaurant?.name)),
  ].filter(Boolean).length;

  const activeCount = records.filter((r) => !isExpired(r)).length;
  const expiredCount = records.filter((r) => isExpired(r)).length;

  const filtered = records.filter((r) => {
    const restaurant = r.restaurant?.name || "";
    const title = r.title || "";
    const category = formatCategory(r.category);
    const q = search.toLowerCase();

    const matchSearch =
      restaurant.toLowerCase().includes(q) ||
      title.toLowerCase().includes(q) ||
      category.toLowerCase().includes(q);

    const matchCategory =
      categoryFilter === "All Categories" ||
      category.toLowerCase() === categoryFilter.toLowerCase();

    return matchSearch && matchCategory;
  });
  const sortedFiltered = [...filtered].sort((a, b) => {
  const order = {
    High: 1,
    Medium: 2,
    Low: 3,
    Expired: 4,
    "N/A": 5,
  };

  const priorityA = getCurrentPriority(a);
  const priorityB = getCurrentPriority(b);

  if (order[priorityA] !== order[priorityB]) {
    return order[priorityA] - order[priorityB];
  }

  const hoursA = getHoursLeft(a);
  const hoursB = getHoursLeft(b);

  if (hoursA === null) return 1;
  if (hoursB === null) return -1;

  return hoursA - hoursB;
});

  return (
    <div className="food-waste-monitoring">
      <div className="fw-header">
        <div>
          <h1 className="fw-title">Food Waste Monitoring</h1>
          <p className="fw-sub">
            Monitor pickup deadlines, listing status, quantities, and AI priority.
          </p>
        </div>
      </div>

      <div className="fw-stats">
        <div className="fw-stat">
          <div className="fw-stat-num">{records.length}</div>
          <div className="fw-stat-lbl">Total Listings</div>
        </div>

        <div className="fw-stat">
          <div className="fw-stat-num" style={{ color: "#e74c3c" }}>
            {totalQuantity}
          </div>
          <div className="fw-stat-lbl">Total Quantity</div>
        </div>

        <div className="fw-stat">
          <div className="fw-stat-num" style={{ color: "#f39c12" }}>
            {restaurantsCount}
          </div>
          <div className="fw-stat-lbl">Restaurants</div>
        </div>

        <div className="fw-stat">
          <div className="fw-stat-num" style={{ color: "#27ae60" }}>
            {activeCount}
          </div>
          <div className="fw-stat-lbl">Active Listings</div>
        </div>

        <div className="fw-stat">
          <div className="fw-stat-num" style={{ color: "#c0392b" }}>
            {expiredCount}
          </div>
          <div className="fw-stat-lbl">Expired Listings</div>
        </div>
      </div>

      <div className="fw-filters">
        <div className="fw-search">
          <span>🔍</span>
          <input
            placeholder="Search restaurant, food, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button className="fw-clear-search" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <select
          className="fw-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option>All Categories</option>
          <option>Cooked Meals</option>
          <option>Bread & Bakery</option>
          <option>Vegetables & Fruits</option>
          <option>Dairy Products</option>
          <option>Other</option>
        </select>
      </div>

      <div className="fw-table-wrapper">
        <div className="fw-table">
          <div className="fw-table-head modern">
            <span>Restaurant</span>
            <span>Food</span>
            <span>Quantity</span>
            <span>Pickup Window</span>
            <span>Time Left</span>
            <span>Status</span>
            <span>AI Priority</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="fw-empty">Loading food waste data...</div>
          ) : filtered.length === 0 ? (
            <div className="fw-empty">No food listings found</div>
          ) : (
  sortedFiltered.map((r)=> {
              const expired = isExpired(r);
              const priority = getCurrentPriority(r);

              return (
                <div key={r.id} className="fw-table-row modern">
                  <span className="fw-restaurant-block">
                    <span className="fw-avatar">
                      {(r.restaurant?.name || "R").substring(0, 2).toUpperCase()}
                    </span>
                    <span className="fw-rest-text">
                      <strong>{r.restaurant?.name || "Restaurant"}</strong>
                    </span>
                  </span>

                  <span className="fw-food-block">
                    <strong>{r.title || "—"}</strong>
                    <small>{formatCategory(r.category)}</small>
                  </span>

                  <span className="fw-quantity-block">
                    <strong>{r.quantity || 0}</strong>
                    <small>portions</small>
                  </span>

                  <span className="fw-pickup-card">
  <div className="pickup-time">
    🕒 {formatPickupWindow(r)}
  </div>

  <div className="pickup-date">
    📅 {new Date(r.created_at).toLocaleDateString("en-GB")}
  </div>
</span>

                  <span className={expired ? "fw-time-expired" : "fw-time-left"}>
                    {getTimeLeftText(r)}
                  </span>

                  <span>
                    <div className={`fw-status ${expired ? "expired" : "active"}`}>
                      {expired ? "Expired" : "Active"}
                    </div>
                  </span>

                  <span>
                    <div className={`ai-badge ${getPriorityClass(r)}`}>
                      {priority}
                    </div>
                    <small className="fw-score">
                      Score: {getPriorityScore(r)}
                    </small>
                  </span>

                  <span className="fw-actions">
                    <button className="fw-view-btn" onClick={() => setSelectedWaste(r)}>
                      View Details
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="fw-table-footer">
          Showing {filtered.length} of {records.length} records
        </div>
      </div>

      {selectedWaste && (
        <div className="fw-overlay" onClick={() => setSelectedWaste(null)}>
          <div className="fw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="fw-modal-header">
              <div>
                <h2 className="fw-modal-title">Food Listing Details</h2>
                <p className="fw-modal-sub">
                  Pickup timing, current status, and AI priority analysis.
                </p>
              </div>

              <div
                className={`fw-status ${
                  isExpired(selectedWaste) ? "expired" : "active"
                }`}
              >
                {isExpired(selectedWaste) ? "Expired" : "Active"}
              </div>
            </div>

            <div className="fw-detail-grid">
              <div className="fw-detail-item">
                <span className="fw-detail-label">Restaurant</span>
                <span className="fw-detail-val">
                  {selectedWaste.restaurant?.name || "—"}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Food</span>
                <span className="fw-detail-val">{selectedWaste.title || "—"}</span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Category</span>
                <span className="fw-detail-val">
                  {formatCategory(selectedWaste.category)}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Quantity</span>
                <span className="fw-detail-val">
                  {selectedWaste.quantity || 0} portions
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Pickup Window</span>
                <span className="fw-detail-val">
                  {formatPickupWindow(selectedWaste)}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Time Left</span>
                <span className="fw-detail-val">{getTimeLeftText(selectedWaste)}</span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">AI Priority</span>
                <span className="fw-detail-val">
                  {getCurrentPriority(selectedWaste)}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">AI Score</span>
                <span className="fw-detail-val">
                  {getPriorityScore(selectedWaste)}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">AI Reason</span>
                <span className="fw-detail-val">
                  {getPriorityReason(selectedWaste)}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Recommended Action</span>
                <span className="fw-detail-val">
                  {getRecommendedAction(selectedWaste)}
                </span>
              </div>
            </div>

            <div className="fw-modal-actions">
              <button className="fw-close-btn" onClick={() => setSelectedWaste(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FoodWasteMonitoring;