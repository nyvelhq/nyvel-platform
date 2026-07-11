import React from 'react';

/**
 * NyvelMark — the Nyvel logomark.
 *
 * Grounded in the product's world: a QA "pass" signal. A precise check
 * sits inside a bracketed chip — the way a passing assertion reads in a
 * test runner ( [✓] ). Solid teal chip (not a gradient — gradients on a
 * logo square are a generic startup tell), with a single amber accent
 * node that ties to the brand's secondary color.
 *
 * Decorative by default (aria-hidden); the adjacent wordmark carries the
 * accessible name. Pass `title` to give the mark its own label when used
 * standalone.
 */
export default function NyvelMark({ size = 32, className = '', title }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title || undefined}
    >
      {title ? <title>{title}</title> : null}
      {/* Chip */}
      <rect width="32" height="32" rx="8" fill="#0D8578" />
      <rect width="32" height="32" rx="8" fill="url(#nyvelSheen)" fillOpacity="0.35" />
      {/* Assertion brackets */}
      <path
        d="M11 8.5H8.5V23.5H11"
        stroke="#6DDCCB"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      <path
        d="M21 8.5H23.5V23.5H21"
        stroke="#6DDCCB"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
      {/* Pass check */}
      <path
        d="M12 16.2L14.8 19L20 12.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Amber status node */}
      <circle cx="23.5" cy="8.5" r="2.4" fill="#F59E0B" stroke="#0D8578" strokeWidth="1.2" />
      <defs>
        <linearGradient id="nyvelSheen" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#17A897" />
          <stop offset="1" stopColor="#0D8578" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
