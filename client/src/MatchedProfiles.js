import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import HeaderBar from "./HeaderBar";
import { Link } from "react-router-dom";
import building from "./images/clearBuilding.png";
import avatar from "./images/default_avatar.png";
import ChatPage from './ChatPage';
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import './HomePage.css';


const reportButtonStyle = {
  position: 'fixed',
  bottom: '20px',
  right: '20px',
  backgroundColor: '#A52A2A',
  color: 'white',
  borderRadius: '4px',
  padding: '12px 20px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  cursor: 'pointer',
  fontSize: '1em',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  zIndex: 1000,
};

const reportFormContainerStyle = {
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: 'white',
  padding: '20px',
  borderRadius: '8px',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
  zIndex: 1001,
};

const reportFormStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
};

const reportInputStyle = {
  padding: '10px',
  borderRadius: '4px',
  border: '1px solid #ccc',
};

const reportSubmitButtonStyle = {
  padding: '10px 15px',
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

const matchedProfilesContainerStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
  backgroundColor: "rgba(0, 0, 0, 0.7)",
  boxShadow: '0 0 15px rgba(255, 0, 0, 0.8)',
  borderRadius: '8px',
  margin: '20px',
  width: '800px'
};

const headingStyle = {
  color: '#F5F5F5',
  marginBottom: '20px',
};

const profileCardStyle = {
  backgroundColor: 'white',
  border: '1px solid #ddd',
  borderRadius: '6px',
  padding: '15px',
  marginBottom: '15px',
  width: '80%',
  maxWidth: '600px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
  display: 'grid',
  gridTemplateColumns: '1fr 100px',
  gridTemplateRows: 'auto auto auto', // Adjusted for button placement
  alignItems: 'start',
  gap: '10px',
};

const profilePreviewInfoStyle = {
  textAlign: 'left',
  gridColumn: '1 / 2',
};

const profileImageContainerStyle = {
  width: '150px',
  height: '150px',
  borderRadius: '50%',
  overflow: 'hidden',
  backgroundColor: '#ccc',
  gridColumn: '2 / 3',
  gridRow: '1 / 2',
  justifySelf: 'start', // Center the image container in its grid cell
  marginLeft: '-100px',
};

const profileImageStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
};

const profileInfoStyle = {
  textAlign: 'left',
  marginTop: '10px',
  gridColumn: '1 / 3',
  maxHeight: '0',
  overflow: 'hidden',
  transition: 'max-height 0.3s ease-in-out',
};

const expandedProfileInfoStyle = {
  ...profileInfoStyle,
  maxHeight: '500px', // Adjust as needed
};

const attributeStyle = {
  margin: '5px 0',
  color: '#555',
};

const matchLevelStyle = {
  fontWeight: 'bold',
  marginTop: '5px',
};

const matchScoreStyle = {
  fontSize: '0.9em',
  color: '#777',
  marginTop: '2px',
};

const buttonsContainerStyle = {
  gridColumn: '1 / 3', // Span both columns
  display: 'flex',
  justifyContent: 'center', // Center the buttons horizontally
  alignItems: 'center',
  marginTop: '10px',
};

const knowMoreButtonStyle = {
  backgroundColor: '#007bff',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: '0.9em',
  marginRight: '10px', // Add some space between the buttons
};

const sayHelloButtonStyle = {
  backgroundColor: '#28a745',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: '0.9em',
  marginLeft: '10px', // Add some space between the buttons
};

const defaultAvatar = require('./images/default_avatar.png'); // Import your default avatar

function MatchedProfiles() {
  const [helloStatus, setHelloStatus] = useState({});
  const [matchedProfiles, setMatchedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProfiles, setExpandedProfiles] = useState({});
  const navigate = useNavigate();
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportData, setReportData] = useState({ name: '', ruid: '', issue: '' });
  const [reportStatus, setReportStatus] = useState(null);
  const [userId, setUserId] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(avatar);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.uid) {
        setUserId(user.uid);
        setPhotoUrl(
          `http://myruhousing-1.onrender.com/api/profile-photo/${user.uid}?t=${Date.now()}`
        );
      } else {
        setUserId(null);
        setPhotoUrl(avatar);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMatchedProfiles = async () => {
      try {
        const storedPreferences = localStorage.getItem('userPreferences');
        const userId = localStorage.getItem('userId');

        if (!storedPreferences || !userId) {
          setError('No preferences or user ID found.');
          setLoading(false);
          return;
        }
        const userPreferences = JSON.parse(storedPreferences);

        const response = await fetch('http://myruhousing-1.onrender.com/api/matched-profiles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...userPreferences, userId }),
        });

        if (!response.ok) {
          throw new Error(`An error occurred: ${response.status}`);
        }

        const data = await response.json();
        setMatchedProfiles(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchMatchedProfiles();
  }, []);

  if (loading) {
    return <div>Loading matched profiles...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const handleReportIconClick = () => {
    setShowReportForm(true);
  };

  const handleReportFormClose = () => {
    setShowReportForm(false);
    setReportData({ name: '', ruid: '', issue: '' });
    setReportStatus(null);
  };

  const handleReportInputChange = (e) => {
    const { name, value } = e.target;
    setReportData({ ...reportData, [name]: value });
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://myruhousing-1.onrender.com/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        setReportStatus('Issue reported successfully!');
        setTimeout(handleReportFormClose, 2000);
      } else {
        const errorData = await response.json();
        setReportStatus(`Reporting failed: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setReportStatus(`Reporting failed: ${error.message}`);
    }
  };

  const handleSayHello = async (recipientId) => {
    const senderId = localStorage.getItem("userId");
    try {
      const response = await fetch("http://myruhousing-1.onrender.com/api/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ senderId, recipientId, content: "Hello!" }),
      });

      if (response.ok) {
        setHelloStatus((prev) => ({ ...prev, [recipientId]: "Message sent!" })); 
      } else {
        setHelloStatus((prev) => ({ ...prev, [recipientId]: "Error" })); 
      }
    } catch (error) {
      setHelloStatus((prev) => ({ ...prev, [recipientId]: "Error" }));
    }
  };

  const handleKnowMoreClick = (profileId) => {
    setExpandedProfiles((prevState) => ({
      ...prevState,
      [profileId]: !prevState[profileId],
    }));
  };

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
        <div></div>
        <h2 style={{ color: "#F5F5F5", fontWeight: "bold", fontSize: "24px", margin: 0, flexGrow: 1 }}>
          Top Picks for Your Living Style 🏠
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/chat">
            <button style={{ padding: "6px 14px", backgroundColor: "#A52A2A", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", border: "none" }}>
              Chats
            </button>
          </Link>
          <Link to="/login">
            <button style={{ padding: "6px 14px", backgroundColor: "#A52A2A", color: "white", borderRadius: "4px", cursor: "pointer", fontWeight: "bold", border: "none" }}>
              Logout
            </button>
          </Link>
        </div>
      </div>
      <div
        style={{
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
        }}
      >
        <div style={matchedProfilesContainerStyle}>
          <h1 style={headingStyle}>Matched Roommate Profiles</h1>
          {matchedProfiles.length > 0 ? (
            matchedProfiles.map((profile) => (
              <div key={profile._id} style={profileCardStyle}>
                <div style={profilePreviewInfoStyle}>
                  <p style={attributeStyle}>
                    <strong>First Name:</strong> {profile.first_name}
                  </p>
                  <p style={attributeStyle}>
                    <strong>Last Name:</strong> {profile.last_name}
                  </p>
                  <p style={matchLevelStyle}>{profile.matchLevel}</p>
                  {profile.matchScore !== undefined && (
                    <p style={matchScoreStyle}>Match Score: {profile.matchScore.toFixed(2)}</p>
                  )}
                  {expandedProfiles[profile._id] && (
                    <div style={expandedProfiles[profile._id] ? expandedProfileInfoStyle : profileInfoStyle}>
                      <p style={attributeStyle}>
                        <strong>Graduation Year:</strong> {profile.graduation_year}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Major:</strong> {profile.major}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Preferred Location:</strong> {profile.preferred_location}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Duration of Stay:</strong> {profile.duration_of_stay}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Allergies:</strong> {profile.allergies}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Has Pets:</strong> {profile.has_pets}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Cooking Frequency:</strong> {profile.cooking_frequency}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Sleep Schedule:</strong> {profile.sleep_schedule}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Study Habits:</strong> {profile.study_habits}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Cleanliness:</strong> {profile.cleanliness}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Gender:</strong> {profile.gender}
                      </p>
                      <p style={attributeStyle}>
                        <strong>Self Description:</strong> {profile.self_description}
                      </p>
                    </div>
                  )}
                </div>
                <div style={profileImageContainerStyle}>
                  <img
                    src={`http://myruhousing-1.onrender.com/api/profile-photo/${profile.userId}`}
                    alt="profile"
                    style={profileImageStyle}
                    onError={(e) => (e.target.src = avatar)}
                  />
                </div>
                <div style={buttonsContainerStyle}>
  <button style={knowMoreButtonStyle} onClick={() => handleKnowMoreClick(profile._id)}>
    {expandedProfiles[profile._id] ? 'Know Less' : 'Know More'}
  </button>
  <button
    onClick={() => handleSayHello(profile.userId)}
    style={sayHelloButtonStyle}
    disabled={helloStatus[profile.userId] !== undefined} // Added disabled state
  >
    {helloStatus[profile.userId] === "Message sent!" ?
      "Message Sent!" :
      (helloStatus[profile.userId] === "Error" ? "Error" : "Say Hello")
    }
  </button>
  {helloStatus[profile.userId] === "Message sent!" && (
    <div style={{ marginLeft: '10px', color: 'green' }}>
      Message sent to Roommate! Please visit the Chats to look at your messages.
    </div>
  )}
  {helloStatus[profile.userId] === "Error" && (
    <div style={{ marginLeft: '10px', color: 'red' }}>
      Failed to send message. Please try again.
    </div>
  )}
</div>
              </div>
            ))
          ) : (
            <p>No matching profiles found.</p>
          )}
          <div className="home-button" style={reportButtonStyle} onClick={handleReportIconClick}>
            Report an Issue with a Roommate
          </div>
          {showReportForm && (
            <div style={reportFormContainerStyle}>
              <h2>Report an Issue with a Roommate</h2>
              <form style={reportFormStyle} onSubmit={handleReportSubmit}>
                <label htmlFor="name">Name:</label>
                <input type="text" id="name" name="name" value={reportData.name} onChange={handleReportInputChange} style={reportInputStyle} required />
                <label htmlFor="ruid">RUID:</label>
                <input type="text" id="ruid" name="ruid" value={reportData.ruid} onChange={handleReportInputChange} style={reportInputStyle} required />
                <label htmlFor="issue">Issue:</label>
                <textarea id="issue" name="issue" value={reportData.issue} onChange={handleReportInputChange} style={{ ...reportInputStyle, height: '200px', width: '750px' }} required />
                <button type="submit" style={reportSubmitButtonStyle}>Submit</button>
                {reportStatus && <p>{reportStatus}</p>}
                <button type="button" onClick={handleReportFormClose} style={{ marginTop: '10px', ...reportSubmitButtonStyle, backgroundColor: '#ccc', color: 'black' }}>Close</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MatchedProfiles;
