import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
//import { houseData } from "./HouseDetail";
import logo from "./images/RuLogo.png";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import avatar from "./images/default_avatar.png";
import header from "./images/Header.png";
import { throttledAxios } from "./utils/throttleAxios";
import HouseDetailModal from "./HouseDetailModal"; //////
import "./HomePage.css";
import FilterDropdown from "./FilterDropdown";
import "./HeaderBar.css";
import building from "./images/clearBuilding.png";
import axios from "axios";

const getSyntheticPrice = (zpid) => {
  const seed = parseInt(String(zpid).slice(-5), 10);
  const step = seed % 46;
  return 1000 + step * 100;
};

function HomePage() {
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [savedHouses, setSavedHouses] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const [homeTypeFilter, setHomeTypeFilter] = useState("");
  const [statusTypeFilter, setStatusTypeFilter] = useState("ForRent");
  const [sortOrder, setSortOrder] = useState("");

  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState(
    "New Brunswick NJ; Somerset, NJ; Edison, NJ; East Brunswick, NJ; Piscataway, NJ"
  );
  const [userId, setUserId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(avatar);

  const [page, setPage] = useState(1);

  //// user filtering HERE ------ ////
  // step1: add a useState variabel exactly like the one bellow BUT with a different name
  const [searchProperties, setSearchProperties] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // this is only if you are using a button like a submit button
  const handleSubmit = async (event) => {
    event.preventDefault();
    setQuery(searchProperties);
    setPage(1);
  };
  //// user filtering HERE ------ ////

  const navigate = useNavigate();
  const location = useLocation(); // ← NEW

  // “Home” navbar button behaviour
  const handleHomeClick = () => {
    if (location.pathname === "/home") {
      // already on /home  → force a refresh
      navigate(0); // react-router-dom v6 helper
    } else {
      navigate("/home"); // go to homepage from elsewhere
    }
  };

  // Saved-Houses button behaviour
  const handleSavedClick = () => {
    if (location.pathname === "/saved-houses") {
      navigate(0); // refresh page
    } else {
      navigate("/saved-houses");
    }
  };

  const openModal = (house) => {
    setSelectedHouse(house);
    setModalOpen(true);
  };
  const handleHouseClick = (id) => {
    navigate(`/house/${id}`);
  };

  const handleSaveHouse = async (houseId, houseData) => {
    try {
      const storedSavedHouses = savedHouses;
  
      if (!storedSavedHouses.includes(houseId)) {
        // Save to backend
        await axios.post("https://myruhousing.onrender.com/api/house", {
          userId,
          houseId,
          houseData,
        });
  
        setSavedHouses([...storedSavedHouses, houseId]);
        alert(`House #${houseId} saved!`);
      } else {
        // Unsave from backend
        await axios.delete(`https://myruhousing.onrender.com/api/house/${houseId}`, {
          data: { userId },
        });
  
        const updatedSavedHouses = storedSavedHouses.filter((id) => id !== houseId);
        setSavedHouses(updatedSavedHouses);
        alert(`House #${houseId} unsaved!`);
      }
    } catch (err) {
      console.error("Error saving house:", err);
      alert("Something went wrong.");
    }
  };
  

  const closeModal = () => {
    setModalOpen(false);
    setSelectedHouse(null);
  };
  // IMPORTANT MAKE THIS INTO A COMMIT TO NOT RUN OUT OF THE API TRIALS WHEN YOU ARE TESTING THE WEBSITE!!!!! COMMENT useEffect FUNCTION!!!!
  // code that call sthe zilow API
  const fetchProperties = async () => {
    try {
      const res = await axios.get(
        "https://myruhousing.onrender.com/api/zillow/propertyExtendedSearch",
        {
          params: {
            location: query,
            home_type: homeTypeFilter || undefined,
            status_type: statusTypeFilter || undefined,
            page: page,
            sort: sortOrder,
          },
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_ZILLOW_API_KEY}`,
          },
        }
      );

      const patched = (res.data.props || []).map((home) => {
        if (!home.price) {
          const synthetic = getSyntheticPrice(home.zpid);
          return { ...home, price: `$${synthetic}/mo`, _synthetic: true };
        }
        return home;
      });
      setProperties(patched);

      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProperties();
  }, [page, query, homeTypeFilter, statusTypeFilter, sortOrder]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        setUserId(user.uid);
        setPhotoUrl(
          `https://myruhousing.onrender.com/api/profile-photo/${user.uid}?t=${Date.now()}`
        );
      } else {
        setUserId(null);
        setPhotoUrl(avatar);
      }
    });
    return () => unsubscribe();
  }, []);
  // Function to determine if a house is available or not
  const isHouseAvailable = (house) => {
    if (house._synthetic) return true; // always green for synthetic
    // original 90 % logic for “real” Zillow prices
    const seed = parseInt(house.zpid.slice(-3), 10);
    return seed % 10 !== 0;
  };

  // Helper function to generate consistent star ratings
  const getHouseRating = (house) => {
    const randomSeed = parseInt(house.zpid.slice(-4), 10);
    const ratingsArray = [3.5, 4.0, 4.5, 5.0, 3.0, 2.5]; // most ratings 3.5+
    return ratingsArray[randomSeed % ratingsArray.length];
  };

  // (after getHouseRating)
  // Turn "$1,200+" or 1200 into a plain Number
  const extractPriceValue = (price) =>
    Number(String(price).replace(/[^0-9.-]+/g, ""));

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const displayedProperties = useMemo(() => {
    // No sort? show raw API list
    if (!sortOrder) return properties;

    // Keep only homes with a price
    const pricedHomes = properties.filter((h) => h.price);

    // Sort by numeric price
    return pricedHomes.sort((a, b) => {
      const aVal = extractPriceValue(a.price);
      const bVal = extractPriceValue(b.price);
      return sortOrder === "Price_Low_High" ? aVal - bVal : bVal - aVal;
    });
  }, [properties, sortOrder]);

  return (
    <>
      {/* Header */}
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
          <img
            src={logo}
            alt="RU Housing Logo"
            style={{ height: "80px", marginRight: "20px" }}
          />
          <div style={{ display: "flex", gap: "25px" }}>
            <button
              className="home-button"
              style={{
                backgroundColor: "#A52A2A",
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
                backgroundColor: "#A52A2A",
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
            <Link to="/matched-profiles">
              {" "}
              {/* Updated Link here */}
              <button
                className="roommates-button"
                style={{
                  backgroundColor: "#A52A2A",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  border: "none",
                  fontWeight: "bold",
                }}
              >
                My Roommates
              </button>
            </Link>
            <Link to="/profile">
              <button
                className="profile-button"
                style={{
                  backgroundColor: "#A52A2A",
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
        </div >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Link to="/chat">
            <button className="roommates-button" style={{ padding: "6px 14px", backgroundColor: "#A52A2A", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", border: "none" }}>
              Chats
            </button>
          </Link>
          <Link to="/login">
            <button className="profile-button" style={{ padding: "6px 14px", backgroundColor: "#A52A2A", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", border: "none" }}>
              Logout
            </button>
          </Link>

          <Link to="/profile">
            <img
              src={photoUrl /* or avatar */}
              alt="User Avatar"
              style={{
                height: "60px",
                width: "60px",
                borderRadius: "50%",
                objectFit: "cover",
                background: "#fafafa",
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = avatar;
              }}
            />
          </Link>
        </div>
      </div>

      {/* Navbar */}
      <div
        style={{
          display: "flex",
          backgroundColor: "#A52A2A",
          padding: "5px 15px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
      </div>
      <div>

        {/* Background and Grid */}
        {/* Background and Grid */}
        <div
          style={{
            backgroundImage: `url(${building})`,
            backgroundSize: "100% auto",
            backgroundPosition: "top center",
            backgroundRepeat: "no-repeat",
            backgroundAttachment: "fixed",
            minHeight: "100vh",
            padding: "40px",
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          {/* Main Content Window */}
          <div
            style={{
              marginTop: "5px",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              boxShadow: '0 0 15px rgba(255, 0, 0, 0.8)',
              borderRadius: "12px",
              padding: "30px",
              width: "90%",
              maxWidth: "1200px",
            }}
          >

            {/* Search bar and Filter Button (Restored EXACTLY) */}
            <h1 style={{color:"white",fontSize:"30px", textAlign:"center", marginBottom:"10px"}}>
              Welcome Home, Scarlet Knight! Your search for off-campus living starts here :)
            </h1>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#F5F5F5",
                padding: "12px 20px",
                borderRadius: "8px",
                marginBottom: "20px",
              }}
            >
              {/* <input
              type="text"
              placeholder="Search for houses..."
              style={{
                padding: "8px 12px",
                width: "250px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            /> */}
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={searchProperties}
                  onChange={(e) => setSearchProperties(e.target.value)}
                  placeholder="Enter City or Area"
                />
                <button type="submit" style={{ padding: "1px" }}>
                  Search
                </button>
              </form>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowFilterDropdown((prev) => !prev)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#3498db",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Filter ⌄
                </button>

                <FilterDropdown
                  show={showFilterDropdown}
                  onClose={() => setShowFilterDropdown(false)}
                  onFilterChange={(filterUpdate) => {
                    if (filterUpdate.homeType !== undefined)
                      setHomeTypeFilter(filterUpdate.homeType);
                    if (filterUpdate.statusType !== undefined)
                      setStatusTypeFilter(filterUpdate.statusType);
                    if (filterUpdate.sortOrder !== undefined)
                      setSortOrder(filterUpdate.sortOrder);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {/* House Cards Grid (Restored EXACTLY with Save button) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "20px",
              }}
            >
              {displayedProperties.map((home, i) => {
                const available = isHouseAvailable(home);
                const rating = getHouseRating(home);

                return (
                  <div
                    key={home.zpid}
                    onClick={() => openModal(home)}
                    style={{
                      backgroundColor: "#f9f9f9",
                      borderRadius: "10px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                      overflow: "hidden",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    <img
                      src={home.imgSrc}
                      alt={`House ${i + 1}`}
                      style={{
                        width: "100%",
                        height: "160px",
                        objectFit: "cover",
                      }}
                    />
                    <div style={{ padding: "10px" }}>
                      {/* Clearly improved price styling */}
                      <p
                        style={{
                          margin: "8px 0",
                          fontWeight: "700",
                          fontSize: "18px",
                          color: "#2c3e50",
                        }}
                      >
                        {home.price
                          ? String(home.price).startsWith("$")
                            ? home.price
                            : `$${home.price}`
                          : "Price Not Listed"}
                      </p>

                      {/* Availability Status */}
                      <p
                        style={{
                          color: available ? "green" : "red",
                          fontWeight: "bold",
                        }}
                      >
                        {available
                          ? "Currently Available"
                          : "No Longer Available"}
                      </p>

                      {/* Star Rating clearly ABOVE Save button */}
                      <div
                        style={{
                          marginTop: "8px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          color: "#ffffff", // White text
                          backgroundColor: "#909090", // Light grayish background
                          borderRadius: "4px",
                          padding: "3px 8px",
                          display: "inline-block",
                        }}
                      >
                        ⭐ {getHouseRating(home).toFixed(1)} / 5
                      </div>

                      {/* Save button clearly BELOW Rating */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveHouse(home.zpid, home);
                        }}
                        style={{
                          padding: "5px 12px",
                          backgroundColor: "white",
                          border: "1px solid #ccc",
                          borderRadius: "20px",
                          cursor: "pointer",
                          color: "#e91e63",
                          fontWeight: "bold",
                          display: "block", // clearly forces button below rating, not inline
                          margin: "0 auto",
                        }}
                      >
                        ♥{" "}
                        {localStorage.getItem("savedHouses") &&
                          JSON.parse(localStorage.getItem("savedHouses")).includes(
                            home.zpid
                          )
                          ? "Unsave"
                          : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Number of pages for filter HERE */}
              <div style={{ marginTop: "20px" }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                  <button
                    key={pg}
                    onClick={() => setPage(pg)}
                    style={{
                      margin: "4px",
                      padding: "6px 12px",
                      backgroundColor: pg === page ? "#333" : "#eee",
                      color: pg === page ? "#fff" : "#000",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    {pg}
                  </button>
                ))}
              </div>
              {/* Number of pages for filter HERE */}
            </div>
          </div>
        </div>
        <HouseDetailModal
          isOpen={modalOpen}
          onRequestClose={closeModal}
          house={selectedHouse}
          available={selectedHouse ? isHouseAvailable(selectedHouse) : false}
          rating={selectedHouse ? getHouseRating(selectedHouse) : 0}
        />
      </div>
    </>
  );
}
export default HomePage;
