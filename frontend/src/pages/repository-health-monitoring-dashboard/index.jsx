import React, { useState, useEffect } from 'react';

import RepositoryCard from './components/RepositoryCard';
import StatusTimeline from './components/StatusTimeline';
import AlertFeed from './components/AlertFeed';
import RepositoryTable from './components/RepositoryTable';
import CriticalAlerts from './components/CriticalAlerts';

const RepositoryHealthMonitoringDashboard = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState('production');
  const [healthThreshold, setHealthThreshold] = useState(85);
  const [alertSeverity, setAlertSeverity] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(5);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock data for repositories
  const repositories = [
    {
      id: 1,
      name: "frontend-app",
      status: "healthy",
      syncStatus: "synced",
      openIssues: 12,
      stalePRs: 2,
      cicdHealth: "passing",
      healthScore: 92,
      lastCommit: "2 hours ago",
      deploymentStatus: "deployed",
      coverage: 87
    },
    {
      id: 2,
      name: "backend-api",
      status: "warning",
      syncStatus: "syncing",
      openIssues: 8,
      stalePRs: 5,
      cicdHealth: "failing",
      healthScore: 76,
      lastCommit: "4 hours ago",
      deploymentStatus: "pending",
      coverage: 82
    },
    {
      id: 3,
      name: "mobile-app",
      status: "critical",
      syncStatus: "error",
      openIssues: 23,
      stalePRs: 8,
      cicdHealth: "failing",
      healthScore: 45,
      lastCommit: "1 day ago",
      deploymentStatus: "failed",
      coverage: 65
    },
    {
      id: 4,
      name: "data-pipeline",
      status: "healthy",
      syncStatus: "synced",
      openIssues: 3,
      stalePRs: 1,
      cicdHealth: "passing",
      healthScore: 95,
      lastCommit: "30 minutes ago",
      deploymentStatus: "deployed",
      coverage: 91
    }
  ];

  // Mock timeline events
  const timelineEvents = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 300000),
      type: "deployment",
      repository: "frontend-app",
      message: "Deployment completed successfully",
      severity: "success"
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 600000),
      type: "ci_failure",
      repository: "backend-api",
      message: "CI pipeline failed - test coverage below threshold",
      severity: "error"
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 900000),
      type: "sync_issue",
      repository: "mobile-app",
      message: "Repository sync failed - authentication error",
      severity: "critical"
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 1200000),
      type: "health_improvement",
      repository: "data-pipeline",
      message: "Health score improved to 95%",
      severity: "success"
    }
  ];

  // Mock alerts
  const alerts = [
    {
      id: 1,
      severity: "critical",
      repository: "mobile-app",
      message: "Repository sync has been failing for 6 hours",
      timestamp: new Date(Date.now() - 21600000),
      acknowledged: false,
      category: "sync"
    },
    {
      id: 2,
      severity: "warning",
      repository: "backend-api",
      message: "5 stale pull requests detected",
      timestamp: new Date(Date.now() - 7200000),
      acknowledged: false,
      category: "pr_management"
    },
    {
      id: 3,
      severity: "info",
      repository: "frontend-app",
      message: "Deployment completed successfully",
      timestamp: new Date(Date.now() - 300000),
      acknowledged: true,
      category: "deployment"
    }
  ];

  const environments = ['production', 'staging', 'development'];
  const refreshIntervals = [
    { value: 1, label: '1 minute' },
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' }
  ];

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, autoRefresh * 60000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const criticalAlerts = alerts?.filter(alert => alert?.severity === 'critical' && !alert?.acknowledged);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1920px] mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-text-primary font-mono">
                Repository Health Monitoring
              </h1>
              <p className="text-text-secondary font-mono mt-2">
                Real-time repository status and development workflow health indicators
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
              <div className="w-2 h-2 bg-success rounded-full pulse-live"></div>
              <span>Last updated: {lastUpdated?.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Global Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-surface rounded-lg border border-border-medium">
            {/* Environment Selector */}
            <div>
              <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
                Environment
              </label>
              <select
                value={selectedEnvironment}
                onChange={(e) => setSelectedEnvironment(e?.target?.value)}
                className="w-full bg-surface-light border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {environments?.map(env => (
                  <option key={env} value={env}>
                    {env.charAt(0)?.toUpperCase() + env.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Health Threshold */}
            <div>
              <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
                Health Threshold: {healthThreshold}%
              </label>
              <input
                type="range"
                min="50"
                max="100"
                value={healthThreshold}
                onChange={(e) => setHealthThreshold(parseInt(e?.target?.value))}
                className="w-full h-2 bg-surface-light rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Alert Severity Filter */}
            <div>
              <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
                Alert Severity
              </label>
              <select
                value={alertSeverity}
                onChange={(e) => setAlertSeverity(e?.target?.value)}
                className="w-full bg-surface-light border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical Only</option>
                <option value="warning">Warning & Above</option>
                <option value="info">Info & Above</option>
              </select>
            </div>

            {/* Auto Refresh */}
            <div>
              <label className="block text-sm font-medium text-text-secondary font-mono mb-2">
                Auto Refresh
              </label>
              <select
                value={autoRefresh}
                onChange={(e) => setAutoRefresh(parseInt(e?.target?.value))}
                className="w-full bg-surface-light border border-border-medium rounded-lg px-3 py-2 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {refreshIntervals?.map(interval => (
                  <option key={interval?.value} value={interval?.value}>
                    {interval?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Critical Alerts Banner */}
        {criticalAlerts?.length > 0 && (
          <CriticalAlerts alerts={criticalAlerts} />
        )}

        {/* Health Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {repositories?.map(repo => (
            <RepositoryCard
              key={repo?.id}
              repository={repo}
              healthThreshold={healthThreshold}
            />
          ))}
        </div>

        {/* Main Monitoring Area */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          {/* Status Timeline */}
          <div className="xl:col-span-2">
            <StatusTimeline events={timelineEvents} />
          </div>

          {/* Alert Feed */}
          <div className="xl:col-span-1">
            <AlertFeed alerts={alerts} severity={alertSeverity} />
          </div>
        </div>

        {/* Repository Comparison Table */}
        <RepositoryTable repositories={repositories} />
      </div>
    </div>
  );
};

export default RepositoryHealthMonitoringDashboard;