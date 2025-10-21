import React, { useState, useEffect } from 'react';
import { useLatestState, KPI_THRESHOLDS } from '../../../api/hooks';
import Icon from '../../../components/AppIcon';

const AlertFeed = () => {
  const [alerts, setAlerts] = useState([]);
  const [alertTimestamps, setAlertTimestamps] = useState(new Map());
  const { data: plantData } = useLatestState();

  useEffect(() => {
    if (plantData) {
      const generatedAlerts = [];
      
      // Check each KPI against thresholds and generate alerts
      Object.entries(KPI_THRESHOLDS).forEach(([key, thresholds]) => {
        const value = plantData[key];
        if (value !== undefined && value !== null) {
          let alertType = null;
          let severity = null;
          
          // For emissions, lower is better (inverse logic)
          if (key === 'emissions') {
            if (value > thresholds.warning) {
              alertType = value > (thresholds.warning + 50) ? 'critical' : 'warning';
              severity = value > (thresholds.warning + 50) ? 'high' : 'medium';
            }
          } else {
            // For other KPIs, higher is better
            if (value < thresholds.warning) {
              alertType = value < (thresholds.warning - 10) ? 'critical' : 'warning';
              severity = value < (thresholds.warning - 10) ? 'high' : 'medium';
            }
          }
          
          if (alertType) {
            const alertKey = `${key}-${alertType}-${severity}`;
            const existingTimestamp = alertTimestamps.get(alertKey);
            
            generatedAlerts.push({
              id: `alert-${key}-${alertType}`,
              type: alertType,
              title: getAlertTitle(key, value, thresholds),
              message: getAlertMessage(key, value, thresholds),
              timestamp: existingTimestamp || getStableTimestamp(alertKey),
              severity,
            });
            
            // Store timestamp for this alert type if it's new
            if (!existingTimestamp) {
              setAlertTimestamps(prev => new Map(prev.set(alertKey, getStableTimestamp(alertKey))));
            }
          }
        }
      });
      
      // Add some positive alerts for good performance
      if (plantData.product_quality >= 95) {
        const alertKey = 'quality-success-info';
        const existingTimestamp = alertTimestamps.get(alertKey);
        
        generatedAlerts.push({
          id: 'success-quality',
          type: 'success',
          title: 'Quality Target Exceeded',
          message: `Product quality at ${plantData.product_quality.toFixed(1)}% - exceeding target`,
          timestamp: existingTimestamp || getStableTimestamp(alertKey),
          severity: 'info',
        });
        
        if (!existingTimestamp) {
          setAlertTimestamps(prev => new Map(prev.set(alertKey, getStableTimestamp(alertKey))));
        }
      }
      
      if (plantData.grinding_efficiency >= 90) {
        const alertKey = 'efficiency-success-info';
        const existingTimestamp = alertTimestamps.get(alertKey);
        
        generatedAlerts.push({
          id: 'success-efficiency',
          type: 'success',
          title: 'Efficiency Target Met',
          message: `Grinding efficiency at ${plantData.grinding_efficiency.toFixed(1)}% - optimal performance`,
          timestamp: existingTimestamp || getStableTimestamp(alertKey),
          severity: 'info',
        });
        
        if (!existingTimestamp) {
          setAlertTimestamps(prev => new Map(prev.set(alertKey, getStableTimestamp(alertKey))));
        }
      }
      
      const finalAlerts = generatedAlerts.slice(0, 5);
      setAlerts(finalAlerts);
      
      // Clean up timestamps for alerts that are no longer active
      cleanupTimestamps(finalAlerts);
    }
  }, [plantData]);

  const getAlertTitle = (kpi, value, thresholds) => {
    const titles = {
      energy_use: value > thresholds.optimal ? 'Energy Consumption High' : 'Energy Efficiency Low',
      grinding_efficiency: 'Grinding Efficiency Below Target',
      kiln_temp: value < thresholds.warning ? 'Kiln Temperature Low' : 'Kiln Temperature High',
      emissions: 'CO₂ Emissions Above Limit',
      product_quality: 'Product Quality Below Standard',
      production_volume: 'Production Volume Low',
    };
    return titles[kpi] || 'System Alert';
  };

  const getAlertMessage = (kpi, value, thresholds) => {
    const messages = {
      energy_use: `Energy usage at ${value.toFixed(1)} kWh/ton, ${((value - thresholds.optimal) / thresholds.optimal * 100).toFixed(1)}% above optimal`,
      grinding_efficiency: `Grinding efficiency at ${value.toFixed(1)}%, below ${thresholds.warning}% threshold`,
      kiln_temp: `Kiln temperature at ${value.toFixed(0)}°C, outside optimal range`,
      emissions: `CO₂ emissions at ${value.toFixed(1)} kg/ton, exceeding ${thresholds.warning} kg/ton limit`,
      product_quality: `Product quality at ${value.toFixed(1)}%, below ${thresholds.warning}% standard`,
      production_volume: `Production volume at ${value.toFixed(1)} tons/hr, below ${thresholds.warning} tons/hr target`,
    };
    return messages[kpi] || 'Parameter outside normal range';
  };


  const getStableTimestamp = (alertKey) => {
    // Generate a stable timestamp based on the alert key
    // This ensures the same alert type always gets the same relative timestamp
    const hash = alertKey.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const minutes = Math.abs(hash % 30) + 1;
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  };

  // Clean up timestamps for alerts that are no longer active
  const cleanupTimestamps = (currentAlerts) => {
    const activeAlertKeys = new Set(currentAlerts.map(alert => {
      if (alert.type === 'success') {
        return alert.id.includes('quality') ? 'quality-success-info' : 'efficiency-success-info';
      }
      // Use alert ID to determine the key since we removed location
      const kpiName = alert.id.replace('alert-', '').replace('-warning', '').replace('-critical', '');
      return `${kpiName}-${alert.type}-${alert.severity}`;
    }));
    
    setAlertTimestamps(prev => {
      const newMap = new Map();
      for (const [key, value] of prev) {
        if (activeAlertKeys.has(key)) {
          newMap.set(key, value);
        }
      }
      return newMap;
    });
  };

  const getAlertConfig = (type) => {
    const configs = {
      critical: {
        bg: 'bg-surface-light',
        border: 'border-border-light',
        icon: 'AlertTriangle',
        iconColor: 'text-red-500',
        titleColor: 'text-red-500',
      },
      warning: {
        bg: 'bg-surface-light',
        border: 'border-border-light',
        icon: 'AlertCircle',
        iconColor: 'text-yellow-500',
        titleColor: 'text-yellow-500',
      },
      info: {
        bg: 'bg-surface-light',
        border: 'border-border-light',
        icon: 'Info',
        iconColor: 'text-blue-500',
        titleColor: 'text-blue-500',
      },
      success: {
        bg: 'bg-surface-light',
        border: 'border-border-light',
        icon: 'CheckCircle',
        iconColor: 'text-green-500',
        titleColor: 'text-green-500',
      },
    };
    return configs?.[type] || configs?.info;
  };

  return (
    <div className="bg-surface rounded-lg border border-border-medium p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Real-time Alerts</h2>
          <p className="text-text-secondary text-sm mt-1">
            Threshold violations and system notifications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-text-secondary">Live Feed</span>
        </div>
      </div>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts?.map((alert) => {
          const config = getAlertConfig(alert?.type);
          
          return (
            <div
              key={alert?.id}
              className={`${config?.bg} ${config?.border} border rounded-lg p-4 transition-all duration-200 hover:shadow-sm`}
            >
              <div className="flex items-start space-x-3">
                <Icon 
                  name={config?.icon} 
                  size={16} 
                  className={config?.iconColor}
                  strokeWidth={2}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`font-medium text-sm ${config?.titleColor} leading-tight`}>
                      {alert?.title}
                    </h3>
                    <div className="flex flex-col items-end space-y-1 flex-shrink-0 ml-3">
                      <span className="text-xs text-text-secondary font-mono">
                        {alert?.timestamp}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-mono rounded-full border bg-surface-light ${
                        alert?.severity === 'high' ? 'text-red-500 border-red-200 dark:border-red-700' :
                        alert?.severity === 'medium' ? 'text-yellow-500 border-yellow-200 dark:border-yellow-700' :
                        alert?.severity === 'low'? 'text-blue-500 border-blue-200 dark:border-blue-700' : 'text-green-500 border-green-200 dark:border-green-700'
                      }`}>
                        {alert?.severity}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-text-secondary text-xs leading-relaxed">
                    {alert?.message}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {/* Alert Summary */}
      <div className="mt-4 pt-4 border-t border-border-light">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Alert Summary</span>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-red-600 text-xs">{alerts.filter(a => a.type === 'critical').length} Critical</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-yellow-600 text-xs">{alerts.filter(a => a.type === 'warning').length} Warning</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-green-600 text-xs">{alerts.filter(a => a.type === 'success').length} Good</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertFeed;