import React, { useState, useEffect } from 'react';
import GlobalControls from './components/GlobalControls';
import KPICards from './components/KPICards';
import ContributionHeatmap from './components/ContributionHeatmap';
import RecentActivity from './components/RecentActivity';
import RepositorySummary from './components/RepositorySummary';
import Icon from '../../components/AppIcon';

const DevelopmentOperationsOverviewDashboard = () => {
  const [filters, setFilters] = useState({
    repositories: ['all'],
    teamMembers: ['all'],
    timeRange: 'week'
  });
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Simulate WebSocket connection status
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // Simulate occasional connection issues
      if (Math.random() < 0.05) {
        setConnectionStatus('reconnecting');
        setTimeout(() => setConnectionStatus('connected'), 2000);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // In a real app, this would trigger data refetch
    console.log('Filters changed:', newFilters);
  };

  const handleDateClick = (dateData) => {
    console.log('Date clicked:', dateData);
    // In a real app, this would drill down to detailed view
  };

  const getConnectionStatusColor = () => {
    const colorMap = {
      connected: 'success',
      reconnecting: 'warning',
      disconnected: 'error'
    };
    return colorMap?.[connectionStatus] || 'primary';
  };

  const formatLastUpdate = () => {
    return lastUpdate?.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-text-primary font-mono">
                Development Operations Overview
              </h1>
              <p className="text-text-secondary font-mono mt-2">
                Comprehensive development team visibility across all repositories and workflows
              </p>
            </div>
            
            {/* Connection Status */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-4 py-2 bg-surface border border-border-medium rounded-lg">
                <div className={`w-2 h-2 rounded-full bg-${getConnectionStatusColor()} ${connectionStatus === 'connected' ? 'pulse-live' : ''}`} />
                <span className="text-sm font-mono text-text-secondary">
                  {connectionStatus === 'connected' ? 'Live Data' : connectionStatus === 'reconnecting' ? 'Reconnecting...' : 'Disconnected'}
                </span>
                <span className="text-xs font-mono text-text-secondary">
                  {formatLastUpdate()}
                </span>
              </div>
              
              <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
                <Icon name="RefreshCw" size={20} strokeWidth={2} />
              </button>
              
              <button className="p-2 text-text-secondary hover:text-text-primary transition-smooth rounded-lg hover:bg-surface-light">
                <Icon name="Settings" size={20} strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {/* Global Controls */}
        <GlobalControls onFiltersChange={handleFiltersChange} />

        {/* KPI Cards */}
        <KPICards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 mb-6">
          {/* Contribution Heatmap */}
          <div className="w-full">
            <ContributionHeatmap onDateClick={handleDateClick} />
          </div>
          
          {/* Real-time Activity Feed - Now Full Width */}
          <div className="w-full">
            <RecentActivity />
          </div>
        </div>

        {/* Repository Summary Table */}
        <RepositorySummary />

        {/* Export and Actions */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-surface border border-border-medium text-text-primary rounded-lg font-mono text-sm hover:border-primary/50 transition-smooth flex items-center space-x-2">
              <Icon name="Download" size={16} strokeWidth={2} />
              <span>Export Data</span>
            </button>
            
            <button className="px-4 py-2 bg-surface border border-border-medium text-text-primary rounded-lg font-mono text-sm hover:border-primary/50 transition-smooth flex items-center space-x-2">
              <Icon name="Share" size={16} strokeWidth={2} />
              <span>Share Dashboard</span>
            </button>
            
            <button className="px-4 py-2 bg-surface border border-border-medium text-text-primary rounded-lg font-mono text-sm hover:border-primary/50 transition-smooth flex items-center space-x-2">
              <Icon name="Calendar" size={16} strokeWidth={2} />
              <span>Schedule Report</span>
            </button>
          </div>
          
          <div className="text-sm text-text-secondary font-mono">
            Data refreshed every 5 minutes • Last sync: {formatLastUpdate()}
          </div>
        </div>

        {/* Quick Navigation */}
        <div className="mt-8 p-6 bg-surface border border-border-medium rounded-lg">
          <h3 className="text-lg font-semibold text-text-primary font-mono mb-4">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-background border border-border-light rounded-lg hover:border-primary/30 transition-smooth text-left group">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="GitPullRequest" size={20} className="text-secondary group-hover:text-primary transition-smooth" strokeWidth={2} />
                <span className="font-medium text-text-primary font-mono">Pull Request Analytics</span>
              </div>
              <p className="text-sm text-text-secondary font-mono">
                Detailed PR workflow optimization and review efficiency metrics
              </p>
            </button>
            
            <button className="p-4 bg-background border border-border-light rounded-lg hover:border-primary/30 transition-smooth text-left group">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="Users" size={20} className="text-accent group-hover:text-primary transition-smooth" strokeWidth={2} />
                <span className="font-medium text-text-primary font-mono">Team Productivity</span>
              </div>
              <p className="text-sm text-text-secondary font-mono">
                Development velocity and productivity insights for team management
              </p>
            </button>
            
            <button className="p-4 bg-background border border-border-light rounded-lg hover:border-primary/30 transition-smooth text-left group">
              <div className="flex items-center space-x-3 mb-2">
                <Icon name="Activity" size={20} className="text-success group-hover:text-primary transition-smooth" strokeWidth={2} />
                <span className="font-medium text-text-primary font-mono">Repository Health</span>
              </div>
              <p className="text-sm text-text-secondary font-mono">
                Real-time repository status monitoring and health metrics
              </p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentOperationsOverviewDashboard;