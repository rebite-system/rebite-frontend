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

    const now = new Date();
    const [untilH, untilM] = record.pickup_until.split(":").map(Number);

    const deadline = new Date(now);
    deadline.setHours(untilH, untilM, 0, 0);

    if (record.pickup_from) {
      const [fromH, fromM] = record.pickup_from.split(":").map(Number);

      const pickupStart = new Date(now);
      pickupStart.setHours(fromH, fromM, 0, 0);

      if (deadline < pickupStart) {
        deadline.setDate(deadline.getDate() + 1);
      }
    }

    return deadline;
  }

  function isExpired(record) {
    const deadline = getPickupDeadline(record);
    return deadline ? deadline < new Date() : false;
  }

  function getTimeLeftText(record) {
    const deadline = getPickupDeadline(record);
    if (!deadline) return "—";

    const diffMs = deadline.getTime() - new Date().getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes <= 0) return "Expired";

    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;

    if (hours === 0) return `${minutes} min left`;
    return `${hours}h ${minutes}m left`;
  }

  function formatPickupWindow(record) {
    return `${formatTime(record.pickup_from)} → ${formatTime(
      record.pickup_until
    )}`;
  }

  function getDisplayPriority(record) {
    if (isExpired(record)) return "Expired";
    return record.ai_priority_level || "N/A";
  }

  function getPriorityClass(record) {
    if (isExpired(record)) return "expired";
    return record.ai_priority_level?.toLowerCase() || "na";
  }

  const totalQuantity = records.reduce((acc, r) => {
    return acc + Number(r.quantity || 0);
  }, 0);

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

  return (
    <div className="food-waste-monitoring">
      <div className="fw-header">
        <div>
          <h1 className="fw-title">Food Waste Monitoring</h1>
          <p className="fw-sub">
            Monitor pickup deadlines, listing status, quantities, and AI waste
            priority.
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
          <div className="fw-table-head">
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
            filtered.map((r) => {
              const expired = isExpired(r);

              return (
                <div key={r.id} className="fw-table-row">
                  <span className="fw-restaurant">
                    {r.restaurant?.name || "Restaurant"}
                  </span>

                  <span className="fw-food-type">{r.title || "—"}</span>

                  <span className="fw-quantity">{r.quantity || 0}</span>

                  <span className="fw-date">{formatPickupWindow(r)}</span>

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
                      {getDisplayPriority(r)}
                    </div>
                  </span>

                  <span className="fw-actions">
                    <button
                      className="fw-view-btn"
                      onClick={() => setSelectedWaste(r)}
                    >
                      View
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
                <span className="fw-detail-label">Restaurant Email</span>
                <span className="fw-detail-val">
                  {selectedWaste.restaurant?.email || "—"}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Restaurant Phone</span>
                <span className="fw-detail-val">
                  {selectedWaste.restaurant?.phone || "—"}
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
                <span className="fw-detail-val">
                  {getTimeLeftText(selectedWaste)}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">AI Priority</span>
                <span className="fw-detail-val">
                  {getDisplayPriority(selectedWaste)}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">AI Score</span>
                <span className="fw-detail-val">
                  {isExpired(selectedWaste)
                    ? "Expired"
                    : selectedWaste.ai_priority_score || 0}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">AI Reason</span>
                <span className="fw-detail-val">
                  {isExpired(selectedWaste)
                    ? "Pickup deadline has passed."
                    : selectedWaste.ai_priority_reason || "No analysis available"}
                </span>
              </div>

              <div className="fw-detail-item">
                <span className="fw-detail-label">Recommended Action</span>
                <span className="fw-detail-val">
                  {isExpired(selectedWaste)
                    ? "Mark as expired and remove from available listings."
                    : selectedWaste.ai_recommended_action || "No recommendation"}
                </span>
              </div>
            </div>

            <div className="fw-modal-actions">
              <button
                className="fw-close-btn"
                onClick={() => setSelectedWaste(null)}
              >
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