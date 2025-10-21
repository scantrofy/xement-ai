import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsStrip = ({ metrics }) => {
  const metricCards = [
    {
      title: 'Total PRs',
      value: metrics?.totalPRs || 0,
      icon: 'GitPullRequest',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      trend: '+12%',
      trendDirection: 'up'
    },
    {
      title: 'Avg Review Time',
      value: `${metrics?.avgReviewTime?.toFixed(1) || 0}h`,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20',
      trend: '-8%',
      trendDirection: 'down'
    },
    {
      title: 'Merge Success Rate',
      value: `${metrics?.mergeSuccessRate?.toFixed(1) || 0}%`,
      icon: 'GitMerge',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20',
      trend: '+5%',
      trendDirection: 'up'
    },
    {
      title: 'Active Reviewers',
      value: metrics?.totalReviewers || 0,
      icon: 'Users',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10',
      borderColor: 'border-secondary/20',
      trend: '+2',
      trendDirection: 'up'
    },
    {
      title: 'Conflict Resolution',
      value: `${metrics?.avgConflictTime || 0}h`,
      icon: 'AlertTriangle',
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/20',
      trend: '-15%',
      trendDirection: 'down'
    },
    {
      title: 'Approval Velocity',
      value: `${metrics?.approvalVelocity || 0}d`,
      icon: 'CheckCircle',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20',
      trend: '+3%',
      trendDirection: 'up'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {metricCards?.map((metric, index) => (
        <div
          key={index}
          className={`bg-surface rounded-lg border ${metric?.borderColor} p-6 hover:shadow-elevated transition-smooth min-w-0 overflow-hidden h-32 flex flex-col justify-between`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 ${metric?.bgColor} rounded-lg flex items-center justify-center flex-shrink-0`}>
              <Icon 
                name={metric?.icon} 
                size={20} 
                className={metric?.color}
                strokeWidth={2}
              />
            </div>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Icon 
                name={metric?.trendDirection === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                size={14} 
                className={metric?.trendDirection === 'up' ? 'text-success' : 'text-error'}
                strokeWidth={2}
              />
              <span className={`text-xs font-mono ${metric?.trendDirection === 'up' ? 'text-success' : 'text-error'} whitespace-nowrap`}>
                {metric?.trend}
              </span>
            </div>
          </div>
          
          <div className="space-y-1 min-w-0 flex-1 flex flex-col justify-end">
            <h3 className="text-2xl font-bold text-text-primary font-mono truncate">
              {metric?.value}
            </h3>
            <p className="text-sm text-text-secondary font-mono line-clamp-1" title={metric?.title}>
              {metric?.title}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsStrip;