
"use client"

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * DEPRECATED VIEWER
 * Automatically redirects to the root editor.
 * The new system uses URL hashes for zero-latency hosting.
 */
export default function LegacyViewerRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/html-to-url');
  }, [router]);

  return null;
}
