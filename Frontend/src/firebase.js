// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "yourkey",
  authDomain: "notes-app-135eb.firebaseapp.com",
  projectId: "notes-app-135eb",
  storageBucket: "notes-app-135eb.firebasestorage.app",
  messagingSenderId: "521665864640",
  appId: "1:521665864640:web:05d46da2eefa9164571e25",
  measurementId: "G-0VX9LXRHYS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, onAuthStateChanged, signOut };
