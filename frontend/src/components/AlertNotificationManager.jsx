import React, { useEffect, useRef, useState } from 'react';
import { useRecentAlerts } from '../api/hooks';
import { playAlertSound, requestNotificationPermission, showBrowserNotification } from '../utils/alertSound';
import Icon from './AppIcon';

/**
 * Global Alert Notification Manager
 * - Monitors for new alerts from Firestore (every 10 minutes)
 * - Plays sounds and shows notifications for new alerts
 * - Cloud Scheduler handles anomaly detection every 10 minutes
 */
const AlertNotificationManager = () => {
  const [lastAlertId, setLastAlertId] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const hasInitialized = useRef(false);

  // Poll for alerts every 10 minutes (matches backend check frequency)
  const { data: alerts = [] } = useRecentAlerts({
    limit: 10,
    refetchInterval: 600000 // 10 minutes (600,000 ms)
  });

  // Request notification permission on mount
  useEffect(() => {
    const checkPermission = async () => {
      const granted = await requestNotificationPermission();
      setNotificationPermission(granted);
    };
    checkPermission();
  }, []);

  // Check for new alerts and notify
  useEffect(() => {
    if (!alerts || alerts.length === 0) return;

    // Skip first load to avoid notifying for existing alerts
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      if (alerts.length > 0) {
        setLastAlertId(alerts[0].id);
      }
      return;
    }

    // Check if there's a new alert
    const latestAlert = alerts[0];
    if (latestAlert && latestAlert.id !== lastAlertId) {
      // New alert detected!
      // Play sound if enabled
      if (soundEnabled) {
        playAlertSound(latestAlert.severity);
      }

      // Show browser notification if permission granted
      if (notificationPermission) {
        const anomalyCount = latestAlert.anomalies?.length || 0;
        showBrowserNotification(
          `${latestAlert.severity.toUpperCase()}: Anomaly Detected`,
          `${anomalyCount} anomal${anomalyCount === 1 ? 'y' : 'ies'} detected in production system. Check the Alerts page for details.`,
          latestAlert.severity
        );
      }

      // Update last alert ID
      setLastAlertId(latestAlert.id);
    }
  }, [alerts, lastAlertId, soundEnabled, notificationPermission]);

  // Toggle sound on/off
  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    localStorage.setItem('alertSoundEnabled', (!soundEnabled).toString());
  };

  // Load sound preference from localStorage
  useEffect(() => {
    const savedSoundPreference = localStorage.getItem('alertSoundEnabled');
    if (savedSoundPreference !== null) {
      setSoundEnabled(savedSoundPreference === 'true');
    }
  }, []);

  // Show monitoring indicator
  return (
    <div className="fixed bottom-4 right-4 z-50 bg-surface border border-border-medium rounded-lg shadow-lg p-3 text-xs max-w-xs">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            alerts.length > 0 ? 'bg-green-500' : 'bg-gray-400'
          }`}></div>
          <span className="text-text-primary font-medium">Alert Monitor</span>
        </div>
        <button
          onClick={() => {
            const newExpandedState = !isExpanded;
            setIsExpanded(newExpandedState);
            
            // Dispatch custom event for chatbot to listen
            window.dispatchEvent(new CustomEvent('alertMonitorToggle', {
              detail: { isExpanded: newExpandedState }
            }));
          }}
          className="p-1 hover:bg-surface-hover rounded transition-transform duration-200"
          title={isExpanded ? "Minimize" : "Expand"}
          style={{ transform: isExpanded ? 'rotate(0deg)' : 'rotate(180deg)' }}
        >
          <Icon name="ChevronDown" size={14} />
        </button>
      </div>

      <div id="alert-monitor-indicator" style={{ display: isExpanded ? 'block' : 'none' }}>
        {/* Monitoring status */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border-light">
          <div className="flex items-center gap-2">
            <Icon name="Activity" size={12} className="text-text-secondary" />
            <span className="text-text-secondary whitespace-nowrap">Backend checks</span>
          </div>
          <span className="text-xs text-green-600 dark:text-green-400 whitespace-nowrap ml-2">Every 10min</span>
        </div>

        {/* Sound toggle */}
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-border-light">
          <div className="flex items-center gap-2">
            <Icon name={soundEnabled ? 'Volume2' : 'VolumeX'} size={12} className="text-text-secondary" />
            <span className="text-text-secondary">Sound</span>
          </div>
          <button
            onClick={toggleSound}
            className={`px-2 py-0.5 rounded text-xs ${
              soundEnabled 
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {soundEnabled ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* Recent alerts count */}
        <div className="flex items-center justify-between">
          <span className="text-text-secondary">Recent alerts</span>
          <span className={`font-medium ${
            alerts.length > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-text-secondary'
          }`}>
            {alerts.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlertNotificationManager;
