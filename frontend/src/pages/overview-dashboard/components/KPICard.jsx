import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ title, value, unit, icon, thresholds, inverse = false }) => {
  const getThresholdStatus = (val, thresholds, inverse = false) => {
    if (!val || !thresholds) return 'neutral';
    
    if (inverse) {
      // For metrics where lower is better (like emissions)
      if (val <= thresholds?.optimal) return 'optimal';
      if (val <= thresholds?.warning) return 'warning';
      return 'critical';
    } else {
      // For metrics where higher is better
      if (val >= thresholds?.optimal) return 'optimal';
      if (val >= thresholds?.warning) return 'warning';
      return 'critical';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'optimal':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-200 dark:border-green-700',
          text: 'text-green-600 dark:text-green-300',
          icon: 'text-green-500 dark:text-green-300',
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-200 dark:border-yellow-700',
          text: 'text-yellow-600 dark:text-yellow-300',
          icon: 'text-yellow-500 dark:text-yellow-300',
        };
      case 'critical':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-200 dark:border-red-700',
          text: 'text-red-600 dark:text-red-300',
          icon: 'text-red-500 dark:text-red-300',
        };
      default:
        return {
          bg: 'bg-surface',
          border: 'border-border-medium',
          text: 'text-text-secondary',
          icon: 'text-text-secondary',
        };
    }
  };

  const status = getThresholdStatus(value, thresholds, inverse);
  const colors = getStatusColor(status);
  
  const formatValue = (val) => {
    if (typeof val !== 'number') return '--';
    return val?.toLocaleString('en-US', { 
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
  };

  return (
    <div className={`${colors?.bg} ${colors?.border} border rounded-lg p-4 transition-all duration-200 hover:shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <Icon 
          name={icon} 
          size={20} 
          className={colors?.icon}
          strokeWidth={2}
        />
        <div className={`px-2 py-1 rounded text-xs font-mono ${colors?.bg} ${colors?.text} border ${colors?.border}`}>
          {status?.toUpperCase()}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex items-baseline space-x-1">
          <span className="text-2xl font-bold text-text-primary">
            {formatValue(value)}
          </span>
          <span className="text-sm text-text-secondary font-mono">
            {unit}
          </span>
        </div>
        
        <h3 className="text-sm font-medium text-text-secondary leading-tight">
          {title}
        </h3>
      </div>
      {thresholds && (
        <div className="mt-3 pt-3 border-t border-border-light">
          <div className="flex justify-between text-xs text-text-secondary">
            <span>Target: {inverse ? `< ${thresholds?.optimal}` : `≥ ${thresholds?.optimal}`}</span>
            <span>Warning: {inverse ? `< ${thresholds?.warning}` : `≥ ${thresholds?.warning}`}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default KPICard;