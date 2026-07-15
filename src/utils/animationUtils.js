// Helper functions for micro-interaction animations

export const getStaggerDelay = (index, baseDelay = 75) => ({
  animationDelay: `${index * baseDelay}ms`,
});

export const getAnimationClass = (type, isActive = true) => {
  if (!isActive) return '';

  const animationMap = {
    'scale-in': 'animate-scale-in',
    'slide-down': 'animate-slide-down',
    'slide-up-out': 'animate-slide-up-out',
    'shimmer': 'animate-shimmer',
    'bounce-in': 'animate-bounce-in',
    'check-mark': 'animate-check-mark',
    'error-shake': 'animate-error-shake',
    'fade-out': 'animate-fade-out',
    'fade-in': 'animate-fade-in',
    'fade-up': 'animate-fade-up',
  };

  return animationMap[type] || '';
};

// Stagger animation class builder for lists
export const getListItemAnimationClass = (index, baseDelay = 75) => {
  const delayMs = index * baseDelay;

  if (delayMs <= 75) return 'animate-bounce-in animate-delay-75';
  if (delayMs <= 150) return 'animate-bounce-in animate-delay-150';
  if (delayMs <= 225) return 'animate-bounce-in animate-delay-225';
  return 'animate-bounce-in animate-delay-300';
};

// Create inline style object for animation delay
export const createAnimationDelayStyle = (delayMs) => ({
  animationDelay: `${delayMs}ms`,
});
