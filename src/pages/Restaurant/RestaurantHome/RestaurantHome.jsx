import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RestaurantHome.css";
import api from "../../../api/axios";

const statusConfig = {
  active: { label: "Active" },
  reserved: { label: "Reserved" },
  collected: { label: "Collected" },
  expired: { label: "Expired" },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "reserved", label: "Reserved" },
  { key: "collected", label: "Collected" },
  { key: "expired", label: "Expired" },
];

function RestaurantHome() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoods();
    fetchClaims();
  }, []);

  async function fetchFoods() {
    try {
      setLoading(true);

      const res = await api.get("/foods");
      const foods = res.data.data?.data || res.data.data || [];

      const sortedFoods = [...foods].sort((a, b) => {
        return getPriorityRank(a) - getPriorityRank(b);
      });

      setListings(sortedFoods);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchClaims() {
    try {
      const res = await api.get("/claims");
      setClaims(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
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

  function getHoursLeft(item) {
    const deadline = getPickupDeadline(item);
    if (!deadline) return null;

    return (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  }

  function getDisplayStatus(item) {
    if (item.status === "collected") return "collected";
    if (item.status === "reserved") return "reserved";
    if (item.status === "expired") return "expired";

    const hoursLeft = getHoursLeft(item);

    if (hoursLeft !== null && hoursLeft <= 0) return "expired";

    return "active";
  }

  function getDisplayPriority(item) {
    const displayStatus = getDisplayStatus(item);

    if (displayStatus === "collected") return "Collected";
    if (displayStatus === "reserved") return "Reserved";
    if (displayStatus === "expired") return "Expired";

    const priority = item.ai_priority_level?.toLowerCase();

    if (priority === "high") return "High";
    if (priority === "medium") return "Medium";
    if (priority === "low") return "Low";

    return "Low";
  }

  function getPriorityRank(item) {
    const priority = getDisplayPriority(item);

    if (priority === "High") return 1;
    if (priority === "Medium") return 2;
    if (priority === "Low") return 3;
    if (priority === "Reserved") return 4;
    if (priority === "Collected") return 5;
    if (priority === "Expired") return 6;

    return 99;
  }

  const filteredListings =
    activeTab === "all"
      ? listings
      : listings.filter((item) => getDisplayStatus(item) === activeTab);

  const collectedClaims = claims.filter(
    (claim) => claim.status === "collected"
  );

  const savedPortions = collectedClaims.reduce(
    (sum, claim) => sum + Number(claim.quantity || 0),
    0
  );

  const stats = {
    total: listings.length,
    active: listings.filter((item) => getDisplayStatus(item) === "active").length,
    reserved: listings.filter((item) => getDisplayStatus(item) === "reserved").length,
    collected: listings.filter((item) => getDisplayStatus(item) === "collected").length,
    savedPortions,
  };

  return (
    <div className="rest-home">
      <div className="rest-home-header">
        <div>
          <p className="rest-kicker">Restaurant Dashboard</p>

          <h1 className="rest-home-title">My Food Listings</h1>

          <p className="rest-home-sub">
            Track today’s surplus food listings, donation status, and waste
            reduction impact.
          </p>
        </div>

        <button
          className="add-listing-btn"
          onClick={() => navigate("/restaurant/add-listing")}
        >
          + Add Listing
        </button>
      </div>

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <span>📦</span>
          <h2>{stats.total}</h2>
          <p>Total Listings</p>
        </div>

        <div className="dashboard-stat-card">
          <span>🟢</span>
          <h2>{stats.active}</h2>
          <p>Active Listings</p>
        </div>

        <div className="dashboard-stat-card">
          <span>🕒</span>
          <h2>{stats.reserved}</h2>
          <p>Reserved Listings</p>
        </div>

        <div className="dashboard-stat-card">
          <span>✅</span>
          <h2>{stats.collected}</h2>
          <p>Collected Listings</p>
        </div>
      </section>

      <div className="waste-impact-note">
        🌱 Waste Reduction Impact: {stats.savedPortions} portions saved from
        waste through successful donations.
      </div>

      <div className="tab-bar-wrap">
        <div className="tab-bar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="tab-txt">{tab.label}</span>

              {tab.key !== "all" && (
                <span className="tab-cnt">
                  {
                    listings.filter(
                      (item) => getDisplayStatus(item) === tab.key
                    ).length
                  }
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="empty-title">Loading listings...</div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <div className="empty-title">No listings here</div>
          <div className="empty-sub">
            Add a new food listing or switch to another status tab.
          </div>

          <button
            className="empty-add-btn"
            onClick={() => navigate("/restaurant/add-listing")}
          >
            + Add Listing
          </button>
        </div>
      ) : (
        <div className="listings">
          {filteredListings.map((listing) => {
            const displayStatus = getDisplayStatus(listing);
            const displayPriority = getDisplayPriority(listing);

            return (
              <div className="listing-card" key={listing.id}>
                <div className={`stripe ${displayStatus}`} />

                <div className="lcard-body">
                  <div className="lcard-top">
                    <div>
                      <h3 className="lcard-title">{listing.title}</h3>

                      <p className="lcard-category">
                        {formatCategory(listing.category)}
                      </p>
                    </div>

                    <div className="listing-badges">
                      <span className={`status-badge ${displayStatus}`}>
                        {statusConfig[displayStatus]?.label || "Active"}
                      </span>

                      <span
                        className={`priority-badge ${displayPriority.toLowerCase()}`}
                      >
                        {displayPriority}
                      </span>
                    </div>
                  </div>

                  <div className="lcard-meta">
                    <span>🍽️ {listing.quantity} portions</span>

                    <span>
                      🕐 {formatTime(listing.pickup_from, listing.pickup_until)}
                    </span>

                    <span>
                      {listing.created_at
                        ? new Date(listing.created_at).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>

                  {listing.notes && <p className="lcard-notes">{listing.notes}</p>}

                  <div className="lcard-bottom">
                    {displayStatus === "active" && (
                      <span className="awaiting">Awaiting charity request...</span>
                    )}

                    {displayStatus === "reserved" && (
                      <span className="reserved-text">Reserved for pickup</span>
                    )}

                    {displayStatus === "collected" && (
                      <span className="collected-text">Collected successfully</span>
                    )}

                    {displayStatus === "expired" && (
                      <span className="expired-text">Listing expired</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default RestaurantHome;