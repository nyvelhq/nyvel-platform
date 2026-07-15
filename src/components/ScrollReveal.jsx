import React from 'react';
import { useInView } from '../hooks/useInView';

/**
 * ScrollReveal - Wrapper component that animates children when they enter viewport
 * Supports staggered animations for lists
 */
export default function ScrollReveal({
  children,
  animation = 'fade-in-page',
  threshold = 0.2,
  rootMargin = '0px',
  triggerOnce = true,
  delay = 0,
  staggerIndex = null,
  staggerDelay = 100,
  className = '',
}) {
  const [ref, inView] = useInView({
    threshold,
    rootMargin,
    triggerOnce,
  });

  const calculatedDelay = staggerIndex !== null ? staggerIndex * staggerDelay : delay;
  const animationClass = inView ? `animate-${animation}` : '';
  const style = {
    animationDelay: `${calculatedDelay}ms`,
    animationFillMode: 'both',
  };

  return (
    <div
      ref={ref}
      className={`${animationClass} ${className}`}
      style={inView ? style : {}}
    >
      {children}
    </div>
  );
}

/**
 * ScrollRevealList - Wrapper for animating list items with stagger
 */
export function ScrollRevealList({
  children,
  animation = 'fade-in-page',
  staggerDelay = 100,
  threshold = 0.1,
  className = '',
}) {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) =>
        React.cloneElement(child, {
          key: child.key || index,
          as: ScrollReveal,
          animation,
          staggerIndex: index,
          staggerDelay,
          threshold,
        }),
      )}
    </div>
  );
}

/**
 * ParallaxSection - Apply parallax effect to a section
 */
export function ParallaxSection({
  children,
  speed = 0.5,
  className = '',
}) {
  const [ref, inView] = useInView({ threshold: 0 });

  return (
    <div
      ref={ref}
      className={className}
      style={inView ? { transform: `translateY(${window.scrollY * speed}px)` } : {}}
    >
      {children}
    </div>
  );
}
