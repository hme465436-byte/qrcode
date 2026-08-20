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
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;
let storage: FirebaseStorage;
let rtdb: Database;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  storage = getStorage(app);
  rtdb = getDatabase(app);
} catch (err) {
  console.error("Firebase initialization failed. Ensure environment variables are set correctly.", err);
}

export { app, db, auth, storage, rtdb };

export function initializeFirebase() {
  return { firebaseApp: app!, firestore: db!, auth: auth!, storage: storage!, rtdb: rtdb! };
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
