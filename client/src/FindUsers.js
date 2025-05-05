// src/FindUsers.js
import React, { useState, useEffect } from "react";
import bg from "./images/BG.webp";
import './HomePage.css';
import { useNavigate } from 'react-router-dom';

function FindUsers({ currentUserId }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFindUsers, setShowFindUsers] = useState(false);

  const navigate = useNavigate(); // ✅ must be inside component

  // ✅ Also define the function here, so it can access `navigate`
  const handleStartChat = (user) => {
    navigate("/chat", { state: { chattingWith: user } });
  };

  const fetchUsers = async () => {
    const res = await fetch('https://myruhousing.onrender.com/api/all-users');
    if (res.ok) {
      const usersList = await res.json();
      setUsers(usersList);
    } else {
      console.error("Failed to fetch users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullText = `${user.firstName} ${user.lastName} ${user.email} ${user.netID}`.toLowerCase();
    return fullText.includes(searchQuery.toLowerCase());
  });

  return (
    <div
      style={{
        backgroundImage: `url(${bg})`,
        backgroundSize: "200% auto",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "200vh",
        padding: "50px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <div className="profile-page"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.7)",
          boxShadow: '0 0 15px rgba(255, 0, 0, 0.8)',
          margin: "10px",
          width: "1000px",
          alignContent: "center"
        }}>
        <div style={{ marginTop: "5px", color: "white" }}>
          <input
            type="text"
            placeholder="Search by name, last name, email, or netID"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ marginBottom: "1rem", padding: "5px", width: "300px" }}
          />

          {filteredUsers.map((user) => (
            user.uid !== currentUserId && (
              <div key={user.uid} style={{ marginBottom: "10px", border: "1px solid gray", padding: "10px" }}>
                <p style={{ fontSize: "20px" }}><strong>{user.firstName} {user.lastName}</strong></p>
                <p>Email: {user.email}</p>
                <p>NetID: {user.netID}</p>
                <button className="find-Users-button" style={{
                  margin: "20px",
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                }} onClick={() => handleStartChat(user)}>Chat With {user.firstName}</button>
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export default FindUsers;
