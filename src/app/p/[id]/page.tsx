"use client"

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

/**
 * Deprecated Viewer Route
 * Automatically redirects to the new Unified Query Protocol (?kit=id)
 */
export default function LegacyViewerRedirect() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    if (id) {
      router.replace(`/?kit=${id}`);
    } else {
      router.replace('/');
    }
  }, [params, router]);

  return null;
}
