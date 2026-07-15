/**
 * Motion design tokens — the single source of truth for Framer Motion work.
 *
 * Durations sit in the 150–300ms band (per the design brief); springs are
 * tuned to settle quickly without visible oscillation. Reduced motion is
 * honored globally via <MotionConfig reducedMotion="user"> in App.js —
 * Framer then swaps transform/layout animations for opacity crossfades.
 */

// Durations (seconds — Framer's native unit)
export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.2,
  slow: 0.3,
};

// Easing curves
export const ease = {
  out: [0.16, 1, 0.3, 1], // easeOutExpo-like — decisive start, soft settle
  inOut: [0.65, 0, 0.35, 1],
  in: [0.55, 0, 1, 0.45],
};

// Spring presets
export const spring = {
  // Panels, modals — snappy but composed
  panel: { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 },
  // Small UI (pills, toggles, shared-element indicators)
  snappy: { type: 'spring', stiffness: 560, damping: 38, mass: 0.7 },
  // Larger surfaces (drawers)
  drawer: { type: 'spring', stiffness: 340, damping: 36, mass: 1 },
};

// ── Shared variants ────────────────────────────────────────────────

export const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: duration.base, ease: ease.out } },
  exit: { opacity: 0, transition: { duration: duration.fast, ease: ease.in } },
};

export const modalVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.panel },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 6,
    transition: { duration: duration.fast, ease: ease.in },
  },
};

export const drawerVariants = {
  right: {
    hidden: { x: '100%' },
    visible: { x: 0, transition: spring.drawer },
    exit: { x: '100%', transition: { duration: duration.slow, ease: ease.in } },
  },
  left: {
    hidden: { x: '-100%' },
    visible: { x: 0, transition: spring.drawer },
    exit: { x: '-100%', transition: { duration: duration.slow, ease: ease.in } },
  },
};

// Staggered list entrance (parent + child)
export const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

export const listItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: duration.slow, ease: ease.out } },
};
