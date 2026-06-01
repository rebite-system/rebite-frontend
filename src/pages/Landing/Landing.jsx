import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";
import "./Landing.css";
import { useNavigate } from "react-router-dom";

function Landing() {
  return (
    <div className="landing">
      <div className="landing-navbar-wrapper">
        <Navbar />
      </div>

      <div className="landing-content">
        <HeroSection />
        <ImpactSection />
        <HowItWorksSection />
        <WhoJoinsSection />
        <CardSection />
        <Footer />
      </div>
    </div>
  );
}

function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="hero" id="home">
      <div className="hero-text-content">
        <span className="hero-badge">Food Waste Management Platform</span>

        <h1 className="hero-title">
          Share the Surplus <br /> Feed the Community
        </h1>

        <p className="hero-sub">
          ReBite connects restaurants, charities, and donors to reduce food
          waste and support communities in need.
        </p>

        <div className="hero-actions">
          <button className="btn-primary" onClick={() => navigate("/signup")}>
            Get Started →
          </button>

          <button className="btn-secondary" onClick={() => navigate("/signin")}>
            Sign In
          </button>
        </div>

        <p className="hero-note">Join as Restaurant • Charity • Donor</p>
      </div>

      <div className="hero-visual">
        <div className="food-card food-card-main">
          <span>🥗</span>
          <h3>Fresh meals saved</h3>
          <p>Food reaches people instead of going to waste.</p>
        </div>

        <div className="floating-card floating-card-top">🍽️ 12k+ meals</div>

        <div className="floating-card floating-card-bottom">🌱 Less waste</div>
      </div>
    </section>
  );
}

function ImpactSection() {
  return (
    <section className="impact-section" id="impact">
      <div className="impact-item">
        <h3>12k+</h3>
        <p>Meals Saved</p>
      </div>

      <div className="impact-item">
        <h3>500+</h3>
        <p>Restaurants</p>
      </div>

      <div className="impact-item">
        <h3>200+</h3>
        <p>Charities</p>
      </div>

      <div className="impact-item">
        <h3>3 Tons</h3>
        <p>Waste Reduced</p>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="hiw-section" id="how-it-works">
      <h2 className="section-title">How It Works</h2>
      <p className="section-sub">Three simple steps to make a difference.</p>

      <div className="hiw-timeline">
        <div className="hiw-step">
          <div className="hiw-circle">1</div>
          <span className="hiw-icon">🍽️</span>
          <h3 className="hiw-step-title">Restaurant Lists Surplus</h3>
          <p className="hiw-step-desc">
            Restaurants post their leftover food at the end of each day.
          </p>
        </div>

        <div className="hiw-line" />

        <div className="hiw-step">
          <div className="hiw-circle">2</div>
          <span className="hiw-icon">🔔</span>
          <h3 className="hiw-step-title">Charity Gets Notified</h3>
          <p className="hiw-step-desc">
            Nearby charities receive instant alerts about available food.
          </p>
        </div>

        <div className="hiw-line" />

        <div className="hiw-step">
          <div className="hiw-circle">3</div>
          <span className="hiw-icon">🤝</span>
          <h3 className="hiw-step-title">Food Gets Delivered</h3>
          <p className="hiw-step-desc">
            Food reaches those in need — fresh, fast, and free.
          </p>
        </div>
      </div>
    </section>
  );
}

function WhoJoinsSection() {
  return (
    <section className="who-section" id="community">
      <h2 className="section-title">Who Joins ReBite?</h2>
      <p className="section-sub">Everyone has a role to play.</p>

      <div className="who-cards">
        <div className="who-card who-card--restaurant">
          <span className="who-icon">🍽️</span>
          <h3 className="who-title">Restaurants</h3>
          <p className="who-desc">
            List your surplus food instead of throwing it away.
          </p>
          <span className="who-stat">500+ restaurants</span>
        </div>

        <div className="who-card who-card--charity">
          <span className="who-icon">🤲</span>
          <h3 className="who-title">Charities</h3>
          <p className="who-desc">
            Receive food donations and distribute them to people in need.
          </p>
          <span className="who-stat">200+ charities</span>
        </div>

        <div className="who-card who-card--donor">
          <span className="who-icon">💰</span>
          <h3 className="who-title">Donors</h3>
          <p className="who-desc">
            Support the mission with financial contributions.
          </p>
          <span className="who-stat">1,000+ donors</span>
        </div>
      </div>
    </section>
  );
}

function CardSection() {
  return (
    <section className="cta-section">
      <div className="cta-content">
        <div>
          <span className="cta-badge">Join ReBite Community</span>

          <h2>
            Reduce waste. <br />
            Feed more people.
          </h2>

          <p>
            Help restaurants, charities, and donors create a more sustainable
            food system together.
          </p>
        </div>

        <div className="cta-right">
          <div className="cta-emojis">
            🍽️ 🥗 🥪 🌱
          </div>

      
        </div>
      </div>
    </section>
  );
}

export default Landing;