import "./Navbar.css";
import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  return (
    <header className="navbar">
      <div className="navbar-left" onClick={() => (window.location.hash = "home")}>
        <div className="logo-circle">🌿</div>

        <div className="brand-wrap">
          <span className="brand-title">ReBite</span>
          <span className="brand-sub">Food Redistribution Platform</span>
        </div>
      </div>

      <nav className="navbar-center">
        <a href="#how-it-works">How it works</a>
        <a href="#community">Community</a>
        <a href="#impact">Impact</a>
      </nav>

      <div className="navbar-right">
        <button className="signin-btn" onClick={() => navigate("/signin")}>
          Sign In
        </button>
      </div>
    </header>
  );
}

export default Navbar;