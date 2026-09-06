'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { KitPublicPage } from './kit-public-page';

/**
 * KitRouter Component
 * High-speed interceptor for hosted content payloads.
 * Checks for the 'kit' query parameter to swap the application
 * with the sanitized public viewer.
 */
export function KitRouter({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const [kitId, setKitId] = useState<string | null>(null);

  useEffect(() => {
    const id = searchParams.get('kit');
    if (id) setKitId(id);
  }, [searchParams]);

  if (kitId) {
    return <KitPublicPage id={kitId} />;
  }

  return <>{children}</>;
}
