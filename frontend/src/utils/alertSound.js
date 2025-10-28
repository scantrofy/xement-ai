/**
 * Alert Sound Utility
 * Plays beep sounds for different alert severities
 */

// Create audio context for generating beep sounds
let audioContext = null;

const initAudioContext = () => {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
};

/**
 * Play a beep sound with specified frequency and duration
 * @param {number} frequency - Frequency in Hz (higher = higher pitch)
 * @param {number} duration - Duration in milliseconds
 * @param {number} volume - Volume (0-1)
 */
const playBeep = (frequency = 800, duration = 200, volume = 0.3) => {
  try {
    const context = initAudioContext();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(volume, context.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + duration / 1000);

    oscillator.start(context.currentTime);
    oscillator.stop(context.currentTime + duration / 1000);
  } catch (error) {
    console.error('Error playing beep sound:', error);
  }
};

/**
 * Play alert sound based on severity
 * @param {string} severity - 'critical', 'warning', or 'info'
 */
export const playAlertSound = (severity = 'warning') => {
  switch (severity) {
    case 'critical':
      // Critical: Three urgent beeps (high pitch)
      playBeep(1000, 150, 0.4);
      setTimeout(() => playBeep(1000, 150, 0.4), 200);
      setTimeout(() => playBeep(1000, 150, 0.4), 400);
      break;
    
    case 'warning':
      // Warning: Two moderate beeps (medium pitch)
      playBeep(800, 200, 0.3);
      setTimeout(() => playBeep(800, 200, 0.3), 250);
      break;
    
    case 'info':
      // Info: Single gentle beep (lower pitch)
      playBeep(600, 150, 0.2);
      break;
    
    default:
      playBeep(800, 200, 0.3);
  }
};

/**
 * Request permission for notifications (for future use)
 */
export const requestNotificationPermission = async () => {
  if ('Notification' in window && Notification.permission === 'default') {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  return Notification.permission === 'granted';
};

/**
 * Show browser notification (if permission granted)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {string} severity - Alert severity
 */
export const showBrowserNotification = (title, body, severity = 'warning') => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const icon = severity === 'critical' ? '🚨' : severity === 'warning' ? '⚠️' : 'ℹ️';
    
    new Notification(title, {
      body: body,
      icon: '/favicon.ico', // Update with your app icon path
      badge: '/favicon.ico',
      tag: `alert-${Date.now()}`,
      requireInteraction: severity === 'critical', // Keep critical alerts visible
    });
  }
};

/**
 * Play alert sound and show notification
 * @param {object} alert - Alert object with severity and message
 */
export const notifyAlert = (alert) => {
  const { severity = 'warning', message = 'New alert detected', type = 'Anomaly' } = alert;
  
  // Play sound
  playAlertSound(severity);
  
  // Show browser notification
  showBrowserNotification(
    `${severity.toUpperCase()}: ${type}`,
    message,
    severity
  );
};

export default {
  playAlertSound,
  playBeep,
  requestNotificationPermission,
  showBrowserNotification,
  notifyAlert
};
