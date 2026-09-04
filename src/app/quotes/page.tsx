"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

/**
 * DECOMMISSIONED TOOL: Quote Studio
 */
export default function DecommissionedPage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/');
    }, 1200);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 animate-in fade-in duration-700 bg-[#0a0a0c]">
      <div className="relative">
        <div className="w-24 h-24 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        <Loader2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-primary animate-pulse" />
      </div>
      <div className="text-center space-y-3">
        <h1 className="text-2xl font-headline font-black uppercase tracking-tight text-foreground/60">Registry Update</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/20">Synthesizing redirect to primary studio matrix...</p>
      </div>
    </div>
  );
}
