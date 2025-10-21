import React from 'react';
import Logo from './Logo';

const LoadingScreen = ({ 
  message = 'Loading...', 
  showLogo = true,
  fullScreen = true 
}) => {
  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-background flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8';

  return (
    <div className={containerClasses}>
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <Logo 
              size="large"
              showText={true}
              className="animate-pulse"
            />
          </div>
        )}
        
        {/* Loading Spinner */}
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        
        {/* Loading Message */}
        <p className="text-text-secondary font-inter text-lg">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
