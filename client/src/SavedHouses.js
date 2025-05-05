import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "./images/RuLogo.png";
import rutgersR from "./images/Rutgers-R.png";
import avatar from "./images/default_avatar.png";
import collegeAveBg from "./images/college_ave_background.png";
import axios from "axios";

function SavedHouses() {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);

  const fetchSavedHouses = async () => {
    const userId = localStorage.getItem("userId");
    const userSavedHouses = await axios.get(
      `https://myruhousing.onrender.com/api/house/${userId}`
    );
    setProperties(res.data.props || []);
  };

  useEffect(() => {
    fetchSavedHouses();
  }, []);
  // Home‑button behaviour: go to /home or refresh if already there
  const handleHomeClick = () => {
    if (location.pathname === "/home") {
      navigate(0); // full reload of /home
    } else {
      navigate("/home");
    }
  };

  // Saved-Houses button behaviour (refresh if already here)
  const handleSavedClick = () => {
    if (location.pathname === "/saved-houses") {
      navigate(0); // reload page
    } else {
      navigate("/saved-houses");
    }
  };

  return (
    <>
      {/* ---------- Header ---------- */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "#585757",
          padding: "15px 20px",
          color: "white",
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={rutgersR}
            alt="Rutgers R"
            style={{ height: "60px", marginRight: "15px" }}
          />
          <img
            src={logo}
            alt="RU Housing Logo"
            style={{ height: "80px", marginRight: "20px" }}
          />
          <h1
            style={{
              fontSize: "27px",
              color: "rgb(204, 146, 60)",
              fontWeight: "bold",
            }}
          >
            RU Housing
          </h1>
        </div>
        <Link to="/profile">
          <img
            src={avatar}
            alt="User Avatar"
            style={{ height: "60px", width: "60px", borderRadius: "50%" }}
          />
        </Link>
      </div>

      {/* ---------- Navbar ---------- */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#4CAF50",
          padding: "10px 30px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "25px" }}>
          <button
            className="home-button"
            style={{
              backgroundColor: "#66BB6A",
              color: "white",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              border: "none",
              fontWeight: "bold",
            }}
            onClick={handleHomeClick}
          >
            Home
          </button>

          <button
            className="saved-houses-button"
            style={{
              backgroundColor: "#66BB6A",
              color: "white",
              padding: "8px 16px",
              borderRadius: "5px",
              cursor: "pointer",
              border: "none",
              fontWeight: "bold",
            }}
            onClick={handleSavedClick}
          >
            Saved Houses
          </button>

          <Link to="/find-roommates">
            <button
              className="roommates-button"
              style={{
                backgroundColor: "#66BB6A",
                color: "white",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                border: "none",
                fontWeight: "bold",
              }}
            >
              Find My Roommates
            </button>
          </Link>

          <Link to="/profile">
            <button
              className="profile-button"
              style={{
                backgroundColor: "#66BB6A",
                color: "white",
                padding: "8px 16px",
                borderRadius: "5px",
                cursor: "pointer",
                border: "none",
                fontWeight: "bold",
              }}
            >
              Profile
            </button>
          </Link>
        </div>
      </div>

      {/* ---------- Background & Content Window ---------- */}
      <div
        style={{
          backgroundImage: `url(${collegeAveBg})`,
          backgroundSize: "100% auto",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "calc(100vh - 130px)",
          padding: "40px",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        {/* Grey window */}
        <div
          style={{
            backgroundColor: "#d3d3d3",
            borderRadius: "12px",
            padding: "30px",
            width: "90%",
            maxWidth: "1200px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            textAlign: "center",
          }}
        >
          {/* No listings grid here */}
          <h2 style={{ marginTop: 0 }}>Your saved houses will appear here.</h2>
          <p>Looks like you haven\'t saved any homes yet!</p>
        </div>
      </div>
    </>
  );
}

export default SavedHouses;
