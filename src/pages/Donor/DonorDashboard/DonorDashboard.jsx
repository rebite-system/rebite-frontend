import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";
import "./DonorDashboard.css";

function DonorDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDonations();
  }, []);

  async function fetchDonations() {
    try {
      setLoading(true);

      const res = await api.get("/my-donations");

      setDonations(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");

    navigate("/signin");
  }

  const totalDonated = donations.reduce((sum, donation) => {
    return sum + Number(donation.amount || 0);
  }, 0);

  const donationRecords = donations.length;

  return (
    <div className="donor-dashboard">
      <nav className="donor-navbar">
        <div className="donor-logo" onClick={() => navigate("/donor")}>
          <span>🌿</span>

          <div>
            <h3>ReBite</h3>
            <p>Donor Portal</p>
          </div>
        </div>

        <div className="donor-nav-links">
          <button onClick={() => navigate("/donor/profile")}>Profile</button>
        </div>

        <button className="donor-logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </nav>

      <main className="donor-container">
        <section className="donor-hero">
          <div>
            <p className="donor-welcome">Welcome back 👋</p>

            <h1>Hello, {user?.name || "Donor"}</h1>

            <p>
              Your donations are recorded clearly so you can track every
              contribution and see where your support goes.
            </p>
          </div>

          <button
            className="donor-primary-btn"
            onClick={() => navigate("/donation")}
          >
            Donate Now →
          </button>
        </section>

        <section className="donor-stats-grid">
          <div className="donor-stat-card">
            <span>💰</span>
            <h2>{totalDonated.toLocaleString()} EGP</h2>
            <p>Total Donated</p>
          </div>

          <div className="donor-stat-card">
            <span>📄</span>
            <h2>{donationRecords}</h2>
            <p>Donation Records</p>
          </div>
        </section>

        <section className="donor-panel">
          <div className="donor-panel-header">
            <div>
              <h2>Recent Donations</h2>
              <p>Your latest donation records and payment details.</p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchDonations}
              title="Refresh donations"
            >
              ↻
            </button>
          </div>

          {loading ? (
            <div className="donor-empty">Loading donations...</div>
          ) : donations.length === 0 ? (
            <div className="donor-empty">
              <span>💚</span>
              <h3>No donations yet</h3>
              <p>Start your first donation and it will appear here.</p>

              <button
                className="donor-primary-btn empty-btn"
                onClick={() => navigate("/donation")}
              >
                Donate Now
              </button>
            </div>
          ) : (
            <div className="donations-list">
              {donations.slice(0, 8).map((donation) => (
                <div className="donor-donation-row" key={donation.id}>
                  <div>
                    <h4>
                      {Number(donation.amount).toLocaleString()} EGP Donation
                    </h4>

                    <p>
                      Charity: {donation.charity?.name || "Auto-distribute"}
                    </p>

                    <p>
                      Method: {donation.payment_method || "Not specified"}
                    </p>

          
                  </div>

                  <span>
                    {donation.created_at
                      ? new Date(donation.created_at).toLocaleDateString()
                      : "—"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default DonorDashboard;