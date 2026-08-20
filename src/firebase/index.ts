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
 * Prevents crashes if API keys are missing or invalid.
 */
let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;
let storage: FirebaseStorage | undefined;
let rtdb: Database | undefined;

// Only initialize if we have a potentially valid API key
if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
    rtdb = getDatabase(app);
  } catch (err) {
    console.error("Firebase services failed to initialize:", err);
  }
} else {
  console.warn("Firebase API Key is missing or invalid. Authentication and Cloud features will be restricted.");
}

export { app, db, auth, storage, rtdb };

export function initializeFirebase() {
  return { 
    firebaseApp: app || null, 
    firestore: db || null, 
    auth: auth || null, 
    storage: storage || null, 
    rtdb: rtdb || null 
  };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
