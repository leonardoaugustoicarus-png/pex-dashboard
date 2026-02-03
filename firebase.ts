/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Helper to check if config is valid
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here';

if (import.meta.env.DEV) {
  console.log("Firebase Config Check:", {
    hasApiKey: !!firebaseConfig.apiKey,
    hasProjectId: !!firebaseConfig.projectId,
    projectId: firebaseConfig.projectId,
    envKeys: Object.keys(import.meta.env).filter(k => k.startsWith('VITE_FIREBASE'))
  });
}

// Initialize Firebase
let app: any = null;
let db: any = null;
let auth: any = null;
let initializationError: string | null = null;

try {
  if (!isConfigValid) {
    const missingVars = [];
    if (!firebaseConfig.apiKey) missingVars.push("VITE_FIREBASE_API_KEY");
    throw new Error(`Configuração do Firebase incompleta no .env.local. Faltando: ${missingVars.join(", ")}`);
  }
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error: any) {
  console.error("Firebase initialization failed:", error);
  initializationError = error?.message || "Erro desconhecido na inicialização do Firebase";
  app = null;
  db = null;
  auth = null;
}

// Initialize Analytics conditionally
let analytics: Analytics | null = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch((err) => {
  console.warn("Firebase Analytics not supported in this environment:", err);
});

export { app, analytics, db, auth, initializationError };