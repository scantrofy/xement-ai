import React from 'react';
import Icon from '../../../components/AppIcon';

const ImpactMetrics = ({ recommendations }) => {
  const totalImpact = recommendations?.reduce(
    (acc, rec) => ({
      cost_savings: acc?.cost_savings + (rec?.impact?.cost_savings || 0),
      quality_improvement: acc?.quality_improvement + (rec?.impact?.quality_improvement || 0),
      efficiency_gain: acc?.efficiency_gain + (rec?.impact?.efficiency_gain || 0),
    }),
    { cost_savings: 0, quality_improvement: 0, efficiency_gain: 0 }
  );

  const avgComplexity = recommendations?.length > 0 
    ? recommendations?.reduce((acc, rec) => {
        const complexityScore = rec?.timeline?.includes('week') 
          ? (parseInt(rec?.timeline) || 2) * 10 
          : 5;
        return acc + complexityScore;
      }, 0) / recommendations?.length
    : 0;

  const metrics = [
    {
      title: 'Potential Cost Savings',
      value: `$${totalImpact?.cost_savings?.toLocaleString()}`,
      change: '+24.5%',
      trend: 'up',
      icon: 'DollarSign',
      color: 'text-green-600 dark:text-green-300',
      bgColor: 'bg-green-50 dark:bg-green-900/25',
      borderColor: 'border-green-200 dark:border-green-700',
    },
    {
      title: 'Quality Improvements',
      value: `+${totalImpact?.quality_improvement?.toFixed(1)}%`,
      change: '+12.3%',
      trend: 'up',
      icon: 'Award',
      color: 'text-blue-600 dark:text-blue-300',
      bgColor: 'bg-blue-50 dark:bg-blue-900/25',
      borderColor: 'border-blue-200 dark:border-blue-700',
    },
    {
      title: 'Efficiency Gains',
      value: `+${totalImpact?.efficiency_gain?.toFixed(1)}%`,
      change: '+18.7%',
      trend: 'up',
      icon: 'TrendingUp',
      color: 'text-purple-600 dark:text-purple-300',
      bgColor: 'bg-purple-50 dark:bg-purple-900/25',
      borderColor: 'border-purple-200 dark:border-purple-700',
    },
    {
      title: 'Implementation Complexity',
      value: avgComplexity > 0 ? `${Math.round(avgComplexity)}/100` : 'N/A',
      change: avgComplexity > 30 ? 'High' : avgComplexity > 15 ? 'Medium' : 'Low',
      trend: avgComplexity > 30 ? 'down' : 'up',
      icon: 'Settings',
      color: avgComplexity > 30 ? 'text-red-600 dark:text-red-300' : avgComplexity > 15 ? 'text-yellow-600 dark:text-yellow-300' : 'text-green-600 dark:text-green-300',
      bgColor: avgComplexity > 30 ? 'bg-red-50 dark:bg-red-900/25' : avgComplexity > 15 ? 'bg-yellow-50 dark:bg-yellow-900/25' : 'bg-green-50 dark:bg-green-900/25',
      borderColor: avgComplexity > 30 ? 'border-red-200 dark:border-red-700' : avgComplexity > 15 ? 'border-yellow-200 dark:border-yellow-700' : 'border-green-200 dark:border-green-700',
    },
  ];

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Impact Overview</h2>
          <p className="text-text-secondary text-sm mt-1">
            Projected impact from {recommendations?.length} active recommendations
          </p>
        </div>
        <div className="flex items-center space-x-2 text-green-600 dark:text-green-300 bg-green-50 dark:bg-green-900/25 px-3 py-2 rounded-lg border border-green-200 dark:border-green-700">
          <Icon name="TrendingUp" size={16} strokeWidth={2} />
          <span className="text-sm font-medium">Positive Outlook</span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4">
        {metrics?.map((metric, index) => (
          <div key={index} className={`${metric?.bgColor} ${metric?.borderColor} border rounded-lg p-4 transition-all duration-200 hover:shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <Icon 
                name={metric?.icon} 
                size={20} 
                className={metric?.color}
                strokeWidth={2}
              />
              <div className={`flex items-center space-x-1 text-xs font-mono px-2 py-1 rounded ${
                metric?.trend === 'up' ? 'bg-green-100 dark:bg-green-900/25 text-green-700 dark:text-green-300' : 'bg-yellow-100 dark:bg-yellow-900/25 text-yellow-700 dark:text-yellow-300'
              }`}>
                <Icon 
                  name={metric?.trend === 'up' ? 'ArrowUp' : 'ArrowDown'} 
                  size={12} 
                  strokeWidth={2}
                />
                <span>{metric?.change}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold text-text-primary">
                {metric?.value}
              </div>
              <h3 className="text-sm font-medium text-text-secondary leading-tight">
                {metric?.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
      {/* ROI Summary */}
      <div className="mt-6 pt-6 border-t border-border-light">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-xl font-bold text-text-primary mb-1">
              {recommendations?.length > 0 
                ? Math.round(recommendations?.reduce((acc, rec) => acc + rec?.roi, 0) / recommendations?.length)
                : 0}%
            </div>
            <div className="text-xs text-text-secondary">Average ROI</div>
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary mb-1">
              {recommendations?.filter(r => r?.status === 'pending')?.length}
            </div>
            <div className="text-xs text-text-secondary">Ready to Implement</div>
          </div>
          <div>
            <div className="text-xl font-bold text-text-primary mb-1">
              {recommendations?.length > 0 
                ? Math.round(recommendations?.reduce((acc, rec) => acc + rec?.confidence, 0) / recommendations?.length)
                : 0}%
            </div>
            <div className="text-xs text-text-secondary">Avg Confidence</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactMetrics;