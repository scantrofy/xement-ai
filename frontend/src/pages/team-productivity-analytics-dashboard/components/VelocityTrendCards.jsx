import React from 'react';
import Icon from '../../../components/AppIcon';

const VelocityTrendCards = ({ metrics }) => {
  const cards = [
    {
      key: 'commitsPerDeveloper',
      title: 'Commits per Developer',
      icon: 'GitCommit',
      unit: '/day',
      color: 'primary',
      description: 'Average daily commits across team members'
    },
    {
      key: 'prThroughput',
      title: 'PR Throughput',
      icon: 'GitPullRequest',
      unit: '/week',
      color: 'secondary',
      description: 'Pull requests merged per week'
    },
    {
      key: 'reviewParticipation',
      title: 'Review Participation',
      icon: 'Eye',
      unit: '%',
      color: 'accent',
      description: 'Team members actively reviewing code'
    },
    {
      key: 'deliveryPredictability',
      title: 'Delivery Predictability',
      icon: 'Target',
      unit: '%',
      color: 'success',
      description: 'Sprint goals completed on time'
    }
  ];

  const getColorClasses = (color, trend) => {
    const colors = {
      primary: {
        bg: 'bg-primary/10 dark:bg-sky-900/25',
        border: 'border-primary/20 dark:border-sky-700',
        icon: 'text-primary',
        value: 'text-primary'
      },
      secondary: {
        bg: 'bg-secondary/10 dark:bg-slate-900/25',
        border: 'border-secondary/20 dark:border-slate-700',
        icon: 'text-secondary',
        value: 'text-secondary'
      },
      accent: {
        bg: 'bg-accent/10 dark:bg-violet-900/25',
        border: 'border-accent/20 dark:border-violet-700',
        icon: 'text-accent',
        value: 'text-accent'
      },
      success: {
        bg: 'bg-success/10 dark:bg-emerald-900/25',
        border: 'border-success/20 dark:border-emerald-700',
        icon: 'text-success',
        value: 'text-success'
      }
    };
    return colors?.[color] || colors?.primary;
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up':
        return { icon: 'TrendingUp', color: 'text-success' };
      case 'down':
        return { icon: 'TrendingDown', color: 'text-error' };
      default:
        return { icon: 'Minus', color: 'text-text-secondary' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards?.map((card) => {
        const metric = metrics?.[card?.key];
        const colorClasses = getColorClasses(card?.color, metric?.trend);
        const trendInfo = getTrendIcon(metric?.trend);

        return (
          <div
            key={card?.key}
            className={`bg-surface rounded-lg border ${colorClasses?.border} p-6 hover:shadow-elevated transition-smooth`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${colorClasses?.bg} rounded-lg flex items-center justify-center`}>
                <Icon 
                  name={card?.icon} 
                  size={24} 
                  className={colorClasses?.icon} 
                  strokeWidth={2}
                />
              </div>
              <div className="flex items-center space-x-1">
                <Icon 
                  name={trendInfo?.icon} 
                  size={16} 
                  className={trendInfo?.color} 
                  strokeWidth={2}
                />
                <span className={`text-sm font-mono ${trendInfo?.color}`}>
                  {Math.abs(metric?.change)}%
                </span>
              </div>
            </div>
            {/* Value */}
            <div className="mb-2">
              <div className="flex items-baseline space-x-1">
                <span className={`text-3xl font-bold ${colorClasses?.value} font-mono`}>
                  {metric?.value}
                </span>
                <span className="text-sm text-text-secondary font-mono">
                  {card?.unit}
                </span>
              </div>
            </div>
            {/* Title and Description */}
            <div>
              <h3 className="text-sm font-semibold text-text-primary font-mono mb-1">
                {card?.title}
              </h3>
              <p className="text-xs text-text-secondary font-mono leading-relaxed">
                {card?.description}
              </p>
            </div>
            {/* Period Comparison */}
            <div className="mt-4 pt-4 border-t border-border-medium">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-text-secondary">vs. last period</span>
                <span className={`${trendInfo?.color} font-medium`}>
                  {metric?.trend === 'up' ? '+' : metric?.trend === 'down' ? '-' : ''}
                  {Math.abs(metric?.change)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VelocityTrendCards;