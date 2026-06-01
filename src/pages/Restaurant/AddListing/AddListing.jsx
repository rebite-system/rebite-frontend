import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AddListing.css";
import useListings from "../../../hooks/useListings";
import api from "../../../api/axios";

function AddListing() {
  const navigate = useNavigate();
  const { addListing } = useListings();

  const [form, setForm] = useState({
    title: "",
    category: "",
    portions: "",
    pickupFrom: "",
    pickupUntil: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

  function handleChange(e) {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: value,
    });

    setErrors({
      ...errors,
      [name]: "",
    });
  }

  function validate() {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Food name is required";
    }

    if (!form.category) {
      newErrors.category = "Category is required";
    }

    if (!form.portions) {
      newErrors.portions = "Number of portions is required";
    } else if (Number(form.portions) <= 0) {
      newErrors.portions = "Portions must be more than 0";
    }

    if (!form.pickupFrom) {
      newErrors.pickupFrom = "Pickup start time is required";
    }

    if (!form.pickupUntil) {
      newErrors.pickupUntil = "Pickup end time is required";
    }

    if (form.notes.length > 1000) {
      newErrors.notes = "Notes must be less than 1000 characters";
    }

    return newErrors;
  }

  function resetForm() {
    setForm({
      title: "",
      category: "",
      portions: "",
      pickupFrom: "",
      pickupUntil: "",
      notes: "",
    });

    setErrors({});
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    try {
      setLoading(true);

      const today = getTodayDate();
      const expiry = `${today} ${form.pickupUntil}:00`;

      const formData = new FormData();

      formData.append("title", form.title);
      formData.append("category", form.category);
      formData.append("quantity", form.portions);
      formData.append("pickup_from", form.pickupFrom);
      formData.append("pickup_until", form.pickupUntil);
      formData.append("expiry", expiry);
      formData.append("notes", form.notes);

      const res = await api.post("/food", formData);

      addListing({
        id: res.data.data.id,
        title: res.data.data.title,
        status: res.data.data.status || "active",
        portions: `${res.data.data.quantity} portions`,
        time: `${form.pickupFrom} – ${form.pickupUntil}`,
        postedAgo: "Just now",
        claimedBy: null,
        category: res.data.data.category,
        notes: res.data.data.notes,
      });

      setSuccessModal(true);
      resetForm();
    } catch (err) {
      console.log(err.response?.data || err.message);

      setErrors({
        general:
          err.response?.data?.message ||
          "Failed to create listing. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="add-listing">
      <div className="al-header">
        <div>
          <p className="al-kicker">Today’s surplus food</p>

          <h1 className="al-title">Add Food Listing</h1>

          <p className="al-sub">
            Add today’s surplus food and set the pickup window for charities.
          </p>
        </div>

        <button
          className="al-back-btn"
          onClick={() => navigate("/restaurant")}
        >
          ← Dashboard
        </button>
      </div>

      <div className="al-form-wrapper">
        <form onSubmit={handleSubmit} className="al-form">
          {errors.general && (
            <div className="al-error-box">{errors.general}</div>
          )}

          <div className="al-grid">
            <div className="al-col">
              <div className="al-section-title">
                🍽️ Food Details
              </div>

              <div className="al-field">
                <label className="al-label">
                  Food Name
                </label>

                <input
                  className="al-input"
                  type="text"
                  name="title"
                  placeholder="e.g. Grilled Chicken & Rice"
                  value={form.title}
                  onChange={handleChange}
                />

                {errors.title && (
                  <p className="al-error">{errors.title}</p>
                )}
              </div>

              <div className="al-field">
                <label className="al-label">
                  Category
                </label>

                <select
                  className="al-input"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">
                    Select a category
                  </option>

                  <option value="cooked_meals">
                    Cooked Meals
                  </option>

                  <option value="bakery">
                    Bread & Bakery
                  </option>

                  <option value="vegetables_fruits">
                    Vegetables & Fruits
                  </option>

                  <option value="dairy">
                    Dairy Products
                  </option>

                  <option value="other">
                    Other
                  </option>
                </select>

                {errors.category && (
                  <p className="al-error">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="al-field">
                <label className="al-label">
                  Number of Portions
                </label>

                <input
                  className="al-input"
                  type="number"
                  name="portions"
                  placeholder="e.g. 25"
                  value={form.portions}
                  onChange={handleChange}
                  min="1"
                />

                {errors.portions && (
                  <p className="al-error">
                    {errors.portions}
                  </p>
                )}
              </div>

              <div className="al-field">
                <label className="al-label">
                  Notes{" "}
                  <span className="al-optional">
                    (optional)
                  </span>
                </label>

                <textarea
                  className="al-input al-textarea"
                  name="notes"
                  placeholder="Add pickup instructions, packaging notes, or food condition..."
                  value={form.notes}
                  onChange={handleChange}
                />

                <div className="al-count">
                  {form.notes.length}/1000
                </div>

                {errors.notes && (
                  <p className="al-error">
                    {errors.notes}
                  </p>
                )}
              </div>
            </div>

            <div className="al-col">
              <div className="al-section-title">
                🕐 Pickup Window
              </div>

              <div className="al-row">
                <div className="al-field">
                  <label className="al-label">
                    Pickup From
                  </label>

                  <input
                    className="al-input"
                    type="time"
                    name="pickupFrom"
                    value={form.pickupFrom}
                    onChange={handleChange}
                  />

                  {errors.pickupFrom && (
                    <p className="al-error">
                      {errors.pickupFrom}
                    </p>
                  )}
                </div>

                <div className="al-field">
                  <label className="al-label">
                    Pickup Until
                  </label>

                  <input
                    className="al-input"
                    type="time"
                    name="pickupUntil"
                    value={form.pickupUntil}
                    onChange={handleChange}
                  />

                  {errors.pickupUntil && (
                    <p className="al-error">
                      {errors.pickupUntil}
                    </p>
                  )}
                </div>
              </div>

              <div className="al-info-card">
                <span>ℹ️</span>

                <p>
                  This listing will expire today at
                  the pickup end time. Charities
                  will only see it while it is
                  active.
                </p>
              </div>
            </div>
          </div>

          <div className="al-divider" />

          <div className="al-actions">
            <button
              type="button"
              className="al-btn-secondary"
              onClick={() => navigate("/restaurant")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="al-btn-primary"
              disabled={loading}
            >
              {loading ? "Posting..." : "Post Listing"}
            </button>
          </div>
        </form>
      </div>

      {successModal && (
        <div className="al-modal-overlay">
          <div className="al-success-modal">
            <button
              className="al-modal-close"
              onClick={() =>
                setSuccessModal(false)
              }
            >
              ✕
            </button>

            <div className="success-icon">
              ✅
            </div>

            <h2>
              Listing Added Successfully
            </h2>

            <p>
              Your surplus food listing is now
              active and available for nearby
              charities.
            </p>

            <div className="al-modal-actions">
              <button
                className="al-btn-secondary"
                onClick={() =>
                  setSuccessModal(false)
                }
              >
                Add Another
              </button>

              <button
                className="al-btn-primary"
                onClick={() =>
                  navigate(
                    "/restaurant/manage-listings"
                  )
                }
              >
                View Listings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddListing;