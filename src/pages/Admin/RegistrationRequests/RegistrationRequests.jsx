import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./RegistrationRequests.css";

function RegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    try {
      setLoading(true);

      const res = await api.get("/admin/pending-requests");

      setRequests(
        (res.data.data || []).map((user) => ({
          ...user,
          submitted: formatDate(user.created_at),
        }))
      );
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load registration requests");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id) {
    try {
      await api.post(`/admin/approve/${id}`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Approve failed");
    }
  }

  async function handleReject(id) {
    const confirmed = window.confirm(
      "Are you sure you want to reject this registration request?"
    );

    if (!confirmed) return;

    try {
      await api.post(`/admin/reject/${id}`);
      setSelectedRequest(null);
      fetchRequests();
    } catch (err) {
      alert(err.response?.data?.message || "Reject failed");
    }
  }

  function formatDate(date) {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function formatRole(role) {
    if (role === "charity") return "Charity";
    if (role === "restaurant") return "Restaurant";
    return role || "—";
  }

  const restaurantCount = requests.filter((r) => r.role === "restaurant").length;
  const charityCount = requests.filter((r) => r.role === "charity").length;

  const filteredRequests = requests.filter((request) => {
    const q = search.toLowerCase();

    return (
      (request.name || "").toLowerCase().includes(q) ||
      (request.email || "").toLowerCase().includes(q) ||
      (request.location || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="registration-requests">
      <div className="rr-header">
        <div>
          <h1 className="rr-title">Registration Requests</h1>
          <p className="rr-sub">
            Review and manage restaurant and charity registration requests.
          </p>
        </div>
      </div>

      <div className="rr-summary-grid">
        <div className="rr-summary-card">
          <div>
            <div className="rr-summary-num">{requests.length}</div>
            <div className="rr-summary-label">Pending Requests</div>
          </div>
          <div className="rr-summary-icon">📋</div>
        </div>

        <div className="rr-summary-card">
          <div>
            <div className="rr-summary-num">{restaurantCount}</div>
            <div className="rr-summary-label">Restaurants</div>
          </div>
          <div className="rr-summary-icon">🍽️</div>
        </div>

        <div className="rr-summary-card">
          <div>
            <div className="rr-summary-num">{charityCount}</div>
            <div className="rr-summary-label">Charities</div>
          </div>
          <div className="rr-summary-icon">🏥</div>
        </div>
      </div>

      <div className="rr-search-box">
        <span>🔍</span>

        <input
          placeholder="Search by name, email, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button className="rr-clear-search" onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      <div className="rr-table-wrapper">
        <div className="rr-table">
          <div className="rr-table-head">
            <span>Name</span>
            <span>Organization Type</span>
            <span>Email</span>
            <span>Submitted On</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="rr-empty">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="rr-empty">No pending registration requests</div>
          ) : (
            filteredRequests.map((req) => (
              <div key={req.id} className="rr-table-row">
                <span className="rr-org-name">{req.name}</span>

                <span>
                  <span className={`rr-role-badge ${req.role}`}>
                    {formatRole(req.role)}
                  </span>
                </span>

                <span className="rr-org-email">{req.email}</span>
                <span className="rr-org-date">{req.submitted}</span>

                <span className="rr-actions">
                  <button
                    className="rr-view-btn"
                    onClick={() => setSelectedRequest(req)}
                  >
                    View
                  </button>

                  <button
                    className="rr-approve-action"
                    onClick={() => handleApprove(req.id)}
                  >
                    Approve
                  </button>

                  <button
                    className="rr-reject-action"
                    onClick={() => handleReject(req.id)}
                  >
                    Reject
                  </button>
                </span>
              </div>
            ))
          )}
        </div>

        <div className="rr-table-footer">
          Showing {filteredRequests.length} of {requests.length} pending requests
        </div>
      </div>

      {selectedRequest && (
        <div className="rr-overlay" onClick={() => setSelectedRequest(null)}>
          <div className="rr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="rr-modal-header">
              <div>
                <h2 className="rr-modal-title">Request Details</h2>
                <p className="rr-modal-sub">
                  Review applicant information before approving or rejecting.
                </p>
              </div>

              <span className="rr-status pending">Pending</span>
            </div>

            <div className="rr-modal-body single">
              <div className="rr-detail-row">
                <span className="rr-detail-icon">🏢</span>
                <div>
                  <div className="rr-detail-label">Name</div>
                  <div className="rr-detail-val">{selectedRequest.name}</div>
                </div>
              </div>

              <div className="rr-detail-row">
                <span className="rr-detail-icon">🧾</span>
                <div>
                  <div className="rr-detail-label">Organization Type</div>
                  <div className="rr-detail-val">
                    {formatRole(selectedRequest.role)}
                  </div>
                </div>
              </div>

              <div className="rr-detail-row">
                <span className="rr-detail-icon">✉️</span>
                <div>
                  <div className="rr-detail-label">Email</div>
                  <div className="rr-detail-val">{selectedRequest.email}</div>
                </div>
              </div>

              <div className="rr-detail-row">
                <span className="rr-detail-icon">📞</span>
                <div>
                  <div className="rr-detail-label">Phone</div>
                  <div className="rr-detail-val">
                    {selectedRequest.phone || "—"}
                  </div>
                </div>
              </div>

              <div className="rr-detail-row">
                <span className="rr-detail-icon">📍</span>
                <div>
                  <div className="rr-detail-label">Location</div>
                  <div className="rr-detail-val">
                    {selectedRequest.location || "—"}
                  </div>
                </div>
              </div>

              <div className="rr-detail-row">
                <span className="rr-detail-icon">🕓</span>
                <div>
                  <div className="rr-detail-label">Submitted On</div>
                  <div className="rr-detail-val">
                    {selectedRequest.submitted}
                  </div>
                </div>
              </div>
            </div>

            <div className="rr-modal-actions">
              <button
                className="rr-modal-close-btn"
                onClick={() => setSelectedRequest(null)}
              >
                Close
              </button>

              <button
                className="rr-modal-approve-btn"
                onClick={() => handleApprove(selectedRequest.id)}
              >
                Approve
              </button>

              <button
                className="rr-modal-reject-btn"
                onClick={() => handleReject(selectedRequest.id)}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RegistrationRequests;