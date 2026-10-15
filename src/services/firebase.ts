import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Standard Firebase Configuration (Can be replaced with user's specific credentials or environment variables)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyKeyForSriTirumalaOilTraders2026",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "sri-tirumala-oil-traders.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "sri-tirumala-oil-traders",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "sri-tirumala-oil-traders.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "8008413774",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:8008413774:web:sritirumala2026"
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization warning (using local fallback engine):", error);
}

export { app, auth, db };
