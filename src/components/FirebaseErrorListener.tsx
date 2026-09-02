'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

/**
 * @fileOverview Centralized listener for surfacing Firestore permission errors.
 * In development, this triggers the Next.js error overlay with contextual data.
 */
export function FirebaseErrorListener() {
  useEffect(() => {
    const unsubscribe = errorEmitter.on('permission-error', (error) => {
      // Throwing the error here allows it to be caught by the development overlay
      console.warn('Contextual Firestore Error Caught:', error.context);
      throw error;
    });

    return () => unsubscribe();
  }, []);

  return null;
}
