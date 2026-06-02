import { useEffect, useState } from "react";
import "./CharityHome.css";
import api from "../../../api/axios";

const urgencyConfig = {
  high: { label: "High", color: "#c0392b", bg: "#fee9e7", border: "#f5b7b1" },
  medium: { label: "Medium", color: "#e67e00", bg: "#fff5d9", border: "#fad7a0" },
  low: { label: "Low", color: "#1e8449", bg: "#eaf9ea", border: "#a9dfbf" },
  expired: { label: "Expired", color: "#c0392b", bg: "#fdecea", border: "#f5b7b1" },
};

const filters = [
  { key: "all", label: "All" },
  { key: "high", label: "High Urgency" },
  { key: "near", label: "Nearby" },
  { key: "cooked_meals", label: "Cooked Meals" },
  { key: "bakery", label: "Bakery" },
  { key: "vegetables_fruits", label: "Vegetables & Fruits" },
];

function CharityHome() {
  const [listings, setListings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [charityLocation, setCharityLocation] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedListing, setSelectedListing] = useState(null);
  const [claimQuantity, setClaimQuantity] = useState(1);
  const [claimError, setClaimError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchProfileAndFoods();
    fetchMyClaims();
  }, []);

  async function fetchProfileAndFoods() {
    try {
      const profileRes = await api.get("/profile");
      const user = profileRes.data.data || profileRes.data;

      const charityCoords = {
        latitude: Number(user.latitude),
        longitude: Number(user.longitude),
      };

      setCharityLocation(
        charityCoords.latitude && charityCoords.longitude ? charityCoords : null
      );

      await fetchFoods(charityCoords);
    } catch (err) {
      console.log(err.response?.data || err.message);
      fetchFoods(null);
    }
  }

  async function fetchFoods(charityCoords) {
    try {
      const res = await api.get("/foods");
      const foods = res.data.data?.data || res.data.data || [];

      const availableFoods = foods.filter(
        (food) =>
          Number(food.quantity) > 0 &&
          food.status === "active" &&
          !isExpired(food)
      );

      const formatted = availableFoods.map((food) => {
        const restaurantLat = Number(food.restaurant?.latitude);
        const restaurantLng = Number(food.restaurant?.longitude);

        const distanceKm =
          charityCoords?.latitude &&
          charityCoords?.longitude &&
          restaurantLat &&
          restaurantLng
            ? calculateDistanceKm(
                charityCoords.latitude,
                charityCoords.longitude,
                restaurantLat,
                restaurantLng
              )
            : null;

        return {
          id: food.id,
          restaurantName: food.restaurant?.name || "Restaurant",
          restaurantInitials:
            food.restaurant?.name?.substring(0, 2)?.toUpperCase() || "RS",
          category: food.category || "other",
          foodType: formatCategory(food.category),
          items: food.title,
          quantity: Number(food.quantity || 0),
          portions: `${food.quantity} portions`,
          distanceKm,
          distance:
            distanceKm !== null
              ? `${distanceKm.toFixed(1)} km`
              : "Location not set",
          timeLeft: getTimeLeftText(food),
          pickup: formatPickup(food.pickup_from, food.pickup_until),
          tags: distanceKm !== null && distanceKm <= 5 ? ["Nearby"] : ["Fresh Food"],
          urgency: getCurrentUrgency(food),
          claimed: false,
        };
      });

      setListings(formatted);
    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Failed to load foods");
    }
  }

  async function fetchMyClaims() {
    try {
      const res = await api.get("/my-claims");
      setClaims(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  function getPickupDeadline(food) {
    if (!food.pickup_until) return null;

    const baseDate = food.created_at ? new Date(food.created_at) : new Date();

    const [untilH, untilM] = food.pickup_until
      .slice(0, 5)
      .split(":")
      .map(Number);

    const deadline = new Date(baseDate);
    deadline.setHours(untilH, untilM, 0, 0);

    if (food.pickup_from) {
      const [fromH, fromM] = food.pickup_from
        .slice(0, 5)
        .split(":")
        .map(Number);

      const start = new Date(baseDate);
      start.setHours(fromH, fromM, 0, 0);

      if (deadline < start) {
        deadline.setDate(deadline.getDate() + 1);
      }
    }

    return deadline;
  }

  function getHoursLeft(food) {
    const deadline = getPickupDeadline(food);
    if (!deadline) return null;

    return (deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60);
  }

  function isExpired(food) {
    const hoursLeft = getHoursLeft(food);
    return hoursLeft !== null && hoursLeft <= 0;
  }

  function getCurrentUrgency(food) {
    if (isExpired(food)) return "expired";

    const hoursLeft = getHoursLeft(food);

    if (hoursLeft === null) return "low";
    if (hoursLeft <= 3) return "high";
    if (hoursLeft <= 10) return "medium";
    return "low";
  }

  function getTimeLeftText(food) {
    const deadline = getPickupDeadline(food);
    if (!deadline) return "Available";

    const minutesLeft = Math.floor(
      (deadline.getTime() - new Date().getTime()) / (1000 * 60)
    );

    if (minutesLeft <= 0) return "Expired";

    const hours = Math.floor(minutesLeft / 60);
    const minutes = minutesLeft % 60;

    if (hours === 0) return `${minutes}m left`;
    return `${hours}h ${minutes}m left`;
  }

  function formatPickup(from, until) {
    if (!from && !until) return "—";
    return `${from ? from.slice(0, 5) : "—"} – ${
      until ? until.slice(0, 5) : "—"
    }`;
  }

  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371;
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(lat1)) *
        Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return earthRadius * c;
  }

  function toRadians(value) {
    return (value * Math.PI) / 180;
  }

  function formatCategory(category) {
    const names = {
      cooked_meals: "Cooked Meals",
      bakery: "Bread & Bakery",
      vegetables_fruits: "Vegetables & Fruits",
      dairy: "Dairy Products",
      other: "Other",
    };

    return names[category] || "Other";
  }

  function openClaimModal(listing) {
    if (listing.claimed) return;

    setSelectedListing(listing);
    setClaimQuantity(1);
    setClaimError("");
    setMessage("");
  }

  function closeClaimModal() {
    setSelectedListing(null);
    setClaimQuantity(1);
    setClaimError("");
  }

  async function submitClaim() {
    if (!selectedListing) return;

    const quantity = Number(claimQuantity);

    if (!quantity || quantity <= 0) {
      setClaimError("Please enter a valid quantity.");
      return;
    }

    if (quantity > selectedListing.quantity) {
      setClaimError(`Only ${selectedListing.quantity} portions are available.`);
      return;
    }

    try {
      await api.post("/claim", {
        food_id: selectedListing.id,
        quantity,
      });

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === selectedListing.id
            ? { ...listing, claimed: true }
            : listing
        )
      );

      setMessage("Claim request sent successfully.");
      closeClaimModal();
      fetchMyClaims();
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || "Claim failed. Please try again.";

      if (errorMessage === "Already claimed") {
        setListings((prev) =>
          prev.map((listing) =>
            listing.id === selectedListing.id
              ? { ...listing, claimed: true }
              : listing
          )
        );

        setMessage("You already sent a request for this listing.");
        closeClaimModal();
        return;
      }

      setClaimError(errorMessage);
    }
  }

  const totalClaims = claims.length;
  const collectedClaims = claims.filter((c) => c.status === "collected").length;
  const savedPortions = claims
    .filter((c) => c.status === "collected")
    .reduce((sum, c) => sum + Number(c.quantity || 0), 0);

  const urgentNearbyCount = listings.filter(
    (listing) =>
      listing.urgency === "high" &&
      listing.distanceKm !== null &&
      listing.distanceKm <= 5 &&
      !listing.claimed
  ).length;

  const filtered = listings.filter((listing) => {
    const searchValue = search.toLowerCase();

    const matchSearch =
      listing.restaurantName.toLowerCase().includes(searchValue) ||
      listing.items.toLowerCase().includes(searchValue) ||
      listing.foodType.toLowerCase().includes(searchValue);

    const matchFilter =
      activeFilter === "all" ||
      (activeFilter === "high" && listing.urgency === "high") ||
      (activeFilter === "near" &&
        listing.distanceKm !== null &&
        listing.distanceKm <= 5) ||
      listing.category === activeFilter;

    return matchSearch && matchFilter;
  });

  const sortedFiltered = [...filtered].sort((a, b) => {
    const order = { high: 1, medium: 2, low: 3, expired: 4 };

    if (a.urgency !== b.urgency) {
      return order[a.urgency] - order[b.urgency];
    }

    if (a.distanceKm !== null && b.distanceKm !== null) {
      return a.distanceKm - b.distanceKm;
    }

    if (a.distanceKm !== null) return -1;
    if (b.distanceKm !== null) return 1;

    return 0;
  });

  return (
    <div className="charity-home">
      <div className="ch-header">
        <div>
          <p className="ch-greet">Good evening 👋</p>
          <h1 className="ch-title">Available Listings</h1>
        </div>
      </div>

      {!charityLocation && (
        <div className="ch-message">
          Add your current location in Profile to see accurate nearby matching.
        </div>
      )}

      {message && <div className="ch-message">{message}</div>}

      {urgentNearbyCount > 0 && (
        <div className="smart-alert">
          ⚠️ {urgentNearbyCount} urgent nearby donation
          {urgentNearbyCount > 1 ? "s are" : " is"} available. Please claim soon.
        </div>
      )}

      <div className="ch-impact">
        <div className="ch-impact-item">
          <div className="ch-impact-num">{listings.length}</div>
          <div className="ch-impact-lbl">Available</div>
        </div>

        <div className="ch-impact-sep" />

        <div className="ch-impact-item">
          <div className="ch-impact-num">{totalClaims}</div>
          <div className="ch-impact-lbl">Total Claims</div>
        </div>

        <div className="ch-impact-sep" />

        <div className="ch-impact-item">
          <div className="ch-impact-num">{collectedClaims}</div>
          <div className="ch-impact-lbl">Collected</div>
        </div>

        <div className="ch-impact-sep" />

        <div className="ch-impact-item">
          <div className="ch-impact-num">{savedPortions}</div>
          <div className="ch-impact-lbl">Saved Portions</div>
        </div>
      </div>

      <div className="ch-analytics-note">
        Waste reduction impact: {savedPortions} food portions successfully saved
        through collected donations.
      </div>

      <div className="ch-search">
        <span className="ch-search-icon">🔍</span>

        <input
          className="ch-search-input"
          placeholder="Search food, restaurant..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button className="ch-search-clear" onClick={() => setSearch("")}>
            ✕
          </button>
        )}
      </div>

      <div className="ch-filters">
        {filters.map((filter) => (
          <button
            key={filter.key}
            className={`ch-pill ${activeFilter === filter.key ? "active" : ""}`}
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="ch-results-row">
        <span className="ch-results-txt">
          {sortedFiltered.length} listing
          {sortedFiltered.length !== 1 ? "s" : ""} available
        </span>

        <span className="ch-sort-txt">Sorted by urgency and distance ↓</span>
      </div>

      {sortedFiltered.length === 0 ? (
        <div className="ch-empty">
          <div className="ch-empty-icon">📭</div>
          <div className="ch-empty-title">No listings found</div>
          <div className="ch-empty-sub">
            Try a different filter, search term, or update your profile location.
          </div>
        </div>
      ) : (
        <div className="ch-grid">
          {sortedFiltered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              onClaim={openClaimModal}
            />
          ))}
        </div>
      )}

      {selectedListing && (
        <div className="claim-modal-overlay" onClick={closeClaimModal}>
          <div className="claim-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="claim-modal-title">Claim Food Listing</h2>

            <p className="claim-modal-sub">
              How many portions do you want to request?
            </p>

            <div className="claim-modal-food">
              <strong>{selectedListing.items}</strong>
              <span>{selectedListing.quantity} portions available</span>
            </div>

            <div className="claim-field">
              <label>Requested Portions</label>

              <input
                type="number"
                min="1"
                max={selectedListing.quantity}
                value={claimQuantity}
                onChange={(e) => {
                  setClaimQuantity(e.target.value);
                  setClaimError("");
                }}
              />
            </div>

            {claimError && <p className="claim-error">{claimError}</p>}

            <div className="claim-modal-actions">
              <button className="claim-cancel-btn" onClick={closeClaimModal}>
                Cancel
              </button>

              <button className="claim-submit-btn" onClick={submitClaim}>
                Send Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ListingCard({ listing, onClaim }) {
  const urgency = urgencyConfig[listing.urgency] || urgencyConfig.low;

  return (
    <div className={`ch-card ${listing.urgency === "high" ? "urgent" : ""}`}>
      <div className="ch-card-hdr">
        <div className="ch-rest-info">
          <div className="ch-avatar">{listing.restaurantInitials}</div>

          <div>
            <div className="ch-rest-name">{listing.restaurantName}</div>
            <div className="ch-food-type">{listing.foodType}</div>
          </div>
        </div>

        <div
          className="ch-badge"
          style={{
            background: urgency.bg,
            borderColor: urgency.border,
          }}
        >
          <div className="ch-badge-dot" style={{ background: urgency.color }} />

          <div className="ch-badge-txt" style={{ color: urgency.color }}>
            {urgency.label}
          </div>
        </div>
      </div>

      <div className="ch-divider" />

      <div className="ch-items">{listing.items}</div>

      <div className="ch-meta">
        <span>📦 {listing.portions}</span>
        <div className="ch-meta-sep" />
        <span>📍 {listing.distance}</span>
        <div className="ch-meta-sep" />
        <span
          className={
            listing.urgency === "high" ? "ch-time-urgent" : ""
          }
        >
          ⏱ {listing.timeLeft}
        </span>
      </div>

      <div className="ch-pickup">
        Pickup: <span>{listing.pickup}</span>
      </div>

      <div className="ch-tags">
        {listing.tags.map((tag) => (
          <span key={tag} className="ch-tag">
            {tag}
          </span>
        ))}
      </div>

      <button
        className={`ch-claim-btn ${listing.claimed ? "claimed" : ""}`}
        onClick={() => !listing.claimed && onClaim(listing)}
        disabled={listing.claimed}
      >
        {listing.claimed ? "✓ Request Sent" : "Claim this listing"}
      </button>
    </div>
  );
}

export default CharityHome;