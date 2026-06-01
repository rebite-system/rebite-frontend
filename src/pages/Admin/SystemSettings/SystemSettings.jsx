import { useEffect, useState } from "react";
import api from "../../../api/axios";
import "./SystemSettings.css";

function SystemSettings() {
  const [activeTab, setActiveTab] = useState("locations");
  const [supportedLocations, setSupportedLocations] = useState([]);

  const [notifications, setNotifications] = useState({
    newRegistrations: true,
    urgentFoodAlerts: true,
    approvalUpdates: true,
    newDonationAlerts: true,
  });

  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    try {
      const res = await api.get("/admin/settings");

      setSupportedLocations(res.data.data?.locations || []);

      setNotifications((prev) => ({
        ...prev,
        ...(res.data.data?.notifications || {}),
      }));
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load settings");
    }
  }

  const tabs = [
    { key: "locations", label: "Supported Locations" },
    { key: "notifications", label: "Notification Settings" },
  ];

  const notificationItems = [
    {
      key: "newRegistrations",
      title: "New Registration Requests",
      desc: "Notify admin when a restaurant or charity submits a new registration request.",
    },
    {
      key: "urgentFoodAlerts",
      title: "Urgent Food Alerts",
      desc: "Notify charities when urgent food listings are available.",
    },
    {
      key: "approvalUpdates",
      title: "Approval Updates",
      desc: "Notify users when their registration request is approved or rejected.",
    },
    {
      key: "newDonationAlerts",
      title: "New Donation Alerts",
      desc: "Notify admins and charities when a new donation is completed.",
    },
  ];

  function handleSave(msg) {
    setSavedMsg(msg);
    setTimeout(() => setSavedMsg(""), 2200);
  }

  async function saveNotificationSettings() {
    try {
      await api.put("/admin/settings/notifications", notifications);
      handleSave("Notification settings saved.");
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to save notification settings");
    }
  }

  return (
    <div className="system-settings">
      <div className="ss-header">
        <div>
          <h1 className="ss-title">System Settings</h1>
          <p className="ss-sub">
            Manage pilot locations and notification preferences.
          </p>
        </div>
      </div>

      {savedMsg && <div className="ss-saved-msg">✅ {savedMsg}</div>}

      <div className="ss-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`ss-tab ${activeTab === tab.key ? "active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "locations" && (
        <div className="ss-card">
          <div className="ss-card-header">
            <div>
              <h2 className="ss-card-title">Supported Locations</h2>
              <p className="ss-card-sub">
                ReBite pilot phase currently operates in supported locations.
              </p>
            </div>

            <span className="ss-count-badge">
              {supportedLocations.length} Active Locations
            </span>
          </div>

          <div className="ss-locations-list">
            {supportedLocations.length === 0 ? (
              <div className="ss-empty">No locations found</div>
            ) : (
              supportedLocations.map((location) => (
                <div key={location.id} className="ss-location-row">
                  <div>
                    <span className="ss-location-name">{location.name}</span>
                    <p className="ss-location-sub">Pilot coverage area</p>
                  </div>

                  <span className="ss-location-status">
                    {location.status || "Active"}
                  </span>
                </div>
              ))
            )}
          </div>

          <p className="ss-helper">
            Locations are loaded from the database.
          </p>
        </div>
      )}

      {activeTab === "notifications" && (
        <div className="ss-card">
          <div className="ss-card-header">
            <div>
              <h2 className="ss-card-title">Notification Settings</h2>
              <p className="ss-card-sub">
                Configure notification preferences used in ReBite workflows.
              </p>
            </div>
          </div>

          <div className="ss-notif-list">
            {notificationItems.map((item) => (
              <div key={item.key} className="ss-notif-row">
                <div>
                  <span className="ss-notif-label">{item.title}</span>
                  <p className="ss-notif-desc">{item.desc}</p>
                </div>

                <div
                  className={`ss-toggle ${
                    notifications[item.key] ? "on" : "off"
                  }`}
                  onClick={() =>
                    setNotifications({
                      ...notifications,
                      [item.key]: !notifications[item.key],
                    })
                  }
                >
                  <div className="ss-thumb" />
                </div>
              </div>
            ))}
          </div>

          <button className="ss-save-btn" onClick={saveNotificationSettings}>
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}

export default SystemSettings;