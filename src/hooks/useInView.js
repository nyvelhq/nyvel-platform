import { useEffect, useRef, useState } from 'react';

/**
 * useInView - Trigger animations when element enters viewport
 * Uses IntersectionObserver API for optimal performance
 */
export const useInView = (options = {}) => {
  const {
    threshold = 0.2, // how much of element must be visible (0-1)
    rootMargin = '0px', // trigger before/after entering viewport
    triggerOnce = true, // only trigger animation once
  } = options;

  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observerOptions = {
      threshold: Array.isArray(threshold) ? threshold : [threshold],
      rootMargin,
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        if (triggerOnce && !hasTriggeredRef.current) {
          hasTriggeredRef.current = true;
          observer.unobserve(element);
        }
      } else if (!triggerOnce) {
        setInView(false);
      }
    }, observerOptions);

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
      observer.disconnect();
    };
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, inView];
};

/**
 * useInViewWithDelay - Add stagger delay to list items entering viewport
 */
export const useInViewWithDelay = (index = 0, baseDelay = 50, options = {}) => {
  const [ref, inView] = useInView(options);
  const delayMs = index * baseDelay;

  return [ref, inView, delayMs];
};

/**
 * useScrollPosition - Track scroll position for parallax and effects
 */
export const useScrollPosition = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollY;
};

/**
 * useParallax - Apply parallax effect based on scroll position
 * Returns transform value for parallax movement
 */
export const useParallax = (speed = 0.5) => {
  const scrollY = useScrollPosition();
  const parallaxOffset = scrollY * speed;

  return {
    transform: `translateY(${parallaxOffset}px)`,
    style: { transform: `translateY(${parallaxOffset}px)` },
  };
};
