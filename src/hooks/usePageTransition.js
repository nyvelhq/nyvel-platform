import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * usePageTransition - Manage page entrance/exit animations
 * Triggers animation based on route changes
 */
export const usePageTransition = (animationType = 'fade') => {
  const location = useLocation();
  const [isExiting, setIsExiting] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);

  const getAnimationClass = (type, isExit) => {
    if (isExit) {
      switch (type) {
        case 'slide-right':
          return 'animate-page-exit-right';
        case 'slide-left':
          return 'animate-page-exit-left';
        case 'fade':
        default:
          return 'animate-fade-out';
      }
    }

    switch (type) {
      case 'slide-right':
        return 'animate-slide-in-right';
      case 'slide-left':
        return 'animate-slide-in-left-page';
      case 'slide-up':
        return 'animate-slide-in-up';
      case 'fade':
      default:
        return 'animate-fade-in-page';
    }
  };

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsExiting(true);
      const timer = setTimeout(() => {
        setDisplayLocation(location);
        setIsExiting(false);
      }, 250); // Exit animation duration

      return () => clearTimeout(timer);
    }
  }, [location, displayLocation]);

  return {
    isExiting,
    displayLocation,
    animationClass: getAnimationClass(animationType, isExiting),
  };
};

/**
 * usePageTransitionWithDirection - Animate based on navigation direction
 * Determines slide direction based on route hierarchy
 */
export const usePageTransitionWithDirection = () => {
  const location = useLocation();
  const [previousPath, setPreviousPath] = useState(location.pathname);
  const [direction, setDirection] = useState('fade');

  useEffect(() => {
    const currentPathDepth = location.pathname.split('/').length;
    const previousPathDepth = previousPath.split('/').length;

    if (currentPathDepth > previousPathDepth) {
      setDirection('slide-right');
    } else if (currentPathDepth < previousPathDepth) {
      setDirection('slide-left');
    } else {
      setDirection('fade');
    }

    setPreviousPath(location.pathname);
  }, [location.pathname, previousPath]);

  return usePageTransition(direction);
};
