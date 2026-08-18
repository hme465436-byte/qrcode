'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { firebaseConfig } from './config';

/**
 * Hardware Initialization Protocol
 * Synchronizes the local browser with the production signaling matrix.
 * Hardened to prevent crashes if environment variables are missing.
 */
const isConfigValid = 
  firebaseConfig.apiKey && 
  firebaseConfig.apiKey !== "undefined" && 
  firebaseConfig.projectId && 
  firebaseConfig.projectId !== "undefined";

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;
let storage: FirebaseStorage | null = null;

if (isConfigValid && typeof window !== 'undefined') {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);
  } catch (err) {
    console.error("Firebase: Hardware handshake failed.", err);
  }
}

export { app, db, auth, storage };

export function initializeFirebase() {
  return { firebaseApp: app, firestore: db, auth, storage };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
