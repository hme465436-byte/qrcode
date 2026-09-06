'use client';

import React, { useMemo } from 'react';
import { initializeFirebase } from './index';
import { FirebaseProvider } from './provider';
import dynamic from 'next/dynamic';

const FloatingActionHub = dynamic(() => import('@/components/mykittool/floating-action-hub').then(mod => mod.FloatingActionHub), {
  ssr: false
});

/**
 * Firebase Client Provider
 * Ensures hardware-native initialization occurs only once on the client.
 * Also serves as the host for global client-side widgets requiring ssr:false.
 */
export function FirebaseClientProvider({ children }: { children: React.ReactNode }) {
  const { firebaseApp, firestore, auth, storage } = useMemo(() => initializeFirebase(), []);

  return (
    <FirebaseProvider 
      firebaseApp={firebaseApp} 
      firestore={firestore} 
      auth={auth} 
      storage={storage}
    >
      {children}
      <FloatingActionHub />
    </FirebaseProvider>
  );
}
