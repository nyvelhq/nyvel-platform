import { useEffect, useRef } from 'react';

/**
 * useSwipeGesture - Detects swipe gestures with velocity calculation
 * Returns swipe direction, distance, and velocity for momentum-based animations
 */
export const useSwipeGesture = (onSwipe, options = {}) => {
  const {
    threshold = 50, // minimum distance to register as swipe (px)
    velocityThreshold = 0.5, // minimum velocity (px/ms)
    enableVertical = false, // detect vertical swipes
  } = options;

  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });

  useEffect(() => {
    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e) => {
      if (e.changedTouches.length === 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.time;

      // Calculate velocity (px/ms)
      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      // Determine swipe direction (horizontal)
      if (Math.abs(deltaX) > threshold && velocityX > velocityThreshold) {
        const direction = deltaX > 0 ? 'right' : 'left';
        onSwipe({
          direction,
          distance: Math.abs(deltaX),
          velocity: velocityX,
          deltaX,
          deltaY,
          duration: deltaTime,
        });
      }

      // Determine swipe direction (vertical)
      if (
        enableVertical &&
        Math.abs(deltaY) > threshold &&
        velocityY > velocityThreshold
      ) {
        const direction = deltaY > 0 ? 'down' : 'up';
        onSwipe({
          direction,
          distance: Math.abs(deltaY),
          velocity: velocityY,
          deltaX,
          deltaY,
          duration: deltaTime,
        });
      }
    };

    const element = document.documentElement;
    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onSwipe, threshold, velocityThreshold, enableVertical]);
};

/**
 * useSwipeGestureElement - Attach swipe gesture to specific element
 */
export const useSwipeGestureElement = (ref, onSwipe, options = {}) => {
  const {
    threshold = 50,
    velocityThreshold = 0.5,
    enableVertical = false,
  } = options;

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const touchStartRef = { x: 0, y: 0, time: 0 };

    const handleTouchStart = (e) => {
      const touch = e.touches[0];
      touchStartRef.x = touch.clientX;
      touchStartRef.y = touch.clientY;
      touchStartRef.time = Date.now();
    };

    const handleTouchEnd = (e) => {
      if (e.changedTouches.length === 0) return;

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.x;
      const deltaY = touch.clientY - touchStartRef.y;
      const deltaTime = Date.now() - touchStartRef.time;

      const velocityX = Math.abs(deltaX) / deltaTime;
      const velocityY = Math.abs(deltaY) / deltaTime;

      if (Math.abs(deltaX) > threshold && velocityX > velocityThreshold) {
        const direction = deltaX > 0 ? 'right' : 'left';
        onSwipe({
          direction,
          distance: Math.abs(deltaX),
          velocity: velocityX,
          deltaX,
          deltaY,
          duration: deltaTime,
        });
      }

      if (
        enableVertical &&
        Math.abs(deltaY) > threshold &&
        velocityY > velocityThreshold
      ) {
        const direction = deltaY > 0 ? 'down' : 'up';
        onSwipe({
          direction,
          distance: Math.abs(deltaY),
          velocity: velocityY,
          deltaX,
          deltaY,
          duration: deltaTime,
        });
      }
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipe, threshold, velocityThreshold, enableVertical]);
};
