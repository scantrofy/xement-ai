import React, { useState, useEffect, useMemo } from 'react';
import { useRecentAlerts, useCheckAnomalies, useAcknowledgeAlert } from '../../api/hooks';
import Icon from '../../components/AppIcon';

const AlertsAnomaliesMonitor = () => {
  const [severityFilter, setSeverityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('24h');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);
  
  // Fetch alerts from Firestore (polls every 10 minutes)
  const { data: firestoreAlerts = [], isLoading, refetch: refetchAlerts } = useRecentAlerts({
    limit: 100,
    refetchInterval: 600000 // 10 minutes (600,000 ms)
  });
  
  const checkAnomaliesMutation = useCheckAnomalies();
  const acknowledgeAlertMutation = useAcknowledgeAlert();

  // Load last checked timestamp and run check on mount
  useEffect(() => {
    const lastCheckTime = localStorage.getItem('lastAnomalyCheckTime');
    const now = Date.now();
    const fiveMinutes = 5 * 60 * 1000;
    
    if (lastCheckTime) {
      const timestamp = new Date(parseInt(lastCheckTime));
      const timeSinceLastCheck = now - timestamp.getTime();
      
      // If last check was within 5 minutes, just load the timestamp
      if (timeSinceLastCheck < fiveMinutes) {
        setLastChecked(timestamp);
        console.log('✓ Recent check found, skipping immediate check');
      } else {
        // Last check was > 5 minutes ago, run a new check
        console.log('🔍 Running anomaly check on page load...');
        loadAlertsFromCycle();
      }
    } else {
      // No previous check, run initial check
      console.log('🔍 Running initial anomaly check...');
      loadAlertsFromCycle();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update last checked when new alerts arrive
  useEffect(() => {
    if (firestoreAlerts.length > 0) {
      const lastCheckTime = localStorage.getItem('lastAnomalyCheckTime');
      if (lastCheckTime) {
        setLastChecked(new Date(parseInt(lastCheckTime)));
      }
    }
  }, [firestoreAlerts]);

  const loadAlertsFromCycle = async () => {
    try {
      const result = await checkAnomaliesMutation.mutateAsync();
      const timestamp = new Date();
      setLastChecked(timestamp);
      localStorage.setItem('lastAnomalyCheckTime', timestamp.getTime().toString());
      
      console.log('✅ Anomaly check completed:', result);
      
      // Wait a moment for Firestore to update, then manually refetch
      setTimeout(async () => {
        console.log('🔄 Refreshing alerts from Firestore...');
        await refetchAlerts();
      }, 2000);
    } catch (error) {
      console.error('Failed to trigger anomaly check:', error);
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

  // Transform Firestore alerts to display format using useMemo
  const filteredAlerts = useMemo(() => {
    const transformedAlerts = firestoreAlerts.map((alert) => {
      // Transform anomalies array into display alerts
      const anomalies = alert.anomalies || [];
      return anomalies.map((anomaly, index) => ({
        id: `${alert.id}-${index}`,
        firestoreDocId: alert.id, // Store the actual Firestore document ID
        type: formatAnomalyName(anomaly),
        equipment: getEquipmentFromAnomaly(anomaly),
        severity: alert.severity || getSeverityFromAnomaly(anomaly),
        message: `${formatAnomalyName(anomaly)} detected in production parameters`,
        timestamp: new Date(alert.timestamp),
        status: alert.acknowledged ? 'resolved' : 'active',
        category: getCategoryFromAnomaly(anomaly),
        details: `AI analysis detected anomalous behavior: ${anomaly}. Immediate attention recommended.`,
        recommendations: getRecommendationsFromAnomaly(anomaly),
        acknowledged: alert.acknowledged || false,
        rawAnomaly: anomaly
      }));
    }).flat();

    let filtered = transformedAlerts;

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

    return filtered?.sort((a, b) => b?.timestamp?.getTime() - a?.timestamp?.getTime());
  }, [firestoreAlerts, severityFilter, categoryFilter, timeFilter]);

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

  const acknowledgeAlert = async (alert) => {
    try {
      // Get user email from localStorage (or use a default)
      const userEmail = localStorage.getItem('userEmail') || 'user@example.com';
      
      // Use the Firestore document ID, not the composite display ID
      const firestoreDocId = alert.firestoreDocId || alert.id;
      
      console.log('🔄 Acknowledging alert:', firestoreDocId);
      
      await acknowledgeAlertMutation.mutateAsync({
        alert_id: firestoreDocId,
        acknowledged_by: userEmail
      });
      
      console.log('✅ Alert acknowledged:', firestoreDocId);
      
      // Close the modal after acknowledging
      setSelectedAlert(null);
      
      // Refetch alerts to update the UI
      await refetchAlerts();
    } catch (error) {
      console.error('❌ Failed to acknowledge alert:', error);
      alert('Failed to acknowledge alert. Please try again.');
    }
  };

  const criticalAlerts = filteredAlerts?.filter(alert => alert?.severity === 'critical' && alert?.status === 'active');
  const activeAlerts = filteredAlerts?.filter(alert => alert?.status === 'active');
  const hasAnomalies = filteredAlerts?.length > 0;
  // Only consider it "checked" if we have a recent check (within last 15 minutes) or if we have alerts
  const hasChecked = lastChecked !== null && (
    hasAnomalies || 
    (Date.now() - lastChecked.getTime()) < 15 * 60 * 1000
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 mt-6">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Alerts & Anomalies Monitor</h1>
          <p className="text-text-secondary">
            Real-time monitoring and anomaly detection for cement production operations
          </p>
        </div>

        {/* Alert Status Banner */}
        <div className={`mb-8 p-6 rounded-lg border-l-4 ${
          !hasChecked
            ? 'bg-blue-50 dark:bg-blue-900/15 border-blue-500'
            : hasAnomalies
              ? criticalAlerts?.length > 0
                ? 'bg-red-50 dark:bg-red-900/15 border-red-500'
                : 'bg-yellow-50 dark:bg-yellow-900/15 border-yellow-500'
              : 'bg-green-50 dark:bg-green-900/15 border-green-500'
        }`}>
          <div className="flex items-center mb-4">
            <Icon 
              name={
                !hasChecked 
                  ? "Info" 
                  : hasAnomalies 
                    ? (criticalAlerts?.length > 0 ? "AlertTriangle" : "AlertCircle") 
                    : "CheckCircle"
              } 
              size={24} 
              className={`mr-2 ${
                !hasChecked
                  ? 'text-blue-600'
                  : hasAnomalies
                    ? criticalAlerts?.length > 0
                      ? 'text-red-600'
                      : 'text-yellow-600'
                    : 'text-green-600'
              }`} 
            />
            <h2 className={`text-xl font-bold ${
              !hasChecked
                ? 'text-blue-900 dark:text-blue-300'
                : hasAnomalies
                  ? criticalAlerts?.length > 0
                    ? 'text-red-900 dark:text-red-300'
                    : 'text-yellow-900 dark:text-yellow-300'
                  : 'text-green-900 dark:text-green-300'
            }`}>
              {!hasChecked
                ? 'Monitoring Active - Auto-check every 10 minutes'
                : hasAnomalies
                  ? criticalAlerts?.length > 0
                    ? 'Critical Alerts - Immediate Attention Required'
                    : 'Warning - Anomalies Detected'
                  : 'All Systems Normal - No Anomalies Detected'
              }
            </h2>
          </div>
          
          {hasAnomalies && activeAlerts?.length > 0 ? (
            <div>
              <p className={`text-sm mb-4 ${
                criticalAlerts?.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'
              }`}>
                {activeAlerts.length} active anomal{activeAlerts.length === 1 ? 'y' : 'ies'} detected in the production system
              </p>
            </div>
          ) : !hasChecked ? (
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Automatic anomaly detection is running every 10 minutes. Click "Check Anomalies" to run an immediate check.
            </p>
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

            {/* Last Checked Indicator */}
            {lastChecked && (
              <div className="text-sm text-text-secondary flex items-center gap-2">
                <Icon name="Clock" size={16} />
                <span>
                  Last checked: {lastChecked.toLocaleTimeString()}
                </span>
              </div>
            )}

            {/* Check Anomalies Button */}
            <button
              onClick={handleCheckAnomalies}
              disabled={checkAnomaliesMutation?.isPending}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {checkAnomaliesMutation?.isPending ? (
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
            
            {isLoading ? (
              <div className="bg-surface rounded-lg shadow-sm border border-border-light p-12 text-center">
                <Icon name="Loader2" size={48} className="text-primary mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-medium text-text-primary mb-2">Loading Alerts...</h3>
                <p className="text-text-secondary">Fetching recent anomaly data from the system.</p>
              </div>
            ) : filteredAlerts?.length === 0 ? (
              <div className="bg-surface rounded-lg shadow-sm border border-border-light p-12 text-center">
                {!hasChecked ? (
                  <>
                    <Icon name="Activity" size={48} className="text-blue-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">Auto-Check Active</h3>
                    <p className="text-text-secondary">System automatically checks for anomalies every 10 minutes. Click "Check Anomalies" for an immediate check.</p>
                  </>
                ) : (
                  <>
                    <Icon name="CheckCircle" size={48} className="text-success-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">✅ No Anomalies Detected</h3>
                    <p className="text-text-secondary">All systems are operating within normal parameters.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[calc(100vh-400px)] overflow-y-auto pr-2 scrollbar-thin">
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
              <div className="bg-surface rounded-lg shadow-sm border border-border-light p-6 space-y-6 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin">
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
                      onClick={() => acknowledgeAlert(selectedAlert)}
                      disabled={acknowledgeAlertMutation.isPending}
                      className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                    >
                      {acknowledgeAlertMutation.isPending ? (
                        <>
                          <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                          Acknowledging...
                        </>
                      ) : (
                        <>
                          <Icon name="Check" size={16} className="mr-2" />
                          Acknowledge Alert
                        </>
                      )}
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