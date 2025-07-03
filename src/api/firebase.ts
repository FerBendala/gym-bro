import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4gZ-Q04-kQvu0Pd2kUp3sQA7oVMojY7E",
  authDomain: "followgym.firebaseapp.com",
  projectId: "followgym",
  storageBucket: "followgym.firebasestorage.app",
  messagingSenderId: "1043504650321",
  appId: "1:1043504650321:web:e46a3f6177a0ca29688070",
  measurementId: "G-V4TR1WN7M4"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;