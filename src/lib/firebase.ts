import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDksxwqwzuc1Uetqsl2pFCRedADLTeeFII",
  authDomain: "nearbyworkers-e2d4d.firebaseapp.com",
  projectId: "nearbyworkers-e2d4d",
  storageBucket: "nearbyworkers-e2d4d.appspot.com",
  messagingSenderId: "811279390619",
  appId: "1:811279390619:web:ee5be9049bed390a46f33e",
  measurementId: "G-6MNP1PH22T"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
