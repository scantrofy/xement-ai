import React from 'react';
import { CheckCircle, TrendingDown, Zap, Settings } from 'lucide-react';

const OptimizationsTable = ({ data, totalOptimizations }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-bold text-text-primary mb-4">Applied Optimizations</h3>
        <p className="text-text-secondary">No optimization data available</p>
      </div>
    );
  }

  const optimizations = [];
  
  data.forEach((item, index) => {
    if (index > 0) {
      const prevItem = data[index - 1];
      const energyDiff = prevItem.energy_use - item.energy_use;
      
      if (energyDiff > 2) {
        optimizations.push({
          timestamp: new Date(item.timestamp).toLocaleString(),
          type: 'Energy Optimization',
          parameter: 'Energy Use',
          improvement: `${energyDiff.toFixed(2)} kWh/ton`,
          impact: 'High',
          icon: Zap,
          color: 'text-blue-500',
        });
      }

      const efficiencyDiff = item.grinding_efficiency - prevItem.grinding_efficiency;
      if (efficiencyDiff > 1.5) {
        optimizations.push({
          timestamp: new Date(item.timestamp).toLocaleString(),
          type: 'Efficiency Boost',
          parameter: 'Grinding Efficiency',
          improvement: `+${efficiencyDiff.toFixed(2)}%`,
          impact: 'Medium',
          icon: Settings,
          color: 'text-purple-500',
        });
      }

      const emissionsDiff = prevItem.emissions - item.emissions;
      if (emissionsDiff > 10) {
        optimizations.push({
          timestamp: new Date(item.timestamp).toLocaleString(),
          type: 'Emissions Reduction',
          parameter: 'CO₂ Emissions',
          improvement: `${emissionsDiff.toFixed(2)} kg/ton`,
          impact: 'High',
          icon: TrendingDown,
          color: 'text-green-500',
        });
      }
    }
  });

  const recentOptimizations = optimizations.slice(0, 10);

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-primary" />
          Applied Optimizations
        </h3>
        <div className="px-4 py-2 bg-primary-50 border border-primary-200 rounded-lg">
          <span className="text-sm font-medium text-primary">
            Total: {totalOptimizations} optimizations
          </span>
        </div>
      </div>

      {recentOptimizations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Parameter</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Improvement</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Impact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentOptimizations.map((opt, index) => {
                const Icon = opt.icon;
                return (
                  <tr key={index} className="border-b border-border hover:bg-background transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-4 h-4 ${opt.color}`} />
                        <span className="text-sm font-medium text-text-primary">{opt.type}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-text-secondary">{opt.parameter}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-medium text-green-600">{opt.improvement}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactBadge(opt.impact)}`}>
                        {opt.impact}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs text-text-secondary font-mono">{opt.timestamp}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-text-secondary">No significant optimizations detected in this period</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-500" />
            <p className="text-sm text-text-secondary">Energy Optimizations</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {recentOptimizations.filter(o => o.type === 'Energy Optimization').length}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-purple-500" />
            <p className="text-sm text-text-secondary">Efficiency Boosts</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {recentOptimizations.filter(o => o.type === 'Efficiency Boost').length}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-green-500" />
            <p className="text-sm text-text-secondary">Emissions Reductions</p>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {recentOptimizations.filter(o => o.type === 'Emissions Reduction').length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default OptimizationsTable;
