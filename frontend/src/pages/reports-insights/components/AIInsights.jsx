import React from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle, Lightbulb } from 'lucide-react';

const AIInsights = ({ insights }) => {
  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'decreasing':
        return <TrendingDown className="w-5 h-5 text-green-500" />;
      default:
        return <Minus className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Summary */}
      <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary rounded-lg">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              AI-Generated Summary
            </h3>
            <p className="text-text-secondary leading-relaxed">
              {insights.summary}
            </p>
          </div>
        </div>
      </div>

      {/* Key Findings */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-primary" />
          Key Findings
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {insights.keyFindings.map((finding, index) => {
            const Icon = finding.icon;
            return (
              <div
                key={index}
                className="bg-background border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${finding.trend === 'positive' ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Icon className={`w-5 h-5 ${finding.trend === 'positive' ? 'text-green-600' : 'text-red-600'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-secondary mb-1">
                      {finding.title}
                    </p>
                    <p className="text-2xl font-bold text-text-primary mb-1">
                      {finding.value}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {finding.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Energy Trend Analysis */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Energy Trend Analysis
        </h3>
        <div className="flex items-center gap-3 p-4 bg-background rounded-lg border border-border">
          {getTrendIcon(insights.energyTrend)}
          <div>
            <p className="font-medium text-text-primary">
              Energy consumption is{' '}
              <span className={`font-bold ${
                insights.energyTrend === 'decreasing' ? 'text-green-600' :
                insights.energyTrend === 'increasing' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {insights.energyTrend}
              </span>
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {insights.energyTrend === 'decreasing' && 'Excellent progress! Continue current optimization strategies.'}
              {insights.energyTrend === 'increasing' && 'Action needed. Review recent parameter changes and equipment performance.'}
              {insights.energyTrend === 'stable' && 'Maintaining consistent performance. Look for new optimization opportunities.'}
            </p>
          </div>
        </div>
        
        {insights.peakHours && insights.peakHours.length > 0 && (
          <div className="mt-4 p-4 bg-background rounded-lg border border-border">
            <p className="text-sm font-medium text-text-secondary mb-2">Peak Energy Hours:</p>
            <div className="flex gap-2">
              {insights.peakHours.map((hour, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium border border-orange-300"
                >
                  {hour}:00
                </span>
              ))}
            </div>
            <p className="text-xs text-text-secondary mt-2">
              Consider load balancing or scheduling non-critical operations outside these hours.
            </p>
          </div>
        )}
      </div>

      {/* AI Recommendations */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" />
          AI-Powered Recommendations
        </h3>
        <div className="space-y-3">
          {insights.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`border-l-4 ${getPriorityColor(rec.priority)} rounded-lg p-4`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-bold text-text-primary">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityBadge(rec.priority)}`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-text-secondary mb-2">
                    {rec.description}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-primary">
                      Expected Impact:
                    </span>
                    <span className="text-xs text-text-secondary">
                      {rec.impact}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsights;
