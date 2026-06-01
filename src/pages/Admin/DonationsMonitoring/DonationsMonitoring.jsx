import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./DonationsMonitoring.css";

const statusConfig = {
  paid: {
    label: "Paid",
    color: "#1e8449",
    bg: "#eaf9ea",
    border: "#a9dfbf",
  },
  pending: {
    label: "Pending",
    color: "#9a7d0a",
    bg: "#fef9e7",
    border: "#fad7a0",
  },
  failed: {
    label: "Failed",
    color: "#c0392b",
    bg: "#fdedec",
    border: "#f1948a",
  },
};

function DonationsMonitoring() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    try {
      setLoading(true);
      const res = await api.get("/admin/donations");
      setDonations(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load donations");
    } finally {
      setLoading(false);
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

  function formatPaymentMethod(method) {
    const names = {
      card: "Card",
      vodafone: "Vodafone Cash",
      instapay: "InstaPay",
    };

    return names[method] || method || "—";
  }

  function getStatus(value) {
    return value || "pending";
  }

  const totalAmount = donations.reduce(
    (sum, d) => sum + Number(d.amount || 0),
    0
  );

  const totalPlatformFees = donations.reduce(
    (sum, d) => sum + Number(d.platform_fee || 0),
    0
  );

  const paidCount = donations.filter(
    (d) => getStatus(d.payment_status) === "paid"
  ).length;

  const pendingCount = donations.filter(
    (d) => getStatus(d.payment_status) === "pending"
  ).length;

  const failedCount = donations.filter(
    (d) => getStatus(d.payment_status) === "failed"
  ).length;

  const filtered = donations.filter((d) => {
    const q = search.toLowerCase();

    const donor = d.donor?.name || "";
    const charity = d.charity?.name || "";
    const ref = d.payment_reference || "";
    const account = d.payment_account || "";

    const matchSearch =
      donor.toLowerCase().includes(q) ||
      charity.toLowerCase().includes(q) ||
      ref.toLowerCase().includes(q) ||
      account.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "all" || getStatus(d.payment_status) === statusFilter;

    return matchSearch && matchStatus;
  });

  return (
    <div className="donations-monitoring">
      <div className="dm-header">
        <div>
          <h1 className="dm-title">Donations Monitoring</h1>
          <p className="dm-sub">
            Track financial donations, payment status, platform fees, and donor
            activity.
          </p>
        </div>
      </div>

      <div className="dm-stats">
        <div className="dm-stat">
          <div className="dm-stat-num">{donations.length}</div>
          <div className="dm-stat-lbl">Total Donations</div>
        </div>

        <div className="dm-stat">
          <div className="dm-stat-num" style={{ color: "#1e8449" }}>
            {formatMoney(totalAmount)}
          </div>
          <div className="dm-stat-lbl">Total Amount EGP</div>
        </div>

        <div className="dm-stat">
          <div className="dm-stat-num" style={{ color: "#2d5016" }}>
            {paidCount}
          </div>
          <div className="dm-stat-lbl">Paid Donations</div>
        </div>

        <div className="dm-stat">
          <div className="dm-stat-num" style={{ color: "#9a7d0a" }}>
            {pendingCount}
          </div>
          <div className="dm-stat-lbl">Pending Donations</div>
        </div>

        <div className="dm-stat">
          <div className="dm-stat-num" style={{ color: "#c0392b" }}>
            {failedCount}
          </div>
          <div className="dm-stat-lbl">Failed Donations</div>
        </div>

        <div className="dm-stat">
          <div className="dm-stat-num" style={{ color: "#1f3b10" }}>
            {formatMoney(totalPlatformFees)}
          </div>
          <div className="dm-stat-lbl">Platform Fees EGP</div>
        </div>
      </div>

      <div className="dm-filters">
        <div className="dm-search">
          <span>🔍</span>

          <input
            placeholder="Search donor, charity, account or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {search && (
            <button className="dm-clear-search" onClick={() => setSearch("")}>
              ✕
            </button>
          )}
        </div>

        <select
          className="dm-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <div className="dm-table-wrapper">
        <div className="dm-table">
          <div className="dm-table-head">
            <span>Donor</span>
            <span>Charity</span>
            <span>Amount</span>
            <span>Status</span>
            <span>Date</span>
            <span>Actions</span>
          </div>

          {loading ? (
            <div className="dm-empty">Loading donations...</div>
          ) : filtered.length === 0 ? (
            <div className="dm-empty">No donations found</div>
          ) : (
            filtered.map((donation) => {
              const status = getStatus(donation.payment_status);
              const cfg = statusConfig[status] || statusConfig.pending;

              return (
                <div key={donation.id} className="dm-table-row">
                  <span className="dm-donor-name">
                    {donation.donor?.name || "—"}
                  </span>

                  <span className="dm-charity-name">
                    {donation.charity?.name || "Auto Distributed"}
                  </span>

                  <span className="dm-amount">
                    {formatMoney(donation.amount)} EGP
                  </span>

                  <span>
                    <div
                      className="dm-status"
                      style={{
                        color: cfg.color,
                        background: cfg.bg,
                        borderColor: cfg.border,
                      }}
                    >
                      {cfg.label}
                    </div>
                  </span>

                  <span className="dm-date">
                    {formatDate(donation.created_at)}
                  </span>

                  <span>
                    <button
                      className="dm-view-btn"
                      onClick={() => setSelectedDonation(donation)}
                    >
                      View
                    </button>
                  </span>
                </div>
              );
            })
          )}
        </div>

        <div className="dm-table-footer">
          Showing {filtered.length} of {donations.length} donations
        </div>
      </div>

      {selectedDonation && (
        <div className="dm-overlay" onClick={() => setSelectedDonation(null)}>
          <div className="dm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dm-modal-header">
              <div>
                <h2 className="dm-modal-title">Donation Details</h2>
                <p className="dm-modal-sub">
                  Full financial donation record and payment information.
                </p>
              </div>

              {(() => {
                const status = getStatus(selectedDonation.payment_status);
                const cfg = statusConfig[status] || statusConfig.pending;

                return (
                  <div
                    className="dm-status"
                    style={{
                      color: cfg.color,
                      background: cfg.bg,
                      borderColor: cfg.border,
                    }}
                  >
                    {cfg.label}
                  </div>
                );
              })()}
            </div>

            <div className="dm-detail-grid">
              <div className="dm-detail-item">
                <span className="dm-detail-label">Donor</span>
                <span className="dm-detail-val">
                  {selectedDonation.donor?.name || "—"}
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Charity</span>
                <span className="dm-detail-val">
                  {selectedDonation.charity?.name || "Auto Distributed"}
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Amount</span>
                <span className="dm-detail-val">
                  {formatMoney(selectedDonation.amount)} EGP
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Platform Fee</span>
                <span className="dm-detail-val">
                  {formatMoney(selectedDonation.platform_fee)} EGP
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Charity Amount</span>
                <span className="dm-detail-val">
                  {formatMoney(selectedDonation.charity_amount)} EGP
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Payment Method</span>
                <span className="dm-detail-val">
                  {formatPaymentMethod(selectedDonation.payment_method)}
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Payment Account</span>
                <span className="dm-detail-val">
                  {selectedDonation.payment_account || "—"}
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Reference</span>
                <span className="dm-detail-val">
                  {selectedDonation.payment_reference || "—"}
                </span>
              </div>

              <div className="dm-detail-item">
                <span className="dm-detail-label">Created At</span>
                <span className="dm-detail-val">
                  {formatDate(selectedDonation.created_at)}
                </span>
              </div>
            </div>

            <div className="dm-modal-actions">
              <button
                className="dm-btn-secondary"
                onClick={() => setSelectedDonation(null)}
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

export default DonationsMonitoring;