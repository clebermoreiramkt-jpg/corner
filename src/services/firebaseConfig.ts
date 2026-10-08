import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseCustomConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  caktoWebhookSecret?: string;
  caktoCheckoutUrl?: string;
}

const STORAGE_KEY = 'corner_firebase_config';

export const getStoredFirebaseConfig = (): FirebaseCustomConfig => {
  if (typeof window === 'undefined') {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      caktoWebhookSecret: import.meta.env.VITE_CAKTO_WEBHOOK_SECRET || '',
      caktoCheckoutUrl: import.meta.env.VITE_CAKTO_CHECKOUT_URL || '',
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiKey: parsed.apiKey || import.meta.env.VITE_FIREBASE_API_KEY || '',
        authDomain: parsed.authDomain || import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
        projectId: parsed.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
        storageBucket: parsed.storageBucket || import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
        messagingSenderId: parsed.messagingSenderId || import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
        appId: parsed.appId || import.meta.env.VITE_FIREBASE_APP_ID || '',
        caktoWebhookSecret: parsed.caktoWebhookSecret || import.meta.env.VITE_CAKTO_WEBHOOK_SECRET || '',
        caktoCheckoutUrl: parsed.caktoCheckoutUrl || import.meta.env.VITE_CAKTO_CHECKOUT_URL || '',
      };
    }
  } catch {
    // fallback
  }

  return {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
    caktoWebhookSecret: import.meta.env.VITE_CAKTO_WEBHOOK_SECRET || '',
    caktoCheckoutUrl: import.meta.env.VITE_CAKTO_CHECKOUT_URL || '',
  };
};

export const saveFirebaseConfig = (config: FirebaseCustomConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    window.location.reload();
  }
};

const currentConfig = getStoredFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  currentConfig.apiKey &&
  currentConfig.authDomain &&
  currentConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp({
      apiKey: currentConfig.apiKey,
      authDomain: currentConfig.authDomain,
      projectId: currentConfig.projectId,
      storageBucket: currentConfig.storageBucket,
      messagingSenderId: currentConfig.messagingSenderId,
      appId: currentConfig.appId,
    });

    auth = getAuth(app);
    db = getFirestore(app);
  } catch (error) {
    console.warn('Erro ao inicializar Firebase:', error);
  }
}

export { app, auth, db };
