import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "./images/RuLogo.png";
import header from './images/Header.png';
import avatar from "./images/default_avatar.png";

function HeaderBar({ photoUrl = avatar }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleHomeClick = () =>
    location.pathname === "/home" ? navigate(0) : navigate("/home");

  const handleSavedClick = () =>
    location.pathname === "/saved-houses" ? navigate(0) : navigate("/saved-houses");

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundImage: `url(${header})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        padding: "15px 20px",
        color: "white",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        <img src={logo} alt="RU Housing Logo" style={{ height: "80px", marginRight: "20px" }} />
        <div style={{ display: "flex", gap: "25px" }}>
          <button onClick={handleHomeClick} className="nav-button">Home</button>
          <button onClick={handleSavedClick} className="nav-button">Saved Houses</button>
          <Link to="/matched-profiles"><button className="nav-button">My Roommates</button></Link>
          <Link to="/profile"><button className="nav-button">Profile</button></Link>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Link to="/chat"><button className="nav-button">Chats</button></Link>
        <Link to="/login"><button className="nav-button">Logout</button></Link>
        <Link to="/profile">
          <img
            src={photoUrl}
            alt="User Avatar"
            style={{
              height: "60px",
              width: "60px",
              borderRadius: "50%",
              objectFit: "cover",
              background: "#fafafa",
            }}
          />
        </Link>
      </div>
    </div>
  );
}

export default HeaderBar;
