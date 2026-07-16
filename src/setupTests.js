// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.)
// CRA loads this file automatically before every test suite.
import '@testing-library/jest-dom';

// jsdom has no window.matchMedia implementation. ThemeToggle (rendered by
// PlatformLayout, which most authenticated pages use) reads it on mount.
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
