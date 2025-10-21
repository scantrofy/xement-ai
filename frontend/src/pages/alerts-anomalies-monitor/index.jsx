import React, { useState, useEffect } from 'react';
import { useRunCycle } from '../../api/hooks';
import Icon from '../../components/AppIcon';

const AlertsAnomaliesMonitor = () => {
  const [alerts, setAlerts] = useState([]);
  const [filteredAlerts, setFilteredAlerts] = useState([]);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [anomalyData, setAnomalyData] = useState(null);
  const runCycleMutation = useRunCycle();

  // Load alerts from API on component mount
  useEffect(() => {
    loadAlertsFromCycle();
  }, []);

  const loadAlertsFromCycle = async () => {
    try {
      const result = await runCycleMutation?.mutateAsync();
      setAnomalyData(result?.anomaly);
      
      // Transform anomalies into alerts using the correct API structure
      if (result?.anomaly?.anomaly_flag && result?.anomaly?.anomalies?.length > 0) {
        const transformedAlerts = result.anomaly.anomalies.map((anomaly, index) => ({
          id: Date.now() + index,
          type: formatAnomalyName(anomaly),
          equipment: getEquipmentFromAnomaly(anomaly),
          severity: getSeverityFromAnomaly(anomaly),
          message: `${formatAnomalyName(anomaly)} detected in production parameters`,
          timestamp: new Date(),
          status: 'active',
          category: getCategoryFromAnomaly(anomaly),
          details: `AI analysis detected anomalous behavior: ${anomaly}. Immediate attention recommended.`,
          recommendations: getRecommendationsFromAnomaly(anomaly),
          acknowledged: false,
          rawAnomaly: anomaly
        }));
        setAlerts(transformedAlerts);
      } else {
        // No anomalies detected
        setAlerts([]);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
      setAlerts([]);
      setAnomalyData(null);
    }
  };

  // Helper functions to transform anomaly data
  const formatAnomalyName = (anomaly) => {
    return anomaly
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace(/([A-Z])/g, ' $1')
      .trim();
  };

  const getEquipmentFromAnomaly = (anomaly) => {
    const equipmentMap = {
      'kiln_temp': 'Kiln Unit 1',
      'grinding_efficiency': 'Ball Mill 2', 
      'low_grinding_efficiency': 'Ball Mill 2',
      'high_kiln_temp': 'Kiln Unit 1',
      'emissions': 'Stack Monitor',
      'vibration': 'Cement Mill 1',
      'quality': 'Quality Lab',
      'energy': 'Power Distribution',
      'fan_speed': 'Ventilation System'
    };
    const key = Object.keys(equipmentMap).find(k => anomaly.toLowerCase().includes(k));
    return equipmentMap[key] || 'Production Line';
  };

  const getSeverityFromAnomaly = (anomaly) => {
    const anomalyLower = anomaly.toLowerCase();
    
    // Critical anomalies
    if (anomalyLower.includes('critical') || 
        anomalyLower.includes('high_kiln_temp') ||
        anomalyLower.includes('emergency')) {
      return 'critical';
    }
    
    // High severity anomalies
    if (anomalyLower.includes('high') || 
        anomalyLower.includes('emission') ||
        anomalyLower.includes('temperature') && anomalyLower.includes('high')) {
      return 'high';
    }
    
    // Warning level anomalies
    if (anomalyLower.includes('low') || 
        anomalyLower.includes('efficiency') ||
        anomalyLower.includes('warning')) {
      return 'warning';
    }
    
    return 'info';
  };

  const getCategoryFromAnomaly = (anomaly) => {
    const anomalyLower = anomaly.toLowerCase();
    
    if (anomalyLower.includes('temp') || anomalyLower.includes('kiln')) return 'temperature';
    if (anomalyLower.includes('efficiency') || anomalyLower.includes('grinding')) return 'efficiency';
    if (anomalyLower.includes('emission') || anomalyLower.includes('co2')) return 'emissions';
    if (anomalyLower.includes('vibration') || anomalyLower.includes('mechanical')) return 'mechanical';
    if (anomalyLower.includes('quality') || anomalyLower.includes('grade')) return 'quality';
    if (anomalyLower.includes('energy') || anomalyLower.includes('power')) return 'energy';
    if (anomalyLower.includes('fan') || anomalyLower.includes('speed')) return 'ventilation';
    
    return 'system';
  };

  const getRecommendationsFromAnomaly = (anomaly) => {
    const anomalyLower = anomaly.toLowerCase();
    
    if (anomalyLower.includes('high_kiln_temp')) {
      return [
        'Reduce kiln temperature setpoint immediately',
        'Check fuel feed rate and adjust if necessary', 
        'Verify air flow systems are functioning properly',
        'Monitor clinker quality during adjustment'
      ];
    }
    
    if (anomalyLower.includes('low_grinding_efficiency')) {
      return [
        'Inspect ball mill for wear and tear',
        'Check material feed consistency and flow',
        'Review grinding media condition',
        'Optimize mill speed and load parameters'
      ];
    }
    
    if (anomalyLower.includes('efficiency')) {
      return ['Review grinding parameters', 'Check mill condition', 'Optimize material feed'];
    }
    
    if (anomalyLower.includes('temp') || anomalyLower.includes('kiln')) {
      return ['Adjust kiln temperature controls', 'Monitor fuel feed rate', 'Check air flow systems'];
    }
    
    if (anomalyLower.includes('emission')) {
      return ['Calibrate emission controls', 'Review fuel mixture', 'Check environmental systems'];
    }
    
    if (anomalyLower.includes('fan') || anomalyLower.includes('speed')) {
      return ['Check fan motor condition', 'Verify speed control systems', 'Inspect air flow pathways'];
    }
    
    return ['Investigate anomaly source', 'Monitor system parameters closely', 'Contact maintenance team if needed'];
  };

  useEffect(() => {
    let filtered = alerts;

    if (severityFilter !== 'all') {
      filtered = filtered?.filter(alert => alert?.severity === severityFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered?.filter(alert => alert?.category === categoryFilter);
    }

    const now = new Date();
    const timeThresholds = {
      '1h': 1 * 60 * 60 * 1000,
      '6h': 6 * 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000
    };

    if (timeFilter !== 'all') {
      const threshold = timeThresholds?.[timeFilter];
      filtered = filtered?.filter(alert => 
        now?.getTime() - alert?.timestamp?.getTime() <= threshold
      );
    }

    setFilteredAlerts(filtered?.sort((a, b) => b?.timestamp?.getTime() - a?.timestamp?.getTime()));
  }, [alerts, severityFilter, categoryFilter, timeFilter]);

  const handleCheckAnomalies = async () => {
    await loadAlertsFromCycle();
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-100 dark:bg-red-900/25 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700',
      high: 'bg-orange-100 dark:bg-orange-900/25 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-700',
      warning: 'bg-yellow-100 dark:bg-yellow-900/25 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      info: 'bg-blue-100 dark:bg-blue-900/25 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-700'
    };
    return colors?.[severity] || colors?.info;
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: 'AlertTriangle',
      high: 'AlertCircle',
      warning: 'AlertTriangle',
      info: 'Info'
    };
    return icons?.[severity] || 'Info';
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-red-500',
      investigating: 'bg-yellow-500',
      monitoring: 'bg-blue-500',
      resolved: 'bg-green-500'
    };
    return colors?.[status] || colors?.active;
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now?.getTime() - timestamp?.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const acknowledgeAlert = (alertId) => {
    setAlerts(prev => prev?.map(alert => 
      alert?.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  const criticalAlerts = filteredAlerts?.filter(alert => alert?.severity === 'critical' && alert?.status === 'active');
  const activeAlerts = filteredAlerts?.filter(alert => alert?.status === 'active');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Alerts & Anomalies Monitor</h1>
          <p className="text-text-secondary">
            Real-time monitoring and anomaly detection for cement production operations
          </p>
        </div>

        {/* Alert Status Banner */}
        <div className={`mb-8 p-6 rounded-lg border-l-4 ${
          anomalyData?.anomaly_flag
            ? criticalAlerts?.length > 0
              ? 'bg-red-50 dark:bg-red-900/15 border-red-500'
              : 'bg-yellow-50 dark:bg-yellow-900/15 border-yellow-500'
            : 'bg-green-50 dark:bg-green-900/15 border-green-500'
        }`}>
          <div className="flex items-center mb-4">
            <Icon 
              name={anomalyData?.anomaly_flag ? (criticalAlerts?.length > 0 ? "AlertTriangle" : "AlertCircle") : "CheckCircle"} 
              size={24} 
              className={`mr-2 ${
                anomalyData?.anomaly_flag
                  ? criticalAlerts?.length > 0
                    ? 'text-red-600'
                    : 'text-yellow-600'
                  : 'text-green-600'
              }`} 
            />
            <h2 className={`text-xl font-bold ${
              anomalyData?.anomaly_flag
                ? criticalAlerts?.length > 0
                  ? 'text-red-900 dark:text-red-300'
                  : 'text-yellow-900 dark:text-yellow-300'
                : 'text-green-900 dark:text-green-300'
            }`}>
              {anomalyData?.anomaly_flag
                ? criticalAlerts?.length > 0
                  ? 'Critical Alerts - Immediate Attention Required'
                  : 'Warning - Anomalies Detected'
                : 'All Systems Normal - No Anomalies Detected'
              }
            </h2>
          </div>
          
          {anomalyData?.anomaly_flag && anomalyData?.anomalies?.length > 0 ? (
            <div>
              <p className={`text-sm mb-4 ${
                criticalAlerts?.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {anomalyData.anomalies.length} anomal{anomalyData.anomalies.length === 1 ? 'y' : 'ies'} detected in the production system:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {anomalyData.anomalies.map((anomaly, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${
                    getSeverityFromAnomaly(anomaly) === 'critical'
                      ? 'bg-red-100 dark:bg-red-900/25 border-red-200 dark:border-red-700'
                      : 'bg-yellow-100 dark:bg-yellow-900/25 border-yellow-200 dark:border-yellow-700'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        getSeverityFromAnomaly(anomaly) === 'critical' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className={`text-sm font-medium ${
                        getSeverityFromAnomaly(anomaly) === 'critical'
                          ? 'text-red-800 dark:text-red-300'
                          : 'text-yellow-800 dark:text-yellow-300'
                      }`}>
                        {formatAnomalyName(anomaly)}
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${
                      getSeverityFromAnomaly(anomaly) === 'critical'
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {getEquipmentFromAnomaly(anomaly)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-green-700 dark:text-green-300 text-sm">
              All production parameters are operating within normal ranges. System monitoring is active.
            </p>
          )}
        </div>

        {/* Global Controls */}
        <div className="mb-8 bg-surface rounded-lg shadow-sm border border-border-light p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* Severity Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Severity</label>
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e?.target?.value)}
                  className="px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="high">High</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e?.target?.value)}
                  className="px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="temperature">Temperature</option>
                  <option value="efficiency">Efficiency</option>
                  <option value="emissions">Emissions</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="quality">Quality</option>
                  <option value="energy">Energy</option>
                  <option value="ventilation">Ventilation</option>
                  <option value="system">System</option>
                </select>
              </div>

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Time Range</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e?.target?.value)}
                  className="px-3 py-2 border border-border-medium rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-surface text-text-primary"
                >
                  <option value="1h">Last Hour</option>
                  <option value="6h">Last 6 Hours</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="all">All Time</option>
                </select>
              </div>
            </div>

            {/* Check Anomalies Button */}
            <button
              onClick={handleCheckAnomalies}
              disabled={runCycleMutation?.isPending}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {runCycleMutation?.isPending ? (
                <>
                  <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <Icon name="Search" size={18} className="mr-2" />
                  Check Anomalies
                </>
              )}
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Total Alerts</p>
                <p className="text-2xl font-bold text-text-primary">{filteredAlerts?.length}</p>
              </div>
              <Icon name="Bell" size={24} className="text-text-tertiary" />
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Alerts</p>
                <p className="text-2xl font-bold text-error-600">{activeAlerts?.length}</p>
              </div>
              <Icon name="AlertTriangle" size={24} className="text-error-400" />
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Critical</p>
                <p className="text-2xl font-bold text-error-700">{criticalAlerts?.length}</p>
              </div>
              <Icon name="AlertCircle" size={24} className="text-error-400" />
            </div>
          </div>

          <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Resolved Today</p>
                <p className="text-2xl font-bold text-success-600">
                  {filteredAlerts?.filter(a => a?.status === 'resolved')?.length}
                </p>
              </div>
              <Icon name="CheckCircle" size={24} className="text-success-400" />
            </div>
          </div>
        </div>

        {/* Alerts Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Alert Cards */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-text-primary">Alert Stream</h2>
            
            {filteredAlerts?.length === 0 ? (
              <div className="bg-surface rounded-lg shadow-sm border border-border-light p-12 text-center">
                <Icon name="CheckCircle" size={48} className="text-success-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-text-primary mb-2">✅ No Anomalies Detected</h3>
                <p className="text-text-secondary">All systems are operating within normal parameters.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAlerts?.map(alert => (
                  <div
                    key={alert?.id}
                    className={`bg-surface rounded-lg shadow-sm border border-border-light p-6 cursor-pointer transition-all hover:shadow-md ${
                      selectedAlert?.id === alert?.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-3">
                        <Icon 
                          name={getSeverityIcon(alert?.severity)} 
                          size={20} 
                          className={`mt-1 ${
                            alert?.severity === 'critical' ? 'text-error-600' :
                            alert?.severity === 'high' ? 'text-warning-600' :
                            alert?.severity === 'warning'? 'text-warning-600' : 'text-primary'
                          }`}
                        />
                        <div>
                          <h3 className="font-semibold text-text-primary">{alert?.type}</h3>
                          <p className="text-sm text-text-secondary">{alert?.equipment}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(alert?.severity)}`}>
                          {alert?.severity?.toUpperCase()}
                        </span>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(alert?.status)}`}></div>
                      </div>
                    </div>
                    
                    <p className="text-text-secondary mb-3">{alert?.message}</p>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text-tertiary">{formatTimeAgo(alert?.timestamp)}</span>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          alert?.status === 'active' ? 'bg-error-100 dark:bg-red-900/25 text-error-700 dark:text-red-300' :
                          alert?.status === 'investigating' ? 'bg-warning-100 dark:bg-yellow-900/25 text-warning-700 dark:text-yellow-300' :
                          alert?.status === 'monitoring'? 'bg-primary-100 dark:bg-sky-900/25 text-primary-700 dark:text-sky-300' : 'bg-success-100 dark:bg-green-900/25 text-success-700 dark:text-green-300'
                        }`}>
                          {alert?.status}
                        </span>
                        {!alert?.acknowledged && (
                          <span className="px-2 py-1 rounded-full text-xs bg-warning-100 dark:bg-yellow-900/25 text-warning-700 dark:text-yellow-300">
                            Unacknowledged
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alert Details Sidebar */}
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Alert Details</h2>
            
            {selectedAlert ? (
              <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-text-primary mb-2">{selectedAlert?.type}</h3>
                  <p className="text-sm text-text-secondary">{selectedAlert?.equipment}</p>
                  <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(selectedAlert?.severity)}`}>
                    {selectedAlert?.severity?.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="font-medium text-text-primary mb-2">Details</h4>
                  <p className="text-sm text-text-secondary">{selectedAlert?.details}</p>
                </div>

                <div>
                  <h4 className="font-medium text-text-primary mb-2">Recommendations</h4>
                  <ul className="space-y-1">
                    {selectedAlert?.recommendations?.map((rec, index) => (
                      <li key={index} className="text-sm text-text-secondary flex items-start">
                        <Icon name="ArrowRight" size={12} className="mr-2 mt-1 text-text-tertiary" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border-light">
                  <div className="text-sm text-text-secondary mb-4">
                    <p>Detected: {selectedAlert?.timestamp?.toLocaleString()}</p>
                    <p>Status: <span className="capitalize">{selectedAlert?.status}</span></p>
                  </div>
                  
                  {!selectedAlert?.acknowledged && (
                    <button
                      onClick={() => acknowledgeAlert(selectedAlert?.id)}
                      className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 transition-colors flex items-center justify-center"
                    >
                      <Icon name="Check" size={16} className="mr-2" />
                      Acknowledge Alert
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-surface rounded-lg shadow-sm border border-border-light p-12 text-center">
                <Icon name="MousePointer" size={48} className="text-text-tertiary mx-auto mb-4" />
                <p className="text-text-secondary">Select an alert to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsAnomaliesMonitor;