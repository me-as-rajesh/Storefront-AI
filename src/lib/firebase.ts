import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Updated Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5dtE7tXllBXcZHW-Q96xAj-qUqPXER9k",
  authDomain: "firest-one-6ec3f.firebaseapp.com",
  projectId: "firest-one-6ec3f",
  storageBucket: "firest-one-6ec3f.appspot.com",
  messagingSenderId: "138367433072",
  appId: "1:138367433072:web:8cd6e5b18e6bad0b5537b5",
  measurementId: "G-3D5B2M4QEJ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
