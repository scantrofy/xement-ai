import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')?.matches;
    
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
    } else {
      // Default to light mode unless user prefers dark
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply theme to document root and save preference
    const root = document.documentElement;
    
    if (isDarkMode) {
      root.classList?.add('dark');
      root.classList?.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList?.add('light');
      root.classList?.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Force a reflow to ensure styles are applied
    root.offsetHeight;
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};