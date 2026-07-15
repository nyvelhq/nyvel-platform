import React, { useEffect, useRef, useState } from 'react';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// easeOutExpo — fast start, gentle settle. Feels premium for number roll-ups.
const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

/**
 * AnimatedCounter — smoothly rolls a number from 0 → `value` on mount and
 * whenever `value` changes. Respects prefers-reduced-motion (jumps to final).
 *
 * @param {number}   value      Target numeric value.
 * @param {number}   duration   Roll duration in ms (default 900).
 * @param {number}   decimals   Fixed decimals when no `format` supplied.
 * @param {string}   prefix     Rendered before the number (e.g. "$").
 * @param {string}   suffix     Rendered after the number (e.g. "%").
 * @param {Function} format     (n) => string, overrides prefix/suffix/decimals.
 */
export default function AnimatedCounter({
  value,
  duration = 900,
  decimals = 0,
  prefix = '',
  suffix = '',
  format,
  className = '',
}) {
  const [display, setDisplay] = useState(value);
  const rafRef = useRef(null);
  const fromRef = useRef(value);

  useEffect(() => {
    const target = Number(value) || 0;

    if (prefersReducedMotion()) {
      setDisplay(target);
      fromRef.current = target;
      return;
    }

    const from = Number(fromRef.current) || 0;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = easeOutExpo(progress);
      setDisplay(from + (target - from) * eased);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = target;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  const rendered = format
    ? format(display)
    : `${prefix}${display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`;

  // tabular-nums keeps digit width stable so the value doesn't jitter mid-roll.
  return <span className={`tabular-nums ${className}`}>{rendered}</span>;
}
