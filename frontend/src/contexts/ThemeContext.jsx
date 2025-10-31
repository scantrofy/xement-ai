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
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)')?.matches;
    
    if (savedTheme) {
      const isDark = savedTheme === 'dark';
      setIsDarkMode(isDark);
    } else {
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
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