/**
 * Gesture utility functions for swipe, drag, and touch interactions
 */

/**
 * Calculate distance between two touch points
 */
export const getTouchDistance = (touch1, touch2) => {
  const deltaX = touch2.clientX - touch1.clientX;
  const deltaY = touch2.clientY - touch1.clientY;
  return Math.sqrt(deltaX ** 2 + deltaY ** 2);
};

/**
 * Calculate velocity from touch movement
 */
export const calculateVelocity = (distance, duration) => {
  return duration > 0 ? distance / duration : 0;
};

/**
 * Determine if swipe is from edge (for sidebar open gesture)
 */
export const isSwipeFromEdge = (startX, threshold = 50) => {
  return startX < threshold;
};

/**
 * Clamp value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate animation duration based on velocity
 * Faster swipes result in faster animations
 */
export const getAnimationDurationFromVelocity = (
  velocity,
  minDuration = 150,
  maxDuration = 500,
) => {
  // Velocity is in px/ms, convert to more intuitive scale
  // Higher velocity = shorter duration
  const durationMs = Math.max(minDuration, Math.min(maxDuration, 1000 / (velocity + 1)));
  return durationMs;
};

/**
 * Determine if touch should be treated as tap (minimal movement)
 */
export const isTap = (distance, threshold = 10) => {
  return distance < threshold;
};

/**
 * Get easing function based on swipe velocity
 * Fast swipes use ease-out, slow swipes use ease-in-out
 */
export const getEasingFromVelocity = (velocity) => {
  if (velocity > 1) return 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'; // ease-out
  if (velocity > 0.5) return 'cubic-bezier(0.42, 0, 0.58, 1)'; // ease-in-out
  return 'cubic-bezier(0.42, 0, 0.58, 1)'; // ease-in-out
};

/**
 * Calculate transform translate based on swipe distance and direction
 */
export const getSwipeTransform = (distance, direction, maxDistance = 100) => {
  const clampedDistance = clamp(distance, 0, maxDistance);
  const percentage = (clampedDistance / maxDistance) * 100;

  switch (direction) {
    case 'left':
      return `translateX(-${percentage}%)`;
    case 'right':
      return `translateX(${percentage}%)`;
    case 'up':
      return `translateY(-${percentage}%)`;
    case 'down':
      return `translateY(${percentage}%)`;
    default:
      return 'translateX(0)';
  }
};

/**
 * Detect if swipe is horizontal or vertical
 */
export const getSwipeAxis = (deltaX, deltaY, threshold = 10) => {
  const absDeltaX = Math.abs(deltaX);
  const absDeltaY = Math.abs(deltaY);

  if (absDeltaX > absDeltaY + threshold) {
    return 'horizontal';
  }
  if (absDeltaY > absDeltaX + threshold) {
    return 'vertical';
  }
  return 'diagonal';
};

/**
 * Create animation CSS variable style object from swipe data
 */
export const createSwipeAnimationStyle = (swipeData) => {
  const duration = getAnimationDurationFromVelocity(swipeData.velocity);
  const easing = getEasingFromVelocity(swipeData.velocity);

  return {
    '--animation-duration': `${duration}ms`,
    '--animation-easing': easing,
    '--swipe-distance': `${swipeData.distance}px`,
  };
};
