import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AlertFeed = ({ alerts, severity }) => {
  const [acknowledgedAlerts, setAcknowledgedAlerts] = useState(new Set());

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-text-secondary';
    }
  };

  const getSeverityBg = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-error/10 border-error/20';
      case 'warning':
        return 'bg-warning/10 border-warning/20';
      case 'info':
        return 'bg-primary/10 border-primary/20';
      default:
        return 'bg-surface-light border-border-medium';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return 'AlertTriangle';
      case 'warning':
        return 'AlertCircle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'sync':
        return 'RefreshCw';
      case 'pr_management':
        return 'GitPullRequest';
      case 'deployment':
        return 'Rocket';
      case 'ci_cd':
        return 'Zap';
      default:
        return 'Bell';
    }
  };

  const handleAcknowledge = (alertId) => {
    setAcknowledgedAlerts(prev => new Set([...prev, alertId]));
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const filteredAlerts = alerts?.filter(alert => {
    if (severity === 'all') return true;
    if (severity === 'critical') return alert?.severity === 'critical';
    if (severity === 'warning') return ['critical', 'warning']?.includes(alert?.severity);
    if (severity === 'info') return ['critical', 'warning', 'info']?.includes(alert?.severity);
    return true;
  });

  const unacknowledgedCount = filteredAlerts?.filter(alert => 
    !alert?.acknowledged && !acknowledgedAlerts?.has(alert?.id)
  )?.length;

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      {/* Alert Feed Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
            <Icon name="Bell" size={18} className="text-warning" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-text-primary font-mono">
              Alert Feed
            </h2>
            {unacknowledgedCount > 0 && (
              <span className="text-xs text-error font-mono">
                {unacknowledgedCount} unacknowledged
              </span>
            )}
          </div>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-surface-light text-text-secondary rounded-lg hover:bg-surface-lighter transition-smooth font-mono text-sm">
          <Icon name="Settings" size={14} strokeWidth={2} />
          <span>Configure</span>
        </button>
      </div>
      {/* Alert List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts?.length > 0 ? (
          filteredAlerts?.map(alert => {
            const isAcknowledged = alert?.acknowledged || acknowledgedAlerts?.has(alert?.id);
            
            return (
              <div
                key={alert?.id}
                className={`p-4 rounded-lg border transition-smooth ${
                  isAcknowledged 
                    ? 'bg-surface-light border-border-medium opacity-60' 
                    : getSeverityBg(alert?.severity)
                }`}
              >
                {/* Alert Header */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Icon 
                      name={getSeverityIcon(alert?.severity)} 
                      size={16} 
                      className={getSeverityColor(alert?.severity)} 
                      strokeWidth={2}
                    />
                    <span className={`text-xs font-medium font-mono px-2 py-0.5 rounded-full ${
                      alert?.severity === 'critical' ? 'bg-error/20 text-error' :
                      alert?.severity === 'warning'? 'bg-warning/20 text-warning' : 'bg-primary/20 text-primary'
                    }`}>
                      {alert?.severity?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary font-mono">
                    {formatTime(alert?.timestamp)}
                  </span>
                </div>
                {/* Repository & Category */}
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="GitBranch" size={12} className="text-text-secondary" strokeWidth={2} />
                    <span className="text-sm font-medium text-text-primary font-mono">
                      {alert?.repository}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name={getCategoryIcon(alert?.category)} size={12} className="text-text-secondary" strokeWidth={2} />
                    <span className="text-xs text-text-secondary font-mono">
                      {alert?.category?.replace('_', ' ')}
                    </span>
                  </div>
                </div>
                {/* Alert Message */}
                <p className="text-sm text-text-secondary font-mono mb-3">
                  {alert?.message}
                </p>
                {/* Alert Actions */}
                {!isAcknowledged && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAcknowledge(alert?.id)}
                      className="flex items-center space-x-1 px-2 py-1 bg-primary/10 text-primary rounded text-xs font-mono hover:bg-primary/20 transition-smooth"
                    >
                      <Icon name="Check" size={12} strokeWidth={2} />
                      <span>Acknowledge</span>
                    </button>
                    <button className="flex items-center space-x-1 px-2 py-1 bg-surface-light text-text-secondary rounded text-xs font-mono hover:bg-surface-lighter transition-smooth">
                      <Icon name="ExternalLink" size={12} strokeWidth={2} />
                      <span>View Details</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <Icon name="CheckCircle" size={48} className="text-success mx-auto mb-4" strokeWidth={1} />
            <p className="text-text-secondary font-mono">No alerts for the selected severity level</p>
          </div>
        )}
      </div>
      {/* Alert Feed Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border-medium mt-4">
        <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
          <Icon name="Clock" size={14} strokeWidth={2} />
          <span>Auto-refresh every 30s</span>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-surface-light text-text-secondary rounded-lg hover:bg-surface-lighter transition-smooth font-mono text-sm">
          <Icon name="Archive" size={14} strokeWidth={2} />
          <span>View All</span>
        </button>
      </div>
    </div>
  );
};

export default AlertFeed;