import "./DonorProfile.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

function DonorProfile() {
  const navigate = useNavigate();
  const savedUser = JSON.parse(localStorage.getItem("user"));

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    card_last4: "",
    vodafone_number: "",
    instapay_address: "",
  });

  const [originalData, setOriginalData] = useState(null);

  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [errors, setErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [message, setMessage] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await api.get("/profile");
      const user = res.data.data || {};

      const profileData = {
        name: user.name || savedUser?.name || "",
        email: user.email || savedUser?.email || "",
        phone: user.phone || "",
        location: user.location || "",
        card_last4: user.card_last4 || "",
        vodafone_number: user.vodafone_number || "",
        instapay_address: user.instapay_address || "",
      };

      setFormData(profileData);
      setOriginalData(profileData);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  function startEdit() {
    setOriginalData(formData);
    setErrors({});
    setMessage("");
    setIsEditing(true);
  }

  function cancelEdit() {
    setFormData(originalData);
    setErrors({});
    setMessage("");
    setIsEditing(false);
  }

  function handleProfileChange(e) {
    let { name, value } = e.target;

    if (
      name === "phone" ||
      name === "vodafone_number" ||
      name === "card_last4"
    ) {
      value = value.replace(/\D/g, "");
    }

    setFormData({
      ...formData,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });

    setMessage("");
  }

  function handlePasswordChange(e) {
    setPasswords({
      ...passwords,
      [e.target.name]: e.target.value,
    });

    setPasswordErrors({
      ...passwordErrors,
      [e.target.name]: "",
    });

    setMessage("");
  }

  function validateProfile() {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required.";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Name must be at least 3 characters.";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Enter a valid email address.";
    }

    if (formData.phone && !/^01\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Enter a valid Egyptian phone number.";
    }

    if (formData.card_last4 && !/^\d{4}$/.test(formData.card_last4)) {
      newErrors.card_last4 = "Card last 4 digits must be exactly 4 numbers.";
    }

    if (
      formData.vodafone_number &&
      !/^01\d{9}$/.test(formData.vodafone_number)
    ) {
      newErrors.vodafone_number = "Enter a valid Vodafone Cash number.";
    }

    if (formData.instapay_address && !formData.instapay_address.includes("@")) {
      newErrors.instapay_address = "InstaPay address must contain @.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function validatePassword() {
    const newErrors = {};

    if (!passwords.current_password) {
      newErrors.current_password = "Current password is required.";
    }

    if (!passwords.new_password) {
      newErrors.new_password = "New password is required.";
    } else if (passwords.new_password.length < 8) {
      newErrors.new_password = "Password must be at least 8 characters.";
    } else if (!/[A-Z]/.test(passwords.new_password)) {
      newErrors.new_password = "Password must contain an uppercase letter.";
    } else if (!/[a-z]/.test(passwords.new_password)) {
      newErrors.new_password = "Password must contain a lowercase letter.";
    } else if (!/[0-9]/.test(passwords.new_password)) {
      newErrors.new_password = "Password must contain a number.";
    } else if (!/[@$!%*#?&]/.test(passwords.new_password)) {
      newErrors.new_password = "Password must contain a special character.";
    }

    if (!passwords.new_password_confirmation) {
      newErrors.new_password_confirmation = "Please confirm your password.";
    } else if (passwords.new_password !== passwords.new_password_confirmation) {
      newErrors.new_password_confirmation = "Passwords do not match.";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSaveProfile(e) {
    e.preventDefault();

    if (!validateProfile()) return;

    try {
      setLoadingProfile(true);

      const res = await api.put("/profile", formData);

      const updatedUser = res.data.data || {
        ...savedUser,
        ...formData,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      setOriginalData(formData);
      setIsEditing(false);
      setMessage("Profile updated successfully 💚");

      fetchProfile();
    } catch (err) {
      console.log(err.response?.data || err.message);

      setErrors({
        general:
          err.response?.data?.message ||
          "Failed to update profile. Please try again.",
      });
    } finally {
      setLoadingProfile(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();

    if (!validatePassword()) return;

    try {
      setLoadingPassword(true);

      await api.put("/change-password", passwords);

      setMessage("Password changed successfully 🔐");

      setPasswords({
        current_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
    } catch (err) {
      console.log(err.response?.data || err.message);

      setPasswordErrors({
        general:
          err.response?.data?.message ||
          "Failed to change password. Please check your current password.",
      });
    } finally {
      setLoadingPassword(false);
    }
  }

  return (
    <div className="profile-page">
      <nav className="profile-navbar">
        <div className="profile-logo" onClick={() => navigate("/donor")}>
          <span>🌿</span>

          <div>
            <h3>ReBite</h3>
            <p>Donor Portal</p>
          </div>
        </div>


        <button className="back-btn" onClick={() => navigate("/donor")}>
          ← Dashboard
        </button>
      </nav>

      <main className="profile-container">
        <section className="profile-hero">
          <div className="profile-avatar">
            {formData.name?.charAt(0)?.toUpperCase() || "D"}
          </div>

          <div>
            <p>Donor Account</p>
            <h1>{formData.name || "Donor Profile"}</h1>
            <span>Manage your information and saved payment methods.</span>
          </div>
        </section>

        {message && <div className="success-message">{message}</div>}

        <section className="profile-layout">
          <div className="profile-left">
            <form className="profile-card" onSubmit={handleSaveProfile}>
              <div className="profile-card-header between">
                <div>
                  <span>👤</span>
                  <div>
                    <h2>Account Information</h2>
                    <p>Your personal donor details.</p>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={startEdit}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {errors.general && (
                <div className="error-box">{errors.general}</div>
              )}

              {!isEditing ? (
                <div className="info-grid">
                  <InfoItem label="Full Name" value={formData.name} />
                  <InfoItem label="Email" value={formData.email} />
                  <InfoItem
                    label="Phone"
                    value={formData.phone || "Not added"}
                  />
                  <InfoItem
                    label="Location"
                    value={formData.location || "Not added"}
                  />
                </div>
              ) : (
                <div className="profile-grid">
                  <InputField
                    label="Full Name"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    placeholder="Enter your full name"
                    error={errors.name}
                  />

                  <InputField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleProfileChange}
                    placeholder="you@example.com"
                    error={errors.email}
                  />

                  <InputField
                    label="Phone Number"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    placeholder="01XXXXXXXXX"
                    maxLength="11"
                    error={errors.phone}
                  />

                  <InputField
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleProfileChange}
                    placeholder="Cairo, Egypt"
                    error={errors.location}
                  />
                </div>
              )}

              <div className="payment-section">
                <div className="profile-card-header mini">
                  <div>
                    <span>💳</span>
                    <div>
                      <h2>Saved Payment Methods</h2>
                      <p>Used to make future donations faster.</p>
                    </div>
                  </div>
                </div>

                <div className="payment-view-grid">
                  <div className="saved-card-preview">
                    <div className="card-chip">💳</div>

                    <div>
                      <p>Saved Card</p>
                      <h3>
                        {formData.card_last4
                          ? `****  ${formData.card_last4}`
                          : "No card saved"}
                      </h3>
                    </div>
                  </div>

                  <div className="mini-payment-card">
                    <span>📱</span>
                    <p>Vodafone Cash</p>
                    <strong>{formData.vodafone_number || "Not added"}</strong>
                  </div>

                  <div className="mini-payment-card">
                    <span>🏦</span>
                    <p>InstaPay</p>
                    <strong>{formData.instapay_address || "Not added"}</strong>
                  </div>
                </div>

                {isEditing && (
                  <div className="profile-grid payment-edit-grid">
                    <InputField
                      label="Card Last 4 Digits"
                      name="card_last4"
                      value={formData.card_last4}
                      onChange={handleProfileChange}
                      placeholder="4242"
                      maxLength="4"
                      error={errors.card_last4}
                    />

                    <InputField
                      label="Vodafone Cash"
                      name="vodafone_number"
                      value={formData.vodafone_number}
                      onChange={handleProfileChange}
                      placeholder="01012345678"
                      maxLength="11"
                      error={errors.vodafone_number}
                    />

                    <InputField
                      label="InstaPay Address"
                      name="instapay_address"
                      value={formData.instapay_address}
                      onChange={handleProfileChange}
                      placeholder="name@instapay"
                      error={errors.instapay_address}
                      full
                    />
                  </div>
                )}
              </div>

              {isEditing && (
                <div className="edit-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>

                  <button className="save-btn" disabled={loadingProfile}>
                    {loadingProfile ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </form>
          </div>

          <form
            className="profile-card security-card"
            onSubmit={handleChangePassword}
          >
            <div className="profile-card-header">
              <div>
                <span>🔐</span>
                <div>
                  <h2>Security</h2>
                  <p>Update your password safely.</p>
                </div>
              </div>
            </div>

            {passwordErrors.general && (
              <div className="error-box">{passwordErrors.general}</div>
            )}

            <InputField
              label="Current Password"
              name="current_password"
              type="password"
              value={passwords.current_password}
              onChange={handlePasswordChange}
              placeholder="Enter current password"
              error={passwordErrors.current_password}
            />

            <InputField
              label="New Password"
              name="new_password"
              type="password"
              value={passwords.new_password}
              onChange={handlePasswordChange}
              placeholder="Min. 8 characters"
              error={passwordErrors.new_password}
            />

            <InputField
              label="Confirm Password"
              name="new_password_confirmation"
              type="password"
              value={passwords.new_password_confirmation}
              onChange={handlePasswordChange}
              placeholder="Repeat new password"
              error={passwordErrors.new_password_confirmation}
            />

            <div className="security-note">
              Password must include uppercase, lowercase, number, and special
              character.
            </div>

            <button className="save-btn" disabled={loadingPassword}>
              {loadingPassword ? "Updating..." : "Update Password"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="info-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  type = "text",
  maxLength,
  full = false,
}) {
  return (
    <div className={`input-group ${full ? "full" : ""}`}>
      <label>{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
      />

      {error && <p className="error">{error}</p>}
    </div>
  );
}

export default DonorProfile;