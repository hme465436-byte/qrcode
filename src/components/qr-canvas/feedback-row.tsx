"use client"

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { ThumbsUp, ThumbsDown, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Premium Feedback Row component.
 * Appears at the bottom of tool pages to collect user sentiment.
 * Persists choice in localStorage per tool path.
 */
export function FeedbackRow() {
  const pathname = usePathname();
  const [voted, setVoted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Definitive Home Page Check
    if (pathname === '/') {
      setIsVisible(false);
      return;
    }

    // Informational Route Check - Skip feedback on legal/about pages
    const excluded = ['/about', '/faq', '/privacy', '/terms', '/cookies'];
    if (excluded.includes(pathname)) {
      setIsVisible(false);
      return;
    }

    // Identity Verification via LocalStorage
    const hasVoted = localStorage.getItem(`feedback_voted_${pathname}`);
    if (hasVoted) {
      setVoted(true);
    }
    
    // Show on all other production units
    setIsVisible(true);
  }, [pathname]);

  const handleVote = (type: 'up' | 'down') => {
    localStorage.setItem(`feedback_voted_${pathname}`, type);
    setVoted(true);
  };

  if (!isVisible) return null;

  return (
    <div className="w-full py-12 px-6 flex justify-center animate-reveal feedback-row">
      <div className="glass-card px-8 py-4 rounded-full border-primary/20 bg-primary/5 flex items-center gap-6 shadow-2xl relative overflow-hidden group">
        {/* Subtle Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
        
        {!voted ? (
          <div className="flex items-center gap-6 relative z-10">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/50">
              Is this useful?
            </span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleVote('up')}
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all shadow-sm active:scale-90 group/btn"
                title="Useful"
              >
                <ThumbsUp className="w-4 h-4 transition-transform group-hover/btn:-translate-y-0.5" />
              </button>
              <button 
                onClick={() => handleVote('down')}
                className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground/30 hover:bg-destructive hover:text-white transition-all shadow-sm active:scale-90 group/btn"
                title="Not Useful"
              >
                <ThumbsDown className="w-4 h-4 transition-transform group-hover/btn:translate-y-0.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 animate-in zoom-in duration-500 relative z-10">
            <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30 shadow-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
              Thank you for your feedback
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
