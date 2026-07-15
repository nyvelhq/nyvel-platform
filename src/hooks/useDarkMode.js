import { useEffect, useState } from 'react';

/**
 * useDarkMode — reactively tracks the app's dark theme.
 *
 * The theme is applied by toggling a `dark` class on <html> (see ThemeToggle).
 * This hook observes that class with a MutationObserver so consumers — e.g.
 * Recharts, which can't read Tailwind's `dark:` variants — re-render with the
 * correct palette the moment the user flips the toggle.
 *
 * @returns {boolean} true when the dark theme is active
 */
export default function useDarkMode() {
  const [isDark, setIsDark] = useState(
    () => typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains('dark'));
    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
