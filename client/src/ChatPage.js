// src/ChatPage.js
import React, { useState, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import avatar from "./images/default_avatar.png";
import { io } from 'socket.io-client';
import HeaderBar from "./HeaderBar";
import { Link } from "react-router-dom";


const socket = io("https://myruhousing.onrender.com");

function ChatPage() {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [chattingWith, setChattingWith] = useState(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [unreadCounts, setUnreadCounts] = useState({});
  const [userId, setUserId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(avatar);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        setUserId(user.uid);
        setPhotoUrl(
          `http://localhost:5002/api/profile-photo/${user.uid}?t=${Date.now()}`
        );
      } else {
        setUserId(null);
        setPhotoUrl(avatar);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 200 && newWidth <= window.innerWidth / 2) {
          setSidebarWidth(newWidth);
        }
      }
    };
  
  
    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.userSelect = "auto";
    };
  
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
    
  }, [isResizing]);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchChats = () => {
    fetch(`https://myruhousing.onrender.com/api/chat/rooms?userId=${currentUserId}`)
      .then((res) => res.json())
      .then((data) => {
        setAllUsers(data);
        if (!chattingWith && data.length > 0) {
          setChattingWith(data[0]);
        }
      });
  };

  useEffect(() => {
    if (!currentUserId) return;
    fetchChats();
  }, [currentUserId, chattingWith]);

  useEffect(() => {
    socket.on("messageSent", ({ senderId, receiverId }) => {
      const idToMove = senderId === currentUserId ? receiverId : senderId;
      setAllUsers((prevUsers) => {
        const movedUser = prevUsers.find((u) => u.uid === idToMove);
        if (!movedUser) return prevUsers;
        const rest = prevUsers.filter((u) => u.uid !== idToMove);
        return [movedUser, ...rest];
      });
      if (receiverId === currentUserId && chattingWith?.uid !== senderId) {
        setUnreadCounts((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
      }
      fetchChats();
    });

    socket.on("typing", ({ from, to }) => {
      if (to === currentUserId) {
        setTypingUsers((prev) => ({ ...prev, [from]: true }));
      }
    });

    socket.on("stopTyping", ({ from, to }) => {
      if (to === currentUserId) {
        setTypingUsers((prev) => {
          const updated = { ...prev };
          delete updated[from];
          return updated;
        });
      }
    });

    return () => {
      socket.off("messageSent");
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [currentUserId, chattingWith]);

  if (!currentUserId) return <p>Loading chat...</p>;

  return (
    <>
    <HeaderBar photoUrl={(photoUrl)} />

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
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{
          width: `${sidebarWidth}px`,
          minWidth: '200px',
          maxWidth: `${window.innerWidth / 2}px`,
          backgroundColor: '#121212',
          borderRight: '1px solid #333',
          overflowY: 'auto',
          color: 'white',
          boxShadow: '2px 0 6px rgba(0,0,0,0.4)',
          transition: 'all 0.3s ease-in-out'
        }}
      >
        <input
          type="text"
          placeholder="Search chats..."
          style={{
            width: '90%',
            margin: '10px',
            padding: '8px 12px',
            borderRadius: '20px',
            border: 'none',
            outline: 'none',
            backgroundColor: '#1e1e1e',
            color: 'white',
          }}
        />

        <h3 style={{ padding: '1rem', backgroundColor: '#cc0033', color: 'white', margin: 0 }}>
          Your Chats
        </h3>

        <div style={{ transition: 'all 0.3s ease-in-out' }}>
          {allUsers.map((user) => {
            const isActive = chattingWith?.uid === user.uid;
            const isTyping = typingUsers[user.uid];
            const unread = unreadCounts[user.uid] || 0;
            return (
              <div
                key={user.uid}
                onClick={() => {
                  setChattingWith(user);
                  setUnreadCounts((prev) => ({ ...prev, [user.uid]: 0 }));
                }}
                style={{
                  margin: '10px',
                  padding: '12px',
                  borderRadius: '20px',
                  backgroundColor: isActive ? '#cc0033' : '#1e1e1e',
                  color: isActive ? 'white' : '#f0f0f0',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isActive ? '0 0 10px rgba(204, 0, 51, 0.8)' : '0 2px 4px rgba(0, 0, 0, 0.3)',
                  transition: 'all 0.2s ease-in-out',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = '#1e1e1e';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img
                    src={`https://myruhousing.onrender.com/api/profile-photo/${user.uid}`}
                    alt="profile"
                    onError={(e) => (e.target.src = avatar)}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginRight: 12,
                      border: '2px solid white'
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                    <div style={{ fontSize: '0.8rem', color: '#bbb', marginTop: 2 }}>
                      {isTyping
                        ? <span style={{ color: '#0f0' }}>Typing...</span>
                        : user.lastMessage
                          ? user.lastMessage.slice(0, 40) + (user.lastMessage.length > 40 ? '...' : '')
                          : 'No messages yet'}
                    </div>
                  </div>
                </div>
                {unread > 0 && (
                  <div style={{
                    backgroundColor: '#00ff00',
                    color: 'black',
                    fontWeight: 'bold',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '0.75rem',
                    marginLeft: '10px'
                  }}>
                    {unread}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div
  onMouseDown={() => {
    setIsResizing(true);
    document.body.style.userSelect = "none"; // prevent weird text selection
  }}
  style={{
    width: '6px',
    cursor: 'col-resize',
    background: 'linear-gradient(to right, #444, #888)',
    zIndex: 10,
  }}
></div>


      <div style={{ flex: 1 }}>
        {chattingWith ? (
          <ChatWindow
            key={chattingWith.uid}
            currentUserId={currentUserId}
            chattingWith={chattingWith}
          />
        ) : (
          <div style={{ padding: '2rem' }}>Select a user to start chatting</div>
        )}
      </div>
    </div>
    </>
  );
}

export default ChatPage;