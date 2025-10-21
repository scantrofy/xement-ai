import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const StatusTimeline = ({ events }) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedEventType, setSelectedEventType] = useState('all');

  const timeRanges = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  const eventTypes = [
    { value: 'all', label: 'All Events' },
    { value: 'deployment', label: 'Deployments' },
    { value: 'ci_failure', label: 'CI Failures' },
    { value: 'sync_issue', label: 'Sync Issues' },
    { value: 'health_improvement', label: 'Health Changes' }
  ];

  const getEventIcon = (type) => {
    switch (type) {
      case 'deployment':
        return 'Rocket';
      case 'ci_failure':
        return 'XCircle';
      case 'sync_issue':
        return 'AlertTriangle';
      case 'health_improvement':
        return 'TrendingUp';
      default:
        return 'Circle';
    }
  };

  const getEventColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      case 'critical':
        return 'text-error';
      default:
        return 'text-text-secondary';
    }
  };

  const getBorderColor = (severity) => {
    switch (severity) {
      case 'success':
        return 'border-success';
      case 'warning':
        return 'border-warning';
      case 'error':
        return 'border-error';
      case 'critical':
        return 'border-error';
      default:
        return 'border-border-medium';
    }
  };

  const filteredEvents = events?.filter(event => {
    if (selectedEventType !== 'all' && event?.type !== selectedEventType) {
      return false;
    }
    return true;
  });

  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return timestamp?.toLocaleDateString();
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Activity" size={18} className="text-primary" strokeWidth={2} />
          </div>
          <h2 className="text-lg font-semibold text-text-primary font-mono">
            Real-time Status Timeline
          </h2>
        </div>
        <div className="flex items-center space-x-3">
          {/* Time Range Selector */}
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e?.target?.value)}
            className="bg-surface-light border border-border-medium rounded-lg px-3 py-1.5 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {timeRanges?.map(range => (
              <option key={range?.value} value={range?.value}>
                {range?.label}
              </option>
            ))}
          </select>

          {/* Event Type Filter */}
          <select
            value={selectedEventType}
            onChange={(e) => setSelectedEventType(e?.target?.value)}
            className="bg-surface-light border border-border-medium rounded-lg px-3 py-1.5 text-text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {eventTypes?.map(type => (
              <option key={type?.value} value={type?.value}>
                {type?.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Timeline Events */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredEvents?.length > 0 ? (
          filteredEvents?.map((event, index) => (
            <div key={event?.id} className="flex items-start space-x-4">
              {/* Timeline Line */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full border-2 ${getBorderColor(event?.severity)} bg-surface flex items-center justify-center`}>
                  <Icon 
                    name={getEventIcon(event?.type)} 
                    size={14} 
                    className={getEventColor(event?.severity)} 
                    strokeWidth={2}
                  />
                </div>
                {index < filteredEvents?.length - 1 && (
                  <div className="w-0.5 h-8 bg-border-medium mt-2" />
                )}
              </div>

              {/* Event Content */}
              <div className="flex-1 pb-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-text-primary font-mono">
                      {event?.repository}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                      event?.severity === 'success' ? 'bg-success/10 text-success' :
                      event?.severity === 'warning' ? 'bg-warning/10 text-warning' :
                      event?.severity === 'error'? 'bg-error/10 text-error' : 'bg-surface-light text-text-secondary'
                    }`}>
                      {event?.type?.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary font-mono">
                    {formatTime(event?.timestamp)}
                  </span>
                </div>
                <p className="text-sm text-text-secondary font-mono">
                  {event?.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <Icon name="Clock" size={48} className="text-text-secondary mx-auto mb-4" strokeWidth={1} />
            <p className="text-text-secondary font-mono">No events found for the selected filters</p>
          </div>
        )}
      </div>
      {/* Timeline Controls */}
      <div className="flex items-center justify-between pt-4 border-t border-border-medium mt-4">
        <div className="flex items-center space-x-2 text-sm text-text-secondary font-mono">
          <Icon name="Zap" size={14} strokeWidth={2} />
          <span>Real-time updates enabled</span>
        </div>
        <button className="flex items-center space-x-2 px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-smooth font-mono text-sm">
          <Icon name="RefreshCw" size={14} strokeWidth={2} />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
};

export default StatusTimeline;