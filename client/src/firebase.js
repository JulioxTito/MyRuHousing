import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBSBvFwDKecmk9w204fUHK4njlf_2fTrRc",
  authDomain: "login-test-39451.firebaseapp.com",
  projectId: "login-test-39451",
  storageBucket: "login-test-39451.appspot.com", 
  messagingSenderId: "419546306697",
  appId: "1:419546306697:web:5fac4acdf35e007468ce58",
  measurementId: "G-QXGERW0V76"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
