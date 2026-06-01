import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CharityProfile.css";
import api from "../../../api/axios";

function CharityProfile() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCharityModal, setShowCharityModal] = useState(false);

  const [charityForm, setCharityForm] = useState({
    name: "",
    type: "Food Bank",
    location: "",
    phone: "",
    email: "",
    latitude: "",
    longitude: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    newPass: "",
    confirm: "",
  });

  const [message, setMessage] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("/profile");
      const user = res.data.data || res.data;

      setCharityForm({
        name: user.name || "",
        type: user.type || "Food Bank",
        location: user.location || "",
        phone: user.phone || "",
        email: user.email || "",
        latitude: user.latitude || "",
        longitude: user.longitude || "",
      });
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  function getInitials(name) {
    if (!name) return "CH";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function handleCharityChange(e) {
    setCharityForm({
      ...charityForm,
      [e.target.name]: e.target.value,
    });
  }

  function getCurrentLocation() {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCharityForm((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
      },
      () => {
        alert("Unable to get your location");
      }
    );
  }

  async function handleSaveProfile() {
    try {
      const res = await api.put("/profile", charityForm);
      const updatedUser = res.data.data || charityForm;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setCharityForm({
        name: updatedUser.name || "",
        type: updatedUser.type || "Food Bank",
        location: updatedUser.location || "",
        phone: updatedUser.phone || "",
        email: updatedUser.email || "",
        latitude: updatedUser.latitude || "",
        longitude: updatedUser.longitude || "",
      });

      setMessage("Profile updated successfully.");
      setShowCharityModal(false);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setMessage(err.response?.data?.message || "Update failed.");
    }
  }

  function handlePasswordChange(e) {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value,
    });

    setPasswordError("");
  }

  async function handlePasswordSave(e) {
    e.preventDefault();

    if (!passwordForm.current) {
      setPasswordError("Current password is required");
      return;
    }

    if (passwordForm.newPass.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }

    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      await api.put("/change-password", {
        current_password: passwordForm.current,
        new_password: passwordForm.newPass,
        new_password_confirmation: passwordForm.confirm,
      });

      setPasswordError("");
      setPasswordSuccess(true);

      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
        setPasswordForm({
          current: "",
          newPass: "",
          confirm: "",
        });
      }, 1500);
    } catch (err) {
      console.log(err.response?.data || err.message);
      setPasswordError(err.response?.data?.message || "Password update failed");
    }
  }

  function handleSignOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/signin");
  }

  return (
    <div className="charity-profile">
      <div className="cp-header">
        <h1 className="cp-title">Profile</h1>
        <p className="cp-sub">
          Manage your charity account, location, and security settings.
        </p>
      </div>

      {message && <div className="cp-message">{message}</div>}

      <div className="cp-layout">
        <div className="cp-left">
          <div className="cp-card">
            <div className="cp-avatar">{getInitials(charityForm.name)}</div>

            <div className="cp-name">{charityForm.name || "Charity"}</div>

            <div className="cp-type">
              {charityForm.type || "Charity Partner"}
            </div>

            <div className="cp-info-line">
              📧 {charityForm.email || "No email"}
            </div>

            <div className="cp-info-line">
              📞 {charityForm.phone || "No phone"}
            </div>

            <div className="cp-info-line">
              📍 {charityForm.location || "No location"}
            </div>

            <button
              className="cp-edit-btn"
              onClick={() => setShowCharityModal(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="cp-right">
          <div className="cp-section">
            <div className="cp-section-label">Account</div>

            <div className="cp-settings-card">
              <div className="cp-setting-row no-hover">
                <div className="cp-setting-icon">📧</div>

                <div>
                  <div className="cp-setting-lbl">Email</div>
                  <div className="cp-setting-sub">
                    {charityForm.email || "No email"}
                  </div>
                </div>
              </div>

              <div className="cp-setting-row no-hover">
                <div className="cp-setting-icon">📞</div>

                <div>
                  <div className="cp-setting-lbl">Phone</div>
                  <div className="cp-setting-sub">
                    {charityForm.phone || "No phone"}
                  </div>
                </div>
              </div>

              <div className="cp-setting-row no-hover">
                <div className="cp-setting-icon">📍</div>

                <div>
                  <div className="cp-setting-lbl">Location</div>
                  <div className="cp-setting-sub">
                    {charityForm.location || "No location"}
                  </div>
                </div>
              </div>

              <div
                className="cp-setting-row"
                onClick={() => setShowPasswordModal(true)}
              >
                <div className="cp-setting-icon">🔒</div>

                <div>
                  <div className="cp-setting-lbl">Change password</div>
                  <div className="cp-setting-sub">
                    Update your account password
                  </div>
                </div>

                <div className="cp-setting-chev">›</div>
              </div>
            </div>
          </div>

          <div className="cp-section">
            <div className="cp-section-label">Preferences</div>

            <div className="cp-settings-card">
              <div className="cp-setting-row no-hover">
                <div className="cp-setting-icon">🔔</div>

                <div>
                  <div className="cp-setting-lbl">Push notifications</div>
                  <div className="cp-setting-sub">
                    Receive updates about accepted and collected claims
                  </div>
                </div>

                <div
                  className={`cp-toggle ${notifications ? "on" : "off"}`}
                  onClick={() => setNotifications(!notifications)}
                >
                  <div className="cp-thumb" />
                </div>
              </div>
            </div>
          </div>

          <div className="cp-section">
            <div className="cp-section-label">Session</div>

            <div className="cp-settings-card">
              <div className="cp-setting-row danger" onClick={handleSignOut}>
                <div className="cp-setting-icon danger">🚪</div>

                <div>
                  <div className="cp-setting-lbl danger">Sign out</div>
                  <div className="cp-setting-sub">Log out from your account</div>
                </div>
              </div>
            </div>
          </div>

          <div className="cp-version">ReBite v1.0.0</div>
        </div>
      </div>

      {showCharityModal && (
        <div
          className="cp-overlay"
          onClick={() => setShowCharityModal(false)}
        >
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="cp-modal-title">Edit Profile</h2>

            <div className="cp-modal-form">
              <div className="cp-modal-field">
                <label className="cp-modal-label">Charity Name</label>
                <input
                  className="cp-modal-input"
                  type="text"
                  name="name"
                  value={charityForm.name}
                  onChange={handleCharityChange}
                />
              </div>

              <div className="cp-modal-field">
                <label className="cp-modal-label">Charity Type</label>
                <input
                  className="cp-modal-input"
                  type="text"
                  name="type"
                  value={charityForm.type}
                  onChange={handleCharityChange}
                />
              </div>

              <div className="cp-modal-field">
                <label className="cp-modal-label">Email</label>
                <input
                  className="cp-modal-input"
                  type="email"
                  name="email"
                  value={charityForm.email}
                  onChange={handleCharityChange}
                />
              </div>

              <div className="cp-modal-field">
                <label className="cp-modal-label">Phone</label>
                <input
                  className="cp-modal-input"
                  type="text"
                  name="phone"
                  value={charityForm.phone}
                  onChange={handleCharityChange}
                />
              </div>

              <div className="cp-modal-field">
                <label className="cp-modal-label">Location</label>
                <input
                  className="cp-modal-input"
                  type="text"
                  name="location"
                  value={charityForm.location}
                  onChange={handleCharityChange}
                />
              </div>

              <button
                type="button"
                className="cp-location-btn"
                onClick={getCurrentLocation}
              >
                📍 Use Current Location
              </button>

              <div className="cp-modal-field">
                <label className="cp-modal-label">Latitude</label>
                <input
                  className="cp-modal-input"
                  type="text"
                  value={charityForm.latitude}
                  readOnly
                />
              </div>

              <div className="cp-modal-field">
                <label className="cp-modal-label">Longitude</label>
                <input
                  className="cp-modal-input"
                  type="text"
                  value={charityForm.longitude}
                  readOnly
                />
              </div>
            </div>

            <div className="cp-modal-actions">
              <button
                className="cp-btn-secondary"
                onClick={() => setShowCharityModal(false)}
              >
                Cancel
              </button>

              <button className="cp-btn-primary" onClick={handleSaveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="cp-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="cp-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="cp-modal-title">Change Password</h2>

            <form onSubmit={handlePasswordSave} className="cp-modal-form">
              <div className="cp-modal-field">
                <label className="cp-modal-label">Current Password</label>
                <input
                  className="cp-modal-input"
                  type="password"
                  name="current"
                  placeholder="Enter current password"
                  value={passwordForm.current}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="cp-modal-field">
                <label className="cp-modal-label">New Password</label>
                <input
                  className="cp-modal-input"
                  type="password"
                  name="newPass"
                  placeholder="Min. 6 characters"
                  value={passwordForm.newPass}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="cp-modal-field">
                <label className="cp-modal-label">Confirm New Password</label>
                <input
                  className="cp-modal-input"
                  type="password"
                  name="confirm"
                  placeholder="Repeat new password"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                />
              </div>

              {passwordError && <p className="cp-modal-error">{passwordError}</p>}

              {passwordSuccess && (
                <p className="cp-modal-success">
                  Password changed successfully.
                </p>
              )}

              <div className="cp-modal-actions">
                <button
                  type="button"
                  className="cp-btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="cp-btn-primary">
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CharityProfile;