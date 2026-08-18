'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { KitPublicPage } from './kit-public-page';

/**
 * KitRouter Component
 * Checks for the 'kit' query parameter OR '#h=' hash and swaps the 
 * entire app content with the hosted page viewer if present.
 */
export function KitRouter({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [kitId, setKitId] = useState<string | null>(null);
  const [hasHash, setHasHash] = useState(false);

  useEffect(() => {
    const id = searchParams.get('kit');
    const hash = window.location.hash;
    
    if (id) setKitId(id);
    if (hash.startsWith('#h=')) setHasHash(true);
  }, [searchParams]);

  if (kitId || hasHash) {
    return <KitPublicPage id={kitId || 'hash-encoded'} />;
  }

  return <>{children}</>;
}
