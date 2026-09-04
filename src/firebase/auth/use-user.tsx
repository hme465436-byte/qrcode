'use client';

import { useState, useEffect, useMemo } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { useAuth } from '../provider';

/**
 * User Identity Hook
 * Tracks the current authentication matrix of the hardware session.
 * 
 * Memoized return prevents downstream effect loops in complex app views.
 */
export function useUser() {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, [auth]);

  return useMemo(() => ({ user, loading }), [user, loading]);
}
