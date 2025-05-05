import React from 'react';
import background from './images/background1.png';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleGoogleLogin = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log("✅ User signed in:", result.user);
        navigate("/home");
      })
      .catch((error) => {
        console.error("❌ Google login failed:", error);
      });
  };

  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Arial, sans-serif',
        position: 'relative'
      }}
    >
      <button
        onClick={() => navigate("/")}
        style={{
          position: 'absolute',
          top: '30px',
          left: '30px',
          background: 'transparent',
          border: '2px solid white',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '10px',
          fontWeight: 'bold',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        ⬅ Back
      </button>

      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: '40px',
        borderRadius: '20px',
        boxShadow: '0 0 15px rgba(255, 0, 0, 0.5)',
        width: '320px',
        textAlign: 'center',
        color: 'white'
      }}>
        <h2 style={{ marginBottom: '25px' }}>Welcome Back!</h2>
        <form onSubmit={(e) => e.preventDefault()}>
          <input type="text" placeholder="Email" className="form-control mb-3" style={{ borderRadius: '10px', border: 'none', padding: '10px', fontSize: '14px' }} />
          <input type="password" placeholder="Password" className="form-control mb-3" style={{ borderRadius: '10px', border: 'none', padding: '10px', fontSize: '14px' }} />
          <button type="submit" className="btn btn-danger w-100 mb-3" style={{ borderRadius: '10px' }}>Login</button>
        </form>
        <button onClick={handleGoogleLogin} className="btn btn-light w-100" style={{ borderRadius: '10px', color: '#000' }}>
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
