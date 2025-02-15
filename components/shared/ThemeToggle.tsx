'use client';

import { useTheme } from '@/lib/context/ThemeContext';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <MoonIcon className="h-5 w-5 text-yellow-500" />
      ) : (
        <SunIcon className="h-5 w-5 text-gray-500" />
      )}
    </button>
  );
}