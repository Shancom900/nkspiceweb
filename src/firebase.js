import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAKmff_RzxA-d-44KhG3SMpaCFdtgxAJhs",
  authDomain: "nktradingweb.firebaseapp.com",
  projectId: "nktradingweb",
  storageBucket: "nktradingweb.firebasestorage.app",
  messagingSenderId: "244170448862",
  appId: "1:244170448862:web:34c25674e2d63f262a474f",
  measurementId: "G-K5XWXH5TPV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
