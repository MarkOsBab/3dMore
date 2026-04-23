"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Scrolls to the hash anchor after a cross-route navigation.
 * Next.js App Router doesn't natively handle hash scrolling on page transitions.
 */
export default function HashScroller() {
  const pathname = usePathname();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) return;

    const id = hash.slice(1);

    // Try immediately (element may already be in DOM)
    const tryScroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }
      return false;
    };

    if (!tryScroll()) {
      // Retry up to ~1s to wait for hydration / lazy renders
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryScroll() || attempts >= 10) clearInterval(interval);
      }, 100);
    }
  }, [pathname]);

  return null;
}
