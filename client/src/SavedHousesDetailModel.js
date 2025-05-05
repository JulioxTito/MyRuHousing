import { React, useEffect, useState } from "react";
import Modal from "react-modal";
import ImageGallery from "react-image-gallery";
import "react-image-gallery/styles/css/image-gallery.css";
import owners from "./ownerData";
import { preferencesList, leaseTerms } from "./preferencesData";
import axios from "axios";

Modal.setAppElement("#root");

function SavedHousesDetailModel({ isOpen, onRequestClose, house }) {
  if (!house) return null;

  const photos = house.carouselPhotos
    ? house.carouselPhotos
    : [{ url: house.imgSrc }];

  const images = photos.map((pic) => ({
    original: pic.url,
    thumbnail: pic.url,
  }));

  // Remove the old fixed preference list completely
  // const preferenceList = [ ... ] <-- REMOVE THIS

  // Replace with this clearly:
  const preferences = house.preferences;
  const leaseTerm = house.leaseTerm;

  // save house when clicking button
  const handleUnSavedClick = async (e) => {
    e.preventDefault();
    // 1. get the userId from local storage
    const userId = localStorage.getItem("userId");

    // 2.) delete the house
    try {
      const response = await axios.delete(
        `http://https://myruhousing.onrender.com
/api/house/${house._id}`
      );
      alert(response.data.message);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("An unexpected error occurred while deleting the house.");
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
          {/* <p style={{ fontSize: "16px", color: "#555", marginBottom: "15px" }}>
            {house.address || "Address not available"}
          </p> */}
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
                backgroundColor: house.available ? "#4CAF50" : "#E53935",
                padding: "5px 10px",
                borderRadius: "5px",
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Status:{" "}
              {house.available ? "Currently Available" : "No Longer Available"}
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
              ⭐ {house.rating.toFixed(1)} / 5
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
              {house.preferences.map((pref, idx) => (
                <li key={idx}>✅ {pref}</li>
              ))}
            </ul>
          </div>
          <button
            onClick={handleUnSavedClick}
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
            Unsave
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
            Owner: {house.owner.name}
          </p>
          <p
            style={{
              fontWeight: "bold",
              marginBottom: "5px",
              fontSize: "14px",
              color: "#333",
            }}
          >
            Email: {house.owner.email}
          </p>
          <p style={{ fontWeight: "bold", fontSize: "14px", color: "#333" }}>
            Phone Number: {house.owner.phone}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default SavedHousesDetailModel;
