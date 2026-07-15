import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * PageTransitionWrapper - Wraps page content to add entrance/exit animations
 * Automatically detects route changes and applies appropriate transitions
 */
export default function PageTransitionWrapper({ children }) {
  const location = useLocation();
  const [isExiting, setIsExiting] = useState(false);
  const [displayLocation, setDisplayLocation] = useState(location);
  const [prevPathDepth, setPrevPathDepth] = useState(0);

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setIsExiting(true);

      const exitTimer = setTimeout(() => {
        setDisplayLocation(location);
        setIsExiting(false);

        // Update path depth for next navigation
        const currentDepth = location.pathname.split('/').filter(Boolean).length;
        setPrevPathDepth(currentDepth);
      }, 250); // Exit animation duration

      return () => clearTimeout(exitTimer);
    }
  }, [location, displayLocation]);

  // Determine animation direction based on path depth
  const getAnimationClass = () => {
    const currentPathDepth = displayLocation.pathname.split('/').filter(Boolean).length;

    if (isExiting) {
      if (currentPathDepth > prevPathDepth) {
        return 'animate-page-exit-left';
      }
      return 'animate-page-exit-right';
    }

    if (currentPathDepth > prevPathDepth) {
      return 'animate-slide-in-right';
    }
    if (currentPathDepth < prevPathDepth) {
      return 'animate-slide-in-left-page';
    }
    return 'animate-fade-in-page';
  };

  return (
    <div className={`page-transition-wrapper ${getAnimationClass()}`}>
      <div className="page-transition-content">
        {children}
      </div>
    </div>
  );
}
