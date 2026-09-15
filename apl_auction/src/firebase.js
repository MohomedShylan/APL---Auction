// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAMdW991oNpWXEWUI34P1PB1c0St8fGPvw",
  authDomain: "apl-auth-8d285.firebaseapp.com",
  projectId: "apl-auth-8d285",
  storageBucket: "apl-auth-8d285.firebasestorage.app",
  messagingSenderId: "741898094311",
  appId: "1:741898094311:web:1dd7df40d900cbff9c4442"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);