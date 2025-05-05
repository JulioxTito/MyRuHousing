/*  ───────────  SavedHousesPage.js  ───────────  */
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import logo from "./images/RuLogo.png";
import headerImg from "./images/Header.png";
import avatar from "./images/default_avatar.png";
import building from "./images/clearBuilding.png";

import SavedHousesDetailModel from "./SavedHousesDetailModel";
import "./HomePage.css"; // re-use hover colours, buttons, etc.
import "./SavedHousePage.css"; // **new**, only a few extra rules
import HeaderBar from "./HeaderBar";

function SavedHousesPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [properties, setProperties] = useState([]);
  const [selectedHouse, setSelected] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [photoUrl, setPhotoUrl] = useState(avatar);
  const [userId, setUserId] = useState(null);

  /* ── grab saved houses (once on mount + when userId ready) ── */
  useEffect(() => {
    if (!userId) return; // wait for auth
    const fetch = async () => {
      try {
        const { data } = await axios.get(
          `http://https://myruhousing.onrender.com
/api/house/${userId}`
        );
        setProperties(data.props || []);
      } catch (err) {
        console.error("Error fetching saved houses:", err);
      }
    };
    fetch();
  }, [userId]);

  /* ── auth listener just like HomePage ── */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        setUserId(user.uid);
        setPhotoUrl(
          `http://https://myruhousing.onrender.com
/api/profile-photo/${user.uid}?t=${Date.now()}`
        );
      } else {
        setUserId(null);
        setPhotoUrl(avatar);
      }
    });
    return () => unsub();
  }, []);

  /* ── navigation helpers (identical to HomePage.js) ── */
  const goHome = () =>
    location.pathname === "/home" ? navigate(0) : navigate("/home");
  const goSaved = () =>
    location.pathname === "/saved-houses"
      ? navigate(0)
      : navigate("/saved-houses");

  /* ── modal helpers ── */
  const openModal = (h) => {
    setSelected(h);
    setModalOpen(true);
  };
  const closeModal = () => {
    setSelected(null);
    setModalOpen(false);
  };

  /* ── unsave button inside the grid ── */
  const handleUnsave = async (houseId) => {
    try {
      await axios.delete(`http://https://myruhousing.onrender.com
/api/house/${houseId}`);
      setProperties((prev) => prev.filter((h) => h._id !== houseId));
      if (selectedHouse && selectedHouse._id === houseId) closeModal();
    } catch (err) {
      alert("Could not unsave this house. Please try again.");
      console.error(err);
    }
  };

  /* ─────────────────────────  render  ───────────────────────── */
  return (
    <>
      <HeaderBar photoUrl={photoUrl} />

      {/* ███  greeting / logout bar  ███ */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#A52A2A",
          padding: "5px 15px",
        }}
      >
      </div>

      {/* ███  blue skyline background  ███ */}
      <div
        style={{
          backgroundImage: `url(${building})`,
          backgroundSize: "100% auto",
          backgroundPosition: "top center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
          minHeight: "calc(100vh - 130px)",
          padding: 40,
          display: "flex",
          justifyContent: "center",
        }}
      >
        {/* ███  grey “window”  ███ */}
        <div className="saved-window">
          {/*  ❱❱  **THIS BLOCK INTENTIONALLY LEFT BLANK**  ❰❰  */}
          {/*     (Search / filter removed per spec)                */}

          {/* ███  card grid  ███ */}
          <div className="house-grid">
            {properties.length ? (
              properties.map((h, i) => (
                <div
                  key={h._id}
                  className="house-card"
                  onClick={() => openModal(h)}
                >
                  <img src={h.imgSrc} alt={`house ${i + 1}`} />
                  <div className="card-body">
                    <p className="price">
                      {h.price
                        ? String(h.price).startsWith("$")
                          ? h.price
                          : `$${h.price}`
                        : "Price Not Listed"}
                    </p>
                    <p className={h.available ? "avail ok" : "avail no"}>
                      {h.available
                        ? "Currently Available"
                        : "No Longer Available"}
                    </p>
                    <span className="rating">⭐ {h.rating.toFixed(1)} / 5</span>

                    <button
                      className="save-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnsave(h._id);
                      }}
                    >
                      ♥ Unsave
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ textAlign: "center", margin: 0, color: "white" }}>
                You haven’t saved any houses yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {/*  modal  */}
      <SavedHousesDetailModel
        isOpen={modalOpen}
        onRequestClose={closeModal}
        house={selectedHouse}
      />
    </>
  );
}

export default SavedHousesPage;
