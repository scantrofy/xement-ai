import React from 'react';
import Icon from '../../../components/AppIcon';

const RepositoryCard = ({ repository, healthThreshold }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'critical':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'healthy':
        return 'CheckCircle';
      case 'warning':
        return 'AlertTriangle';
      case 'critical':
        return 'XCircle';
      default:
        return 'Circle';
    }
  };

  const getSyncStatusIcon = (syncStatus) => {
    switch (syncStatus) {
      case 'synced':
        return 'CheckCircle2';
      case 'syncing':
        return 'RotateCw';
      case 'error':
        return 'AlertCircle';
      default:
        return 'Circle';
    }
  };

  const getCicdStatusColor = (status) => {
    switch (status) {
      case 'passing':
        return 'text-success';
      case 'failing':
        return 'text-error';
      case 'pending':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  const getHealthScoreColor = (score) => {
    if (score >= healthThreshold) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6 hover:border-primary/30 transition-smooth">
      {/* Repository Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="GitBranch" size={20} className="text-primary" strokeWidth={2} />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary font-mono">{repository?.name}</h3>
            <p className="text-xs text-text-secondary font-mono">{repository?.lastCommit}</p>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${getStatusColor(repository?.status)}`}>
          <Icon name={getStatusIcon(repository?.status)} size={16} strokeWidth={2} />
          <span className="text-xs font-mono capitalize">{repository?.status}</span>
        </div>
      </div>
      {/* Health Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-text-secondary font-mono">Health Score</span>
          <span className={`text-lg font-bold font-mono ${getHealthScoreColor(repository?.healthScore)}`}>
            {repository?.healthScore}%
          </span>
        </div>
        <div className="w-full bg-surface-light rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              repository?.healthScore >= healthThreshold ? 'bg-success' :
              repository?.healthScore >= 70 ? 'bg-warning' : 'bg-error'
            }`}
            style={{ width: `${repository?.healthScore}%` }}
          />
        </div>
      </div>
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Sync Status */}
        <div className="flex items-center space-x-2">
          <Icon 
            name={getSyncStatusIcon(repository?.syncStatus)} 
            size={14} 
            className={repository?.syncStatus === 'synced' ? 'text-success' : 
                      repository?.syncStatus === 'syncing' ? 'text-warning' : 'text-error'} 
            strokeWidth={2}
          />
          <span className="text-xs text-text-secondary font-mono">Sync</span>
        </div>

        {/* CI/CD Status */}
        <div className="flex items-center space-x-2">
          <Icon 
            name="Zap" 
            size={14} 
            className={getCicdStatusColor(repository?.cicdHealth)} 
            strokeWidth={2}
          />
          <span className="text-xs text-text-secondary font-mono">CI/CD</span>
        </div>

        {/* Open Issues */}
        <div className="flex items-center space-x-2">
          <Icon name="AlertCircle" size={14} className="text-warning" strokeWidth={2} />
          <span className="text-xs text-text-secondary font-mono">{repository?.openIssues} Issues</span>
        </div>

        {/* Stale PRs */}
        <div className="flex items-center space-x-2">
          <Icon name="GitPullRequest" size={14} className="text-error" strokeWidth={2} />
          <span className="text-xs text-text-secondary font-mono">{repository?.stalePRs} Stale</span>
        </div>
      </div>
      {/* Coverage & Deployment */}
      <div className="flex items-center justify-between pt-4 border-t border-border-medium">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={14} className="text-primary" strokeWidth={2} />
          <span className="text-xs text-text-secondary font-mono">Coverage: {repository?.coverage}%</span>
        </div>
        <div className={`flex items-center space-x-1 ${
          repository?.deploymentStatus === 'deployed' ? 'text-success' :
          repository?.deploymentStatus === 'pending' ? 'text-warning' : 'text-error'
        }`}>
          <Icon 
            name={repository?.deploymentStatus === 'deployed' ? 'CheckCircle' : 
                  repository?.deploymentStatus === 'pending' ? 'Clock' : 'XCircle'} 
            size={14} 
            strokeWidth={2}
          />
          <span className="text-xs font-mono capitalize">{repository?.deploymentStatus}</span>
        </div>
      </div>
    </div>
  );
};

export default RepositoryCard;