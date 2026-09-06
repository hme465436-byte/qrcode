'use client';

import { useState, useEffect } from 'react';

/**
 * A client-side component to render the current year.
 * Prevents hydration mismatches between server and client.
 */
export function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    // Only run on client after hydration
    setYear(new Date().getFullYear());
  }, []);

  // Return a placeholder or the year
  return <>{year || '2025'}</>;
}