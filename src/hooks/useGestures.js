import { useRef, useEffect, useCallback } from 'react';

export function useSwipe(onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold = 50) {
  const touchStart = useRef(null);
  const touchEnd = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStart.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    touchEnd.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    handleSwipe();
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  const handleSwipe = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const distanceX = touchStart.current.x - touchEnd.current.x;
    const distanceY = touchStart.current.y - touchEnd.current.y;
    const isLeftSwipe = distanceX > threshold;
    const isRightSwipe = distanceX < -threshold;
    const isUpSwipe = distanceY > threshold;
    const isDownSwipe = distanceY < -threshold;

    if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
    if (isRightSwipe && onSwipeRight) onSwipeRight();
    if (isUpSwipe && onSwipeUp) onSwipeUp();
    if (isDownSwipe && onSwipeDown) onSwipeDown();
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return { handleTouchStart, handleTouchEnd };
}

export function useEdgeSwipe(onSwipeFromLeft, threshold = 50) {
  const touchStart = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (e.changedTouches[0].clientX < threshold) {
      touchStart.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    }
  }, [threshold]);

  const handleTouchEnd = useCallback((e) => {
    if (!touchStart.current) return;

    const distanceX = touchStart.current.x - e.changedTouches[0].clientX;
    const distanceY = Math.abs(touchStart.current.y - e.changedTouches[0].clientY);

    // Only register if primarily horizontal movement with minimal vertical drift
    if (distanceX < -50 && distanceY < 50 && onSwipeFromLeft) {
      onSwipeFromLeft();
    }
    touchStart.current = null;
  }, [onSwipeFromLeft]);

  return { handleTouchStart, handleTouchEnd };
}

export function useDragGesture(onDrag, onDragEnd, threshold = 5) {
  const touchStart = useRef(null);
  const isDragging = useRef(false);

  const handleTouchStart = useCallback((e) => {
    touchStart.current = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    isDragging.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!touchStart.current) return;

    const currentX = e.changedTouches[0].clientX;
    const distanceX = touchStart.current.x - currentX;

    if (Math.abs(distanceX) > threshold) {
      isDragging.current = true;
      onDrag({ x: distanceX, progress: Math.min(1, Math.abs(distanceX) / 200) });
    }
  }, [onDrag, threshold]);

  const handleTouchEnd = useCallback((e) => {
    if (!isDragging.current) {
      touchStart.current = null;
      return;
    }

    const finalX = e.changedTouches[0].clientX;
    const distanceX = touchStart.current.x - finalX;

    if (onDragEnd) {
      onDragEnd({ x: distanceX, completed: Math.abs(distanceX) > 100 });
    }

    touchStart.current = null;
    isDragging.current = false;
  }, [onDragEnd]);

  return { handleTouchStart, handleTouchMove, handleTouchEnd };
}
