import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

/**
 * ThemeToggle — dark/light mode switcher
 * Respects system preferences on first load
 * Persists user choice in localStorage
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState(null);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('nyvel-theme');
    if (stored) {
      setTheme(stored);
      applyTheme(stored);
    } else {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const newTheme = isDark ? 'dark' : 'light';
      setTheme(newTheme);
      applyTheme(newTheme);
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const newTheme = e.matches ? 'dark' : 'light';
      setTheme(newTheme);
      applyTheme(newTheme);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('nyvel-theme', newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    applyTheme(newTheme);
  };

  if (theme === null) {
    return null; // Wait for initialization
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-200"
      title={`Current theme: ${theme === 'dark' ? 'Dark' : 'Light'}`}
    >
      {theme === 'dark' ? (
        <Sun size={18} aria-hidden="true" />
      ) : (
        <Moon size={18} aria-hidden="true" />
      )}
    </button>
  );
}
