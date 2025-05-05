import React from "react";
import { Link } from "react-router-dom";
import "./LandingPage.css";
import background from "./images/BG.webp";
import logo from "./images/RuLogo.png";

function LandingPage() {
  const panels = [
    <div className="hero-box hero-left" key="panel-1">
      <h2 className="section-title">What is RUHousing?</h2>
      <h1 className="hero-heading">Rutgers housing made easy.</h1>
      <p className="hero-description">
        Discover places to live, people to live with, and a smoother way to
        settle in — RUHousing is where student living begins.
      </p>
      <div className="hero-buttons">
        <Link to="/new-user" className="btn primary">Create Account</Link>
        <Link to="/login" className="btn primary">Login</Link>
        <Link to="/home" className="btn ghost">Continue as Guest</Link>
      </div>
    </div>,
    <div className="hero-box hero-right" key="panel-2">
      <h2 className="section-title">Chat with Potential Roommates!</h2>
      <div className="chat-group">
        <div className="chat-bubble left typing-bubble bubble-1">👋 Hey! I’m looking for a roommate near College Ave.</div>
        <div className="chat-bubble right typing-bubble bubble-2">🏡 I found a listing 3 mins from campus — want to check it out?</div>
        <div className="chat-bubble left typing-bubble bubble-3">💬 Sure! Let’s connect through RUHousing!</div>
      </div>
    </div>,
    <div className="hero-box hero-right profile-panel" key="panel-3">
      <h2 className="section-title">Your Personalized Profile</h2>
      <div className="profile-content">
        <div className="profile-bubbles">
          <div className="chat-bubble left">📸 Add a profile picture</div>
          <div className="chat-bubble left">⚙️ Customize your preferences</div>
          <div className="chat-bubble left">📄 Chat with other users</div>
          <div className="chat-bubble left">🔥 Match with other users</div>
        </div>
        <div className="profile-image-preview">
          <img src={require("./images/profilepage.jpg")} alt="Profile Preview" />
        </div>
      </div>
    </div>,
    <div className="hero-box hero-left" key="panel-4">
      <h2 className="section-title">What Students Are Saying</h2>
      <div className="reviews-group">
        <div className="review-bubble">
          <div className="review-rating">4.8/5.0 ⭐</div>
          <p>“I found my roommate within a day. RUHousing made it so easy!”</p>
          <span className="review-name">– Priya, Class of 2026</span>
        </div>
        <div className="review-bubble">
          <div className="review-rating">4.6/5.0 ⭐</div>
          <p>“Was stressing about housing... until I found this site. Total lifesaver.”</p>
          <span className="review-name">– Jason, Class of 2025</span>
        </div>
        <div className="review-bubble">
          <div className="review-rating">4.9/5.0 ⭐</div>
          <p>“Loved being able to message people before committing to a lease.”</p>
          <span className="review-name">– Aisha, Class of 2027</span>
        </div>
      </div>
    </div>
  ];

  return (
    <div
      className="landing-wrapper"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="top-bar">
        <h1 className="hero-title">Welcome to RUHousing . . .</h1>
        <div className="logo-contact-wrapper">
          <span className="contact-text">Contact Us!</span>
          <img src={logo} alt="RUHousing Logo" className="logo-image" />
        </div>
      </div>

      <div className="scroll-container">
        <div className="scroll-panels">
          {panels.map((panel, i) => (
            <div className="scroll-panel" key={i}>
              {panel}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
