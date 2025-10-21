import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Shield, Users } from 'lucide-react';
import Icon from '../AppIcon';
import Logo from './Logo';

const Header = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

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

          {/* User Profile Dropdown */}
          <div className="relative ml-3">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-surface-light transition-colors"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                {user?.role === 'admin' ? (
                  <Shield size={16} className="text-white" />
                ) : (
                  <Users size={16} className="text-white" />
                )}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-text-primary">
                  {user?.name || user?.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-text-secondary capitalize">
                  {user?.role || 'Operator'}
                </p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-border-light z-20">
                  <div className="p-3 border-b border-border-light">
                    <p className="text-sm font-medium text-text-primary">
                      {user?.name || 'User'}
                    </p>
                    <p className="text-xs text-text-secondary mt-1">
                      {user?.email}
                    </p>
                    {user?.organization && (
                      <p className="text-xs text-text-secondary mt-1">
                        {user?.organization}
                      </p>
                    )}
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-primary/10 rounded text-xs font-medium text-primary capitalize">
                      {user?.role === 'admin' ? (
                        <Shield size={12} />
                      ) : (
                        <Users size={12} />
                      )}
                      {user?.role || 'Operator'}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>

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