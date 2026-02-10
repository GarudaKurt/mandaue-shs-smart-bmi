// Import the functions you need from the SDKs
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database"; // Import Realtime Database

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBlY6ycU_PpnJjlQva2y7CdNDv-9odMUlk",
  authDomain: "smart-bmi-e8d84.firebaseapp.com",
  databaseURL: "https://smart-bmi-e8d84-default-rtdb.firebaseio.com",
  projectId: "smart-bmi-e8d84",
  storageBucket: "smart-bmi-e8d84.firebasestorage.app",
  messagingSenderId: "969293917249",
  appId: "1:969293917249:web:4d80b6498d01ef89f22ac0"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const database = getDatabase(app); // Initialize Realtime Database