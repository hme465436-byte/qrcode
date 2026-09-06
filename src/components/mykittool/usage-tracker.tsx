'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

const USAGE_KEY = 'mykit_local_usage_log';

/**
 * UsageTracker Component
 * Silently logs unique tool visits to localStorage for the current day.
 * Used for the honest "You used X tools today" trust line on the home hero.
 */
export function UsageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;

    // Filter out non-tool pages
    const ignored = ['/', '/all-tools', '/about', '/account', '/login', '/terms', '/privacy', '/cookies', '/faq', '/donate', '/blog'];
    if (ignored.includes(pathname)) return;
    if (pathname.startsWith('/blog/')) return;
    if (pathname.startsWith('/share/')) return;

    const todayStr = new Date().toISOString().split('T')[0];
    
    try {
      const raw = localStorage.getItem(USAGE_KEY);
      let data = raw ? JSON.parse(raw) : { date: todayStr, paths: [] };

      // Reset if new day
      if (data.date !== todayStr) {
        data = { date: todayStr, paths: [] };
      }

      // Add unique path
      if (!data.paths.includes(pathname)) {
        data.paths.push(pathname);
        localStorage.setItem(USAGE_KEY, JSON.stringify(data));
      }
    } catch (e) {
      console.warn("Usage logging restricted.");
    }
  }, [pathname]);

  return null;
}
