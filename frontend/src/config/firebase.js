import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing Firebase configuration:', missingKeys);
    console.error('Current config:', {
      apiKey: firebaseConfig.apiKey ? '✓ Set' : '✗ Missing',
      authDomain: firebaseConfig.authDomain ? '✓ Set' : '✗ Missing',
      projectId: firebaseConfig.projectId ? '✓ Set' : '✗ Missing',
      appId: firebaseConfig.appId ? '✓ Set' : '✗ Missing',
    });
    throw new Error(`Firebase configuration incomplete. Missing: ${missingKeys.join(', ')}`);
  }
  
  console.log('✅ Firebase configuration validated');
};

// Validate before initializing
validateFirebaseConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

export default app;
