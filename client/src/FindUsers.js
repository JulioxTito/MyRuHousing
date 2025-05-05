// src/FindUsers.js
import React, { useState, useEffect } from "react";

function FindUsers({ currentUserId, startChat }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    const res = await fetch('http://myruhousing-1.onrender.com/api/all-users');
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
    <div style={{ marginTop: "2rem" }}>
      <h2>Find Users Page Working!</h2>
      
      {/* 🔥 Search Bar */}
      <input
        type="text"
        placeholder="Search by name, last name, email, or netID"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "1rem", padding: "5px", width: "300px" }}
      />

      {/* 🔥 Show matching users */}
      {filteredUsers.map((user) => (
        user.uid !== currentUserId && (
          <div key={user.uid} style={{ marginBottom: "10px", border: "1px solid gray", padding: "10px" }}>
            <p><strong>{user.firstName} {user.lastName}</strong></p>
            <p>Email: {user.email}</p>
            <p>NetID: {user.netID}</p>
            <button onClick={() => startChat(user)}>Chat With {user.firstName}</button>
          </div>
        )
      ))}
    </div>
  );
}

export default FindUsers;
