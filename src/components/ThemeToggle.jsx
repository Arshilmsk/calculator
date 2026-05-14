import React from 'react';
import './ThemeToggle.css';

const ThemeToggle = ({ theme, setTheme }) => {
  const toggleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    if (theme === 'light') return '☀️';
    if (theme === 'dark') return '🌙';
    return '🌓';
  };

  const getLabel = () => {
    if (theme === 'light') return 'Light';
    if (theme === 'dark') return 'Dark';
    return 'System';
  };

  return (
    <button 
      className={`theme-toggle ${theme}`} 
      onClick={toggleTheme}
      title={`Current Theme: ${getLabel()}`}
      aria-label={`Switch theme (currently ${getLabel()})`}
    >
      <span className="toggle-icon">{getIcon()}</span>
      <span className="toggle-label">{getLabel()}</span>
    </button>
  );
};

export default ThemeToggle;
