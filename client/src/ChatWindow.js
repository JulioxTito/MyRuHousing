import React, { useState, useEffect, useRef } from "react";
import bgpattern from './images/backchat.jpg'; // Use .jpg — change to .png if that's the correct version
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';
import { motion } from "framer-motion";



const socket = io("http://https://myruhousing.onrender.com
");

function ChatWindow({ currentUserId, chattingWith, goBack }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [justSentMessage, setJustSentMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const bottomRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);//! julio was here, emojis uu
  const emojiPickerRef = useRef(null);

  const scrollToBottom = () => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "auto" });
    }
  };

  const fetchMessages = async (scroll = false) => {
    try {
      const res = await fetch(`http://https://myruhousing.onrender.com
/api/chat?user1=${currentUserId}&user2=${chattingWith.uid}`);
      if (res.ok) {
        const chatHistory = await res.json();
        setMessages(chatHistory);
        if (scroll) {
          setTimeout(() => scrollToBottom(), 0);
        }
      } else {
        console.error("Failed to fetch chat history");
      }
    } catch (error) {
      console.error("Error fetching chat:", error);
    }
  };

  const handleTyping = () => {
    socket.emit("typing", { to: chattingWith.uid, from: currentUserId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", { to: chattingWith.uid, from: currentUserId });
    }, 1000);
  };

  const sendMessage = async (customMessage = null) => {
    const messageToSend = (customMessage || newMessage).trim();
    if (messageToSend === "") return;
  
    try {
      const res = await fetch('http://https://myruhousing.onrender.com
/api/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: chattingWith.uid,
          message: messageToSend,
        }),
      });
  
      if (res.ok) {
        const newMsgObj = {
          senderId: currentUserId,
          receiverId: chattingWith.uid,
          message: messageToSend,
          timestamp: new Date(),
        };
  
        setNewMessage("");
        setJustSentMessage(true);
        setMessages((prev) => [...prev, newMsgObj]);
        socket.emit("sendMessage", newMsgObj);
      } else {
        console.error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  

  useEffect(() => {
    if (chattingWith?.uid) {
      fetchMessages(true);
    }
  }, [chattingWith?.uid]);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    socket.on('receiveMessage', (msg) => {
      if (
        (msg.senderId === chattingWith.uid && msg.receiverId === currentUserId) ||
        (msg.senderId === currentUserId && msg.receiverId === chattingWith.uid)
      ) {
        setMessages((prevMessages) => [...prevMessages, msg]);
      }
    });
    

    socket.on('typing', (data) => {
      if (data.from === chattingWith.uid && data.to === currentUserId) {
        setIsTyping(true);
      }
    });
    
    socket.on('stopTyping', (data) => {
      if (data.from === chattingWith.uid && data.to === currentUserId) {
        setIsTyping(false);
      }
    });
    

    return () => {
      socket.off('receiveMessage');
      socket.off('typing');
      socket.off('stopTyping');
    };
  }, [chattingWith.uid]);

  useEffect(() => {
    if (justSentMessage) {
      scrollToBottom();
      setJustSentMessage(false);
    }
  }, [messages]);

  useEffect(() => {
    setTimeout(() => scrollToBottom(), 50);
  }, [messages, isTyping]);
  useEffect(() => {
    function handleClickOutside(event) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    }
  
    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
  
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);
  

  return (
    
    <div style={{
      backgroundColor: "#121212",
      height: "100vh",
      color: "white",
      display: "flex",
      flexDirection: "column"
    }}>
      {goBack && (
        <button onClick={goBack} style={{ margin: "1rem", padding: "8px" }}>
          ← Back
        </button>
      )}

<div style={{
  padding: "10px 20px",
  backgroundColor: "#202c33",
  borderBottom: "1px solid #333",
  display: "flex",
  alignItems: "center",
  gap: "12px"
}}>
  <img
    src={`http://https://myruhousing.onrender.com
/api/profile-photo/${chattingWith.uid}`}
    alt="avatar"
    onError={(e) => (e.target.src = require('./images/default_avatar.png'))}
    style={{
      width: "42px",
      height: "42px",
      borderRadius: "50%",
      objectFit: "cover"
    }}
  />
  <div>
    <div style={{ color: "#fff", fontWeight: "bold", fontSize: "16px" }}>
      {chattingWith.firstName} {chattingWith.lastName}
    </div>
    <div style={{ color: "#0f0", fontSize: "13px" }}>Online</div>
  </div>
</div>


      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundImage: `url(${bgpattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          padding: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
    {messages.map((msg, index) => {
  const isMine = msg.senderId === currentUserId;
  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: "flex",
        justifyContent: isMine ? "flex-end" : "flex-start",
        marginBottom: "10px",
      }}
    >
      {!isMine && (
        <img
          src={`http://https://myruhousing.onrender.com
/api/profile-photo/${chattingWith.uid}`}
          alt="avatar"
          onError={(e) => (e.target.src = require('./images/default_avatar.png'))}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            marginRight: "10px",
            alignSelf: "flex-end",
          }}
        />
      )}

      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          backgroundColor: isMine ? "#005c4b" : "#2c2c2c",
          color: "white",
          padding: "10px 14px",
          borderRadius: isMine ? "16px 16px 0 16px" : "16px 16px 16px 0",
          maxWidth: "60%",
          wordBreak: "break-word",
          fontSize: "15px",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.4)",
        }}
      >
        {msg.message.startsWith("img:") ? (
          <img
            src={msg.message.replace("img:", "")}
            alt="sent"
            style={{
              maxWidth: "200px",
              borderRadius: "12px",
              marginTop: "6px"
            }}
          />
        ) : (
          msg.message
        )}
        <div style={{ fontSize: "11px", color: "#ccc", marginTop: "4px", textAlign: isMine ? "right" : "left" }}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>
    </motion.div>
  );
})}



        {isTyping && (
          <div style={{ fontSize: "16px", color: "#ccc", fontWeight: "bold", margin: "8px 12px" }}>
            {chattingWith.firstName} is typing
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
            <style>
              {`
                .dot {
                  animation: blink 1s infinite;
                }
                .dot:nth-child(2) {
                  animation-delay: 0.2s;
                }
                .dot:nth-child(3) {
                  animation-delay: 0.4s;
                }
                @keyframes blink {
                  0% { opacity: 0 }
                  50% { opacity: 1 }
                  100% { opacity: 0 }
                }
              `}
            </style>
          </div>
        )}
        <div ref={bottomRef}></div>
      </div>

      <div style={{
  display: 'flex',
  alignItems: 'center',
  padding: '12px 16px',
  backgroundColor: '#1e1e1e',
  borderTop: '1px solid #333',
  gap: '10px',
  position: 'relative' //! JULIO WAS HERE!This makes emoji picker position work!
}}>


  {/* 😊 Emoji Button */}
<button
  onClick={() => setShowEmojiPicker((prev) => !prev)}
  
  style={{
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "24px",
    color: "white"
  }}
>
  😊
</button>
{/* 📷 Image Upload */}
<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://https://myruhousing.onrender.com
/api/upload-image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.imageUrl) {
        const imageMessage = `img:${data.imageUrl}`;
        setNewMessage(imageMessage); // You can also call sendMessage directly
        sendMessage(imageMessage); // Send it immediately
      }
    } catch (err) {
      console.error("Image upload failed:", err);
    }
  }}
  style={{ display: "none" }}
  id="upload-image"
/>
<label htmlFor="upload-image" style={{ cursor: "pointer", fontSize: "24px", color: "white" }}>
  📷
</label>


{/* Emoji Picker Dropdown */}
{showEmojiPicker && (
  <div
    ref={emojiPickerRef}
    style={{ position: 'absolute', bottom: '60px', left: '10px', zIndex: 10 }}
  >
    <EmojiPicker
      theme="dark"
      onEmojiClick={(emojiData) => {
        setNewMessage((prev) => prev + emojiData.emoji);
        setShowEmojiPicker(false); // Auto close after selecting
      }}
    />
  </div>
)}



  <input
    type="text"
    placeholder="Type a message..."
    value={newMessage}
    onChange={(e) => {
      setNewMessage(e.target.value);
      handleTyping();
    }}
    onKeyDown={(e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
        
      }
    }}
    style={{
      flex: 1,
      padding: "12px 16px",
      backgroundColor: "#2a2f32",
      color: "white",
      border: "none",
      borderRadius: "24px",
      fontSize: "15px",
      outline: "none",
      boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
    }}
  />
  <button
  type="button"
  onClick={() => sendMessage()}

    style={{
      backgroundColor: "#cc0033",
      color: "white",
      border: "none",
      borderRadius: "50%",
      width: "45px",
      height: "45px",
      fontWeight: "bold",
      fontSize: "16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: "background-color 0.3s ease",
      boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#a60027"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#cc0033"}
  >
    ➤
  </button>
</div>

    </div>
  );
}

export default ChatWindow;
