import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './Logo';
import Icon from '../AppIcon';

const ErrorFallback = ({ error, resetError }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/overview-dashboard');
    resetError?.();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Logo 
            size="large"
            showText={true}
            onClick={handleGoHome}
            className="cursor-pointer"
          />
        </div>

        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-surface rounded-full flex items-center justify-center">
            <Icon name="AlertCircle" size={48} className="text-error" strokeWidth={1.5} />
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-semibold text-text-primary font-inter mb-4">
          Something went wrong
        </h1>
        <p className="text-text-secondary font-inter mb-6 leading-relaxed">
          An unexpected error occurred while loading the dashboard. Please try refreshing the page or return to the overview.
        </p>

        {/* Error Details (Development Mode) */}
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-lg text-left">
            <h3 className="text-sm font-medium text-error mb-2">Error Details:</h3>
            <pre className="text-xs text-error/80 font-mono overflow-auto">
              {error.message}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary hover:bg-primary-600 text-white font-inter font-medium py-3 px-6 rounded-lg transition-smooth flex items-center justify-center space-x-2"
          >
            <Icon name="RefreshCw" size={20} strokeWidth={2} />
            <span>Refresh Page</span>
          </button>
          
          <button
            onClick={handleGoHome}
            className="w-full bg-surface hover:bg-surface-light text-text-primary font-inter font-medium py-3 px-6 rounded-lg transition-smooth border border-border-medium flex items-center justify-center space-x-2"
          >
            <Icon name="Home" size={20} strokeWidth={2} />
            <span>Go to Dashboard</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 p-4 bg-surface rounded-lg border border-border-medium">
          <p className="text-sm text-text-secondary font-inter">
            If this problem persists, please contact the system administrator.
          </p>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback 
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
export { ErrorFallback };
