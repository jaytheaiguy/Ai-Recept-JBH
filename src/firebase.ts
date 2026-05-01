import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';

// Firebase initialization is gated until terms are accepted in the UI

// Firebase initialization is gated until terms are accepted in the UI
let db: any;
let auth: any;

try {
  // @ts-ignore - this file is generated after Firebase setup
  const firebaseConfig = await import('../firebase-applet-config.json');
  const { initializeApp } = await import('firebase/app');
  const { getAuth } = await import('firebase/auth');
  const { getFirestore } = await import('firebase/firestore');
  
  const app = initializeApp(firebaseConfig.default);
  db = getFirestore(app);
  auth = getAuth();
  console.log("Firebase initialized");
} catch (e) {
  console.warn("Firebase configuration not found. Running in Demo Mode.");
}

export { db, auth };

