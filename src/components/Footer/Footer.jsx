import { useState } from "react";
import "./Footer.css";

function Footer() {
  const [activePopup, setActivePopup] = useState(null);

  return (
    <>
      <footer className="footer">
        <div className="footer-logo">
          🌿 <span>ReBite</span>
        </div>

        <p>© 2026 ReBite.</p>
        <p>Rooted in Community.</p>

        <div className="footer-links">
          <button onClick={() => setActivePopup("story")}>
            Our Story
          </button>

          <button onClick={() => setActivePopup("contact")}>
            Contact
          </button>

          <button onClick={() => setActivePopup("privacy")}>
            Privacy
          </button>
        </div>
      </footer>

      {activePopup && (
        <div
          className="popup-overlay"
          onClick={() => setActivePopup(null)}
        >
          <div
            className="popup-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="popup-close"
              onClick={() => setActivePopup(null)}
            >
              ✕
            </button>

            {activePopup === "story" && (
              <>
                <h2>Our Story</h2>

                <p>
                  ReBite was created to reduce food waste and help
                  communities access fresh meals through restaurants,
                  charities, and donors working together.
                </p>
              </>
            )}

            {activePopup === "contact" && (
              <>
                <h2>Contact Us</h2>

                <p>Email: rebitemanagementsystem</p>
                <p>Phone: +20 100 000 0000</p>
                <p>Location: Cairo, Egypt</p>
              </>
            )}

            {activePopup === "privacy" && (
              <>
                <h2>Privacy Policy</h2>

                <p>
                  ReBite respects your privacy and protects your data.
                  Your information is securely stored and never shared
                  without permission.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Footer;