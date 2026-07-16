import React, { useRef, useState, useEffect, useCallback } from 'react';

/**
 * TableScrollArea — horizontal-scroll wrapper with edge-fade affordances.
 *
 * Wide tables (the common case on mobile) are technically scrollable via
 * overflow-x-auto, but nothing signals that unless the user happens to
 * swipe. This adds a fading gradient on whichever edge still has
 * off-screen content, so "there's more this way" is visible at rest.
 */
export default function TableScrollArea({ children, className = '' }) {
  const ref = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateShadows = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    updateShadows();
    el.addEventListener('scroll', updateShadows, { passive: true });
    const observer = new ResizeObserver(updateShadows);
    observer.observe(el);
    window.addEventListener('resize', updateShadows);
    return () => {
      el.removeEventListener('scroll', updateShadows);
      observer.disconnect();
      window.removeEventListener('resize', updateShadows);
    };
  });

  return (
    <div className="relative">
      <div ref={ref} className={`overflow-x-auto ${className}`}>
        {children}
      </div>
      {canScrollLeft && (
        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent"
          aria-hidden="true"
        />
      )}
      {canScrollRight && (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
