import React, { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";// julio? what are you doing here?
import { auth } from "./firebase";// adjust path, omg julio was here one more time
import avatar from "./images/default_avatar.png";
import RoommatesForm from './RoommatesForm';// Adjust the path if necessary
import FindUsers from "./FindUsers";// julio was here again!
import ChatWindow from "./ChatWindow";//FOR THE Chat duh, julio here!
import building from "./images/clearBuilding.png";
import './ProfilePage.css';
import HeaderBar from "./HeaderBar";
import { Link } from "react-router-dom";

function ProfilePage() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState(null);
  const [netID, setNetID] = useState("");
  const [showFindUsers, setShowFindUsers] = useState(false);
  const [chattingWith, setChattingWith] = useState(null);
  // -- photo upload states --
  const [photoFile, setPhotoFile] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(avatar);
  const savedPhoto = localStorage.getItem('photoUrl');


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        setUserId(user.uid);
        localStorage.setItem('userId', user.uid);

        // fetch profile info
        const res = await fetch(`http://https://myruhousing.onrender.com
/api/profile?uid=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setFirstName(data.firstName || "");
          setLastName(data.lastName || "");
          setUserId(data.uid);
          setNetID(data.netID || "");
        } else {
          console.error("Failed to fetch profile data");
        }

        // fetch photo (AFTER user ID is known, so the photo API works)
        setPhotoUrl(savedPhoto || `http://https://myruhousing.onrender.com
/api/profile-photo/${user.uid}?${Date.now()}`);
      } else {
        setFirebaseUser(null);
        setUserId(null);
        setFirstName("");
        setLastName("");
        setNetID("");
        setPhotoUrl(avatar);
        localStorage.removeItem('userId');
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Handlers ---
  const handleFirstNameChange = (e) => setFirstName(e.target.value);
  const handleLastNameChange = (e) => setLastName(e.target.value);

  // 🟡 UPLOAD PROFILE PHOTO (this was missing OUTSIDE handleSave!)
  const handlePhotoUpload = async () => {
    if (!photoFile || !userId) {
      alert("Please select a photo first!");
      return;
    }
    const formData = new FormData();
    formData.append("photo", photoFile);
    formData.append("uid", userId);

    const res = await fetch("http://https://myruhousing.onrender.com
/api/profile-photo", {
      method: "POST",
      body: formData,
    });
    if (res.ok) {
      const newUrl = `http://https://myruhousing.onrender.com
/api/profile-photo/${userId}?${Date.now()}`;
      setPhotoUrl(newUrl);
      localStorage.setItem('photoUrl', newUrl); // ✅ SAVE for other components
      setPhotoFile(null);
      alert("Photo uploaded!");
    } else {
      alert("Error uploading photo");
    }
  };

  // Profile save handler
  const handleSave = async () => {
    if (!firebaseUser) return;

    const res = await fetch("http://https://myruhousing.onrender.com
/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        firstName,
        lastName,
        netID,
      }),
    });

    if (res.ok) {
      const result = await res.json();
      alert(result.message || "Profile Saved!");

      // Fetch latest profile data after save
      const updatedProfile = await fetch(`http://https://myruhousing.onrender.com
/api/profile?uid=${firebaseUser.uid}`);
      if (updatedProfile.ok) {
        const updatedData = await updatedProfile.json();
        setFirstName(updatedData.firstName || "");
        setLastName(updatedData.lastName || "");
        setNetID(updatedData.netID || "");
      }
    } else {
      const errorResult = await res.json();
      alert(errorResult.error || "Failed to save profile.");
    }
  };

  // --- RETURN ---
  if (!firebaseUser) return <p>Please log in to see your profile.</p>;


  //! CHATTTING WITH JULIO
  if (chattingWith) {
    return (
      <ChatWindow
        currentUserId={userId}
        chattingWith={chattingWith}
        goBack={() => setChattingWith(null)}
      />
    );
  }
  // FPR THE USERS, JULIO BACK HERE
  if (showFindUsers) {
    return (
      <div >
        <button className="find-Users-button" onClick={() => setShowFindUsers(false)} style={{
          margin: "20px",
          position: 'absolute',
          background: 'transparent',
          border: '2px solid white',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000
        }}>
        Back to Profile
        </button>
        <FindUsers currentUserId={userId} startChat={setChattingWith} />
      </div>
    );
  }
  //  If not showing FindUsers, show normal profile, JULIO WAS HERE
  // main profile page user interface
  return (
    <>
      <HeaderBar photoUrl={photoUrl} />

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

      <div style={{
        backgroundImage: `url(${building})`,
        backgroundSize: "100% auto",
        backgroundPosition: "top center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
        minHeight: "calc(100vh - 130px)",
        padding: "40px",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}>
        <div className="profile-page" 
        style={{ backgroundColor: "rgba(0, 0, 0, 0.7)",
            boxShadow: '0 0 15px rgba(255, 0, 0, 0.8)', margin: "5px"}}>
          <div>
          <h2 style={{
          color: "#F5F5F5",
          fontWeight: "bold",
          fontSize: "30px",
          marginBottom: "20px",
          flexGrow: 1,
          textAlign: "center",
        }}>
          Welcome,  <strong>{firstName || firebaseUser.email}</strong>!
        </h2>
            {/* Profile Photo */}
            <section className="photo-section">
              <img
                src={photoUrl}
                alt="Profile"
                className="profile-avatar"
                onError={(e) => (e.target.src = avatar)}
              />

              <div className="upload-controls">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])}
                />
                <button onClick={handlePhotoUpload} disabled={!photoFile} style={{ width: "160px", margin: "20px",
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',}}>
                  Upload
                </button>
              </div>
            </section>

            <section className="profile-form">
              <div className="form-group" style={{ display: "flex", flexDirection: "column" }}>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={handleFirstNameChange}
                  placeholder="First Name"
                />
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={handleLastNameChange}
                  placeholder="Last Name"
                />
                <input
                  type="text"
                  name="netID"
                  value={netID}
                  onChange={(e) => setNetID(e.target.value)}
                  placeholder="NetID"
                />
              </div>

              <div className="others-controls" style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "10px" }}>
                <button className="save-profile-button" onClick={handleSave} style={{ margin: "5px",
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',}}>
                  Save Profile
                </button>
              </div>
            </section>

            <hr style={{ border: "none", height: "4px", backgroundColor: "white", margin: "30px 0", borderRadius: "2px" }} />

            <div className="others-controls" style={{ display: "flex", justifyContent: "center", gap: "16px", marginTop: "5px" }}>
              <button className="find-roommates-button" onClick={() => setShowFindUsers(true)} style={{ margin: "20px",
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',}}>
                Find Roommates
              </button>

              <Link to="/chat">
                <button
                  className="find-roommates-button" style={{ width: "160px", margin: "20px",
                  background: 'transparent',
                  border: '2px solid white',
                  color: 'white',
                  padding: '8px 16px',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',}}>
                  Go to Chats
                </button>
              </Link>
            </div>

            <hr style={{ border: "none", height: "4px", backgroundColor: "white", margin: "30px 0", borderRadius: "2px" }} />


          </div>
          <section className="roommates-form-section">
            <RoommatesForm firstName={firstName} lastName={lastName} userId={userId} />
          </section>
        </div>
      </div>
    </>


  );


}

export default ProfilePage;
