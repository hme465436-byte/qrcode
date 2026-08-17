'use client';

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { firebaseConfig } from './config';

/**
 * Hardware Initialization Protocol
 * Synchronizes the local browser with the production signaling matrix.
 * Hardened to prevent crashes if environment variables are missing.
 */
export function initializeFirebase() {
  const isConfigValid = 
    firebaseConfig.apiKey && 
    firebaseConfig.apiKey !== "undefined" && 
    firebaseConfig.projectId && 
    firebaseConfig.projectId !== "undefined";

  if (!isConfigValid) {
    console.warn("Firebase: Inbound configuration is incomplete. Signaling services are inactive.");
    return { firebaseApp: null, firestore: null, auth: null };
  }

  try {
    const firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    const firestore = getFirestore(firebaseApp);
    const auth = getAuth(firebaseApp);

    return { firebaseApp, firestore, auth };
  } catch (err) {
    console.error("Firebase: Hardware handshake failed.", err);
    return { firebaseApp: null, firestore: null, auth: null };
  }
}

export * from './provider';
export * from './auth/use-user';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
