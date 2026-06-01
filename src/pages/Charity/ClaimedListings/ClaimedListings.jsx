import { useEffect, useState } from "react";
import "./ClaimedListings.css";
import api from "../../../api/axios";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "#9a7d0a",
    bg: "#fef9e7",
    border: "#fad7a0",
    message: "Waiting for restaurant approval",
  },

  accepted: {
    label: "Accepted",
    color: "#1a5276",
    bg: "#ebf5fb",
    border: "#aed6f1",
    message: "Request accepted. Awaiting collection",
  },

  rejected: {
    label: "Rejected",
    color: "#c0392b",
    bg: "#fdedec",
    border: "#f5b7b1",
    message: "Request rejected",
  },

  collected: {
    label: "Collected",
    color: "#1e8449",
    bg: "#eaf9ea",
    border: "#a9dfbf",
    message: "Food collected successfully",
  },
};

const tabs = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "rejected", label: "Rejected" },
  { key: "collected", label: "Collected" },
];

function ClaimedListings() {
  const [activeTab, setActiveTab] = useState("all");
  const [listings, setListings] = useState([]);

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    try {
      const res = await api.get("/my-claims");

      const formatted = res.data.data.map((claim) => ({
        id: claim.id,
        restaurantName: claim.food?.restaurant?.name || "Restaurant",
        restaurantInitials:
          claim.food?.restaurant?.name?.substring(0, 2)?.toUpperCase() || "RS",
        foodType: "Cooked Meals",
        items: claim.food?.title || "Food",
        portions: `${claim.quantity} portions`,
        pickup: "Today",
        status: claim.status,
        claimedAt: new Date(claim.created_at).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        }),
        tags: ["Fresh Food"],
      }));

      setListings(formatted);
    } catch (err) {
      console.log(err.response?.data);
    }
  }

  const filtered =
    activeTab === "all"
      ? listings
      : listings.filter((l) => l.status === activeTab);

  return (
    <div className="claimed-listings">
      <div className="cl-header">
        <div>
          <h1 className="cl-title">Claimed Listings</h1>
          <p className="cl-sub">Track your claims and request status</p>
        </div>
      </div>

      <div className="cl-stats">
        <div className="cl-stat">
          <span className="cl-stat-num">{listings.length}</span>
          <span className="cl-stat-lbl">Total Claims</span>
        </div>

        <div className="cl-stat">
          <span className="cl-stat-num" style={{ color: "#2e86c1" }}>
            {listings.filter((l) => l.status === "accepted").length}
          </span>
          <span className="cl-stat-lbl">Accepted</span>
        </div>

        <div className="cl-stat">
          <span className="cl-stat-num" style={{ color: "#27ae60" }}>
            {listings.filter((l) => l.status === "collected").length}
          </span>
          <span className="cl-stat-lbl">Collected</span>
        </div>
      </div>

      <div className="cl-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`cl-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}

            {tab.key !== "all" && (
              <span className="cl-tab-cnt">
                {listings.filter((l) => l.status === tab.key).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="cl-empty">
          <div className="cl-empty-icon">📭</div>
          <div className="cl-empty-title">No claims found</div>
          <div className="cl-empty-sub">Claim some listings first.</div>
        </div>
      ) : (
        <div className="cl-grid">
          {filtered.map((listing) => (
            <ClaimedCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}

function ClaimedCard({ listing }) {
  const status = statusConfig[listing.status];

  return (
    <div className="cl-card">
      <div className="cl-card-hdr">
        <div className="cl-rest-info">
          <div className="cl-avatar">{listing.restaurantInitials}</div>

          <div>
            <div className="cl-rest-name">{listing.restaurantName}</div>
            <div className="cl-food-type">{listing.foodType}</div>
          </div>
        </div>

        <div
          className="cl-badge"
          style={{
            background: status.bg,
            borderColor: status.border,
          }}
        >
          <div className="cl-badge-dot" style={{ background: status.color }} />

          <div className="cl-badge-txt" style={{ color: status.color }}>
            {status.label}
          </div>
        </div>
      </div>

      <div className="cl-divider" />

      <div className="cl-items">{listing.items}</div>

      <div className="cl-meta">
        <span>📦 {listing.portions}</span>
        <div className="cl-meta-sep" />
        <span>🕐 {listing.pickup}</span>
      </div>

      <div className="cl-claimed-at">
        📅 Requested on: {listing.claimedAt}
      </div>

      <div className="cl-tags">
        {listing.tags.map((tag) => (
          <span key={tag} className="cl-tag">
            {tag}
          </span>
        ))}
      </div>

      <div
        className="cl-collected-badge"
        style={{
          background: status.bg,
          color: status.color,
          border: `1px solid ${status.border}`,
        }}
      >
        {status.message}
      </div>
      <div className="cl-progress">
        <h4>Donation Progress</h4>

        {listing.status === "pending" && (
          <>
            <p>✓ Request Submitted</p>
            <p>⏳ Waiting For Approval</p>
          </>
        )}

        {listing.status === "accepted" && (
          <>
            <p>✓ Request Submitted</p>
            <p>✓ Approved By Restaurant</p>
            <p>⏳ Awaiting Collection</p>
          </>
        )}

        {listing.status === "collected" && (
          <>
            <p>✓ Request Submitted</p>
            <p>✓ Approved By Restaurant</p>
            <p>✓ Food Collected</p>
          </>
        )}

        {listing.status === "rejected" && (
          <>
            <p>✓ Request Submitted</p>
            <p>✕ Request Rejected</p>
          </>
        )}
      </div>
    </div>
  );
}

export default ClaimedListings;