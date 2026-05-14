import { useState, useEffect } from 'react';

/**
 * Custom hook to manage theme switching logic
 * Supports 'light', 'dark', and 'system' modes
 */
export const useTheme = () => {
  // Get initial theme from localStorage or default to 'system'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'system';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Function to apply theme
    const applyTheme = (currentTheme) => {
      let activeTheme = currentTheme;
      
      if (currentTheme === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      root.setAttribute('data-theme', activeTheme);
      // Also update color-scheme for native elements
      root.style.colorScheme = activeTheme;
    };

    applyTheme(theme);
    localStorage.setItem('theme', theme);

    // If theme is 'system', we need to listen for system changes
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return { theme, setTheme };
};
