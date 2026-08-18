'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getDatabase, Database } from 'firebase/database';
import { firebaseConfig } from './config';

/**
 * Firebase Core Initialization
 * Centralized setup for production services with pre-flight validation.
 */
const isConfigValid = !!(
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "undefined" && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "undefined"
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;
let rtdb: Database | null = null;

if (typeof window !== 'undefined') {
  if (isConfigValid) {
    try {
      app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      storage = getStorage(app);
      rtdb = getDatabase(app);
    } catch (err) {
      console.error("Firebase initialization failed:", err);
    }
  } else {
    console.warn("Firebase configuration is missing or invalid. Check environment variables.");
  }
}

export { app, db, auth, storage, rtdb };

export function initializeFirebase() {
  return { firebaseApp: app, firestore: db, auth, storage, rtdb };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
