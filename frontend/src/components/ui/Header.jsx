import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Logo from './Logo';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="bg-surface border-b border-border-medium px-6 py-4 fixed top-0 left-0 right-0 z-100">
      <div className="flex items-center justify-between">
        {/* Logo Section */}
        <Logo 
          size="medium"
          showText={true}
          onClick={() => navigate('/overview-dashboard')}
          className="cursor-pointer"
        />

        {/* Header Actions */}
        <div className="flex items-center">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light flex items-center space-x-2"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Icon 
              name={isDarkMode ? "Sun" : "Moon"} 
              size={20} 
              strokeWidth={2}
            />
            <span className="text-sm font-mono hidden sm:block">
              {isDarkMode ? 'Light' : 'Dark'}
            </span>
          </button>

          <div className="flex items-end space-x-2 px-3 py-2">
            <span className="text-[9px] font-inter text-text-secondary hidden sm:block">
              Made for
            </span>
            <img 
              src="/assets/images/jkcement.png"
              alt="JK Cement"
              className="h-4 w-auto"
            />
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;