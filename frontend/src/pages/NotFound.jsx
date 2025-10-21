import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import Logo from '../components/ui/Logo';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/development-operations-overview-dashboard');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo 
            size="large"
            showText={true}
            onClick={() => navigate('/overview-dashboard')}
            className="cursor-pointer"
          />
        </div>

        {/* 404 Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center">
            <Icon name="AlertTriangle" size={48} className="text-warning" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-6xl font-bold text-primary font-mono mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-text-primary font-mono mb-4">
          Page Not Found
        </h2>
        <p className="text-text-secondary font-mono mb-8 leading-relaxed">
          The development operations dashboard page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={handleGoHome}
            className="w-full bg-primary hover:bg-primary-600 text-white font-mono font-medium py-3 px-6 rounded-lg transition-smooth flex items-center justify-center space-x-2"
          >
            <Icon name="Home" size={20} strokeWidth={2} />
            <span>Go to Dashboard</span>
          </button>
          
          <button
            onClick={() => window.history?.back()}
            className="w-full bg-surface hover:bg-surface-light text-text-primary font-mono font-medium py-3 px-6 rounded-lg transition-smooth border border-border-medium flex items-center justify-center space-x-2"
          >
            <Icon name="ArrowLeft" size={20} strokeWidth={2} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-12 p-4 bg-surface rounded-lg border border-border-medium">
          <p className="text-sm text-text-secondary font-mono">
            If you believe this is an error, please contact the development team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;