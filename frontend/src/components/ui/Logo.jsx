import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const Logo = ({ 
  size = 'medium', 
  showText = true, 
  className = '',
  textClassName = '',
  onClick = null 
}) => {
  const { isDarkMode } = useTheme();

  const sizeClasses = {
    small: 'h-8 w-auto',
    medium: 'h-11 w-auto',
    large: 'h-12 w-auto',
    xlarge: 'h-16 w-auto'
  };

  const textSizeClasses = {
    small: 'text-lg',
    medium: 'text-xl',
    large: 'text-2xl',
    xlarge: 'text-3xl'
  };

  const logoSrc = isDarkMode 
    ? '/assets/images/xement-ai-white-logo.png'
    : '/assets/images/xement-ai-blue-logo.png';

  const LogoContent = () => (
    <div className={`flex items-center space-x-3 ${className}`}>
      <img 
        src={logoSrc}
        alt="Xement AI Logo"
        className={`${sizeClasses[size]} transition-opacity duration-200`}
        onError={(e) => {
          // Fallback to icon if image fails to load
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'flex';
        }}
      />
      
      {/* Fallback icon (hidden by default) */}
      <div 
        className={`items-center justify-center bg-primary rounded-lg hidden ${sizeClasses[size].replace('w-auto', 'w-10')}`}
        style={{ display: 'none' }}
      >
        <svg 
          className="w-6 h-6 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" 
          />
        </svg>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className="transition-opacity hover:opacity-80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-lg"
      >
        <LogoContent />
      </button>
    );
  }

  return <LogoContent />;
};

export default Logo;
