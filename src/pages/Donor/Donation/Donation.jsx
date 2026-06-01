import "./Donation.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axios";

function Donation() {
  const navigate = useNavigate();

  const [charities, setCharities] = useState([]);
  const [selectedCharity, setSelectedCharity] = useState("");
  const [savedPayment, setSavedPayment] = useState(null);

  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentReference, setPaymentReference] = useState("");
  const [useSavedCard, setUseSavedCard] = useState(false);

  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resultModal, setResultModal] = useState(null);

  const amounts = [50, 100, 200, 500];

  const finalAmount = Number(customAmount || selectedAmount);
  const platformSupport = Math.round(finalAmount * 0.1);
  const charityAmount = finalAmount - platformSupport;

  useEffect(() => {
    fetchCharities();
    fetchProfile();
  }, []);

  async function fetchCharities() {
    try {
      const res = await api.get("/charities");
      setCharities(res.data.data || []);
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  async function fetchProfile() {
    try {
      const res = await api.get("/profile");
      const user = res.data.data || null;
      setSavedPayment(user);

      if (user?.card_last4) {
        setUseSavedCard(true);
      }
    } catch (err) {
      console.log(err.response?.data || err.message);
    }
  }

  function generatePaymentReference(method) {
    const prefix =
      method === "card"
        ? "CARD"
        : method === "vodafone"
        ? "VF"
        : "INS";

    const timePart = Date.now().toString().slice(-6);
    const randomPart = Math.floor(100 + Math.random() * 900);

    return `${prefix}${timePart}${randomPart}`;
  }

  function handleExpiryChange(e) {
    let value = e.target.value.replace(/\D/g, "");

    if (value.length > 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4);
    }

    setExpiry(value);
  }

  function resetPaymentFields(method) {
    setPaymentMethod(method);
    setPaymentReference("");
    setCardHolder("");
    setExpiry("");
    setCvv("");
    setErrors({});

    if (method === "card") {
      setUseSavedCard(!!savedPayment?.card_last4);
    }

    if (method === "vodafone" && savedPayment?.vodafone_number) {
      setPaymentReference(savedPayment.vodafone_number);
    }

    if (method === "instapay" && savedPayment?.instapay_address) {
      setPaymentReference(savedPayment.instapay_address);
    }
  }

  function validateDonation() {
    const newErrors = {};

    if (!finalAmount || finalAmount < 10) {
      newErrors.amount = "Donation amount must be at least 10 EGP.";
    }

    if (paymentMethod === "card" && !useSavedCard) {
      if (!cardHolder.trim()) {
        newErrors.cardHolder = "Card holder name is required.";
      }

      if (!paymentReference.trim()) {
        newErrors.paymentReference = "Card number is required.";
      } else if (!/^\d{16}$/.test(paymentReference)) {
        newErrors.paymentReference = "Card number must be 16 digits.";
      }

      if (!expiry.trim()) {
        newErrors.expiry = "Expiry date is required.";
      } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        newErrors.expiry = "Expiry must be MM/YY.";
      }

      if (!cvv.trim()) {
        newErrors.cvv = "CVV is required.";
      } else if (!/^\d{3}$/.test(cvv)) {
        newErrors.cvv = "CVV must be 3 digits.";
      }
    }

    if (paymentMethod === "vodafone") {
      if (!paymentReference.trim()) {
        newErrors.paymentReference = "Vodafone Cash number is required.";
      } else if (!/^01\d{9}$/.test(paymentReference)) {
        newErrors.paymentReference = "Enter a valid Egyptian phone number.";
      }
    }

    if (paymentMethod === "instapay") {
      if (!paymentReference.trim()) {
        newErrors.paymentReference = "InstaPay address is required.";
      } else if (!paymentReference.includes("@")) {
        newErrors.paymentReference = "InstaPay address must contain @.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleDonation(e) {
    e.preventDefault();

    if (!validateDonation()) return;

    try {
      setLoading(true);

      const transactionReference = generatePaymentReference(paymentMethod);

      const payload = {
        amount: finalAmount,
        payment_method: paymentMethod,
        payment_account: paymentReference,
        payment_reference: transactionReference,
      };

      if (paymentMethod === "card" && useSavedCard) {
        payload.payment_account = `saved-card-${savedPayment.card_last4}`;
      }

      if (selectedCharity) {
        payload.charity_id = selectedCharity;
      }

      const res = await api.post("/donate", payload);

      setResultModal({
        type: "success",
        title: "Donation Successful 💚",
        message: "Thank you for supporting ReBite.",
        id: res.data?.data?.id || res.data?.id || "RB",
        reference: transactionReference,
        account: payload.payment_account,
      });
    } catch (err) {
      console.log(err.response?.data || err.message);

      setResultModal({
        type: "failed",
        title: "Donation Failed",
        message:
          err.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const selectedCharityName =
    charities.find((charity) => String(charity.id) === String(selectedCharity))
      ?.name || "Auto-distribute";

  return (
    <div className="donation-page">
      <nav className="donation-navbar">
        <div className="donation-logo" onClick={() => navigate("/donor")}>
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

      <main className="donation-container">
        <section className="donation-hero">
          <p>Support the mission</p>

          <h1>Make a Donation</h1>

          <span>
            Choose an amount and help ReBite support food redistribution,
            charities, and families in need.
          </span>
        </section>

        <form className="donation-layout" onSubmit={handleDonation}>
          <div className="donation-left">
            <div className="donation-card">
              <div className="card-title-row">
                <span>🤲</span>
                <h2>Select Charity</h2>
              </div>

              <p className="card-note">
                You can choose a specific charity, or let ReBite distribute your
                donation where it is needed most.
              </p>

              <select
                className="custom-input"
                value={selectedCharity}
                onChange={(e) => setSelectedCharity(e.target.value)}
              >
                <option value="">Auto-distribute donation</option>

                {charities.map((charity) => (
                  <option key={charity.id} value={charity.id}>
                    {charity.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="donation-card">
              <div className="card-title-row">
                <span>💰</span>
                <h2>Select Amount</h2>
              </div>

              <div className="amount-grid">
                {amounts.map((amount) => (
                  <button
                    type="button"
                    key={amount}
                    className={
                      selectedAmount === amount && !customAmount
                        ? "amount-btn active"
                        : "amount-btn"
                    }
                    onClick={() => {
                      setSelectedAmount(amount);
                      setCustomAmount("");
                      setErrors({ ...errors, amount: "" });
                    }}
                  >
                    {amount} EGP
                  </button>
                ))}
              </div>

              <input
                type="number"
                placeholder="Custom amount"
                className="custom-input"
                value={customAmount}
                min="10"
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setErrors({ ...errors, amount: "" });
                }}
              />

              {errors.amount && <p className="error">{errors.amount}</p>}
            </div>

            <div className="donation-card">
              <div className="card-title-row">
                <span>💳</span>
                <h2>Payment Method</h2>
              </div>

              <div className="payment-options">
                <button
                  type="button"
                  className={
                    paymentMethod === "card"
                      ? "payment-card active"
                      : "payment-card"
                  }
                  onClick={() => resetPaymentFields("card")}
                >
                  <span>💳</span>

                  <strong>Card</strong>

                  <small>
                    {savedPayment?.card_last4
                      ? `Saved **** ${savedPayment.card_last4}`
                      : "Credit / Debit"}
                  </small>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "vodafone"
                      ? "payment-card active"
                      : "payment-card"
                  }
                  onClick={() => resetPaymentFields("vodafone")}
                >
                  <span>📱</span>

                  <strong>Vodafone Cash</strong>

                  <small>
                    {savedPayment?.vodafone_number
                      ? savedPayment.vodafone_number
                      : "Wallet transfer"}
                  </small>
                </button>

                <button
                  type="button"
                  className={
                    paymentMethod === "instapay"
                      ? "payment-card active"
                      : "payment-card"
                  }
                  onClick={() => resetPaymentFields("instapay")}
                >
                  <span>🏦</span>

                  <strong>InstaPay</strong>

                  <small>
                    {savedPayment?.instapay_address
                      ? savedPayment.instapay_address
                      : "Instant payment"}
                  </small>
                </button>
              </div>

              <div className="payment-details">
                {paymentMethod === "card" && (
                  <>
                    {savedPayment?.card_last4 && useSavedCard ? (
                      <div className="saved-card-box">
                        <div>
                          <strong>
                            Saved card: **** **** **** {savedPayment.card_last4}
                          </strong>

                          <p>This saved card will be used for this donation.</p>
                        </div>

                        <button
                          type="button"
                          className="use-another-btn"
                          onClick={() => {
                            setUseSavedCard(false);
                            setPaymentReference("");
                          }}
                        >
                          Use another card
                        </button>
                      </div>
                    ) : (
                      <>
                        {savedPayment?.card_last4 && (
                          <button
                            type="button"
                            className="saved-payment-btn"
                            onClick={() => setUseSavedCard(true)}
                          >
                            Use saved card **** {savedPayment.card_last4}
                          </button>
                        )}

                        <input
                          type="text"
                          placeholder="Card holder name"
                          className="custom-input"
                          value={cardHolder}
                          onChange={(e) => {
                            setCardHolder(e.target.value);
                            setErrors({ ...errors, cardHolder: "" });
                          }}
                        />

                        {errors.cardHolder && (
                          <p className="error">{errors.cardHolder}</p>
                        )}

                        <input
                          type="text"
                          placeholder="Card number"
                          className="custom-input"
                          value={paymentReference}
                          maxLength="16"
                          onChange={(e) => {
                            setPaymentReference(
                              e.target.value.replace(/\D/g, "")
                            );
                            setErrors({ ...errors, paymentReference: "" });
                          }}
                        />

                        {errors.paymentReference && (
                          <p className="error">{errors.paymentReference}</p>
                        )}

                        <div className="card-row">
                          <div>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              className="custom-input"
                              value={expiry}
                              onChange={(e) => {
                                handleExpiryChange(e);
                                setErrors({ ...errors, expiry: "" });
                              }}
                              maxLength="5"
                            />

                            {errors.expiry && (
                              <p className="error">{errors.expiry}</p>
                            )}
                          </div>

                          <div>
                            <input
                              type="text"
                              placeholder="CVV"
                              className="custom-input"
                              value={cvv}
                              maxLength="3"
                              onChange={(e) => {
                                setCvv(e.target.value.replace(/\D/g, ""));
                                setErrors({ ...errors, cvv: "" });
                              }}
                            />

                            {errors.cvv && (
                              <p className="error">{errors.cvv}</p>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                {paymentMethod === "vodafone" && (
                  <>
                    <div className="payment-info">
                      Transfer to <strong>01012345678</strong>
                    </div>

                    {savedPayment?.vodafone_number &&
                    paymentReference === savedPayment.vodafone_number ? (
                      <div className="saved-card-box">
                        <div>
                          <strong>Using saved Vodafone Cash</strong>

                          <p>{savedPayment.vodafone_number}</p>
                        </div>

                        <button
                          type="button"
                          className="use-another-btn"
                          onClick={() => setPaymentReference("")}
                        >
                          Use another number
                        </button>
                      </div>
                    ) : (
                      <>
                        {savedPayment?.vodafone_number && (
                          <button
                            type="button"
                            className="saved-payment-btn"
                            onClick={() =>
                              setPaymentReference(savedPayment.vodafone_number)
                            }
                          >
                            Use saved Vodafone Cash
                          </button>
                        )}

                        <input
                          type="text"
                          placeholder="Your Vodafone Cash number"
                          className="custom-input"
                          value={paymentReference}
                          maxLength="11"
                          onChange={(e) => {
                            setPaymentReference(
                              e.target.value.replace(/\D/g, "")
                            );
                            setErrors({ ...errors, paymentReference: "" });
                          }}
                        />
                      </>
                    )}

                    {errors.paymentReference && (
                      <p className="error">{errors.paymentReference}</p>
                    )}
                  </>
                )}

                {paymentMethod === "instapay" && (
                  <>
                    <div className="payment-info">
                      Send to <strong>rebite@instapay</strong>
                    </div>

                    {savedPayment?.instapay_address &&
                    paymentReference === savedPayment.instapay_address ? (
                      <div className="saved-card-box">
                        <div>
                          <strong>Using saved InstaPay</strong>

                          <p>{savedPayment.instapay_address}</p>
                        </div>

                        <button
                          type="button"
                          className="use-another-btn"
                          onClick={() => setPaymentReference("")}
                        >
                          Use another address
                        </button>
                      </div>
                    ) : (
                      <>
                        {savedPayment?.instapay_address && (
                          <button
                            type="button"
                            className="saved-payment-btn"
                            onClick={() =>
                              setPaymentReference(savedPayment.instapay_address)
                            }
                          >
                            Use saved InstaPay
                          </button>
                        )}

                        <input
                          type="text"
                          placeholder="Your InstaPay address"
                          className="custom-input"
                          value={paymentReference}
                          onChange={(e) => {
                            setPaymentReference(e.target.value);
                            setErrors({ ...errors, paymentReference: "" });
                          }}
                        />
                      </>
                    )}

                    {errors.paymentReference && (
                      <p className="error">{errors.paymentReference}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <aside className="summary-card">
            <h2>Donation Summary</h2>

            <div className="summary-row">
              <span>Charity</span>
              <strong>{selectedCharityName}</strong>
            </div>

            <div className="summary-row">
              <span>Donation Amount</span>
              <strong>{finalAmount || 0} EGP</strong>
            </div>

            <div className="summary-row">
              <span>Platform Support</span>
              <strong>{platformSupport || 0} EGP</strong>
            </div>

            <div className="summary-row">
              <span>Charity Receives</span>
              <strong>{charityAmount || 0} EGP</strong>
            </div>

            <p className="support-note">
              Platform support helps ReBite keep donations, coordination, and
              delivery operations running.
            </p>

            <button className="donate-submit" type="submit" disabled={loading}>
              {loading ? "Processing..." : `Donate ${finalAmount || 0} EGP`}
            </button>
          </aside>
        </form>
      </main>

      {resultModal && (
        <div className="modal-overlay">
          <div className={`result-modal ${resultModal.type}`}>
            <button className="close-btn" onClick={() => setResultModal(null)}>
              ✕
            </button>

            <div className="result-icon">
              {resultModal.type === "success" ? "✅" : "❌"}
            </div>

            <h2>{resultModal.title}</h2>

            <p>{resultModal.message}</p>

            {resultModal.type === "success" && (
              <div className="receipt-box">
                <div>
                  <span>Amount</span>
                  <strong>{finalAmount} EGP</strong>
                </div>

                <div>
                  <span>Payment Method</span>
                  <strong>{paymentMethod}</strong>
                </div>

                <div>
                  <span>Payment Account</span>
                  <strong>{resultModal.account || "—"}</strong>
                </div>

                <div>
                  <span>Transaction Ref</span>
                  <strong>{resultModal.reference}</strong>
                </div>

                <div>
                  <span>ID</span>
                  <strong>#{resultModal.id}</strong>
                </div>
              </div>
            )}

            <button
              className="confirm-btn"
              onClick={() => {
                setResultModal(null);

                if (resultModal.type === "success") {
                  navigate("/donor");
                }
              }}
            >
              {resultModal.type === "success"
                ? "Back to Dashboard"
                : "Try Again"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Donation;