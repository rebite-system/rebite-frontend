import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";
import api from "../../../api/axios";

function Profile() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);

  const [restaurantForm, setRestaurantForm] = useState({
    name: "",
    cuisine: "",
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

      setRestaurantForm({
        name: user.name || "",
        cuisine: user.cuisine || "",
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
    if (!name) return "RB";

    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  function handleRestaurantChange(e) {
    setRestaurantForm({
      ...restaurantForm,
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
        setRestaurantForm((prev) => ({
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
      const res = await api.put("/profile", restaurantForm);
      const updatedUser = res.data.data || restaurantForm;

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setRestaurantForm({
        name: updatedUser.name || "",
        cuisine: updatedUser.cuisine || "",
        location: updatedUser.location || "",
        phone: updatedUser.phone || "",
        email: updatedUser.email || "",
        latitude: updatedUser.latitude || "",
        longitude: updatedUser.longitude || "",
      });

      setMessage("Profile updated successfully.");
      setShowRestaurantModal(false);
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
    <div className="profile">
      <div className="profile-header">
        <h1 className="profile-title">Profile</h1>
        <p className="profile-sub">
          Manage your restaurant account, location, and security settings.
        </p>
      </div>

      {message && <div className="profile-message">{message}</div>}

      <div className="profile-layout">
        <div className="profile-left">
          <div className="profile-card">
            <div className="profile-avatar">
              {getInitials(restaurantForm.name)}
            </div>

            <div className="profile-name">
              {restaurantForm.name || "Restaurant"}
            </div>

            <div className="profile-type">
              {restaurantForm.cuisine || "Restaurant Partner"}
            </div>

            <div className="profile-info-line">
              📧 {restaurantForm.email || "No email"}
            </div>

            <div className="profile-info-line">
              📞 {restaurantForm.phone || "No phone"}
            </div>

            <div className="profile-info-line">
              📍 {restaurantForm.location || "No location"}
            </div>

            <button
              className="profile-edit-btn"
              onClick={() => setShowRestaurantModal(true)}
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="profile-right">
          <div className="profile-section">
            <div className="section-label">Account</div>

            <div className="settings-card">
              <div className="setting-row no-hover">
                <div className="setting-icon">📧</div>

                <div>
                  <div className="setting-lbl">Email</div>
                  <div className="setting-sub">
                    {restaurantForm.email || "No email"}
                  </div>
                </div>
              </div>

              <div className="setting-row no-hover">
                <div className="setting-icon">📞</div>

                <div>
                  <div className="setting-lbl">Phone</div>
                  <div className="setting-sub">
                    {restaurantForm.phone || "No phone"}
                  </div>
                </div>
              </div>

              <div className="setting-row no-hover">
                <div className="setting-icon">📍</div>

                <div>
                  <div className="setting-lbl">Location</div>
                  <div className="setting-sub">
                    {restaurantForm.location || "No location"}
                  </div>
                </div>
              </div>

              <div
                className="setting-row"
                onClick={() => setShowPasswordModal(true)}
              >
                <div className="setting-icon">🔒</div>

                <div>
                  <div className="setting-lbl">Change password</div>
                  <div className="setting-sub">
                    Update your account password
                  </div>
                </div>

                <div className="setting-chev">›</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-label">Preferences</div>

            <div className="settings-card">
              <div className="setting-row no-hover">
                <div className="setting-icon">🔔</div>

                <div>
                  <div className="setting-lbl">Push notifications</div>
                  <div className="setting-sub">
                    Receive alerts for new charity requests
                  </div>
                </div>

                <div
                  className={`pref-toggle ${notifications ? "on" : "off"}`}
                  onClick={() => setNotifications(!notifications)}
                >
                  <div className="pref-thumb" />
                </div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div className="section-label">Session</div>

            <div className="settings-card">
              <div className="setting-row danger" onClick={handleSignOut}>
                <div className="setting-icon danger">🚪</div>

                <div>
                  <div className="setting-lbl danger">Sign out</div>
                  <div className="setting-sub">Log out from your account</div>
                </div>
              </div>
            </div>
          </div>

          <div className="profile-version">ReBite v1.0.0</div>
        </div>
      </div>

      {showRestaurantModal && (
        <div
          className="profile-overlay"
          onClick={() => setShowRestaurantModal(false)}
        >
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Profile</h2>

            <div className="modal-form">
              <div className="modal-field">
                <label className="modal-label">Restaurant Name</label>
                <input
                  className="modal-input"
                  type="text"
                  name="name"
                  value={restaurantForm.name}
                  onChange={handleRestaurantChange}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Cuisine Type</label>
                <input
                  className="modal-input"
                  type="text"
                  name="cuisine"
                  value={restaurantForm.cuisine}
                  onChange={handleRestaurantChange}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Email</label>
                <input
                  className="modal-input"
                  type="email"
                  name="email"
                  value={restaurantForm.email}
                  onChange={handleRestaurantChange}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Phone</label>
                <input
                  className="modal-input"
                  type="text"
                  name="phone"
                  value={restaurantForm.phone}
                  onChange={handleRestaurantChange}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Location</label>
                <input
                  className="modal-input"
                  type="text"
                  name="location"
                  value={restaurantForm.location}
                  onChange={handleRestaurantChange}
                />
              </div>

              <button
                type="button"
                className="location-btn"
                onClick={getCurrentLocation}
              >
                📍 Use Current Location
              </button>

              <div className="modal-field">
                <label className="modal-label">Latitude</label>
                <input
                  className="modal-input"
                  type="text"
                  value={restaurantForm.latitude}
                  readOnly
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Longitude</label>
                <input
                  className="modal-input"
                  type="text"
                  value={restaurantForm.longitude}
                  readOnly
                />
              </div>
            </div>

            <div className="modal-actions">
              <button
                className="modal-btn-secondary"
                onClick={() => setShowRestaurantModal(false)}
              >
                Cancel
              </button>

              <button className="modal-btn-primary" onClick={handleSaveProfile}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div
          className="profile-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Change Password</h2>

            <form onSubmit={handlePasswordSave} className="modal-form">
              <div className="modal-field">
                <label className="modal-label">Current Password</label>
                <input
                  className="modal-input"
                  type="password"
                  name="current"
                  placeholder="Enter current password"
                  value={passwordForm.current}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">New Password</label>
                <input
                  className="modal-input"
                  type="password"
                  name="newPass"
                  placeholder="Min. 6 characters"
                  value={passwordForm.newPass}
                  onChange={handlePasswordChange}
                />
              </div>

              <div className="modal-field">
                <label className="modal-label">Confirm New Password</label>
                <input
                  className="modal-input"
                  type="password"
                  name="confirm"
                  placeholder="Repeat new password"
                  value={passwordForm.confirm}
                  onChange={handlePasswordChange}
                />
              </div>

              {passwordError && <p className="modal-error">{passwordError}</p>}

              {passwordSuccess && (
                <p className="modal-success">
                  Password changed successfully.
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="modal-btn-secondary"
                  onClick={() => setShowPasswordModal(false)}
                >
                  Cancel
                </button>

                <button type="submit" className="modal-btn-primary">
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

export default Profile;