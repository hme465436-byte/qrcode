"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * DECOMMISSIONED TOOL: Smart Rewrite / AI Humanizer
 * This tool has been removed from the MY KIT TOOL registry.
 * Users are redirected to the main dashboard.
 */
export default function DecommissionedPage() {
  const router = useRouter();

  useEffect(() => {
    // Professional redirect matrix
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <h1 className="text-xl font-headline font-black uppercase tracking-tight text-foreground/60">Registry Update</h1>
        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20">Redirecting to primary studio matrix...</p>
      </div>
    </div>
  );
}
