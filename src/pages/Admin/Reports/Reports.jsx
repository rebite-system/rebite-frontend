import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./Reports.css";

function Reports() {
  const [reportType, setReportType] = useState("Donations Report");
  const [dateFrom, setDateFrom] = useState("2026-05-01");
  const [dateTo, setDateTo] = useState("2026-05-30");
  const [generated, setGenerated] = useState(false);
  const [overviewStats, setOverviewStats] = useState([]);
  const [currentReport, setCurrentReport] = useState({
    stats: [],
    summary: [],
  });

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  async function fetchOverviewStats() {
    try {
      const res = await api.get("/admin/reports/overview");
      setOverviewStats(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load reports overview");
    }
  }

  async function handleGenerate() {
    try {
      const res = await api.get("/admin/reports", {
        params: {
          type: reportType,
          date_from: dateFrom,
          date_to: dateTo,
        },
      });

      setCurrentReport(res.data.data || { stats: [], summary: [] });
      setGenerated(true);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to generate report");
    }
  }

  function getTotalSummary() {
    return (
      currentReport.summary.reduce(
        (sum, item) => sum + Number(item.value || 0),
        0
      ) || 1
    );
  }

  return (
    <div className="reports">
      <div className="rp-header">
        <div>
          <h1 className="rp-title">Reports</h1>

          <p className="rp-sub">
            Generate platform summaries for donations, food waste, users, and
            impact.
          </p>
        </div>
      </div>

      <div className="rp-overview-stats">
        {overviewStats.map((stat) => (
          <div key={stat.label} className="rp-overview-card">
            <div className="rp-overview-num">{stat.value}</div>
            <div className="rp-overview-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="rp-config-card">
        <div className="rp-card-header">
          <div>
            <h2 className="rp-card-title">Generate Report</h2>

            <p className="rp-card-sub">
              Select report type and date range to preview platform
              performance.
            </p>
          </div>
        </div>

        <div className="rp-config-grid">
          <div className="rp-field">
            <label className="rp-label">Report Type</label>

            <select
              className="rp-input"
              value={reportType}
              onChange={(e) => {
                setReportType(e.target.value);
                setGenerated(false);
              }}
            >
              <option>Donations Report</option>
              <option>Food Waste Report</option>
              <option>Users Report</option>
              <option>Impact Report</option>
            </select>
          </div>

          <div className="rp-field">
            <label className="rp-label">Date From</label>

            <input
              className="rp-input"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>

          <div className="rp-field">
            <label className="rp-label">Date To</label>

            <input
              className="rp-input"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        <button className="rp-generate-btn" onClick={handleGenerate}>
          Generate Report
        </button>
      </div>

      {generated && (
        <div className="rp-result-card">
          <div className="rp-result-header">
            <div>
              <h2 className="rp-result-title">{reportType}</h2>

              <p className="rp-result-dates">
                {dateFrom} → {dateTo}
              </p>
            </div>

            <div className="rp-export-btns">
              <button className="rp-export-btn">PDF Preview</button>
              <button className="rp-export-btn">Excel Preview</button>
            </div>
          </div>

          <div className="rp-stats">
            {currentReport.stats.map((stat) => (
              <div key={stat.label} className="rp-stat">
                <div className="rp-stat-num">{stat.value}</div>
                <div className="rp-stat-lbl">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="rp-summary">
            <h3 className="rp-summary-title">Report Summary</h3>

            <div className="rp-summary-bars">
              {currentReport.summary.map((item) => (
                <div key={item.label} className="rp-summary-row">
                  <span className="rp-summary-label">{item.label}</span>

                  <div className="rp-bar-wrapper">
                    <div
                      className="rp-bar"
                      style={{
                        width: `${(Number(item.value || 0) / getTotalSummary()) * 100}%`,
                        background: item.color,
                      }}
                    />
                  </div>

                  <span className="rp-summary-val">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="rp-note">
            This report preview is prepared for admin analysis and connected to
            backend report APIs.
          </p>
        </div>
      )}
    </div>
  );
}

export default Reports;