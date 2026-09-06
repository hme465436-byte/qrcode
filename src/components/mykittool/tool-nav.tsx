"use client"

import React, { useState, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, Share2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * ToolNav Component
 * Provides unified navigation for all professional studio units.
 * Features a referrer-aware back protocol and link-isolation share node.
 */
export function ToolNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  // Non-tool pages where navigation bar is suppressed
  const isToolPage = useMemo(() => {
    const nonToolPages = [
      '/',
      '/all-tools',
      '/about',
      '/account',
      '/login',
      '/terms',
      '/privacy',
      '/cookies',
      '/faq',
      '/donate',
    ];
    if (nonToolPages.includes(pathname)) return false;
    if (pathname.startsWith('/share/')) return false;
    if (pathname.startsWith('/p/')) return false;
    return true;
  }, [pathname]);

  if (!isToolPage) return null;

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleBack = () => {
    if (typeof window !== 'undefined' && document.referrer.includes(window.location.host)) {
      router.back();
    } else {
      router.push('/all-tools');
    }
  };

  return (
    <div className="w-full bg-transparent border-b border-white/[0.03] animate-in fade-in slide-in-from-top-1 duration-500 shrink-0 z-40">
      <div className="container mx-auto px-4 md:px-6 h-12 flex items-center justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleBack}
          className="h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary hover:bg-primary/5 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-2 transition-transform group-hover:-translate-x-0.5" /> Back
        </Button>

        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleShare}
          className={cn(
            "h-8 px-3 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
            isCopied ? "text-emerald-500 bg-emerald-500/5" : "text-foreground/40 hover:text-primary hover:bg-primary/5"
          )}
        >
          {isCopied ? (
            <><Check className="w-3.5 h-3.5 mr-2" /> Copied!</>
          ) : (
            <><Share2 className="w-3.5 h-3.5 mr-2" /> Share</>
          )}
        </Button>
      </div>
    </div>
  );
}
