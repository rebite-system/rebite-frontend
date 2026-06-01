import { useEffect, useState } from "react";
import "./Claimsnew.css";
import api from "../../../api/axios";

const filters = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "accepted", label: "Accepted" },
  { key: "collected", label: "Collected" },
  { key: "rejected", label: "Rejected" },
];

function Claims() {
  const [claims, setClaims] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClaims();
  }, []);

  async function fetchClaims() {
    try {
      setLoading(true);
      const res = await api.get("/claims");
      setClaims(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setMessage("Failed to load charity requests.");
    } finally {
      setLoading(false);
    }
  }

  async function updateClaimStatus(id, status) {
    try {
      setMessage("");
      await api.post(`/claim/status/${id}`, { status });
      await fetchClaims();

      if (status === "accepted") setMessage("Request accepted successfully.");
      if (status === "rejected") setMessage("Request rejected successfully.");
      if (status === "collected") setMessage("Food marked as collected successfully.");
    } catch (err) {
      console.log(err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Action failed. Please try again.");
    }
  }

  function formatDate(date) {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  }

  function formatPickup(food) {
    if (!food?.pickup_from && !food?.pickup_until) return "—";
    const from = food.pickup_from ? food.pickup_from.slice(0, 5) : "—";
    const until = food.pickup_until ? food.pickup_until.slice(0, 5) : "—";
    return `${from} – ${until}`;
  }

  function getCount(key) {
    if (key === "all") return claims.length;
    return claims.filter((claim) => claim.status === key).length;
  }

  const filteredClaims =
    activeFilter === "all"
      ? claims
      : claims.filter((claim) => claim.status === activeFilter);

  return (
    <div className="claims-page">
      <div className="claims-header">
        <h1>Charity Requests</h1>
        <p>Review charity claims, approve pickups, and confirm collection.</p>
      </div>

      {message && <div className="claims-message">{message}</div>}

      <div className="claims-filter-bar">
        {filters.map((filter) => (
          <button
            type="button"
            key={filter.key}
            className={`claims-filter ${activeFilter === filter.key ? "active" : ""}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            <span>{filter.label}</span>
            <strong>{getCount(filter.key)}</strong>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="claims-empty">
          <h2>Loading requests...</h2>
        </div>
      ) : filteredClaims.length === 0 ? (
        <div className="claims-empty">
          <div>📭</div>
          <h2>No requests here</h2>
          <p>Try another filter or wait for charities to claim your food.</p>
        </div>
      ) : (
        <div className="claims-list">
          {filteredClaims.map((claim) => (
            <div className={`claim-card claim-card-${claim.status}`} key={claim.id}>
              <div className="claim-main">
                <h3>{claim.charity?.name || claim.user?.name || "Charity"}</h3>

                <div className="claim-food">
                  <strong>{claim.food?.title || "Food item"}</strong>
                  <span>{claim.quantity} portions requested</span>
                </div>

                <div className="claim-details">
                  <span>🕐 Pickup: {formatPickup(claim.food)}</span>
                  <span>🗓️ Requested: {formatDate(claim.created_at)}</span>
                </div>
              </div>

              <div className="claim-side">
                {claim.status === "pending" && (
                  <>
                    <button
                      className="accept-btn"
                      onClick={() => updateClaimStatus(claim.id, "accepted")}
                    >
                      Accept
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => updateClaimStatus(claim.id, "rejected")}
                    >
                      Reject
                    </button>
                  </>
                )}

                {claim.status === "accepted" && (
                  <button
                    className="collect-btn"
                    onClick={() => updateClaimStatus(claim.id, "collected")}
                  >
                    Mark as Collected
                  </button>
                )}

                {claim.status === "rejected" && (
                  <div className="claim-note rejected-note">Rejected</div>
                )}

                {claim.status === "collected" && (
                  <div className="claim-note collected-note">Collected</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Claims;