import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CriticalAlerts = ({ alerts }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());

  const handleDismiss = (alertId) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
  };

  const handleDismissAll = () => {
    const allAlertIds = alerts?.map(alert => alert?.id);
    setDismissedAlerts(new Set(allAlertIds));
  };

  const visibleAlerts = alerts?.filter(alert => !dismissedAlerts?.has(alert?.id));

  if (visibleAlerts?.length === 0) {
    return null;
  }

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor(diff / 60000);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    } else {
      return `${minutes}m ago`;
    }
  };

  return (
    <div className="mb-8">
      <div className="bg-error/10 border border-error/20 rounded-lg overflow-hidden">
        {/* Alert Banner Header */}
        <div className="flex items-center justify-between p-4 bg-error/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-error/20 rounded-lg flex items-center justify-center">
              <Icon name="AlertTriangle" size={18} className="text-error" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-error font-mono">
                Critical Alerts Requiring Immediate Attention
              </h3>
              <p className="text-sm text-text-secondary font-mono">
                {visibleAlerts?.length} critical issue{visibleAlerts?.length !== 1 ? 's' : ''} detected
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-error hover:bg-error/10 rounded-lg transition-smooth"
            >
              <Icon 
                name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                size={20} 
                strokeWidth={2} 
              />
            </button>
            <button
              onClick={handleDismissAll}
              className="flex items-center space-x-2 px-3 py-1.5 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-smooth font-mono text-sm"
            >
              <Icon name="X" size={14} strokeWidth={2} />
              <span>Dismiss All</span>
            </button>
          </div>
        </div>

        {/* Alert Details */}
        {isExpanded && (
          <div className="p-4 space-y-3">
            {visibleAlerts?.map(alert => (
              <div
                key={alert?.id}
                className="flex items-start justify-between p-4 bg-surface rounded-lg border border-error/20"
              >
                <div className="flex items-start space-x-3 flex-1">
                  {/* Alert Icon */}
                  <div className="w-10 h-10 bg-error/10 rounded-lg flex items-center justify-center mt-0.5">
                    <Icon name="AlertTriangle" size={20} className="text-error" strokeWidth={2} />
                  </div>

                  {/* Alert Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <Icon name="GitBranch" size={14} className="text-text-secondary" strokeWidth={2} />
                        <span className="font-semibold text-text-primary font-mono">
                          {alert?.repository}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 bg-error/20 text-error rounded-full text-xs font-mono font-medium">
                        CRITICAL
                      </span>
                      <span className="text-xs text-text-secondary font-mono">
                        {formatTime(alert?.timestamp)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-text-secondary font-mono mb-3">
                      {alert?.message}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary-600 transition-smooth font-mono text-sm">
                        <Icon name="ExternalLink" size={14} strokeWidth={2} />
                        <span>Investigate</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-1.5 bg-warning/10 text-warning rounded-lg hover:bg-warning/20 transition-smooth font-mono text-sm">
                        <Icon name="RefreshCw" size={14} strokeWidth={2} />
                        <span>Retry Sync</span>
                      </button>
                      <button className="flex items-center space-x-2 px-3 py-1.5 bg-surface-light text-text-secondary rounded-lg hover:bg-surface-lighter transition-smooth font-mono text-sm">
                        <Icon name="MessageSquare" size={14} strokeWidth={2} />
                        <span>Contact Team</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => handleDismiss(alert?.id)}
                  className="p-2 text-text-secondary hover:text-error hover:bg-error/10 rounded-lg transition-smooth ml-4"
                >
                  <Icon name="X" size={16} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Alert Banner Footer */}
        <div className="flex items-center justify-between p-4 bg-error/5 border-t border-error/20">
          <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
            <Icon name="Clock" size={14} strokeWidth={2} />
            <span>Alerts are monitored in real-time</span>
          </div>
          <div className="flex items-center space-x-3">
            <button className="flex items-center space-x-2 px-3 py-1.5 bg-surface-light text-text-secondary rounded-lg hover:bg-surface-lighter transition-smooth font-mono text-sm">
              <Icon name="Settings" size={14} strokeWidth={2} />
              <span>Alert Settings</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-smooth font-mono text-sm">
              <Icon name="Bell" size={14} strokeWidth={2} />
              <span>Notification Rules</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriticalAlerts;