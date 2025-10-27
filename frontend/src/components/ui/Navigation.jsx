import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Logo from './Logo';
import { useAuth } from '../../contexts/AuthContext';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  // Removed notifications state

  const navigationItems = [
    {
      label: 'Overview',
      path: '/overview-dashboard',
      icon: 'LayoutDashboard',
      description: 'Real-time KPIs and production monitoring'
    },
    {
      label: 'AI Recommendations',
      path: '/ai-recommendations-engine',
      icon: 'Brain',
      description: 'Intelligent optimization recommendations'
    },
    {
      label: 'Simulator',
      path: '/scenario-simulator',
      icon: 'LineChart',
      description: 'Advanced simulation and fuel optimization'
    },
    {
      label: 'Alerts',
      path: '/alerts-anomalies-monitor',
      icon: 'AlertTriangle',
      description: 'Critical monitoring and anomaly detection'
    },
    {
      label: 'Reports',
      path: '/reports-insights',
      icon: 'FileText',
      description: 'AI-driven analytics and comprehensive reports'
    },
    ...(user?.role === 'admin' ? [{
      label: 'User Management',
      path: '/admin/users',
      icon: 'Users',
      description: 'Manage system users and roles'
    }] : []),
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Removed notifications simulation

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:block bg-surface border-b border-border-medium fixed top-16 left-0 right-0 z-100">
        <div className="px-6">
          <div className="flex space-x-0">
            {navigationItems?.map((item) => {
              const isActive = location?.pathname === item?.path;
              
              return (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`
                    relative flex items-center space-x-3 px-6 py-4 font-mono text-sm font-medium
                    transition-smooth border-b-2 min-h-[60px]
                    ${isActive 
                      ? 'text-primary border-primary bg-primary/5' :'text-text-secondary border-transparent hover:text-text-primary hover:border-border-medium hover:bg-surface-light/50'
                    }
                  `}
                >
                  <Icon 
                    name={item?.icon} 
                    size={18} 
                    strokeWidth={2}
                    className={isActive ? 'text-primary' : 'text-current'}
                  />
                  <span>{item?.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>
      {/* Mobile Navigation */}
      <div className="md:hidden">
        {/* Mobile Header with Hamburger */}
        <div className="bg-surface border-b border-border-medium fixed top-16 left-0 right-0 z-100 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {navigationItems?.map((item) => {
                if (location?.pathname === item?.path) {
                  return (
                    <div key={item?.path} className="flex items-center space-x-2">
                      <Icon name={item?.icon} size={18} className="text-primary" strokeWidth={2} />
                      <span className="font-mono text-sm font-medium text-primary">{item?.label}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light"
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={20} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black/50 z-150 top-28"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="fixed top-28 right-0 w-80 max-w-[90vw] h-[calc(100vh-7rem)] bg-surface border-l border-border-medium z-200 overflow-y-auto">
              <div className="p-4 space-y-2">
                {/* Mobile Logo */}
                <div className="flex justify-center pb-4 mb-4 border-b border-border-medium">
                  <Logo 
                    size="small"
                    showText={false}
                    onClick={() => {
                      navigate('/overview-dashboard');
                      setIsMobileMenuOpen(false);
                    }}
                    className="cursor-pointer"
                  />
                </div>
                {navigationItems?.map((item) => {
                  const isActive = location?.pathname === item?.path;
                  
                  return (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className={`
                        relative w-full flex items-start space-x-3 p-4 rounded-lg
                        transition-smooth text-left
                        ${isActive 
                          ? 'bg-primary/10 border border-primary/20' :'hover:bg-surface-light border border-transparent'
                        }
                      `}
                    >
                      <Icon 
                        name={item?.icon} 
                        size={20} 
                        strokeWidth={2}
                        className={isActive ? 'text-primary mt-0.5' : 'text-text-secondary mt-0.5'}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className={`font-mono text-sm font-medium ${isActive ? 'text-primary' : 'text-text-primary'}`}>
                            {item?.label}
                          </span>
                        </div>
                        <p className="text-xs text-text-secondary mt-1 font-mono">
                          {item?.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Navigation;