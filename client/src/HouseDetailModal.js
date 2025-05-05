import { React, useEffect, useState } from "react";
import Modal from "react-modal";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import owners from "./ownerData";
import { preferencesList, leaseTerms } from "./preferencesData";
import axios from "axios";

// Generate consistent preferences based on house ID (zpid)
const getPreferences = (zpid) => {
  const seed = parseInt(zpid.slice(-4), 10);

  const selectedPreferences = preferencesList.filter((_, index) => {
    return (seed + index) % 2 === 0; // Consistent selection
  });

  // Ensure each house clearly has at least 3 preferences and at most 6
  const minPreferences = 3;
  const maxPreferences = 6;
  const count = Math.max(minPreferences, seed % (maxPreferences + 1));

  return selectedPreferences.slice(0, count);
};

// Always select exactly one lease term per property
const getLeaseTerm = (zpid) => {
  const seed = parseInt(zpid.slice(-4), 10);
  return leaseTerms[seed % leaseTerms.length];
};

Modal.setAppElement("#root");

// Function clearly assigns an owner to a house based on its zpid
const getOwnerInfo = (zpid) => {
  const index = parseInt(zpid.slice(-3), 10) % owners.length;
  return owners[index];
};

function HouseDetailModal({
  isOpen,
  onRequestClose,
  house,
  available,
  rating,
}) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");

  useEffect(() => {
    if (house && house.zpid) {
      axios
        .get(`http://myruhousing-1.onrender.com/api/houses/${house.zpid}/reviews`)
        .then((res) => setReviews(res.data))
        .catch((err) => console.error("Error loading reviews", err));
    }
  }, [house]);

  const submitReview = () => {
    console.error("Submit review function called");
    if (!house || !house.zpid) {
      console.error("Cannot submit review: House ID is undefined");
      return;
    }

    if (!newReview.trim()) {
      console.log("Empty review, not submitting");
      return;
    }

    console.log("Submitting review:", newReview, "for house:", house.zpid);

    axios
      .post(`http://myruhousing-1.onrender.com/api/houses/${house.zpid}/reviews`, {
        text: newReview,
      })
      .then((res) => {
        console.log("Review submission response:", res.data);
        // Fetch the updated reviews instead of relying on response
        return axios.get(
          `http://myruhousing-1.onrender.com/api/houses/${house.zpid}/reviews`
        );
      })
      .then((res) => {
        console.log("Updated reviews:", res.data);
        setReviews(res.data);
        setNewReview("");
      })
      .catch((err) => {
        console.error("Error submitting review:", err.response || err);
      });
  };

  if (!house) return null;

  const owner = getOwnerInfo(house.zpid); // get the owner data clearly

  const photos = house.carouselPhotos
    ? house.carouselPhotos
    : [{ url: house.imgSrc }];

  const images = photos.map((pic) => ({
    original: pic.url,
    thumbnail: pic.url,
  }));

  // Replace with this clearly:
  const preferences = getPreferences(house.zpid);
  const leaseTerm = getLeaseTerm(house.zpid);

  // save house when clicking button
  const handleSavedClick = async (e) => {
    e.preventDefault();
    // 1. get the userId from local storage
    const userId = localStorage.getItem("userId");

    //2. get all the house information we need
    let body = {
      userId: userId,
      address: house.address,
      bathrooms: house.bathrooms,
      bedrooms: house.bedrooms,
      livingArea: house.livingArea,
      propertyType: house.propertyType,
      lotAreaValue: house.lotAreaValue,
      listingStatus: house.listingStatus,
      price: house.price,
      imgSrc: house.imgSrc,
      preferences: preferences,
      owner: owner,
      carouselPhotos: house.carouselPhotos,
      rating: rating,
      available: available,
      leaseTerm: leaseTerm,
    };

    // 3.) call the api/house route to save house
    try {
      const response = await axios.post(
        "http://myruhousing-1.onrender.com/api/house",
        body
      );

      alert(response.data.message);
      // setIsSaved((prev) => !prev);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("An unexpected error occurred while saving the house.");
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={{
        overlay: { backgroundColor: "rgba(0,0,0,0.8)" },
        content: {
          maxWidth: "900px",
          margin: "auto",
          borderRadius: "10px",
          padding: "0",
          overflow: "auto",
          backgroundColor: "#f0f8ff",
        },
      }}
    >
      <ImageGallery items={images} showPlayButton={false} />

      <div
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        {/* Left Side: House Details */}
        <div style={{ flex: "2", paddingRight: "20px" }}>
          <h2
            style={{
              fontSize: "30px",
              fontWeight: "bold",
              marginBottom: "5px",
            }}
          >
            {house.price
              ? typeof house.price === "string" &&
                house.price.trim().startsWith("$")
                ? house.price
                : `$${Number(house.price).toLocaleString()}/month`
              : "Price Not Listed"}
          </h2>

          <a
            style={{ fontSize: "16px", color: "#555", marginBottom: "15px" }}
            href={
              "https://www.google.com/maps/search/?api=1&basemap=satellite&query=" +
              encodeURIComponent(house.address)
            }
            target="_blank"
            rel="noopener noreferrer"
            className="address-link"
            onClick={(e) => e.stopPropagation()} // keeps parent card from closing
          >
            {house.address}
          </a>

          {/* Status and Rating clearly displayed separately */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
            <div
              style={{
                color: "white",
                backgroundColor: available ? "#4CAF50" : "#E53935",
                padding: "5px 10px",
                borderRadius: "5px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Status:{" "}
              {available ? "Currently Available" : "No Longer Available"}
            </div>

            <div
              style={{
                padding: "5px 10px",
                backgroundColor: "#909090",
                borderRadius: "5px",
                fontWeight: "bold",
                fontSize: "14px",
                color: "#ffffff",
              }}
            >
              ⭐ {rating.toFixed(1)} / 5
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "15px",
              fontSize: "16px",
              marginBottom: "20px",
            }}
          >
            <span>🛏️ {house.bedrooms || "N/A"} beds</span>
            <span>🛁 {house.bathrooms || "N/A"} baths</span>
            <span>📐 {house.livingArea || "N/A"} sqft</span>
          </div>

          <div style={{ fontSize: "15px", color: "#555" }}>
            <p>
              <strong>Property Type:</strong> {house.propertyType || "N/A"}
            </p>
            <p>
              <strong>Lot Area:</strong>{" "}
              {house.lotAreaValue ? `${house.lotAreaValue} sqft` : "N/A"}
            </p>
            <p>
              <strong>Status:</strong> {house.listingStatus || "N/A"}
            </p>
          </div>

          <div style={{ marginTop: "20px", fontSize: "15px", color: "#555" }}>
            <h3 style={{ marginBottom: "10px" }}>Preferences:</h3>
            <ul>
              <li>
                ✅ <strong>Minimum lease term:</strong> {leaseTerm}
              </li>
              {preferences.map((pref, idx) => (
                <li key={idx}>✅ {pref}</li>
              ))}
            </ul>
          </div>

          <button
            onClick={handleSavedClick}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "20px",
              marginRight: "10px",
            }}
          >
            Save
          </button>

          <button
            onClick={onRequestClose}
            style={{
              padding: "10px 20px",
              backgroundColor: "#1976D2",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              marginTop: "20px",
            }}
          >
            Close
          </button>

          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>Reviews</h3>
            <ul style={{ marginBottom: "15px" }}>
              {reviews.length > 0 ? (
                reviews.map((r, i) => (
                  <li
                    key={i}
                    style={{
                      marginBottom: "8px",
                      padding: "5px",
                      borderBottom: "1px solid #ddd",
                    }}
                  >
                    {r.text}{" "}
                    <small>({new Date(r.date).toLocaleDateString()})</small>
                  </li>
                ))
              ) : (
                <li>No reviews yet. Be the first to review!</li>
              )}
            </ul>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                console.log("Form submitted");
                submitReview();
              }}
            >
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Write a review..."
                style={{
                  width: "100%",
                  padding: "10px",
                  marginBottom: "10px",
                  minHeight: "80px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "8px 15px",
                  backgroundColor: "#1976D2",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Owner Info */}
        <div
          style={{
            flex: "1",
            backgroundColor: "#e8f4fd",
            borderRadius: "10px",
            padding: "15px",
            textAlign: "center",
            alignSelf: "start",
          }}
        >
          <img
            src={require("./images/default_avatar.png")}
            alt="Owner Avatar"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              marginBottom: "10px",
            }}
          />
          <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
            Owner: {owner.name}
          </p>
          <p
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              fontSize: "14px",
              color: "#333",
            }}
          >
            Email: {owner.email}
          </p>
          <p style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>
            Phone Number: {owner.phone}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default HouseDetailModal;
