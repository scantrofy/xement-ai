import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICards = () => {
  const kpiData = [
    {
      id: 'active-prs',
      title: 'Active Pull Requests',
      value: 24,
      change: '+3',
      changeType: 'increase',
      icon: 'GitPullRequest',
      color: 'primary',
      breakdown: [
        { label: 'Open', value: 18, color: 'warning' },
        { label: 'In Review', value: 4, color: 'secondary' },
        { label: 'Approved', value: 2, color: 'success' }
      ],
      sparklineData: [12, 15, 18, 22, 19, 24, 24]
    },
    {
      id: 'daily-commits',
      title: 'Daily Commit Velocity',
      value: 47,
      change: '+12%',
      changeType: 'increase',
      icon: 'GitCommit',
      color: 'success',
      breakdown: [
        { label: 'Frontend', value: 18, color: 'primary' },
        { label: 'Backend', value: 21, color: 'secondary' },
        { label: 'DevOps', value: 8, color: 'accent' }
      ],
      sparklineData: [32, 38, 42, 45, 41, 47, 47]
    },
    {
      id: 'pr-cycle-time',
      title: 'Avg PR Cycle Time',
      value: '2.3d',
      change: '-0.5d',
      changeType: 'decrease',
      icon: 'Clock',
      color: 'secondary',
      breakdown: [
        { label: 'Review Time', value: '1.2d', color: 'warning' },
        { label: 'Approval Time', value: '0.8d', color: 'success' },
        { label: 'Merge Time', value: '0.3d', color: 'primary' }
      ],
      sparklineData: [3.2, 2.8, 2.5, 2.7, 2.4, 2.3, 2.3],
      target: '2.0d'
    },
    {
      id: 'repo-health',
      title: 'Repository Health Score',
      value: '87%',
      change: '+5%',
      changeType: 'increase',
      icon: 'Activity',
      color: 'success',
      breakdown: [
        { label: 'Code Quality', value: '92%', color: 'success' },
        { label: 'Test Coverage', value: '85%', color: 'warning' },
        { label: 'Documentation', value: '84%', color: 'warning' }
      ],
      sparklineData: [78, 82, 85, 83, 86, 87, 87],
      target: '90%'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      primary: 'text-primary bg-primary/10 border-primary/20',
      success: 'text-success bg-success/10 border-success/20',
      warning: 'text-warning bg-warning/10 border-warning/20',
      secondary: 'text-secondary bg-secondary/10 border-secondary/20',
      accent: 'text-accent bg-accent/10 border-accent/20',
      error: 'text-error bg-error/10 border-error/20'
    };
    return colorMap?.[color] || colorMap?.primary;
  };

  const renderSparkline = (data, color) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    
    return (
      <div className="flex items-end space-x-1 h-8">
        {data?.map((value, index) => {
          const height = ((value - min) / range) * 100;
          return (
            <div
              key={index}
              className={`w-1 bg-${color} rounded-sm opacity-70`}
              style={{ height: `${Math.max(height, 10)}%` }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      {kpiData?.map((kpi) => (
        <div
          key={kpi?.id}
          className="bg-surface border border-border-medium rounded-lg p-6 hover:border-primary/30 transition-smooth cursor-pointer group"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(kpi?.color)}`}>
                <Icon name={kpi?.icon} size={20} strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-sm font-medium text-text-secondary font-mono">
                  {kpi?.title}
                </h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-2xl font-bold text-text-primary font-mono">
                    {kpi?.value}
                  </span>
                  <span className={`text-sm font-mono px-2 py-1 rounded ${
                    kpi?.changeType === 'increase' ?'text-success bg-success/10' :'text-success bg-success/10'
                  }`}>
                    {kpi?.change}
                  </span>
                </div>
              </div>
            </div>
            <Icon name="TrendingUp" size={16} className="text-text-secondary group-hover:text-primary transition-smooth" strokeWidth={2} />
          </div>

          {/* Target Comparison (if available) */}
          {kpi?.target && (
            <div className="mb-4 p-3 bg-background rounded-lg border border-border-light">
              <div className="flex items-center justify-between text-sm font-mono">
                <span className="text-text-secondary">Target:</span>
                <span className="text-text-primary">{kpi?.target}</span>
              </div>
              <div className="mt-2 w-full bg-surface-light rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-${kpi?.color}`}
                  style={{ 
                    width: kpi?.id === 'pr-cycle-time' 
                      ? `${Math.min((2.0 / 2.3) * 100, 100)}%`
                      : `${Math.min((87 / 90) * 100, 100)}%`
                  }}
                />
              </div>
            </div>
          )}

          {/* Breakdown */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-text-secondary font-mono mb-2 uppercase tracking-wide">
              Breakdown
            </h4>
            <div className="space-y-2">
              {kpi?.breakdown?.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full bg-${item?.color}`} />
                    <span className="text-xs text-text-secondary font-mono">{item?.label}</span>
                  </div>
                  <span className="text-xs text-text-primary font-mono font-medium">
                    {item?.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Sparkline */}
          <div className="border-t border-border-light pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-text-secondary font-mono">7-day trend</span>
              <Icon name="BarChart3" size={12} className="text-text-secondary" strokeWidth={2} />
            </div>
            {renderSparkline(kpi?.sparklineData, kpi?.color)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KPICards;