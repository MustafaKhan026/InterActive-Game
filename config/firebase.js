import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAIQikOSN3MRWvlyHLHdEYvQRFzeeJflLA",
  authDomain: "mustafa-projects.firebaseapp.com",
  projectId: "mustafa-projects",
  storageBucket: "mustafa-projects.firebasestorage.app",
  messagingSenderId: "630398170845",
  appId: "1:630398170845:web:8de46e5a2b9ad9c2a4cd34",
  measurementId: "G-MKZ08WMNTQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);