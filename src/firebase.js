import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPafLZSIHdiIsaNzwmcb-MQTcdZ7ZxeVE",
  authDomain: "shanu-5b259.firebaseapp.com",
  projectId: "shanu-5b259",
  storageBucket: "shanu-5b259.firebasestorage.app",
  messagingSenderId: "583669230864",
  appId: "1:583669230864:web:b7843a3502c92459020995",
  measurementId: "G-13GSXV30ZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
