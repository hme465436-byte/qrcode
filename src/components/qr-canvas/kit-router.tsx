'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { KitPublicPage } from './kit-public-page';

/**
 * KitRouter Component
 * Checks for the 'kit' query parameter and swaps the entire app content 
 * with the hosted page viewer if an ID is present.
 */
export function KitRouter({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const kitId = searchParams.get('kit');

  if (kitId) {
    return <KitPublicPage id={kitId} />;
  }

  return <>{children}</>;
}
