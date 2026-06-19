import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAR-Ypx_lom4ha0dstCEZF4ygPQtRds9fk",
  authDomain: "fitmax-6abaa.firebaseapp.com",
  projectId: "fitmax-6abaa",
  storageBucket: "fitmax-6abaa.firebasestorage.app",
  messagingSenderId: "12004796490",
  appId: "1:12004796490:web:1a80e1a75a331d01235eb3",
  measurementId: "G-TDMGPGV77C"
};

// Initialize Firebase only if it hasn't been initialized yet (Next.js hot reload safe)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
